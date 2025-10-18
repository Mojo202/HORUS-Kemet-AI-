import { AspectRatioOption, ContentTypeOption, ContentType, ToolOption, ToolType } from "./types";

// New: Gemini model definitions for dropdown selectors
export const GEMINI_TEXT_MODELS = [
  { name: 'Gemini 2.5 Flash (الأسرع والأحدث)', value: 'gemini-2.5-flash' },
];

export const GEMINI_IMAGE_MODELS = [
  { name: 'Imagen 4 (لإنشاء الصور - الجودة العالية)', value: 'imagen-4.0-generate-001', disabled: false, title: 'النموذج الأقوى والأحدث لإنشاء صور جديدة من الصفر.' },
  { name: 'Nano Banana (للتعديل والإنشاء السريع)', value: 'gemini-2.5-flash-image', disabled: false, title: 'نموذج سريع وممتاز لتعديل الصور الموجودة أو إنشاء صور جديدة بسرعة.' },
];

export const IMAGE_GENERATION_STYLES = [
    { name: 'قياسي (افتراضي)', prompt: '' },
    { name: 'النمط الفني (ديزني-بيكسار)', prompt: ', an extreme close-up portrait in a grotesque caricature style. Focus on hyper-realistic and intensely exaggerated facial features: deeply etched, prominent wrinkles, detailed skin pores, and expressive, oversized eyes. The head is disproportionately large compared to the body, blending macrophotography-level realism with artistic distortion. Use dramatic, harsh lighting to accentuate every texture and imperfection. Masterpiece of character art, hyper-detailed, 8K ultra high quality.' },
    { name: 'درامي سينمائي', prompt: ', highly dramatic, intense, cinematic composition, epic lighting, dark and moody atmosphere' },
    { name: 'تصوير واقعي', prompt: ', photorealistic, hyper-detailed, 8k resolution, professional photography, sharp focus' },
    { name: 'لوحة زيتية كلاسيكية', prompt: ', classic oil painting style, visible brushstrokes, rich textures, chiaroscuro lighting' },
    { name: 'فن رقمي خيالي', prompt: ', intricate digital painting, fantasy art, masterpiece, award-winning' },
    { name: 'أسلوب أنمي ياباني', prompt: ', vibrant Japanese anime style, detailed characters, dynamic action lines, Makoto Shinkai inspired' },
    { name: 'رسم كرتوني', prompt: ', modern cartoon style, vibrant colors, bold outlines, Disney Pixar style' },
    { name: 'فيلم قديم (Vintage)', prompt: ', vintage film photography, sepia tones, light leaks, film grain and dust, retro look' },
    { name: 'فن تجريدي', prompt: ', abstract art, geometric shapes, non-representational, vibrant color splashes' },
    { name: 'تصوير طبي/علمي', prompt: ', scientific illustration, anatomical accuracy, clean lines, labels, white background' },
    { name: 'رياضي (حركة)', prompt: ', dynamic action sports photography, motion blur, high-speed capture, energetic' },
    { name: 'جمال وموضة', prompt: ', high fashion photography, editorial style, professional model, dramatic makeup, studio lighting' },
    { name: 'قصص أطفال', prompt: ', charming children\'s book illustration, soft colors, whimsical characters, gentle and friendly style' },
];

