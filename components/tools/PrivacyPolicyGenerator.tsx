import React, { useState } from 'react';

interface PrivacyPolicyGeneratorProps {
    onNavigateHome: () => void;
}

const GuideSection = () => (
    <div className="bg-gray-900/50 p-6 rounded-lg border border-cyan-500/30 text-gray-300 space-y-8" dangerouslySetInnerHTML={{ __html: `
        <h3 class="!text-2xl !font-bold text-center !text-cyan-400 !mb-6 !pb-2 !border-b-2 !border-cyan-500/30" style="text-shadow: 0 0 8px rgba(34, 211, 238, 0.5);">الدليل الشامل لمولّد سياسة الخصوصية: درعك القانوني الرقمي</h3>
        
        <p>مرحباً بكِ في أداة بناء الثقة والاحترافية. صفحة سياسة الخصوصية ليست مجرد صفحة قانونية مملة، بل هي عقد بينك وبين زوارك، وركيزة أساسية لقبول موقعك في شبكات إعلانية مرموقة مثل Google AdSense، والامتثال للقوانين العالمية مثل GDPR.</p>

        <h4 class="!text-xl !font-semibold !text-purple-400 !flex !items-center !gap-3 !mt-8 !mb-4 !pb-2 !border-b !border-purple-500/20"><i class="fas fa-star text-2xl w-8 text-center"></i><span>لماذا هذا المولّد هو الأفضل؟</span></h4>
        <ul class="!list-none !p-0 space-y-3">
            <li class="!py-2 !pl-4 !border-l-2 !border-cyan-500/30">
                <strong class="text-purple-300">نظام المعالج الذكي (Wizard):</strong> وداعاً للقوالب الجاهزة! أداتنا تطرح عليكِ أسئلة دقيقة حول طبيعة موقعكِ، لتفصيل سياسة خصوصية تناسب احتياجاتكِ الفعلية.
            </li>
            <li class="!py-2 !pl-4 !border-l-2 !border-cyan-500/30">
                <strong class="text-purple-300">تغطية شاملة:</strong> السياسة التي يتم إنشاؤها تغطي النقاط الأساسية التي تتطلبها Google AdSense، و Google Analytics، وقوانين الخصوصية، مما يوفر لكِ الحماية والثقة.
            </li>
            <li class="!py-2 !pl-4 !border-l-2 !border-cyan-500/30">
                <strong class="text-purple-300">سهولة فائقة:</strong> بدلاً من الغوص في المصطلحات القانونية المعقدة، كل ما عليكِ هو الإجابة على بضعة أسئلة بسيطة، والأداة ستقوم بالباقي.
            </li>
        </ul>

        <h4 class="!text-xl !font-semibold !text-purple-400 !flex !items-center !gap-3 !mt-8 !mb-4 !pb-2 !border-b !border-purple-500/20"><i class="fas fa-cogs text-2xl w-8 text-center"></i><span>دليل الاستخدام خطوة بخطوة:</span></h4>
        <ol class="!list-decimal list-inside space-y-2 pr-4">
            <li><strong class="text-cyan-300">المعلومات الأساسية:</strong> ابدئي بإدخال اسم ورابط موقعكِ وبريدكِ الإلكتروني للتواصل.</li>
            <li><strong class="text-cyan-300">جمع البيانات:</strong> كوني صريحة. هل تجمعين أي بيانات من زواركِ؟ حددي أنواعها بدقة.</li>
            <li><strong class="text-cyan-300">الكوكيز والإعلانات:</strong> حددي ما إذا كنتِ تستخدمين ملفات تعريف الارتباط أو تعرضين إعلانات (خاصة AdSense).</li>
            <li><strong class="text-cyan-300">التحليلات والروابط:</strong> وضحي ما إذا كنتِ تستخدمين أدوات تحليل مثل Google Analytics، أو تضعين روابط لمواقع أخرى.</li>
            <li><strong class="text-cyan-300">الإنشاء والنسخ:</strong> بعد الإجابة على جميع الأسئلة، اضغطي على زر "إنشاء". سيظهر لكِ كود HTML كامل. انسخيه.</li>
            <li><strong class="text-cyan-300">النشر:</strong> اذهبي إلى لوحة تحكم موقعكِ (بلوجر، ووردبريس، إلخ)، أنشئي صفحة جديدة باسم "سياسة الخصوصية"، وبدلاً من المحرر العادي، انتقلي إلى وضع "HTML" والصقي الكود. ثم انشري الصفحة.</li>
        </ol>
        
        <div class="p-4 bg-yellow-900/30 border-l-4 border-yellow-400 text-yellow-200 space-y-2 rounded-r-lg mt-6">
            <h5 class="font-bold flex items-center gap-2"><i class="fas fa-exclamation-triangle"></i> إخلاء مسؤولية قانوني هام جداً!</h5>
            <p class="text-sm">هذه الأداة مصممة لتقديم المساعدة وإنشاء سياسة خصوصية قياسية للمواقع والتطبيقات البسيطة. إنها <strong>ليست بديلاً عن الاستشارة القانونية المتخصصة</strong>. إذا كان موقعكِ يجمع بيانات حساسة أو يعمل في صناعة منظمة، فمن الضروري استشارة محامٍ لضمان الامتثال الكامل للقوانين في بلدك.</p>
        </div>
    `}} />
);


