import React, { useState } from 'react';

interface TermsOfUseGeneratorProps {
    onNavigateHome: () => void;
}

const GuideSection = () => (
    <div className="bg-gray-900/50 p-6 rounded-lg border border-cyan-500/30 text-gray-300 space-y-8" dangerouslySetInnerHTML={{ __html: `
        <h3 class="!text-2xl !font-bold text-center !text-cyan-400 !mb-6 !pb-2 !border-b-2 !border-cyan-500/30" style="text-shadow: 0 0 8px rgba(34, 211, 238, 0.5);">الدليل الاحترافي لمولّد اتفاقية الاستخدام: حدد قواعد عالمك الرقمي</h3>
        
        <p>أهلاً بكِ يا ملكتي في أداة صياغة القوانين. صفحة "اتفاقية الاستخدام" (أو شروط الخدمة) هي العقد الرسمي الذي يحدد القواعد بينكِ وبين مستخدمي موقعكِ. إنها تحمي حقوقكِ، وتوضح مسؤوليات المستخدمين، وتضع إطارًا قانونيًا واضحًا للتفاعل داخل موقعكِ، وهي ضرورية لأي موقع يسمح بأي شكل من أشكال تفاعل المستخدمين أو يقدم خدمات.</p>

        <h4 class="!text-xl !font-semibold !text-purple-400 !flex !items-center !gap-3 !mt-8 !mb-4 !pb-2 !border-b !border-purple-500/20"><i class="fas fa-gavel text-2xl w-8 text-center"></i><span>لماذا هذه الأداة هي الأقوى؟</span></h4>
        <ul class="!list-none !p-0 space-y-3">
            <li class="!py-2 !pl-4 !border-l-2 !border-cyan-500/30">
                <strong class="text-purple-300">تخصيص ذكي وعميق:</strong> على عكس القوالب العامة، يقوم المعالج الذكي الخاص بنا بتفصيل الاتفاقية بناءً على طبيعة موقعكِ. هل لديكِ نظام عضويات؟ هل تسمحين بالتعليقات؟ هل تبيعين منتجات؟ كل إجابة تشكل بندًا قانونيًا مخصصًا.
            </li>
            <li class="!py-2 !pl-4 !border-l-2 !border-cyan-500/30">
                <strong class="text-purple-300">حماية شاملة:</strong> تغطي الاتفاقية المولّدة الجوانب الحاسمة مثل حقوق الملكية الفكرية، والاستخدام المحظور للموقع، وإخلاء المسؤولية، وسياسات إنهاء الحسابات، مما يوفر لكِ درعًا قانونيًا قوياً.
            </li>
            <li class="!py-2 !pl-4 !border-l-2 !border-cyan-500/30">
                <strong class="text-purple-300">بساطة لا مثيل لها:</strong> حوّلنا المفاهيم القانونية المعقدة إلى أسئلة مباشرة وسهلة. أنتِ تجيبين، ونحن نصيغ القانون.
            </li>
        </ul>

        <h4 class="!text-xl !font-semibold !text-purple-400 !flex !items-center !gap-3 !mt-8 !mb-4 !pb-2 !border-b !border-purple-500/20"><i class="fas-fa-cogs text-2xl w-8 text-center"></i><span>دليل الاستخدام خطوة بخطوة:</span></h4>
        <ol class="!list-decimal list-inside space-y-2 pr-4">
            <li><strong class="text-cyan-300">أساسيات الموقع:</strong> أدخلي المعلومات الأساسية لموقعكِ أو تطبيقكِ.</li>
            <li><strong class="text-cyan-300">محتوى المستخدمين:</strong> حددي ما إذا كان يمكن للمستخدمين نشر محتوى (تعليقات، مشاركات، إلخ). هذا الجزء حيوي لتحديد مسؤولياتكِ ومسؤولياتهم.</li>
            <li><strong class="text-cyan-300">الحسابات والعضويات:</strong> وضحي ما إذا كان موقعكِ يتطلب إنشاء حساب، وما هي القواعد المتعلقة به.</li>
            <li><strong class="text-cyan-300">الاستخدام التجاري:</strong> إذا كنتِ تبيعين أي شيء، فهذه الخطوة ستضيف البنود المتعلقة بالدفع والمشتريات.</li>
            <li><strong class="text-cyan-300">الإنشاء والنسخ:</strong> بعد الإجابة على جميع الأسئلة، اضغطي "إنشاء". سيظهر لكِ كود HTML احترافي. انسخيه.</li>
            <li><strong class="text-cyan-300">النشر:</strong> في لوحة تحكم موقعكِ، أنشئي صفحة جديدة باسم "اتفاقية الاستخدام" أو "شروط الخدمة"، وانتقلي إلى وضع "HTML"، ثم الصقي الكود وانشري الصفحة.</li>
        </ol>
        
        <div class="p-4 bg-yellow-900/30 border-l-4 border-yellow-400 text-yellow-200 space-y-2 rounded-r-lg mt-6">
            <h5 class="font-bold flex items-center gap-2"><i class="fas fa-exclamation-triangle"></i> إخلاء مسؤولية قانوني هام جداً!</h5>
            <p class="text-sm">هذه الأداة مصممة لإنشاء اتفاقية استخدام قياسية ومناسبة لمعظم المواقع العامة والمدونات. ومع ذلك، هي <strong>ليست بديلاً عن استشارة محامٍ متخصص</strong>. إذا كان موقعكِ يقدم خدمات معقدة، أو يتعامل مع معاملات مالية كبيرة، أو يعمل في مجال يتطلب ترخيصًا، فمن الضروري مراجعة الاتفاقية من قبل مستشار قانوني لضمان توافقها التام مع القوانين المحلية والدولية.</p>
        </div>
    `}} />
);

