import React, { useState, useEffect, useCallback, useMemo } from 'react';

interface TextToSpeechPlayerProps {
    htmlContent: string;
}

const TextToSpeechPlayer: React.FC<TextToSpeechPlayerProps> = ({ htmlContent }) => {
    const [isSupported, setIsSupported] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(null);
    const [playbackState, setPlaybackState] = useState<'idle' | 'playing' | 'paused'>('idle');

    // Memoize the text content to avoid re-parsing on every render
    const textToSpeak = useMemo(() => {
        if (typeof document === 'undefined') return '';
        const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
        // Remove script and style tags to avoid reading their content
        doc.querySelectorAll('script, style').forEach(el => el.remove());
        return doc.body.textContent || "";
    }, [htmlContent]);

    const handleVoicesChanged = useCallback(() => {
        if (typeof window.speechSynthesis === 'undefined') return;
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
        if (availableVoices.length > 0) {
            const currentVoiceExists = availableVoices.some(v => v.voiceURI === selectedVoiceURI);
            if (!selectedVoiceURI || !currentVoiceExists) {
                // Prefer an Arabic voice if available, otherwise use the first available voice
                const arabicVoice = availableVoices.find(v => v.lang.startsWith('ar'));
                setSelectedVoiceURI(arabicVoice ? arabicVoice.voiceURI : availableVoices[0].voiceURI);
            }
        }
    }, [selectedVoiceURI]);


    useEffect(() => {
        if ('speechSynthesis' in window) {
            setIsSupported(true);
            
            handleVoicesChanged(); // Initial load
            window.speechSynthesis.onvoiceschanged = handleVoicesChanged; // Listener for async voices

            // Cleanup
            return () => {
                window.speechSynthesis.cancel();
                window.speechSynthesis.onvoiceschanged = null;
            };
        }
    }, [handleVoicesChanged]);
    
    // Stop speaking if the article content changes
    useEffect(() => {
        return () => {
            if (window.speechSynthesis?.speaking || window.speechSynthesis?.pending) {
                window.speechSynthesis.cancel();
                setPlaybackState('idle');
            }
        };
    }, [textToSpeak]);


    const handlePlay = () => {
        if (!textToSpeak.trim() || playbackState === 'playing') return;

        if (playbackState === 'paused') {
            handleResume();
            return;
        }

        window.speechSynthesis.cancel(); // Clear any previous utterance queue

        // Split text into smaller, manageable chunks (sentences).
        const chunks = textToSpeak.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g) || [];

        if (chunks.length === 0) return;

        chunks.forEach((chunk, index) => {
            const utterance = new SpeechSynthesisUtterance(chunk);
            const selectedVoice = voices.find(v => v.voiceURI === selectedVoiceURI);
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
            
            // Only set the onend handler for the very last chunk to reset the UI state.
            if (index === chunks.length - 1) {
                utterance.onend = () => setPlaybackState('idle');
            }
            
            utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
                console.error(`Speech synthesis error: ${e.error} on chunk: "${chunk}"`);
                // Stop everything on error and reset state.
                window.speechSynthesis.cancel();
                setPlaybackState('idle');
            };

            window.speechSynthesis.speak(utterance);
        });

        setPlaybackState('playing');
    };

    const handlePause = () => {
        window.speechSynthesis.pause();
        setPlaybackState('paused');
    };

    const handleResume = () => {
        window.speechSynthesis.resume();
        setPlaybackState('playing');
    };

    const handleStop = () => {
        window.speechSynthesis.cancel();
        setPlaybackState('idle');
    };

    if (!isSupported) {
        return null;
    }

    return (
        <div className="p-3 bg-gray-100 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2">
                {(playbackState === 'idle' || playbackState === 'paused') && (
                    <button onClick={handlePlay} title={playbackState === 'paused' ? "استئناف" : "استمع للمقال"} className="p-2 rounded-full bg-cyan-600 text-white hover:bg-cyan-700 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                    </button>
                )}
                {playbackState === 'playing' && (
                    <button onClick={handlePause} title="إيقاف مؤقت" className="p-2 rounded-full bg-yellow-500 text-white hover:bg-yellow-600 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    </button>
                )}
                 {(playbackState === 'playing' || playbackState === 'paused') && (
                    <button onClick={handleStop} title="إيقاف" className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" /></svg>
                    </button>
                )}
            </div>
            
            <select
                value={selectedVoiceURI || ''}
                onChange={(e) => setSelectedVoiceURI(e.target.value)}
                disabled={voices.length === 0}
                className="w-full max-w-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800 dark:text-gray-200"
                aria-label="اختر الصوت"
            >
                {voices.length > 0 ? (
                    voices.map(voice => (
                        <option key={voice.voiceURI} value={voice.voiceURI}>
                            {`${voice.name} (${voice.lang})`}
                        </option>
                    ))
                ) : (
                    <option>جاري تحميل الأصوات...</option>
                )}
            </select>
        </div>
    );
};

export default TextToSpeechPlayer;