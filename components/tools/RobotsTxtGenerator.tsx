import React, { useState, useEffect, useMemo } from 'react';

interface RobotsTxtGeneratorProps {
    onNavigateHome: () => void;
}

const GuideSection = () => (
    <div className="bg-gray-900/50 p-6 rounded-lg border border-cyan-500/30 text-gray-300 space-y-8" dangerouslySetInnerHTML={{ __html: `
        <h3 class="!text-2xl !font-bold text-center !text-cyan-400 !mb-6 !pb-2 !border-b-2 !border-cyan-500/30" style="text-shadow: 0 0 8px rgba(34, 211, 238, 0.5);">دستور robots.txt: الدليل الكامل للسيطرة على محركات البحث</h3>
        
        <p>ملف robots.txt هو حارس البوابة لموقعك. إنه أول ملف تزوره عناكب البحث (مثل Googlebot) عند وصولها لموقعك، وهو الذي يمنحك القوة لتوجيهها إلى المحتوى الذي تريد أرشفته، ومنعها من إهدار الوقت والموارد على الصفحات غير المهمة.</p>

        <h4 class="!text-xl !font-semibold !text-purple-400 !flex !items-center !gap-3 !mt-8 !mb-4 !pb-2 !border-b !border-purple-500/20"><i class="fas fa-book-reader text-2xl w-8 text-center"></i><span>شرح الأوامر الأساسية:</span></h4>
        <ul class="!list-none !p-0 space-y-3">
            <li class="!py-2 !pl-4 !border-l-2 !border-cyan-500/30">
                <strong class="text-purple-300">User-agent:</strong> يحدد الروبوت (عنكبوت البحث) الذي تستهدفه القاعدة. الرمز <code>*</code> يعني "جميع الروبوتات".
            </li>
            <li class="!py-2 !pl-4 !border-l-2 !border-cyan-500/30">
                <strong class="text-purple-300">Disallow:</strong> يمنع الروبوت من الوصول إلى مسار معين. <code>Disallow: /admin/</code> يمنع الوصول إلى مجلد الإدارة.
            </li>
            <li class="!py-2 !pl-4 !border-l-2 !border-cyan-500/30">
                <strong class="text-purple-300">Allow:</strong> يسمح بالوصول إلى مسار معين حتى لو كان ضمن مسار محظور. مفيد للاستثناءات.
            </li>
            <li class="!py-2 !pl-4 !border-l-2 !border-cyan-500/30">
                <strong class="text-purple-300">Sitemap:</strong> يخبر محركات البحث بمكان خريطة موقعك (Sitemap)، مما يساعدها على اكتشاف جميع صفحاتك بسرعة.
            </li>
        </ul>

        <h4 class="!text-xl !font-semibold !text-purple-400 !flex !items-center !gap-3 !mt-8 !mb-4 !pb-2 !border-b !border-purple-500/20"><i class="fas fa-shield-alt text-2xl w-8 text-center"></i><span>دليل القوالب الاستراتيجية:</span></h4>
        <p>لقد أعددنا لك مجموعة من القوالب الجاهزة لتناسب كل مرحلة من مراحل حياة موقعك:</p>
        <ol class="!list-disc !marker:text-cyan-400 !pl-8 !mt-2 !space-y-2">
            <li><strong>السماح للجميع:</strong> مثالي للمواقع الجديدة. يفتح الأبواب على مصراعيها لجوجل لأرشفة كل شيء بسرعة.</li>
            <li><strong>حظر الجميع:</strong> ضروري للمواقع قيد التطوير. يضع لافتة "ممنوع الدخول" ليمنع أرشفة أي محتوى غير مكتمل.</li>
            <li><strong>ووردبريس المحصّن:</strong> يمنع إهدار "ميزانية الزحف" على صفحات لوحة التحكم وملفات النظام غير المفيدة للزوار.</li>
            <li><strong>بلوجر الذكي:</strong> يمنع أرشفة الروابط المكررة الناتجة عن البحث داخل المدونة، والتي تضر بترتيبك في جوجل.</li>
            <li><strong>المتاجر الإلكترونية:</strong> يحمي خصوصية المستخدمين بمنع أرشفة صفحات عربة التسوق والدفع والحسابات الشخصية.</li>
            <li><strong>درع الذكاء الاصطناعي:</strong> يمنع روبوتات جمع البيانات (مثل GPTBot) من "سرقة" محتواك لتدريب نماذجها اللغوية.</li>
        </ol>
        
        <h4 class="!text-xl !font-semibold !text-purple-400 !flex !items-center !gap-3 !mt-8 !mb-4 !pb-2 !border-b !border-purple-500/20"><i class="fas fa-check-circle text-2xl w-8 text-center"></i><span>عين حورس الفاحصة (Validator):</span></h4>
        <p>أثناء تعديلك للملف، تقوم هذه الأداة بمراقبته في الوقت الفعلي. ستنبهك فوراً لأي أخطاء قاتلة، مثل الخطأ الإملائي في أمر <code>Disallow</code> أو وجود الأمر الخطير <code>Disallow: /</code> الذي قد يمحو موقعك من جوجل.</p>

        <div class="p-4 bg-yellow-900/30 border-l-4 border-yellow-400 text-yellow-200 space-y-2 rounded-r-lg mt-6">
            <h5 class="font-bold flex items-center gap-2"><i class="fas fa-exclamation-triangle"></i> تحذير أمني وقانوني هام!</h5>
            <p class="text-sm">ملف robots.txt هو مجرد "طلب مهذب" للروبوتات المحترمة. الروبوتات الخبيثة ستتجاهله تماماً. لا تستخدمه لحماية معلومات حساسة. أيضاً، خطأ واحد في هذا الملف قد يؤدي إلى إزالة موقعك بالكامل من نتائج البحث. بعد إنشاء الملف، استخدم دائماً أداة اختبار robots.txt في Google Search Console للتحقق النهائي.</p>
        </div>
    `}} />
);

