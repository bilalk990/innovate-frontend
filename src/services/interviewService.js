import api from './api';

const interviewService = {
    list: (params) => api.get('/interviews/', { params }),
    create: (data) => api.post('/interviews/', data),
    get: (id) => api.get(`/interviews/${id}/`),
    update: (id, data) => api.patch(`/interviews/${id}/`, data),
    remove: (id) => api.delete(`/interviews/${id}/`),
    submitResponse: (id, data) => api.post(`/interviews/${id}/respond/`, data),
    joinRoom: (roomId) => api.get(`/interviews/room/${roomId}/`),
    // AI-powered question generation via OpenAI GPT
    generateQuestions: (data) => api.post('/interviews/generate-questions/', data),
    // AI-powered hints for candidates
    getHints: (data) => api.post('/interviews/hints/', data),
    recordViolation: (id) => api.post(`/interviews/${id}/violation/`),
    // Feature 1 — Emotion & Confidence Proctoring
    submitEmotionSnapshots: (id, snapshots) => api.post(`/interviews/${id}/proctoring-emotion/`, { snapshots }),
    // Feature 2 — Live Transcript Analysis
    analyzeTranscript: (id, data) => api.post(`/interviews/${id}/transcript-analysis/`, data),
    // Feature 3 — Adaptive Question Engine
    getAdaptiveQuestion: (id, data) => api.post(`/interviews/${id}/adaptive-question/`, data),
    // Feature 5 — Smart Slot Suggestions
    suggestSlots: (data) => api.post('/interviews/suggest-slots/', data),
    // End/complete an interview
    complete: (id) => api.post(`/interviews/${id}/end/`),
    listQuestionBanks: (params) => api.get('/interviews/question-banks/', { params }),
    createQuestionBank: (data) => api.post('/interviews/question-banks/', data),
    getQuestionBank: (bankId) => api.get(`/interviews/question-banks/${bankId}/`),
    updateQuestionBank: (bankId, data) => api.patch(`/interviews/question-banks/${bankId}/`, data),
    deleteQuestionBank: (bankId) => api.delete(`/interviews/question-banks/${bankId}/`),
    aiGenerateQuestionBank: (data) => api.post('/interviews/question-banks/ai-generate/', data),
    // Feature 9 — Live Question Suggester
    suggestNextQuestions: (id, data) => api.post(`/interviews/${id}/suggest-questions/`, data),
    // New AI Features
    // Feature 1 — Voice Tone & Stress Analysis
    analyzeVoiceTone: (id, audioMetrics) => api.post(`/interviews/${id}/voice-tone/`, { audio_metrics: audioMetrics }),
    // Feature 2 — Live Answer Quality Meter
    getLiveQuality: (id, data) => api.post(`/interviews/${id}/live-quality/`, data),
    // Feature 3 — Whisper Transcription + Summary
    transcribeAudio: (id, data) => api.post(`/interviews/${id}/transcribe/`, data),
    // Feature 4 — Inconsistency / Lie Detection
    checkInconsistencies: (id, data) => api.post(`/interviews/${id}/inconsistency-check/`, data),
    // Feature 5 — Recruiter Coach
    getRecruiterCoaching: (id, data) => api.post(`/interviews/${id}/recruiter-coach/`, data),
    // Feature 7 — JD Analyzer
    analyzeJD: (data) => api.post('/interviews/analyze-jd/', data),
    // Feature 8 — Difficulty Calibrator
    calibrateDifficulty: (data) => api.post('/interviews/calibrate-difficulty/', data),
};

export default interviewService;
