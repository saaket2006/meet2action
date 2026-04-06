import React, { useState, useEffect } from 'react';

const STEPS = [
    { id: 'validate', label: 'Validating Input', icon: '🔬', description: 'Checking file integrity & format' },
    { id: 'transcribe', label: 'AI Transcription', icon: '🔊', description: 'Converting audio to structured text' },
    { id: 'context', label: 'Context Mapping', icon: '🗺️', description: 'Identifying project relationships' },
    { id: 'intelligence', label: 'Intelligence Extraction', icon: '🧠', description: 'Generating insights & action items' },
    { id: 'finalizing', label: 'Finalizing Result', icon: '📄', description: 'Formatting analysis for dashboard' },
];

interface LoadingScreenProps {
    isTextOnly?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isTextOnly }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);

    const activeSteps = isTextOnly 
        ? STEPS.filter(s => s.id !== 'transcribe')
        : STEPS;

    const getGridColsClass = () => {
        const count = activeSteps.length;
        if (count === 4) return 'md:grid-cols-4';
        return 'md:grid-cols-5';
    };

    useEffect(() => {
        // Initial transition to 'Validating Input' (immediate)
        // Transition to 'AI Transcription' after a brief validation delay
        const validationTimer = setTimeout(() => {
            setCurrentStep(1); 
        }, 1500);

        // Progress line animation logic
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                // Determine target progress based on current step
                // We cap the progress at ~40% (Transcription Phase) until the real data arrives
                const targetBase = ((currentStep + 1) / activeSteps.length) * 100;
                
                // If we are in Step 2 (Transcribe), we slow down the bar to indicate work is happening
                // but we NEVER let it cross into Step 3 (Context) until the status changes.
                const cap = currentStep === 1 ? 38 : targetBase; 

                if (prev < cap) return prev + 0.2;
                if (prev > cap + 5) return cap; // Clamp back if we jumped
                return prev;
            });
        }, 100);

        return () => {
            clearTimeout(validationTimer);
            clearInterval(progressInterval);
        };
    }, [currentStep, activeSteps.length]);

    return (
        <div className="fixed inset-0 z-[500] bg-[#020617] flex flex-col items-center justify-center overflow-hidden">

            {/* Background Texture */}
            <div className="noise-bg"></div>

            {/* Speeder Loading Lines */}
            <div className="longfazers">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>

            {/* Centered Content Group */}
            <div className="relative flex flex-col items-center justify-center w-full max-w-4xl px-6">

                {/* Speeder Animation - Visual Center centering */}
                <div className="loader-container h-32 flex items-center justify-center mb-8 -ml-24">
                    <div className="loader">
                        <span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                        </span>
                        <div className="base">
                            <span></span>
                            <div className="face"></div>
                        </div>
                    </div>
                </div>

                {/* Processing Text */}
                <div className="text-center space-y-8 z-20 w-full">
                    <div className="space-y-4">
                        <h1 className="font-space text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white uppercase">
                            <span className="text-blue-400">Processing</span> {activeSteps[currentStep]?.label || 'Summary'}
                        </h1>
                        <p className="font-outfit text-slate-400 font-medium tracking-[0.4em] uppercase text-[10px] md:text-xs">
                            Step {currentStep + 1} of {activeSteps.length}: {activeSteps[currentStep]?.description || 'Generating insights...'}
                        </p>

                    </div>

                    {/* Progress Bar Container */}
                    <div className="relative max-w-md mx-auto py-4">
                        <div className="w-full h-[3px] bg-slate-900 rounded-full overflow-hidden relative">
                            <div 
                                className="h-full bg-blue-500 transition-all duration-500 ease-out shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        {/* Subtle glow beneath progress */}
                        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-48 h-8 bg-blue-500/10 blur-3xl rounded-full"></div>
                    </div>

                    {/* Detailed Steps Grid */}
                    <div className={`grid grid-cols-1 ${getGridColsClass()} gap-3 mt-12`}>
                        {activeSteps.map((step, index) => {
                            const isActive = index === currentStep;
                            const isCompleted = index < currentStep;

                            return (
                                <div 
                                    key={step.id}
                                    className={`relative p-4 rounded-xl border transition-all duration-500 group ${
                                        isActive 
                                            ? 'bg-blue-600/10 border-blue-500/50 scale-105 shadow-[0_0_30px_rgba(59,130,246,0.1)]' 
                                            : isCompleted
                                                ? 'bg-slate-900/40 border-slate-800 opacity-60'
                                                : 'bg-slate-900/20 border-slate-900 opacity-30 grayscale'
                                    }`}
                                >
                                    {isActive && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                                    )}
                                    
                                    <div className={`text-2xl mb-3 transition-transform duration-500 ${isActive ? 'scale-110' : ''}`}>
                                        {step.icon}
                                    </div>
                                    
                                    <h3 className={`font-space text-[10px] font-black uppercase tracking-widest transition-colors ${
                                        isActive ? 'text-blue-400' : 'text-slate-500'
                                    }`}>
                                        {step.label}
                                    </h3>

                                    {isActive && (
                                        <div className="mt-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 animate-loading-strip"></div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Top Branding - Fixed positioned */}
            <div className="absolute top-12 md:top-16 left-8 md:left-16 flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <span className="font-space text-2xl font-black tracking-tighter text-white">Meet2Action</span>
            </div>

        </div>
    );
};

export default LoadingScreen;