const ROBOTS_TEMPLATES = [
    {
        name: 'السماح للجميع (قياسي)',
        description: 'مثالي للمواقع الجديدة. يسمح لجميع محركات البحث بأرشفة كل محتوى الموقع دون قيود.',
        content: 'User-agent: *\nAllow: /\n\nSitemap: {{SITEMAP_URL}}'
    },
    {
        name: 'حظر الجميع (وضع الصيانة)',
        description: 'يمنع جميع محركات البحث من أرشفة الموقع. استخدمه فقط إذا كان الموقع قيد الإنشاء أو الصيانة.',
        content: 'User-agent: *\nDisallow: /'
    },
    {
        name: 'ووردبريس المحصّن',
        description: 'يمنع أرشفة لوحة التحكم وملفات النظام، مما يوفر ميزانية الزحف للمحتوى المهم.',
        content: 'User-agent: *\nDisallow: /wp-admin/\nAllow: /wp-admin/admin-ajax.php\n\nSitemap: {{SITEMAP_URL}}'
    },
    {
        name: 'بلوجر الذكي',
        description: 'يمنع أرشفة روابط البحث والتسميات المكررة، وهي مشكلة شائعة في بلوجر تضر بالـ SEO.',
        content: 'User-agent: *\nDisallow: /search\nDisallow: /?m=1\nDisallow: /?m=0\n\nSitemap: {{SITEMAP_URL}}'
    },
    {
        name: 'المتاجر الإلكترونية (WooCommerce)',
        description: 'يمنع أرشفة صفحات عربة التسوق، الدفع، وحسابات العملاء لحماية الخصوصية وتركيز الزحف.',
        content: 'User-agent: *\nDisallow: /cart/\nDisallow: /checkout/\nDisallow: /my-account/\nDisallow: /?add-to-cart=*\n\nSitemap: {{SITEMAP_URL}}'
    },
    {
        name: 'درع الذكاء الاصطناعي',
        description: 'يمنع بوتات جمع البيانات الشهيرة (مثل GPTBot, Google Extended) من استخدام محتواك لتدريب نماذج AI.',
        content: 'User-agent: GPTBot\nDisallow: /\n\nUser-agent: Google-Extended\nDisallow: /\n\nUser-agent: *\nAllow: /\n\nSitemap: {{SITEMAP_URL}}'
    }
];

type ValidationResult = {
    level: 'success' | 'warning' | 'error';
    message: string;
}[];


