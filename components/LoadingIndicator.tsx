import React from 'react';

interface LoadingIndicatorProps {
  statusText?: string;
  progress?: number; // 0 to 1
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ statusText, progress }) => {
    // If statusText and progress are provided, render the new detailed view
    if (statusText && typeof progress !== 'undefined') {
        const numBars = 15;

        // Determine color based on progress
        const color = progress > 0.85
            ? '#34d399' // Emerald-400 for near completion
            : progress > 0.6
            ? '#a78bfa' // Violet-400 for progressing
            : '#22d3ee'; // Cyan-400 for start

        const textShadow = progress > 0.85 ? `0 0 8px #34d399` : `0 0 8px ${color}`;

        return (
            <div className="flex flex-col items-center justify-center gap-6 w-full">
                <div
                    className="flex items-center justify-center gap-1 h-20 w-48"
                    style={{ '--bar-color': color } as React.CSSProperties}
                >
                    <style>{`
                        @keyframes wave {
                            0%, 100% { height: 4px; opacity: 0.5; }
                            50% { height: 100%; opacity: 1; }
                        }
                        .wave-bar {
                            background-color: var(--bar-color);
                            filter: drop-shadow(0 0 4px var(--bar-color));
                            width: 6px;
                            border-radius: 3px;
                            animation-name: wave;
                            animation-timing-function: cubic-bezier(0.45, 0, 0.55, 1);
                            animation-iteration-count: infinite;
                        }
                    `}</style>
                    {[...Array(numBars)].map((_, i) => (
                        <div
                            key={i}
                            className="wave-bar"
                            style={{
                                animationDuration: `${Math.random() * 0.7 + 0.9}s`,
                                animationDelay: `${i * 0.08}s`,
                            }}
                        ></div>
                    ))}
                </div>
                <p 
                    className="text-lg font-semibold text-gray-500 dark:text-gray-400 transition-all duration-500" 
                    style={{ color, textShadow }}
                >
                    {statusText}
                </p>
            </div>
        );
    }

    // Otherwise, render the original small version for buttons etc.
    const barBaseStyle: React.CSSProperties = {
        animation: `sound 1.2s ease-in-out infinite`,
        width: '4px',
        backgroundColor: 'currentColor',
        display: 'inline-block'
    };

    return (
        <div className="flex items-end justify-center space-x-1 h-6 text-cyan-500 dark:text-cyan-400">
            <style>{`
                @keyframes sound {
                  0%, 100% { height: 4px; }
                  50% { height: 24px; }
                }
            `}</style>
            <div style={{ ...barBaseStyle, animationDelay: '0s' }}></div>
            <div style={{ ...barBaseStyle, animationDelay: '0.2s' }}></div>
            <div style={{ ...barBaseStyle, animationDelay: '0.4s' }}></div>
            <div style={{ ...barBaseStyle, animationDelay: '0.6s' }}></div>
            <div style={{ ...barBaseStyle, animationDelay: '0.8s' }}></div>
        </div>
    );
};

export default LoadingIndicator;
