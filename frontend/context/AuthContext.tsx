import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  name: string;
  email: string;
  picture: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
  checkStatus: () => Promise<void>;
  updateName: (newName: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkStatus = async () => {
    try {
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

  const login = () => {
    window.location.href = "http://localhost:8000/auth/google/login";
  };

  const logout = async () => {
    try {
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
    <AuthContext.Provider value={{ user, loading, login, logout, checkStatus, updateName }}>
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