export const ASPECT_RATIO_OPTIONS: AspectRatioOption[] = [
    // Standard Ratios
    { label: 'مربع (1:1)', aspectRatioValue: '1:1', width: 1024, height: 1024, category: 'قياسي' },
    { label: 'عريض (16:9)', aspectRatioValue: '16:9', width: 1920, height: 1080, category: 'قياسي' },
    { label: 'طولي (9:16)', aspectRatioValue: '9:16', width: 1080, height: 1920, category: 'قياسي' },
    { label: 'أفقي (4:3)', aspectRatioValue: '4:3', width: 1024, height: 768, category: 'قياسي' },
    { label: 'عمودي (3:4)', aspectRatioValue: '3:4', width: 768, height: 1024, category: 'قياسي' },

    // Social Media (Exact Dimensions)
    { label: 'غلاف يوتيوب (2560x1440)', aspectRatioValue: '16:9', width: 2560, height: 1440, category: 'سوشيال ميديا' },
    { label: 'صورة مصغرة يوتيوب (1280x720)', aspectRatioValue: '16:9', width: 1280, height: 720, category: 'سوشيال ميديا' },
    { label: 'غلاف فيسبوك (851x315)', aspectRatioValue: '16:9', width: 851, height: 315, category: 'سوشيال ميديا' },
    { label: 'منشور فيسبوك/انستغرام (1080x1080)', aspectRatioValue: '1:1', width: 1080, height: 1080, category: 'سوشيال ميديا' },
    { label: 'ستوري (1080x1920)', aspectRatioValue: '9:16', width: 1080, height: 1920, category: 'سوشيال ميديا' },

    // Banners (Exact Dimensions)
    { label: 'Leaderboard (728x90)', aspectRatioValue: '16:9', width: 728, height: 90, category: 'بنرات إعلانية' },
    { label: 'Large Rectangle (336x280)', aspectRatioValue: '4:3', width: 336, height: 280, category: 'بنرات إعلانية' },
    { label: 'Medium Rectangle (300x250)', aspectRatioValue: '4:3', width: 300, height: 250, category: 'بنرات إعلانية' },
    { label: 'Skyscraper (120x600)', aspectRatioValue: '9:16', width: 120, height: 600, category: 'بنرات إعلانية' },
    { label: 'Wide Skyscraper (160x600)', aspectRatioValue: '9:16', width: 160, height: 600, category: 'بنرات إعلانية' },

    // Logos (Standard Ratios)
    { label: 'شعار مربع (512x512)', aspectRatioValue: '1:1', width: 512, height: 512, category: 'شعارات' },
    { label: 'شعار مستطيل (1200x300)', aspectRatioValue: '16:9', width: 1200, height: 300, category: 'شعارات' },
];


export const CONTENT_TYPE_OPTIONS: ContentTypeOption[] = [
  { 
    value: ContentType.News, 
    label: "الأخبار", 
    emoji: "📰", 
    iconClass: "fas fa-newspaper",
    subCategories: [
      { label: 'اقتصاد', value: 'economy' },
      { label: 'حوادث وقضايا', value: 'accidents_cases' },
      { label: 'رياضة', value: 'sports' },
      { label: 'فن وثقافة', value: 'art_culture' },
      { label: 'طقس', value: 'weather' },
      { label: 'سياسة', value: 'politics' },
      { label: 'محليات', value: 'local' },
      { label: 'عالم', value: 'world' },
    ]
  },
  { value: ContentType.SportsMedicine, label: "الطب الرياضي", emoji: "⚕️", iconClass: "fas fa-stethoscope" },
  { value: ContentType.AlternativeMedicine, label: "الطب البديل", emoji: "🌿", iconClass: "fas fa-seedling" },
  { value: ContentType.HealthWellness, label: "الصحة والعافية", emoji: "🧘", iconClass: "fas fa-heartbeat" },
  { value: ContentType.Beauty, label: "الجمال والمرأة", emoji: "💄", iconClass: "fas fa-paint-brush" },
  { value: ContentType.Cooking, label: "الطبخ", emoji: "🍳", iconClass: "fas fa-utensils" },
  { value: ContentType.Horoscope, label: "الأبراج", emoji: "✨", iconClass: "fas fa-star" },
  { value: ContentType.Tech, label: "التقنية والتدوين", emoji: "💻", iconClass: "fas fa-code" },
  { value: ContentType.Stories, label: "القصص", emoji: "📖", iconClass: "fas fa-book-open" },
  { value: ContentType.Travel, label: "السفر والسياحة", emoji: "✈️", iconClass: "fas fa-plane-departure" },
  { value: ContentType.Finance, label: "المال والأعمال", emoji: "💼", iconClass: "fas fa-chart-line" },
  { value: ContentType.Reviews, label: "المراجعات", emoji: "⭐", iconClass: "fas fa-star-half-alt" },
  { value: ContentType.AdvancedEditor, label: "وضع الإنشاء المتقدم", emoji: "🛠️", iconClass: "fas fa-magic" },
  { value: ContentType.ImageStudio, label: "استوديو الصور", emoji: "🎨", iconClass: "fas fa-palette" },
  { value: ContentType.SeoStudio, label: "استوديو السيو", emoji: "🚀", iconClass: "fas fa-chart-bar" },
  { value: ContentType.VideoStudio, label: "استوديو الفيديو", emoji: "🎬", iconClass: "fas fa-video" },
  { value: ContentType.HoroscopeVideoStudio, label: "بلورة حظك اليوم وتوقعات الأبراج", emoji: "🔮", iconClass: "fas fa-hat-wizard" },
  { value: ContentType.HorusForge, label: "صانع البروتوكولات", emoji: "📜", iconClass: "fas fa-scroll" },
];

