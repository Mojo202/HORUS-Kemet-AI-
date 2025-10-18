import React, { useState, useCallback, useEffect } from 'react';
import { HorusTemplate, ContentType } from '../types';
import { HORUS_TEMPLATES } from '../services/horusTemplates';
import { GoogleGenAI } from '@google/genai';
import { apiKeyManager } from '../apiKeyManager';
import LoadingIndicator from './LoadingIndicator';
import GuideSection from './GuideSection';

interface HorusForgeProps {
    onNavigateHome: () => void;
    logStatus: (message: string) => void;
    setError: (error: string | null) => void;
}

const ForgeCard: React.FC<{
    icon: string;
    title: string;
    description: string;
    onClick: () => void;
    typeClass: string;
}> = ({ icon, title, description, onClick, typeClass }) => {
    return (
        <button
            onClick={onClick}
            className={`forge-card-button relative text-right w-full h-full p-4 rounded-lg bg-gray-900/70 border border-gray-700 hover:border-cyan-500/50 hover:bg-gray-800/60 transition-all duration-300 transform hover:-translate-y-1 group flex flex-col items-center text-center`}
        >
            <div className="relative h-16 w-16 flex-shrink-0 flex items-center justify-center mb-3">
                <svg
                    className={`absolute h-full w-full text-cyan-500/30 group-hover:text-cyan-400/50 pulsing-triangle`}
                    viewBox="0 0 100 100"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M50 5 L95 85 L5 85 Z" strokeLinejoin="round" strokeWidth="3" stroke="currentColor" fill="none" />
                </svg>
                <i className={`${icon} relative text-3xl ${typeClass} eye-animation`}></i>
            </div>
            <div className="flex flex-col flex-grow">
                <h4 className="font-bold text-sm text-gray-100 group-hover:text-white">{title}</h4>
                <p className="text-xs text-gray-400 mt-1 flex-grow">{description}</p>
            </div>
        </button>
    );
};

const GENERATING_MESSAGES = [
    'استدعاء عقل حورس الذكي...',
    'تحليل متطلبات البروتوكول المطلوب...',
    'صياغة التعليمات البرمجية الأولية...',
    'مراجعة وتدقيق الهيكل العام...',
    'تطبيق أفضل ممارسات SEO...',
    'وضع اللمسات النهائية على الكود...',
    'نقترب من الانتهاء...'
];

const GeneratingIndicator = () => {
    const [message, setMessage] = useState(GENERATING_MESSAGES[0]);

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            index = (index + 1) % GENERATING_MESSAGES.length;
            setMessage(GENERATING_MESSAGES[index]);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full gap-8">
             <div className="flex items-center justify-center gap-1 h-20 w-48">
                <style>{`
                    @keyframes wave-equalizer {
                        0%, 100% { transform: scaleY(0.1); background-color: #60a5fa; }
                        50% { transform: scaleY(1); background-color: #22d3ee; }
                    }
                    .wave-bar {
                        width: 8px;
                        border-radius: 4px;
                        animation-name: wave-equalizer;
                        animation-timing-function: cubic-bezier(0.45, 0, 0.55, 1);
                        animation-iteration-count: infinite;
                        transform-origin: bottom;
                    }
                `}</style>
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="wave-bar"
                        style={{
                            height: '100%',
                            animationDuration: `${Math.random() * 0.8 + 0.8}s`,
                            animationDelay: `${i * 0.1}s`,
                        }}
                    ></div>
                ))}
            </div>
            <p className="text-lg font-semibold text-cyan-300 transition-all duration-500 text-center px-4">
                {message}
            </p>
        </div>
    );
};

const ResultsPlaceholder = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
        <i className="fas fa-scroll text-6xl mb-4 text-cyan-500/50"></i>
        <h4 className="font-bold text-lg text-gray-400">مخطوطة حورس فارغة</h4>
        <p className="max-w-xs">انقر على أي عنصر من الأعلى (عقل، بروتوكول، قالب، أو سكيما) لعرض محتواه هنا.</p>
    </div>
);


