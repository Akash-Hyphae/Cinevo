import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cinevo_token') || null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register' | 'forgot' | 'verify_notice'
  const [unverifiedEmail, setUnverifiedEmail] = useState('');

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await authAPI.getMe();
          if (res.success && res.data) {
            setUser(res.data);
          }
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      if (res.success && res.data) {
        localStorage.setItem('cinevo_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        setIsAuthModalOpen(false);
        return { success: true };
      }
    } catch (err) {
      if (err.data?.isEmailUnverified) {
        setUnverifiedEmail(err.data.email || email);
        setAuthModalMode('verify_notice');
        return { success: false, unverified: true, message: err.message };
      }
      return { success: false, message: err.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await authAPI.register({ name, email, password });
      if (res.success) {
        setUnverifiedEmail(email);
        setAuthModalMode('verify_notice');
        return {
          success: true,
          verificationToken: res.data?.verificationToken,
          message: res.message,
        };
      }
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('cinevo_token');
    setToken(null);
    setUser(null);
  };

  const verifyEmail = async (verificationToken) => {
    try {
      const res = await authAPI.verifyEmail(verificationToken);
      if (res.success && res.data) {
        localStorage.setItem('cinevo_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true, message: res.message };
      }
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const quickLoginDemoUser = async () => {
    return login('user@cinevo.com', 'Password123!');
  };

  const quickLoginDemoAdmin = async () => {
    return login('admin@cinevo.com', 'AdminSecret123!');
  };

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isAuthModalOpen,
        authModalMode,
        unverifiedEmail,
        setAuthModalMode,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        verifyEmail,
        quickLoginDemoUser,
        quickLoginDemoAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
