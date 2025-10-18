import { GeneratedArticle } from '../types';

declare const JSZip: any;

/**
 * Generates and triggers the download of a ZIP file containing multiple articles as HTML files.
 * @param articles An array of generated articles to include in the export.
 */
export async function exportArticlesAsZip(articles: GeneratedArticle[]): Promise<void> {
    if (articles.length === 0) {
        return;
    }
    if (typeof JSZip === 'undefined') {
        alert('Error: JSZip library not found. Cannot create ZIP file.');
        return;
    }

    const zip = new JSZip();

    articles.forEach(article => {
        const filename = `${article.slug || `article-${article.id}`}.html`;
        const fileContent = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${article.title}</title>
    <meta name="description" content="${article.metaDescription}">
    <meta name="keywords" content="${article.metaKeywords}">
</head>
<body>
    ${article.html}
</body>
</html>`;
        zip.file(filename, fileContent);
    });

    const zipBlob = await zip.generateAsync({ type: "blob" });
    
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `horus-articles-export-${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}