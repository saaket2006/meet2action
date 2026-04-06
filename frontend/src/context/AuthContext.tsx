
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  name: string;
  email: string;
  picture: string;
  sub: string; // Google's unique ID
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  loginWithGoogle: () => void;
  loginWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  updateName: (name: string) => Promise<void>;
  logout: () => void;
  googleAccessToken: string | null;
  idToken: string | null;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Google Client ID from environment
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
console.log("Initializing GIS with Client ID:", CLIENT_ID || "MISSING!");


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);

  // Initialize Google Identity Services
  useEffect(() => {
    let gisRetryCount = 0;
    const MAX_RETRIES = 10;

    const initializeGis = () => {
      if (typeof window !== 'undefined' && (window as any).google) {
        
        const handleResponse = (response: any) => {
          const token = response.credential;
          
          // Basic local decoding to check sub and expiration
          try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const decoded = JSON.parse(jsonPayload);
            
            if (!decoded.sub) throw new Error("Token missing 'sub' claim");
            
            setIdToken(token);
            localStorage.setItem('google_id_token', token);
            
            const validatedUser: User = {
              name: decoded.name || 'Google User',
              email: decoded.email || '',
              picture: decoded.picture || '',
              sub: decoded.sub
            };
            
            setUser(validatedUser);
            closeLoginModal();
            requestAccessToken();
          } catch (e) {
             console.error("JWT validation failed during manual login", e);
          }
        };

        (window as any).google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: handleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        
        const storedToken = localStorage.getItem('google_id_token');
        if (storedToken) {
           try {
             const base64Url = storedToken.split('.')[1];
             const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
             const decoded = JSON.parse(decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));

             // Verify expiration
             if (decoded.exp && decoded.exp * 1000 > Date.now()) {
                setIdToken(storedToken);
                setUser({ name: decoded.name, email: decoded.email, picture: decoded.picture, sub: decoded.sub });
             } else {
                localStorage.removeItem('google_id_token');
             }
           } catch (e) {
             localStorage.removeItem('google_id_token');
           }
        }
        setLoading(false);
      } else if (gisRetryCount < MAX_RETRIES) {
        gisRetryCount++;
        setTimeout(initializeGis, 100);
      } else {
        console.error("GIS failed to load after", MAX_RETRIES, "attempts");
        setLoading(false);
      }
    };

    initializeGis();
  }, []);



  const requestAccessToken = () => {
    if (!(window as any).google) return;

    const client = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: 'openid email profile https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly',

      callback: (tokenResponse: any) => {
        if (tokenResponse && tokenResponse.access_token) {
          setGoogleAccessToken(tokenResponse.access_token);
          localStorage.setItem('google_access_token', tokenResponse.access_token);
        }
      },
      error_callback: (err: any) => {
        console.error("Access token request failed", err);
      }
    });
    client.requestAccessToken();
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const loginWithGoogle = () => {
    if (!(window as any).google) {
      alert("Google Identity Services not loaded yet.");
      return;
    }

    const client = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: 'openid email profile https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly',
      callback: async (tokenResponse: any) => {
        if (tokenResponse && tokenResponse.access_token) {
          const token = tokenResponse.access_token;
          setGoogleAccessToken(token);
          localStorage.setItem('google_access_token', token);

          // Fetch User Profile info from Google's UserInfo API
          try {
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to fetch user profile info");
            const profile = await res.json();
            
            if (!profile.sub) throw new Error("UserInfo missing sub identifier");

            const validatedUser: User = {
              name: profile.name || profile.given_name || 'Google User',
              email: profile.email || 'No email provided',
              picture: profile.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'U')}&background=random`,
              sub: profile.sub
            };

            console.log("Logged in via API:", validatedUser.email);
            setUser(validatedUser);
            if (tokenResponse.id_token) {
              setIdToken(tokenResponse.id_token);
              localStorage.setItem('google_id_token', tokenResponse.id_token);
            }
            closeLoginModal();

          } catch (e) {
            console.error("Profile fetch failed:", e);
          }

        }
      },
      error_callback: (error: any) => {
        console.error("Google Auth Error:", error);
      }
    });

    client.requestAccessToken();
  };

  const loginWithEmail = async (email: string, pass: string, name?: string) => {
    alert("Email login must be set up on the backend. Please use Google sign-in.");
  };

  const forgotPassword = async (email: string) => {
    alert("Password reset must be set up on the backend.");
  };

  const updateName = async (newName: string) => {
    if (user) {
      setUser({ ...user, name: newName });
    }
  };

  const logout = () => {
    setUser(null);
    setIdToken(null);
    setGoogleAccessToken(null);
    localStorage.removeItem('google_id_token');
    localStorage.removeItem('google_access_token');
    window.location.reload();
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
      forgotPassword,
      updateName,
      logout,
      googleAccessToken,
      idToken
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
