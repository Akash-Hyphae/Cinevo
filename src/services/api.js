import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cinevo_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to format errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    const customError = new Error(message);
    customError.status = error.response?.status;
    customError.data = error.response?.data;
    customError.conflictSeat = error.response?.data?.conflictSeat;

    return Promise.reject(customError);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getMailbox: () => api.get('/auth/mailbox'),
};

export const moviesAPI = {
  getAll: (params) => api.get('/movies', { params }),
  getById: (id) => api.get(`/movies/${id}`),
};

export const cinemasAPI = {
  getCities: () => api.get('/cinemas/cities'),
  getAll: (params) => api.get('/cinemas', { params }),
  getById: (id) => api.get(`/cinemas/${id}`),
};

export const showsAPI = {
  getAll: (params) => api.get('/shows', { params }),
  getById: (id) => api.get(`/shows/${id}`),
  getSeats: (showId) => api.get(`/shows/${showId}/seats`),
  lockSeats: (showId, seatIds) => api.post(`/shows/${showId}/lock-seats`, { seatIds }),
  releaseSeats: (showId, seatIds) => api.post(`/shows/${showId}/release-seats`, { seatIds }),
};

export const bookingsAPI = {
  create: (data) => api.post('/bookings', data),
  getById: (id) => api.get(`/bookings/${id}`),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  cancel: (id) => api.post(`/bookings/${id}/cancel`),
};

export const paymentsAPI = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verify: (data) => api.post('/payments/verify', data),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  createMovie: (data) => api.post('/admin/movies', data),
  updateMovie: (id, data) => api.put(`/admin/movies/${id}`, data),
  deleteMovie: (id) => api.delete(`/admin/movies/${id}`),
  createShow: (data) => api.post('/admin/shows', data),
  deleteShow: (id) => api.delete(`/admin/shows/${id}`),
  testConcurrency: (data) => api.post('/admin/test-concurrency', data),
};

export default api;
