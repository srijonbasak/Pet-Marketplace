import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { userAPI } from '../services/api';
import { CartProvider } from './CartContext';

// Create and export the context
export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${token}`
            }
          };
          const res = await axios.get('/api/users/me', config);
          setUser(res.data);
          setIsAuthenticated(true);
        } catch (error) {
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/users/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      setIsAuthenticated(true);
      toast.success('Login successful!');
      return res.data;
    } catch (error) {
      const errorMsg = error.response && error.response.data.message 
        ? error.response.data.message 
        : 'Login failed. Please try again.';
      toast.error(errorMsg);
      throw error.response.data;
    }
  };

  const register = async (userData) => {
    try {
      const res = await axios.post('/api/users/register', userData);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      setIsAuthenticated(true);
      toast.success('Registration successful!');
      return res.data;
    } catch (error) {
      const errorMsg = error.response && error.response.data.message 
        ? error.response.data.message 
        : 'Registration failed. Please try again.';
      toast.error(errorMsg);
      throw error.response.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    toast.info('Logged out successfully');
  };

  const updateProfile = async (userData) => {
    try {
      const res = await userAPI.updateProfile(userData);
      setUser(res.data);
      toast.success('Profile updated successfully');
      return true;
    } catch (err) {
      const errorMsg = err.response && err.response.data.message 
        ? err.response.data.message 
        : 'Profile update failed. Please try again.';
      toast.error(errorMsg);
      return false;
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? <CartProvider>{children}</CartProvider> : null}
    </AuthContext.Provider>
  );
};

export default AuthContext; 