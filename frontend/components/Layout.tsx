
import React from 'react';
import { View } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: View;
  onNavigate: (view: View) => void;
  onNewSession: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onNavigate, onNewSession }) => {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Abstract Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => onNavigate('main')}
          >
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              Meet<span className="text-blue-400">2</span>Action
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button 
              onClick={() => onNavigate('main')}
              className={`transition-colors ${activeView === 'main' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => onNavigate('integrations')}
              className={`transition-colors ${activeView === 'integrations' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Integrations
            </button>
            <button 
              onClick={onNewSession}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-full text-white hover:bg-slate-700 transition-all hover:scale-105"
            >
              New Session
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 p-6 md:p-12 lg:p-24 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-slate-500 text-sm">
        <p>&copy; 2026 Meet2Action. Powering the future of productive meetings.</p>
      </footer>
    </div>
  );
};

export default Layout;
