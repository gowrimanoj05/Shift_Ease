import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  getAllUsers: () => api.get('/auth/users'),
};

// Shift APIs
export const shiftAPI = {
  getMyShifts: () => api.get('/shifts/my-shifts'),
  getAllShifts: () => api.get('/shifts/all'),
  getCrewSchedule: (startDate, endDate) => 
    api.get(`/shifts/crew-schedule?startDate=${startDate}&endDate=${endDate}`),
  generateCrewShifts: (data) => api.post('/shifts/generate-crew-shifts', data),
  getNextShift: () => api.get('/shifts/next-shift'),
  createShift: (data) => api.post('/shifts', data),
  updateShift: (id, data) => api.put(`/shifts/${id}`, data),
  deleteShift: (id) => api.delete(`/shifts/${id}`),
  deleteUserShifts: (userId, startDate, endDate) => 
    api.delete(`/shifts/user/bulk?userId=${userId}&startDate=${startDate}${endDate ? `&endDate=${endDate}` : ''}`),
};

// Swap Request APIs
export const swapAPI = {
  getSwapRequests: () => api.get('/swap-requests'),
  createSwapRequest: (data) => api.post('/swap-requests', data),
  getAvailableShiftsForSwap: (shiftId) => api.get(`/swap-requests/available/${shiftId}`),
  approveSwapRequest: (id) => api.put(`/swap-requests/${id}/approve`),
  rejectSwapRequest: (id) => api.put(`/swap-requests/${id}/reject`),
};

// Gemini AI Chat APIs
export const chatAPI = {
  sendMessage: (data) => api.post('/gemini/chat', data),
};

export default api;