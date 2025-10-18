import { GeneratedArticle } from '../types';

/**
 * Extracts the first image URL from an HTML string using DOMParser for accuracy.
 * @param html The HTML content of the article.
 * @returns The src of the first <img> tag, or an empty string if not found.
 */
function extractImageUrlFromHtml(html: string): string {
    if (!html || typeof document === 'undefined') return '';
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const img = doc.querySelector('img');
        return img ? img.src : '';
    } catch (e) {
        // Fallback for simple cases if parser fails
        const match = html.match(/<img[^>]+src="([^">]+)"/);
        return match ? match[1] : '';
    }
}

/**
 * Parses a TXT file's content into a basic GeneratedArticle.
 * This function is for plain text with no inherent structure.
 * @param txtText The raw text content.
 * @param fileIndex An index to ensure a unique ID.
 * @returns A GeneratedArticle object.
 */
export function parseTxtForEditor(txtText: string, fileIndex: number = 0): GeneratedArticle {
    const lines = txtText.split('\n').filter(line => line.trim() !== '');
    const title = lines[0]?.trim() || 'مقال بدون عنوان';
    const body = lines.length > 1 ? lines.slice(1).join('\n') : title;
    // Convert plain text paragraphs to HTML divs, separated by <br /> for line breaks
    const html = body.split(/\n\s*\n/).map(p => `<div style="text-align: right;">${p.trim()}</div>`).join('<br />');
    const slug = title.toLowerCase().replace(/[\s\W_]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 50);

    return {
        id: Date.now() + fileIndex,
        html: html,
        title: title,
        imageUrl: '', // Plain text has no images
        metaDescription: body.substring(0, 160).replace(/\s+/g, ' ').trim(),
        metaKeywords: '',
        slug: slug || `article-${Date.now() + fileIndex}`,
        rating: 0,
        isFavorite: false,
    };
}


/**
 * Parses an HTML file's content into a GeneratedArticle, preserving the body content.
 * @param htmlText The raw HTML string.
 * @param fileIndex An index for unique ID generation.
 * @returns A GeneratedArticle object.
 */
export function parseHtmlForEditor(htmlText: string, fileIndex: number = 0): GeneratedArticle {
    if (typeof document === 'undefined') {
        throw new Error("DOMParser is not available in this environment.");
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, "text/html");
    
    const title = doc.querySelector('title')?.textContent || doc.querySelector('h1')?.textContent || 'مقال بدون عنوان';
    const metaDescription = (doc.querySelector('meta[name="description"]') as HTMLMetaElement)?.content || '';
    const metaKeywords = (doc.querySelector('meta[name="keywords"]') as HTMLMetaElement)?.content || '';
    const imageUrl = (doc.querySelector('img') as HTMLImageElement)?.src || '';
    // Use the full body content, preserving all tags including scripts for schemas.
    const html = doc.body.innerHTML || htmlText;
    const slug = title.toLowerCase().replace(/[\s\W_]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 50);

    return {
        id: Date.now() + fileIndex,
        html: html,
        title: title,
        imageUrl: imageUrl,
        metaDescription: metaDescription,
        metaKeywords: metaKeywords,
        slug: slug || `article-${Date.now() + fileIndex}`,
        rating: 0,
        isFavorite: false,
    };
}


/**
 * Parses a Blogger export XML string into GeneratedArticle format, preserving the full HTML content.
 * @param xmlText The raw XML string from a Blogger export file.
 * @returns An array of GeneratedArticle objects.
 */
export function parseBloggerXml(xmlText: string): GeneratedArticle[] {
    if (typeof document === 'undefined') {
        throw new Error("DOMParser is not available in this environment.");
    }

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "application/xml");
    const errorNode = xmlDoc.querySelector("parsererror");
    if (errorNode) {
        throw new Error(`خطأ في تحليل XML: ${errorNode.textContent}`);
    }

    const entries = xmlDoc.querySelectorAll("entry");
    const articles: GeneratedArticle[] = [];

    entries.forEach((entry, index) => {
        const getElementText = (selector: string): string => {
            const el = entry.querySelector(selector.replace(/\\:/g, ':'));
            return el?.textContent || '';
        };

        const kindAttr = Array.from(entry.querySelectorAll('category')).find(el => el.getAttribute('scheme')?.includes('#kind'))?.getAttribute('term');
        if (!kindAttr || !kindAttr.endsWith('#post')) {
            return; // Skip non-post entries (e.g., settings, comments)
        }
        
        // This is the full HTML content, including images, schemas, etc.
        const htmlContent = getElementText("content");
        if (!htmlContent.trim()) return;

        const title = getElementText("title");
        const metaDescription = getElementText("blogger\\:metaDescription");
        const keywords = Array.from(entry.querySelectorAll("category[scheme='http://www.blogger.com/atom/ns#']"))
            .map(cat => cat.getAttribute('term'))
            .filter(Boolean)
            .join(', ');
        const slug = getElementText("blogger\\:filename")
            .split('/').pop()?.replace('.html', '') || `article-${Date.now() + index}`;

        articles.push({
            id: Date.now() + index,
            html: htmlContent, // Preserve the full HTML content
            title: title || 'مقال بدون عنوان',
            imageUrl: extractImageUrlFromHtml(htmlContent), // Extract for the previewer
            metaDescription: metaDescription,
            metaKeywords: keywords,
            slug: slug,
            rating: 0,
            isFavorite: false,
        });
    });
    
    if (articles.length === 0 && entries.length > 0) {
        throw new Error("تم تحليل الملف، ولكن لم يتم العثور على أي مقالات صالحة (entries of type 'post'). قد يكون الملف مخصصًا للإعدادات أو القالب.");
    }
    if (articles.length === 0) {
         throw new Error("لم يتم العثور على أي مقالات في ملف XML المقدم.");
    }

    return articles;
}
