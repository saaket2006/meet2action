import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

interface User {
  name: string;
  email: string;
  picture: string;
  uid: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateName: (newName: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  googleAccessToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || '',
          picture: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(firebaseUser.displayName || 'U')}&background=2563eb&color=fff`,
          uid: firebaseUser.uid
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const loginWithGoogle = async () => {
    if (!auth) {
      alert("Firebase is not configured. Check your .env.local file.");
      return;
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential) {
        setGoogleAccessToken(credential.accessToken || null);
      }
      closeLoginModal();
    } catch (err) {
      console.error("Google login failed", err);
      throw err;
    }
  };

  const loginWithEmail = async (email: string, password: string, name?: string) => {
    if (!auth) {
      alert("Firebase is not configured. Check your .env.local file.");
      return;
    }
    try {
      if (name) {
        // Registration
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: name
        });
      } else {
        // Login
        await signInWithEmailAndPassword(auth, email, password);
      }
      closeLoginModal();
    } catch (err) {
      console.error("Email auth failed", err);
      throw err;
    }
  };

  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      window.location.reload();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const updateName = async (newName: string) => {
    if (auth && auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, {
          displayName: newName
        });
        setUser(prev => prev ? { ...prev, name: newName } : null);
      } catch (err) {
        console.error("Update name failed", err);
      }
    }
  };

  const forgotPassword = async (email: string) => {
    if (!auth) return;
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      console.error("Password reset error", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isLoginModalOpen,
      openLoginModal,
      closeLoginModal,
      loginWithGoogle,
      loginWithEmail,
      logout,
      updateName,
      forgotPassword,
      googleAccessToken
    }}>

      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
