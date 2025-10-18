import React, { useState } from 'react';

interface AboutUsGeneratorProps {
    onNavigateHome: () => void;
}

const GuideSection = () => (
    <div className="bg-gray-900/50 p-6 rounded-lg border border-cyan-500/30 text-gray-300 space-y-8" dangerouslySetInnerHTML={{ __html: `
        <h3 class="!text-2xl !font-bold text-center !text-cyan-400 !mb-6 !pb-2 !border-b-2 !border-cyan-500/30" style="text-shadow: 0 0 8px rgba(34, 211, 238, 0.5);">الدليل الكامل لمولّد صفحة "من نحن": اروِ قصتك وابنِ الثقة</h3>
        
        <p>مرحباً بكِ يا ملكتي في أداة سرد القصص. صفحة "من نحن" هي قلب موقعكِ النابض وروح علامتك التجارية. إنها فرصتكِ لتجاوز مجرد تقديم المحتوى، والتواصل مع جمهوركِ على مستوى إنساني، وبناء علاقة قوية مبنية على الثقة والمصداقية، وهو ما تعشقه محركات البحث مثل جوجل (E-E-A-T).</p>

        <h4 class="!text-xl !font-semibold !text-purple-400 !flex !items-center !gap-3 !mt-8 !mb-4 !pb-2 !border-b !border-purple-500/20"><i class="fas fa-magic text-2xl w-8 text-center"></i><span>لماذا هذه الأداة استثنائية؟</span></h4>
        <ul class="!list-none !p-0 space-y-3">
            <li class="!py-2 !pl-4 !border-l-2 !border-cyan-500/30">
                <strong class="text-purple-300">المعالج السردي الذكي:</strong> بدلاً من سؤالكِ أسئلة جافة، صممنا معالجًا يساعدكِ على استخراج القصة الملهمة وراء موقعكِ. كل سؤال هو خطوة في بناء narrative متكامل ومؤثر.
            </li>
            <li class="!py-2 !pl-4 !border-l-2 !border-cyan-500/30">
                <strong class="text-purple-300">ترسيخ المصداقية (E-A-T):</strong> نركز على الأسئلة التي تبرز خبرتكِ (Expertise)، وموثوقيتكِ (Authoritativeness)، وجدارتكِ بالثقة (Trustworthiness)، وهي العوامل التي تعتمد عليها جوجل لتقييم جودة المواقع.
            </li>
            <li class="!py-2 !pl-4 !border-l-2 !border-cyan-500/30">
                <strong class="text-purple-300">نتيجة احترافية منسقة:</strong> لا نكتفي بتجميع إجاباتكِ، بل نصيغها في قالب HTML احترافي مع عناوين وفقرات منسقة، لتبدو صفحتكِ رائعة وجاهزة للنشر فوراً.
            </li>
        </ul>

        <h4 class="!text-xl !font-semibold !text-purple-400 !flex !items-center !gap-3 !mt-8 !mb-4 !pb-2 !border-b !border-purple-500/20"><i class="fas fa-cogs text-2xl w-8 text-center"></i><span>دليل الاستخدام خطوة بخطوة:</span></h4>
        <ol class="!list-decimal list-inside space-y-2 pr-4">
            <li><strong class="text-cyan-300">المعلومات الأساسية:</strong> ابدئي بالمعلومات الرئيسية لموقعكِ.</li>
            <li><strong class="text-cyan-300">القصة والرسالة:</strong> هذا هو جوهر الصفحة. خذي وقتكِ في الإجابة على الأسئلة المتعلقة برسالتكِ ورؤيتكِ.</li>
            <li><strong class="text-cyan-300">الفريق أو المؤسس:</strong> أبرزي الخبرة البشرية خلف الموقع. هذا هو مفتاح بناء الثقة.</li>
            <li><strong class="text-cyan-300">ما يميزكِ:</strong> وضحي لجمهوركِ لماذا يجب أن يختاروا موقعكِ دوناً عن غيره.</li>
            <li><strong class="text-cyan-300">التواصل:</strong> أضيفي روابط حساباتكِ الاجتماعية لتسهيل تواصل جمهوركِ معكِ.</li>
            <li><strong class="text-cyan-300">الإنشاء والنسخ والنشر:</strong> بعد اكتمال المعالج، اضغطي "إنشاء"، انسخي كود HTML، ثم أنشئي صفحة جديدة في موقعكِ باسم "من نحن"، والصقي الكود في وضع HTML وانشريها.</li>
        </ol>
        
        <div class="p-4 bg-yellow-900/30 border-l-4 border-yellow-400 text-yellow-200 space-y-2 rounded-r-lg mt-6">
            <h5 class="font-bold flex items-center gap-2"><i class="fas fa-lightbulb"></i> نصيحة احترافية!</h5>
            <p class="text-sm">كوني صادقة وحقيقية. أفضل صفحات "من نحن" هي تلك التي تعكس شخصية حقيقية وشغفًا بالموضوع. لا تخافي من مشاركة قصتكِ، فهذا ما يصنع الفارق.</p>
        </div>
    `}} />
);

