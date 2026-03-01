import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginModal: React.FC = () => {
    const { isLoginModalOpen, closeLoginModal, loginWithEmail, loginWithGoogle } = useAuth();

    const [isLoginTab, setIsLoginTab] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    if (!isLoginModalOpen) return null;

    const validatePassword = (pwd: string) => {
        const hasLength = pwd.length >= 8;
        const hasUpper = /[A-Z]/.test(pwd);
        const hasNumber = /[0-9]/.test(pwd);
        const hasSymbol = /[\W_]/.test(pwd);

        if (!hasLength) return "Password must be at least 8 characters long.";
        if (!hasUpper) return "Password must contain at least one uppercase letter (A-Z).";
        if (!hasNumber) return "Password must contain at least one number (0-9).";
        if (!hasSymbol) return "Password must contain at least one symbol (e.g., !@#$%).";
        return null;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError("Email and Password are required.");
            return;
        }

        if (!isLoginTab && !name) {
            setError("Name is required for registration.");
            return;
        }

        const passwordError = validatePassword(password);
        if (!isLoginTab && passwordError) {
            setError(passwordError);
            return;
        }

        // Attempt mock login/signup
        try {
            if (isLoginTab) {
                // In a real app, you'd check credentials against a DB
                // For this mock, we just log them in if password is valid per structure or passes mock check
                loginWithEmail(email, password);
            } else {
                loginWithEmail(email, password, name);
            }
            closeLoginModal();
        } catch (err: any) {
            setError(err.message || "Failed to authenticate.");
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#111827] border border-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-[#0b0f19]">
                    <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-xs font-black">M</span>
                        Meet2Action
                    </h2>
                    <button
                        onClick={closeLoginModal}
                        className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-6">
                    <div className="flex bg-slate-800/50 rounded-lg p-1 mb-6 border border-slate-700/50">
                        <button
                            onClick={() => { setIsLoginTab(true); setError(''); }}
                            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${isLoginTab ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => { setIsLoginTab(false); setError(''); }}
                            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${!isLoginTab ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Sign Up
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {!isLoginTab && (
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-[#0b0f19] border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-600"
                                    placeholder="e.g. Jane Doe"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#0b0f19] border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-600"
                                placeholder="you@company.com"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex justify-between">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#0b0f19] border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-600 [color-scheme:dark]"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-2 rounded">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm font-semibold shadow-sm transition-colors mt-2"
                        >
                            {isLoginTab ? 'Sign In to Workspace' : 'Create Account'}
                        </button>

                    </form>

                    <div className="mt-6 pt-6 border-t border-slate-800 text-center">
                        <p className="text-xs text-slate-500 mb-4 uppercase tracking-wider font-semibold">Or continue with</p>
                        <button
                            onClick={() => {
                                loginWithGoogle();
                                closeLoginModal();
                            }}
                            className="w-full py-2.5 bg-white hover:bg-slate-100 text-slate-900 rounded-md text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
                        >
                            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LoginModal;
