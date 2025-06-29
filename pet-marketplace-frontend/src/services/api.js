import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api', // Point to backend server (use relative path so proxy works)
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to add auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    console.log('Token in request interceptor:', token ? 'exists' : 'null');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Setting Authorization header:', `Bearer ${token.substring(0, 15)}...`);
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.log(`API Error: ${error.response.status} from: ${error.config.url}`);
      console.log('Response data:', error.response.data);
      
      // Handle token expiration or auth errors
      if (error.response.status === 401) {
        console.log('401 error from:', error.config.url);
        
        // Only redirect to login for specific endpoints that require authentication
        // Don't redirect for profile update or image upload endpoints
        const nonRedirectPaths = ['/users/me', '/users/profile-image'];
        const requestPath = error.config.url;
        
        let shouldRedirect = true;
        for (const path of nonRedirectPaths) {
          if (requestPath.includes(path)) {
            shouldRedirect = false;
            break;
          }
        }
        
        if (shouldRedirect) {
          console.log('Redirecting to login due to auth error');
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
    } else {
      console.log('Network or other error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Shop API calls
export const shopAPI = {
  getMyShop: () => api.get('/shops/my-shop'),
  getShopById: (shopId) => api.get(`/shops/${shopId}`),
  createShop: (shopData) => api.post('/shops', shopData),
  updateShop: (shopId, shopData) => api.put(`/shops/${shopId}`, shopData),
};

// Invoice API calls
export const invoiceAPI = {
  // For employees
  createInvoice: (invoiceData) => api.post('/invoices', invoiceData),
  getShopInvoices: () => api.get('/invoices/shop'),
  
  // For sellers
  getSellerShopInvoices: () => api.get('/invoices/seller/shop'),
  
  // Common
  getInvoiceById: (invoiceId) => api.get(`/invoices/${invoiceId}`),
};

// Employee API calls
export const employeeAPI = {
  getShopEmployees: (shopId) => api.get(`/employees/shop/${shopId}`),
  registerEmployee: (employeeData) => api.post('/employees/register', employeeData),
  updateEmployeeStatus: (employeeId, isActive) => api.put(`/employees/${employeeId}/status`, { isActive }),
  updateEmployeePermissions: (employeeId, permissions) => api.put(`/employees/${employeeId}/permissions`, { permissions }),
};

// Auth API calls
export const authAPI = {
  register: userData => api.post('/users/register', userData),
  login: credentials => api.post('/users/login', credentials),
  forgotPassword: email => api.post('/users/forgot-password', { email }),
  resetPassword: data => api.post('/users/reset-password', data),
  changePassword: data => api.put('/users/change-password', data)
};

// User API calls
export const userAPI = {
  getCurrentUser: (signal) => api.get('/users/me', { signal }),
  updateProfile: userData => api.put('/users/me', userData),
  uploadProfileImage: (imageData, onProgress) => {
    const formData = new FormData();
    formData.append('profileImage', imageData);
    
    return api.post('/users/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 30000, // 30 second timeout for image uploads
      onUploadProgress: progressEvent => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });
  },
  getUserById: userId => api.get(`/users/${userId}`),
  addToFavorites: (type, id) => api.post('/users/favorites', { type, id }),
  removeFromFavorites: (type, id) => api.delete('/users/favorites', { data: { type, id } }),
  getCart: () => api.get('/users/cart'),
  setCart: (cart) => api.post('/users/cart', { cart }),
};

// Pet API calls
export const petAPI = {
  getAllPets: params => api.get('/pets', { params }),
  getPetById: petId => api.get(`/pets/${petId}`),
  createPet: petData => api.post('/pets', petData),
  updatePet: (petId, petData) => api.put(`/pets/${petId}`, petData),
  deletePet: petId => api.delete(`/pets/${petId}`),
  uploadPetImages: (petId, imageData) => {
    const formData = new FormData();
    formData.append('petImage', imageData);
    return api.post(`/pets/${petId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

// Adoption API calls
export const adoptionAPI = {
  applyForAdoption: applicationData => api.post('/adoptions', applicationData),
  getUserAdoptions: () => api.get('/adoptions/user'),
  getAdoptionById: adoptionId => api.get(`/adoptions/${adoptionId}`),
  updateAdoptionStatus: (adoptionId, status) => api.put(`/adoptions/${adoptionId}/status`, { status })
};

// Product API calls
export const productAPI = {
  getAllProducts: params => api.get('/products', { params }),
  getProductById: productId => api.get(`/products/${productId}`),
  createProduct: productData => api.post('/products', productData),
  updateProduct: (productId, productData) => api.put(`/products/${productId}`, productData),
  deleteProduct: productId => api.delete(`/products/${productId}`)
};

// Inventory API calls
export const inventoryAPI = {
  // For both employees and sellers
  getAdjustments: (params) => api.get('/inventory/adjustments', { params }),
  // For employees
  createAdjustment: (adjustmentData) => api.post('/inventory/adjustments', adjustmentData),
  updateProductStock: (productId, stockData) => api.put(`/inventory/products/${productId}/stock`, stockData),
  // For sellers
  getPendingAdjustments: () => api.get('/inventory/adjustments/pending'),
  updateAdjustmentStatus: (adjustmentId, statusData) => api.put(`/inventory/adjustments/${adjustmentId}/status`, statusData)
};

// Rescue API calls
export const rescueAPI = {
  getAllRescues: params => api.get('/rescues', { params }),
  getRescueById: rescueId => api.get(`/rescues/${rescueId}`),
  createRescue: rescueData => api.post('/rescues', rescueData),
  updateRescue: (rescueId, rescueData) => api.put(`/rescues/${rescueId}`, rescueData),
  deleteRescue: rescueId => api.delete(`/rescues/${rescueId}`)
};

export default api; 