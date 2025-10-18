import { GeneratedArticle } from '../types';

/**
 * Escapes special XML characters in a string.
 * @param unsafe The string to escape.
 * @returns The escaped string.
 */
function escapeXml(unsafe: string): string {
    if (typeof unsafe !== 'string') {
        return '';
    }
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

/**
 * Generates and triggers the download of a Blogger-compatible XML file.
 * This version is updated to more closely match the native Blogger export format
 * to ensure successful imports.
 * @param articles An array of generated articles to include in the export.
 */
export function exportToBloggerXml(articles: GeneratedArticle[]): void {
    if (articles.length === 0) {
        return;
    }

    const now = new Date();
    const nowISO = now.toISOString();
    // Use a generic placeholder ID. Blogger will assign its own upon import.
    const blogId = '1234567890123456789'; 

    const entries = articles.map((article) => {
        const postId = `${article.id}-${Date.now()}`; // Create a unique post ID
        const keywords = article.metaKeywords.split(',').map(k => k.trim()).filter(Boolean);

        // Blogger uses Atom <category> tags as labels for posts
        const categoryTags = keywords.map(keyword => 
            `<category scheme='http://www.blogger.com/atom/ns#' term='${escapeXml(keyword)}'/>`
        ).join('\n    ');

        // Construct a filename similar to Blogger's structure.
        const filename = `/${now.getFullYear()}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${article.slug}.html`;

        return `
  <entry>
    <id>tag:blogger.com,1999:blog-${blogId}.post-${postId}</id>
    <blogger:type>POST</blogger:type>
    <blogger:status>DRAFT</blogger:status>
    <author>
      <name>Horus Generation Tool</name>
    </author>
    <title type='text'>${escapeXml(article.title)}</title>
    <content type='html'><![CDATA[${article.html}]]></content>
    <blogger:metaDescription>${escapeXml(article.metaDescription)}</blogger:metaDescription>
    <blogger:created>${nowISO}</blogger:created>
    <published>${nowISO}</published>
    <updated>${nowISO}</updated>
    ${categoryTags}
    <blogger:filename>${filename}</blogger:filename>
  </entry>
`;
    }).join('');

    const xmlContent = `<?xml version='1.0' encoding='UTF-8'?>
<feed xmlns='http://www.w3.org/2005/Atom' xmlns:blogger='http://schemas.google.com/blogger/2018'>
  <id>tag:blogger.com,1999:blog-${blogId}</id>
  <updated>${nowISO}</updated>
  <title type='text'>Horus Tool Blogger Export</title>
  <link rel='alternate' type='text/html' href=''/>
  <author>
    <name>Horus Generation Tool</name>
  </author>
  ${entries}
</feed>
`;

    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `horus-blogger-export-${new Date().toISOString().split('T')[0]}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
