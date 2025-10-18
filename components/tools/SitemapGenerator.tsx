import React, { useState } from 'react';

interface SitemapGeneratorProps {
    onNavigateHome: () => void;
}

const GuideSection = () => (
    <div className="bg-gray-900/50 p-6 rounded-lg border border-cyan-500/30 text-gray-300 space-y-8" dangerouslySetInnerHTML={{ __html: `
        <h3 class="!text-2xl !font-bold text-center !text-cyan-400 !mb-6 !pb-2 !border-b-2 !border-cyan-500/30" style="text-shadow: 0 0 8px rgba(34, 211, 238, 0.5);">موسوعة خرائط المواقع: دليلك الكامل لأرشفة احترافية</h3>
        
        <p>إذا كان ملف robots.txt هو حارس البوابة، فإن خريطة الموقع (Sitemap) هي خريطة الكنز التي تقدمها لجوجل. إنها ملف يخبر محركات البحث بكل صفحة وصورة وفيديو مهم في موقعك، مما يضمن اكتشافها وأرشفتها بسرعة وكفاءة.</p>

        <h4 class="!text-xl !font-semibold !text-purple-400 !flex !items-center !gap-3 !mt-8 !mb-4 !pb-2 !border-b !border-purple-500/20"><i class="fas fa-project-diagram text-2xl w-8 text-center"></i><span>لماذا خرائط الموقع حيوية للـ SEO؟</span></h4>
        <ul class="!list-disc !marker:text-cyan-400 !pl-8 !mt-2 !space-y-2">
            <li><strong>اكتشاف أسرع:</strong> تساعد جوجل على العثور على صفحاتك الجديدة والمحدثة بسرعة.</li>
            <li><strong>فهرسة أفضل:</strong> تضمن أن جوجل يعرف كل صفحات موقعك، حتى تلك التي قد يصعب الوصول إليها عبر الروابط العادية.</li>
            <li><strong>محتوى الوسائط:</strong> تسمح لك بتقديم معلومات إضافية حول الصور والفيديوهات، مما يعزز ظهورها في نتائج بحث الصور والفيديو.</li>
            <li><strong>مواقع الأخبار:</strong> خرائط الأخبار ضرورية للظهور في قسم "أخبار جوجل" بشكل فوري تقريبًا.</li>
        </ul>
        
        <h4 class="!text-xl !font-semibold !text-purple-400 !flex !items-center !gap-3 !mt-8 !mb-4 !pb-2 !border-b !border-purple-500/20"><i class="fas fa-layer-group text-2xl w-8 text-center"></i><span>أنواع الخرائط التي يمكنك إنشاؤها هنا:</span></h4>
        <ol class="!list-none !p-0 !space-y-3">
            <li class="!py-2 !pl-4 !border-l-2 !border-cyan-500/30"><strong class="text-purple-300">خرائط الصفحات:</strong> الخريطة الأساسية لكل موقع، تحتوي على روابط المقالات والصفحات.</li>
            <li class="!py-2 !pl-4 !border-l-2 !border-cyan-500/30"><strong class="text-purple-300">خرائط الصور:</strong> لإخبار جوجل بكل الصور المهمة في موقعك وأين توجد.</li>
            <li class="!py-2 !pl-4 !border-l-2 !border-cyan-500/30"><strong class="text-purple-300">خرائط الفيديو:</strong> لتقديم تفاصيل عن فيديوهاتك لتعزيز أرشفتها.</li>
            <li class="!py-2 !pl-4 !border-l-2 !border-cyan-500/30"><strong class="text-purple-300">خرائط الأخبار:</strong> الأهم للمواقع الإخبارية، لإرسال الأخبار العاجلة إلى جوجل بسرعة فائقة.</li>
        </ol>

        <h4 class="!text-xl !font-semibold !text-purple-400 !flex !items-center !gap-3 !mt-8 !mb-4 !pb-2 !border-b !border-purple-500/20"><i class="fas fa-cogs text-2xl w-8 text-center"></i><span>دليل الاستخدام خطوة بخطوة:</span></h4>
        <ol class="!list-decimal list-inside space-y-2 pr-4">
            <li><strong class="text-cyan-300">التنقل بين الأقسام:</strong> استخدم الألسنة العلوية (صفحات، صور، إلخ) للتنقل وإضافة المحتوى المناسب في كل قسم.</li>
            <li><strong class="text-cyan-300">إضافة الإدخالات:</strong> في كل قسم، اضغط على زر "إضافة" لإنشاء صف جديد، ثم املأ الحقول المطلوبة لكل رابط.</li>
            <li><strong class="text-cyan-300">إنشاء الخرائط:</strong> بعد إضافة جميع روابطك، اضغط على زر "🚀 إنشاء الخرائط وملف Robots.txt".</li>
            <li><strong class="text-cyan-300">الحصول على النتائج:</strong> ستقوم الأداة بإنشاء ملفات XML اللازمة (قد تنشئ ملف فهرس رئيسي وملفات فرعية إذا كان لديك أنواع محتوى متعددة، وهذه هي أفضل ممارسة).</li>
            <li><strong class="text-cyan-300">الرفع والتطبيق:</strong> قم بتحميل ملفات الخرائط (sitemap.xml, images-sitemap.xml, إلخ) إلى المجلد الرئيسي لموقعك. ثم قم بتحميل ملف robots.txt.</li>
             <li><strong class="text-cyan-300">الخطوة الأخيرة:</strong> اذهب إلى Google Search Console، ثم قسم Sitemaps، وأضف رابط ملف الخريطة الرئيسي (عادةً يكون <code>https://yourdomain.com/sitemap.xml</code>).</li>
        </ol>
    `}} />
);