export const TOOL_OPTIONS: ToolOption[] = [
    { value: ToolType.NanoBananaStudio, label: 'استوديو نانو بنانا', iconClass: 'is-official-nano-banana-icon' },
    { value: ToolType.BloggerCleaner, label: 'قالب تنظيف بلوجر', iconClass: 'fab fa-blogger-b' },
    { value: ToolType.CodeConverter, label: 'تحويل الأكواد', iconClass: 'fas fa-exchange-alt' },
    { value: ToolType.WebpConverter, label: 'محول الصور الى WebP', iconClass: 'fas fa-file-image' },
    { value: ToolType.WordCounter, label: 'عداد الكلمات والمحسن', iconClass: 'fas fa-tachometer-alt' },
    { value: ToolType.ChatGpt, label: 'استوديو شات حورس', iconClass: 'fas fa-robot' },
    { value: ToolType.PrivacyPolicy, label: 'مولّد سياسة الخصوصية', iconClass: 'fas fa-user-shield' },
    { value: ToolType.TermsOfUse, label: 'مولّد اتفاقية الاستخدام', iconClass: 'fas fa-handshake' },
    { value: ToolType.AboutUs, label: 'مولّد صفحة من نحن', iconClass: 'fas fa-info-circle' },
    { value: ToolType.RobotsTxt, label: 'مولّد ملف robots.txt', iconClass: 'fas fa-file-code' },
    { value: ToolType.Sitemap, label: 'مولّد خرائط الموقع (Sitemap)', iconClass: 'fas fa-sitemap' },
    { value: ToolType.CssMinifier, label: 'اداة ضغط اكواد CSS', iconClass: 'fas fa-compress-arrows-alt' },
    { value: ToolType.CodeEditor, label: 'محرر الأكواد', iconClass: 'fas fa-code' },
    { value: ToolType.AiContentDetector, label: 'كاشف محتوى AI', iconClass: 'fas fa-search' },
    { value: ToolType.KeywordTool, label: 'أداة الكلمات المفتاحية', iconClass: 'fas fa-key' },
    { value: ToolType.ContactUs, label: 'صفحة اتصل بنا', iconClass: 'fas fa-envelope' },
    { value: ToolType.BacklinkChecker, label: 'فاحص الباك لينك', iconClass: 'fas fa-link' },
    { value: ToolType.PlagiarismChecker, label: 'فاحص الانتحال', iconClass: 'fas fa-file-signature' },
    { value: ToolType.SocialMediaPostGenerator, label: 'مولّد منشورات السوشيال ميديا', iconClass: 'fas fa-share-square' },
    { value: ToolType.HeadlineAnalyzer, label: 'محلل العناوين الاحترافي', iconClass: 'fas fa-spell-check' },
    { value: ToolType.ShortVideoScriptWriter, label: 'كاتب نصوص الفيديو القصيرة', iconClass: 'fas fa-file-video' },
    { value: ToolType.AdvancedImageEnhancer, label: 'محسّن الصور المتقدم', iconClass: 'fas fa-photo-video' },
    { value: ToolType.EcommerceStudio, label: 'استوديو التجارة الإلكترونية', iconClass: 'fas fa-store' },
    { value: ToolType.EmailMarketingGenerator, label: 'مولّد محتوى التسويق عبر البريد', iconClass: 'fas fa-paper-plane' },
    { value: ToolType.ElearningStudio, label: 'استوديو المحتوى التعليمي', iconClass: 'fas fa-chalkboard-teacher' },
    { value: ToolType.PodcastScriptGenerator, label: 'مولّد نصوص البودكاست', iconClass: 'fas fa-podcast' },
    { value: ToolType.ContentCreatorTools, label: 'أدوات منشئي المحتوى', iconClass: 'fas fa-tools' },
];

