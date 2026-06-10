import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load auth data from localStorage
    const savedToken = localStorage.getItem('token');
    const savedUsername = localStorage.getItem('username');
    const savedRole = localStorage.getItem('role');

    if (savedToken && savedUsername && savedRole) {
      setToken(savedToken);
      setUser({ username: savedUsername, role: savedRole });
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const data = await authService.login(username, password);
      const { access_token, username: resUser, role } = data;

      // Store in localStorage
      localStorage.setItem('token', access_token);
      localStorage.setItem('username', resUser);
      localStorage.setItem('role', role);

      // Set State
      setToken(access_token);
      setUser({ username: resUser, role });
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      const detail = error.response?.data?.detail || 'Login failed. Please check credentials.';
      return { success: false, error: detail };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setToken(null);
    setUser(null);
  };

  const isAdmin = () => user?.role === 'admin';
  const isContributor = () => user?.role === 'admin' || user?.role === 'contributor';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin, isContributor }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
