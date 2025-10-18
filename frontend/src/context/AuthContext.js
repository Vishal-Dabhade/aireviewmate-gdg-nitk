// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

// Create context
export const AuthContext = createContext();

/**
 * 🧠 AuthProvider component
 * Wrap your entire app with this to share auth state globally
 */
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.localStorage?.getItem('github_token') || null;
    }
    return null;
  });

  const [user, setUser] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');

    if (urlToken) {
      if (typeof window !== 'undefined') {
        window.localStorage?.setItem('github_token', urlToken);
      }
      setToken(urlToken);
      window.history.replaceState({}, document.title, '/');
    }

    if (token) fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchUser = async () => {
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const userData = await api.getUserInfo(decoded.login);
      setUser(userData);
    } catch (err) {
      console.error('Failed to fetch user:', err);
    }
  };

  const login = async () => {
    try {
      await api.githubLogin(); // This will redirect automatically
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      window.localStorage?.removeItem('github_token');
    }
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 🔹 Hook to use auth context
export const useAuth = () => useContext(AuthContext);