export const IMAGE_STUDIO_EXAMPLE_PROMPTS = [
  {
    name: 'برج الجدي (أسطوري)',
    prompt: `A majestic and mythical sea-goat creature, representing the Capricorn zodiac sign, emerging dynamically from turbulent, deep turquoise and sapphire blue oceanic waves. The creature's front half is goat-like, with short, soft, iridescent purple and pink fur, a wise expression on its face, bright glowing golden eyes, and prominent, intricately curved golden horns. It wears an ornate golden headpiece or crown. The back half transitions seamlessly into a fish-like body, covered in shimmering iridescent blue and violet scales, culminating in a large, flowing, vibrant magenta and fuchsia-pink caudal fin. Smaller, feathery purple fins are visible along its body. The background is a breathtaking cosmic night sky, filled with swirling nebulae in electric blues, deep violets, magentas, and subtle pinks, alongside countless shimmering stars and distant galaxies. Three glowing, stylized astrological symbols are visible in the sky: one prominent golden-yellow circular symbol centrally located above the creature, and two smaller, white-glowing circular symbols near the upper corners. Dramatic, ethereal, and volumetric celestial lighting illuminates the scene, highlighting the creature's fur and scales, and casting reflections on the detailed, splashing water. The style is hyperrealistic digital painting, highly detailed, vibrant, epic fantasy art, cosmic art, and magical realism. Wide shot, dynamic composition, masterpiece, 8K, cinematic lighting, ultra high quality, vibrant colors. CRITICAL: Any text that appears on the image MUST be in ENGLISH.`
  },
  {
    name: 'برج الجدي (فاخر)',
    prompt: `A highly detailed, luxurious, and ornate 3D rendered image of the zodiac sign Capricorn. The central figure is a majestic, polished golden statue of a mountain goat with long, spiraled horns, standing proudly on a large, textured brown rock. Behind the golden Capricorn, a deep black background features radiating golden sun rays or a halo effect. Below the main rock, smaller, sculpted dark grey-blue mountain peaks are visible, interspersed with elegant golden foliage and leaves. The entire composition is encased within an intricate, opulent black and gold frame, featuring symmetrical baroque and art deco inspired patterns, with an arching top section. At the very bottom, a black plaque integrated into the frame proudly displays the word "CAPRICORN" in elegant, golden capital letters. The lighting is dramatic, highlighting the metallic sheen of the gold and the textures of the rocks, creating a sense of grandeur and sophistication. Vertical orientation, 8K resolution, ultra high quality, vibrant colors. CRITICAL: Any text that appears on the image MUST be in ENGLISH.`
  }
];

export const ZODIAC_SIGN_MAP: { [key: string]: string } = {
  'الجدي': 'Capricorn',
  'الدلو': 'Aquarius',
  'الحوت': 'Pisces',
  'الحمل': 'Aries',
  'الثور': 'Taurus',
  'الجوزاء': 'Gemini',
  'السرطان': 'Cancer',
  'الأسد': 'Leo',
  'العذراء': 'Virgo',
  'الميزان': 'Libra',
  'العقرب': 'Scorpio',
  'القوس': 'Sagittarius',
};

