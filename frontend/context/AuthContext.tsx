import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  name: string;
  email: string;
  picture: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  loginWithGoogle: () => void;
  loginWithEmail: (email: string, password: string, name?: string) => void;
  logout: () => void;
  checkStatus: () => Promise<void>;
  updateName: (newName: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const checkStatus = async () => {
    try {
      // First check for a mock email login in localStorage
      const mockSessionStr = localStorage.getItem('m2a_mock_session');
      if (mockSessionStr) {
        const mockSession = JSON.parse(mockSessionStr);
        // Ensure it hasn't expired (e.g., 24h)
        if (Date.now() - mockSession.timestamp < 24 * 60 * 60 * 1000) {
          setUser(mockSession.user);
          setLoading(false);
          return;
        } else {
          localStorage.removeItem('m2a_mock_session');
        }
      }

      const res = await fetch('http://localhost:8000/auth/status', {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.isAuthenticated) {
        let userData = data.user;
        // Check for custom name in localStorage
        const customName = localStorage.getItem(`m2a_user_name_${userData.email}`);
        if (customName) {
          userData = { ...userData, name: customName };
        }
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Failed to check auth status", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const loginWithGoogle = () => {
    window.location.href = "http://localhost:8000/auth/google/login";
  };

  const loginWithEmail = (email: string, password: string, name?: string) => {
    // This is a mocked auth handler for the pure frontend requirements.
    // In production, this would hit a real backend endpoint.

    // Simulate user fetch/creation
    let userName = name;
    if (!userName) {
      // If logging in, attempt to retrieve previous name or extract from email
      const savedName = localStorage.getItem(`m2a_user_name_${email}`);
      if (savedName) {
        userName = savedName;
      } else {
        userName = email.split('@')[0];
        // Capitalize first letter
        userName = userName.charAt(0).toUpperCase() + userName.slice(1);
      }
    } else {
      // Registration, save the name
      localStorage.setItem(`m2a_user_name_${email}`, name);
    }

    const mockUser: User = {
      name: userName,
      email: email,
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=2563eb&color=fff`
    };

    // Save session
    localStorage.setItem('m2a_mock_session', JSON.stringify({
      user: mockUser,
      timestamp: Date.now()
    }));

    setUser(mockUser);
  };

  const logout = async () => {
    try {
      // Clear mock session
      localStorage.removeItem('m2a_mock_session');

      await fetch('http://localhost:8000/auth/logout', { credentials: 'include' });
      setUser(null);
      window.location.reload();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const updateName = (newName: string) => {
    if (user) {
      const updatedUser = { ...user, name: newName };
      setUser(updatedUser);
      localStorage.setItem(`m2a_user_name_${user.email}`, newName);
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
      checkStatus,
      updateName
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