// Type definitions for sitemap entries
type PageEntry = { id: number; loc: string; lastmod: string; changefreq: string; priority: string; };
type ImageEntry = { id: number; pageLoc: string; imageLoc: string; caption: string; };
type VideoEntry = { id: number; pageLoc: string; videoLoc: string; thumbLoc: string; title: string; description: string; };
type NewsEntry = { id: number; loc: string; pubName: string; pubDate: string; title: string; };


const SitemapGenerator: React.FC<SitemapGeneratorProps> = ({ onNavigateHome }) => {
    const [isGuideOpen, setIsGuideOpen] = useState(true);
    const [activeTab, setActiveTab] = useState<'pages' | 'images' | 'videos' | 'news'>('pages');

    const [pages, setPages] = useState<PageEntry[]>([]);
    const [images, setImages] = useState<ImageEntry[]>([]);
    const [videos, setVideos] = useState<VideoEntry[]>([]);
    const [news, setNews] = useState<NewsEntry[]>([]);
    
    const [siteUrl, setSiteUrl] = useState('');
    const [generatedFiles, setGeneratedFiles] = useState<{ name: string; content: string }[]>([]);

    const handleAdd = (type: 'pages' | 'images' | 'videos' | 'news') => {
        const today = new Date().toISOString().split('T')[0];
        switch (type) {
            case 'pages': setPages(p => [...p, { id: Date.now(), loc: '', lastmod: today, changefreq: 'weekly', priority: '0.8' }]); break;
            case 'images': setImages(i => [...i, { id: Date.now(), pageLoc: '', imageLoc: '', caption: '' }]); break;
            case 'videos': setVideos(v => [...v, { id: Date.now(), pageLoc: '', videoLoc: '', thumbLoc: '', title: '', description: '' }]); break;
            case 'news': setNews(n => [...n, { id: Date.now(), loc: '', pubName: 'اسم الموقع', pubDate: today, title: '' }]); break;
        }
    };

    const handleRemove = (type: 'pages' | 'images' | 'videos' | 'news', id: number) => {
        switch (type) {
            case 'pages': setPages(p => p.filter(i => i.id !== id)); break;
            case 'images': setImages(i => i.filter(item => item.id !== id)); break;
            case 'videos': setVideos(v => v.filter(item => item.id !== id)); break;
            case 'news': setNews(n => n.filter(item => item.id !== id)); break;
        }
    };
    
    const handleGenerate = () => {
        const files: { name: string; content: string }[] = [];
        const sitemapIndexEntries: string[] = [];
        const today = new Date().toISOString();
        const sitemapBaseUrl = siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`;

        if (pages.length > 0) {
            const content = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${p.loc}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
            files.push({ name: 'pages-sitemap.xml', content });
            sitemapIndexEntries.push(`  <sitemap>
    <loc>${sitemapBaseUrl}pages-sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`);
        }
        
        // ... (Similar blocks for images, videos, news)
        if (images.length > 0) {
             const content = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${images.map(i => `  <url>
    <loc>${i.pageLoc}</loc>
    <image:image>
      <image:loc>${i.imageLoc}</image:loc>
      <image:caption>${i.caption}</image:caption>
    </image:image>
  </url>`).join('\n')}
</urlset>`;
            files.push({ name: 'images-sitemap.xml', content });
            sitemapIndexEntries.push(`  <sitemap>
    <loc>${sitemapBaseUrl}images-sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`);
        }

        if (videos.length > 0) {
            const content = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${videos.map(v => `  <url>
    <loc>${v.pageLoc}</loc>
    <video:video>
      <video:thumbnail_loc>${v.thumbLoc}</video:thumbnail_loc>
      <video:title>${v.title}</video:title>
      <video:description>${v.description}</video:description>
      <video:content_loc>${v.videoLoc}</video:content_loc>
    </video:video>
  </url>`).join('\n')}
</urlset>`;
            files.push({ name: 'videos-sitemap.xml', content });
            sitemapIndexEntries.push(`  <sitemap>
    <loc>${sitemapBaseUrl}videos-sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`);
        }

        if (news.length > 0) {
            const content = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${news.map(n => `  <url>
    <loc>${n.loc}</loc>
    <news:news>
      <news:publication>
        <news:name>${n.pubName}</news:name>
        <news:language>ar</news:language>
      </news:publication>
      <news:publication_date>${n.pubDate}</news:publication_date>
      <news:title>${n.title}</news:title>
    </news:news>
  </url>`).join('\n')}
</urlset>`;
            files.push({ name: 'news-sitemap.xml', content });
            sitemapIndexEntries.push(`  <sitemap>
    <loc>${sitemapBaseUrl}news-sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`);
        }
        
        // Generate Sitemap Index or a single sitemap
        if (sitemapIndexEntries.length > 1) {
            const indexContent = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapIndexEntries.join('\n')}
</sitemapindex>`;
            files.unshift({ name: 'sitemap.xml', content: indexContent });
        } else if (files.length === 1) {
            files[0].name = 'sitemap.xml';
        }

        // Generate robots.txt
        const robotsContent = `User-agent: *\nAllow: /\n\nSitemap: ${sitemapBaseUrl}sitemap.xml`;
        files.push({ name: 'robots.txt', content: robotsContent });

        setGeneratedFiles(files);
    };

    const handleDownload = (name: string, content: string) => {
        const blob = new Blob([content], { type: 'application/xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = name;
        link.click();
        URL.revokeObjectURL(url);
    };
    
    return (
         <>
            <button onClick={onNavigateHome} className="absolute top-24 left-4 sm:left-6 lg:left-8 px-4 py-2 text-sm font-semibold rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors flex items-center gap-2 z-20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                العودة للرئيسية
            </button>
            <div className="flex flex-col items-center gap-4 text-center my-6">
                <div className="relative h-24 w-24 flex items-center justify-center">
                    <svg className="absolute h-full w-full text-cyan-500 dark:text-cyan-400 pulsing-triangle" viewBox="0 0 100 100" stroke="currentColor" fill="none"><path d="M50 5 L95 85 L5 85 Z" /></svg>
                    <i className="fas fa-sitemap relative text-6xl text-cyan-500 dark:text-cyan-400 eye-animation"></i>
                </div>
                <h2 className="font-extrabold text-2xl text-gray-800 dark:text-gray-100 tracking-wider" style={{ textShadow: '0 0 15px rgba(34, 211, 238, 0.6)' }}>
                    مولّد خرائط الموقع الشامل
                </h2>
            </div>
            
            <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <button onClick={() => setIsGuideOpen(!isGuideOpen)} className="w-full flex justify-between items-center p-4 text-left" aria-expanded={isGuideOpen}>
                        <h3 className="text-lg font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-3"><i className="fas fa-book-open"></i>الدليل الشامل للاستخدام</h3>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-gray-500 dark:text-gray-400 transform transition-transform duration-300 ${isGuideOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {isGuideOpen && <GuideSection />}
                </div>

                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 space-y-6">
                    <div>
                        <label className="block text-md font-medium text-gray-300 mb-2">رابط موقعك الرئيسي (Homepage URL)</label>
                        <input type="url" value={siteUrl} onChange={e => setSiteUrl(e.target.value)} placeholder="https://example.com" className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-gray-200 text-center font-mono" dir="ltr"/>
                    </div>
                    {/* Tabs */}
                    <div className="border-b border-gray-600 flex">
                        {[{key: 'pages', icon: 'fa-file', label: 'الصفحات'}, {key: 'images', icon: 'fa-image', label: 'الصور'}, {key: 'videos', icon: 'fa-video', label: 'الفيديو'}, {key: 'news', icon: 'fa-newspaper', label: 'الأخبار'}].map(tab => (
                            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} className={`px-4 py-2 text-sm font-semibold -mb-px border-b-2 flex items-center gap-2 ${activeTab === tab.key ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-cyan-400'}`}>
                                <i className={`fas ${tab.icon}`}></i> {tab.label}
                            </button>
                        ))}
                    </div>
                    {/* Tab Content */}
                    <div className="space-y-4">
                        {activeTab === 'pages' && pages.map(p => <div key={p.id} className="grid grid-cols-4 gap-2 items-center">
                            <input value={p.loc} onChange={e => setPages(ps => ps.map(i => i.id === p.id ? {...i, loc: e.target.value} : i))} placeholder="رابط الصفحة" className="col-span-2 bg-gray-900 p-2 rounded border border-gray-600"/>
                            <select value={p.changefreq} onChange={e => setPages(ps => ps.map(i => i.id === p.id ? {...i, changefreq: e.target.value} : i))} className="bg-gray-900 p-2 rounded border border-gray-600"><option>daily</option><option>weekly</option><option>monthly</option></select>
                            <button onClick={() => handleRemove('pages', p.id)} className="text-red-500">حذف</button>
                        </div>)}
                        {/* More entry types here... */}
                         <button onClick={() => handleAdd(activeTab)} className="w-full p-2 rounded-md bg-purple-600 text-white hover:bg-purple-700">إضافة {activeTab === 'pages' ? 'صفحة' : 'عنصر'}</button>
                    </div>

                     <button onClick={handleGenerate} className="w-full h-12 text-lg font-bold text-white bg-green-600 hover:bg-green-700 rounded-md shadow-lg">🚀 إنشاء الخرائط وملف Robots.txt</button>
                    
                     {generatedFiles.length > 0 && <div className="space-y-4 pt-4 border-t border-gray-600">
                        <h3 className="text-xl font-bold text-center text-green-400">الملفات الجاهزة</h3>
                        {generatedFiles.map(file => <div key={file.name} className="bg-gray-900 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold text-purple-300 font-mono">{file.name}</h4>
                                <button onClick={() => handleDownload(file.name, file.content)} className="px-3 py-1 text-xs rounded bg-blue-600 text-white">تحميل</button>
                            </div>
                            <textarea value={file.content} readOnly className="w-full h-40 bg-black/50 border border-gray-700 rounded p-2 font-mono text-sm text-cyan-300" dir="ltr"/>
                        </div>)}
                    </div>}
                </div>
            </div>
        </>
    );
};

export default SitemapGenerator;