export const HOROSCOPE_IMAGE_PROMPTS = [
  {
    name: 'النمط الفاخر',
    prompt: `A highly detailed, luxurious, and ornate 3D rendered image of the zodiac sign {{ZODIAC_SIGN_EN}}. The entire scene is a masterpiece of composition, designed to fill the frame completely, regardless of aspect ratio. The central figure is a majestic, polished golden statue of a {{ZODIAC_SIGN_EN}} symbol, standing proudly. The background is not empty but a rich, dark, textured environment with subtle golden nebula patterns or baroque tapestry details that extend to all edges. The entire composition is encased within an intricate, opulent black and gold frame that adapts its design to perfectly fit the chosen aspect ratio, ensuring no black bars or empty space. At the very bottom, a black plaque integrated into the frame proudly displays the word "{{ZODIAC_SIGN_EN}}" in elegant, golden capital letters. The lighting is dramatic, highlighting the metallic sheen of the gold, creating a sense of grandeur. CRITICAL: The final image must be a full-bleed, edge-to-edge composition. It must adapt gracefully to wide (16:9), square (1:1), and tall (9:16) formats without any padding or empty borders. 8K resolution, ultra high quality, vibrant colors. CRITICAL: The word '{{ZODIAC_SIGN_EN}}' must be in English.`,
  },
  {
    name: 'النمط الأسطوري',
    prompt: `A majestic and mythical creature, representing the {{ZODIAC_SIGN_EN}} zodiac sign, emerging dynamically from turbulent, deep turquoise and sapphire blue oceanic waves. The creature's appearance is a blend of its astrological symbol and elemental nature, with iridescent fur/scales, a wise expression on its face, bright glowing golden eyes, and prominent, intricately curved golden horns or features. It wears an ornate golden headpiece or crown. The background is a breathtaking cosmic night sky, filled with swirling nebulae in electric blues, deep violets, magentas, and subtle pinks, alongside countless shimmering stars and distant galaxies. Glowing, stylized astrological symbols are visible in the sky. Dramatic, ethereal, and volumetric celestial lighting illuminates the scene, highlighting the creature's form and casting reflections on the detailed, splashing water. The style is hyperrealistic digital painting, highly detailed, vibrant, epic fantasy art, cosmic art, and magical realism. Wide shot, dynamic composition, masterpiece, 8K, cinematic lighting, ultra high quality, vibrant colors. CRITICAL: Any text or symbols that appear on the image MUST be in ENGLISH.`,
  }
];

interface ImagePrompt {
  name: string;
  prompt: string;
  icon: string;
  color: string;
}

