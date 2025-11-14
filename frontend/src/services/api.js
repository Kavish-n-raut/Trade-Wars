import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

console.log('🔧 API Configuration:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  API_URL: API_URL,
  mode: import.meta.env.MODE,
});

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired or invalid
      console.error('❌ Authentication error, clearing token');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => {
    console.log('📤 Login request to:', `${API_URL}/auth/login`);
    return api.post('/auth/login', credentials);
  },
  register: (userData) => {
    console.log('📤 Register request to:', `${API_URL}/auth/register`, userData);
    return api.post('/auth/register', userData);
  },
  getCurrentUser: () => api.get('/auth/me'),
};

// Stock APIs
export const stockAPI = {
  getAll: (params) => api.get('/stocks', { params }),
  getById: (id) => api.get(`/stocks/${id}`),
  getBySymbol: (symbol) => api.get(`/stocks/symbol/${symbol}`),
  getTrending: () => api.get('/stocks/trending'),
  create: (stockData) => api.post('/stocks', stockData),
  update: (id, stockData) => api.put(`/stocks/${id}`, stockData),
  delete: (id) => api.delete(`/stocks/${id}`),
};

// Transaction APIs
export const transactionAPI = {
  buy: (data) => api.post('/transactions/buy', data),
  sell: (data) => api.post('/transactions/sell', data),
  getHistory: (params) => api.get('/transactions/history', { params }),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  getHoldings: () => api.get('/users/holdings'),
  updateProfile: (data) => api.put('/users/profile', data),
};

// Leaderboard APIs - ADD THIS
export const leaderboardAPI = {
  getTop: (limit = 10) => api.get('/leaderboard', { params: { limit } }),
  getUserRank: (userId) => api.get(`/leaderboard/rank/${userId}`),
};

// News APIs
export const newsAPI = {
  getAll: (params) => api.get('/news', { params }),
  getByStock: (symbol) => api.get(`/news/stock/${symbol}`),
  refresh: () => api.post('/news/refresh'),
  create: (newsData) => api.post('/news', newsData),
  delete: (id) => api.delete(`/news/${id}`),
};

// Admin APIs
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  adjustUserBalance: (id, data) => api.post(`/admin/users/${id}/adjust-balance`, data),
  setUserProfit: (id, data) => api.post(`/admin/users/${id}/set-profit`, data),
  setUserPortfolio: (id, data) => api.post(`/admin/users/${id}/set-portfolio`, data),
  getStats: () => api.get('/admin/stats'),
  getSectors: () => api.get('/admin/sectors'),
  adjustSectorPrices: (data) => api.post('/admin/adjust-sector-prices', data),
  getTransactions: () => api.get('/admin/transactions'),
  getUserPortfolio: (id) => api.get(`/admin/users/${id}/portfolio`),
  deleteStock: (id) => api.delete(`/admin/stocks/${id}`),
};

export default api;