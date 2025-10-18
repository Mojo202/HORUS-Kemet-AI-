import React, { useState, useEffect, useRef } from 'react';
import { fileToText } from '../../utils/file';

interface CodeEditorProps {
    onNavigateHome: () => void;
}

const GuideSection = () => (
    <div className="bg-gray-900/50 p-6 rounded-lg border border-cyan-500/30 text-gray-300 space-y-8" dangerouslySetInnerHTML={{ __html: `
        <h3 class="!text-2xl !font-bold text-center !text-cyan-400 !mb-6 !pb-2 !border-b-2 !border-cyan-500/30" style="text-shadow: 0 0 8px rgba(34, 211, 238, 0.5);">دليل محرر الأكواد الاحترافي: مختبرك الإبداعي</h3>
        
        <p>مرحباً بك في مختبر الأكواد. هذه الأداة هي ملعبك الخاص لتجربة وتصميم وتعديل أي كود ويب (HTML, CSS, JavaScript) ورؤية النتائج في نفس اللحظة. إنها مثالية لتجربة تعديلات على القوالب، أو تصميم مكونات جديدة، أو حتى تعلم البرمجة بشكل تفاعلي.</p>

        <h4 class="!text-xl !font-semibold !text-purple-400 !flex !items-center !gap-3 !mt-8 !mb-4 !pb-2 !border-b !border-purple-500/20"><i class="fas fa-magic text-2xl w-8 text-center"></i><span>القوة في بساطتها:</span></h4>
        <ul class="!list-none !p-0 space-y-3">
            <li class="!py-2 !pl-4 !border-l-2 !border-cyan-500/30">
                <strong class="text-purple-300">معاينة حية فورية:</strong> أي تغيير تقوم به في نوافذ الكود يظهر تأثيره مباشرة في نافذة المعاينة. لا حاجة للحفظ أو إعادة تحميل الصفحة.
            </li>
            <li class="!py-2 !pl-4 !border-l-2 !border-cyan-500/30">
                <strong class="text-purple-300">تنظيم احترافي:</strong> فصل الأكواد إلى ثلاث نوافذ مستقلة (HTML لهيكل الصفحة، CSS لتصميمها، و JavaScript لوظائفها) يعكس أفضل الممارسات في تطوير الويب ويجعل الكود منظماً وسهل الصيانة.
            </li>
            <li class="!py-2 !pl-4 !border-l-2 !border-cyan-500/30">
                <strong class="text-purple-300">أدوات مساعدة قوية:</strong> أضفنا لك أزراراً لتسريع عملك: لصق الكود، نسخ النتيجة، مسح كل شيء للبدء من جديد، وحتى تحميل وتنزيل الملفات.
            </li>
        </ul>

        <h4 class="!text-xl !font-semibold !text-purple-400 !flex !items-center !gap-3 !mt-8 !mb-4 !pb-2 !border-b !border-purple-500/20"><i class="fas fa-cogs text-2xl w-8 text-center"></i><span>كيفية الاستخدام:</span></h4>
        <ol class="!list-decimal list-inside space-y-2 pr-4">
            <li><strong class="text-cyan-300">كتابة الكود:</strong> استخدم الألسنة العلوية للتنقل بين HTML, CSS, JavaScript واكتب الكود الخاص بك في كل قسم.</li>
            <li><strong class="text-cyan-300">المشاهدة الفورية:</strong> شاهد كيف يتغير التصميم والتفاعل في نافذة "المعاينة الحية" مع كل تعديل.</li>
            <li><strong class="text-cyan-300">حفظ العمل:</strong> عندما تصل إلى النتيجة المرجوة، يمكنك استخدام زر "تنزيل" لحفظ عملك كملف HTML واحد متكامل.</li>
            <li><strong class="text-cyan-300">تحميل عمل سابق:</strong> استخدم زر "رفع" لتحميل ملف HTML وبدء التعديل عليه مباشرة.</li>
        </ol>
    `}} />
);

