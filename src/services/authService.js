import api from './api';

const authService = {
    register: (data) => api.post('/auth/register/', data),
    login: (data) => api.post('/auth/login/', data),
    getProfile: () => api.get('/auth/profile/'),
    updateProfile: (data) => api.patch('/auth/profile/', data),
    googleLogin: (token, role) => api.post('/auth/google-login/', { token, role }),
    changePassword: (data) => api.post('/auth/change-password/', data),
    getUsers: (role) => api.get('/auth/users/', { params: role ? { role } : {} }),
    getCandidateProfile: (userId) => api.get(`/auth/users/${userId}/`),
    updateUser: (id, data) => api.patch(`/auth/users/${id}/`, data),
    toggleStatus: (id) => api.patch(`/auth/users/${id}/`, { is_active: 'toggle' }),
    // Google OAuth for Meet/Calendar
    getGoogleAuthUrl: () => api.get('/auth/google/url/'),
    syncGoogleCallback: (code) => api.post('/auth/google/callback/', { code }),
    // AI Profile Improvement Suggestions
    getProfileSuggestions: () => api.get('/auth/profile-suggestions/'),
};

export default authService;
