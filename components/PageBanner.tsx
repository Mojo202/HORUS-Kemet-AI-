import React from 'react';

export const PageBanner: React.FC<{ title: string; iconClass: string; }> = ({ title, iconClass }) => {
    return (
        <div className="flex flex-col items-center gap-4 text-center my-6">
            <div className="relative h-24 w-24 flex items-center justify-center">
                <svg
                    className="absolute h-full w-full text-cyan-500 dark:text-cyan-400 pulsing-triangle"
                    viewBox="0 0 100 100"
                    xmlns="http://www.w3.org/2000/svg"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                >
                    <path d="M50 5 L95 85 L5 85 Z" />
                </svg>
                <i className={`${iconClass} relative text-6xl text-cyan-500 dark:text-cyan-400 eye-animation`}></i>
            </div>
            <h2 className="font-extrabold text-2xl text-gray-800 dark:text-gray-100 tracking-wider" style={{ textShadow: '0 0 5px rgba(34, 211, 238, 0.6), 0 0 10px rgba(34, 211, 238, 0.6), 0 0 15px rgba(34, 211, 238, 0.6)' }}>
                {title}
            </h2>
        </div>
    );
};
