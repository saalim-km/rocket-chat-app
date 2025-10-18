// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserInfo, logout as apiLogout } from '../services/rocketchat';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load initial auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    const userData = localStorage.getItem('user');
    const storedIsAdmin = localStorage.getItem('isAdmin');

    if (token && userId && userData) {
      console.log('Restoring auth state from localStorage:', { token, userId, storedIsAdmin });
      setAuthToken(token);
      setUserId(userId);
      setUser(JSON.parse(userData));
      setIsAdmin(storedIsAdmin === 'true');
    }
    setLoading(false);
  }, []); // Empty dependency array ensures this runs only once on mount

  // Fetch user info to validate auth and admin status
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (authToken && userId) {
        console.log('Fetching user info for:', { authToken, userId });
        const result = await getUserInfo(authToken, userId);
        if (result.success) {
          console.log('User info fetched:', { user: result.user, isAdmin: result.isAdmin });
          setUser(result.user);
          setIsAdmin(result.isAdmin);
          localStorage.setItem('user', JSON.stringify(result.user));
          localStorage.setItem('isAdmin', result.isAdmin.toString());
        } else {
          console.error('Invalid auth token/userId, logging out:', result.error);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUserInfo();
  }, [authToken, userId]); // Only re-run when authToken or userId changes

  const login = (authData) => {
    const { authToken, userId, user, isAdmin } = authData;
    console.log('Logging in:', { authToken, userId, isAdmin });
    setAuthToken(authToken);
    setUserId(userId);
    setUser(user);
    setIsAdmin(isAdmin);

    // Store in localStorage
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('userId', userId);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('isAdmin', isAdmin.toString());
  };

  const logout = async () => {
    if (authToken && userId) {
      console.log('Logging out:', { authToken, userId });
      await apiLogout(authToken, userId);
    }
    setAuthToken(null);
    setUserId(null);
    setUser(null);
    setIsAdmin(false);

    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
  };

  const value = {
    user,
    authToken,
    userId,
    isAdmin,
    loading,
    login,
    logout,
    isAuthenticated: !!authToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};