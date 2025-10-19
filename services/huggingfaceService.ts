/**
 * 🎨 Pollinations.ai Image Generation Service
 * 100% Free, unlimited, fast image generation - NO API KEYS NEEDED!
 * Works directly in the browser with Stable Diffusion XL
 */

/**
 * Generate image using Pollinations.ai (completely free, no API key needed)
 * @param prompt - Text description of the image to generate
 * @param log - Logging function for status updates
 * @returns Base64 encoded image data
 */
export async function generateImageWithPollinations(
    prompt: string,
    log: (message: string) => void
): Promise<string> {
    log('🎨 بدء توليد الصورة باستخدام Pollinations.ai (مجاني 100%)...');
    
    try {
        // Pollinations.ai URL format: https://image.pollinations.ai/prompt/{encoded_prompt}
        // Additional parameters: ?width=1024&height=1024&model=flux&seed=random&nologo=true
        const encodedPrompt = encodeURIComponent(prompt);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&model=flux&seed=${Date.now()}&nologo=true&enhance=true`;
        
        log('🌐 جاري تحميل الصورة من Pollinations.ai...');
        
        // Fetch the image
        const response = await fetch(imageUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: فشل تحميل الصورة`);
        }
        
        // Get image blob
        const imageBlob = await response.blob();
        
        // Convert blob to base64
        const base64Image = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = (reader.result as string).split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(imageBlob);
        });
        
        log('✅ تم توليد الصورة بنجاح باستخدام Pollinations.ai!');
        
        return base64Image;
        
    } catch (error: any) {
        throw new Error(`فشل توليد الصورة من Pollinations.ai: ${error.message}`);
    }
}

/**
 * Alternative: Generate image with different model (Turbo for faster generation)
 * @param prompt - Text description of the image to generate
 * @param log - Logging function for status updates
 * @returns Base64 encoded image data
 */
export async function generateImageWithPollinationsTurbo(
    prompt: string,
    log: (message: string) => void
): Promise<string> {
    log('⚡ بدء توليد الصورة السريع باستخدام Pollinations.ai Turbo...');
    
    try {
        const encodedPrompt = encodeURIComponent(prompt);
        // Using turbo model for faster generation (2-3 seconds)
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&model=turbo&seed=${Date.now()}&nologo=true`;
        
        log('🌐 جاري تحميل الصورة...');
        
        const response = await fetch(imageUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: فشل تحميل الصورة`);
        }
        
        const imageBlob = await response.blob();
        
        const base64Image = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = (reader.result as string).split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(imageBlob);
        });
        
        log('✅ تم توليد الصورة بنجاح!');
        
        return base64Image;
        
    } catch (error: any) {
        throw new Error(`فشل توليد الصورة: ${error.message}`);
    }
}

/**
 * Check if Pollinations.ai service is available
 */
export async function checkPollinationsAvailability(): Promise<boolean> {
    try {
        const testUrl = 'https://image.pollinations.ai/prompt/test?width=64&height=64&nologo=true';
        const response = await fetch(testUrl, { method: 'HEAD' });
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Get service information
 */
export function getServiceInfo(): {
    name: string;
    isFree: boolean;
    requiresApiKey: boolean;
    estimatedSpeed: string;
} {
    return {
        name: 'Pollinations.ai',
        isFree: true,
        requiresApiKey: false,
        estimatedSpeed: '3-5 seconds'
    };
}