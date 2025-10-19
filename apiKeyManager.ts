import { AppSettings, ContentType, ApiKey } from './types';

// Dedicated storage keys for each service to prevent conflicts
const GEMINI_KEYS_STORAGE_KEY = 'geminiApiKeys_v2';
const ACTIVE_KEY_INDEX_STORAGE_KEY = 'activeGeminiApiKeyIndex_v2';
const OPENAI_KEYS_STORAGE_KEY = 'openaiApiKeys_v2';
const ACTIVE_OPENAI_KEY_INDEX_STORAGE_KEY = 'activeOpenAIApiKeyIndex_v2';
const IMGBB_API_KEY = 'imgbbApiKey_v2'; // Updated key
const YOUTUBE_API_KEY = 'youtubeApiKey_v2'; // Updated key
const LEGACY_IMGBB_API_KEY = 'imgbbApiKey';
const LEGACY_YOUTUBE_API_KEY = 'youtubeApiKey';


// Helper function to safely parse JSON from localStorage
function safeJsonParse<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Failed to parse stored JSON for key "${key}":`, e);
    return fallback;
  }
}

// Helper to load a single key, handling migration from old string format
function loadSingleApiKey(newKey: string, legacyKey: string): ApiKey {
    const newItem = localStorage.getItem(newKey);
    if (newItem) {
        try {
            const parsed = JSON.parse(newItem);
            if (parsed && typeof parsed.key === 'string') {
                return { key: parsed.key, status: parsed.status || 'unknown' };
            }
        } catch (e) { /* Fall through */ }
    }
    // Check for legacy string key
    const legacyValue = localStorage.getItem(legacyKey);
    if (legacyValue) {
        return { key: legacyValue, status: 'unknown' };
    }
    return { key: '', status: 'unknown' };
}


export const apiKeyManager = {
  loadSettings: (): AppSettings => {
    const storedKeys = localStorage.getItem(GEMINI_KEYS_STORAGE_KEY);
    let geminiApiKeys: ApiKey[] = [];
    if (storedKeys) {
        try {
            const parsed = JSON.parse(storedKeys);
            if (Array.isArray(parsed)) {
                geminiApiKeys = parsed.map(item => {
                    if (typeof item === 'string') {
                        return { key: item, status: 'unknown' };
                    }
                    if(item && typeof item.key === 'string') {
                        return { key: item.key, status: item.status || 'unknown' };
                    }
                    return null;
                }).filter((item): item is ApiKey => item !== null);
            }
        } catch (e) {
            console.error("Failed to parse Gemini keys from localStorage", e);
        }
    }

    const storedOpenAIKeys = localStorage.getItem(OPENAI_KEYS_STORAGE_KEY);
    let openaiApiKeys: ApiKey[] = [];
    if (storedOpenAIKeys) {
        try {
            const parsed = JSON.parse(storedOpenAIKeys);
            if (Array.isArray(parsed)) {
                openaiApiKeys = parsed.map(item => {
                    if (typeof item === 'string') {
                        return { key: item, status: 'unknown' };
                    }
                    if(item && typeof item.key === 'string') {
                        return { key: item.key, status: item.status || 'unknown' };
                    }
                    return null;
                }).filter((item): item is ApiKey => item !== null);
            }
        } catch (e) {
            console.error("Failed to parse OpenAI keys from localStorage", e);
        }
    }

    return {
      geminiApiKeys,
      activeGeminiKeyIndex: safeJsonParse<number>(ACTIVE_KEY_INDEX_STORAGE_KEY, 0),
      openaiApiKeys,
      activeOpenAIKeyIndex: safeJsonParse<number>(ACTIVE_OPENAI_KEY_INDEX_STORAGE_KEY, 0),
      imgbbApiKey: loadSingleApiKey(IMGBB_API_KEY, LEGACY_IMGBB_API_KEY),
      youtubeApiKey: loadSingleApiKey(YOUTUBE_API_KEY, LEGACY_YOUTUBE_API_KEY),
    };
  },

  saveSettings: (settings: Partial<AppSettings>): void => {
    if (settings.geminiApiKeys !== undefined) {
      const sanitizedKeys = settings.geminiApiKeys
        .map(k => ({ key: k.key.trim(), status: k.status || 'unknown' }))
        .filter(k => k.key);
      localStorage.setItem(GEMINI_KEYS_STORAGE_KEY, JSON.stringify(sanitizedKeys));
      localStorage.setItem(ACTIVE_KEY_INDEX_STORAGE_KEY, '0');
    }
    if (settings.openaiApiKeys !== undefined) {
      const sanitizedKeys = settings.openaiApiKeys
        .map(k => ({ key: k.key.trim(), status: k.status || 'unknown' }))
        .filter(k => k.key);
      localStorage.setItem(OPENAI_KEYS_STORAGE_KEY, JSON.stringify(sanitizedKeys));
      localStorage.setItem(ACTIVE_OPENAI_KEY_INDEX_STORAGE_KEY, '0');
    }
    if (settings.imgbbApiKey !== undefined) {
      const keyToSave = { key: settings.imgbbApiKey.key.trim(), status: settings.imgbbApiKey.status || 'unknown' };
      localStorage.setItem(IMGBB_API_KEY, JSON.stringify(keyToSave));
    }
    if (settings.youtubeApiKey !== undefined) {
        const keyToSave = { key: settings.youtubeApiKey.key.trim(), status: settings.youtubeApiKey.status || 'unknown' };
        localStorage.setItem(YOUTUBE_API_KEY, JSON.stringify(keyToSave));
    }
  },

  getActiveGeminiApiKey: (): string | null => {
    const keys = apiKeyManager.loadSettings().geminiApiKeys;
    if (keys.length === 0) return null;
    
    const index = safeJsonParse<number>(ACTIVE_KEY_INDEX_STORAGE_KEY, 0);
    
    if (index >= keys.length) {
      localStorage.setItem(ACTIVE_KEY_INDEX_STORAGE_KEY, '0');
      return keys[0]?.key || null;
    }
    return keys[index]?.key || null;
  },

  rotateToNextGeminiKey: (): string | null => {
    const keys = apiKeyManager.loadSettings().geminiApiKeys;
    if (keys.length === 0) return null;
    
    const currentIndex = safeJsonParse<number>(ACTIVE_KEY_INDEX_STORAGE_KEY, 0);
    const nextIndex = (currentIndex + 1) % keys.length;
    localStorage.setItem(ACTIVE_KEY_INDEX_STORAGE_KEY, String(nextIndex));
    return keys[nextIndex]?.key || null;
  },
  
  hasGeminiKeys: (): boolean => {
    return apiKeyManager.loadSettings().geminiApiKeys.length > 0;
  },

  getTotalGeminiKeys: (): number => {
    return apiKeyManager.loadSettings().geminiApiKeys.length;
  },

  getActiveGeminiKeyIndex: (): number => {
    return safeJsonParse<number>(ACTIVE_KEY_INDEX_STORAGE_KEY, 0);
  },

  // OpenAI API Key Management
  getActiveOpenAIApiKey: (): string | null => {
    const keys = apiKeyManager.loadSettings().openaiApiKeys;
    if (keys.length === 0) return null;
    
    const index = safeJsonParse<number>(ACTIVE_OPENAI_KEY_INDEX_STORAGE_KEY, 0);
    
    if (index >= keys.length) {
      localStorage.setItem(ACTIVE_OPENAI_KEY_INDEX_STORAGE_KEY, '0');
      return keys[0]?.key || null;
    }
    return keys[index]?.key || null;
  },

  rotateToNextOpenAIKey: (): string | null => {
    const keys = apiKeyManager.loadSettings().openaiApiKeys;
    if (keys.length === 0) return null;
    
    const currentIndex = safeJsonParse<number>(ACTIVE_OPENAI_KEY_INDEX_STORAGE_KEY, 0);
    const nextIndex = (currentIndex + 1) % keys.length;
    localStorage.setItem(ACTIVE_OPENAI_KEY_INDEX_STORAGE_KEY, String(nextIndex));
    return keys[nextIndex]?.key || null;
  },
  
  hasOpenAIKeys: (): boolean => {
    return apiKeyManager.loadSettings().openaiApiKeys.length > 0;
  },

  getTotalOpenAIKeys: (): number => {
    return apiKeyManager.loadSettings().openaiApiKeys.length;
  },

  getActiveOpenAIKeyIndex: (): number => {
    return safeJsonParse<number>(ACTIVE_OPENAI_KEY_INDEX_STORAGE_KEY, 0);
  },

  // New: Functions to export and import all app settings
  exportSettings: (): void => {
      const settings: { [key: string]: string | null } = {};

      // Define all known keys and prefixes used by the app to avoid exporting third-party data
      const knownStaticKeys = [
          GEMINI_KEYS_STORAGE_KEY,
          ACTIVE_KEY_INDEX_STORAGE_KEY,
          IMGBB_API_KEY,
          YOUTUBE_API_KEY,
          'theme',
          'horusPersonaSettings_v1',
          'horusSourceLibrary_v1',
          'horusFavoriteArticles_v1',
          'selectedBlogId',
      ];
      
      const knownDynamicKeys: string[] = [];
      // Generate keys for each content type page (e.g., News_rawInput, News_preferences)
      Object.values(ContentType).forEach(contentType => {
          // FIX: Cast `contentType` to string to ensure the `.replace` method is available, fixing the type error.
          const storageKeyPrefix = (contentType as string).replace(/\s/g, '_');
          knownDynamicKeys.push(`${storageKeyPrefix}_rawInput`);
          knownDynamicKeys.push(`${storageKeyPrefix}_preferences`);
      });
      
      const allKnownKeys = [...knownStaticKeys, ...knownDynamicKeys];
      
      // Iterate over our app's known keys and save them if they exist in localStorage
      allKnownKeys.forEach(key => {
          const value = localStorage.getItem(key);
          if (value !== null) { // Only add keys that actually exist
              settings[key] = value;
          }
      });


      const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `horus-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  },
  
  importSettings: (file: File): Promise<void> => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
              try {
                  const settingsText = event.target?.result as string;
                  const settings = JSON.parse(settingsText);
                  
                  if (typeof settings !== 'object' || settings === null) {
                      throw new Error("الملف غير صالح، يجب أن يحتوي على كائن JSON.");
                  }
                  
                  // Clear existing settings before importing. This is safe now because we only export our own keys.
                  localStorage.clear();

                  // Load settings from the file into localStorage
                  for (const key in settings) {
                      if (Object.prototype.hasOwnProperty.call(settings, key)) {
                          const value = settings[key];
                           // Ensure value is a string before setting, as localStorage only accepts strings.
                          if (typeof value === 'string') {
                            localStorage.setItem(key, value);
                          }
                      }
                  }
                  resolve();
              } catch (e) {
                  reject(new Error(`فشل في تحليل ملف الإعدادات: ${e instanceof Error ? e.message : 'Unknown error'}`));
              }
          };
          reader.onerror = () => {
              reject(new Error("فشل في قراءة الملف."));
          };
          reader.readAsText(file);
      });
  }
};