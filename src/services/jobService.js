import api from './api';

const jobService = {
    list: (params) => api.get('/jobs/', { params }),
    get: (id) => api.get(`/jobs/${id}/`),
    post: (data) => api.post('/jobs/', data),
    update: (id, data) => api.patch(`/jobs/${id}/`, data),
    remove: (id) => api.delete(`/jobs/${id}/`),
    apply: (jobId) => api.post('/jobs/applications/', { job_id: jobId }),
    myApplications: () => api.get('/jobs/applications/'),
    getJobApplicants: (jobId, params) => api.get(`/jobs/${jobId}/applicants/`, { params }),
    updateApplicationStatus: (appId, status) => api.patch(`/jobs/applications/${appId}/`, { status }),
    // Feature 4 — AI Resume vs JD Gap Analyzer
    getGapAnalysis: (jobId) => api.get(`/jobs/${jobId}/gap-analysis/`),
    
    // NEW AI FEATURES
    // Job Fitment Deep Analysis
    analyzeJobFitment: (resumeData, jobDescription) => api.post('/jobs/fitment-analysis/', { resume_data: resumeData, job_description: jobDescription }),
    
    // Advanced Gap Analyzer
    getAdvancedGapAnalysis: (resumeData, jobId) => api.post('/jobs/advanced-gap-analysis/', { resume_data: resumeData, job_id: jobId }),
    // Predict Application Status
    predictApplicationStatus: (jobId) => api.post(`/jobs/${jobId}/predict-status/`),
};

export default jobService;
