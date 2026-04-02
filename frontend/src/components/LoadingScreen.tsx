import React from 'react';

const LoadingScreen: React.FC = () => {
    return (
        <div className="absolute inset-0 z-[200] bg-[#020617] flex flex-col items-center justify-center overflow-hidden">
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
            <div className="relative flex flex-col items-center justify-center w-full max-w-2xl px-6">

                {/* Speeder Animation - Visual Center centering */}
                <div className="loader-container h-40 flex items-center justify-center mb-12 -ml-24">
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
                <div className="text-center space-y-6 z-20">
                    <div className="space-y-4">
                        <h1 className="font-space text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white uppercase animate-pulse">
                            <span className="text-blue-400">Processing</span> Summary
                        </h1>
                        <p className="font-outfit text-slate-400 font-medium tracking-[0.4em] uppercase text-xs md:text-sm">
                            Extracting Key Insights & Action Items
                        </p>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="relative pt-8">
                        <div className="w-80 h-[2px] bg-slate-900 rounded-full mx-auto overflow-hidden relative">
                            <div className="h-full bg-blue-500 w-1/3 animate-progress transition-all shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                        </div>
                        {/* Subtle glow beneath progress */}
                        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-48 h-8 bg-blue-500/5 blur-3xl rounded-full"></div>
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
