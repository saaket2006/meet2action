import React, { useEffect, useState } from 'react';
import { View } from '../types';
// @ts-ignore
import LogoImage from '../assets/Logo.png';

interface LandingPageProps {
    onEnter: (view: View) => void;
}

const LOGO_URL = LogoImage;

export default function LandingPage({ onEnter }: LandingPageProps) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth) * 100,
                y: (e.clientY / window.innerHeight) * 100,
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const scrollToFeatures = () => {
        const featuresSection = document.getElementById('features');
        if (featuresSection) {
            featuresSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="relative min-h-screen bg-slate-950 flex flex-col items-center justify-center selection:bg-blue-500/30">

            {/* Background Texture & Grain */}
            <div className="noise-bg"></div>

            {/* Dynamic Spotlight Effect */}
            <div
                className="absolute inset-0 z-0 opacity-40 transition-opacity duration-1000 ease-in-out pointer-events-none"
                style={{
                    background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(56, 189, 248, 0.1) 0%, rgba(15, 23, 42, 0) 60%)`
                }}
            />

            {/* Floating Orbs for Premium feel */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] animate-pulse pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse pointer-events-none mix-blend-screen" style={{ animationDelay: '2s' }} />

            {/* Main Content Hero - Centered vertically and horizontally */}
            <div className="z-10 flex flex-col items-center justify-center text-center px-6 md:px-12 max-w-5xl mx-auto min-h-screen pt-20">

                {/* Logo & Brand Header */}
                <div className="flex flex-col items-center gap-6 mb-10 animate-in slide-in-from-bottom-8 fade-in duration-1000 fill-mode-both">
                    {LOGO_URL ? (
                        <img src={LOGO_URL} alt="Meet2Action Logo" className="h-16 md:h-20 object-contain drop-shadow-[0_0_20px_rgba(56,189,248,0.3)] mb-4" />
                    ) : (
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-black text-4xl shadow-lg border border-blue-400/30 mb-4">
                            M
                        </div>
                    )}
                    <h1 className="font-space text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter text-white leading-tight">
                        Meet<span className="text-gradient">2</span>Action
                    </h1>
                </div>

                {/* Hero Title */}
                <h2 className="font-space text-2xl md:text-4xl lg:text-5xl font-black tracking-tighter text-slate-100 mb-8 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-150 leading-[1.1] max-w-4xl">
                    TRANSFORM ONLINE MEETINGS <br className="hidden md:block" />
                    INTO STRUCTURED ACTIONS.
                </h2>

                {/* Sub-hero text */}
                <p className="font-outfit text-sm md:text-base lg:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-300 opacity-80">
                    Upload transcripts, meeting minutes, or recorded sessions to instantly extract summaries and actionable items. Built for teams that demand clarity after every sync.
                </p>

                {/* Call To Action */}
                <div className="flex flex-col md:flex-row items-center gap-5 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-500">
                    <button
                        onClick={() => onEnter('main')}
                        className="group relative px-8 py-3.5 overflow-hidden rounded-lg font-space font-black text-base md:text-lg uppercase tracking-wider transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-xl shadow-blue-500/10"
                    >
                        <div className="absolute inset-0 bg-blue-600 group-hover:bg-blue-500 transition-colors" />
                        <span className="relative z-10 flex items-center gap-3 text-white">
                            Launch Dashboard
                            <svg className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </span>
                    </button>

                    <button
                        onClick={scrollToFeatures}
                        className="px-8 py-3.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-space font-black uppercase tracking-wider text-base hover:bg-slate-800 transition-colors shadow-lg active:scale-95"
                    >
                        Features
                    </button>
                </div>

                {/* Small indicator (down arrow) */}
                <div className="mt-16 animate-bounce opacity-20">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* Features Section - Targets for scroll */}
            <div id="features" className="z-10 flex flex-col items-center justify-center text-center px-6 md:px-12 max-w-5xl mx-auto py-32">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center animate-in fade-in duration-1000 delay-700">
                    <div className="space-y-4 p-8 glass rounded-2xl border-slate-800/40 hover:border-blue-500/20 transition-all group">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-1 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h4 className="font-space font-black text-lg text-white uppercase tracking-tighter shadow-sm">Transcript Sync</h4>
                        <p className="text-xs md:text-sm font-outfit text-slate-400 opacity-80 leading-relaxed">Process complex meeting logs into high-fidelity summaries with professional clarity.</p>
                    </div>
                    <div className="space-y-4 p-8 glass rounded-2xl border-slate-800/40 hover:border-blue-500/20 transition-all group">
                        <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center mx-auto mb-1 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                        </div>
                        <h4 className="font-space font-black text-lg text-white uppercase tracking-tighter shadow-sm">Action Items</h4>
                        <p className="text-xs md:text-sm font-outfit text-slate-400 opacity-80 leading-relaxed">Automatically extract tasks, assignees, and deadlines directly from recorded dialogue.</p>
                    </div>
                    <div className="space-y-4 p-8 glass rounded-2xl border-slate-800/40 hover:border-blue-500/20 transition-all group">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center mx-auto mb-1 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h4 className="font-space font-black text-lg text-white uppercase tracking-tighter shadow-sm">Calendar Export</h4>
                        <p className="text-xs md:text-sm font-outfit text-slate-400 opacity-80 leading-relaxed">Sync detected tasks directly with your team's existing workflow and Google Calendar.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
