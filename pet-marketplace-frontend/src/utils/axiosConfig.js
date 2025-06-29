import axios from 'axios';

// Add a request interceptor to attach token to all requests
axios.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add to headers
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Token attached to request:', token.substring(0, 20) + '...');
    } else {
      console.log('No token found in localStorage');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle auth errors
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If we get a 401 Unauthorized error
    if (error.response && error.response.status === 401) {
      console.log('Unauthorized request detected. Token might be invalid or expired.');
      
      // Clear any auth data and redirect to login (optional)
      // localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios; 