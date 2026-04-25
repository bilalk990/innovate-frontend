import api from './api';

const resumeService = {
    list: (params) => api.get('/resumes/', { params }),
    upload: (formData) => api.post('/resumes/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    get: (id) => api.get(`/resumes/${id}/`),
    getCandidateResume: (candidateId) => api.get('/resumes/', { params: { candidate_id: candidateId } }),
    // Feature 11 — AI Resume Generator
    generateResume: (data) => api.post('/resumes/generate/', data),
    
    // NEW AI FEATURES
    // AI Resume Content Generator (Advanced)
    generateAdvancedResume: (profileData) => api.post('/resumes/generate-advanced/', profileData),
    atsReview: (data) => api.post('/resumes/ats-review/', data),
};

export default resumeService;
