import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../../lib/axios';
import { disconnectSocket } from '../../lib/socket';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('quizclash_user');
    try { return saved ? JSON.parse(saved) : null; } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('quizclash_token'));
  const [loading, setLoading] = useState(true);

  // Check current auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('quizclash_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data.user);
            setToken(localStorage.getItem('quizclash_token'));
            localStorage.setItem('quizclash_user', JSON.stringify(res.data.data.user));
          }
        } catch {
          // Handled by refresh interceptor or cleared
        }
      }
      setLoading(false);
    };

    checkAuth();
    const expireSession = () => {
      setUser(null);
      setToken(null);
      disconnectSocket();
    };
    window.addEventListener('quizclash:session-expired', expireSession);
    return () => window.removeEventListener('quizclash:session-expired', expireSession);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { user: userData, accessToken } = res.data.data;
      setUser(userData);
      setToken(accessToken);
      localStorage.setItem('quizclash_token', accessToken);
      localStorage.setItem('quizclash_user', JSON.stringify(userData));
      return userData;
    }
  }, []);

  const register = useCallback(async ({ username, email, password, role, avatarSeed }) => {
    const res = await api.post('/auth/register', {
      username,
      email,
      password,
      role,
      avatarSeed,
    });
    if (res.data.success) {
      const { user: userData, accessToken } = res.data.data;
      setUser(userData);
      setToken(accessToken);
      localStorage.setItem('quizclash_token', accessToken);
      localStorage.setItem('quizclash_user', JSON.stringify(userData));
      return userData;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    setUser(null);
    setToken(null);
    localStorage.removeItem('quizclash_token');
    localStorage.removeItem('quizclash_user');
    disconnectSocket();
  }, []);

  const updateUser = useCallback((updated) => {
    setUser((prev) => {
      const merged = { ...prev, ...updated };
      localStorage.setItem('quizclash_user', JSON.stringify(merged));
      return merged;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
