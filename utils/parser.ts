import { ParsedArticle } from '../types';

function parseFromHtml(rawText: string): ParsedArticle | null {
    if (typeof document === 'undefined') return null;

    const doc = new DOMParser().parseFromString(rawText, 'text/html');
    const article: ParsedArticle = {
        title: '',
        imageUrl: '',
        text: '',
        sources: [],
    };

    // 1. Get Title from multiple potential sources
    const headlineMeta = doc.querySelector('meta[name="headline"]');
    const ogTitleMeta = doc.querySelector('meta[property="og:title"]');
    const h1 = doc.querySelector('h1');
    const h2 = doc.querySelector('h2');

    if (headlineMeta) article.title = (headlineMeta as HTMLMetaElement).content;
    else if (ogTitleMeta) article.title = (ogTitleMeta as HTMLMetaElement).content;
    else if (h1) article.title = h1.textContent || '';
    else if (h2) article.title = h2.textContent || '';
    
    // 2. Get Image URL from meta tags first, then from the body
    const ogImageMeta = doc.querySelector('meta[property="og:image"]');
    if (ogImageMeta) {
        article.imageUrl = (ogImageMeta as HTMLMetaElement).content;
    } else {
        const imgTag = doc.querySelector('img');
        if (imgTag) article.imageUrl = imgTag.src;
    }
    
    // 3. Get main text content, clean it, and remove source listings
    const contentElements = doc.querySelectorAll('p, div, li, h3, h4, article');
    let fullText = Array.from(contentElements)
        .map(el => {
            // Avoid extracting content from source list containers
            if (el.querySelector('ul') && el.textContent?.includes('المصادر')) return '';
            return el.textContent?.trim();
        })
        .filter(text => text && text.length > 20) // Filter out very short/irrelevant text
        .join('\n\n');
    
    // Remove duplicate paragraphs/sentences
    const uniqueLines = new Set(fullText.split('\n\n'));
    article.text = Array.from(uniqueLines).join('\n\n').trim();

    // 4. Get Sources
    const sourceLinks = doc.querySelectorAll('a[href]');
    sourceLinks.forEach(link => {
        const a = link as HTMLAnchorElement;
        const url = a.href;
        if (url && (url.startsWith('http://') || url.startsWith('https://')) && !url.includes(window.location.hostname)) {
            const title = a.textContent?.trim() || a.getAttribute('title') || new URL(url).hostname;
             if (title.length > 5 && !article.sources.some(s => s.url === url)) {
                article.sources.push({ title, url });
            }
        }
    });

    // Final checks
    if (!article.title && !article.text) return null;
    if (!article.text && article.title) article.text = article.title;
    if (!article.title && article.text) {
        article.title = article.text.split('\n')[0].substring(0, 70);
    }
    
    return article;
}


/**
 * A more robust check for the Perplexity format.
 * It now uses a case-insensitive regex to find the marker anywhere in the text,
 * not just at the beginning. This handles prepended text or accidental newlines.
 * @param rawText The text to check.
 * @returns True if the text is likely in Perplexity format.
 */
function isPerplexityFormat(rawText: string): boolean {
    return /ARTICLE\s*(\d*)\s*TITLE/i.test(rawText);
}

/**
 * A completely rebuilt, robust parser for the updated Perplexity protocol format.
 * This definitive version fixes the core issue of articles being merged by adopting a new, more reliable strategy:
 * 1.  It splits the ENTIRE input into "blocks" using the '***' separator.
 * 2.  It identifies, parses, and REMOVES the global "الاقتباسات" block from the list of blocks.
 * 3.  It then iterates through the remaining blocks, parsing each one as a self-contained article.
 * 4.  Finally, it distributes the global sources to all correctly parsed articles.
 * This prevents parsing errors caused by trying to separate content before splitting.
 * @param rawText The raw text input from the user.
 * @returns An array of ParsedArticle objects, with each object representing one article.
 */
