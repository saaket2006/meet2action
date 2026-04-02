import React, { useState } from 'react';
import { View } from '../types';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
// @ts-ignore
import LogoImage from '../assets/Logo.png';

interface LayoutProps {
  children: React.ReactNode;
  activeView: View;
  onNavigate: (view: View) => void;
}

const LOGO_URL = LogoImage;

export default function Layout({ children, activeView, onNavigate }: LayoutProps) {
  const { user, openLoginModal, logout, updateName } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [tempName, setTempName] = useState('');
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (user?.name) {
      setTempName(user.name);
    }
  }, [user]);

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
    {
      id: 'main', label: 'DASHBOARD', icon: (
        <svg className="w-5 h-5 md:w-5.5 md:h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    {
      id: 'integrations', label: 'SETTINGS', icon: (
        <svg className="w-5 h-5 md:w-5.5 md:h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      )
    },
    {
      id: 'contact', label: 'SUPPORT', icon: (
        <svg className="w-5 h-5 md:w-5.5 md:h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex selection:bg-blue-500/30 overflow-hidden">

      {/* Premium Sidebar */}
      <aside className="w-20 md:w-64 lg:w-72 h-screen sticky top-0 border-r border-slate-900 bg-[#020617] flex flex-col items-center md:items-stretch py-8 z-50 transition-all duration-300">

        {/* Logo Section */}
        <div className="px-6 md:px-8 mb-12 flex items-center gap-4">
          {LOGO_URL ? (
            <img src={LOGO_URL} alt="Meet2Action Logo" className="w-10 h-10 md:w-11 md:h-11 object-contain flex-shrink-0 drop-shadow-md" />
          ) : (
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg saturate-150">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          )}
          <div className="hidden md:block">
            <h1 className="font-space text-xl font-black tracking-tighter leading-none">Meet<span className="text-blue-500">2</span>Action</h1>
            <p className="text-[10px] font-space text-slate-500 font-bold tracking-[0.1em] mt-1.5 uppercase">Intelligence Sync</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 px-3 md:px-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'contact') setShowContact(true);
                else onNavigate(item.id as View);
              }}
              className={`w-full flex items-center justify-center md:justify-start gap-4 p-3.5 md:px-5 md:py-3 rounded-xl transition-all duration-300 group ${activeView === item.id
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-inner'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
            >
              <span className={`transition-transform duration-300 ${activeView === item.id ? 'scale-105' : 'group-hover:scale-105'}`}>
                {item.icon}
              </span>
              <span className="hidden md:block font-space text-[11px] font-black tracking-wider">{item.label}</span>
              {activeView === item.id && <div className="absolute right-0 w-1 h-8 bg-blue-500 rounded-l-full hidden md:block"></div>}
            </button>
          ))}
        </nav>

        {/* Profile Section */}
        <div className="px-3 md:px-4 pt-6 border-t border-slate-900">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-full flex items-center justify-center md:justify-start gap-3 p-2 rounded-xl border border-transparent hover:border-slate-800 transition-all bg-slate-900/20"
              >
                <img
                  src={user.picture}
                  className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-slate-800 object-cover shadow-md"
                  alt="Profile"
                />
                <div className="hidden md:block text-left overflow-hidden">
                  <p className="text-[11px] font-black text-white truncate uppercase tracking-tight">{user.name}</p>
                  <p className="text-[9px] text-slate-500 font-bold truncate tracking-tighter uppercase opacity-80">{user.email}</p>
                </div>
              </button>

              {isProfileOpen && (
                <div className="absolute bottom-full left-0 w-full mb-3 md:w-60 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in zoom-in-95 duration-200">
                  <div className="p-4 border-b border-slate-800 bg-slate-950/20">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 shadow-sm">Connected Account</p>
                    <p className="text-xs font-black text-white">{user.name}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full p-4 text-xs font-black text-red-500 hover:bg-red-500/10 text-left transition-colors flex items-center gap-2 uppercase tracking-wide"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openLoginModal}
              className="w-full h-11 md:h-10 bg-white hover:bg-slate-200 text-slate-950 font-space font-black text-[10px] tracking-widest rounded-lg transition-all shadow-md"
            >
              SIGN IN
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto bg-[#020617] relative">
        <div className="absolute inset-0 noise-bg pointer-events-none opacity-[0.03]"></div>
        <div className="relative z-10 min-h-full">
          {children}
        </div>
      </main>

      <LoginModal />

      {/* Support Modal */}
      {showContact && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-10 text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-8 mx-auto border border-blue-500/20 shadow-inner">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h2 className="font-space text-2xl font-black text-white mb-3 uppercase tracking-tighter shadow-sm">Support Sync</h2>
            <p className="text-slate-400 text-sm mb-10 font-outfit max-w-xs mx-auto leading-relaxed">Connect with our support team regarding feature requests or report issues.</p>
            <a href="mailto:saaketprojects@gmail.com" className="block w-full py-4 bg-slate-800 border border-slate-700/50 rounded-xl text-blue-400 font-space font-black text-xs tracking-widest hover:bg-slate-750 transition-all mb-4 shadow-lg">
              SAAKETPROJECTS@GMAIL.COM
            </a>
            <button onClick={() => setShowContact(false)} className="text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-slate-300 transition-colors py-2">
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