const CodeEditor: React.FC<CodeEditorProps> = ({ onNavigateHome }) => {
    const [html, setHtml] = useState('');
    const [css, setCss] = useState('');
    const [js, setJs] = useState('');
    const [srcDoc, setSrcDoc] = useState('');
    const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html');
    const [isGuideOpen, setIsGuideOpen] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        const timeout = setTimeout(() => {
            setSrcDoc(`
                <html>
                    <body>${html}</body>
                    <style>${css}</style>
                    <script>${js}</script>
                </html>
            `);
        }, 300);
        return () => clearTimeout(timeout);
    }, [html, css, js]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            try {
                const text = await fileToText(event.target.files[0]);
                const doc = new DOMParser().parseFromString(text, 'text/html');
                setHtml(doc.body.innerHTML);
                setCss(Array.from(doc.head.querySelectorAll('style')).map(s => s.textContent).join('\n'));
                setJs(Array.from(doc.body.querySelectorAll('script')).map(s => s.textContent).join('\n'));
            } catch (error) {
                alert("فشل في قراءة وتحليل الملف.");
            }
        }
    };
    
    const handleDownload = () => {
        const content = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>${css}</style>
</head>
<body>${html}
<script>${js}</script>
</body>
</html>`;
        const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'horus-code-editor-export.html';
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleClearAll = () => {
        setHtml('');
        setCss('');
        setJs('');
    };

    const handlePaste = async () => {
        const text = await navigator.clipboard.readText();
        if (activeTab === 'html') setHtml(text);
        if (activeTab === 'css') setCss(text);
        if (activeTab === 'js') setJs(text);
    };
    
    const handleCopy = () => {
        if (activeTab === 'html') navigator.clipboard.writeText(html);
        if (activeTab === 'css') navigator.clipboard.writeText(css);
        if (activeTab === 'js') navigator.clipboard.writeText(js);
    };

    const renderActiveEditor = () => {
        // FIX: Moved common classes inside this function to avoid a runtime error in the overly complex React.cloneElement logic. This fixes the module export error.
        const commonClasses = "w-full h-full bg-gray-900 border-t border-gray-600 p-2 font-mono text-sm text-cyan-300 resize-none focus:outline-none";
        switch (activeTab) {
            case 'html': return <textarea value={html} onChange={e => setHtml(e.target.value)} placeholder="اكتب كود HTML هنا..." className={commonClasses} />;
            case 'css': return <textarea value={css} onChange={e => setCss(e.target.value)} placeholder="اكتب كود CSS هنا..." className={commonClasses} />;
            case 'js': return <textarea value={js} onChange={e => setJs(e.target.value)} placeholder="اكتب كود JavaScript هنا..." className={commonClasses} />;
        }
    };

    return (
        <>
            <button onClick={onNavigateHome} className="absolute top-24 left-4 sm:left-6 lg:left-8 px-4 py-2 text-sm font-semibold rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors flex items-center gap-2 z-20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                العودة للرئيسية
            </button>
             <div className="flex flex-col items-center gap-4 text-center my-6">
                <div className="relative h-24 w-24 flex items-center justify-center">
                    <svg className="absolute h-full w-full text-cyan-500 dark:text-cyan-400 pulsing-triangle" viewBox="0 0 100 100" stroke="currentColor" fill="none"><path d="M50 5 L95 85 L5 85 Z" /></svg>
                    <i className="fas fa-code relative text-6xl text-cyan-500 dark:text-cyan-400 eye-animation"></i>
                </div>
                <h2 className="font-extrabold text-2xl text-gray-800 dark:text-gray-100 tracking-wider" style={{ textShadow: '0 0 15px rgba(34, 211, 238, 0.6)' }}>
                    محرر الأكواد الاحترافي
                </h2>
            </div>
            
            <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <button onClick={() => setIsGuideOpen(!isGuideOpen)} className="w-full flex justify-between items-center p-4 text-left" aria-expanded={isGuideOpen}>
                        <h3 className="text-lg font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-3"><i className="fas fa-book-open"></i>الدليل الشامل للاستخدام</h3>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-gray-500 dark:text-gray-400 transform transition-transform duration-300 ${isGuideOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {isGuideOpen && <GuideSection />}
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex flex-col" style={{ height: '70vh' }}>
                    <div className="flex justify-between items-center mb-2">
                        <div className="border-b border-gray-600 flex">
                            {['html', 'css', 'js'].map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 py-2 text-sm font-semibold -mb-px border-b-2 ${activeTab === tab ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400'}`}>
                                    {tab.toUpperCase()}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handlePaste} title="لصق" className="px-3 py-1 text-xs rounded-md bg-gray-700 text-white hover:bg-gray-600">لصق</button>
                            <button onClick={handleCopy} title="نسخ" className="px-3 py-1 text-xs rounded-md bg-gray-700 text-white hover:bg-gray-600">نسخ</button>
                            <button onClick={handleClearAll} title="مسح الكل" className="px-3 py-1 text-xs rounded-md bg-red-600 text-white hover:bg-red-700">مسح الكل</button>
                            <button onClick={() => fileInputRef.current?.click()} title="رفع ملف" className="px-3 py-1 text-xs rounded-md bg-purple-600 text-white hover:bg-purple-700">رفع</button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".html" />
                            <button onClick={handleDownload} title="تنزيل" className="px-3 py-1 text-xs rounded-md bg-green-600 text-white hover:bg-green-700">تنزيل</button>
                        </div>
                    </div>
                    <div className="flex-grow flex flex-col">
                        {renderActiveEditor()}
                    </div>
                    <div className="flex-grow border-t border-gray-600">
                        <iframe
                            srcDoc={srcDoc}
                            title="output"
                            sandbox="allow-scripts"
                            frameBorder="0"
                            width="100%"
                            height="100%"
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default CodeEditor;
