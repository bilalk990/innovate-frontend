import api from './api';

const evaluationService = {
    list: (params) => api.get('/evaluations/', { params }),
    get: (evalId) => api.get(`/evaluations/${evalId}/`),
    trigger: (data) => api.post('/evaluations/trigger/', data),
    patch: (evalId, data) => api.patch(`/evaluations/${evalId}/`, data),
    share: (evalId) => api.patch(`/evaluations/${evalId}/share/`),
    exportPDF: (evalId) => api.get(`/evaluations/${evalId}/export-pdf/`, { responseType: 'blob' }),
    exportCSV: () => api.get('/evaluations/export/', { responseType: 'blob' }),
    getOfferLetter: (evalId) => api.get(`/evaluations/offer/?eval_id=${evalId}`),
    // Feature 6 — Candidate Ranking
    rankCandidates: (jobId) => api.get(`/evaluations/rank/?job_id=${jobId}`),
    // Feature 7 — Interview Debrief
    getDebrief: (evalId) => api.get(`/evaluations/${evalId}/debrief/`),
    // Feature 10 — Predictive Hiring Score
    getHireProbability: (evalId) => api.get(`/evaluations/${evalId}/hire-probability/`),
    // New Feature 6 — Follow-up Email Generation
    generateFollowUpEmail: (evalId, data) => api.post(`/evaluations/${evalId}/followup-email/`, data),
    // Deep AI Analysis panels (Recruiter-side, on-demand)
    analyzeBehavioralTraits: (data) => api.post('/evaluations/behavioral-traits/', data),
    checkIntegrity: (data) => api.post('/evaluations/check-integrity/', data),
    analyzeCultureFit: (data) => api.post('/evaluations/culture-fit/', data),
    generateExecutiveSummary: (data) => api.post('/evaluations/executive-summary/', data),
    getPredictHire: (evalId) => api.get(`/evaluations/${evalId}/predict-hire/`),
    // Candidate Interview Readiness Score
    getReadinessScore: () => api.get('/evaluations/readiness/'),
};

export default evaluationService;
