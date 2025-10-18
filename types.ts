// FIX: Define and export the ContentType enum here to break the circular dependency.
export enum ContentType {
    News = 'News',
    SportsMedicine = 'Sports Medicine',
    AlternativeMedicine = 'Alternative Medicine',
    HealthWellness = 'Health & Wellness',
    Beauty = 'Beauty',
    Cooking = 'Cooking',
    Horoscope = 'Horoscope',
    Tech = 'Tech',
    Stories = 'Stories',
    Travel = 'Travel',
    Finance = 'Finance',
    Reviews = 'Reviews',
    AdvancedEditor = 'Advanced Editor',
    ImageStudio = 'Image Studio',
    SeoStudio = 'SEO Studio',
    VideoStudio = 'Video Studio',
    HoroscopeVideoStudio = 'Horoscope Video Studio',
    HorusForge = 'Horus Forge',
}

// New: Enum for the creator toolkit
export enum ToolType {
    BloggerCleaner = 'BloggerCleaner',
    CodeConverter = 'CodeConverter',
    WebpConverter = 'WebpConverter',
    WordCounter = 'WordCounter',
    ChatGpt = 'ChatGpt',
    PrivacyPolicy = 'PrivacyPolicy',
    TermsOfUse = 'TermsOfUse',
    AboutUs = 'AboutUs',
    RobotsTxt = 'RobotsTxt',
    Sitemap = 'Sitemap',
    CssMinifier = 'CssMinifier',
    CodeEditor = 'CodeEditor',
    AiContentDetector = 'AiContentDetector',
    KeywordTool = 'KeywordTool',
    ContactUs = 'ContactUs',
    BacklinkChecker = 'BacklinkChecker',
    ContentCreatorTools = 'ContentCreatorTools',
    PlagiarismChecker = 'PlagiarismChecker',
    NanoBananaStudio = 'NanoBananaStudio',
    SocialMediaPostGenerator = 'SocialMediaPostGenerator',
    HeadlineAnalyzer = 'HeadlineAnalyzer',
    ShortVideoScriptWriter = 'ShortVideoScriptWriter',
    AdvancedImageEnhancer = 'AdvancedImageEnhancer',
    EcommerceStudio = 'EcommerceStudio',
    EmailMarketingGenerator = 'EmailMarketingGenerator',
    ElearningStudio = 'ElearningStudio',
    PodcastScriptGenerator = 'PodcastScriptGenerator',
}


export type DifficultyLevel = 'easy' | 'medium' | 'advanced';

export interface ParsedArticle {
  title: string;
  imageUrl: string;
  text: string;
  sources: { title: string; url: string }[];
}

export interface GeneratedArticle {
  id: number;
  html: string;
  title: string;
  imageUrl: string;
  metaDescription: string;
  metaKeywords: string;
  slug: string;
  rating: number;
  isFavorite: boolean;
  isFinalized?: boolean;
  isSchemaCorrected?: boolean;
  videoUrl?: string;
  videoStatus?: 'idle' | 'pending' | 'ready' | 'error';
}

export interface SeoAnalysisItem {
    pass: boolean;
    feedback: string;
    suggestion?: string;
    fieldName?: 'title' | 'metaDescription' | 'slug';
}

export interface SeoAnalysis {
    score: number;
    title: SeoAnalysisItem;
    metaDescription: SeoAnalysisItem;
    slug: SeoAnalysisItem;
    keywordInIntroduction: { pass: boolean; feedback: string };
    imageAltText: { pass: boolean; feedback: string };
    contentReadability: { pass: boolean; feedback: string };
    overallSuggestions: string;
}

export interface SeoCheck {
    pass: boolean;
    check: string;
    feedback: string;
    suggestion: string;
}

export interface SeoAnalysisAdvanced {
    overallScore: number;
    onPageSeo: SeoCheck[];
    technicalSeo: SeoCheck[];
    adsenseCompliance: SeoCheck[];
    strengths: string[];
    weaknesses: string[];
    finalReport: string;
}

