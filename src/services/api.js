import axios from 'axios';
import { getAuth } from 'firebase/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add authentication token to requests
api.interceptors.request.use(async (config) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return config;
  }
}, (error) => {
  return Promise.reject(error);
});

// PDF API
export const pdfApi = {
  // Get all PDFs
  getAll: () => api.get('/pdfs'),
  
  // Get PDF by ID
  getById: (id) => api.get(`/pdfs/${id}`),
  
  // Download a PDF
  download: (id) => api.get(`/pdfs/download/${id}`, { 
    responseType: 'blob',
    timeout: 30000 // Increase timeout for larger files
  }),
  
  // Upload a new PDF
  upload: (formData) => {
    return api.post('/pdfs', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // Delete a PDF
  delete: (id) => api.delete(`/pdfs/${id}`),
  
  // Create payment session for a PDF
  createPaymentSession: (id) => api.get(`/pdfs/payment-session/${id}`),
  
  // Verify payment for a PDF
  verifyPayment: (orderId, pdfId) => api.post(`/pdfs/verify-payment`, { orderId, pdfId }),
  
  // Check file status (for debugging)
  checkFileStatus: (id) => api.get(`/pdfs/check-file/${id}`)
};

// User API
export const userApi = {
  // Get current user profile
  getProfile: () => api.get('/users/me'),
  
  // Update user profile
  updateProfile: (data) => api.put('/users/me', data),
  
  // Get user's purchase history
  getPurchases: () => api.get('/users/purchases'),
  
  // Get user's download history
  getDownloads: () => api.get('/users/downloads')
};

// Auth API
export const authApi = {
  // Register user
  register: (data) => api.post('/auth/register', data),
  
  // Login user
  login: (data) => api.post('/auth/login', data),
  
  // Verify email
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  
  // Reset password
  resetPassword: (data) => api.post('/auth/reset-password', data),
  
  // Send password reset email
  forgotPassword: (email) => api.post('/auth/forgot-password', { email })
};

// Add a global error handler
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    
    // For download errors, pass through the error
    if (error.config?.responseType === 'blob') {
      return Promise.reject(error);
    }
    
    // If the error is a blob, convert it to JSON
    if (error.response?.data instanceof Blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            error.response.data = JSON.parse(reader.result);
            reject(error);
          } catch (e) {
            error.response.data = { message: 'An unknown error occurred' };
            reject(error);
          }
        };
        reader.onerror = () => {
          error.response.data = { message: 'An unknown error occurred' };
          reject(error);
        };
        reader.readAsText(error.response.data);
      });
    }
    
    return Promise.reject(error);
  }
);

export default api;