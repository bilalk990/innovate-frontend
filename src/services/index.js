import api from '../api/axios';

export const authService = {
    register: (data) => api.post('/auth/register/', data),
    login: (data) => api.post('/auth/login/', data),
    getProfile: () => api.get('/auth/profile/'),
    updateProfile: (data) => api.patch('/auth/profile/', data),
    changePassword: (data) => api.post('/auth/change-password/', data),
    getUsers: (role) => api.get('/auth/users/', { params: role ? { role } : {} }),
    updateUser: (id, data) => api.patch(`/auth/users/${id}/`, data),
    getGoogleAuthUrl: () => api.get('/auth/google/url/'),
    syncGoogleCallback: (code) => api.post('/auth/google/callback/', { code }),
    googleLogin: (token, role) => api.post('/auth/google-login/', { token, role }),
};

export const interviewService = {
    list: (params) => api.get('/interviews/', { params }),
    create: (data) => api.post('/interviews/', data),
    get: (id) => api.get(`/interviews/${id}/`),
    update: (id, data) => api.patch(`/interviews/${id}/`, data),
    delete: (id) => api.delete(`/interviews/${id}/`),
    submitResponse: (id, data) => api.post(`/interviews/${id}/respond/`, data),
    joinRoom: (roomId) => api.get(`/interviews/room/${roomId}/`),
};

export const resumeService = {
    list: (params) => api.get('/resumes/', { params }),
    upload: (formData) => api.post('/resumes/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    get: (id) => api.get(`/resumes/${id}/`),
};

export const evaluationService = {
    list: () => api.get('/evaluations/'),
    trigger: (interviewId) => api.post('/evaluations/trigger/', { interview_id: interviewId }),
    get: (id) => api.get(`/evaluations/${id}/`),
    addNotes: (id, notes) => api.patch(`/evaluations/${id}/`, { hr_notes: notes }),
};

export const notificationService = {
    list: () => api.get('/notifications/'),
    unreadCount: () => api.get('/notifications/unread-count/'),
    markRead: (id) => api.patch(`/notifications/${id}/read/`),
    markAllRead: () => api.patch('/notifications/mark-all-read/'),
};
