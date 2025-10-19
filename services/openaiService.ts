interface OpenAIConfig {
  apiKey: string;
  model?: string;
}

interface ImageGenerationOptions {
  prompt: string;
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  aspectRatio?: string;
}

interface TextGenerationOptions {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * تحويل aspect ratio لمقاسات DALL-E 3
 */
function aspectRatioToSize(aspectRatio: string): '1024x1024' | '1792x1024' | '1024x1792' {
  const ratioMap: Record<string, '1024x1024' | '1792x1024' | '1024x1792'> = {
    '1:1': '1024x1024',
    '16:9': '1792x1024',
    '9:16': '1024x1792',
    '4:3': '1024x1024',
    '3:4': '1024x1792',
    '3:2': '1792x1024',
    '2:3': '1024x1792'
  };

  return ratioMap[aspectRatio] || '1024x1024';
}

/**
 * توليد صورة باستخدام OpenAI DALL-E 3
 */
export async function generateImageWithOpenAI(
  config: OpenAIConfig,
  options: ImageGenerationOptions
): Promise<string> {
  const { apiKey, model = 'dall-e-3' } = config;
  const { prompt, quality = 'standard', style = 'vivid', aspectRatio = '1:1' } = options;
  
  const size = aspectRatioToSize(aspectRatio);

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        prompt,
        n: 1,
        size,
        quality,
        style
      })
    });

    if (!response.ok) {
      const error = await response.json();
      
      // التعامل مع خطأ الحصة
      if (error.error?.code === 'insufficient_quota' || 
          error.error?.message?.includes('quota')) {
        throw new Error('QUOTA_EXCEEDED');
      }
      
      throw new Error(error.error?.message || 'فشل توليد الصورة من OpenAI');
    }

    const data = await response.json();
    return data.data[0].url;
  } catch (error: any) {
    console.error('OpenAI Image Generation Error:', error);
    
    if (error.message === 'QUOTA_EXCEEDED') {
      throw error;
    }
    
    throw new Error(`خطأ في OpenAI: ${error.message}`);
  }
}

/**
 * توليد نص باستخدام OpenAI GPT
 */
export async function generateTextWithOpenAI(
  config: OpenAIConfig,
  options: TextGenerationOptions
): Promise<string> {
  const { apiKey, model = 'gpt-4' } = config;
  const { prompt, maxTokens = 2000, temperature = 0.7 } = options;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature
      })
    });

    if (!response.ok) {
      const error = await response.json();
      
      // التعامل مع خطأ الحصة
      if (error.error?.code === 'insufficient_quota' || 
          error.error?.message?.includes('quota')) {
        throw new Error('QUOTA_EXCEEDED');
      }
      
      throw new Error(error.error?.message || 'فشل توليد النص من OpenAI');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error: any) {
    console.error('OpenAI Text Generation Error:', error);
    
    if (error.message === 'QUOTA_EXCEEDED') {
      throw error;
    }
    
    throw new Error(`خطأ في OpenAI: ${error.message}`);
  }
}
