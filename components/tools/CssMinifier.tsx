import React, { useState, useMemo } from 'react';

interface CssMinifierProps {
    onNavigateHome: () => void;
}

const GuideSection = () => (
    <div className="bg-gray-900/50 p-6 rounded-lg border border-cyan-500/30 text-gray-300 space-y-8">
        <h3 className="!text-2xl !font-bold text-center !text-cyan-400 !mb-6 !pb-2 !border-b-2 !border-cyan-500/30" style={{ textShadow: '0 0 8px rgba(34, 211, 238, 0.5);' }}>دليل أداة ضغط أكواد CSS: سرعة فائقة لموقعك</h3>
        
        <p>مرحباً بكِ يا ملكتي في أداة تسريع المواقع. هذه الأداة البسيطة والقوية لها تأثير هائل على أداء مدونتكِ. فكلما كان كود الـ CSS الخاص بقالبكِ أصغر، كلما تم تحميل موقعكِ بشكل أسرع، وهذا يسعد الزوار ومحركات البحث على حد سواء.</p>

        <h4 className="!text-xl !font-semibold !text-purple-400 !flex !items-center !gap-3 !mt-8 !mb-4 !pb-2 !border-b !border-purple-500/20"><i className="fas fa-rocket text-2xl w-8 text-center"></i><span>ماذا تفعل هذه الأداة بالضبط؟</span></h4>
        <p>تقوم الأداة بعملية تسمى "Minification" أو "التصغير". إنها تأخذ كود الـ CSS الخاص بك وتقوم بـ:</p>
        <ul className="!list-disc !marker:text-cyan-400 !pl-8 !mt-2 !space-y-2">
            <li>إزالة جميع التعليقات البرمجية التي لا يقرأها المتصفح.</li>
            <li>حذف جميع المسافات الزائدة والأسطر الفارغة.</li>
            <li>إزالة الفواصل المنقوطة (;) غير الضرورية في نهاية كل مجموعة من الخصائص.</li>
        </ul>
        <p>النتيجة؟ نفس الكود الذي يؤدي نفس الوظيفة تماماً، ولكن بحجم أصغر بكثير، مما يعني تحميل أسرع للصفحة.</p>

        <h4 className="!text-xl !font-semibold !text-purple-400 !flex !items-center !gap-3 !mt-8 !mb-4 !pb-2 !border-b !border-purple-500/20"><i className="fas fa-cogs text-2xl w-8 text-center"></i><span>دليل الاستخدام خطوة بخطوة:</span></h4>
        <ol className="!list-decimal list-inside space-y-2 pr-4">
            <li><strong className="text-cyan-300">الحصول على الكود:</strong> اذهبي إلى لوحة تحكم بلوجر ← المظهر ← تعديل HTML. حددي كل الكود (Ctrl+A) وانسخيه (Ctrl+C).</li>
            <li><strong className="text-cyan-300">لصق الكود:</strong> عودي إلى هذه الأداة واضغطي على زر "لصق" لوضع الكود في صندوق "كود CSS الأصلي".</li>
            <li><strong className="text-cyan-300">بدء الضغط:</strong> اضغطي على زر "ضغط الكود".</li>
            <li><strong className="text-cyan-300">النتيجة الفورية:</strong> فوراً، سيظهر الكود المضغوط في صندوق "النتيجة المضغوطة". ستظهر لكِ أيضاً إحصائيات دقيقة توضح حجم التوفير الذي حققتيه.</li>
            <li><strong className="text-cyan-300">تطبيق الكود:</strong> اضغطي على "نسخ"، ثم عودي إلى محرر HTML في بلوجر، احذفي الكود القديم، والصقي الكود الجديد المضغوط. اضغطي على "حفظ".</li>
        </ol>
        
        <div className="p-4 bg-yellow-900/30 border-l-4 border-yellow-400 text-yellow-200 space-y-2 rounded-r-lg mt-6">
            <h5 className="font-bold flex items-center gap-2"><i className="fas fa-exclamation-triangle"></i> نصيحة ذهبية!</h5>
            <p className="text-sm">قبل تطبيق الكود المضغوط على مدونتكِ، احتفظي دائماً بنسخة احتياطية من الكود الأصلي في ملف نصي على جهازكِ. هذا يضمن أنه يمكنكِ التراجع بسهولة إذا حدث أي خطأ غير متوقع.</p>
        </div>
    </div>
);