function parsePerplexityInput(rawText: string): ParsedArticle[] {
    let globalSources: { title: string; url: string }[] = [];
    const citationsHeader = 'الاقتباسات:';

    // 1. Split the entire input into major blocks based on the '***' separator.
    const allChunks = rawText.split(/\s*\*{3,}\s*/).filter(chunk => chunk.trim());

    // 2. Find, parse, and remove the global citations block from the array of chunks.
    const citationsChunkIndex = allChunks.findIndex(chunk => chunk.trim().startsWith(citationsHeader));
    if (citationsChunkIndex !== -1) {
        const citationsChunk = allChunks[citationsChunkIndex];
        const citationsBlock = citationsChunk.substring(citationsHeader.length);

        const citationLines = citationsBlock.trim().split('\n');
        for (const line of citationLines) {
            const trimmedLine = line.trim();
            // Regex to capture [1] Title https://...
            const match = trimmedLine.match(/\[\d+\]\s*(.+?)\s+(https?:\/\/\S+)/);
            if (match) {
                const [, title, url] = match;
                const finalUrl = url.trim().replace(/[)\]]$/, ''); // Clean trailing chars
                if (url && !globalSources.some(s => s.url === finalUrl)) {
                    globalSources.push({ title: title.trim(), url: finalUrl });
                }
            }
        }
        // Remove the citations chunk so we're only left with article chunks.
        allChunks.splice(citationsChunkIndex, 1);
    }

    // 3. The remaining chunks should be articles. Filter them just in case.
    const articleChunks = allChunks.filter(chunk => /ARTICLE\s*(\d*)\s*TITLE/i.test(chunk.trim()));
    const articles: ParsedArticle[] = [];

    // 4. Parse each article chunk independently.
    for (const chunk of articleChunks) {
        const article: ParsedArticle = { title: '', imageUrl: '', text: '', sources: [] };
        
        const textHeaderRegex = /\s*\*{0,2}نص المقال الكامل من المصدر\s*\d*:\s*\*{0,2}/i;
        const sourcesHeaderRegex = /\s*\*{0,2}المصادر في الوقت الفعلي للمقال\s*\d*:\s*\*{0,2}/i;

        const textHeaderMatch = chunk.match(textHeaderRegex);
        const sourcesHeaderMatch = chunk.match(sourcesHeaderRegex);

        let firstHeaderIndex = Infinity;
        // FIX: Check for match and ensure index is a number (handles index 0 correctly).
        if (textHeaderMatch && typeof textHeaderMatch.index === 'number') {
            firstHeaderIndex = Math.min(firstHeaderIndex, textHeaderMatch.index);
        }
        if (sourcesHeaderMatch && typeof sourcesHeaderMatch.index === 'number') {
            firstHeaderIndex = Math.min(firstHeaderIndex, sourcesHeaderMatch.index);
        }
        
        const titleBlock = (firstHeaderIndex === Infinity) ? chunk : chunk.substring(0, firstHeaderIndex);
        article.title = titleBlock.replace(/\s*\*{0,2}ARTICLE\s*\d*\s*TITLE\s*:\s*\*{0,2}/i, '').trim();

        const contentBlock = (firstHeaderIndex === Infinity) ? '' : chunk.substring(firstHeaderIndex);
        
        let textPart = '';
        let sourcesPart = '';
        
        const textHeaderInContent = contentBlock.match(textHeaderRegex);
        const sourcesHeaderInContent = contentBlock.match(sourcesHeaderRegex);

        if (textHeaderInContent && textHeaderInContent.index !== undefined && sourcesHeaderInContent && sourcesHeaderInContent.index !== undefined) {
             if (textHeaderInContent.index < sourcesHeaderInContent.index) {
                textPart = contentBlock.substring(textHeaderInContent.index + textHeaderInContent[0].length, sourcesHeaderInContent.index);
                sourcesPart = contentBlock.substring(sourcesHeaderInContent.index + sourcesHeaderInContent[0].length);
            } else {
                sourcesPart = contentBlock.substring(sourcesHeaderInContent.index + sourcesHeaderInContent[0].length, textHeaderInContent.index);
                textPart = contentBlock.substring(textHeaderInContent.index + textHeaderInContent[0].length);
            }
        } else if (textHeaderInContent && textHeaderInContent.index !== undefined) {
            textPart = contentBlock.substring(textHeaderInContent.index + textHeaderInContent[0].length);
        } else if (sourcesHeaderInContent && sourcesHeaderInContent.index !== undefined) {
            sourcesPart = contentBlock.substring(sourcesHeaderInContent.index + sourcesHeaderInContent[0].length);
        }
        
        article.text = textPart.trim();

        if (sourcesPart) {
             const sourceLines = sourcesPart.trim().split('\n');
             for (const line of sourceLines) {
                let title, url;
                const trimmedLine = line.trim();

                // Match format: 1. **Title** - https://...
                let match = trimmedLine.match(/^\d+\.\s*(?:\*\*|\[)?(.*?)(?:\*\*|\])?\s*-\s*(https?:\/\/\S+)/);
                if (match) [, title, url] = match;

                // Match format: 1. [Title](https://...)
                if (!match) {
                    match = trimmedLine.match(/^\d+\.\s*\[(.*?)\]\((https?:\/\/\S+)\)/);
                    if (match) [, title, url] = match;
                }
                
                // Match format: 1. Title - https://... (without markdown)
                if (!match) {
                    match = trimmedLine.match(/^\d+\.\s+(.*?)\s+-\s+(https?:\/\/\S+)/);
                     if (match) [, title, url] = match;
                }


                if (title && url) {
                    const finalUrl = url.trim().replace(/[)\]]$/, '');
                    if (!article.sources.some(s => s.url === finalUrl)) {
                        article.sources.push({ title: title.trim(), url: finalUrl });
                    }
                }
             }
        }

        if (article.title || article.text) {
            articles.push(article);
        }
    }
    
    // 5. Distribute global sources to ALL correctly parsed articles.
    if (globalSources.length > 0 && articles.length > 0) {
        articles.forEach(article => {
            const articleUrls = new Set(article.sources.map(s => s.url));
            const sourcesToAdd = globalSources.filter(gs => !articleUrls.has(gs.url));
            article.sources.push(...sourcesToAdd);
        });
    }

    // If, after all this, no articles were found, return an empty array.
    // This avoids falling back to a parser that merges content.
    return articles;
}


