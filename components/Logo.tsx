import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <svg
            className={className}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0891b2" /> 
                    <stop offset="100%" stopColor="#22d3ee" /> 
                </linearGradient>
            </defs>
            <path
                d="M8.64,50 C8.64,50 32.39,20 50,20 C67.61,20 91.36,50 91.36,50 C91.36,50 67.61,80 50,80 C32.39,80 8.64,50 8.64,50 Z"
                stroke="url(#logoGradient)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle
                cx="50"
                cy="50"
                r="15"
                fill="url(#logoGradient)"
            />
            <circle
                cx="50"
                cy="50"
                r="6"
                className="fill-white dark:fill-gray-900"
            />
        </svg>
    );
};

export default Logo;
