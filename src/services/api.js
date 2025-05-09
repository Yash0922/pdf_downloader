// src/services/api.js
import axios from 'axios';
import { getAuth } from 'firebase/auth';

const API_URL = 'https://pdf-vault-backend.onrender.com/api';

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
  download: (id) => api.get(`/pdfs/download/${id}`, { responseType: 'blob' }),
  
  // Upload a new PDF (admin only)
  upload: (formData) => {
    return api.post('/pdfs', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

// User API
export const userApi = {
  // Get current user profile
  getProfile: () => api.get('/users/me'),
  
  // Update user profile
  updateProfile: (data) => api.put('/users/me', data),
  
  // Purchase a PDF
  purchasePdf: (pdfId) => api.post(`/users/purchase/${pdfId}`),
  
  // Get user's purchase history
  getPurchases: () => api.get('/users/purchases'),
  
  // Get user's download history
  getDownloads: () => api.get('/users/downloads')
};

// Admin API
export const adminApi = {
  // Get dashboard statistics
  getDashboardStats: () => api.get('/admin/dashboard'),
  
  // Get all users
  getAllUsers: () => api.get('/admin/users'),
  
  // Update user role
  updateUserRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }),
  
  // Get download statistics
  getDownloadStats: () => api.get('/admin/stats/downloads'),
  
  // Get revenue statistics
  getRevenueStats: () => api.get('/admin/stats/revenue')
};

export default api;