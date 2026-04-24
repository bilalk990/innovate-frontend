import api from './api';

const hrService = {
    compareCandidates: (data) => api.post('/auth/hr/compare-candidates/', data),
    detectBias: (data) => api.post('/auth/hr/bias-detector/', data),
    getReferenceQuestions: (data) => api.post('/auth/hr/reference-check/', data),
    predictOfferAcceptance: (data) => api.post('/auth/hr/offer-predictor/', data),
    analyzeFunnel: (data) => api.post('/auth/hr/funnel-analyzer/', data),
    predictTeamFit: (data) => api.post('/auth/hr/team-fit/', data),
    coachInterviewer: (data) => api.post('/auth/hr/interviewer-coach/', data),
};

export default hrService;
