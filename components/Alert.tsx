import React from 'react';

interface AlertProps {
  type: 'error' | 'warning';
  message: React.ReactNode;
  onClose: () => void;
}

const ErrorIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

const WarningIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
);


const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
    const isError = type === 'error';

    const baseClasses = "rounded-lg relative flex items-start gap-4 shadow-xl overflow-hidden";
    const errorClasses = "bg-red-900/50 border-r-4 border-red-500";
    const warningClasses = "bg-yellow-900/50 border-r-4 border-yellow-500";
    const textErrorClasses = "text-red-100";
    const textWarningClasses = "text-yellow-100";
    const iconErrorClasses = "text-red-400";
    const iconWarningClasses = "text-yellow-400";
    
    return (
        <div className={`${baseClasses} ${isError ? errorClasses : warningClasses}`} role="alert">
            <div className={`p-4 flex-grow flex items-start gap-4 ${isError ? textErrorClasses : textWarningClasses}`}>
                <div className={`flex-shrink-0 mt-0.5 ${isError ? iconErrorClasses : iconWarningClasses}`}>
                    {isError ? <ErrorIcon /> : <WarningIcon />}
                </div>
                <div className="flex-grow">
                    <strong className="font-bold">{isError ? 'خطأ:' : 'تنبيه:'} </strong>
                    <div className="block sm:inline">{message}</div>
                </div>
            </div>
            <button 
                onClick={onClose} 
                className={`p-2 flex-shrink-0 self-start transition-colors ${isError ? 'text-red-300 hover:bg-red-800/50' : 'text-yellow-300 hover:bg-yellow-800/50'}`}
                aria-label="Close"
            >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    );
};

export default Alert;