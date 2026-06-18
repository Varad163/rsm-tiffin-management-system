import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const getStoredUser = () => {
  const stored = localStorage.getItem(USER_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(false);

  const persistAuth = useCallback((authData) => {
    const userData = {
      email: authData.email,
      role: authData.role,
    };

    localStorage.setItem(TOKEN_KEY, authData.token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setToken(authData.token);
    setUser(userData);
  }, []);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const authData = await authService.login(credentials);
      persistAuth(authData);
      return authData;
    } finally {
      setLoading(false);
    }
  }, [persistAuth]);

  const register = useCallback(async (userData) => {
    setLoading(true);
    try {
      const authData = await authService.register(userData);
      persistAuth(authData);
      return authData;
    } finally {
      setLoading(false);
    }
  }, [persistAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === 'ADMIN',
      isStudent: user?.role === 'STUDENT',
      login,
      register,
      logout,
    }),
    [token, user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
