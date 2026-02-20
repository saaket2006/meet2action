// Layout.tsx
import React from 'react';
import { View } from '../types';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  activeView: View;
  onNavigate: (view: View) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onNavigate }) => {
  const { user, login, logout, updateName } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [editedName, setEditedName] = React.useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (user) {
      setEditedName(user.name);
    }
  }, [user]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
        setIsEditingName(false); // Reset edit mode on close
      }
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  const handleSaveName = () => {
    if (editedName.trim()) {
      updateName(editedName);
      setIsEditingName(false);
    }
  };

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

            {/* Login / Connected Button */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-full hover:bg-slate-700 transition-colors"
                >
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt="Profile"
                      className="w-6 h-6 rounded-full border border-slate-600"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white">
                      {user.name ? user.name.charAt(0) : 'U'}
                    </div>
                  )}
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-slate-400 leading-none"></span>
                    <span className="text-sm font-medium text-white leading-none">{user.name || "User"}</span>
                  </div>
                  <svg className={`w-4 h-4 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-slate-700/50">
                      <p className="text-xs text-slate-400 mb-1">Signed in as</p>
                      <p className="text-sm font-bold text-white truncate">{user.email}</p>
                    </div>

                    {isEditingName ? (
                      <div className="p-4 border-b border-slate-700/50 bg-slate-900/50">
                        <label className="text-[10px] uppercase font-bold text-blue-400 mb-1 block">Display Name</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={handleSaveName}
                            className="p-1 bg-blue-600 hover:bg-blue-500 text-white rounded"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors flex items-center gap-3"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Change Display Name
                      </button>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setIsProfileOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-slate-700/50 hover:text-red-300 transition-colors flex items-center gap-3"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={login}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all shadow-lg shadow-blue-600/20"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Login with Google</span>
              </button>
            )}

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