export const NEWS_IMAGE_PROMPTS: ImagePrompt[] = [
  {
    name: 'أخبار عاجلة',
    prompt: `photojournalism style, high-octane scene related to '{{ARTICLE_TITLE}}', a reporter in a rain jacket speaking urgently into a microphone, with the flashing red and blue lights of emergency vehicles completely blurred in the dark background. The atmosphere is tense and immediate. cinematic, 8k, ultra high quality, vibrant colors. CRITICAL: Any text that appears on the image MUST be in ENGLISH.`,
    icon: 'fas fa-bolt',
    color: '#F59E0B',
  },
  {
    name: 'سياسة دولية',
    prompt: `photojournalism style, a historic handshake or formal meeting between world leaders related to '{{ARTICLE_TITLE}}', in a grand hall, in front of their national flags, symbolizing a new agreement. Professional lighting, serious tone. cinematic, 8k, ultra high quality, vibrant colors. CRITICAL: Any text that appears on the image MUST be in ENGLISH.`,
    icon: 'fas fa-globe-americas',
    color: '#3B82F6',
  },
  {
    name: 'اقتصاد وبورصة',
    prompt: `photojournalism style, a chaotic and busy stock exchange floor, with traders gesturing in front of glowing screens displaying financial charts and data related to '{{ARTICLE_TITLE}}'. Dynamic, high-energy. cinematic, 8k, ultra high quality, vibrant colors. CRITICAL: Any text that appears on the image MUST be in ENGLISH.`,
    icon: 'fas fa-chart-line',
    color: '#10B981',
  },
  {
    name: 'رياضة',
    prompt: `sports photography, photojournalism style, the captain of a winning team lifting a championship trophy high in the air as confetti rains down, capturing the peak celebratory moment related to '{{ARTICLE_TITLE}}'. Dynamic action shot. cinematic, 8k, ultra high quality, vibrant colors. CRITICAL: Any text that appears on the image MUST be in ENGLISH.`,
    icon: 'fas fa-futbol',
    color: '#84CC16',
  },
  {
    name: 'فن وثقافة',
    prompt: `photojournalism style, a famous celebrity in a stunning designer outfit posing for a wall of flashing cameras on a glamorous red carpet during an event related to '{{ARTICLE_TITLE}}'. Elegant and sophisticated. cinematic, 8k, ultra high quality, vibrant colors. CRITICAL: Any text that appears on the image MUST be in ENGLISH.`,
    icon: 'fas fa-palette',
    color: '#A78BFA',
  },
  {
    name: 'طقس',
    prompt: `Dramatic, high-resolution satellite image of a significant weather system (like a hurricane, storm front, or heatwave) over a geographical map related to '{{ARTICLE_TITLE}}'. Scientific and visually impactful. cinematic, 8k, ultra high quality, vibrant colors. CRITICAL: Any text that appears on the image MUST be in ENGLISH.`,
    icon: 'fas fa-cloud-sun-rain',
    color: '#60A5FA',
  },
  {
    name: 'حوادث وقضايا',
    prompt: `photojournalism style, wide shot of an investigation scene with emergency services vehicles (police, ambulance), yellow tape cordoning off the area. The scene is depicted respectfully and without graphic details, focusing on the responders, related to '{{ARTICLE_TITLE}}'. Somber, serious tone. cinematic, 8k, ultra high quality, vibrant colors. CRITICAL: Any text that appears on the image MUST be in ENGLISH.`,
    icon: 'fas fa-car-crash',
    color: '#EF4444',
  },
   {
    name: 'تصوير صحفي عام',
    prompt: `A highly detailed, professional photojournalism style image capturing the essence of '{{ARTICLE_TITLE}}'. The lighting is realistic and dramatic, the focus is sharp, and the composition tells a story. The scene should be dynamic and impactful. 8k resolution, ultra high quality, vibrant colors. CRITICAL: Any text that appears on the image MUST be in ENGLISH.`,
    icon: 'fas fa-camera-retro',
    color: '#22D3EE',
  },
];

