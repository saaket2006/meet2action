import React, { useEffect, useState } from 'react';
import { View } from '../types';
// @ts-ignore
import LogoImage from '../../Logo.png';

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

    return (
        <div className="relative min-h-screen bg-slate-950 flex flex-col items-center justify-center overflow-hidden font-sans selection:bg-blue-500/30">

            {/* Background Effects */}
            <div
                className="absolute inset-0 z-0 opacity-40 transition-opacity duration-1000 ease-in-out"
                style={{
                    background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(59, 130, 246, 0.15) 0%, rgba(15, 23, 42, 0) 50%)`
                }}
            />
            <div className="absolute inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

            {/* Floating Orbs */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] animate-pulse pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse pointer-events-none mix-blend-screen" style={{ animationDelay: '2s', animationDuration: '7s' }} />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-900/50 rounded-full blur-[150px] pointer-events-none" />

            {/* Content */}
            <div className="z-10 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto mt-[-5vh]">

                {/* Logo / Brand */}
                <div className="flex items-center gap-4 mb-8 animate-in slide-in-from-bottom-8 fade-in duration-1000">
                    {LOGO_URL ? (
                        <img src={LOGO_URL} alt="Meet2Action Logo" className="h-16 md:h-20 object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                    ) : (
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-black text-4xl shadow-[0_0_30px_rgba(59,130,246,0.6)] border border-blue-400/30">
                            M
                        </div>
                    )}
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-white drop-shadow-md">
                        Meet<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">2</span>Action
                    </h1>
                </div>

                {/* Hero Text */}
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-slate-100 to-slate-400 mb-6 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-150 py-2">
                    Intelligence for <br className="hidden md:block" /> the Next Era of Work.
                </h2>

                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-300">
                    Transform your raw meeting data into structured, actionable insights in seconds. Powered by advanced reasoning engines and tailored for elite teams.
                </p>

                {/* Call to Action */}
                <div className="animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-500">
                    <button
                        onClick={() => onEnter('main')}
                        className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                    >
                        {/* Button Background Glow */}
                        <div className="absolute inset-0 bg-blue-600/20 group-hover:bg-blue-600/30 transition-colors" />

                        {/* Button Border Gradient (Animated) */}
                        <div className="absolute inset-[1px] bg-slate-950 rounded-full" />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-full opacity-50 blur-sm group-hover:opacity-100 transition-opacity duration-500 origin-center rotate-180 animate-spin-slow" style={{ animationDuration: '4s' }} />
                        <div className="absolute inset-0 rounded-full border border-blue-500/30 group-hover:border-blue-400/50 transition-colors" />

                        {/* Button Content */}
                        <span className="relative z-10 flex items-center gap-3 text-slate-100 group-hover:text-white transition-colors">
                            Access Dashboard
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </span>
                    </button>
                </div>

                {/* Feature Highlights (Subtle) */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-slate-400 text-sm animate-in fade-in duration-1000 delay-700 opacity-80">
                    <div className="flex flex-col items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Instant Processing</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                        <span>Deep Context Engine</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>Enterprise Security</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