const HorusForge: React.FC<HorusForgeProps> = ({ onNavigateHome, logStatus, setError }) => {
    const [generatedContent, setGeneratedContent] = useState('');
    const [generatedTitle, setGeneratedTitle] = useState('');
    const [generatedType, setGeneratedType] = useState<'persona' | 'template' | 'protocol' | 'schema' | null>(null);
    const [copied, setCopied] = useState(false);
    const [isGeneratingSchema, setIsGeneratingSchema] = useState(false);

    const personaTemplates = HORUS_TEMPLATES.filter(t => t.type === 'persona');
    const protocolTemplates = HORUS_TEMPLATES.filter(t => t.type === 'protocol');
    const templateTemplates = HORUS_TEMPLATES.filter(t => t.type === 'template');

    const schemaCardsData = [
      { title: "سكيما الأسئلة والأجوبة (ديناميكي)", description: "قالب سكيما أسئلة وأجوبة ديناميكي متوافق مع بلوجر.", icon: "fas fa-cogs", type: "QAPage", mode: "dynamic" },
      { title: "سكيما الأسئلة والأجوبة (FAQPage)", description: "أضف قسم أسئلة وأجوبة ليظهر بشكل مميز في نتائج البحث.", icon: "fas fa-question-circle", type: "QAPage", mode: "fillable" },
      { title: "سكيما المقال (ديناميكي)", description: "قالب سكيما مقال ديناميكي متوافق مع بلوجر.", icon: "fas fa-cogs", type: "Article", mode: "dynamic" },
      { title: "سكيما المقال (Article)", description: "عرّف محركات البحث بأن المحتوى هو مقال إخباري أو تدوينة.", icon: "fas fa-file-alt", type: "Article", mode: "fillable" },
      { title: "سكيما الوصفة (ديناميكي)", description: "قالب سكيما وصفة ديناميكي متوافق مع بلوجر.", icon: "fas fa-cogs", type: "Recipe", mode: "dynamic" },
      { title: "سكيما الوصفة (Recipe)", description: "ضرورية لمقالات الطبخ لتظهر بشكل غني في نتائج البحث.", icon: "fas fa-utensils", type: "Recipe", mode: "fillable" },
      { title: "سكيما الكيفية (ديناميكي)", description: "قالب سكيما كيفية ديناميكي متوافق مع بلوجر.", icon: "fas fa-cogs", type: "HowTo", mode: "dynamic" },
      { title: "سكيما الكيفية (HowTo)", description: "استخدمها للمقالات التي تشرح خطوات عمل شيء ما.", icon: "fas fa-tasks", type: "HowTo", mode: "fillable" },
      { title: "سكيما العمل المحلي (ديناميكي)", description: "قالب سكيما عمل محلي ديناميكي متوافق مع بلوجر.", icon: "fas fa-cogs", type: "LocalBusiness", mode: "dynamic" },
      { title: "سكيما العمل المحلي (LocalBusiness)", description: "عرّف بجوجل عن عملك المحلي لعرض معلوماتك.", icon: "fas fa-store", type: "LocalBusiness", mode: "fillable" },
      { title: "سكيما المنتج (ديناميكي)", description: "قالب سكيما منتج ديناميكي متوافق مع بلوجر.", icon: "fas fa-cogs", type: "Product", mode: "dynamic" },
      { title: "سكيما المنتج (Product)", description: "استخدمها لعرض السعر والتقييمات في نتائج البحث.", icon: "fas fa-box-open", type: "Product", mode: "fillable" },
      { title: "سكيما الشخص (ديناميكي)", description: "قالب سكيما شخص ديناميكي متوافق مع بلوجر.", icon: "fas fa-cogs", type: "Person", mode: "dynamic" },
      { title: "سكيما الشخص (Person)", description: "استخدمها لإنشاء بطاقة معرفية عن شخصية عامة.", icon: "fas fa-user", type: "Person", mode: "fillable" },
      { title: "سكيما الحدث (ديناميكي)", description: "قالب سكيما حدث ديناميكي متوافق مع بلوجر.", icon: "fas fa-cogs", type: "Event", mode: "dynamic" },
      { title: "سكيما الحدث (Event)", description: "استخدمها للإعلان عن الفعاليات والندوات.", icon: "fas fa-calendar-alt", type: "Event", mode: "fillable" },
    ];


    const handleGenerate = useCallback(async (template: HorusTemplate) => {
        setGeneratedContent('');
        setGeneratedTitle(`جاري إنشاء: ${template.name}...`);
        setGeneratedType(template.type);

        if (template.type === 'persona' || template.type === 'protocol') {
            setGeneratedContent(template.instructions);
            const typeText = template.type === 'persona' ? 'شخصية (مخ)' : 'بروتوكول إدخال';
            setGeneratedTitle(`${typeText} جاهز: ${template.name}`);
        } else if (template.type === 'template') {
             const filePath = template.instructions.replace(/^public\//, '');
             if (!filePath) {
                setError("مسار ملف القالب غير صالح.");
                setGeneratedTitle('خطأ في التحميل');
                return;
            }
            try {
                const response = await fetch(`/${filePath}`);
                if (!response.ok) throw new Error(`Network response was not ok for ${filePath}`);
                const templateHtml = await response.text();
                setGeneratedContent(templateHtml);
                setGeneratedTitle(`قالب HTML جاهز: ${template.name}`);
            } catch (e: any) {
                setError(`فشل تحميل القالب: ${e.message}`);
                setGeneratedTitle('خطأ في التحميل');
            }
        }
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, [setError]);
    
    const handleGenerateSchema = async (type: string, mode: 'fillable' | 'dynamic') => {
        const apiKey = apiKeyManager.getActiveGeminiApiKey();
        if (!apiKey) {
            setError("يرجى إضافة مفتاح Gemini API في الصفحة الرئيسية أولاً.");
            return;
        }
        setIsGeneratingSchema(true);
        const title = `سكيما ${type} (${mode === 'dynamic' ? 'ديناميكي' : 'قابل للملء'})`;
        setGeneratedTitle(`جاري توليد: ${title}...`);
        setGeneratedType('schema');
        setGeneratedContent('');
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });

        let prompt: string;

        if (mode === 'dynamic') {
            prompt = `
            أنت خبير SEO متخصص في Blogger Schema. مهمتك هي إنشاء كود JSON-LD كامل وصحيح ومُنسق لنوع السكيما المطلوب.
            يجب أن يكون الرد **فقط** هو كتلة الكود \`<script type="application/ld+json">...</script>\` ولا شيء آخر. لا تضف أي نصوص حوارية أو شروحات.

            **التعليمات الحاسمة:**
            1.  نوع السكيما يجب أن يكون: \`${type}\`.
            2.  يجب استخدام المتغيرات الديناميكية ذات النمط \`__VARIABLE_NAME__\` **حصريًا** لجميع الحقول المتغيرة. **لا تستخدم أي نصوص placeholders ثابتة على الإطلاق.**
                *   استخدم \`__POST_URL__\` للروابط.
                *   استخدم \`__POST_TITLE__\` للعناوين.
                *   استخدم \`__POST_DATE__\` لتاريخ النشر.
                *   استخدم \`__POST_MODIFIED_DATE__\` لتاريخ التعديل.
                *   استخدم \`__AUTHOR_NAME__\` لاسم المؤلف.
                *   استخدم \`__AUTHOR_URL__\` لرابط المؤلف.
                *   استخدم \`__POST_IMAGE_URL__\` لرابط الصورة.
                *   استخدم \`__SITE_NAME__\` لاسم الموقع/الناشر.
                *   استخدم \`__SITE_URL__\` لرابط الموقع.
                *   استخدم \`__SITE_LOGO__\` لرابط شعار الموقع.
            3.  املأ الحقول الثابتة (مثل \`@context\` و \`@type\`) بالقيم الصحيحة.
            4.  لـ QAPage: أنشئ سؤالاً رئيسياً واحداً و 3 أسئلة فرعية على الأقل كأمثلة هيكلية، مع استخدام المتغيرات الديناميكية في حقول مثل التواريخ والمؤلفين.
            5.  لـ Recipe: استخدم المتغيرات الديناميكية للتواريخ والناشر، واستخدم نصوصًا مثالاً **بالعربية** للمقادير والخطوات.
            6.  لـ HowTo: استخدم المتغيرات الديناميكية للتواريخ، واستخدم نصوصًا مثالاً **بالعربية** للخطوات.
            7.  لـ Article: استخدم المتغيرات الديناميكية لكل شيء ممكن (العنوان، التاريخ، المؤلف، الناشر، الصورة، الرابط).
            `;
        } else { // fillable
            prompt = `
            أنت خبير SEO متخصص في Schema.org. مهمتك هي إنشاء كود JSON-LD كامل وصحيح وقابل للملء لنوع السكيما المطلوب.
            يجب أن يكون الرد **فقط** هو كتلة الكود \`<script type="application/ld+json">...</script>\` ولا شيء آخر. لا تضف أي نصوص حوارية أو شروحات.

            **التعليمات الحاسمة:**
            1.  نوع السكيما يجب أن يكون: \`${type}\`.
            2.  يجب استخدام نصوص placeholder واضحة **باللغة العربية** لجميع الحقول التي يجب على المستخدم ملؤها. مثال: \`"[أدخل السؤال هنا]"\`, \`"[أدخل اسم الوصفة]"\`, \`"YYYY-MM-DD"\`.
            3.  املأ الحقول الثابتة (مثل \`@context\` و \`@type\`) بالقيم الصحيحة.
            4.  لـ QAPage: أنشئ سؤالاً رئيسياً واحداً و 3 أسئلة فرعية على الأقل كأمثلة.
            5.  لـ Recipe: قدم هيكلاً كاملاً لوصفة مع مقادير وخطوات أمثلة.
            6.  لـ HowTo: قدم هيكلاً كاملاً لكيفية عمل شيء ما مع خطوات أمثلة.
            `;
        }
        
        try {
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setGeneratedContent(response.text.replace(/```(html|json)?\n?|\`\`\`/g, '').trim());
            setGeneratedTitle(`تم إنشاء: ${title}`);
        } catch(e: any) {
            setError(e.message);
            setGeneratedTitle(`خطأ في إنشاء: ${title}`);
        } finally {
            setIsGeneratingSchema(false);
        }
    };


    const handleCopy = () => {
        if (generatedContent) {
            navigator.clipboard.writeText(generatedContent);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
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
                    <i className="fas fa-scroll relative text-6xl text-cyan-500 dark:text-cyan-400 eye-animation"></i>
                </div>
                <h2 className="font-extrabold text-2xl text-gray-800 dark:text-gray-100 tracking-wider" style={{ textShadow: '0 0 15px rgba(34, 211, 238, 0.6)' }}>
                    استوديو حورس لصناعة العقول والبروتوكولات
                </h2>
            </div>
            
            <div className="w-full max-w-7xl mx-auto flex flex-col gap-8">
                {/* Personas */}
                <div className="bg-gray-800/50 p-6 rounded-lg border border-purple-500/30">
                    <h3 className="text-xl font-bold text-center text-purple-400 mb-4">1. العقول (Personas)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {personaTemplates.map(t => <ForgeCard key={t.name} icon={t.icon} title={t.name} description={t.description} onClick={() => handleGenerate(t)} typeClass="text-purple-400" />)}
                    </div>
                </div>
                {/* Protocols & Templates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gray-800/50 p-6 rounded-lg border border-green-500/30">
                        <h3 className="text-xl font-bold text-center text-green-400 mb-4">2. بروتوكولات الإدخال</h3>
                        <div className="grid grid-cols-2 gap-4">
                             {protocolTemplates.map(t => <ForgeCard key={t.name} icon={t.icon} title={t.name} description={t.description} onClick={() => handleGenerate(t)} typeClass="text-green-400" />)}
                        </div>
                    </div>
                    <div className="bg-gray-800/50 p-6 rounded-lg border border-blue-500/30">
                        <h3 className="text-xl font-bold text-center text-blue-400 mb-4">3. قوالب HTML الجاهزة</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                             {templateTemplates.map(t => <ForgeCard key={t.name} icon={t.icon} title={t.name} description={t.description} onClick={() => handleGenerate(t)} typeClass="text-blue-400" />)}
                        </div>
                    </div>
                </div>

                {/* Schema Studio */}
                <div className="bg-gray-800/50 p-6 rounded-lg border border-yellow-500/30">
                    <h3 className="text-xl font-bold text-center text-yellow-400 mb-1">4. مكتبة السكيما المتقدمة (Schema)</h3>
                    <p className="text-center text-xs text-gray-400 mb-4">اختر أي نوع من أنواع البيانات المنظمة (Schema) لتضمينها في مقالاتك. اختر القالب القابل للملء لتعبئته بنفسك، أو الديناميكي ليعمل تلقائياً مع بلوجر.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
                        {schemaCardsData.map(card => (
                            <ForgeCard 
                                key={card.title}
                                icon={card.icon}
                                title={card.title}
                                description={card.description}
                                onClick={() => handleGenerateSchema(card.type, card.mode as any)}
                                typeClass="text-yellow-400"
                            />
                        ))}
                    </div>
                </div>

                {/* Results Section */}
                <div id="results-section" className="bg-gray-800/50 p-6 rounded-lg border border-cyan-500/30">
                    <div className="flex justify-between items-center mb-4">
                         <h3 className="text-xl font-bold text-cyan-400">{generatedTitle || "صندوق النتائج"}</h3>
                         {generatedContent && (
                            <button onClick={handleCopy} className="px-4 py-2 text-sm font-semibold rounded-md bg-green-600 text-white hover:bg-green-700">
                                {copied ? '✓ تم النسخ' : '📋 نسخ المحتوى'}
                            </button>
                         )}
                    </div>
                     <div className="w-full h-96 bg-gray-900 border border-gray-600 rounded-md p-4 relative">
                        {isGeneratingSchema ? (
                            <GeneratingIndicator />
                        ) : generatedContent ? (
                            <textarea
                                readOnly
                                value={generatedContent}
                                className="w-full h-full bg-transparent font-mono text-sm text-gray-200 resize-none border-0 focus:ring-0"
                                dir="ltr"
                            />
                        ) : (
                            <ResultsPlaceholder />
                        )}
                     </div>
                </div>
            </div>

            <div className="mt-8">
                <div className="mb-2 p-3 bg-gray-900/50 rounded-lg border border-cyan-500/30 text-center">
                    <h4 className="font-semibold text-cyan-400 flex items-center justify-center gap-2">
                        <i className="fas fa-book-open"></i>
                        دليل الاستخدام والنصائح الاحترافية
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">
                        انقر على الزر أدناه لعرض أو إخفاء دليل شامل حول كيفية استخدام صانع البروتوكولات والاستفادة منه في تحسين محركات البحث.
                    </p>
                </div>
                <GuideSection contentType={ContentType.HorusForge} />
            </div>
        </>
    );
};

export default HorusForge;