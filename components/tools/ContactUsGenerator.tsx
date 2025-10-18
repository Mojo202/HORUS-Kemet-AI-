import React, { useState, useEffect } from 'react';

interface ContactUsGeneratorProps {
    onNavigateHome: () => void;
}

const GuideSection = () => (
    <div className="bg-gray-900/50 p-6 rounded-lg border border-cyan-500/30 text-gray-300 space-y-8" dangerouslySetInnerHTML={{ __html: `
        <h3 class="!text-2xl !font-bold text-center !text-cyan-400 !mb-6 !pb-2 !border-b-2 !border-cyan-500/30" style="text-shadow: 0 0 8px rgba(34, 211, 238, 0.5);">دليل مولد صفحة اتصل بنا الاحترافي: ابنِ جسور التواصل مع جمهورك</h3>
        
        <p>مرحباً بكِ في أداة بناء العلاقات. صفحة "اتصل بنا" ليست مجرد نموذج؛ إنها دعوة مفتوحة لجمهوركِ للتواصل، وتقديم الملاحظات، وبناء شراكات. صفحة مصممة جيداً تعكس احترافيتكِ، وتزيد من ثقة المستخدمين، وتفتح أبواباً لفرص قد لا تتوقعينها.</p>
        
        <h4 class="!text-xl !font-semibold !text-purple-400 !flex !items-center !gap-3 !mt-8 !mb-4 !pb-2 !border-b !border-purple-500/20"><i class="fas fa-magic text-2xl w-8 text-center"></i><span>لماذا هذا المولّد فريد من نوعه؟</span></h4>
        <ul class="!list-none !p-0 space-y-3">
            <li class="!py-2 !pl-4 !border-l-2 !border-cyan-500/30">
                <strong class="text-purple-300">معرض الأنماط (Style Gallery):</strong> لم نعد نؤمن بالصفحات المملة. اختاري من بين مجموعة من التصاميم الاحترافية (الأنيق، الزجاجي، الداكن، الكلاسيكي) لتتناسب مع هوية علامتكِ التجارية.
            </li>
            <li class="!py-2 !pl-4 !border-l-2 !border-cyan-500/30">
                <strong class="text-purple-300">تخصيص كامل:</strong> أدخلي معلوماتكِ، حددي ما تريدين عرضه (بريد إلكتروني، هاتف، عنوان)، وأضيفي روابط التواصل الاجتماعي بسهولة.
            </li>
            <li class="!py-2 !pl-4 !border-l-2 !border-cyan-500/30">
                <strong class="text-purple-300">معاينة حية فورية:</strong> شاهدي كيف تبدو صفحتكِ مع كل تغيير تقومين به، مما يمنحكِ السيطرة الكاملة على التصميم النهائي.
            </li>
            <li class="!py-2 !pl-4 !border-l-2 !border-cyan-500/30">
                <strong class="text-purple-300">كود نظيف وجاهز:</strong> ننشئ لكِ ملف HTML كاملاً مع CSS مضمن، جاهز للنسخ واللصق مباشرة في موقعكِ.
            </li>
        </ul>

        <h4 class="!text-xl !font-semibold !text-purple-400 !flex !items-center !gap-3 !mt-8 !mb-4 !pb-2 !border-b !border-purple-500/20"><i class="fas fa-cogs text-2xl w-8 text-center"></i><span>دليل الاستخدام خطوة بخطوة:</span></h4>
        <ol class="!list-decimal list-inside space-y-2 pr-4">
            <li><strong class="text-cyan-300">اختر النمط:</strong> من "معرض الأنماط"، اختاري التصميم الذي يعجبكِ. ستتغير المعاينة فوراً.</li>
            <li><strong class="text-cyan-300">املأ المعلومات:</strong> أدخلي بيانات التواصل التي تريدين عرضها. يمكنكِ ترك أي حقل فارغاً لعدم إظهاره.</li>
            <li><strong class="text-cyan-300">أضف روابطك الاجتماعية:</strong> ضعي روابط حساباتكِ في الصندوق المخصص، كل رابط في سطر. الأداة ذكية كفاية لاختيار الأيقونة المناسبة!</li>
            <li><strong class="text-cyan-300">شاهد المعاينة:</strong> تأكدي من أن كل شيء يبدو مثالياً في نافذة "المعاينة الحية".</li>
            <li><strong class="text-cyan-300">احصل على الكود:</strong> انتقلي إلى تبويب "الحصول على الكود"، ثم اضغطي "نسخ الكود".</li>
            <li><strong class="text-cyan-300">النشر:</strong> اذهبي إلى موقعكِ، أنشئي صفحة جديدة باسم "اتصل بنا"، انتقلي إلى وضع محرر HTML، ثم الصقي الكود وانشري الصفحة.</li>
        </ol>

        <div class="p-4 bg-yellow-900/30 border-l-4 border-yellow-400 text-yellow-200 space-y-2 rounded-r-lg mt-6">
            <h5 class="font-bold flex items-center gap-2"><i class="fas fa-lightbulb"></i> نصيحة احترافية!</h5>
            <p class="text-sm">إذا قمتِ بتضمين نموذج اتصال، فهو مهيأ للعمل مع خدمة <a href="https://formspree.io/" target="_blank" class="text-cyan-400 underline">Formspree</a> المجانية. كل ما عليكِ هو استبدال "YOUR_FORM_ID" في الكود بالمعرّف الخاص بكِ من Formspree لتلقي الرسائل مباشرة على بريدك الإلكتروني.</p>
        </div>
    `}} />
);

