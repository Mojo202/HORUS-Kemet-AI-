import React, { useState } from 'react';
import { ContentType, ToolType } from '../types';
import { getGuideContent, getToolGuideContent } from './guideContent';

interface GuideSectionProps {
    contentType?: ContentType;
    toolType?: ToolType;
    description?: string;
}

const GuideSection: React.FC<GuideSectionProps> = ({ contentType, toolType, description }) => {
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const guideContent = contentType ? getGuideContent(contentType) : (toolType ? getToolGuideContent(toolType) : null);
    
    // Reverted to the more elaborate, original button style the user preferred.
    const glassButtonClasses = "w-full flex justify-between items-center p-4 rounded-lg bg-purple-600/30 dark:bg-purple-500/20 backdrop-blur-sm border border-purple-500/50 dark:border-purple-400/40 text-white hover:bg-purple-600/50 dark:hover:bg-purple-500/40 transition-all duration-300 shadow-lg";

    if (!guideContent) return null;

    if (isGuideOpen) {
        return (
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 mt-8">
                <button
                    onClick={() => setIsGuideOpen(false)}
                    className={glassButtonClasses}
                    aria-expanded="true"
                >
                    <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-3">
                        <i className="fas fa-book-open"></i>
                        الدليل الشامل لاستخدام الأداة
                    </h3>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-200 transform transition-transform duration-300 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                <div 
                    className="bg-gray-900/50 p-6 rounded-b-lg border-t-0 border border-cyan-500/30 text-gray-300 space-y-8"
                    dangerouslySetInnerHTML={{ __html: guideContent }}
                />
            </div>
        );
    }

    return (
        <div className="mt-8">
            {/* This block restores the descriptive text ABOVE the button */}
            <div className="mb-2 p-3 bg-gray-900/50 rounded-lg border border-cyan-500/30 text-center">
                <h4 className="font-semibold text-cyan-400 flex items-center justify-center gap-2">
                    <i className="fas fa-book-open"></i>
                    دليل الاستخدام والنصائح الاحترافية
                </h4>
                {description && (
                     <p className="text-xs text-gray-400 mt-1">
                        {description}
                    </p>
                )}
            </div>
            
            <button
                onClick={() => setIsGuideOpen(true)}
                className={glassButtonClasses}
                aria-expanded="false"
            >
                <span className="font-semibold text-sm">انقر على الزر لعرض أو إخفاء الدليل</span>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-200 transform transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
        </div>
    );
};

export default GuideSection;
