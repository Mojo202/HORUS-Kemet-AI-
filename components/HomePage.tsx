import React from 'react';
import { ContentType, ToolType } from '../types';
import { CONTENT_TYPE_OPTIONS, TOOL_OPTIONS } from '../constants';
import ApiKeyManager from './ApiKeyManager';
import GlobalActionsPanel from './GlobalActionsPanel';
import CollapsiblePersonaEditor from './CollapsiblePersonaEditor';

const HorusEyeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 100 65" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5,30 Q50,0 95,30 Q50,60 5,30 Z" fill="none"/>
      <circle cx="50" cy="30" r="12" fill="white" stroke="none" />
      <path d="M50,42 V55 L40,58" fill="none"/>
      <path d="M95,30 C90,45 80,55 75,58" fill="none"/>
    </svg>
);

const FeaturesSection: React.FC = () => {
    const capabilities = [
        {
            icon: 'fas fa-cogs',
            title: 'محرك البروتوكول الذكي',
            description: 'نظام أوامر صارم وموحد يوجه النموذج لإنتاج مقالات احترافية متوافقة مع معايير SEO، بما في ذلك هيكلة HTML والمصادر والسكيما.',
            color: 'text-purple-400'
        },
        {
            icon: 'fas fa-brain',
            title: 'المخ المخصص (Global & Page Persona)',
            description: 'لك السيطرة الكاملة! يمكنك إدخال بروتوكولك الخاص لتوجيه الذكاء الاصطناعي لإنشاء محتوى بأسلوبك وهيكلتك الفريدة على مستوى التطبيق أو الصفحة.',
            color: 'text-cyan-400'
        },
        {
            icon: 'fas fa-palette',
            title: 'استوديو الوسائط المتعددة',
            description: 'مولّد صور احترافي ينشئ صورًا فريدة لكل مقال بناءً على محتواه، واستوديو فيديو لإنشاء مقاطع قصيرة بالذكاء الاصطناعي.',
            color: 'text-green-400'
        },
        {
            icon: 'fas fa-rocket',
            title: 'جناح SEO والنشر الكامل',
            description: 'مجموعة متكاملة من أدوات فحص الكلمات المفتاحية، تحليل SEO، فحص الروابط الخلفية، والتكامل المباشر مع Blogger للنشر الفوري.',
            color: 'text-amber-400'
        },
        {
            icon: 'fas fa-tools',
            title: 'صندوق أدوات منشئي المحتوى',
            description: 'أكثر من 15 أداة مساعدة قوية، من فاحص الانتحال ومحول الأكواد إلى مولدات الصفحات القانونية ومحرر الأكواد الحي.',
            color: 'text-rose-400'
        },
        {
            icon: 'fas fa-shield-alt',
            title: 'الحماية والتحكم',
            description: 'أدوات لإدارة مفاتيح API، وحفظ واستيراد الإعدادات، وإدارة ملفات التعريف لضمان سير عمل آمن ومخصص بالكامل.',
            color: 'text-blue-400'
        }
    ];

    return (
        <div className="my-12 w-full max-w-7xl mx-auto flex flex-col items-center">
            {/* Hieroglyphics and Title */}
            <div className="text-center mb-8">
                <svg width="450" height="50" viewBox="0 0 450 50" xmlns="http://www.w3.org/2000/svg" className="mb-4 mx-auto" aria-hidden="true">
                    <defs>
                        <filter id="hieroglyph-glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3.5" result="coloredBlur"></feGaussianBlur>
                            <feMerge>
                                <feMergeNode in="coloredBlur"></feMergeNode>
                                <feMergeNode in="SourceGraphic"></feMergeNode>
                            </feMerge>
                        </filter>
                    </defs>
                    <g stroke="#22d3ee" strokeWidth="2.5" fill="#22d3ee" filter="url(#hieroglyph-glow)" strokeLinecap="round" strokeLinejoin="round">
                        
                        {/* Eye of Horus - This is the specific design the user requested */}
                        <g transform="translate(190, 8) scale(0.7)">
                           <path d="M5,30 Q50,0 95,30 Q50,60 5,30 Z" fill="none" strokeWidth="5"/>
                           <circle cx="50" cy="30" r="12" fill="currentColor" stroke="none" />
                           <path d="M50,42 V55 L40,58" fill="none" strokeWidth="5"/>
                           <path d="M95,30 C90,45 80,55 75,58" fill="none" strokeWidth="5"/>
                        </g>

                    </g>
                </svg>
                <h2 className="font-extrabold text-3xl md:text-4xl text-cyan-400 tracking-wider" style={{ textShadow: '0 0 15px rgba(34, 211, 238, 0.7)' }}>
                    مخطوطة حورس: سجل القدرات الكاملة
                </h2>
            </div>
            
            {/* Main Banner/Article */}
            <div className="w-full bg-gray-900/50 p-6 md:p-8 rounded-2xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 backdrop-blur-sm space-y-8">
                <p className="text-center text-lg text-cyan-200/90 max-w-3xl mx-auto leading-relaxed">
                    هذه ليست مجرد أداة، بل هي ترسانة متكاملة صُممت لتمكينك في كل مرحلة من مراحل صناعة المحتوى. من الفكرة الأولية إلى النشر والتحليل، يمنحك حورس القوة والدقة والسرعة للسيطرة على عالم المحتوى الرقمي. استكشف القدرات التي تجعل من حورس الشريك الذي لا غنى عنه لكل منشئ محتوى طموح.
                </p>

                {/* Capabilities Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {capabilities.map((capability, index) => (
                        <div key={index} className="bg-gray-800/60 p-6 rounded-xl border border-gray-700 hover:border-cyan-500/50 hover:bg-gray-700/50 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center gap-4 mb-3">
                                <i className={`${capability.icon} ${capability.color} text-3xl fa-fw`}></i>
                                <h4 className="font-bold text-lg text-gray-100">{capability.title}</h4>
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed">{capability.description}</p>
                        </div>
                    ))}
                </div>

                {/* Warnings and Disclaimers */}
                <div className="pt-6 border-t-2 border-dashed border-yellow-500/30">
                     <div className="bg-yellow-900/30 border-l-4 border-yellow-400 text-yellow-200 p-6 rounded-r-lg space-y-3">
                        <h5 className="font-bold text-lg flex items-center gap-2"><i className="fas fa-exclamation-triangle"></i> إخلاء مسؤولية وإرشادات هامة</h5>
                        <ul className="list-disc list-inside space-y-2 text-sm">
                            <li><strong>المسؤولية الإنسانية:</strong> الذكاء الاصطناعي أداة مساعدة قوية، لكنه ليس بديلاً عن المراجعة والتحرير البشري. أنت المسؤول النهائي عن دقة وصحة المحتوى المنشور.</li>
                            <li><strong>مفاتيح API:</strong> يتم تخزين مفاتيحك الخاصة (Gemini, ImgBB) بشكل آمن في متصفحك فقط ولا يتم مشاركتها مع أي خادم. حماية هذه المفاتيح هي مسؤوليتك.</li>
                            <li><strong>حقوق النشر:</strong> تأكد من أن المواد المصدرية التي تستخدمها لا تنتهك حقوق النشر. المحتوى المولد مخصص ليكون فريدًا، ولكن يجب استخدامه بمسؤولية.</li>
                            <li><strong>التطور المستمر:</strong> نماذج الذكاء الاصطناعي في تطور مستمر. قد تختلف جودة النتائج. نوصي دائمًا باختبار وتجربة "المخ المخصص" لتحقيق أفضل النتائج.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

const HomePage: React.FC<{ 
    onNavigate: (page: ContentType | ToolType) => void; 
    globalProps: any;
}> = ({ onNavigate, globalProps }) => {
    const { globalCustomPersona, setGlobalCustomPersona, logStatus, setError } = globalProps;
    
    return (
        <div className="flex flex-col gap-6">
            <div className="relative rounded-2xl p-px bg-gradient-to-b from-cyan-500/30 to-purple-500/20 shadow-xl shadow-cyan-500/10">
                <div className="main-banner flex flex-col items-center gap-4 rounded-[15px]">
                    <div className="relative h-20 w-20 flex items-center justify-center">
                        <svg
                            className="absolute h-full w-full text-cyan-500 dark:text-cyan-400 pulsing-triangle"
                            viewBox="0 0 100 100"
                            xmlns="http://www.w3.org/2000/svg"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            stroke="currentColor"
                            fill="none"
                        >
                            <path d="M50 5 L95 85 L5 85 Z" />
                        </svg>
                        <HorusEyeIcon className="relative h-16 w-16 text-cyan-500 dark:text-cyan-400 eye-animation" />
                    </div>
                    <h2 className="font-extrabold text-4xl text-gray-100 tracking-wider" style={{ textShadow: '0 0 8px rgba(34, 211, 238, 0.7), 0 0 15px rgba(34, 211, 238, 0.5)' }}>
                        حورس للمقالات المخصصة
                    </h2>
                    <p className="mt-2 text-lg glowing-text max-w-2xl">
                        بوابتك الذكية لعالم صناعة المحتوى الاحترافي. حوّل أفكارك إلى مقالات متكاملة ومحسّنة لمحركات البحث بلمسة من سحر الذكاء الاصطناعي.
                    </p>
                </div>
            </div>
            
            <ApiKeyManager 
                geminiApiKeys={globalProps.geminiApiKeys}
                setGeminiApiKeys={globalProps.setGeminiApiKeys}
                activeKeyIndex={globalProps.activeKeyIndex}
                setActiveKeyIndex={globalProps.setActiveKeyIndex}
                imgbbApiKey={globalProps.imgbbApiKey}
                setImgbbApiKey={globalProps.setImgbbApiKey}
                youtubeApiKey={globalProps.youtubeApiKey}
                setYoutubeApiKey={globalProps.setYoutubeApiKey}
            />

            <CollapsiblePersonaEditor
                title="المخ الرئيسي العام (Global Persona)"
                description="هذا هو بروتوكول التشغيل الافتراضي للتطبيق بأكمله. سيتم استخدامه إذا لم يتم تحديد مخ مخصص داخل صفحة إنشاء المحتوى."
                persona={globalCustomPersona}
                setPersona={setGlobalCustomPersona}
                logStatus={logStatus}
                setError={setError}
            />

            <div className="bg-gray-900/50 p-6 rounded-lg border border-cyan-500/30 space-y-6 shadow-xl shadow-cyan-500/10">
                <div className="text-center">
                    <h3 className="font-extrabold text-3xl lg:text-4xl text-cyan-400 tracking-wider" style={{ textShadow: '0 0 15px rgba(34, 211, 238, 0.7)' }}>
                        منصة الإنشاء المتكاملة
                    </h3>
                    <p className="mt-2 text-sm text-cyan-200/80 max-w-xl mx-auto">
                        اختر خدمة لإنشاء المحتوى من الصفر، أو استخدم الاستوديوهات المتقدمة للتحرير والتحليل.
                    </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
                    {CONTENT_TYPE_OPTIONS.map((option) => {
                        const iconColor = option.value === ContentType.HoroscopeVideoStudio ? 'text-purple-500 dark:text-purple-400' : 'text-cyan-500 dark:text-cyan-400';
                        return (
                            <div 
                                key={option.value}
                                className="relative rounded-lg p-[1.5px] bg-gradient-to-br from-cyan-500/20 to-purple-500/20 hover:from-cyan-400/40 hover:to-purple-500/40 transition-all duration-300 group shadow-lg hover:shadow-cyan-500/30"
                            >
                                <button
                                    onClick={() => onNavigate(option.value)}
                                    className="w-full h-36 flex flex-col items-center justify-center gap-1 p-4 rounded-md bg-gray-900/70 hover:bg-gray-900/90 backdrop-blur-sm transition-colors duration-300"
                                >
                                    <div className="relative h-20 w-20 flex items-center justify-center">
                                        <svg
                                            className="absolute h-full w-full text-cyan-500/50 dark:text-cyan-400/50 group-hover:text-cyan-400 pulsing-triangle"
                                            viewBox="0 0 100 100"
                                            xmlns="http://www.w3.org/2000/svg"
                                            strokeLinejoin="round"
                                            strokeWidth="3"
                                            stroke="currentColor"
                                            fill="none"
                                        >
                                            <path d="M50 5 L95 85 L5 85 Z" />
                                        </svg>
                                        <i className={`${option.iconClass} relative text-4xl ${iconColor} eye-animation`}></i>
                                    </div>
                                    <span className="text-sm text-center font-semibold text-gray-300 group-hover:text-white transition-colors duration-300 mt-1">{option.label}</span>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

             <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 space-y-6">
                 <div className="text-center py-4">
                    <h3 className="font-extrabold text-3xl lg:text-4xl text-cyan-600 dark:text-cyan-400 tracking-wider" style={{ textShadow: '0 0 15px rgba(34, 211, 238, 0.7)' }}>
                        صندوق أدوات منشئي المحتوى
                    </h3>
                    <p className="mt-2 text-sm text-cyan-200/80 max-w-xl mx-auto">
                        مجموعة متكاملة من الأدوات لمساعدتك في إنشاء وتحسين ونشر المحتوى الخاص بك بكفاءة.
                    </p>
                </div>
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                    {TOOL_OPTIONS.map((tool) => {
                        const isNanoBanana = tool.value === ToolType.NanoBananaStudio;
                        return (
                           <div 
                                key={tool.value}
                                className={`relative rounded-lg p-[1.5px] bg-gradient-to-br from-cyan-500/20 to-purple-500/20 hover:from-cyan-400/40 hover:to-purple-500/40 transition-all duration-300 group shadow-lg hover:shadow-cyan-500/30`}
                            >
                                <button
                                    onClick={() => onNavigate(tool.value)}
                                    className="w-full h-36 flex flex-col items-center justify-center gap-1 p-4 rounded-md bg-gray-900/70 hover:bg-gray-900/90 backdrop-blur-sm transition-colors duration-300"
                                >
                                    <div className="relative h-20 w-20 flex items-center justify-center">
                                        <svg
                                            className="absolute h-full w-full text-cyan-500/50 dark:text-cyan-400/50 group-hover:text-cyan-400 pulsing-triangle"
                                            viewBox="0 0 100 100"
                                            xmlns="http://www.w3.org/2000/svg"
                                            strokeLinejoin="round"
                                            strokeWidth="3"
                                            stroke="currentColor"
                                            fill="none"
                                        >
                                            <path d="M50 5 L95 85 L5 85 Z" />
                                        </svg>
                                        {isNanoBanana ? (
                                            <span className="relative text-5xl eye-animation" style={{ filter: 'drop-shadow(0 0 8px #facc15)' }}>🍌</span>
                                        ) : (
                                            <i className={`${tool.iconClass} relative text-4xl text-cyan-500 dark:text-cyan-400 eye-animation`}></i>
                                        )}
                                    </div>
                                    <span className="text-sm text-center font-semibold text-gray-300 group-hover:text-white transition-colors duration-300 mt-1">{tool.label}</span>
                                </button>
                            </div>
                        );
                    })}
                 </div>
            </div>

            <GlobalActionsPanel
                onShowFontManager={globalProps.onShowFontManager}
                onImportSettings={globalProps.onImportSettings}
                onExportSettings={globalProps.onExportSettings}
                onStartOver={globalProps.onStartOver}
            />


            <FeaturesSection />
        </div>
    );
};

export default HomePage;