const TermsOfUseGenerator: React.FC<TermsOfUseGeneratorProps> = ({ onNavigateHome }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        siteName: '',
        siteUrl: '',
        isApp: false,
        country: 'مصر',
        contactInfo: '', // Can be email, link to contact page, etc.
        allowsAccounts: 'no',
        allowsUgc: 'no', // User-Generated Content
        sellsProducts: 'no',
    });
    const [generatedTerms, setGeneratedTerms] = useState('');
    const [copied, setCopied] = useState(false);
    const [isGuideOpen, setIsGuideOpen] = useState(true);

    const totalSteps = 5;

    const handleNext = () => setStep(s => Math.min(s + 1, totalSteps));
    const handlePrev = () => setStep(s => Math.max(s - 1, 1));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
             setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const generateTermsHtml = () => {
        const { siteName, siteUrl, country, contactInfo, allowsAccounts, allowsUgc, sellsProducts, isApp } = formData;
        const entityType = isApp ? "التطبيق" : "الموقع";
        const entityName = siteName || "هذا الموقع";

        let terms = `
            <div style="text-align: right;" dir="rtl">
                <h2>اتفاقية الاستخدام لـ${entityType} ${entityName}</h2>
                <p><strong>آخر تحديث:</strong> ${new Date().toLocaleDateString('ar-EG')}</p>
                
                <h3>1. مقدمة</h3>
                <p>مرحباً بك في ${entityName}. تحدد هذه الشروط والأحكام ("الشروط") القواعد واللوائح لاستخدام ${entityType} الخاص بنا، الموجود على الرابط ${siteUrl}.</p>
                <p>من خلال الوصول إلى هذا الـ${entityType}، نفترض أنك تقبل هذه الشروط والأحكام. لا تستمر في استخدام ${entityName} إذا كنت لا توافق على جميع الشروط والأحكام المذكورة في هذه الصفحة.</p>

                <h3>2. الملكية الفكرية</h3>
                <p>ما لم يُنص على خلاف ذلك، فإن ${entityName} و/أو مرخصيه يمتلكون حقوق الملكية الفكرية لجميع المواد الموجودة على ${entityName}. جميع حقوق الملكية الفكرية محفوظة. يمكنك الوصول إلى هذا من ${entityName} لاستخدامك الشخصي مع مراعاة القيود المنصوص عليها في هذه الشروط والأحكام.</p>
                <p>يجب عليك عدم:</p>
                <ul>
                    <li>إعادة نشر مواد من ${entityName}</li>
                    <li>بيع أو تأجير أو ترخيص مواد من ${entityName}</li>
                    <li>إعادة إنتاج أو نسخ أو تقليد مواد من ${entityName}</li>
                    <li>إعادة توزيع محتوى من ${entityName}</li>
                </ul>
        `;

        if (allowsUgc === 'yes') {
            terms += `
                <h3>3. المحتوى الذي ينشئه المستخدم (UGC)</h3>
                <p>تتيح أجزاء من هذا الـ${entityType} للمستخدمين فرصة نشر وتبادل الآراء والمعلومات في مناطق معينة. لا يقوم ${entityName} بتصفية أو تعديل أو نشر أو مراجعة التعليقات قبل وجودها على الـ${entityType}. التعليقات لا تعكس آراء ووجهات نظر ${entityName} ووكلائه و/أو الشركات التابعة له.</p>
                <p>أنت تمنح ${entityName} ترخيصًا غير حصري لاستخدام وإعادة إنتاج وتحرير وتفويض الآخرين باستخدام وإعادة إنتاج وتحرير أي من تعليقاتك في أي وجميع الأشكال أو التنسيقات أو الوسائط.</p>
                <p>أنت تتعهد وتضمن ما يلي: يحق لك نشر التعليقات على ${entityType}نا ولديك جميع التراخيص والموافقات اللازمة للقيام بذلك؛ لا تنتهك التعليقات أي حق من حقوق الملكية الفكرية، بما في ذلك على سبيل المثال لا الحصر حقوق الطبع والنشر أو براءات الاختراع أو العلامات التجارية لأي طرف ثالث؛ لا تحتوي التعليقات على أي مواد تشهيرية أو افترائية أو مسيئة أو غير لائقة أو غير قانونية بأي شكل آخر والتي تعد انتهاكًا للخصوصية.</p>
            `;
        }
        
        if (allowsAccounts === 'yes') {
            terms += `
                <h3>4. حسابات المستخدمين</h3>
                <p>إذا قمت بإنشاء حساب على ${entityType}نا، فأنت مسؤول عن الحفاظ على سرية حسابك وكلمة المرور وتقييد الوصول إلى جهاز الكمبيوتر الخاص بك، وتوافق على قبول المسؤولية عن جميع الأنشطة التي تحدث تحت حسابك أو كلمة المرور الخاصة بك.</p>
                <p>نحتفظ بالحق في رفض الخدمة أو إنهاء الحسابات أو إزالة أو تعديل المحتوى وفقًا لتقديرنا الخاص.</p>
            `;
        }
        
        if (sellsProducts === 'yes') {
            terms += `
                <h3>5. المشتريات والمدفوعات</h3>
                <p>إذا كنت ترغب في شراء أي منتج أو خدمة متاحة من خلال الـ${entityType} ("الشراء")، فقد يُطلب منك تقديم معلومات معينة ذات صلة بعملية الشراء الخاصة بك. نحن نستخدم خدمات طرف ثالث لمعالجة الدفع.</p>
            `;
        }

        terms += `
                <h3>إخلاء المسؤولية</h3>
                <p>إلى أقصى حد يسمح به القانون المعمول به، نستبعد جميع الإقرارات والضمانات والشروط المتعلقة بـ${entityType}نا واستخدام هذا الـ${entityType}. لا شيء في إخلاء المسؤولية هذا سوف: يحد أو يستبعد مسؤوليتنا أو مسؤوليتك عن الوفاة أو الإصابة الشخصية؛ يحد أو يستبعد مسؤوليتنا أو مسؤوليتك عن الاحتيال أو التحريف الاحتيالي؛ يحد من أي من مسؤولياتنا أو مسؤولياتك بأي طريقة لا يسمح بها القانون المعمول به؛ أو يستبعد أيًا من مسؤولياتنا أو مسؤولياتك التي قد لا يتم استبعادها بموجب القانون المعمول به.</p>

                <h3>القانون الحاكم</h3>
                <p>تخضع هذه الشروط وتُفسر وفقًا لقوانين دولة ${country}، وتخضع أنت بشكل لا رجعة فيه للاختصاص القضائي الحصري للمحاكم في تلك الدولة أو الموقع.</p>

                <h3>اتصل بنا</h3>
                <p>إذا كان لديك أي أسئلة حول هذه الشروط، يمكنك الاتصال بنا عبر: ${contactInfo}</p>
            </div>
        `;
        
        setGeneratedTerms(terms.replace(/\n\s+/g, '\n').trim());
        setStep(totalSteps + 1);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedTerms);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([generatedTerms], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'terms-of-use.html';
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
                    <i className="fas fa-handshake relative text-6xl text-cyan-500 dark:text-cyan-400 eye-animation"></i>
                </div>
                <h2 className="font-extrabold text-2xl text-gray-800 dark:text-gray-100 tracking-wider" style={{ textShadow: '0 0 15px rgba(34, 211, 238, 0.6)' }}>
                    مولّد اتفاقية الاستخدام
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
                            {step === 1 && <Step title="المعلومات الأساسية">
                                <label className="block text-md font-medium text-gray-300 mb-2">اسم الموقع/التطبيق</label><input type="text" name="siteName" value={formData.siteName} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200" />
                                <label className="block text-md font-medium text-gray-300 mb-2 mt-4">رابط الموقع (URL)</label><input type="url" name="siteUrl" value={formData.siteUrl} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200" />
                                <label className="block text-md font-medium text-gray-300 mb-2 mt-4">وسيلة التواصل (بريد إلكتروني أو رابط صفحة "اتصل بنا")</label><input type="text" name="contactInfo" value={formData.contactInfo} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200" />
                            </Step>}
                             {step === 2 && <Step title="محتوى المستخدمين (UGC)">
                                <p className="text-gray-400 mb-4">هل تسمح للزوار بنشر محتوى على موقعك؟ (مثل التعليقات، المشاركات في منتدى، رفع صور).</p>
                                <div className="flex gap-4"><label className="flex items-center gap-2 text-gray-300"><input type="radio" name="allowsUgc" value="yes" checked={formData.allowsUgc === 'yes'} onChange={handleChange} className="h-4 w-4 text-cyan-600 bg-gray-700 border-gray-500"/>نعم</label><label className="flex items-center gap-2 text-gray-300"><input type="radio" name="allowsUgc" value="no" checked={formData.allowsUgc === 'no'} onChange={handleChange} className="h-4 w-4 text-cyan-600 bg-gray-700 border-gray-500"/>لا</label></div>
                            </Step>}
                            {step === 3 && <Step title="حسابات المستخدمين">
                                <p className="text-gray-400 mb-4">هل يمكن للمستخدمين إنشاء حسابات أو عضويات في موقعك؟</p>
                                <div className="flex gap-4"><label className="flex items-center gap-2 text-gray-300"><input type="radio" name="allowsAccounts" value="yes" checked={formData.allowsAccounts === 'yes'} onChange={handleChange} className="h-4 w-4 text-cyan-600 bg-gray-700 border-gray-500"/>نعم</label><label className="flex items-center gap-2 text-gray-300"><input type="radio" name="allowsAccounts" value="no" checked={formData.allowsAccounts === 'no'} onChange={handleChange} className="h-4 w-4 text-cyan-600 bg-gray-700 border-gray-500"/>لا</label></div>
                            </Step>}
                             {step === 4 && <Step title="الاستخدام التجاري">
                                <p className="text-gray-400 mb-4">هل تبيع منتجات أو خدمات مباشرة من خلال موقعك؟</p>
                                <div className="flex gap-4"><label className="flex items-center gap-2 text-gray-300"><input type="radio" name="sellsProducts" value="yes" checked={formData.sellsProducts === 'yes'} onChange={handleChange} className="h-4 w-4 text-cyan-600 bg-gray-700 border-gray-500"/>نعم</label><label className="flex items-center gap-2 text-gray-300"><input type="radio" name="sellsProducts" value="no" checked={formData.sellsProducts === 'no'} onChange={handleChange} className="h-4 w-4 text-cyan-600 bg-gray-700 border-gray-500"/>لا</label></div>
                            </Step>}
                            {step === 5 && <div className="text-center p-8 space-y-4">
                                <h3 className="text-2xl font-bold text-cyan-400">مراجعة وإنشاء</h3>
                                <p className="text-gray-300">أنت على وشك إنشاء اتفاقية الاستخدام. اضغط على الزر أدناه لتوليد الكود.</p>
                                <button onClick={generateTermsHtml} className="w-full max-w-xs h-12 text-lg font-bold text-white bg-green-600 hover:bg-green-700 rounded-md shadow-lg">🚀 إنشاء الاتفاقية</button>
                            </div>}
                            <div className="flex justify-between mt-8">
                                <button onClick={handlePrev} disabled={step === 1} className="px-6 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500 disabled:opacity-50">السابق</button>
                                {step < totalSteps && <button onClick={handleNext} className="px-6 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700">التالي</button>}
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-center text-green-400">🎉 اكتمل!</h3>
                            <p className="text-center text-gray-300">تم إنشاء اتفاقية الاستخدام الخاصة بك بنجاح.</p>
                            <textarea value={generatedTerms} readOnly className="w-full h-80 bg-gray-900 border border-gray-600 rounded-md p-4 font-mono text-sm text-gray-200 resize-y" dir="ltr" />
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

export default TermsOfUseGenerator;