export interface BloggerUser {
  name: string;
  imageUrl?: string;
}

export interface BloggerBlog {
  id: string;
  name: string;
}

export type ApiKeyStatus = 'unknown' | 'valid' | 'invalid' | 'quota_exceeded';

export interface ApiKey {
  key: string;
  status: ApiKeyStatus;
}

export interface AppSettings {
  geminiApiKeys: ApiKey[];
  activeGeminiKeyIndex: number;
  imgbbApiKey: ApiKey;
  youtubeApiKey: ApiKey;
}

export interface CustomFont {
  name: string;
  data: string;
}

export interface PagePreferences {
    wordCount: number;
    sportsMedicineLanguage: 'ar' | 'en';
    selectedNewsSubCategories: string[];
    difficultyLevel: DifficultyLevel;
    imageAspectRatio: '16:9' | '1:1' | '9:16' | '4:3' | '3:4';
    videoOption: 'none' | 'youtube' | 'veo';
    selectedTextModel: string;
    selectedImageModel: string;
    overrideImageSlug?: string;
    fillDynamicPlaceholders?: boolean;
    selectedImageStyle?: string;
    selectedTypographyStyle?: string;
}

export interface Profile {
    id: string;
    name: string;
    contentType: ContentType;
    preferences: PagePreferences;
    useInternetSearch: boolean;
    customPersona: { instructions: string; htmlTemplate: string; };
    selectedTextModel: string;
    selectedImageModel: string;
}

// New type definition for an option that can have sub-categories
export interface ContentTypeOption {
  value: ContentType;
  label: string;
  emoji: string;
  iconClass: string; // Changed from iconPath to iconClass
  subCategories?: { label: string; value: string; }[];
}

// New type definition for the creator toolkit options
export interface ToolOption {
  value: ToolType;
  label: string;
  iconClass: string;
}

// New type definition for advanced aspect ratio options with precise pixel dimensions
export interface AspectRatioOption {
    label: string;
    // The closest aspect ratio supported by the Imagen API
    aspectRatioValue: '1:1' | '16:9' | '9:16' | '4:3' | '3:4'; 
    // The exact pixel dimensions for client-side resizing/cropping
    width?: number;
    height?: number;
    category: string;
}

export interface HorusTemplate {
  name: string;
  description: string;
  instructions: string;
  htmlTemplate: string;
  icon: string; // New: Add icon property
  type: 'protocol' | 'template' | 'persona'; // New: Add type for grouping
}

// New types for the Keyword Tool
export type KeywordCompetition = 'Low' | 'Medium' | 'High';
export type UserIntent = 'Informational' | 'Commercial' | 'Transactional' | 'Navigational';

export interface Keyword {
    keyword: string;
    volume: string;
    competition: KeywordCompetition;
    cpc: string;
    intent: UserIntent;
}

export interface KeywordResults {
    mainKeywords: Keyword[];
    longTailKeywords: Keyword[];
    questionKeywords: Keyword[];
    relatedTopics: string[];
}

// New types for the Backlink Checker Tool
export type BacklinkStrategy = 'Guest Post' | 'Resource Page' | 'Broken Link Building' | 'Forum Comment' | 'Blog Comment' | 'Other';

export interface BacklinkOpportunity {
    siteUrl: string;
    authorityScore: number;
    strategy: BacklinkStrategy;
    notes: string;
}

export interface BacklinkAnalysisResult {
    opportunities: BacklinkOpportunity[];
    contentIdeas: string[];
    outreachTemplates: {
        title: string;
        body: string;
    }[];
}

// New types for the Plagiarism Checker Tool
export interface PlagiarizedSentence {
    sentence: string;
    sourceUrl: string;
    sourceTitle: string;
}

export interface PlagiarismResult {
    originalityScore: number; // Percentage (0-100)
    plagiarizedSentences: PlagiarizedSentence[];
}