const CssMinifier: React.FC<CssMinifierProps> = ({ onNavigateHome }) => {
    const [inputCss, setInputCss] = useState('');
    const [outputCss, setOutputCss] = useState('');
    const [isGuideOpen, setIsGuideOpen] = useState(true);

    const stats = useMemo(() => {
        if (!inputCss && !outputCss) return null;
        const originalSize = new Blob([inputCss]).size;
        const minifiedSize = new Blob([outputCss]).size;
        const reduction = originalSize > 0 ? ((originalSize - minifiedSize) / originalSize) * 100 : 0;
        return {
            originalSize,
            minifiedSize,
            reduction: reduction.toFixed(1)
        };
    }, [inputCss, outputCss]);

    const handleMinify = () => {
        let minified = inputCss
            // Remove comments
            .replace(/\/\*[\s\S]*?\*\//g, '')
            // Remove newlines and tabs
            .replace(/[\n\t]/g, '')
            // Remove whitespace around selectors and rules
            .replace(/\s*{\s*/g, '{')
            .replace(/\s*}\s*/g, '}')
            .replace(/\s*;\s*/g, ';')
            .replace(/\s*:\s*/g, ':')
            .replace(/\s*,\s*/g, ',')
            // Remove last semicolon in a block
            .replace(/;}/g, '}');
        
        setOutputCss(minified.trim());
    };
    
    const handlePaste = async () => setInputCss(await navigator.clipboard.readText());
    const handleCopy = () => outputCss && navigator.clipboard.writeText(outputCss);
    const handleClear = () => { setInputCss(''); setOutputCss(''); };
    
    return (
        <>
            <button onClick={onNavigateHome} className="absolute top-24 left-4 sm:left-6 lg:left-8 px-4 py-2 text-sm font-semibold rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors flex items-center gap-2 z-20">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                العودة للرئيسية
            </button>
             <div className="flex flex-col items-center gap-4 text-center my-6">
                <div className="relative h-24 w-24 flex items-center justify-center">
                    <svg className="absolute h-full w-full text-cyan-500 dark:text-cyan-400 pulsing-triangle" viewBox="0 0 100 100" stroke="currentColor" fill="none"><path d="M50 5 L95 85 L5 85 Z" /></svg>
                    <i className="fas fa-compress-arrows-alt relative text-6xl text-cyan-500 dark:text-cyan-400 eye-animation"></i>
                </div>
                <h2 className="font-extrabold text-2xl text-gray-800 dark:text-gray-100 tracking-wider" style={{ textShadow: '0 0 15px rgba(34, 211, 238, 0.6)' }}>
                    أداة ضغط أكواد CSS
                </h2>
            </div>

            <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
                 <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <button onClick={() => setIsGuideOpen(!isGuideOpen)} className="w-full flex justify-between items-center p-4 text-left" aria-expanded={isGuideOpen}>
                        <h3 className="text-lg font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-3"><i className="fas fa-book-open"></i>الدليل الشامل للاستخدام</h3>
                         <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-gray-500 dark:text-gray-400 transform transition-transform duration-300 ${isGuideOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {isGuideOpen && <GuideSection />}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                             <label className="font-semibold text-gray-800 dark:text-gray-200">كود CSS الأصلي</label>
                             <button onClick={handlePaste} title="لصق" className="px-3 py-1 text-xs rounded-md bg-gray-500 text-white hover:bg-gray-600">لصق</button>
                        </div>
                        <textarea value={inputCss} onChange={e => setInputCss(e.target.value)} placeholder="/* الصق كود CSS هنا */" className="w-full h-80 bg-gray-900 border border-gray-600 rounded-md p-2 font-mono text-sm text-gray-200" dir="ltr" />
                    </div>
                     <div>
                         <div className="flex justify-between items-center mb-2">
                             <label className="font-semibold text-gray-800 dark:text-gray-200">النتيجة المضغوطة</label>
                             <button onClick={handleCopy} title="نسخ" disabled={!outputCss} className="px-3 py-1 text-xs rounded-md bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-500">نسخ</button>
                         </div>
                        <textarea value={outputCss} readOnly placeholder="النتيجة ستظهر هنا..." className="w-full h-80 bg-gray-900 border border-gray-600 rounded-md p-2 font-mono text-sm text-cyan-400" dir="ltr" />
                    </div>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <button onClick={handleMinify} disabled={!inputCss} className="w-full md:flex-1 h-12 text-lg font-bold text-white bg-cyan-600 hover:bg-cyan-700 rounded-md shadow-lg disabled:bg-gray-600">
                        ضغط الكود
                    </button>
                    <button onClick={handleClear} disabled={!inputCss} className="w-full md:w-auto px-6 h-12 text-lg font-bold text-white bg-red-600 hover:bg-red-700 rounded-md shadow-lg disabled:bg-gray-600">
                        مسح
                    </button>
                </div>
                 {stats && stats.originalSize > 0 && (
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-gray-800/50 rounded-lg"><p className="text-gray-400">الحجم الأصلي</p><p className="text-2xl font-bold text-white">{(stats.originalSize / 1024).toFixed(2)} KB</p></div>
                        <div className="p-4 bg-gray-800/50 rounded-lg"><p className="text-gray-400">الحجم الجديد</p><p className="text-2xl font-bold text-cyan-400">{(stats.minifiedSize / 1024).toFixed(2)} KB</p></div>
                        <div className="p-4 bg-green-900/50 rounded-lg"><p className="text-gray-400">نسبة التوفير</p><p className="text-2xl font-bold text-green-400">{stats.reduction}%</p></div>
                    </div>
                )}
            </div>
        </>
    );
};

export default CssMinifier;