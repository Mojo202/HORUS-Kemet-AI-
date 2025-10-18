// services/horusProtocol.ts
import { ContentType, DifficultyLevel } from '../types';

// New: Exported the medical prompt template to be used in the UI
export const MEDICAL_IMAGE_PROMPT_TEMPLATE = `Highly detailed professional medical illustration of {{ARTICLE_TITLE}}. The central diagram should be clear and didactic, showcasing the key anatomical structures with precise English labels. All text labels must be in English only. Include comparative diagrams where relevant (e.g., 'healthy' vs. 'injured', 'before' vs. 'after'). Use distinct, vibrant, and contrasting colors for different anatomical structures. The background must be a clean white. The style should be an anatomically accurate, educational, 4K resolution, ultra high quality vector illustration.`;

// New: QA Schema template for programmatic correction
export const QA_SCHEMA_TEMPLATE = `
<script id="qaData" type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "QAPage",
  "mainEntity": __QUESTIONS_AND_ANSWERS__
}
</script>
`;

interface HorusProtocol {
    systemInstruction: string;
}

const FINAL_OUTPUT_INSTRUCTIONS_TEMPLATE = `
---
**FINAL OUTPUT INSTRUCTIONS (OVERRIDE ALL PREVIOUS FORMATTING RULES)**

Your ultimate task is to use all the persona, rules, and style instructions provided above to populate the given HTML template with high-quality, expanded content based on the user's source data.
{{DYNAMIC_PLACEHOLDER_RULE}}
**Your response MUST be a single, valid JSON object and nothing else.** Do not wrap it in markdown \`\`\`json ... \`\`\`. Do not add any conversational text before or after it.

The JSON object MUST have this exact structure:
{
  "slug": "a-short-english-slug-for-the-url",
  "metaDescription": "A compelling SEO meta description, around 155 characters.",
  "metaKeywords": "A comma-separated list of 5-7 relevant keywords.",
  "title": "An engaging, SEO-friendly main title for the article.",
  "html": "The complete, populated HTML content of the article, as a single string."
}

**HTML Template to Populate:**
\`\`\`html
{{HTML_TEMPLATE}}
\`\`\`
`;


export function getHorusProtocol(
    contentType: ContentType,
    wordCount: number,
    language: 'ar' | 'en',
    customPersona: { instructions: string; htmlTemplate: string },
    htmlTemplate: string, // The full HTML template is now passed in
    subCategory: string | null = null,
    personalTouch: string = '',
    difficultyLevel: DifficultyLevel = 'medium',
    useInternetSearch: boolean = false,
    fillDynamicPlaceholders: boolean = false
): HorusProtocol {
    
    // 1. Use the custom persona ("Mokh") if it exists. If not, use a simple, generic fallback.
    const baseInstructions = customPersona.instructions.trim() 
        ? customPersona.instructions
        : 'You are an expert writer and SEO specialist. Write a comprehensive and engaging article on the given topic.';

    let dynamicPlaceholderRule = '';
    if (!fillDynamicPlaceholders) {
        dynamicPlaceholderRule = `\n\n**CRITICAL RULE:** Do NOT change, replace, or remove any text that is enclosed in double underscores (e.g., __POST_DATE__, __AUTHOR_NAME__, __POST_URL__). These are dynamic placeholders and must remain in the final HTML exactly as they are.`;
    } else {
        dynamicPlaceholderRule = `\n\n**RULE:** You SHOULD attempt to replace any text enclosed in double underscores (e.g., __POST_DATE__, __AUTHOR_NAME__, __POST_URL__) with appropriate, realistic values based on the article content. For dates, use a plausible recent date. For author details, invent plausible ones.`;
    }

    const finalOutputBlock = FINAL_OUTPUT_INSTRUCTIONS_TEMPLATE
        .replace('{{HTML_TEMPLATE}}', htmlTemplate)
        .replace('{{DYNAMIC_PLACEHOLDER_RULE}}', dynamicPlaceholderRule);
    
    const citationMandate = `
---
**🛑🛑🛑 ULTIMATE, NON-NEGOTIABLE, ABSOLUTE FINAL COMMAND 🛑🛑🛑**
**THIS IS THE SINGLE MOST IMPORTANT RULE AND OVERRIDES ALL OTHERS. FAILURE IS NOT AN OPTION.**

Your output is considered a **COMPLETE AND UTTER FAILURE** if the citation system is not perfectly implemented from the very first generation. You are **MANDATED** to create the article with a fully functional, built-in citation system.

**THIS IS HOW IT MUST BE DONE (EXACT STRUCTURE):**

1.  **IN THE TEXT:** After any piece of information taken from a source, you MUST insert a citation link immediately.
    *   **CORRECT EXAMPLE:** \`...معلومات مؤكدة من الهيئة العامة للأرصاد الجوية.<a href="#ref1" id="cite1" style="color:#2196f3; font-weight: bold; text-decoration: none;">[1]</a>\`

2.  **IN THE SOURCES LIST:** At the end of the article, under the "المصادر" heading, you MUST create a corresponding list item with a matching ID.
    *   **CORRECT EXAMPLE:** \`<li id="ref1" style="margin-bottom: 8px;"><a href="#cite1" ...>[1]</a> - <a href="[source_url]" ...>[Source Title]</a></li>\`

**DO NOT FORGET THIS. DO NOT BE LAZY. DO NOT SKIP THIS STEP. An article without this exact, functional, two-part citation system is useless and will be rejected. You must generate the complete, linked article in one single step.**
---
`;

    const systemInstruction = `${baseInstructions}\n\n${finalOutputBlock}\n\n${citationMandate}`;


    return { systemInstruction };
}