export function parseRawInput(rawText: string): ParsedArticle[] {
  const trimmedText = rawText.trim();
  if (!trimmedText) {
    return [];
  }

  // Route to the correct parser based on format. The Perplexity parser is now robust enough.
  if (isPerplexityFormat(trimmedText)) {
      const perplexityArticles = parsePerplexityInput(trimmedText);
      // If the robust parser returns something, use it.
      if (perplexityArticles.length > 0) {
          return perplexityArticles;
      }
  }

  // Improved check for HTML content
  if (/<([a-z][a-z0-9]*)\b[^>]*>/i.test(trimmedText)) {
      const parsedHtmlArticle = parseFromHtml(trimmedText);
      if (parsedHtmlArticle) {
          return [parsedHtmlArticle];
      }
  }

  // Fallback for plain text that is not Perplexity format
  const article: ParsedArticle = {
    title: '',
    imageUrl: '',
    text: '',
    sources: [],
  };

  const lines = trimmedText.split('\n');
  let textContent: string[] = [];
  
  // Try to find a title
  const titleLineIndex = lines.findIndex(line => line.trim().length > 5 && !line.trim().startsWith('http'));
  if (titleLineIndex !== -1) {
      article.title = lines[titleLineIndex].trim().replace(/^#\s*/, '');
      textContent = lines.slice(titleLineIndex + 1);
  } else {
      textContent = lines;
  }
  
  // Extract URLs as sources and filter them out of the main text
  const remainingText: string[] = [];
  textContent.forEach(line => {
      const urlMatch = line.match(/(https?:\/\/\S+)/);
      if(urlMatch) {
          const url = urlMatch[0];
          const title = line.replace(url, '').trim() || new URL(url).hostname;
          if (!article.sources.some(s => s.url === url)) {
              article.sources.push({ title, url });
          }
      } else {
          remainingText.push(line);
      }
  });

  article.text = remainingText.join('\n').trim();
  
  if (!article.title && article.text) {
      article.title = article.text.substring(0, 70);
  } else if (!article.text && article.title) {
      article.text = article.title;
  }

  if (article.title || article.text || article.imageUrl) {
    return [article];
  }

  return [];
}


/**
 * Extracts a JSON string from a larger text block using multiple strategies.
 * This definitive version correctly balances nested braces and brackets to find the
 * first complete, parsable JSON object, ignoring surrounding text.
 * @param text The text which may contain a JSON object.
 * @returns The first valid, complete JSON string found, or null.
 */
export function extractJsonString(text: string): string | null {
    // Strategy 1: Look for JSON in a markdown block (most reliable).
    const markdownMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (markdownMatch && markdownMatch[1]) {
        const potentialJson = markdownMatch[1].trim();
        try {
            JSON.parse(potentialJson); // Validate it's actual JSON
            return potentialJson;
        } catch (e) {
            // Invalid JSON in markdown block, so we ignore it and proceed.
        }
    }

    // Strategy 2: Find the first '{' or '[' and scan for the matching end brace/bracket.
    let startIndex = -1;
    // Find the first occurrence of '{' or '[' that is likely the start of the main JSON object
    for (let i = 0; i < text.length; i++) {
        if (text[i] === '{' || text[i] === '[') {
            startIndex = i;
            break;
        }
    }

    if (startIndex === -1) {
        return null;
    }

    const startChar = text[startIndex];
    const endChar = startChar === '{' ? '}' : ']';
    let openCount = 0;
    let inString = false;

    // Scan through the string from the start index to find the matching end character
    for (let i = startIndex; i < text.length; i++) {
        const char = text[i];
        
        // Toggle inString state if we encounter a quote that isn't escaped
        if (char === '"' && (i === 0 || text[i-1] !== '\\')) {
            inString = !inString;
        }

        // Only count braces/brackets if we're not inside a string literal
        if (!inString) {
            if (char === startChar) {
                openCount++;
            } else if (char === endChar) {
                openCount--;
            }
        }

        // If openCount is 0, we've found a complete, balanced block
        if (openCount === 0) {
            const potentialJson = text.substring(startIndex, i + 1);
            try {
                // Final validation: can it be parsed?
                JSON.parse(potentialJson);
                // If parsing succeeds, we have found our valid JSON object.
                return potentialJson;
            } catch (e) {
                // This substring was a balanced block but not valid JSON (e.g., `[some text]`).
                // This indicates the AI response is likely not the JSON we want.
                // The safest action is to stop and let the fallback text parser take over.
                // Continuing to search risks finding a smaller, unrelated JSON object inside HTML.
                return null;
            }
        }
    }

    // If we reach the end of the string and openCount isn't 0, the JSON is malformed/incomplete.
    return null;
}