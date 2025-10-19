/**
 * 🎨 OpenRouter Image Generation Service
 * High-quality image generation using multiple AI models
 * Supports DALL-E, Stable Diffusion, Flux, and more
 */

interface OpenRouterConfig {
    apiKeys: string[];
    currentKeyIndex: number;
    model: string;
}

// 🔑 Multiple OpenRouter API keys for redundancy
const OR_CONFIG: OpenRouterConfig = {
    apiKeys: [
        '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',
        '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',
        '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'
    ],
    currentKeyIndex: 0,
    model: 'openai/dall-e-3' // High quality model
};

/**
 * Rotate to next API key
 */
function rotateApiKey(): void {
    OR_CONFIG.currentKeyIndex = (OR_CONFIG.currentKeyIndex + 1) % OR_CONFIG.apiKeys.length;
}

/**
 * Get current active API key
 */
function getCurrentApiKey(): string {
    return OR_CONFIG.apiKeys[OR_CONFIG.currentKeyIndex];
}

/**
 * Generate image using OpenRouter
 * @param prompt - Text description of the image
 * @param log - Logging function
 * @returns Image URL
 */
export async function generateImageWithOpenRouter(
    prompt: string,
    log: (message: string) => void
): Promise<string> {
    const maxRetries = OR_CONFIG.apiKeys.length;
    let lastError: Error | null = null;

    log('🎨 بدء توليد الصورة باستخدام OpenRouter...');

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        const apiKey = getCurrentApiKey();
        const keyNumber = OR_CONFIG.currentKeyIndex + 1;

        try {
            log(`🔑 استخدام المفتاح رقم ${keyNumber}/${OR_CONFIG.apiKeys.length}...`);

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://horus-kemet.ai',
                    'X-Title': 'HORUS Kemet AI'
                },
                body: JSON.stringify({
                    model: OR_CONFIG.model,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                
                if (response.status === 429 || errorText.includes('rate limit') || errorText.includes('quota')) {
                    log(`⚠️ المفتاح ${keyNumber} وصل للحد الأقصى، جاري التبديل...`);
                    rotateApiKey();
                    continue;
                }

                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            
            // Extract image URL from response
            const imageUrl = result.choices?.[0]?.message?.content;
            
            if (!imageUrl) {
                throw new Error('لم يتم إرجاع رابط الصورة من OpenRouter');
            }

            // Download the image and convert to base64
            log('🌐 جاري تحميل الصورة...');
            const imageResponse = await fetch(imageUrl);
            const imageBlob = await imageResponse.blob();
            
            const base64Image = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = (reader.result as string).split(',')[1];
                    resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(imageBlob);
            });

            log(`✅ تم توليد الصورة بنجاح باستخدام المفتاح ${keyNumber}!`);
            
            rotateApiKey();
            
            return base64Image;

        } catch (error: any) {
            lastError = error;
            log(`❌ فشل المفتاح ${keyNumber}: ${error.message}`);
            
            rotateApiKey();
            
            if (attempt < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }

    throw new Error(
        `فشل توليد الصورة بعد تجربة جميع المفاتيح (${maxRetries}). ` +
        `آخر خطأ: ${lastError?.message || 'غير معروف'}`
    );
}

/**
 * Get service status
 */
export function getOpenRouterStatus(): {
    totalKeys: number;
    currentKey: number;
    model: string;
} {
    return {
        totalKeys: OR_CONFIG.apiKeys.length,
        currentKey: OR_CONFIG.currentKeyIndex + 1,
        model: OR_CONFIG.model
    };
}