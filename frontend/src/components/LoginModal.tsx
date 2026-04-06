import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginModal: React.FC = () => {
    const { isLoginModalOpen, closeLoginModal, loginWithEmail, loginWithGoogle, forgotPassword } = useAuth();

    const [view, setView] = useState<'login' | 'signup' | 'forgot'>('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isLoginModalOpen) return null;

    const validatePassword = (pwd: string) => {
        if (view !== 'signup') return null;
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsSubmitting(true);

        try {
            if (view === 'forgot') {
                if (!email) throw new Error("Email is required.");
                await forgotPassword(email);
                setMessage("Check your email for password reset instructions.");
                return;
            }

            if (!email || !password) {
                throw new Error("Email and Password are required.");
            }

            if (view === 'signup' && !name) {
                throw new Error("Name is required for registration.");
            }

            const passwordError = validatePassword(password);
            if (view === 'signup' && passwordError) {
                throw new Error(passwordError);
            }

            if (view === 'login') {
                await loginWithEmail(email, password);
            } else {
                await loginWithEmail(email, password, name);
            }
        } catch (err: any) {
            setError(err.message || "Authentication failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setError('');
            setMessage('');
            await loginWithGoogle();
        } catch (err: any) {
            setError(err.message || "Google login failed.");
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
                <div className="p-8 text-center">
                    <div className="mb-8">
                        <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20 shadow-inner">
                            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter shadow-sm mb-2">Secure Workspace Access</h3>
                        <p className="text-sm text-slate-500 font-outfit max-w-[240px] mx-auto leading-relaxed">Sign in with your Google account to access your intelligence dashboard and history.</p>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl flex items-center gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleGoogleLogin}
                        className="group w-full py-4 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-[13px] font-black uppercase tracking-widest shadow-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-4"
                    >
                        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 group-hover:scale-110 transition-transform">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>
                </div>


            </div>
        </div>
    );
};

export default LoginModal;
