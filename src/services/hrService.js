import api from './api';

const hrService = {
    compareCandidates: (data) => api.post('/auth/hr/compare-candidates/', data),
    detectBias: (data) => api.post('/auth/hr/bias-detector/', data),
    getReferenceQuestions: (data) => api.post('/auth/hr/reference-check/', data),
    predictOfferAcceptance: (data) => api.post('/auth/hr/offer-predictor/', data),
    analyzeFunnel: (data) => api.post('/auth/hr/funnel-analyzer/', data),
    predictTeamFit: (data) => api.post('/auth/hr/team-fit/', data),
    coachInterviewer: (data) => api.post('/auth/hr/interviewer-coach/', data),
    bulkScreenResumes: (data) => api.post('/auth/hr/bulk-resume-screen/', data),
    generateEmailCampaign: (data) => api.post('/auth/hr/email-campaign/', data),
    trackSentiment: (data) => api.post('/auth/hr/sentiment-tracker/', data),
    profileCandidateDNA: (data) => api.post('/auth/hr/candidate-dna/', data),
    rediscoverTalent: (data) => api.post('/auth/hr/talent-rediscovery/', data),
    analyzeInterviewQuality: (data) => api.post('/auth/hr/interview-quality/', data),
    generateHRDocument: (data) => api.post('/auth/hr/generate-document/', data),
    buildHandbook: (data) => api.post('/auth/hr/handbook-builder/', data),
};

export default hrService;
