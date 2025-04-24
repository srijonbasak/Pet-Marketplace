import jwtDecode from 'jwt-decode';
import api from './api';

/**
 * Auth service for handling token management
 */
const authService = {
  /**
   * Set authentication token in localStorage and axios headers
   * @param {string} token - JWT token
   */
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
      console.log('Token saved to localStorage');
    }
  },
  
  /**
   * Get the current auth token
   * @returns {string|null} The token or null if not found
   */
  getToken: () => {
    return localStorage.getItem('token');
  },
  
  /**
   * Remove the auth token
   */
  removeToken: () => {
    localStorage.removeItem('token');
    console.log('Token removed from localStorage');
  },
  
  /**
   * Check if user is authenticated
   * @returns {boolean} True if authenticated, false otherwise
   */
  isAuthenticated: () => {
    const token = authService.getToken();
    if (!token) return false;
    
    try {
      const decoded = jwtDecode(token);
      // Check if token is expired
      return decoded.exp * 1000 > Date.now();
    } catch (err) {
      console.error('Error decoding token:', err);
      return false;
    }
  },
  
  /**
   * Get current user from token
   * @returns {Object|null} User data or null if not authenticated
   */
  getCurrentUser: () => {
    const token = authService.getToken();
    if (!token) return null;
    
    try {
      return jwtDecode(token).user;
    } catch (err) {
      console.error('Error decoding token:', err);
      return null;
    }
  },
  
  /**
   * Login user and get token
   * @param {Object} credentials - User credentials
   * @returns {Promise<string>} Promise resolving to token
   */
  login: async (credentials) => {
    const response = await api.post('/users/login', credentials);
    const { token } = response.data;
    authService.setToken(token);
    return token;
  },
  
  /**
   * Register user and get token
   * @param {Object} userData - User registration data
   * @returns {Promise<string>} Promise resolving to token
   */
  register: async (userData) => {
    const response = await api.post('/users/register', userData);
    const { token } = response.data;
    authService.setToken(token);
    return token;
  },
  
  /**
   * Logout user
   */
  logout: () => {
    authService.removeToken();
  }
};

export default authService; 