const RobotsTxtGenerator: React.FC<RobotsTxtGeneratorProps> = ({ onNavigateHome }) => {
    const [sitemapUrl, setSitemapUrl] = useState('');
    const [generatedContent, setGeneratedContent] = useState('');
    const [validationResults, setValidationResults] = useState<ValidationResult>([]);
    const [isGuideOpen, setIsGuideOpen] = useState(true);
    const [copied, setCopied] = useState(false);

    const handleTemplateSelect = (templateContent: string) => {
        const contentWithSitemap = templateContent.replace('{{SITEMAP_URL}}', sitemapUrl || 'https://example.com/sitemap.xml');
        setGeneratedContent(contentWithSitemap);
    };

    useEffect(() => {
        // Update content in real-time when sitemap URL changes
        if (generatedContent) {
            const lines = generatedContent.split('\n');
            const sitemapIndex = lines.findIndex(line => line.toLowerCase().startsWith('sitemap:'));
            if (sitemapIndex !== -1) {
                lines[sitemapIndex] = `Sitemap: ${sitemapUrl || 'https://example.com/sitemap.xml'}`;
                setGeneratedContent(lines.join('\n'));
            } else if (sitemapUrl) {
                setGeneratedContent(prev => `${prev}\n\nSitemap: ${sitemapUrl}`);
            }
        }
    }, [sitemapUrl]);

    useEffect(() => {
        // Real-time validation
        const results: ValidationResult = [];
        const lines = generatedContent.split('\n');

        if (!generatedContent.trim()) {
            setValidationResults([]);
            return;
        }

        // Check for catastrophic disallow
        if (lines.some(line => line.trim().toLowerCase() === 'disallow: /')) {
            results.push({ level: 'error', message: 'خطأ كارثي! القاعدة "Disallow: /" تمنع أرشفة موقعك بالكامل. قم بإزالتها فوراً إلا إذا كنت تقصد ذلك.' });
        }

        // Check for misspelled directives
        lines.forEach((line, i) => {
            if (line.match(/^\s*disalow:/i)) {
                results.push({ level: 'error', message: `خطأ إملائي في السطر ${i + 1}: يجب أن تكون "Disallow" وليس "Disalow".` });
            }
        });
        
        if (!lines.some(line => line.toLowerCase().includes('user-agent:'))) {
             results.push({ level: 'warning', message: 'تحذير: الملف لا يحتوي على أي توجيه "User-agent". يجب تحديد واحد على الأقل.' });
        }
        
        if (!lines.some(line => line.toLowerCase().startsWith('sitemap:'))) {
             results.push({ level: 'warning', message: 'تحذير: لم يتم تحديد ملف Sitemap. من المستحسن إضافته لمساعدة محركات البحث.' });
        }

        if(results.length === 0) {
            results.push({ level: 'success', message: 'الملف يبدو سليماً وفقاً للقواعد الأساسية.' });
        }

        setValidationResults(results);

    }, [generatedContent]);

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([generatedContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'robots.txt';
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
                    <i className="fas fa-file-code relative text-6xl text-cyan-500 dark:text-cyan-400 eye-animation"></i>
                </div>
                <h2 className="font-extrabold text-2xl text-gray-800 dark:text-gray-100 tracking-wider" style={{ textShadow: '0 0 15px rgba(34, 211, 238, 0.6)' }}>
                    مولّد ملف robots.txt الاستراتيجي
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
                        <h3 className="text-lg font-bold text-center text-cyan-400 mb-4">1. اختر القالب الاستراتيجي المناسب</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {ROBOTS_TEMPLATES.map(template => (
                                <div key={template.name} className="bg-gray-900/50 p-4 rounded-lg border border-purple-500/30 flex flex-col">
                                    <h4 className="font-semibold text-purple-300">{template.name}</h4>
                                    <p className="text-sm text-gray-400 flex-grow mt-2">{template.description}</p>
                                    <button onClick={() => handleTemplateSelect(template.content)} className="mt-4 w-full px-4 py-2 text-xs font-semibold rounded-md bg-purple-600 text-white hover:bg-purple-700">
                                        استخدام هذا القالب
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                     <div>
                        <h3 className="text-lg font-bold text-center text-cyan-400 mb-4">2. أدخل رابط خريطة الموقع (Sitemap)</h3>
                         <input 
                            type="url" 
                            value={sitemapUrl} 
                            onChange={e => setSitemapUrl(e.target.value)} 
                            placeholder="https://example.com/sitemap.xml"
                            className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-gray-200 text-center font-mono"
                            dir="ltr"
                         />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                             <h3 className="text-lg font-bold text-center text-cyan-400">3. محرر ملف robots.txt</h3>
                             <textarea 
                                value={generatedContent} 
                                onChange={e => setGeneratedContent(e.target.value)}
                                className="w-full h-80 bg-gray-900 border border-gray-600 rounded-md p-4 font-mono text-sm text-gray-200 resize-y"
                                dir="ltr"
                             />
                             <div className="flex gap-4">
                                <button onClick={handleCopy} className="flex-1 p-3 rounded-md bg-cyan-600 text-white hover:bg-cyan-700">{copied ? '✓ تم النسخ' : 'نسخ'}</button>
                                <button onClick={handleDownload} className="flex-1 p-3 rounded-md bg-green-600 text-white hover:bg-green-700">تحميل ملف .txt</button>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-center text-cyan-400">4. عين حورس الفاحصة (التحقق الفوري)</h3>
                             <div className="w-full h-80 bg-gray-900 border border-gray-600 rounded-md p-4 space-y-3 overflow-y-auto">
                                {validationResults.map((result, i) => (
                                    <div key={i} className={`p-3 rounded-md border-l-4 ${
                                        result.level === 'error' ? 'bg-red-900/30 border-red-500 text-red-200' :
                                        result.level === 'warning' ? 'bg-yellow-900/30 border-yellow-500 text-yellow-200' :
                                        'bg-green-900/30 border-green-500 text-green-200'
                                    }`}>
                                        <p className="font-semibold">{result.level === 'error' ? '❌ خطأ' : result.level === 'warning' ? '⚠️ تحذير' : '✅ سليم'}</p>
                                        <p className="text-sm">{result.message}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RobotsTxtGenerator;