export const COOKING_IMAGE_PROMPTS: ImagePrompt[] = [
  {
    name: 'ميلك شيك كابتشينو فاخر',
    prompt: `A highly detailed, gourmet product photography shot of a decadent {{DISH_NAME}} in a tall, clear glass..., 8K resolution, ultra high quality, vibrant colors. CRITICAL: Any text that appears on the image MUST be in ENGLISH.`,
    icon: 'fas fa-coffee',
    color: '#A5694B',
  },
  {
    name: 'عصير رمضاني منعش',
    prompt: `A captivating, high-resolution close-up photograph of a refreshing glass of iced {{DISH_NAME}}..., 8K resolution, ultra high quality, vibrant colors. CRITICAL: Any text that appears on the image MUST be in ENGLISH.`,
    icon: 'fas fa-glass-cheers',
    color: '#84CC16',
  },
  {
    name: 'كعكة شوكولاتة بالفاكهة',
    prompt: `A close-up, high-angle, photorealistic shot of a decadent, multi-layered {{DISH_NAME}} slice..., 8K resolution, ultra high quality, vibrant colors. CRITICAL: Any text that appears on the image MUST be in ENGLISH.`,
    icon: 'fas fa-birthday-cake',
    color: '#7B3F00',
  },
  {
    name: 'قطعة كعكة بصوص الشوكولاتة',
    prompt: `A highly detailed, professional food photograph of a decadent slice of {{DISH_NAME}}..., 8K resolution, ultra high quality, vibrant colors. CRITICAL: Any text that appears on the image MUST be in ENGLISH.`,
    icon: 'fas fa-chart-pie',
    color: '#5C2C06',
  },
  {
    name: 'عرض شاورما احترافي',
    prompt: `A highly detailed, appetizing, and vibrant food photograph featuring a grand display of {{DISH_NAME}}..., 8K resolution, ultra high quality, vibrant colors. CRITICAL: Any text that appears on the image MUST be in ENGLISH.`,
    icon: 'fas fa-drumstick-bite',
    color: '#E57373',
  },
  {
    name: 'سلطة فتوش أصيلة',
    prompt: `A vibrant, close-up, high-angle shot of an authentic {{DISH_NAME}} salad..., 8K resolution, ultra high quality, vibrant colors. CRITICAL: Any text that appears on the image MUST be in ENGLISH.`,
    icon: 'fas fa-leaf',
    color: '#4CAF50',
  },
  {
    name: 'مسقعة مخبوزة شهية',
    prompt: `A highly detailed, appetizing, and vibrant food photograph capturing a freshly baked authentic {{DISH_NAME}}..., 8K resolution, ultra high quality, vibrant colors. CRITICAL: Any text that appears on the image MUST be in ENGLISH.`,
    icon: 'fas fa-utensil-spoon',
    color: '#FFC107',
  },
  {
    name: 'شكشوكة (لقطة من الأعلى)',
    prompt: `Overhead shot of a vibrant, perfectly cooked {{DISH_NAME}} served in a rustic black cast iron skillet..., 8K resolution, ultra high quality, vibrant colors. CRITICAL: Any text that appears on the image MUST be in ENGLISH.`,
    icon: 'fas fa-egg',
    color: '#FFEB3B',
  },
  {
    name: 'فطائر سبانخ (لقطة من الأعلى)',
    prompt: `Overhead shot of freshly baked savory pastries, similar to {{DISH_NAME}}..., 8K resolution, ultra high quality, vibrant colors. CRITICAL: Any text that appears on the image MUST be in ENGLISH.`,
    icon: 'fas fa-pizza-slice',
    color: '#2E7D32',
  },
  {
    name: 'أرز بالخضار على الطريقة المغربية',
    prompt: `A highly detailed, professional food photography shot of a vibrant, steaming bowl of '{{DISH_NAME}}'..., 8K resolution, ultra high quality, vibrant colors. CRITICAL: Any text that appears on the image MUST be in ENGLISH.`,
    icon: 'fas fa-carrot',
    color: '#FB8C00',
  },
  {
    name: 'تصوير احترافي عام',
    prompt: `A highly detailed, professional food photograph of {{DISH_NAME}}. The dish is beautifully plated on an elegant ceramic plate..., 8K resolution, ultra high quality, vibrant colors. CRITICAL: Any text that appears on the image MUST be in ENGLISH.`,
    icon: 'fas fa-camera-retro',
    color: '#22D3EE',
  },
  {
    name: 'نمط ريفي دافئ',
    prompt: `A captivating shot of homemade {{DISH_NAME}}, served in a rustic bowl on a dark wooden table..., 8K resolution, ultra high quality, vibrant colors. CRITICAL: Any text that appears on the image MUST be in ENGLISH.`,
    icon: 'fas fa-campground',
    color: '#8D6E63',
  },
  {
    name: 'لقطة من الأعلى (Flat Lay)',
    prompt: `Overhead shot (flat lay) of {{DISH_NAME}}. The dish is the centerpiece..., 8K resolution, ultra high quality, vibrant colors. CRITICAL: Any text that appears on the image MUST be in ENGLISH.`,
    icon: 'fas fa-th-large',
    color: '#9E9E9E',
  },
  {
    name: 'لقطة قريبة (Macro)',
    prompt: `An extreme close-up, macro shot of {{DISH_NAME}}. Focus on the intricate textures..., 8K resolution, ultra high quality, vibrant colors. CRITICAL: Any text that appears on the image MUST be in ENGLISH.`,
    icon: 'fas fa-search-plus',
    color: '#2196F3',
  }
];