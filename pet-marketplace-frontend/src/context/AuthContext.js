import React, { createContext, useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode';
import { toast } from 'react-toastify';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Check if token is expired
          const decodedToken = jwtDecode(token);
          if (decodedToken.exp * 1000 < Date.now()) {
            // Token is expired
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setCurrentUser(null);
          } else {
            // Set auth token to all requests
            axios.defaults.headers.common['x-auth-token'] = token;
            
            // Get current user data
            try {
              const res = await axios.get('/api/users/me');
              setCurrentUser(res.data);
              setIsAuthenticated(true);
            } catch (err) {
              console.error('Error fetching user data:', err);
              localStorage.removeItem('token');
              setIsAuthenticated(false);
              setCurrentUser(null);
            }
          }
        } catch (err) {
          console.error('Error decoding token:', err);
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  // Login user
  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/users/login', { email, password });
      const { token } = res.data;
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      
      // Set auth token to all requests
      axios.defaults.headers.common['x-auth-token'] = token;
      
      // Get user info
      const userRes = await axios.get('/api/users/me');
      setCurrentUser(userRes.data);
      setIsAuthenticated(true);
      
      toast.success('Login successful!');
      return true;
    } catch (err) {
      const errorMsg = err.response && err.response.data.msg ? 
        err.response.data.msg : 'Login failed. Please try again.';
      toast.error(errorMsg);
      return false;
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      const res = await axios.post('/api/users/register', userData);
      const { token } = res.data;
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      
      // Set auth token to all requests
      axios.defaults.headers.common['x-auth-token'] = token;
      
      // Get user info
      const userRes = await axios.get('/api/users/me');
      setCurrentUser(userRes.data);
      setIsAuthenticated(true);
      
      toast.success('Registration successful!');
      return true;
    } catch (err) {
      const errorMsg = err.response && err.response.data.msg ? 
        err.response.data.msg : 'Registration failed. Please try again.';
      toast.error(errorMsg);
      return false;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['x-auth-token'];
    setCurrentUser(null);
    setIsAuthenticated(false);
    toast.info('Logged out successfully');
  };

  // Update user
  const updateProfile = async (userData) => {
    try {
      const res = await axios.put('/api/users/me', userData);
      setCurrentUser(res.data);
      toast.success('Profile updated successfully');
      return true;
    } catch (err) {
      const errorMsg = err.response && err.response.data.msg ? 
        err.response.data.msg : 'Profile update failed. Please try again.';
      toast.error(errorMsg);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 