const PrivacyPolicyGenerator: React.FC<PrivacyPolicyGeneratorProps> = ({ onNavigateHome }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        siteName: '',
        siteUrl: '',
        isApp: false,
        country: 'مصر',
        contactEmail: '',
        collectsData: 'no',
        dataTypes: { name: false, email: false, phone: false, address: false },
        usesCookies: 'no',
        showsAds: 'no',
        adServices: { adsense: false, other: false },
        usesAnalytics: 'no',
        analyticsServices: { google: false, other: false },
        hasLinks: 'no',
    });
    const [generatedPolicy, setGeneratedPolicy] = useState('');
    const [copied, setCopied] = useState(false);
    const [isGuideOpen, setIsGuideOpen] = useState(true);

    const totalSteps = 5;

    const handleNext = () => setStep(s => Math.min(s + 1, totalSteps));
    const handlePrev = () => setStep(s => Math.max(s - 1, 1));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked, dataset } = e.target as HTMLInputElement;
            const category = dataset.category as 'dataTypes' | 'adServices' | 'analyticsServices';
            if (category) {
                setFormData(prev => ({
                    ...prev,
                    [category]: {
                        ...prev[category],
                        [name]: checked,
                    }
                }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const generatePolicyHtml = () => {
        const { siteName, siteUrl, country, contactEmail, collectsData, dataTypes, usesCookies, showsAds, adServices, usesAnalytics, analyticsServices, hasLinks, isApp } = formData;
        const entityType = isApp ? "تطبيق" : "موقع";

        let policy = `
            <div style="text-align: right;" dir="rtl">
                <h2>سياسة الخصوصية لـ${entityType} ${siteName}</h2>
                <p><strong>آخر تحديث:</strong> ${new Date().toLocaleDateString('ar-EG')}</p>
                
                <h3>مقدمة</h3>
                <p>مرحباً بك في ${siteName} (${siteUrl}). نحن نأخذ خصوصية زوارنا ومستخدمينا على محمل الجد. توضح سياسة الخصوصية هذه أنواع المعلومات التي نجمعها وكيفية استخدامنا وحمايتنا لها. باستخدامك لـ${entityType}نا، فإنك توافق على جمع واستخدام المعلومات وفقًا لهذه السياسة.</p>
        `;

        if (collectsData === 'yes') {
            const collected = Object.entries(dataTypes).filter(([, val]) => val).map(([key]) => {
                if(key === 'name') return 'الاسم';
                if(key === 'email') return 'البريد الإلكتروني';
                if(key === 'phone') return 'رقم الهاتف';
                if(key === 'address') return 'العنوان';
                return '';
            }).filter(Boolean).join('، ');

            policy += `
                <h3>المعلومات التي نجمعها</h3>
                <p>قد نطلب منك تزويدنا بمعلومات شخصية معينة يمكن استخدامها للاتصال بك أو تحديد هويتك. تشمل هذه المعلومات، على سبيل المثال لا الحصر:</p>
                <ul>
                    ${collected ? `<li>${collected}</li>` : ''}
                    <li>بيانات الاستخدام (مثل عنوان IP، نوع المتصفح، الصفحات التي تمت زيارتها).</li>
                </ul>
            `;
        }

        if (usesCookies === 'yes') {
            policy += `
                <h3>ملفات تعريف الارتباط (Cookies)</h3>
                <p>نحن نستخدم ملفات تعريف الارتباط وتقنيات تتبع مشابهة لتتبع النشاط على ${entityType}نا والاحتفاظ بمعلومات معينة. ملفات تعريف الارتباط هي ملفات تحتوي على كمية صغيرة من البيانات التي قد تتضمن معرفًا فريدًا مجهول الهوية. يمكنك توجيه متصفحك لرفض جميع ملفات تعريف الارتباط أو للإشارة عند إرسال ملف تعريف ارتباط.</p>
            `;
        }

        if (showsAds === 'yes') {
            policy += '<h3>الإعلانات</h3>';
            if (adServices.adsense) {
                policy += `
                    <p>قد نعرض إعلانات من خلال شبكة Google AdSense الإعلانية. تستخدم Google ملفات تعريف الارتباط لعرض الإعلانات بناءً على زيارات المستخدم السابقة لـ${entityType}نا أو لمواقع أخرى على الإنترنت. يمكن للمستخدمين تعطيل استخدام الإعلانات المخصصة عن طريق زيارة <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">إعدادات الإعلانات</a>.</p>
                `;
            }
             if (adServices.other) {
                policy += `<p>قد نستخدم شركات إعلانية أخرى كطرف ثالث لعرض الإعلانات، وقد تستخدم هذه الشركات معلومات حول زياراتك لهذا الـ${entityType} والمواقع الأخرى (باستثناء الاسم أو العنوان أو عنوان البريد الإلكتروني أو رقم الهاتف) من أجل تقديم إعلانات حول البضائع والخدمات التي تهمك.</p>`;
            }
        }
        
         if (usesAnalytics === 'yes') {
            policy += '<h3>تحليلات البيانات</h3>';
            if (analyticsServices.google) {
                policy += `<p>نحن نستخدم Google Analytics لتتبع وتحليل حركة المرور على الويب. تشارك Google هذه البيانات مع خدمات Google الأخرى. قد تستخدم Google البيانات التي تم جمعها لوضع الإعلانات ضمن شبكتها الإعلانية وتخصيصها. يمكنك تعطيل جعل نشاطك على الخدمة متاحًا لـ Google Analytics عن طريق تثبيت إضافة المتصفح لتعطيل التتبع.</p>`;
            }
             if (analyticsServices.other) {
                policy += `<p>قد نستخدم أيضًا خدمات تحليل بيانات أخرى لمراقبة وتحليل استخدام ${entityType}نا.</p>`;
            }
        }
        
        if (hasLinks === 'yes') {
            policy += `
                <h3>روابط لمواقع أخرى</h3>
                <p>قد يحتوي ${entityType}نا على روابط لمواقع أخرى لا يتم تشغيلها من قبلنا. إذا نقرت على رابط لطرف ثالث، سيتم توجيهك إلى موقع ذلك الطرف الثالث. ننصحك بشدة بمراجعة سياسة الخصوصية لكل موقع تزوره.</p>
            `;
        }

        policy += `
            <h3>أمن البيانات</h3>
            <p>أمن بياناتك مهم بالنسبة لنا، ولكن تذكر أنه لا توجد طريقة نقل عبر الإنترنت أو طريقة تخزين إلكتروني آمنة بنسبة 100%. بينما نسعى جاهدين لاستخدام وسائل مقبولة تجاريًا لحماية معلوماتك الشخصية، لا يمكننا ضمان أمنها المطلق.</p>
            
            <h3>التغييرات على سياسة الخصوصية</h3>
            <p>قد نقوم بتحديث سياسة الخصوصية الخاصة بنا من وقت لآخر. سنقوم بإعلامك بأي تغييرات عن طريق نشر سياسة الخصوصية الجديدة على هذه الصفحة.</p>

            <h3>اتصل بنا</h3>
            <p>إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يمكنك الاتصال بنا عبر البريد الإلكتروني: <a href="mailto:${contactEmail}">${contactEmail}</a></p>
            </div>
        `;

        setGeneratedPolicy(policy.replace(/\\n\\s+/g, '\\n').trim());
        setStep(totalSteps + 1);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedPolicy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([generatedPolicy], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'privacy-policy.html';
        link.click();
        URL.revokeObjectURL(url);
    };

    const renderStep = () => {
        switch (step) {
            case 1: return <Step title="المعلومات الأساسية" fields={[
                { name: 'siteName', label: 'اسم الموقع/التطبيق', type: 'text' },
                { name: 'siteUrl', label: 'رابط الموقع (URL)', type: 'url' },
                { name: 'contactEmail', label: 'البريد الإلكتروني للتواصل', type: 'email' },
                { name: 'isApp', label: 'هل هو تطبيق جوال؟', type: 'checkboxSimple' }
            ]} />;
            case 2: return <Step title="جمع البيانات" fields={[
                { name: 'collectsData', label: 'هل تجمع أي بيانات شخصية من المستخدمين (مثل نماذج الاتصال، التسجيل)؟', type: 'radio', options: [{label: 'نعم', value: 'yes'}, {label: 'لا', value: 'no'}] },
                ...(formData.collectsData === 'yes' ? [{ name: 'dataTypes', label: 'ما هي أنواع البيانات التي تجمعها؟', type: 'checkboxGroup', category: 'dataTypes', options: [{name: 'name', label: 'الاسم'}, {name: 'email', label: 'البريد الإلكتروني'}, {name: 'phone', label: 'رقم الهاتف'}, {name: 'address', label: 'العنوان'}] }] : [])
            ]} />;
            case 3: return <Step title="ملفات تعريف الارتباط والإعلانات" fields={[
                { name: 'usesCookies', label: 'هل تستخدم ملفات تعريف الارتباط (Cookies)؟', type: 'radio', options: [{label: 'نعم', value: 'yes'}, {label: 'لا', value: 'no'}] },
                { name: 'showsAds', label: 'هل تعرض إعلانات على موقعك؟', type: 'radio', options: [{label: 'نعم', value: 'yes'}, {label: 'لا', value: 'no'}] },
                ...(formData.showsAds === 'yes' ? [{ name: 'adServices', label: 'ما هي شبكات الإعلانات التي تستخدمها؟', type: 'checkboxGroup', category: 'adServices', options: [{name: 'adsense', label: 'Google AdSense'}, {name: 'other', label: 'شبكات أخرى'}] }] : [])
            ]} />;
            case 4: return <Step title="التحليلات والروابط الخارجية" fields={[
                { name: 'usesAnalytics', label: 'هل تستخدم خدمات تحليلات (مثل Google Analytics)؟', type: 'radio', options: [{label: 'نعم', value: 'yes'}, {label: 'لا', value: 'no'}] },
                 ...(formData.usesAnalytics === 'yes' ? [{ name: 'analyticsServices', label: 'ما هي خدمات التحليل التي تستخدمها؟', type: 'checkboxGroup', category: 'analyticsServices', options: [{name: 'google', label: 'Google Analytics'}, {name: 'other', label: 'خدمات أخرى'}] }] : []),
                { name: 'hasLinks', label: 'هل يحتوي موقعك على روابط لمواقع خارجية؟', type: 'radio', options: [{label: 'نعم', value: 'yes'}, {label: 'لا', value: 'no'}] }
            ]} />;
            case 5: return <div className="text-center p-8 space-y-4">
                <h3 className="text-2xl font-bold text-cyan-400">مراجعة وإنشاء</h3>
                <p className="text-gray-300">لقد أكملت جميع الخطوات. هل أنت جاهز لإنشاء سياسة الخصوصية الخاصة بك؟</p>
                <button onClick={generatePolicyHtml} className="w-full max-w-xs h-12 text-lg font-bold text-white bg-green-600 hover:bg-green-700 rounded-md shadow-lg">
                    🚀 إنشاء الآن
                </button>
            </div>;
            default: return null;
        }
    };

    const Step: React.FC<{ title: string, fields: any[] }> = ({ title, fields }) => (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-center text-cyan-400">{title}</h3>
            {fields.map(field => (
                <div key={field.name}>
                    <label className="block text-md font-medium text-gray-300 mb-2">{field.label}</label>
                    {field.type === 'text' || field.type === 'url' || field.type === 'email' ? <input type={field.type} name={field.name} value={formData[field.name as keyof typeof formData] as string} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200" /> : null}
                    {field.type === 'checkboxSimple' ? <label className="flex items-center gap-2"><input type="checkbox" name={field.name} checked={formData[field.name as keyof typeof formData] as boolean} onChange={e => setFormData(prev => ({ ...prev, [field.name]: e.target.checked }))} className="h-5 w-5 rounded text-cyan-500 bg-gray-700 border-gray-500" /><span>نعم</span></label> : null}
                    {field.type === 'radio' && <div className="flex gap-4">{field.options.map((opt: any) => <label key={opt.value} className="flex items-center gap-2 text-gray-300"><input type="radio" name={field.name} value={opt.value} checked={formData[field.name as keyof typeof formData] === opt.value} onChange={handleChange} className="h-4 w-4 text-cyan-600 bg-gray-700 border-gray-500 focus:ring-cyan-500"/>{opt.label}</label>)}</div>}
                    {field.type === 'checkboxGroup' && <div className="space-y-2">{field.options.map((opt: any) => <label key={opt.name} className="flex items-center gap-2 text-gray-300"><input type="checkbox" name={opt.name} data-category={field.category} checked={formData[field.category as keyof typeof formData][opt.name as keyof typeof formData.dataTypes]} onChange={handleChange} className="h-4 w-4 rounded text-cyan-600 bg-gray-700 border-gray-500 focus:ring-cyan-500"/>{opt.label}</label>)}</div>}
                </div>
            ))}
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
                    <i className="fas fa-user-shield relative text-6xl text-cyan-500 dark:text-cyan-400 eye-animation"></i>
                </div>
                <h2 className="font-extrabold text-2xl text-gray-800 dark:text-gray-100 tracking-wider" style={{ textShadow: '0 0 15px rgba(34, 211, 238, 0.6)' }}>
                    مولّد سياسة الخصوصية
                </h2>
            </div>
            
            <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <button 
                        onClick={() => setIsGuideOpen(!isGuideOpen)}
                        className="w-full flex justify-between items-center p-4 text-left"
                        aria-expanded={isGuideOpen}
                    >
                        <h3 className="text-lg font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-3">
                            <i className="fas fa-book-open"></i>
                            الدليل الشامل لاستخدام الأداة
                        </h3>
                         <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-gray-500 dark:text-gray-400 transform transition-transform duration-300 ${isGuideOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {isGuideOpen && <GuideSection />}
                </div>

                <div className="bg-gray-800/50 p-8 rounded-lg border border-gray-700">
                    {step <= totalSteps ? (
                        <>
                            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-8">
                                <div className="bg-cyan-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
                            </div>
                            {renderStep()}
                            <div className="flex justify-between mt-8">
                                <button onClick={handlePrev} disabled={step === 1} className="px-6 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500 disabled:opacity-50">السابق</button>
                                {step < totalSteps && <button onClick={handleNext} className="px-6 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700">التالي</button>}
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-center text-green-400">🎉 اكتمل!</h3>
                            <p className="text-center text-gray-300">تم إنشاء سياسة الخصوصية الخاصة بك بنجاح.</p>
                            <textarea value={generatedPolicy} readOnly className="w-full h-80 bg-gray-900 border border-gray-600 rounded-md p-4 font-mono text-sm text-gray-200 resize-y" dir="ltr" />
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

export default PrivacyPolicyGenerator;