const styleTemplates = [
    {
        name: 'الأنيق الحديث',
        previewClass: 'bg-gray-100 text-gray-800 border-2 border-gray-300',
        css: `
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 2rem; background-color: #f8f9fa; color: #212529; }
            .container { max-width: 900px; margin: auto; background: #ffffff; padding: 3rem; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.07); }
            h1 { color: #0d6efd; border-bottom: 3px solid #0d6efd; padding-bottom: 0.5rem; margin-bottom: 1.5rem; font-size: 2.5rem; text-align: center; }
            .intro { text-align: center; margin-bottom: 2.5rem; color: #6c757d; font-size: 1.1rem; line-height: 1.6; }
            .contact-grid { display: grid; grid-template-columns: 1fr; gap: 2.5rem; }
            @media (min-width: 768px) { .contact-grid { grid-template-columns: 1fr 1fr; } }
            .contact-details, .contact-form { padding: 2rem; border-radius: 8px; background: #f8f9fa; border: 1px solid #dee2e6; }
            h2 { font-size: 1.75rem; color: #343a40; margin-bottom: 1.5rem; }
            .info-item { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.25rem; }
            .info-item i { color: #0d6efd; width: 24px; text-align: center; font-size: 1.2rem; margin-top: 4px; }
            .info-item a, .info-item span { color: #212529; text-decoration: none; transition: color 0.2s; }
            .info-item a:hover { color: #0d6efd; }
            .social-links { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1.5rem; }
            .social-icon { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: #dee2e6; color: #495057; border-radius: 50%; text-decoration: none; font-size: 1.1rem; transition: all 0.3s ease; }
            .social-icon:hover { background: #0d6efd; color: white; transform: translateY(-3px) scale(1.05); }
            .form-group { margin-bottom: 1.5rem; }
            .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #495057; }
            .form-group input, .form-group textarea { width: 100%; padding: 0.8rem 1rem; border: 1px solid #ced4da; border-radius: 6px; box-sizing: border-box; transition: all 0.2s; background: #fff; }
            .form-group input:focus, .form-group textarea:focus { border-color: #0d6efd; outline: none; box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.15); }
            .submit-btn { width: 100%; padding: 1rem; background: #0d6efd; color: white; border: none; border-radius: 6px; font-size: 1rem; font-weight: bold; cursor: pointer; transition: all 0.3s; }
            .submit-btn:hover { background: #0b5ed7; transform: translateY(-2px); box-shadow: 0 4px 15px rgba(13, 110, 253, 0.3); }
        `
    },
    {
        name: 'الزجاجي الفاخر',
        previewClass: 'bg-gray-700 text-white glassy-preview border-2 border-transparent',
        css: `
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 2rem; color: #f8f9fa; background: #111827 url('https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&q=80') no-repeat center center/cover; }
            .container { max-width: 900px; margin: auto; background: rgba(0, 0, 0, 0.45); padding: 3rem; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.37); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.18); }
            h1, h2 { color: #ffffff; border-bottom: 2px solid #38bdf8; padding-bottom: 0.5rem; margin-bottom: 1.5rem; font-size: 2.5rem; text-shadow: 0 0 10px rgba(56, 189, 248, 0.5); }
            .intro { text-align: center; margin-bottom: 2.5rem; color: #e5e7eb; font-size: 1.1rem; }
            .contact-grid { display: grid; grid-template-columns: 1fr; gap: 2.5rem; }
            @media (min-width: 768px) { .contact-grid { grid-template-columns: 1fr 1fr; } }
            .info-item { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.25rem; }
            .info-item i { color: #38bdf8; width: 24px; text-align: center; font-size: 1.2rem; margin-top: 4px; text-shadow: 0 0 8px #38bdf8; }
            .info-item a, .info-item span { color: #f8f9fa; text-decoration: none; }
            .info-item a:hover { color: #38bdf8; }
            .social-links { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1.5rem; }
            .social-icon { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.1); color: #f8f9fa; border-radius: 50%; text-decoration: none; font-size: 1.1rem; transition: all 0.3s ease; }
            .social-icon:hover { background: #38bdf8; color: white; transform: scale(1.1) rotate(360deg); }
            .form-group { margin-bottom: 1.5rem; }
            .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #d1d5db; }
            .form-group input, .form-group textarea { width: 100%; padding: 0.8rem 1rem; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; box-sizing: border-box; background: rgba(255, 255, 255, 0.05); color: #f8f9fa; transition: all 0.2s; }
            .form-group input::placeholder, .form-group textarea::placeholder { color: #9ca3af; }
            .form-group input:focus, .form-group textarea:focus { border-color: #38bdf8; outline: none; box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.3); background: rgba(255, 255, 255, 0.1); }
            .submit-btn { width: 100%; padding: 1rem; background: #38bdf8; color: white; border: none; border-radius: 6px; font-size: 1rem; font-weight: bold; cursor: pointer; transition: all 0.3s; }
            .submit-btn:hover { background: #0ea5e9; transform: translateY(-2px); box-shadow: 0 4px 15px rgba(56, 189, 248, 0.4); }
        `
    },
    {
        name: 'الاحترافي الداكن',
        previewClass: 'bg-gray-900 text-white border-2 border-gray-700',
        css: `
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 2rem; background-color: #030712; color: #d1d5db; }
            .container { max-width: 900px; margin: auto; background: #111827; padding: 3rem; border-radius: 12px; border: 1px solid #374151; }
            h1, h2 { color: #22d3ee; border-bottom: 2px solid #22d3ee; padding-bottom: 0.5rem; margin-bottom: 1.5rem; font-size: 2.5rem; text-shadow: 0 0 5px rgba(34, 211, 238, 0.3); }
            .intro { text-align: center; margin-bottom: 2.5rem; color: #9ca3af; font-size: 1.1rem; }
            .contact-grid { display: grid; grid-template-columns: 1fr; gap: 2.5rem; }
            @media (min-width: 768px) { .contact-grid { grid-template-columns: 1fr 1fr; } }
            .info-item { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.25rem; }
            .info-item i { color: #22d3ee; width: 24px; text-align: center; font-size: 1.2rem; margin-top: 4px; }
            .info-item a, .info-item span { color: #d1d5db; text-decoration: none; }
            .info-item a:hover { color: #22d3ee; }
            .social-links { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1.5rem; }
            .social-icon { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: #374151; color: #d1d5db; border-radius: 8px; text-decoration: none; font-size: 1.1rem; transition: all 0.3s ease; }
            .social-icon:hover { background: #22d3ee; color: #111827; transform: translateY(-3px); }
            .form-group { margin-bottom: 1.5rem; }
            .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #9ca3af; }
            .form-group input, .form-group textarea { width: 100%; padding: 0.8rem 1rem; border: 1px solid #4b5563; border-radius: 6px; box-sizing: border-box; background: #1f2937; color: #f8f9fa; transition: all 0.2s; }
            .form-group input:focus, .form-group textarea:focus { border-color: #22d3ee; outline: none; box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.2); }
            .submit-btn { width: 100%; padding: 1rem; background-image: linear-gradient(to right, #22d3ee, #0ea5e9); color: white; border: none; border-radius: 6px; font-size: 1rem; font-weight: bold; cursor: pointer; transition: all 0.3s; }
            .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(34, 211, 238, 0.4); }
        `
    },
    {
        name: 'الكلاسيكي الراقي',
        previewClass: 'bg-stone-100 text-stone-800 border-2 border-stone-300',
        css: `
            body { font-family: 'Georgia', 'Times New Roman', serif; margin: 0; padding: 2rem; background-color: #f5f5f4; color: #44403c; line-height: 1.8; }
            .container { max-width: 800px; margin: auto; padding: 3rem; background: #fff; border: 1px solid #e7e5e4; }
            h1, h2 { font-family: 'Helvetica Neue', sans-serif; font-weight: 300; color: #a8a29e; border-bottom: 1px solid #d6d3d1; padding-bottom: 1rem; margin-bottom: 2rem; text-align: center; }
            h1 { font-size: 3rem; }
            h2 { font-size: 1.5rem; text-align: left; }
            .intro { text-align: center; margin-bottom: 3rem; color: #78716c; font-size: 1.1rem; font-style: italic; }
            .contact-grid { display: grid; grid-template-columns: 1fr; gap: 3rem; }
            @media (min-width: 768px) { .contact-grid { grid-template-columns: 1fr 1fr; } }
            .info-item { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1rem; }
            .info-item i { width: 20px; text-align: center; margin-top: 5px; color: #a8a29e; }
            .info-item a, .info-item span { color: #44403c; text-decoration: none; }
            .social-links { display: flex; gap: 1rem; margin-top: 1.5rem; }
            .social-icon { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border: 1px solid #d6d3d1; color: #a8a29e; border-radius: 50%; text-decoration: none; font-size: 1rem; transition: all 0.3s ease; }
            .social-icon:hover { background: #44403c; color: white; border-color: #44403c; }
            .form-group { margin-bottom: 1.5rem; }
            .form-group label { display: block; margin-bottom: 0.5rem; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.1em; color: #78716c; }
            .form-group input, .form-group textarea { width: 100%; padding: 0.75rem; border: 1px solid #d6d3d1; border-radius: 0; box-sizing: border-box; background: transparent; }
            .form-group input:focus, .form-group textarea:focus { outline: 1px solid #a8a29e; }
            .submit-btn { width: 100%; padding: 0.8rem; background: transparent; color: #44403c; border: 1px solid #44403c; border-radius: 0; font-size: 1rem; text-transform: uppercase; cursor: pointer; transition: all 0.3s; }
            .submit-btn:hover { background: #44403c; color: white; }
        `
    },
    {
        name: 'الإبداعي الملون',
        previewClass: 'bg-rose-100 text-rose-900 border-2 border-rose-300',
        css: `
            body { font-family: 'Poppins', sans-serif; margin: 0; padding: 2rem; background: #fff1f2; color: #500724; }
            .container { max-width: 900px; margin: auto; background: #ffffff; padding: 3rem; border-radius: 1rem; box-shadow: 0 10px 25px -5px rgba(225, 29, 72, 0.1), 0 10px 10px -5px rgba(225, 29, 72, 0.04); }
            h1, h2 { background-image: linear-gradient(to right, #f43f5e, #ec4899); -webkit-background-clip: text; background-clip: text; color: transparent; }
            h1 { font-size: 3rem; text-align: center; margin-bottom: 2rem; }
            h2 { font-size: 1.75rem; margin-bottom: 1.5rem; }
            .intro { text-align: center; margin-bottom: 2.5rem; color: #831843; font-size: 1.1rem; }
            .contact-grid { display: grid; grid-template-columns: 1fr; gap: 2.5rem; }
            @media (min-width: 768px) { .contact-grid { grid-template-columns: 1fr 1fr; } }
            .info-item { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.25rem; }
            .info-item i { background-image: linear-gradient(to right, #f43f5e, #ec4899); -webkit-background-clip: text; background-clip: text; color: transparent; width: 24px; text-align: center; font-size: 1.2rem; margin-top: 4px; }
            .info-item a, .info-item span { color: #500724; text-decoration: none; }
            .social-links { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1.5rem; }
            .social-icon { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: #ffe4e6; color: #f43f5e; border-radius: 50%; text-decoration: none; font-size: 1.1rem; transition: all 0.3s ease; }
            .social-icon:hover { background-image: linear-gradient(to right, #f43f5e, #ec4899); color: white; transform: scale(1.1); }
            .form-group { margin-bottom: 1.5rem; }
            .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #831843; }
            .form-group input, .form-group textarea { width: 100%; padding: 0.8rem 1rem; border: 2px solid #fecdd3; border-radius: 6px; box-sizing: border-box; transition: all 0.2s; }
            .form-group input:focus, .form-group textarea:focus { border-color: #f43f5e; outline: none; box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.2); }
            .submit-btn { width: 100%; padding: 1rem; background-image: linear-gradient(to right, #f43f5e, #ec4899); color: white; border: none; border-radius: 6px; font-size: 1rem; font-weight: bold; cursor: pointer; transition: all 0.3s; }
            .submit-btn:hover { box-shadow: 0 4px 20px rgba(236, 72, 153, 0.4); }
        `
    },
];

