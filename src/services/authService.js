import api from './api';

const authService = {
    register: (data) => api.post('/auth/register/', data),
    login: (data) => api.post('/auth/login/', data),
    getProfile: () => api.get('/auth/profile/'),
    updateProfile: (data) => api.patch('/auth/profile/', data),
    googleLogin: (token, role) => api.post('/auth/google-login/', { token, role }),
    changePassword: (data) => api.post('/auth/change-password/', data),
    getUsers: (role, params = {}) => api.get('/auth/users/', { params: { ...params, ...(role ? { role } : {}) } }),
    getCandidateProfile: (userId) => api.get(`/auth/users/${userId}/`),
    updateUser: (id, data) => api.patch(`/auth/users/${id}/`, data),
    toggleStatus: (id) => api.patch(`/auth/users/${id}/`, { is_active: 'toggle' }),
    // Google OAuth for Meet/Calendar
    getGoogleAuthUrl: () => api.get('/auth/google/url/'),
    syncGoogleCallback: (code) => api.post('/auth/google/callback/', { code }),
    // AI Profile Improvement Suggestions
    getProfileSuggestions: () => api.get('/auth/profile-suggestions/'),
    // Salary Negotiation AI
    getSalaryNegotiation: (data) => api.post('/auth/salary-negotiation/', data),
    // Career Path Recommender
    getCareerPath: () => api.get('/auth/career-path/'),
    // Interview Prep Lab
    getInterviewPrepPlan: (data) => api.post('/auth/interview-prep/plan/', data),
    getInterviewPrepQuiz: (data) => api.post('/auth/interview-prep/quiz/', data),
    getInterviewPrepReport: (data) => api.post('/auth/interview-prep/report/', data),
    // Feature Set 7 — Candidate Career AI Tools
    generateCoverLetter: (data) => api.post('/auth/cover-letter/', data),
    analyzeJobMatch: (data) => api.post('/auth/job-match/', data),
    generateSelfIntro: (data) => api.post('/auth/self-intro/', data),
    getPortfolioSuggestions: (data) => api.post('/auth/portfolio-advisor/', data),
};

export default authService;
