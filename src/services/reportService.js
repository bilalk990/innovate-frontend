import api from './api';

const reportService = {
    // ── Evaluation reports ──
    listEvaluations: (params) => api.get('/evaluations/', { params }),
    triggerEvaluation: (interviewId) =>
        api.post('/evaluations/trigger/', { interview_id: interviewId }),
    getEvaluation: (id) => api.get(`/evaluations/${id}/`),
    addHrNotes: (id, notes) => api.patch(`/evaluations/${id}/`, { hr_notes: notes }),
    exportPDF: (id) => api.get(`/evaluations/${id}/export-pdf/`, { responseType: 'blob' }),
    exportCSV: () => api.get('/evaluations/export/', { responseType: 'blob' }),

    // ── AI Feature: Offer Letter ──
    generateOffer: (id) => api.get('/evaluations/offer/', { params: { eval_id: id } }),

    // ── AI Feature 6: Candidate Ranking ──
    rankCandidates: (jobId) => api.get('/evaluations/rank/', { params: { job_id: jobId } }),

    // ── AI Feature 7: Interview Debrief ──
    getDebrief: (evalId) => api.get(`/evaluations/${evalId}/debrief/`),

    // ── AI Feature 10: Hire Probability ──
    getHireProbability: (evalId) => api.get(`/evaluations/${evalId}/hire-probability/`),

    // ── Share evaluation with candidate ──
    shareEvaluation: (evalId) => api.patch(`/evaluations/${evalId}/share/`),

    // ── Notifications ──
    getNotifications: () => api.get('/notifications/'),
    getUnreadCount: () => api.get('/notifications/unread-count/'),
    markRead: (id) => api.patch(`/notifications/${id}/read/`),
    markAllRead: () => api.patch('/notifications/mark-all-read/'),

    // ── AI Health Check ──
    checkAIStatus: () => api.get('/ai-status/').then(r => r.data).catch(err => ({
        status: 'error',
        error_type: 'NETWORK_ERROR',
        message: 'Cannot reach AI service. Check if backend is running.',
        detail: err?.message,
    })),

    // ── NEW AI FEATURES ──
    // Behavioral Traits Analyzer
    analyzeBehavioralTraits: (transcript) => api.post('/evaluations/behavioral-traits/', { transcript }),
    
    // Integrity & Plagiarism Checker
    checkIntegrity: (responses) => api.post('/evaluations/check-integrity/', { responses }),
    
    // Culture Fit Analyzer
    analyzeCultureFit: (transcript, companyValues) => api.post('/evaluations/culture-fit/', { transcript, company_values: companyValues }),
    
    // Executive Summary Generator
    generateExecutiveSummary: (interviewData, evaluationResults) => api.post('/evaluations/executive-summary/', { interview_data: interviewData, evaluation_results: evaluationResults }),
    
    // Predictive Hiring Score (Advanced)
    predictHireSuccess: (evalId) => api.get(`/evaluations/${evalId}/predict-hire/`),
};

export default reportService;
