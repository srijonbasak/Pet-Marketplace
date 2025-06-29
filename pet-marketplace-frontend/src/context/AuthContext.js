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
      console.log('AuthContext: Checking authentication, token exists:', !!token);
      
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
          console.log('AuthContext: User authenticated', res.data.role);
        } catch (error) {
          console.error('AuthContext: Authentication failed', error.response?.data || error.message);
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
      // First try regular user login
      try {
        const res = await axios.post('/api/users/login', { email, password });
        const token = res.data.token;
        
        // Store token in localStorage
        localStorage.setItem('token', token);
        console.log('AuthContext: Login successful, token stored');
        
        setUser(res.data.user);
        setIsAuthenticated(true);
        toast.success('Login successful!');
        return res.data;
      } catch (userError) {
        console.log('User login failed, trying employee login', userError.response?.status);
        
        // If user login fails, try employee login
        const employeeRes = await axios.post('/api/employees/login', { email, password });
        const token = employeeRes.data.token;
        
        // Store token in localStorage
        localStorage.setItem('token', token);
        console.log('AuthContext: Employee login successful, token stored');
        
        // Decode JWT token to get employee data
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const { user: tokenData } = JSON.parse(jsonPayload);
        console.log('Token payload for employee:', tokenData);
        
        // Create a user object from the token data
        const employeeUser = {
          _id: tokenData.id,
          role: 'employee',
          shop: tokenData.shop
        };
        
        // Try to fetch complete employee data
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${token}`
            }
          };
          
          const employeeDataRes = await axios.get('/api/employees/me', config);
          console.log('Complete employee data:', employeeDataRes.data);
          
          // Merge the employee data with the tokenData
          employeeUser.firstName = employeeDataRes.data.firstName;
          employeeUser.lastName = employeeDataRes.data.lastName;
          employeeUser.email = employeeDataRes.data.email;
          employeeUser.permissions = employeeDataRes.data.permissions;
        } catch (err) {
          console.log('Could not fetch complete employee data, using token data only');
        }
        
        setUser(employeeUser);
        setIsAuthenticated(true);
        toast.success('Employee login successful!');
        return { token, user: employeeUser };
      }
    } catch (error) {
      console.error('AuthContext: Login failed', error.response?.data || error.message);
      const errorMsg = error.response && error.response.data.message 
        ? error.response.data.message 
        : 'Login failed. Please try again.';
      toast.error(errorMsg);
      throw error.response?.data || error;
    }
  };

  const register = async (userData) => {
    try {
      const res = await axios.post('/api/users/register', userData);
      const token = res.data.token;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      console.log('AuthContext: Registration successful, token stored');
      
      setUser(res.data.user);
      setIsAuthenticated(true);
      toast.success('Registration successful!');
      return res.data;
    } catch (error) {
      console.error('AuthContext: Registration failed', error.response?.data || error.message);
      const errorMsg = error.response && error.response.data.message 
        ? error.response.data.message 
        : 'Registration failed. Please try again.';
      toast.error(errorMsg);
      throw error.response?.data || error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    console.log('AuthContext: Logged out, token removed');
    
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
      console.error('AuthContext: Profile update failed', err.response?.data || err.message);
      const errorMsg = err.response && err.response.data.message 
        ? err.response.data.message 
        : 'Profile update failed. Please try again.';
      toast.error(errorMsg);
      return false;
    }
  };

  // Helper function to check token
  const getToken = () => {
    return localStorage.getItem('token');
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateProfile,
    getToken,
    currentUser: user // Added for compatibility
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? <CartProvider>{children}</CartProvider> : null}
    </AuthContext.Provider>
  );
};

export default AuthContext; 