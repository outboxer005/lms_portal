import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 Unauthorized, clear auth and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  validateToken: (token) => api.get(`/auth/validate?token=${token}`),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// Student & Staff registration (same endpoint; role is in payload)
export const studentAPI = {
  register: (formData) => {
    return axios.post(`${API_BASE_URL}/student/register`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getRegistrationStatus: (registrationId) =>
    api.get(`/student/registration/${registrationId}`),
  getDashboard: () => api.get('/student/dashboard'),
  getProfile: () => api.get('/student/profile'),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getStudentRegistrations: () => api.get('/admin/student-registrations'),
  getStaffRegistrations: () => api.get('/admin/staff-registrations'),
  getUsers: (role) => api.get(`/admin/users?role=${role}`),
  getAllRegistrations: (status) => {
    const url = status ? `/admin/registrations?status=${status}` : '/admin/registrations';
    return api.get(url);
  },
  getPendingRegistrations: () => api.get('/admin/registrations/pending'),
  getApprovedRegistrations: () => api.get('/admin/registrations/approved'),
  getRejectedRegistrations: () => api.get('/admin/registrations/rejected'),
  getRegistrationDetails: (id) => api.get(`/admin/registrations/${id}`),
  downloadDocument: (id) =>
    api.get(`/admin/registrations/${id}/document`, { responseType: 'blob' }),
  approveRegistration: (id) => api.post(`/admin/registrations/${id}/approve`),
  rejectRegistration: (id, data) =>
    api.post(`/admin/registrations/${id}/reject`, data),
  searchRegistrations: (query) =>
    api.get(`/admin/registrations/search?query=${query}`),
  getStats: () => api.get('/admin/stats'),
};

// Shared staff/admin user lookup
export const userAPI = {
  getUsers: (role) => api.get(`/users?role=${role}`),
};

// Library API (books + issuances)
export const libraryAPI = {
  // Books (public browsing for all authenticated)
  getBooks: (params = {}) => api.get('/library/books', { params }),
  getBook: (id) => api.get(`/library/books/${id}`),
  getGenres: () => api.get('/library/genres'),
  getStats: () => api.get('/library/stats'),

  // Admin/Staff book management
  addBook: (data) => api.post('/library/books', data),
  updateBook: (id, data) => api.put(`/library/books/${id}`, data),
  deleteBook: (id) => api.delete(`/library/books/${id}`),

  // Admin/Staff issuance management
  issueBook: (data) => api.post('/library/issue', data),
  returnBook: (issuanceId) => api.post(`/library/return/${issuanceId}`),
  getAllIssuances: (status) => {
    const params = status ? { status } : {};
    return api.get('/library/issuances', { params });
  },
  getOverdueIssuances: () => api.get('/library/issuances/overdue'),
  getStudentIssuances: (studentId) => api.get(`/library/issuances/student/${studentId}`),

  // Student: my books
  getMyBooks: () => api.get('/library/my-books'),
  getMyActiveBooks: () => api.get('/library/my-books/active'),

  // Ratings
  submitRating: (data) => api.post('/library/ratings', data),
  getMyRatingForBook: (bookId) => api.get(`/library/ratings/my/${bookId}`),
  hasRatedBook: (bookId) => api.get(`/library/ratings/my/${bookId}/exists`),
  getBookRatings: (bookId) => api.get(`/library/ratings/book/${bookId}`),
  getBookRatingSummary: (bookId) => api.get(`/library/ratings/book/${bookId}/summary`),
};

// Membership API
export const membershipAPI = {
  // Plans
  getActivePlans: () => api.get('/membership/plans'),
  getAllPlans: () => api.get('/membership/plans/all'),
  getPlan: (id) => api.get(`/membership/plans/${id}`),
  createPlan: (data) => api.post('/membership/plans', data),
  updatePlan: (id, data) => api.put(`/membership/plans/${id}`, data),
  deletePlan: (id) => api.delete(`/membership/plans/${id}`),

  // Student Memberships
  getAllMemberships: () => api.get('/membership/all'),
  getStudentMemberships: (studentId) => api.get(`/membership/student/${studentId}`),
  getActiveMembership: (studentId) => api.get(`/membership/student/${studentId}/active`),
  getMyMembership: () => api.get('/membership/my'),
  getMyLatestMembership: () => api.get('/membership/my/latest'),
  assignMembership: (data) => api.post('/membership/assign', data),
  selfAssignMembership: (data) => api.post('/membership/self-assign', data),
  revokeMembership: (membershipId) => api.post(`/membership/${membershipId}/revoke`),
  getStudentAllowance: (studentId) => api.get(`/membership/student/${studentId}/allowance`),
};

export const bookRequestAPI = {
  createRequest: (data) => api.post('/library/book-requests', data),
  submitRequest: (data) => api.post('/library/book-requests', data), // Alias for StudentDashboard
  getMyRequests: () => api.get('/library/book-requests/my'),
  getAllRequests: () => api.get('/library/book-requests'),
  approveRequest: (id, note) => api.post(`/library/book-requests/${id}/approve`, { note }),
  rejectRequest: (id, note) => api.post(`/library/book-requests/${id}/reject`, { note })
};

export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  getUnread: () => api.get('/notifications/unread'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.post(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/mark-all-read'),
};

export const paymentAPI = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verifyPayment: (data) => api.post('/payments/verify', data),
  getPaymentHistory: () => api.get('/payments/history'),
  getUnpaidFines: () => api.get('/payments/unpaid-fines'),
  getUnpaidMemberships: () => api.get('/payments/unpaid-memberships'),
};

export const adminSystemAPI = {
  autoComplete: () => api.post('/admin/system/auto-complete'),
};

export default api;
