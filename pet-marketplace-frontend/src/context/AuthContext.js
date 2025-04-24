import React, { createContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import authService from '../services/auth';
import { userAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      console.log('Checking authentication status...');
      if (authService.isAuthenticated()) {
        console.log('Token is valid, fetching user data');
        
        try {
          // Get current user data
          const res = await userAPI.getCurrentUser();
          setCurrentUser(res.data);
          setIsAuthenticated(true);
          console.log('User authenticated successfully');
        } catch (err) {
          console.error('Error fetching user data:', err);
          authService.removeToken();
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } else {
        console.log('No valid token found');
        authService.removeToken(); // Clean up any invalid tokens
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
      
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  // Login user
  const login = async (email, password) => {
    try {
      console.log('Attempting login with email:', email);
      await authService.login({ email, password });
      
      // Get user info
      const userRes = await userAPI.getCurrentUser();
      setCurrentUser(userRes.data);
      setIsAuthenticated(true);
      
      console.log('Login successful');
      toast.success('Login successful!');
      return true;
    } catch (err) {
      console.error('Login error:', err);
      const errorMsg = err.response && err.response.data.message 
        ? err.response.data.message 
        : 'Login failed. Please try again.';
      toast.error(errorMsg);
      return false;
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      console.log('Attempting to register user');
      await authService.register(userData);
      
      // Get user info
      const userRes = await userAPI.getCurrentUser();
      setCurrentUser(userRes.data);
      setIsAuthenticated(true);
      
      console.log('Registration successful');
      toast.success('Registration successful!');
      return true;
    } catch (err) {
      console.error('Registration error:', err);
      const errorMsg = err.response && err.response.data.message 
        ? err.response.data.message 
        : 'Registration failed. Please try again.';
      toast.error(errorMsg);
      return false;
    }
  };

  // Logout user
  const logout = () => {
    console.log('Logging out user');
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    toast.info('Logged out successfully');
  };

  // Update user
  const updateProfile = async (userData) => {
    try {
      console.log('Updating user profile');
      const res = await userAPI.updateProfile(userData);
      setCurrentUser(res.data);
      console.log('Profile updated successfully');
      toast.success('Profile updated successfully');
      return true;
    } catch (err) {
      console.error('Profile update error:', err);
      const errorMsg = err.response && err.response.data.message 
        ? err.response.data.message 
        : 'Profile update failed. Please try again.';
      toast.error(errorMsg);
      return false;
    }
  };

  const value = {
    currentUser, 
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 