const AboutUsGenerator: React.FC<AboutUsGeneratorProps> = ({ onNavigateHome }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        siteName: '',
        siteNiche: '',
        mission: '',
        story: '',
        founderName: '',
        founderExpertise: '',
        uniqueness: '',
        socialLinks: '',
    });
    const [generatedPage, setGeneratedPage] = useState('');
    const [copied, setCopied] = useState(false);
    const [isGuideOpen, setIsGuideOpen] = useState(true);

    const totalSteps = 5;

    const handleNext = () => setStep(s => Math.min(s + 1, totalSteps));
    const handlePrev = () => setStep(s => Math.max(s - 1, 1));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const generatePageHtml = () => {
        const { siteName, siteNiche, mission, story, founderName, founderExpertise, uniqueness, socialLinks } = formData;
        
        const socialLinksHtml = socialLinks.split('\n').filter(link => link.trim() !== '').map(link => `<li><a href="${link}" target="_blank" rel="noopener noreferrer">${link}</a></li>`).join('');

        let page = `
            <div style="text-align: right;" dir="rtl">
                <h2>من نحن - ${siteName}</h2>
                
                <h3>قصتنا</h3>
                <p>${story.replace(/\n/g, '<br/>')}</p>

                <h3>رسالتنا ورؤيتنا</h3>
                <p>${mission.replace(/\n/g, '<br/>')}</p>

                <h3>ما يميزنا</h3>
                <p>${uniqueness.replace(/\n/g, '<br/>')}</p>
        `;

        if (founderName || founderExpertise) {
            page += `
                <h3>الفريق المؤسس</h3>
                ${founderName ? `<p><strong>${founderName}</strong></p>` : ''}
                ${founderExpertise ? `<p>${founderExpertise.replace(/\n/g, '<br/>')}</p>` : ''}
            `;
        }
        
        if (socialLinksHtml) {
             page += `
                <h3>تواصلوا معنا</h3>
                <p>يمكنكم متابعتنا والتواصل معنا عبر قنواتنا التالية:</p>
                <ul>${socialLinksHtml}</ul>
            `;
        }

        page += `</div>`;
        
        setGeneratedPage(page.replace(/\n\s+/g, '\n').trim());
        setStep(totalSteps + 1);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedPage);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([generatedPage], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'about-us.html';
        link.click();
        URL.revokeObjectURL(url);
    };

    const Step: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-center text-cyan-400">{title}</h3>
            {children}
        </div>
    );
    
    return (
        <>
            <button onClick={onNavigateHome} className="absolute top-24 left-4 sm:left-6 lg:left-8 px-4 py-2 text-sm font-semibold rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors flex items-center gap-2 z-20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                العودة للرئيسية
            </button>
            <div className="flex flex-col items-center gap-4 text-center my-6">
                <div className="relative h-24 w-24 flex items-center justify-center">
                    <svg className="absolute h-full w-full text-cyan-500 dark:text-cyan-400 pulsing-triangle" viewBox="0 0 100 100" stroke="currentColor" fill="none"><path d="M50 5 L95 85 L5 85 Z" /></svg>
                    <i className="fas fa-info-circle relative text-6xl text-cyan-500 dark:text-cyan-400 eye-animation"></i>
                </div>
                <h2 className="font-extrabold text-2xl text-gray-800 dark:text-gray-100 tracking-wider" style={{ textShadow: '0 0 15px rgba(34, 211, 238, 0.6)' }}>
                    مولّد صفحة "من نحن"
                </h2>
            </div>
            
             <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <button onClick={() => setIsGuideOpen(!isGuideOpen)} className="w-full flex justify-between items-center p-4 text-left" aria-expanded={isGuideOpen}>
                        <h3 className="text-lg font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-3"><i className="fas fa-book-open"></i>الدليل الشامل للاستخدام</h3>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-gray-500 dark:text-gray-400 transform transition-transform duration-300 ${isGuideOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {isGuideOpen && <GuideSection />}
                </div>

                <div className="bg-gray-800/50 p-8 rounded-lg border border-gray-700">
                    {step <= totalSteps ? (
                        <>
                            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-8">
                                <div className="bg-cyan-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
                            </div>
                            {step === 1 && <Step title="المعلومات الأساسية"><label className="block text-md font-medium text-gray-300 mb-2">اسم الموقع/التطبيق</label><input type="text" name="siteName" value={formData.siteName} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200" /><label className="block text-md font-medium text-gray-300 mb-2 mt-4">مجال أو موضوع الموقع (مثال: الطبخ، الأخبار التقنية)</label><input type="text" name="siteNiche" value={formData.siteNiche} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200" /></Step>}
                            {step === 2 && <Step title="الرسالة والقصة"><label className="block text-md font-medium text-gray-300 mb-2">ما هي رسالة موقعك؟ ماذا تأمل في تحقيقه؟</label><textarea name="mission" value={formData.mission} onChange={handleChange} rows={4} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200" /><label className="block text-md font-medium text-gray-300 mb-2 mt-4">ما هي القصة وراء إنشاء هذا الموقع؟</label><textarea name="story" value={formData.story} onChange={handleChange} rows={4} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200" /></Step>}
                            {step === 3 && <Step title="الفريق والمؤسس (لتعزيز المصداقية E-A-T)"><label className="block text-md font-medium text-gray-300 mb-2">اسم المؤسس أو الفريق (اختياري)</label><input type="text" name="founderName" value={formData.founderName} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200" /><label className="block text-md font-medium text-gray-300 mb-2 mt-4">صف خبرة المؤسس أو الفريق في هذا المجال</label><textarea name="founderExpertise" value={formData.founderExpertise} onChange={handleChange} rows={4} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200" /></Step>}
                            {step === 4 && <Step title="ما يميز موقعك"><label className="block text-md font-medium text-gray-300 mb-2">بماذا يتميز موقعك عن الآخرين؟ ما هي قيمكم؟</label><textarea name="uniqueness" value={formData.uniqueness} onChange={handleChange} rows={5} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200" /><label className="block text-md font-medium text-gray-300 mb-2 mt-4">روابط التواصل الاجتماعي (كل رابط في سطر)</label><textarea name="socialLinks" value={formData.socialLinks} onChange={handleChange} rows={4} placeholder="https://facebook.com/yourpage&#10;https://twitter.com/yourhandle" className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200" /></Step>}
                            {step === 5 && <div className="text-center p-8 space-y-4"><h3 className="text-2xl font-bold text-cyan-400">جاهز لإنشاء قصتك؟</h3><p className="text-gray-300">لقد قدمت كل المعلومات اللازمة. اضغط أدناه لتوليد صفحة "من نحن" احترافية.</p><button onClick={generatePageHtml} className="w-full max-w-xs h-12 text-lg font-bold text-white bg-green-600 hover:bg-green-700 rounded-md shadow-lg">🚀 إنشاء الصفحة</button></div>}
                            <div className="flex justify-between mt-8">
                                <button onClick={handlePrev} disabled={step === 1} className="px-6 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500 disabled:opacity-50">السابق</button>
                                {step < totalSteps && <button onClick={handleNext} className="px-6 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700">التالي</button>}
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-center text-green-400">🎉 اكتمل!</h3>
                            <p className="text-center text-gray-300">تم إنشاء صفحة "من نحن" بنجاح. يمكنك نسخ الكود أدناه.</p>
                            <textarea value={generatedPage} readOnly className="w-full h-80 bg-gray-900 border border-gray-600 rounded-md p-4 font-mono text-sm text-gray-200 resize-y" dir="ltr" />
                            <div className="flex gap-4">
                                <button onClick={handleCopy} className="flex-1 px-4 py-2 rounded-md bg-cyan-600 text-white hover:bg-cyan-700">{copied ? '✓ تم النسخ' : 'نسخ الكود'}</button>
                                <button onClick={handleDownload} className="flex-1 px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700">تحميل كملف HTML</button>
                                <button onClick={() => setStep(1)} className="flex-1 px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500">البدء من جديد</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AboutUsGenerator;