const ContactUsGenerator: React.FC<ContactUsGeneratorProps> = ({ onNavigateHome }) => {
    const [formData, setFormData] = useState({
        introMessage: 'يسعدنا تواصلكم معنا! سواء كان لديكم سؤال، اقتراح، أو ترغبون في بدء شراكة، فريقنا جاهز للاستماع.',
        email: 'info@example.com',
        phone: '+1234567890',
        address: '123 شارع المثال، مدينة الإبداع، الدولة',
        workingHours: 'من الأحد إلى الخميس، 9 صباحًا - 5 مساءً',
        socialLinks: 'https://facebook.com\nhttps://twitter.com\nhttps://instagram.com',
        includeForm: true
    });
    const [selectedStyle, setSelectedStyle] = useState(styleTemplates[0]);
    const [generatedHtml, setGeneratedHtml] = useState('');
    const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
    const [isGuideOpen, setIsGuideOpen] = useState(true);
    const [copied, setCopied] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    
    const getSocialIcon = (url: string) => {
        if (url.includes('facebook.com')) return 'fab fa-facebook-f';
        if (url.includes('twitter.com') || url.includes('x.com')) return 'fab fa-twitter';
        if (url.includes('instagram.com')) return 'fab fa-instagram';
        if (url.includes('linkedin.com')) return 'fab fa-linkedin-in';
        if (url.includes('youtube.com')) return 'fab fa-youtube';
        if (url.includes('pinterest.com')) return 'fab fa-pinterest';
        if (url.includes('t.me') || url.includes('telegram.org')) return 'fab fa-telegram-plane';
        if (url.includes('wa.me') || url.includes('whatsapp.com')) return 'fab fa-whatsapp';
        return 'fas fa-link';
    };

    useEffect(() => {
        const socialLinksHtml = formData.socialLinks.split('\n').filter(link => link.trim()).map(link => `
            <a href="${link.trim()}" target="_blank" rel="noopener noreferrer" class="social-icon">
                <i class="${getSocialIcon(link.trim())}"></i>
            </a>
        `).join('');

        const html = `
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>اتصل بنا</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
                <style>
                    /* Import Fonts for better look */
                    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Inter:wght@400;600;700&family=Poppins:wght@400;600;700&display=swap');
                    ${selectedStyle.css}
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>اتصل بنا</h1>
                    ${formData.introMessage ? `<p class="intro">${formData.introMessage}</p>` : ''}
                    <div class="contact-grid">
                        <div class="contact-details">
                            <h2>معلومات التواصل</h2>
                            ${formData.email ? `<div class="info-item"><i class="fas fa-envelope"></i><a href="mailto:${formData.email}">${formData.email}</a></div>` : ''}
                            ${formData.phone ? `<div class="info-item"><i class="fas fa-phone-alt"></i><a href="tel:${formData.phone}">${formData.phone}</a></div>` : ''}
                            ${formData.address ? `<div class="info-item"><i class="fas fa-map-marker-alt"></i><span>${formData.address}</span></div>` : ''}
                            ${formData.workingHours ? `<div class="info-item"><i class="fas fa-clock"></i><span>${formData.workingHours}</span></div>` : ''}
                            ${socialLinksHtml ? `<div class="social-links">${socialLinksHtml}</div>` : ''}
                        </div>
                        ${formData.includeForm ? `
                        <div class="contact-form">
                            <h2>أرسل لنا رسالة</h2>
                            <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
                                <div class="form-group"><label for="name">الاسم</label><input type="text" id="name" name="name" required placeholder="اسمك الكامل"></div>
                                <div class="form-group"><label for="email">البريد الإلكتروني</label><input type="email" id="email" name="email" required placeholder="بريدك الإلكتروني"></div>
                                <div class="form-group"><label for="subject">الموضوع</label><input type="text" id="subject" name="subject" required placeholder="موضوع الرسالة"></div>
                                <div class="form-group"><label for="message">رسالتك</label><textarea id="message" name="message" rows="5" required placeholder="اكتب رسالتك هنا..."></textarea></div>
                                <button type="submit" class="submit-btn">إرسال</button>
                            </form>
                        </div>` : ''}
                    </div>
                </div>
            </body>
            </html>`;
        setGeneratedHtml(html.replace(/\s+/g, ' ').replace(/\s*>\s*</g, '><').trim());
    }, [formData, selectedStyle]);

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedHtml);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
                    <i className="fas fa-envelope relative text-6xl text-cyan-500 dark:text-cyan-400 eye-animation"></i>
                </div>
                <h2 className="font-extrabold text-2xl text-gray-800 dark:text-gray-100 tracking-wider" style={{ textShadow: '0 0 15px rgba(34, 211, 238, 0.6)' }}>
                    مولّد صفحة اتصل بنا الاحترافي
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 space-y-4">
                        <h3 className="text-xl font-bold text-center text-cyan-400">1. أدخل معلوماتك</h3>
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                             <div>
                                <h4 className="font-semibold text-purple-400 mb-2">معرض الأنماط</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {styleTemplates.map(style => (
                                        <button key={style.name} onClick={() => setSelectedStyle(style)} className={`p-2 rounded-lg border-2 transition-all ${selectedStyle.name === style.name ? 'border-cyan-400' : 'border-gray-600 hover:border-cyan-500/50'}`}>
                                            <div className={`h-20 w-full rounded-md flex items-center justify-center text-xs font-bold ${style.previewClass}`}>{style.name}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div><label className="block text-sm font-medium text-gray-300 mb-1">رسالة ترحيبية</label><textarea name="introMessage" value={formData.introMessage} onChange={handleChange} rows={3} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200" /></div>
                            <div><label className="block text-sm font-medium text-gray-300 mb-1">البريد الإلكتروني</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200" /></div>
                            <div><label className="block text-sm font-medium text-gray-300 mb-1">رقم الهاتف (اختياري)</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200" /></div>
                            <div><label className="block text-sm font-medium text-gray-300 mb-1">العنوان (اختياري)</label><input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200" /></div>
                            <div><label className="block text-sm font-medium text-gray-300 mb-1">ساعات العمل (اختياري)</label><input type="text" name="workingHours" value={formData.workingHours} placeholder="مثال: من الأحد إلى الخميس، 9 صباحًا - 5 مساءً" className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200" /></div>
                            <div><label className="block text-sm font-medium text-gray-300 mb-1">روابط التواصل الاجتماعي (كل رابط في سطر)</label><textarea name="socialLinks" value={formData.socialLinks} onChange={handleChange} rows={4} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200" /></div>
                            <div className="flex items-center gap-2 pt-2"><input type="checkbox" name="includeForm" checked={formData.includeForm} onChange={handleChange} className="h-5 w-5 rounded text-cyan-500 bg-gray-700 border-gray-500" /><label className="text-md font-medium text-gray-300">تضمين نموذج اتصال</label></div>
                        </div>
                    </div>
                    
                    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 flex flex-col">
                        <h3 className="text-xl font-bold text-center text-cyan-400 mb-4">2. المعاينة والكود</h3>
                         <div className="border-b border-gray-600 flex mb-4">
                            <button onClick={() => setActiveTab('preview')} className={`px-4 py-2 text-sm font-semibold -mb-px border-b-2 ${activeTab === 'preview' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400'}`}>معاينة حية</button>
                            <button onClick={() => setActiveTab('code')} className={`px-4 py-2 text-sm font-semibold -mb-px border-b-2 ${activeTab === 'code' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400'}`}>الحصول على الكود</button>
                        </div>
                        <div className="flex-grow bg-gray-900 rounded-md">
                        {activeTab === 'preview' ? (
                            <iframe srcDoc={generatedHtml} title="Preview" className="w-full h-full border-0 rounded-md" />
                        ) : (
                            <div className="p-4 flex flex-col h-full">
                                <textarea value={generatedHtml} readOnly className="w-full flex-grow bg-black/50 border border-gray-700 rounded-md p-2 font-mono text-sm text-yellow-300" dir="ltr" />
                                <div className="flex gap-4 mt-4">
                                    <button onClick={handleCopy} className="flex-1 px-4 py-2 rounded-md bg-cyan-600 text-white hover:bg-cyan-700">{copied ? '✓ تم النسخ' : 'نسخ الكود'}</button>
                                </div>
                            </div>
                        )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ContactUsGenerator;
