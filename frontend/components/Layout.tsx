
// Layout.tsx
import React, { useState } from 'react';
import { View } from '../types';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
// @ts-ignore
import LogoImage from '../../Logo.png';

interface LayoutProps {
  children: React.ReactNode;
  activeView: View;
  onNavigate: (view: View) => void;
}

// Add your custom logo URL here. If empty, it will fall back to the text/icon logo.
const LOGO_URL = LogoImage;

export default function Layout({ children, activeView, onNavigate }: LayoutProps) {
  const { user, openLoginModal, logout, updateName } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (user?.name) {
      setTempName(user.name);
    }
  }, [user]);

  // Handle click outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
        setIsEditingName(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  const handleSaveName = () => {
    if (tempName.trim()) {
      updateName(tempName);
      setIsEditingName(false);
    }
  };

  const navItems = [
    { id: 'main', label: 'Dashboard', icon: '🏠' },
    { id: 'integrations', label: 'Settings & Integrations', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex selection:bg-blue-500/30 font-sans">

      {/* Mobile Header (Hidden on md+) */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-[#0b0f19] sticky top-0 z-40">
        <div className="flex items-center gap-2">
          {LOGO_URL ? (
            <>
              <img src={LOGO_URL} alt="Meet2Action Logo" className="h-8 object-contain" />
              <span className="font-bold text-lg tracking-tight">Meet<span className="text-blue-500">2</span>Action</span>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-black shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                M
              </div>
              <span className="font-bold text-lg tracking-tight">Meet<span className="text-blue-500">2</span>Action</span>
            </>
          )}
        </div>
        {/* Mobile menu toggle could go here */}
      </header>

      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-800 bg-[#0b0f19] hidden flex-col md:flex">

        {/* Logo Area */}
        <div className="h-20 flex items-center gap-3 px-8 border-b border-slate-800/60 sticky top-0 bg-[#0b0f19] z-10">
          {LOGO_URL ? (
            <>
              <img src={LOGO_URL} alt="Meet2Action Logo" className="h-8 object-contain" />
              <span className="font-extrabold text-xl tracking-tight text-white">
                Meet<span className="text-blue-500">2</span>Action
              </span>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-[0_0_15px_rgba(59,130,246,0.3)] saturate-150">
                M
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                Meet<span className="text-blue-500">2</span>Action
              </span>
            </>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-8 px-4 space-y-8 overflow-y-auto">
          <div>
            <div className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Core</div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id as View)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeView === item.id
                    ? 'bg-slate-800/80 text-white shadow-sm border border-slate-700/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                >
                  <span className={`text-base ${activeView === item.id ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                    {/* Simplified Icons for rendering */}
                    {item.id === 'main' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </span>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* User Profile / Auth */}
        <div className="p-4 border-t border-slate-800/60 bg-[#0b0f19]">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800/60 transition-colors border border-transparent hover:border-slate-700/50"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <img
                    src={user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=2563eb&color=fff`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-slate-700 object-cover bg-slate-800 shrink-0"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      const fallbackSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=2563eb&color=fff`;
                      if (target.src !== fallbackSrc) {
                        target.src = fallbackSrc;
                      } else {
                        target.style.display = 'none';
                      }
                    }}
                  />
                  <div className="text-left truncate">
                    <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute bottom-full left-0 w-full mb-2 bg-[#111827] border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
                  <div className="p-3 border-b border-slate-800">
                    {isEditingName ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                          autoFocus
                        />
                        <button
                          onClick={handleSaveName}
                          className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1.5 rounded text-xs font-medium transition"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center group/edit">
                        <span className="text-sm font-medium text-white truncate pr-2">{user.name}</span>
                        <button
                          onClick={() => setIsEditingName(true)}
                          className="text-slate-500 hover:text-blue-400 opacity-0 group-hover/edit:opacity-100 transition-opacity"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openLoginModal}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:shadow-[0_0_25px_rgba(59,130,246,0.4)]"
            >
              Login
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0f1117]">

        {/* Main scrollable content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12 relative">
          {children}
        </main>
      </div>

      <LoginModal />
    </div>
  );
}
