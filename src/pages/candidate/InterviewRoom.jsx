import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    TfiVideoCamera,
    TfiMicrophone,
    TfiDesktop,
    TfiClose,
    TfiShield,
    TfiWrite,
    TfiReload,
    TfiCheck
} from 'react-icons/tfi';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import useWebSocket from '../../hooks/useWebSocket';
import useMediaPipeMonitoring from '../../hooks/useMediaPipeMonitoring';
import MonitoringDashboard from '../../components/MonitoringDashboard';
import ComprehensiveReport from '../../components/ComprehensiveReport';
import AIEvaluationScreen from '../../components/AIEvaluationScreen';
import VoiceToneAnalyzer from '../../components/VoiceToneAnalyzer';
import LiveQualityMeter from '../../components/LiveQualityMeter';
import WhisperTranscriber from '../../components/WhisperTranscriber';
import RecruiterCoach from '../../components/RecruiterCoach';
import InconsistencyChecker from '../../components/InconsistencyChecker';
import { toast } from 'sonner';

// Control Toggle Component for Tactical Navbar
function ControlToggle({ active, icon, label, onClick, pulse }) {
    return (
        <button
            onClick={onClick}
            className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 ${
                active 
                    ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' 
                    : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-red-600'
            }`}
            title={label}
        >
            <div className={`text-xl ${pulse ? 'animate-pulse' : ''}`}>{icon}</div>
        </button>
    );
}

export default function InterviewRoom() {
    const { roomId } = useParams(); // Changed from 'id' to 'roomId' to match route
    const id = roomId; // Keep 'id' variable for backward compatibility
    const navigate = useNavigate();
    const { user, token } = useAuth(); // Dynamic authenticated user + JWT token

    // Mock Contexts
    const interview = { title: 'Senior AI Engineer Assessment', id: id };

    // Core States
    const [interviewStatus, setInterviewStatus] = useState('active'); // Track actual interview status from backend
    const [audioMuted, setAudioMuted] = useState(false);
    const [videoOff, setVideoOff] = useState(false);
    const [hasVideoFeed, setHasVideoFeed] = useState(true);
    const [screenSharing, setScreenSharing] = useState(false);
    const [transcriptActive, setTranscriptActive] = useState(false);
    const [confirmEnd, setConfirmEnd] = useState(false);
    const [interviewComplete, setInterviewComplete] = useState(false);
    const [showEvaluation, setShowEvaluation] = useState(false);
    const [evaluationData, setEvaluationData] = useState(null);
    const [isGeneratingEvaluation, setIsGeneratingEvaluation] = useState(false);


    // Derive WebSocket URL — prefer VITE_WS_URL, otherwise auto-convert from VITE_API_URL
    const wsBaseUrl = (() => {
        if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;
        if (import.meta.env.VITE_API_URL) {
            // Convert https://host/api → wss://host
            return import.meta.env.VITE_API_URL
                .replace(/^https/, 'wss')
                .replace(/^http/, 'ws')
                .replace(/\/api\/?$/, '');
        }
        return 'ws://127.0.0.1:8000';
    })();
    
    // ✅ CRITICAL FIX: Append JWT token to WebSocket URL for authentication
    const wsUrl = `${wsBaseUrl}/ws/interview/${id}/?${token ? `token=${token}` : ''}`;
    
    // Debug logging to verify token is being passed
    console.log('[DEBUG] WebSocket URL:', wsUrl);
    console.log('[DEBUG] Token present:', !!token);
    console.log('[DEBUG] User:', user?.email, 'Role:', user?.role);
    
    const { send, close: wsClose } = useWebSocket(wsUrl, {
        onMessage: async (event) => {
            try {
                const data = JSON.parse(event.data);

                // --- Admission Signaling (cross-device via WebSocket) ---
                // Backend sends 'candidate_waiting' to recruiter when candidate joins
                if (data.type === 'candidate_waiting') {
                    console.log('[DEBUG] HR received candidate_waiting notification');
                    if (user?.role !== 'candidate') {
                        setIsCandidateWaiting(true);
                        toast.success('Candidate is waiting for admission!', { duration: 5000 });
                    }
                }

                // Backend sends 'candidate_left' when candidate disconnects from waiting
                if (data.type === 'candidate_left') {
                    if (user?.role !== 'candidate') {
                        setIsCandidateWaiting(false);
                    }
                }

                // Backend sends 'admitted' to candidate when recruiter admits them
                if (data.type === 'admitted') {
                    console.log('[DEBUG] Candidate received admitted notification');
                    if (user?.role === 'candidate') {
                        setAdmissionStatus('admitted');
                        toast.success('Recruiter has admitted you. Entering room...');
                        
                        // CRITICAL FIX: Immediately trigger peer connection setup after admission
                        setTimeout(async () => {
                            console.log('[DEBUG] Setting up peer connection after admission');
                            
                            // Wait for local stream to be ready with longer timeout
                            let retries = 0;
                            while (!localStream.current && retries < 20) {
                                console.log('[DEBUG] Waiting for local stream...', retries);
                                await new Promise(resolve => setTimeout(resolve, 500));
                                retries++;
                            }
                            
                            if (!localStream.current) {
                                console.error('[DEBUG] Local stream not available after waiting!');
                                toast.error('Camera not ready. Please refresh and try again.');
                                return;
                            }
                            
                            console.log('[DEBUG] Local stream ready with tracks:', localStream.current.getTracks().map(t => t.kind));
                            const connection = createPeerConnection();
                            
                            // Add tracks before making offer
                            console.log('[DEBUG] Adding local tracks to connection');
                            localStream.current.getTracks().forEach(track => {
                                connection.addTrack(track, localStream.current);
                                console.log('[DEBUG] Added track:', track.kind, 'enabled:', track.enabled, 'readyState:', track.readyState);
                            });
                            
                            console.log('[DEBUG] Creating offer with constraints');
                            const offer = await connection.createOffer({
                                offerToReceiveAudio: true,
                                offerToReceiveVideo: true
                            });
                            await connection.setLocalDescription(offer);
                            
                            console.log('[DEBUG] Sending offer to recruiter, SDP:', offer.sdp?.substring(0, 100));
                            send({ type: 'offer', offer });
                            updateLogs({ type: 'NET', text: 'Initiating handshake...', color: 'text-blue-500' });
                        }, 2000); // Increased delay to 2s to ensure camera is fully ready
                    }
                }

                // Backend sends 'recruiter_ready' when recruiter joins - candidate should re-request
                if (data.type === 'recruiter_ready') {
                    console.log('[DEBUG] Recruiter joined, re-sending admission request');
                    if (user?.role === 'candidate' && admissionStatus === 'waiting') {
                        send({ type: 'request_admit', room: id });
                    }
                }

                // --- Core WebRTC Signaling ---
                if (data.type === 'peer-connected') {
                    console.log('[DEBUG] Received peer-connected, user role:', user?.role);
                    // Candidate creates offer (already handled in 'admitted' message above)
                    // Recruiter just waits for the offer
                    if (user?.role === 'recruiter' || user?.role === 'admin') {
                        console.log('[DEBUG] Recruiter waiting for candidate offer');
                        updateLogs({ type: 'NET', text: 'Waiting for candidate connection...', color: 'text-blue-500' });
                    }
                } 
                
                else if (data.type === 'offer') {
                    console.log('[DEBUG] Received offer from peer');
                    const connection = createPeerConnection();

                    console.log('[DEBUG] Setting remote description (offer)');
                    await connection.setRemoteDescription(new RTCSessionDescription(data.offer));
                    isRemoteDescSet.current = true;

                    // Flush any buffered ICE candidates
                    for (const c of pendingIceCandidates.current) {
                        try { 
                            await connection.addIceCandidate(new RTCIceCandidate(c)); 
                            console.log('[DEBUG] Added buffered ICE candidate');
                        } catch (e) {
                            console.error('[DEBUG] Error adding buffered ICE:', e);
                        }
                    }
                    pendingIceCandidates.current = [];

                    // Wait for local stream if not ready yet
                    if (!localStream.current) {
                        console.warn('[DEBUG] Local stream not ready when receiving offer, waiting...');
                        let retries = 0;
                        while (!localStream.current && retries < 20) {
                            await new Promise(resolve => setTimeout(resolve, 500));
                            retries++;
                        }
                    }

                    // Add tracks before answering
                    if (localStream.current) {
                        console.log('[DEBUG] Adding local tracks to connection');
                        localStream.current.getTracks().forEach(track => {
                            if (!connection.getSenders().find(s => s.track === track)) {
                                connection.addTrack(track, localStream.current);
                                console.log('[DEBUG] Added track:', track.kind, 'enabled:', track.enabled, 'readyState:', track.readyState);
                            }
                        });
                    } else {
                        console.error('[DEBUG] No local stream available when receiving offer after waiting!');
                    }

                    console.log('[DEBUG] Creating answer with constraints');
                    const answer = await connection.createAnswer({
                        offerToReceiveAudio: true,
                        offerToReceiveVideo: true
                    });
                    await connection.setLocalDescription(answer);

                    console.log('[DEBUG] Sending answer to peer, SDP:', answer.sdp?.substring(0, 100));
                    send({ type: 'answer', answer });
                    updateLogs({ type: 'NET', text: 'Handshake accepted.', color: 'text-emerald-500' });
                }

                else if (data.type === 'answer') {
                    console.log('[DEBUG] Received answer from peer');
                    if (pc.current) {
                        console.log('[DEBUG] Setting remote description (answer)');
                        await pc.current.setRemoteDescription(new RTCSessionDescription(data.answer));
                        isRemoteDescSet.current = true;

                        // Flush any buffered ICE candidates
                        for (const c of pendingIceCandidates.current) {
                            try { await pc.current.addIceCandidate(new RTCIceCandidate(c)); } catch (_) {}
                        }
                        pendingIceCandidates.current = [];
                        updateLogs({ type: 'NET', text: 'Connection established!', color: 'text-emerald-500' });
                    } else {
                        console.error('[DEBUG] No peer connection available for answer!');
                    }
                }

                else if (data.type === 'ice-candidate') {
                    if (pc.current && data.candidate) {
                        if (isRemoteDescSet.current) {
                            try {
                                await pc.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                            } catch (e) {
                                console.error('[DEBUG] Error adding ICE candidate:', e);
                            }
                        } else {
                            // Buffer until remote description is set
                            pendingIceCandidates.current.push(data.candidate);
                            console.log('[DEBUG] Buffered ICE candidate, total:', pendingIceCandidates.current.length);
                        }
                    }
                }

                // --- Chat Messages ---
                else if (data.type === 'chat') {
                    console.log('[CHAT] Received message from peer:', data.text);
                    const newMsg = {
                        sender: data.sender || 'Peer',
                        text: data.text,
                        time: data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        isSystem: false,
                        from: data.from || 'peer'
                    };
                    
                    setChatMessages(prev => {
                        const updated = [...prev, newMsg];
                        localStorage.setItem(`room_${id}_chat`, JSON.stringify(updated));
                        return updated;
                    });
                    
                    // Show notification if chat is closed
                    if (!showChat) {
                        toast.info(`New message from ${newMsg.sender}`);
                    }
                }

                // --- Chat History (on join) ---
                else if (data.type === 'chat_history') {
                    console.log('[CHAT] Received chat history:', data.history?.length, 'messages');
                    if (data.history && data.history.length > 0) {
                        setChatMessages(data.history.map(msg => ({
                            sender: msg.sender || 'User',
                            text: msg.text,
                            time: msg.time || new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            isSystem: false
                        })));
                    }
                }

                // --- Violation Alerts (Real-time for Recruiter) ---
                else if (data.type === 'violation_alert') {
                    console.log('[VIOLATION] Received violation alert:', data.violation);
                    if (user?.role === 'recruiter' || user?.role === 'admin') {
                        // Show toast notification
                        toast.error(`🚨 VIOLATION: ${data.violation.type} - ${data.violation.description}`, {
                            duration: 5000,
                            style: {
                                background: '#dc2626',
                                color: 'white',
                                fontWeight: 'bold'
                            }
                        });
                        
                        // Update event log
                        updateLogs({ 
                            type: 'WARN', 
                            text: `Integrity Violation: ${data.violation.type} - ${data.violation.description}`, 
                            color: 'text-red-600 font-bold animate-pulse' 
                        });
                    }
                }

                // --- Flow Controls ---
                if (data.type === 'end_meeting' || data.type === 'meeting_ended') {
                    wsClose(); // Prevent WebSocket auto-reconnect — meeting is permanently over
                    if (localStream.current) localStream.current.getTracks().forEach(t => t.stop());
                    if (pc.current) pc.current.close();
                    try { recognitionRef.current?.stop(); } catch (_) {}
                    setInterviewComplete(true);

                    // Candidate: auto-submit transcript — use ref to avoid stale closure
                    if (user?.role === 'candidate') {
                        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
                        const mId = interviewMongoId;
                        const latestTranscript = liveTranscriptRef.current || '';
                        if (mId && latestTranscript.trim().length > 10) {
                            fetch(`${apiUrl}/interviews/${mId}/respond/`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                body: JSON.stringify({
                                    question_index: 0,
                                    response: latestTranscript.trim().slice(0, 4000),
                                    full_transcript: latestTranscript.trim()
                                })
                            }).catch(() => {});
                        }
                    }

                    // Generate AI evaluation for recruiter (4s delay so candidate transcript submits first)
                    if (user?.role === 'recruiter' || user?.role === 'admin') {
                        setTimeout(generateAIEvaluation, 4000);
                    }
                }
            } catch (err) {
                console.error("WS Message Error:", err);
            }
        }
    });

    // Chatting States
    const [chatMessages, setChatMessages] = useState(() => {
        const stored = localStorage.getItem(`room_${id}_chat`);
        return stored ? JSON.parse(stored) : [{ sender: 'AI System', text: 'Welcome to the InnovAIte Interview Room.', time: '10:00 AM', isSystem: true }];
    });
    const [eventLog, setEventLog] = useState(() => {
        const stored = localStorage.getItem(`room_${id}_events`);
        return stored ? JSON.parse(stored) : [
            { type: 'SYS', text: 'Interview Initialized', color: 'text-red-600' },
            { type: 'AI', text: 'Baseline emotions mapped.', color: 'text-emerald-600' },
            { type: 'NET', text: 'Stable latency: 45ms', color: 'text-blue-600' }
        ];
    });
    const [chatInput, setChatInput] = useState('');
    const [showChat, setShowChat] = useState(false);

    // AI & Integrity States
    const [tabSwitchCount, setTabSwitchCount] = useState(0);
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [faceSnapshots, setFaceSnapshots] = useState([]);
    const [localEmotion, setLocalEmotion] = useState({ score: 88, emotion: 'CONFIDENT' });
    const [aiCoachingTip, setAiCoachingTip] = useState("Monitoring baseline response metrics.");

    // ── New AI Features State ──
    // Feature 1: Voice Tone
    const [voiceToneData, setVoiceToneData] = useState({
        tone_score: 65,
        stress_level: 'medium',
        confidence: 'moderate'
    });
    // Feature 2: Live Quality Meter
    const [liveQuality, setLiveQuality] = useState({ quality_score: 0, bar_color: 'gray', coach_message: '', on_track: false });
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    // Feature 5: Recruiter Coach
    const [recruiterCoach, setRecruiterCoach] = useState(null);
    const [showCoachPanel, setShowCoachPanel] = useState(false);
    // Feature 4: Inconsistency
    const [inconsistencyReport, setInconsistencyReport] = useState(null);
    const [showInconsistency, setShowInconsistency] = useState(false);
    // Refs for audio analysis
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const voicePollRef = useRef(null);
    const qualityPollRef = useRef(null);
    
    // AI Question Generator State
    const [suggestedQuestions, setSuggestedQuestions] = useState([
        "Can you explain your approach to scaling highly concurrent systems?",
        "Describe a time you had to optimize a complex database query.",
        "How do you ensure data integrity in asynchronous microservices?"
    ]);
    const [generatingQuestions, setGeneratingQuestions] = useState(false);

    // Admission state (now powered by WebSocket, not localStorage)
    const [admissionStatus, setAdmissionStatus] = useState(
        user?.role === 'candidate' ? 'waiting' : 'admitted'
    );
    const [isCandidateWaiting, setIsCandidateWaiting] = useState(false);

    // When candidate joins, send 'request_admit' to backend (backend then notifies recruiter)
    useEffect(() => {
        // ✅ CRITICAL: Don't allow WebSocket connection if interview is completed
        if (interviewStatus === 'completed') {
            console.log('[WS] Interview completed, preventing WebSocket connection');
            return;
        }
        
        if (user?.role === 'candidate' && admissionStatus === 'waiting') {
            // Delay to ensure WS connection is open
            const t = setTimeout(() => {
                console.log('[DEBUG] Sending request_admit to backend, room:', id);
                send({ type: 'request_admit', room: id });
                toast.info('Requesting admission from recruiter...', { duration: 2000 });
            }, 1500);
            return () => clearTimeout(t);
        }
    }, [user, admissionStatus, id, interviewStatus]);

    // CRITICAL FIX: When recruiter joins, send a ping to check if candidate is waiting
    useEffect(() => {
        if (user?.role === 'recruiter' || user?.role === 'admin') {
            const t = setTimeout(() => {
                console.log('[DEBUG] Recruiter checking for waiting candidates');
                send({ type: 'recruiter_joined', room: id });
            }, 2000);
            return () => clearTimeout(t);
        }
    }, [user, id]);

    // Interview metadata loaded from backend
    const [interviewMongoId, setInterviewMongoId] = useState(null);
    const [interviewQuestions, setInterviewQuestions] = useState([]);
    const [liveTranscript, setLiveTranscript] = useState('');
    
    // Monitoring Dashboard States
    const [showMonitoringDashboard, setShowMonitoringDashboard] = useState(false);
    const [showComprehensiveReport, setShowComprehensiveReport] = useState(false);
    const [behaviorScore, setBehaviorScore] = useState(100);

    // ── Transcript + question index refs — declared early so onMessage closure can use them ──
    const liveTranscriptRef = useRef('');
    const currentQuestionIndexRef = useRef(0);

    // ── Anxiety Detection State (candidate-only) ──
    const [anxietyData, setAnxietyData] = useState(null);
    const [showAnxietyCoach, setShowAnxietyCoach] = useState(false);
    const anxietyPollRef = useRef(null);
    const speechStartRef = useRef(null);
    const wordCountRef = useRef(0);
    const pauseCountRef = useRef(0);
    const fillerWordRef = useRef(0);
    const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'basically', 'literally', 'actually', 'so'];

    // Track speech features from live transcript for anxiety analysis
    useEffect(() => {
        if (!liveTranscript || user?.role !== 'candidate') return;
        const words = liveTranscript.trim().split(/\s+/);
        wordCountRef.current = words.length;
        fillerWordRef.current = words.filter(w => FILLER_WORDS.includes(w.toLowerCase())).length;
    }, [liveTranscript, user]);

    // Poll anxiety detection every 90 seconds during active interview (candidate only)
    useEffect(() => {
        if (admissionStatus !== 'admitted' || user?.role !== 'candidate') return;

        const runAnxietyCheck = async () => {
            try {
                const { default: evaluationService } = await import('../../services/evaluationService');
                const durationSec = speechStartRef.current ? Math.floor((Date.now() - speechStartRef.current) / 1000) : 60;
                const wpm = durationSec > 0 ? Math.round((wordCountRef.current / durationSec) * 60) : 120;
                const result = await evaluationService.checkAnxiety({
                    speech_rate_wpm: Math.max(60, Math.min(250, wpm)),
                    pause_frequency: pauseCountRef.current,
                    long_pauses: Math.floor(pauseCountRef.current / 3),
                    volume_variance: 0.2,
                    filler_word_count: fillerWordRef.current,
                    speaking_duration_seconds: durationSec,
                    silence_ratio: 0.15,
                    pitch_variance: 0,
                });
                const d = result.data;
                if (d.anxiety_score > 50) {
                    setAnxietyData(d);
                    setShowAnxietyCoach(true);
                }
            } catch (_) { /* silent fail */ }
        };

        speechStartRef.current = Date.now();
        anxietyPollRef.current = setInterval(runAnxietyCheck, 90000); // every 90s
        return () => clearInterval(anxietyPollRef.current);
    }, [admissionStatus, user]);

    // Refs
    const localVideo = useRef(null);
    const remoteVideo = useRef(null);
    const localStream = useRef(null);
    const pc = useRef(null); // WebRTC Peer Connection
    const screenStream = useRef(null); // Screen share stream
    const pendingIceCandidates = useRef([]); // Buffer ICE candidates until remote desc is set
    const isRemoteDescSet = useRef(false);
    const recognitionRef = useRef(null);
    
    // Enhanced Monitoring System - MediaPipe based detection
    const { 
        violations: detectedViolations, 
        detectionStats, 
        addManualViolation,
        isModelLoaded 
    } = useMediaPipeMonitoring(
        localVideo.current, 
        admissionStatus === 'admitted' && user?.role === 'candidate',
        (violation) => {
            // Send WebSocket notification to recruiter
            console.log('[MONITORING] Violation detected, sending to recruiter:', violation);
            send({ 
                type: 'violation_alert', 
                violation: violation
            });
            
            // Save to backend database
            if (interviewMongoId) {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
                fetch(`${apiUrl}/interviews/${interviewMongoId}/violations/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(violation)
                }).catch(err => console.error('[MONITORING] Failed to save violation:', err));
            }
        }
    );

    // Load interview MongoDB ID + questions from backend
    useEffect(() => {
        if (!token || !id) return;
        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
        fetch(`${apiUrl}/interviews/room/${id}/`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (!data) return;
                
                // ✅ CRITICAL: Check interview status - prevent rejoin if completed
                if (data.status === 'completed') {
                    console.log('[INTERVIEW] Interview has been ended by recruiter, preventing rejoin');
                    toast.error('This interview has been ended by the recruiter. You cannot rejoin.', { duration: 6000 });
                    
                    // Redirect candidate to dashboard after 3 seconds
                    if (user?.role === 'candidate') {
                        setTimeout(() => {
                            navigate('/candidate/dashboard');
                        }, 3000);
                    }
                    return; // Stop further initialization
                }
                
                setInterviewStatus(data.status || 'active');
                setInterviewMongoId(data.id);
                setBehaviorScore(data.behavior_score || 100); // Load existing behavior score
                if (data.questions?.length > 0) {
                    setInterviewQuestions(data.questions);
                    setSuggestedQuestions(data.questions.slice(0, 3).map(q => q.text));
                }
                console.log('[INTERVIEW] Loaded interview data, MongoDB ID:', data.id, 'Status:', data.status);
            })
            .catch(err => console.error('[INTERVIEW] Failed to load room data:', err));
    }, [token, id, user, navigate]);
    
    // Update behavior score when violations change
    useEffect(() => {
        if (detectedViolations.length === 0) return;
        
        // Calculate penalty based on severity
        const latestViolation = detectedViolations[detectedViolations.length - 1];
        const penalties = {
            'CRITICAL': 20,
            'HIGH': 10,
            'MEDIUM': 5,
            'LOW': 2
        };
        const penalty = penalties[latestViolation.severity] || 5;
        
        setBehaviorScore(prev => Math.max(0, prev - penalty));
        console.log('[MONITORING] Behavior score updated:', behaviorScore - penalty, 'Penalty:', penalty);
    }, [detectedViolations.length]);

    // Start Web Speech API transcript capture after admission
    useEffect(() => {
        if (admissionStatus !== 'admitted') return;
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return;

        const recognition = new SR();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        recognition.onresult = (event) => {
            const text = Array.from(event.results)
                .map(r => r[0].transcript)
                .join(' ');
            setLiveTranscript(prev => `${prev} ${text}`.trim());
        };
        recognition.onerror = (e) => console.warn('[SPEECH] Error:', e.error);
        recognition.start();
        recognitionRef.current = recognition;

        return () => {
            try { recognition.stop(); } catch (_) {}
        };
    }, [admissionStatus]);

    // ── Feature 3: Whisper Audio Recording — capture per-question audio chunks ──
    // Records audio in 60s segments and sends to backend Whisper for accurate transcription
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const whisperSegmentRef = useRef(null);

    useEffect(() => {
        // Whisper recording is for CANDIDATE only — recruiter audio should not pollute transcript
        if (admissionStatus !== 'admitted' || user?.role !== 'candidate') return;
        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

        const startRecording = () => {
            if (!localStream.current) {
                setTimeout(startRecording, 1500);
                return;
            }
            try {
                // Only record audio track
                const audioTracks = localStream.current.getAudioTracks();
                if (!audioTracks.length) return;
                const audioOnlyStream = new MediaStream(audioTracks);
                const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                    ? 'audio/webm;codecs=opus'
                    : MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';

                const recorder = new MediaRecorder(audioOnlyStream, { mimeType });
                audioChunksRef.current = [];

                recorder.ondataavailable = (e) => {
                    if (e.data.size > 0) audioChunksRef.current.push(e.data);
                };

                recorder.onstop = async () => {
                    if (!audioChunksRef.current.length || !interviewMongoId) return;
                    const blob = new Blob(audioChunksRef.current, { type: mimeType });
                    if (blob.size < 1000) return; // skip tiny/empty recordings

                    // Convert to base64
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                        const base64 = reader.result.split(',')[1];
                        try {
                            const res = await fetch(`${apiUrl}/interviews/${interviewMongoId}/transcribe/`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                body: JSON.stringify({
                                    audio_base64: base64,
                                    mime_type: mimeType.split(';')[0],
                                    question_index: currentQuestionIndexRef.current
                                })
                            });
                            if (res.ok) {
                                const data = await res.json();
                                if (data.transcript) {
                                    // Merge Whisper transcript with live transcript for accuracy
                                    setLiveTranscript(prev => {
                                        const combined = `${prev} ${data.transcript}`.trim();
                                        return combined.slice(-6000); // keep last 6000 chars
                                    });
                                    console.log('[WHISPER] Transcript segment received:', data.transcript.slice(0, 80));
                                }
                            }
                        } catch (_) {}
                    };
                    reader.readAsDataURL(blob);
                    audioChunksRef.current = [];
                };

                // Record in 60s segments
                recorder.start();
                mediaRecorderRef.current = recorder;
                whisperSegmentRef.current = setInterval(() => {
                    if (mediaRecorderRef.current?.state === 'recording') {
                        mediaRecorderRef.current.stop();
                        setTimeout(() => {
                            if (mediaRecorderRef.current) {
                                audioChunksRef.current = [];
                                mediaRecorderRef.current.start();
                            }
                        }, 200);
                    }
                }, 60000);

                console.log('[WHISPER] MediaRecorder started, mimeType:', mimeType);
            } catch (e) {
                console.warn('[WHISPER] MediaRecorder setup failed:', e);
            }
        };

        startRecording();

        return () => {
            clearInterval(whisperSegmentRef.current);
            if (mediaRecorderRef.current?.state === 'recording') {
                try { mediaRecorderRef.current.stop(); } catch (_) {}
            }
        };
    }, [admissionStatus, interviewMongoId, token]);

    // ── Feature 1: Voice Tone Analysis — Web Audio API metrics sent every 15s ──
    // FIX: localStream.current is a ref so we retry inside effect until stream is ready
    useEffect(() => {
        if (admissionStatus !== 'admitted') return;
        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
        let voiceInterval = null;
        let retryTimeout = null;

        const extractMetrics = () => {
            if (!analyserRef.current) return null;
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);
            const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
            const max = Math.max(...dataArray);
            const variance = dataArray.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / dataArray.length;
            // Also measure silence ratio (values below threshold 10)
            const silentBins = dataArray.filter(v => v < 10).length;
            return {
                average_energy: Math.round(avg),
                peak_energy: max,
                energy_variance: Math.round(variance),
                silence_ratio: Math.round((silentBins / dataArray.length) * 100),
                frequency_bins: dataArray.length,
                timestamp: new Date().toISOString()
            };
        };

        const startPolling = () => {
            voiceInterval = setInterval(async () => {
                const mId = interviewMongoId;
                if (!mId) {
                    console.log('[VOICE] No interview ID, skipping voice tone analysis');
                    return;
                }
                const metrics = extractMetrics();
                if (!metrics || metrics.average_energy < 1) {
                    console.log('[VOICE] No audio signal detected, skipping analysis');
                    return;
                }
                
                console.log('[VOICE] Sending audio metrics:', metrics);
                try {
                    const res = await fetch(`${apiUrl}/interviews/${mId}/voice-tone/`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ audio_metrics: metrics })
                    });
                    if (res.ok) {
                        const data = await res.json();
                        console.log('[VOICE] Received voice analysis:', data.voice_analysis);
                        setVoiceToneData(data.voice_analysis);
                    } else {
                        console.error('[VOICE] API error:', res.status, await res.text());
                    }
                } catch (err) {
                    console.error('[VOICE] Fetch error:', err);
                }
            }, 15000);
        };

        // Retry until localStream is ready (it's a ref, not state)
        const setupAnalyzer = () => {
            if (!localStream.current) {
                retryTimeout = setTimeout(setupAnalyzer, 1000);
                return;
            }
            try {
                if (!audioContextRef.current) {
                    const ctx = new (window.AudioContext || window.webkitAudioContext)();
                    const analyser = ctx.createAnalyser();
                    analyser.fftSize = 256;
                    const source = ctx.createMediaStreamSource(localStream.current);
                    source.connect(analyser);
                    audioContextRef.current = ctx;
                    analyserRef.current = analyser;
                }
                startPolling();
            } catch (e) {
                console.warn('[VOICE] AudioContext setup failed:', e);
            }
        };

        retryTimeout = setTimeout(setupAnalyzer, 2000); // initial delay

        return () => {
            clearInterval(voiceInterval);
            clearTimeout(retryTimeout);
            audioContextRef.current?.close();
            audioContextRef.current = null;
            analyserRef.current = null;
        };
    }, [admissionStatus, interviewMongoId, token]);

    // ── Feature 2: Live Quality Meter — sent every 10s (recruiter view) ──
    // Keep refs in sync with state (declared above, near top of component)
    useEffect(() => { liveTranscriptRef.current = liveTranscript; }, [liveTranscript]);
    useEffect(() => { currentQuestionIndexRef.current = currentQuestionIndex; }, [currentQuestionIndex]);

    useEffect(() => {
        if (admissionStatus !== 'admitted') return;
        if (user?.role !== 'recruiter' && user?.role !== 'admin') return;
        if (!interviewMongoId) return;
        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

        qualityPollRef.current = setInterval(async () => {
            const transcript = liveTranscriptRef.current;
            if (!transcript || transcript.trim().length < 15) return;
            try {
                const res = await fetch(`${apiUrl}/interviews/${interviewMongoId}/live-quality/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({
                        transcript: transcript.slice(-800),
                        question_index: currentQuestionIndexRef.current,
                        elapsed_seconds: 10
                    })
                });
                if (res.ok) {
                    const data = await res.json();
                    setLiveQuality(data.quality);
                }
            } catch (_) {}
        }, 10000);

        return () => clearInterval(qualityPollRef.current);
    }, [admissionStatus, user, interviewMongoId, token]); // NO liveTranscript here — uses ref

    // ── Feature 5: Recruiter Coach — called on demand via button ──
    const fetchRecruiterCoach = async () => {
        const transcript = liveTranscriptRef.current;
        if (!interviewMongoId || !transcript || user?.role === 'candidate') return;
        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
        try {
            const res = await fetch(`${apiUrl}/interviews/${interviewMongoId}/recruiter-coach/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    transcript: transcript.slice(-1500),
                    current_question: interviewQuestions[currentQuestionIndexRef.current]?.text || '',
                    candidate_performance: {
                        quality_score: liveQuality.quality_score,
                        on_track: liveQuality.on_track
                    }
                })
            });
            if (res.ok) {
                const data = await res.json();
                setRecruiterCoach(data.coaching);
                setShowCoachPanel(true);
                toast.success('AI Coach advice ready!');
            }
        } catch (_) {
            toast.error('Coaching unavailable. Try again.');
        }
    };

    // ── Feature 4: Inconsistency Check — called on demand ──
    const fetchInconsistencyCheck = async () => {
        if (!interviewMongoId || user?.role === 'candidate') return;
        const transcript = liveTranscriptRef.current;
        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
        try {
            const res = await fetch(`${apiUrl}/interviews/${interviewMongoId}/inconsistency-check/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    live_responses: transcript ? [{
                        question: interviewQuestions[currentQuestionIndexRef.current]?.text || 'General',
                        response: transcript.slice(-3000)
                    }] : []
                })
            });
            if (res.ok) {
                const data = await res.json();
                setInconsistencyReport(data.inconsistency_report);
                setShowInconsistency(true);
                const count = data.inconsistency_report?.inconsistencies?.length || 0;
                if (count > 0) {
                    toast.warning(`⚠️ ${count} inconsistency(ies) detected!`);
                } else {
                    toast.success('✓ No inconsistencies found.');
                }
            }
        } catch (_) {
            toast.error('Inconsistency check failed. Try again.');
        }
    };

    // ICE Configuration (Public Google STUN servers)
    const iceConfig = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' }
        ]
    };

    // Initialize Peer Connection
    const createPeerConnection = () => {
        if (pc.current) return pc.current;

        // Reset ICE buffering state for fresh connection
        pendingIceCandidates.current = [];
        isRemoteDescSet.current = false;

        const connection = new RTCPeerConnection(iceConfig);

        // Handle ICE Candidates
        connection.onicecandidate = (event) => {
            if (event.candidate) {
                send({ type: 'ice-candidate', candidate: event.candidate });
            }
        };

        // Handle Remote Tracks
        connection.ontrack = (event) => {
            console.log('[WEBRTC] Receiving remote track:', event.track.kind, 'from stream:', event.streams[0]?.id);
            console.log('[WEBRTC] Track state:', event.track.readyState, 'enabled:', event.track.enabled);
            
            if (remoteVideo.current && event.streams[0]) {
                console.log('[WEBRTC] Attaching remote stream to video element');
                remoteVideo.current.srcObject = event.streams[0];
                
                // Force play after a short delay
                setTimeout(() => {
                    if (remoteVideo.current) {
                        remoteVideo.current.play()
                            .then(() => console.log('[WEBRTC] Remote video playing'))
                            .catch(e => console.error('[WEBRTC] Remote video play failed:', e));
                    }
                }, 500);
                
                updateLogs({ type: 'NET', text: 'Remote video stream received', color: 'text-emerald-500' });
                toast.success('Connected to peer video!');
            } else {
                console.error('[WEBRTC] Remote video element not available or no stream');
            }
        };

        // Connection testing/logging
        connection.onconnectionstatechange = () => {
            console.log('[WEBRTC] PC Connection State:', connection.connectionState);
            if (connection.connectionState === 'connected') {
                updateLogs({ type: 'NET', text: 'Secure Peer-to-Peer link established.', color: 'text-emerald-500' });
                toast.success('Video connection established!');
            } else if (connection.connectionState === 'disconnected') {
                console.warn('[WEBRTC] Connection disconnected');
                updateLogs({ type: 'WARN', text: 'Connection interrupted', color: 'text-yellow-500' });
            } else if (connection.connectionState === 'failed') {
                console.error('[WEBRTC] Connection failed');
                updateLogs({ type: 'CRIT', text: 'Connection failed - check network', color: 'text-red-600' });
                toast.error('Video connection failed. Please refresh.');
            }
        };

        connection.oniceconnectionstatechange = () => {
            console.log('[WEBRTC] ICE Connection State:', connection.iceConnectionState);
            if (connection.iceConnectionState === 'failed') {
                console.error('[WEBRTC] ICE connection failed');
                toast.error('Network connection failed. Check firewall settings.');
            }
        };

        connection.onicegatheringstatechange = () => {
            console.log('[WEBRTC] ICE Gathering State:', connection.iceGatheringState);
        };

        pc.current = connection;
        return connection;
    };

    // ✅ Helper to update cross-tab Event Log
    const updateLogs = (eventObj) => {
        setEventLog(prev => {
            const updated = [...prev, eventObj];
            localStorage.setItem(`room_${id}_events`, JSON.stringify(updated));
            return updated;
        });
    };

    // ✅ Integrity / Tab Switch Detection
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && user?.role === 'candidate' && admissionStatus === 'admitted') {
                setTabSwitchCount(v => {
                    const newVio = v + 1;
                    
                    // Add manual violation
                    addManualViolation('TAB_SWITCH', `Candidate switched to another tab/window (#${newVio})`);
                    
                    // Cross tab inject log for HR to see immediately
                    const storedLogs = JSON.parse(localStorage.getItem(`room_${id}_events`) || '[]');
                    const newLog = { type: 'WARN', text: `Integrity Anomaly: Tab Switch Detected (#${newVio})`, color: 'text-red-600 font-bold animate-pulse font-black' };
                    const updatedLogs = [...storedLogs, newLog];
                    localStorage.setItem(`room_${id}_events`, JSON.stringify(updatedLogs));
                    setEventLog(updatedLogs);
                    
                    // Send WebSocket notification to recruiter
                    send({
                        type: 'violation_alert',
                        violation: {
                            type: 'TAB_SWITCH',
                            description: `Candidate switched to another tab/window (#${newVio})`,
                            timestamp: new Date().toISOString(),
                            severity: 'MEDIUM'
                        }
                    });

                    // Persist violation to backend DB (candidate side — correct auth)
                    const mId = interviewMongoId;
                    if (mId) {
                        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
                        fetch(`${apiUrl}/interviews/${mId}/violation/`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                            body: JSON.stringify({ type: 'tab_switch' })
                        }).catch(() => {});
                    }

                    return newVio;
                });
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [admissionStatus, user, id, addManualViolation, send]);

    // ✅ Start Camera - Start immediately for preview, not just after admission
    useEffect(() => {
        const startCamera = async () => {
            console.log('[CAMERA] Starting camera initialization...');
            console.log('[CAMERA] localVideo.current:', localVideo.current);
            
            try {
                let stream;
                try {
                    console.log('[CAMERA] Requesting camera and microphone access...');
                    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    console.log('[CAMERA] Camera access granted, stream:', stream);
                } catch (e) {
                    console.warn("[CAMERA] Camera failed, trying mic only:", e);
                    stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
                    setHasVideoFeed(false);
                    if (user?.role === 'candidate') {
                        updateLogs({ type: 'CRIT', text: 'Candidate camera hardware unavailable or blocked.', color: 'text-red-700 font-black animate-pulse' });
                        setTabSwitchCount(v => v + 4); // Automatic penalty: camera blocked = 4 tab-switch-equivalent violations
                    }
                }
                
                localStream.current = stream;
                console.log('[CAMERA] Stream saved to localStream.current');
                
                // CRITICAL FIX: Wait for video element to be available
                const attachStreams = () => {
                    if (localVideo.current) {
                        console.log('[CAMERA] Attaching stream to video element');
                        localVideo.current.srcObject = stream;
                        localVideo.current.play().catch(e => console.error("[CAMERA] Local play blocked:", e));
                    } else {
                        console.warn('[CAMERA] localVideo.current is null, retrying in 500ms...');
                        setTimeout(attachStreams, 500);
                    }
                };
                
                attachStreams();
                
                // If connection already exists (e.g. joined late), add tracks
                if (pc.current && admissionStatus === 'admitted') {
                    stream.getTracks().forEach(track => {
                        if (!pc.current.getSenders().find(s => s.track === track)) {
                            pc.current.addTrack(track, stream);
                        }
                    });
                }
            } catch (err) {
                console.error('[CAMERA] Camera/Mic error:', err);
            }
        };
        
        // CRITICAL FIX: Delay camera start to ensure DOM is ready
        const timer = setTimeout(() => {
            startCamera();
        }, 1000);
        
        // Mock Heatmap generation (only when admitted)
        let interval;
        if (admissionStatus === 'admitted') {
            interval = setInterval(() => {
                setFaceSnapshots(prev => [...prev, {
                    x: Math.random() * 80 + 10,
                    y: Math.random() * 60 + 20,
                    eye_contact: Math.random() > 0.3
                }].slice(-15));
                
                // Fluctuate emotion slightly
                setLocalEmotion(prev => {
                    const newScore = Math.min(100, Math.max(0, prev.score + (Math.random() * 10 - 5)));
                    
                    // Trigger AI Coaching tips based on dynamic emotion state
                    if (newScore < 60) {
                        setAiCoachingTip("Candidate confidence dropping. Suggest shifting to a simpler behavioral question to re-establish baseline.");
                    } else if (newScore > 85) {
                        setAiCoachingTip("Candidate is highly confident. Push cognitive complexity and probe advanced architecture.");
                    } else {
                        setAiCoachingTip("Baseline steady. Monitoring physiological parameters and speech cadence.");
                    }

                    return { ...prev, score: newScore, emotion: newScore > 75 ? 'CONFIDENT' : newScore > 50 ? 'NEUTRAL' : 'ANXIOUS' };
                });
            }, 2000);
        }
        
        return () => {
            clearTimeout(timer);
            if (interval) clearInterval(interval);
        };
    }, [admissionStatus]);

    // ✅ Controls Logic
    const toggleAudio = () => {
        const track = localStream.current?.getAudioTracks()[0];
        if (track) {
            track.enabled = !track.enabled;
            setAudioMuted(!track.enabled);
            console.log('[AUDIO] Audio', track.enabled ? 'unmuted' : 'muted');
            toast.info(track.enabled ? 'Microphone on' : 'Microphone off');
            
            // Notify peer about media status change
            send({ type: 'media-status-update', audio: track.enabled, video: !videoOff });
        } else {
            console.warn('[AUDIO] No audio track available');
            toast.error('No microphone available');
        }
    };

    const toggleVideo = () => {
        const track = localStream.current?.getVideoTracks()[0];
        if (track) {
            track.enabled = !track.enabled;
            setVideoOff(!track.enabled);
            console.log('[VIDEO] Video', track.enabled ? 'on' : 'off');
            toast.info(track.enabled ? 'Camera on' : 'Camera off');
            
            // Notify peer about media status change
            send({ type: 'media-status-update', audio: !audioMuted, video: track.enabled });
        } else {
            console.warn('[VIDEO] No video track available');
            toast.error('No camera available');
        }
    };

    const handleScreenShare = async () => {
        try {
            if (!screenSharing) {
                console.log('[SCREEN] Requesting screen share permission...');
                const stream = await navigator.mediaDevices.getDisplayMedia({ 
                    video: {
                        cursor: "always"
                    },
                    audio: false
                });
                
                console.log('[SCREEN] Screen share granted, stream:', stream);
                screenStream.current = stream;
                setScreenSharing(true);
                
                // Replace video track in PeerConnection
                if (pc.current) {
                    const videoTrack = stream.getVideoTracks()[0];
                    const sender = pc.current.getSenders().find(s => s.track?.kind === 'video');
                    if (sender) {
                        console.log('[SCREEN] Replacing video track with screen share');
                        await sender.replaceTrack(videoTrack);
                        updateLogs({ type: 'NET', text: 'Screen sharing started', color: 'text-blue-500' });
                        toast.success('Screen sharing started');
                    } else {
                        console.error('[SCREEN] No video sender found in peer connection');
                        toast.error('Failed to share screen - no video connection');
                    }
                } else {
                    console.warn('[SCREEN] No peer connection available');
                    toast.warning('Screen sharing will start when connected');
                }

                // Handle user stopping screen share from browser
                stream.getTracks()[0].onended = () => {
                    console.log('[SCREEN] Screen share ended by user');
                    stopScreenSharing();
                };
            } else {
                console.log('[SCREEN] Stopping screen share');
                stopScreenSharing();
            }
        } catch (err) {
            console.error('[SCREEN] Screen share error:', err);
            if (err.name === 'NotAllowedError') {
                toast.error('Screen sharing permission denied');
            } else if (err.name === 'NotFoundError') {
                toast.error('No screen available to share');
            } else {
                toast.error('Failed to start screen sharing');
            }
        }
    };

    const stopScreenSharing = () => {
        console.log('[SCREEN] Stopping screen share');
        if (screenStream.current) {
            screenStream.current.getTracks().forEach(track => {
                console.log('[SCREEN] Stopping track:', track.kind);
                track.stop();
            });
            screenStream.current = null;
        }
        setScreenSharing(false);
        
        // Revert to camera track
        if (pc.current && localStream.current) {
            const videoTrack = localStream.current.getVideoTracks()[0];
            const sender = pc.current.getSenders().find(s => s.track?.kind === 'video');
            if (sender && videoTrack) {
                console.log('[SCREEN] Reverting to camera track');
                sender.replaceTrack(videoTrack);
                updateLogs({ type: 'NET', text: 'Switched back to camera', color: 'text-blue-500' });
                toast.info('Stopped screen sharing');
            } else {
                console.warn('[SCREEN] Could not revert to camera - track or sender not found');
            }
        }
    };

    const generateNewQuestions = () => {
        setGeneratingQuestions(true);
        setTimeout(() => {
            const pools = [
                ["Explain the role of container orchestration in modern deployments.", "How do you handle breaking changes in production environments?", "Can you explain your approach to scaling highly concurrent systems?"],
                ["Describe the difference between stateful and stateless architectures.", "How would you design a rate limiter for a public API?", "What are the trade-offs of microservices vs monolith?"],
                ["Tell me about a time you had to optimize a slow database query.", "How do you manage eventual consistency?", "Explain CAP theorem using a real-world project you built."]
            ];
            setSuggestedQuestions(pools[Math.floor(Math.random() * pools.length)]);
            
            updateLogs({ type: 'AI', text: 'Generated new dynamic behavioral prompts.', color: 'text-emerald-500' });
            setGeneratingQuestions(false);
        }, 1500);
    };

    const handleEndMeeting = () => {
        if (!confirmEnd) {
            setConfirmEnd(true);
            setTimeout(() => setConfirmEnd(false), 3000);
        } else {
            // Signal backend to end session for all clients
            send({ type: 'end_meeting', room: id });
            wsClose(); // Stop auto-reconnect immediately after ending the meeting
            if (localStream.current) localStream.current.getTracks().forEach(t => t.stop());
            if (pc.current) pc.current.close();
            try { recognitionRef.current?.stop(); } catch (_) {}
            setInterviewComplete(true);

            // Generate AI evaluation for recruiter
            if (user?.role === 'recruiter' || user?.role === 'admin') {
                generateAIEvaluation();
            } else {
                setTimeout(() => navigate('/candidate/dashboard'), 3000);
            }
        }
    };

    // Generate AI Evaluation — calls real backend XAI engine
    const generateAIEvaluation = async () => {
        console.log('[EVALUATION] Starting AI evaluation generation...');
        setIsGeneratingEvaluation(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
        const authHeaders = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        };

        try {
            // Use MongoDB interview ID loaded on mount; fall back to room_id lookup
            let mongoId = interviewMongoId;
            console.log('[EVALUATION] Interview MongoDB ID:', mongoId);
            
            if (!mongoId) {
                console.log('[EVALUATION] No MongoDB ID, fetching from room:', id);
                const roomRes = await fetch(`${apiUrl}/interviews/room/${id}/`, { headers: authHeaders });
                if (roomRes.ok) {
                    const roomData = await roomRes.json();
                    mongoId = roomData.id;
                    setInterviewMongoId(mongoId);
                    console.log('[EVALUATION] Fetched MongoDB ID:', mongoId);
                } else {
                    console.error('[EVALUATION] Failed to fetch room data:', roomRes.status);
                }
            }

            if (!mongoId) {
                throw new Error('Could not resolve interview ID for evaluation.');
            }

            // Get latest transcript from ref
            const transcript = liveTranscriptRef.current || liveTranscript;
            console.log('[EVALUATION] Transcript length:', transcript.length, 'chars');
            console.log('[EVALUATION] Transcript preview:', transcript.substring(0, 200));

            // Submit full transcript as candidate response (index 0) before triggering eval
            if (transcript.trim().length > 10) {
                try {
                    console.log('[EVALUATION] Submitting transcript to backend...');
                    const respondRes = await fetch(`${apiUrl}/interviews/${mongoId}/respond/`, {
                        method: 'POST',
                        headers: authHeaders,
                        body: JSON.stringify({
                            question_index: 0,
                            response: transcript.trim().slice(0, 4000),
                            full_transcript: transcript.trim()
                        })
                    });
                    
                    if (respondRes.ok) {
                        console.log('[EVALUATION] Transcript submitted successfully');
                    } else {
                        console.error('[EVALUATION] Transcript submission failed:', respondRes.status, await respondRes.text());
                    }
                } catch (err) {
                    console.error('[EVALUATION] Transcript submission error:', err);
                }
            } else {
                console.warn('[EVALUATION] Transcript too short, skipping submission');
            }

            // Trigger the XAI evaluation engine on the backend (ASYNC)
            console.log('[EVALUATION] Triggering async XAI evaluation engine...');
            const evalRes = await fetch(`${apiUrl}/evaluations/trigger/`, {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify({ interview_id: mongoId })
            });

            console.log('[EVALUATION] Evaluation API response status:', evalRes.status);

            // Check if it's async (202) or sync (200)
            if (evalRes.status === 202) {
                // Async processing - show immediate feedback and poll
                const asyncData = await evalRes.json();
                console.log('[EVALUATION] Async evaluation started:', asyncData);
                
                toast.info('Generating evaluation... This will take a moment.', { duration: 3000 });
                
                // Show loading state with progress
                setEvaluationData({
                    status: 'processing',
                    message: 'AI is analyzing the interview...',
                    overall_score: 0
                });
                setShowEvaluation(true);
                setIsGeneratingEvaluation(false); // Stop spinner, show progress screen
                
                // Poll for completion every 3 seconds
                const pollInterval = setInterval(async () => {
                    try {
                        console.log('[EVALUATION] Polling for evaluation completion...');
                        const checkRes = await fetch(`${apiUrl}/evaluations/?interview_id=${mongoId}`, { 
                            headers: authHeaders 
                        });
                        
                        if (checkRes.ok) {
                            const checkData = await checkRes.json();
                            const evaluation = checkData.results?.[0] || checkData;
                            
                            // Check if evaluation is complete
                            if (evaluation && evaluation.status === 'complete' && evaluation.overall_score !== undefined) {
                                clearInterval(pollInterval);
                                console.log('[EVALUATION] Evaluation complete! Loading full data...');
                                
                                // Process the completed evaluation
                                const evalData = evaluation;
                                const criteria = evalData.criterion_results || [];
                                const getCriterionScore = (name) => {
                                    const cr = criteria.find(c => c.criterion === name);
                                    return cr ? Math.round((cr.score / 10) * 100) : null;
                                };

                                const semanticScore = getCriterionScore('semantic_accuracy');
                                const keywordScore = getCriterionScore('keyword_alignment');
                                const depthScore = getCriterionScore('response_depth');
                                const resumeConsistency = getCriterionScore('resume_consistency');
                                const technicalRaw = [semanticScore, keywordScore, depthScore, resumeConsistency].filter(s => s !== null);
                                const technicalScore = technicalRaw.length
                                    ? Math.round(technicalRaw.reduce((a, b) => a + b, 0) / technicalRaw.length)
                                    : (evalData.resume_alignment_score ?? evalData.overall_score ?? 50);

                                const clarityScore = getCriterionScore('communication_clarity');
                                const completenessScore = getCriterionScore('response_completeness');
                                const aiFluentScore = evalData.fluency_score || null;
                                const commRaw = [clarityScore, completenessScore, aiFluentScore].filter(s => s !== null);
                                const communicationScore = commRaw.length
                                    ? Math.round(commRaw.reduce((a, b) => a + b, 0) / commRaw.length)
                                    : (evalData.fluency_score ?? evalData.overall_score ?? 50);

                                const confidenceIndicator = getCriterionScore('confidence_indicators');
                                const aiConfScore = evalData.confidence_score || null;
                                const behavRaw = [confidenceIndicator, aiConfScore].filter(s => s !== null);
                                const behavioralScore = behavRaw.length
                                    ? Math.round(behavRaw.reduce((a, b) => a + b, 0) / behavRaw.length)
                                    : (evalData.confidence_score ?? evalData.overall_score ?? 50);

                                const totalViolations = (evalData.tab_switch_count || 0) + detectedViolations.length;
                                const integrityScore = evalData.proctoring_score ?? Math.max(0, 100 - totalViolations * 10);
                                const overallScore = evalData.overall_score ?? Math.round(technicalScore * 0.4 + communicationScore * 0.2 + behavioralScore * 0.2 + integrityScore * 0.2);

                                const recMap = { strong_yes: 'HIRE', yes: 'HIRE', maybe: 'MAYBE', no: 'REJECT', strong_no: 'REJECT' };
                                const recommendation = recMap[evalData.recommendation] || 'MAYBE';
                                const confidence = evalData.recommendation?.startsWith('strong') ? 'HIGH' : evalData.recommendation === 'maybe' ? 'MEDIUM' : 'HIGH';

                                const finalEvaluation = {
                                    eval_id: evalData.id || evalData._id || mongoId,
                                    interview_id: mongoId,
                                    overall_score: overallScore,
                                    technical_score: technicalScore,
                                    communication_score: communicationScore,
                                    behavioral_score: behavioralScore,
                                    integrity_score: integrityScore,
                                    recommendation,
                                    confidence,
                                    violations_count: totalViolations,
                                    violations: [
                                        ...detectedViolations,
                                        ...Array.from({ length: tabSwitchCount }, (_, i) => ({
                                            type: 'TAB_SWITCH',
                                            description: `Tab switch detected (#${i + 1})`,
                                            timestamp: new Date().toISOString(),
                                            severity: 'MEDIUM'
                                        }))
                                    ],
                                    strengths: evalData.strengths?.length ? evalData.strengths : ['Participated in interview'],
                                    weaknesses: evalData.weaknesses?.length ? evalData.weaknesses : ['Further analysis needed'],
                                    summary: evalData.summary || `Candidate scored ${overallScore}/100.`,
                                    behavioral_summary: evalData.behavioral_summary || '',
                                    integrity_notes: evalData.integrity_notes || '',
                                    culture_fit_score: evalData.culture_fit_score || 0,
                                    ai_summary_used: evalData.ai_summary_used || false,
                                    criterion_results: criteria,
                                    resume_alignment_score: evalData.resume_alignment_score || 0
                                };

                                setEvaluationData(finalEvaluation);
                                toast.success('✅ Evaluation complete!', { duration: 3000 });
                            }
                        }
                    } catch (pollError) {
                        console.error('[EVALUATION] Polling error:', pollError);
                    }
                }, 3000); // Poll every 3 seconds
                
                // Timeout after 2 minutes
                setTimeout(() => {
                    clearInterval(pollInterval);
                    if (!evaluationData || evaluationData.status === 'processing') {
                        toast.error('Evaluation is taking longer than expected. Please refresh.');
                    }
                }, 120000);
                
                return; // Exit early for async processing
            }
            
            // Sync processing (200) - original code
            if (evalRes.ok) {
                const evalData = await evalRes.json();
                console.log('[EVALUATION] Backend XAI evaluation complete:', evalData);

                // ── Extract scores from XAI criterion_results (0-10 scale → 0-100) ──
                const criteria = evalData.criterion_results || [];
                const getCriterionScore = (name) => {
                    const cr = criteria.find(c => c.criterion === name);
                    return cr ? Math.round((cr.score / 10) * 100) : null;
                };

                // Technical: semantic accuracy + keyword alignment + response depth
                const semanticScore = getCriterionScore('semantic_accuracy');
                const keywordScore = getCriterionScore('keyword_alignment');
                const depthScore = getCriterionScore('response_depth');
                const resumeConsistency = getCriterionScore('resume_consistency');
                const technicalRaw = [semanticScore, keywordScore, depthScore, resumeConsistency]
                    .filter(s => s !== null);
                const technicalScore = technicalRaw.length
                    ? Math.round(technicalRaw.reduce((a, b) => a + b, 0) / technicalRaw.length)
                    : (evalData.resume_alignment_score ?? evalData.overall_score ?? 50);

                // Communication: fluency (AI) + clarity + completeness criteria
                const clarityScore = getCriterionScore('communication_clarity');
                const completenessScore = getCriterionScore('response_completeness');
                const aiFluentScore = evalData.fluency_score || null;
                const commRaw = [clarityScore, completenessScore, aiFluentScore].filter(s => s !== null);
                const communicationScore = commRaw.length
                    ? Math.round(commRaw.reduce((a, b) => a + b, 0) / commRaw.length)
                    : (evalData.fluency_score ?? evalData.overall_score ?? 50);

                // Behavioral: confidence from AI + confidence_indicators criterion
                const confidenceIndicator = getCriterionScore('confidence_indicators');
                const aiConfScore = evalData.confidence_score || null;
                const behavRaw = [confidenceIndicator, aiConfScore].filter(s => s !== null);
                const behavioralScore = behavRaw.length
                    ? Math.round(behavRaw.reduce((a, b) => a + b, 0) / behavRaw.length)
                    : (evalData.confidence_score ?? evalData.overall_score ?? 50);

                // Integrity: proctoring score from backend (deducts per violation)
                const totalViolations = (evalData.tab_switch_count || 0) + detectedViolations.length;
                const integrityScore = evalData.proctoring_score ?? Math.max(0, 100 - totalViolations * 10);

                // Overall: weighted average (Technical 40%, Comm 20%, Behavioral 20%, Integrity 20%)
                // If backend already computed it (via XAI engine), use that; else compute locally
                const overallScore = evalData.overall_score ??
                    Math.round(technicalScore * 0.4 + communicationScore * 0.2 + behavioralScore * 0.2 + integrityScore * 0.2);

                const recMap = { strong_yes: 'HIRE', yes: 'HIRE', maybe: 'MAYBE', no: 'REJECT', strong_no: 'REJECT' };
                const recommendation = recMap[evalData.recommendation] || 'MAYBE';
                const confidence = evalData.recommendation?.startsWith('strong') ? 'HIGH'
                    : evalData.recommendation === 'maybe' ? 'MEDIUM' : 'HIGH';

                const evaluation = {
                    eval_id: evalData.id || evalData._id || mongoId,
                    interview_id: mongoId,
                    overall_score: overallScore,
                    technical_score: technicalScore,
                    communication_score: communicationScore,
                    behavioral_score: behavioralScore,
                    integrity_score: integrityScore,
                    recommendation,
                    confidence,
                    violations_count: totalViolations,
                    violations: [
                        ...detectedViolations,
                        ...Array.from({ length: tabSwitchCount }, (_, i) => ({
                            type: 'TAB_SWITCH',
                            description: `Tab switch detected (#${i + 1})`,
                            timestamp: new Date().toISOString(),
                            severity: 'MEDIUM'
                        }))
                    ],
                    strengths: evalData.strengths?.length ? evalData.strengths : ['Participated in interview'],
                    weaknesses: evalData.weaknesses?.length ? evalData.weaknesses : ['Further analysis needed'],
                    summary: evalData.summary || `Candidate scored ${overallScore}/100.`,
                    behavioral_summary: evalData.behavioral_summary || '',
                    integrity_notes: evalData.integrity_notes || '',
                    culture_fit_score: evalData.culture_fit_score || 0,
                    ai_summary_used: evalData.ai_summary_used || false,
                    criterion_results: criteria,
                    resume_alignment_score: evalData.resume_alignment_score || 0
                };

                setEvaluationData(evaluation);
                toast.success('AI Evaluation generated successfully!');
            } else {
                // Backend evaluation failed — show error with whatever data we have
                const errText = await evalRes.text();
                console.error('[EVALUATION] Backend failed:', errText);

                // Check if evaluation already exists (409-style response)
                if (errText.includes('already exists')) {
                    toast.info('Evaluation already exists. Loading from server...');
                    // Fetch existing evaluation
                    const existingRes = await fetch(`${apiUrl}/evaluations/?interview_id=${mongoId}`, { headers: authHeaders });
                    if (existingRes.ok) {
                        const existing = await existingRes.json();
                        const ev = existing.results?.[0] || existing;
                        if (ev?.overall_score !== undefined) {
                            setEvaluationData({
                                interview_id: mongoId,
                                overall_score: ev.overall_score,
                                technical_score: ev.resume_alignment_score ?? ev.overall_score,
                                communication_score: ev.fluency_score ?? ev.overall_score,
                                behavioral_score: ev.confidence_score ?? ev.overall_score,
                                integrity_score: ev.proctoring_score ?? 100,
                                recommendation: { strong_yes: 'HIRE', yes: 'HIRE', maybe: 'MAYBE', no: 'REJECT', strong_no: 'REJECT' }[ev.recommendation] || 'MAYBE',
                                confidence: 'HIGH',
                                violations_count: ev.tab_switch_count || 0,
                                violations: [],
                                strengths: ev.strengths || [],
                                weaknesses: ev.weaknesses || [],
                                summary: ev.summary || '',
                                criterion_results: ev.criterion_results || []
                            });
                        }
                    }
                } else {
                    console.error('[EVALUATION] Backend evaluation failed, showing local fallback');
                    toast.error('Backend evaluation failed. Showing local analysis.');
                    
                    // Local fallback - use transcript ref for latest data
                    const transcript = liveTranscriptRef.current || liveTranscript;
                    const totalViolations = detectedViolations.length + tabSwitchCount;
                    const integrityScore = Math.max(0, 100 - totalViolations * 10);
                    const transcriptWords = transcript.trim().split(/\s+/).length;
                    const fluencyScore = Math.min(100, 40 + transcriptWords * 0.3);
                    const overallScore = Math.round(fluencyScore * 0.4 + integrityScore * 0.3 + 65 * 0.3);
                    const recommendation = overallScore >= 75 && integrityScore >= 80 ? 'HIRE' : overallScore >= 55 ? 'MAYBE' : 'REJECT';

                    console.log('[EVALUATION] Local fallback scores:', { overallScore, fluencyScore, integrityScore, transcriptWords });

                    setEvaluationData({
                        interview_id: mongoId || id,
                        overall_score: overallScore,
                        technical_score: 65,
                        communication_score: Math.round(fluencyScore),
                        behavioral_score: 65,
                        integrity_score: integrityScore,
                        recommendation,
                        confidence: 'LOW',
                        violations_count: totalViolations,
                        violations: detectedViolations,
                        strengths: transcriptWords > 50 ? ['Participated actively in interview', 'Provided verbal responses'] : ['Participated in interview'],
                        weaknesses: totalViolations > 0 ? ['Integrity violations detected'] : transcriptWords < 50 ? ['Limited verbal responses'] : ['Further analysis needed'],
                        summary: `Local analysis only — backend evaluation unavailable. Transcript: ${transcriptWords} words. Overall: ${overallScore}/100.`,
                        criterion_results: []
                    });
                }
            }

            console.log('[EVALUATION] Setting evaluation complete, showing results...');
            setIsGeneratingEvaluation(false);
            setShowEvaluation(true);
        } catch (error) {
            console.error('[EVALUATION] Critical error:', error);
            toast.error('Evaluation error: ' + error.message);
            
            // Always set loading to false and show something
            setIsGeneratingEvaluation(false);
            
            // Show minimal fallback evaluation
            setEvaluationData({
                interview_id: interviewMongoId || id,
                overall_score: 50,
                technical_score: 50,
                communication_score: 50,
                behavioral_score: 50,
                integrity_score: Math.max(0, 100 - (detectedViolations.length + tabSwitchCount) * 10),
                recommendation: 'MAYBE',
                confidence: 'LOW',
                violations_count: detectedViolations.length + tabSwitchCount,
                violations: detectedViolations,
                strengths: ['Interview completed'],
                weaknesses: ['Evaluation system error - manual review required'],
                summary: `Error generating evaluation: ${error.message}. Manual review recommended.`,
                criterion_results: []
            });
            setShowEvaluation(true);
        }
    };

    const handleChatSubmit = (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        
        const newMsg = {
            sender: user?.name || 'User',
            sender_id: user?.id || '',
            text: chatInput,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSystem: false,
            from: user?.role || 'peer'
        };
        
        // Add to local state
        const updated = [...chatMessages, newMsg];
        setChatMessages(updated);
        localStorage.setItem(`room_${id}_chat`, JSON.stringify(updated));
        
        // CRITICAL FIX: Send via WebSocket to peer
        console.log('[CHAT] Sending message:', newMsg.text);
        send({ 
            type: 'chat', 
            sender_id: newMsg.sender_id,
            text: newMsg.text,
            from: newMsg.from,
            sender: newMsg.sender,
            time: newMsg.time
        });
        
        // Log event for HR
        if (user?.role === 'candidate') {
            updateLogs({ type: 'COMMS', text: `${newMsg.sender} transmitted text packet.`, color: 'text-gray-400' });
        }

        setChatInput('');
    };

    // Candidate Auto-Boot after Completion
    useEffect(() => {
        if (interviewComplete && user?.role === 'candidate') {
            const t = setTimeout(() => {
                navigate('/candidate/dashboard');
            }, 6000);
            return () => clearTimeout(t);
        }
    }, [interviewComplete, user, navigate]);

    // ── RENDER WAITING ROOM ──
    if (admissionStatus === 'waiting') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
                
                {/* Camera Preview in Waiting Room */}
                <div className="absolute top-8 right-8 z-20">
                    <div className="relative w-64 h-48 rounded-2xl overflow-hidden border-2 border-red-600/50 shadow-2xl">
                        <video
                            ref={localVideo}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover bg-gray-900"
                        />
                        <div className="absolute bottom-2 left-2 bg-black/70 px-3 py-1 rounded-lg text-xs font-bold">
                            Your Camera
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center z-10 p-12 bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
                    <div className="w-24 h-24 rounded-full bg-red-600/10 flex items-center justify-center mb-6">
                        <TfiShield className="text-5xl text-red-600 animate-pulse drop-shadow-[0_0_15px_#dc2626]" />
                    </div>
                    <h1 className="text-3xl font-black uppercase tracking-widest italic mb-4 text-center">Waiting Room</h1>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] max-w-sm text-center leading-relaxed">
                        The recruiter has been notified. Please hold until they grant you secure access to the main interview arena.
                    </p>
                    <div className="mt-8 flex gap-3">
                         <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_#dc2626]" />
                         <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse delay-75 shadow-[0_0_10px_#dc2626]" />
                         <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse delay-150 shadow-[0_0_10px_#dc2626]" />
                    </div>
                </div>
            </div>
        );
    }

    // ── RENDER COMPLETED STATE ──
    if (interviewComplete) {
        // Show evaluation screen for recruiter
        if (showEvaluation && evaluationData && (user?.role === 'recruiter' || user?.role === 'admin')) {
            return <AIEvaluationScreen evaluation={evaluationData} onClose={() => navigate('/recruiter/dashboard')} />;
        }
        
        // Show loading/generating state for recruiter
        if (isGeneratingEvaluation && (user?.role === 'recruiter' || user?.role === 'admin')) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white p-6 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                        <div className="w-[1000px] h-[1000px] rounded-full bg-red-600 blur-[150px] animate-pulse" />
                    </div>
                    <div className="z-10 flex flex-col items-center p-12 bg-black/60 backdrop-blur-xl border border-white/10 rounded-[3rem] shadow-2xl text-center">
                        <TfiShield className="text-6xl text-red-500 mb-6 drop-shadow-[0_0_15px_#dc2626] animate-pulse" />
                        <h1 className="text-4xl font-black uppercase tracking-widest italic mb-4">Generating AI Evaluation</h1>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] max-w-sm leading-relaxed mb-4">
                            Analyzing interview performance, detecting violations, and calculating comprehensive scores...
                        </p>
                        <div className="flex gap-3 mb-8">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse delay-75" />
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse delay-150" />
                        </div>
                    </div>
                </div>
            );
        }
        
        // Show completion message for candidate
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white p-6 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <div className="w-[1000px] h-[1000px] rounded-full bg-emerald-600 blur-[150px] animate-pulse" />
                </div>
                <div className="z-10 flex flex-col items-center p-12 bg-black/60 backdrop-blur-xl border border-white/10 rounded-[3rem] shadow-2xl text-center">
                    <TfiCheck className="text-6xl text-emerald-500 mb-6 drop-shadow-[0_0_15px_#10b981]" />
                    <h1 className="text-4xl font-black uppercase tracking-widest italic mb-4">Interview Complete</h1>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] max-w-sm leading-relaxed mb-4">
                        {user?.role === 'candidate'
                            ? 'Your responses have been submitted. AI evaluation is processing — check your dashboard for results.'
                            : 'Interview ended. AI evaluation is processing in the background. Results will appear on your dashboard shortly.'}
                    </p>
                    <div className="flex gap-3 mb-8">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse delay-75" />
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse delay-150" />
                    </div>
                    <button
                        onClick={() => navigate(user?.role === 'candidate' ? '/candidate/dashboard' : '/recruiter/dashboard')}
                        className="px-10 py-4 bg-emerald-600 text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] italic hover:bg-white transition-all shadow-[0_0_15px_#10b981]"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // ── RENDER MAIN ROOM ──
    return (
        <div className="flex flex-col h-screen bg-gray-100 text-gray-900 overflow-hidden font-sans">
            
            {/* ── INTERVIEW HEADER ── */}
            <header className="h-24 bg-white/95 backdrop-blur-3xl border-b border-gray-100 px-10 flex items-center justify-between z-50 shadow-sm relative">
                <div className="flex items-center gap-10">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm group hover:bg-red-600 transition-all duration-700">
                            <TfiShield className="text-red-600 group-hover:text-white animate-pulse text-2xl" />
                        </div>
                        <div>
                            <h2 className="text-[12px] font-black uppercase text-gray-900 tracking-[0.4em] leading-none mb-2 italic underline underline-offset-4 decoration-red-600/20">Title: {interview?.title || 'Analyzing...'}</h2>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-3">
                                Status: <span className={`flex items-center gap-2 ${status === 'active' ? 'text-emerald-600' : 'text-red-600'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full bg-current ${status !== 'active' && 'animate-pulse'}`} />
                                    {status.toUpperCase()}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* AI Connectivity & Confidence HUD */}
                <div className="hidden lg:flex gap-10 border-l border-gray-100 pl-10">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-gray-700 uppercase tracking-[0.4em] mb-2 italic">Integrity Checks</span>
                        <div className="flex gap-1.5 items-center">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className={`w-2 h-2 rounded-full transition-all duration-700 ${i <= Math.max(1, 5 - Math.floor((detectedViolations.length + tabSwitchCount) / 2)) ? 'bg-red-600 shadow-[0_0_10px_#dc2626]' : 'bg-white/5 shadow-inner'}`} />
                            ))}
                            <span className="ml-2 text-[8px] font-bold text-gray-400 uppercase">Violations: {detectedViolations.length + tabSwitchCount}</span>
                        </div>
                    </div>
                    
                    {/* Detection Stats for Recruiter */}
                    {user?.role !== 'candidate' && isModelLoaded && (
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-gray-700 uppercase tracking-[0.4em] mb-1.5 italic">AI Detection</span>
                            <div className="flex gap-2 text-[8px] font-bold uppercase">
                                {detectionStats.phoneDetected && <span className="text-red-600">📱 Phone</span>}
                                {detectionStats.bookDetected && <span className="text-red-600">📚 Book</span>}
                                {detectionStats.multiplePersons && <span className="text-red-600">👥 Multiple</span>}
                                {!detectionStats.phoneDetected && !detectionStats.bookDetected && !detectionStats.multiplePersons && (
                                    <span className="text-emerald-600">✓ Clean</span>
                                )}
                            </div>
                        </div>
                    )}
                    
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-gray-700 uppercase tracking-[0.4em] mb-1.5 italic">Behavioral Confidence</span>
                        <span className={`text-[11px] font-black italic tracking-widest uppercase transition-colors ${localEmotion?.score >= 70 ? 'text-emerald-500' : localEmotion?.score >= 45 ? 'text-amber-500' : 'text-red-600'}`}>
                            {Math.round(localEmotion?.score)}% MATCH · {localEmotion?.emotion}
                        </span>
                    </div>

                    {/* Feature 1: Voice Tone Indicator */}
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-gray-700 uppercase tracking-[0.4em] mb-1.5 italic">Voice Tone</span>
                        <span className={`text-[11px] font-black italic tracking-widest uppercase transition-colors ${
                            voiceToneData?.stress_level === 'low' ? 'text-emerald-500'
                            : voiceToneData?.stress_level === 'medium' ? 'text-amber-500'
                            : 'text-red-600'
                        }`}>
                            {voiceToneData?.tone_score || 65}% · {(voiceToneData?.stress_level || 'medium').toUpperCase()} STRESS
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Controls Toolbar */}
                    <div className="flex items-center bg-gray-50 p-1.5 rounded-2xl border border-gray-100 mr-4 shadow-inner">
                        <ControlToggle active={!audioMuted} icon={<TfiMicrophone />} label="Audio" onClick={toggleAudio} />
                        <ControlToggle active={!videoOff} icon={<TfiVideoCamera />} label="Video" onClick={toggleVideo} />
                        <ControlToggle active={screenSharing} icon={<TfiDesktop />} label="Screen Share" onClick={handleScreenShare} pulse={screenSharing} />
                        <ControlToggle active={transcriptActive} icon={<TfiWrite />} label="Live Transcript" onClick={() => setTranscriptActive(!transcriptActive)} pulse={transcriptActive} />
                    </div>

                    <div className="flex items-center gap-4 px-8 py-3 bg-gray-50 rounded-2xl border border-gray-200">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                         <span className="text-[11px] font-black text-gray-900 italic uppercase tracking-[0.2em]">{user?.name}</span>
                    </div>

                    <button onClick={() => navigate('/candidate/dashboard')} className="h-12 px-8 bg-gray-50 border border-gray-100 hover:border-red-600/40 text-[10px] font-black uppercase tracking-[0.5em] italic transition-all skew-x-[-15deg] group hover:bg-red-600 hover:text-white shadow-sm">
                        <span className="skew-x-[15deg] block">Exit</span>
                    </button>

                    {isCandidateWaiting && user?.role !== 'candidate' && (
                        <button onClick={() => {
                            send({ type: 'admit_candidate', room: id });
                            setIsCandidateWaiting(false);
                            toast.success('Candidate admitted!');
                        }} className="h-12 px-8 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-[0.5em] italic transition-all skew-x-[-15deg] shadow-[0_0_20px_#10b981] animate-pulse hover:bg-emerald-400 hover:scale-105">
                            <span className="skew-x-[15deg] block">⚡ ADMIT CANDIDATE</span>
                        </button>
                    )}

                    {(user?.role === 'recruiter' || user?.role === 'admin') && (
                        <button onClick={handleEndMeeting} className={`h-12 px-10 text-[11px] font-black uppercase tracking-[0.4em] italic transition-all skew-x-[-15deg] shadow-2xl ${confirmEnd ? 'bg-amber-500 text-black animate-pulse' : 'bg-red-600 text-white hover:bg-red-700 shadow-[0_0_15px_rgba(220,38,38,0.3)]'}`}>
                            <span className="skew-x-[15deg] block">{confirmEnd ? 'CONFIRM END' : 'END INTERVIEW'}</span>
                        </button>
                    )}
                    
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden relative">
                {/* ── VIDEO ARENA ── */}
                <div className="flex-1 flex flex-col relative bg-gray-900">
                     <div className="absolute top-8 left-8 z-20 flex flex-col gap-4">
                        <div className="flex items-center gap-3 bg-black/40 backdrop-blur-3xl px-6 py-3 rounded-2xl border border-white/5 shadow-2xl">
                            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_#dc2626]" />
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.4em] italic">Live Transmission Target</span>
                        </div>
                    </div>

                    <div className="flex-1 relative group overflow-hidden flex items-center justify-center p-8">
                        {/* Remote Output */}
                        <div className="relative w-full h-full max-w-5xl rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center bg-black/50">
                            <video 
                                ref={remoteVideo} 
                                autoPlay 
                                playsInline 
                                className="w-full h-full object-cover transition-opacity duration-1000"
                                onLoadedMetadata={(e) => {
                                    console.log('[VIDEO] Remote video metadata loaded');
                                    e.target.play().catch(err => console.error('[VIDEO] Remote play error:', err));
                                }}
                                onPlay={() => console.log('[VIDEO] Remote video started playing')}
                                onError={(e) => console.error('[VIDEO] Remote video error:', e)}
                            />
                            
                            {/* Candidate Waiting Banner — only shown to recruiter */}
                            {isCandidateWaiting && user?.role !== 'candidate' && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-30 backdrop-blur-sm">
                                    <div className="flex flex-col items-center gap-6 p-12 bg-emerald-500/10 border-2 border-emerald-500 rounded-[3rem] shadow-[0_0_60px_#10b981] animate-pulse">
                                        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                            <span className="text-5xl">🔔</span>
                                        </div>
                                        <h2 className="text-white text-3xl font-black uppercase tracking-widest italic">Candidate is Waiting</h2>
                                        <p className="text-emerald-400 text-[11px] font-black uppercase tracking-[0.4em]">Candidate has entered the lobby and is requesting access</p>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                console.log('[ADMIT] Button clicked, sending admit_candidate');
                                                try {
                                                    send({ type: 'admit_candidate', room: id });
                                                    setIsCandidateWaiting(false);
                                                    toast.success('Candidate admitted!');
                                                } catch (error) {
                                                    console.error('[ADMIT] Error admitting candidate:', error);
                                                    toast.error('Failed to admit candidate');
                                                }
                                            }}
                                            type="button"
                                            className="px-16 py-5 bg-emerald-500 text-black text-[13px] font-black uppercase tracking-[0.6em] rounded-2xl shadow-[0_0_30px_#10b981] hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95"
                                        >
                                            ⚡ Admit Now
                                        </button>
                                    </div>
                                </div>
                            )}

                            
                            {/* Sniper / Focus Overlays */}
                            <div className="absolute inset-0 border-[4px] border-black/40 pointer-events-none rounded-[3rem]" />
                            <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-red-600/30 pointer-events-none m-8 rounded-tl-3xl" />
                            <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-red-600/30 pointer-events-none m-8 rounded-br-3xl" />

                            {/* Gaze Heatmap Overlay Layer */}
                            {showHeatmap && (
                                <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 transition-opacity duration-500">
                                    {faceSnapshots.map((snap, i) => (
                                        <div key={i} style={{ 
                                            position: 'absolute', 
                                            left: `${snap.x}%`, 
                                            top: `${snap.y}%`, 
                                            width: 40, height: 40, 
                                            borderRadius: '50%', 
                                            background: snap.eye_contact ? 'rgba(220,38,38,0.5)' : 'rgba(251,191,36,0.3)', 
                                            filter: 'blur(15px)', 
                                            transform: 'translate(-50%,-50%)',
                                            transition: 'all 0.5s ease'
                                        }} />
                                    ))}
                                </div>
                            )}
                            
                            {/* Heatmap Toggle (For Recruiters/Testing) */}
                            <button onClick={(e) => { e.stopPropagation(); setShowHeatmap(!showHeatmap); }} className={`absolute top-6 right-6 px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all shadow-2xl z-20 ${showHeatmap ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-black/60 border border-white/10 text-gray-400 hover:text-white'}`}>
                                {showHeatmap ? 'HEATMAP ACTIVE' : 'ENABLE GAZE RADAR'}
                            </button>
                        </div>
                        
                        {/* Mini Self-View (PiP) - Moved to LEFT side */}
                        <div className="absolute bottom-12 left-12 w-48 h-36 rounded-2xl overflow-hidden border-2 border-red-600/20 shadow-2xl z-20 bg-black">
                            <video ref={localVideo} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                            <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-[8px] text-white font-bold tracking-widest uppercase">
                                You
                            </div>
                        </div>

                        {/* AI Features Panel for Candidates */}
                        {user?.role === 'candidate' && admissionStatus === 'admitted' && (
                            <div className="absolute top-24 right-8 z-20 flex flex-col gap-4 max-w-sm">
                                {/* Voice Tone Analyzer */}
                                <VoiceToneAnalyzer 
                                    interviewId={interviewMongoId} 
                                    isActive={admissionStatus === 'admitted'} 
                                />
                                
                                {/* Live Quality Meter */}
                                <LiveQualityMeter 
                                    interviewId={interviewMongoId}
                                    transcript={liveTranscript}
                                    questionIndex={currentQuestionIndex}
                                    elapsedSeconds={Math.floor((Date.now() - (new Date().getTime())) / 1000)}
                                    isActive={admissionStatus === 'admitted'}
                                />
                                
                                {/* Whisper Transcriber */}
                                <WhisperTranscriber 
                                    interviewId={interviewMongoId}
                                    questionIndex={currentQuestionIndex}
                                />
                            </div>
                        )}

                         {/* Chat HUD Overlay - Moved UP to avoid overlap with camera */}
                         <div className="absolute bottom-52 left-12 z-20 flex flex-col items-start gap-4">
                            <button 
                                onClick={() => setShowChat(!showChat)}
                                className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest italic transition-all shadow-xl flex items-center gap-3 ${showChat ? 'bg-red-600 text-white shadow-red-600/20' : 'bg-black/60 backdrop-blur-md text-white border border-white/10 hover:bg-black/80'}`}
                            >
                                <TfiWrite className="text-lg" />
                                {showChat ? 'Close Comms' : 'Open Comms'}
                            </button>

                            <AnimatePresence>
                                {showChat && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }} 
                                        animate={{ opacity: 1, y: 0, scale: 1 }} 
                                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                        className="w-80 h-96 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                                    >
                                        <div className="p-4 border-b border-white/10 flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] italic">Comm Channel</span>
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                                            {chatMessages.map((msg, i) => (
                                                <div key={i} className={`flex flex-col ${msg.isSystem ? 'items-center' : msg.sender === user?.name ? 'items-end' : 'items-start'}`}>
                                                    {msg.isSystem ? (
                                                        <span className="text-[9px] text-red-500 font-bold uppercase tracking-widest bg-red-900/20 px-3 py-1 rounded-full">{msg.text}</span>
                                                    ) : (
                                                        <div className={`max-w-[85%] rounded-2xl p-3 ${msg.sender === user?.name ? 'bg-red-600 text-white rounded-br-none' : 'bg-white/10 text-white rounded-bl-none'}`}>
                                                            <p className="text-xs leading-relaxed">{msg.text}</p>
                                                            <span className="text-[8px] opacity-50 mt-1 block uppercase tracking-widest">{msg.time}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <form onSubmit={handleChatSubmit} className="p-3 border-t border-white/10 bg-black/40 flex gap-2">
                                            <input 
                                                type="text" 
                                                value={chatInput} 
                                                onChange={(e) => setChatInput(e.target.value)} 
                                                onKeyDown={(e) => { if (e.key === 'Enter') handleChatSubmit(e); }}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-red-600 transition-colors"
                                                placeholder="Transmit message..."
                                            />
                                            <button type="submit" className="hidden">Send</button>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* ── INTELLIGENCE HUD (AI Question Generator) ── */}
                {(!user || user?.role !== 'candidate') && (
                <div className="w-[450px] bg-white border-l border-gray-100 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.02)] z-10 relative">
                    <div className="h-20 border-b border-gray-100 flex items-center justify-between px-8 bg-gray-50/50">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-900 italic underline underline-offset-8 decoration-red-600/20">Intelligence HUD</h3>
                        <TfiShield className="text-gray-300 text-xl" />
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide bg-gray-50/20">
                        
                        {/* Real-time Violation Alerts */}
                        {(detectedViolations.length > 0 || tabSwitchCount > 0) && (
                            <div className="bg-red-50 border-2 border-red-600 p-5 rounded-2xl shadow-lg relative overflow-hidden animate-pulse">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-[40px]" />
                                <div className="flex justify-between items-center mb-3 text-red-600">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_#dc2626]" /> 
                                        ⚠️ Integrity Violations Detected
                                    </h4>
                                    <span className="text-2xl font-black">{detectedViolations.length + tabSwitchCount}</span>
                                </div>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {detectedViolations.slice(-5).map((v, i) => (
                                        <div key={i} className="text-[10px] font-bold text-gray-800 leading-relaxed border-l-4 border-red-600 pl-3 bg-white/50 p-2 rounded">
                                            <span className="font-black text-red-600">{v.type}:</span> {v.description}
                                            <span className="text-gray-500 ml-2">({v.confidence}% confidence)</span>
                                        </div>
                                    ))}
                                    {tabSwitchCount > 0 && (
                                        <div className="text-[10px] font-bold text-gray-800 leading-relaxed border-l-4 border-red-600 pl-3 bg-white/50 p-2 rounded">
                                            <span className="font-black text-red-600">TAB_SWITCH:</span> {tabSwitchCount} tab switches detected
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {/* Live AI Coaching Panel */}
                        <div className="bg-red-50 border border-red-100 p-5 rounded-2xl shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-[40px] group-hover:bg-red-600/10 transition-colors" />
                            <div className="flex justify-between items-center mb-3 text-red-600">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_#dc2626]" /> Live Copilot Alert
                                </h4>
                            </div>
                            <p className="text-[11px] font-bold text-gray-800 leading-relaxed italic border-l-4 border-red-600 pl-3">
                                {aiCoachingTip}
                            </p>
                        </div>

                        {/* ── Feature 2: Live Answer Quality Meter ── */}
                        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Live Answer Quality</h4>
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                                    liveQuality.on_track ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                }`}>{liveQuality.on_track ? 'ON TRACK' : 'NEEDS FOCUS'}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3 mb-2 overflow-hidden">
                                <div
                                    className="h-3 rounded-full transition-all duration-700"
                                    style={{
                                        width: `${liveQuality.quality_score}%`,
                                        backgroundColor: liveQuality.bar_color === 'green' ? '#16a34a'
                                            : liveQuality.bar_color === 'yellow' ? '#ca8a04'
                                            : liveQuality.bar_color === 'orange' ? '#ea580c'
                                            : liveQuality.bar_color === 'red' ? '#dc2626' : '#9ca3af'
                                    }}
                                />
                            </div>
                            <div className="flex justify-between text-[9px] text-gray-500 font-bold mb-2">
                                <span>Quality Score</span>
                                <span className="text-gray-800">{liveQuality.quality_score}/100</span>
                            </div>
                            {liveQuality.coach_message && (
                                <p className="text-[10px] text-gray-600 italic border-l-2 border-gray-300 pl-2">{liveQuality.coach_message}</p>
                            )}
                        </div>

                        {/* ── Feature 5: AI Recruiter Coach ── */}
                        <RecruiterCoach
                            interviewId={interviewMongoId}
                            transcript={liveTranscript}
                            currentQuestion={interviewQuestions[currentQuestionIndex]?.text || ''}
                            candidatePerformance={{
                                overall_score: liveQuality.quality_score,
                                confidence: localEmotion.score,
                                violations: detectedViolations.length
                            }}
                        />

                        {/* ── Feature 4: Inconsistency / Lie Detection ── */}
                        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Resume Consistency Check</h4>
                                <InconsistencyChecker
                                    interviewId={interviewMongoId}
                                    candidateId={interview?.candidate_id}
                                />
                            </div>
                        </div>

                        {/* AI Suggested Questions */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Dynamic AI Prompts</h4>
                                <button onClick={generateNewQuestions} disabled={generatingQuestions} className="text-red-600 hover:text-red-700 transition-colors">
                                    <TfiReload className={`text-lg ${generatingQuestions ? 'animate-spin opacity-50' : ''}`} />
                                </button>
                            </div>
                            
                            <AnimatePresence mode="popLayout">
                                {suggestedQuestions.map((q, index) => (
                                    <motion.div 
                                        key={index + q.substring(0, 5)}
                                        onClick={() => {
                                            const newMsg = {
                                                sender: user?.name || 'Recruiter',
                                                sender_id: user?.id || '',
                                                text: q,
                                                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                                isSystem: false,
                                                from: user?.role || 'recruiter'
                                            };
                                            const updated = [...chatMessages, newMsg];
                                            setChatMessages(updated);
                                            localStorage.setItem(`room_${id}_chat`, JSON.stringify(updated));
                                            
                                            // CRITICAL FIX: Send via WebSocket to candidate
                                            console.log('[AI QUESTION] Sending question to candidate:', q);
                                            send({ 
                                                type: 'chat', 
                                                sender_id: newMsg.sender_id,
                                                text: newMsg.text,
                                                from: newMsg.from,
                                                sender: newMsg.sender,
                                                time: newMsg.time
                                            });
                                            
                                            updateLogs({ type: 'SYS', text: 'AI Prompt pushed directly to candidate channel.', color: 'text-blue-500 font-bold' });
                                            toast.success('Question pushed to active Comm Channel');
                                        }}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:border-red-600/30 transition-colors cursor-pointer group"
                                    >
                                        <p className="text-xs font-semibold text-gray-800 leading-relaxed mb-3">{q}</p>
                                        <div className="flex justify-between items-center text-[9px] uppercase tracking-wider font-bold text-gray-400">
                                            <span>Behavioral Matrix</span>
                                            <span className="text-red-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                                <TfiWrite /> Push to Comms
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                        
                        {/* Live Transcript / Activity Log */}
                        <div className="space-y-4 pt-6 border-t border-gray-100">
                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-4">Event Log</h4>
                            <div className="bg-gray-100/50 rounded-xl p-4 text-[10px] items-start font-mono text-gray-600 space-y-3 h-48 overflow-y-auto shadow-inner border border-gray-100 flex flex-col-reverse">
                                {[...eventLog].reverse().map((log, idx) => (
                                    <p key={idx} className="leading-relaxed">
                                        <span className={`font-black uppercase tracking-widest mr-2 ${log.color}`}>[{log.type}]</span> 
                                        {log.text}
                                    </p>
                                ))}
                            </div>
                        </div>
                        
                        {/* Monitoring Dashboard for Recruiter */}
                        {user?.role !== 'candidate' && (
                            <div className="space-y-4 pt-6 border-t border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">
                                        🛡️ Live Monitoring
                                    </h4>
                                    <button
                                        onClick={() => setShowMonitoringDashboard(!showMonitoringDashboard)}
                                        className="text-[8px] font-bold px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                    >
                                        {showMonitoringDashboard ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                                
                                {showMonitoringDashboard && (
                                    <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
                                        <div className="space-y-3">
                                            {/* Behavior Score */}
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] font-bold text-gray-600">Behavior Score</span>
                                                <span className={`text-lg font-black ${
                                                    behaviorScore >= 80 ? 'text-green-600' : 
                                                    behaviorScore >= 60 ? 'text-yellow-600' : 
                                                    'text-red-600'
                                                }`}>
                                                    {behaviorScore}/100
                                                </span>
                                            </div>
                                            
                                            {/* Detection Stats */}
                                            <div className="grid grid-cols-2 gap-2 text-[8px]">
                                                <div className={`p-2 rounded ${detectionStats.phoneDetected ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                    📱 Phone: {detectionStats.phoneDetected ? 'YES' : 'NO'}
                                                </div>
                                                <div className={`p-2 rounded ${detectionStats.multiplePersons ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                    👥 Multiple: {detectionStats.multiplePersons ? 'YES' : 'NO'}
                                                </div>
                                                <div className={`p-2 rounded ${detectionStats.bookDetected ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                    📚 Book: {detectionStats.bookDetected ? 'YES' : 'NO'}
                                                </div>
                                                <div className="p-2 rounded bg-blue-100 text-blue-700">
                                                    👁️ Gaze: {detectionStats.gazeDirection || 'CENTER'}
                                                </div>
                                            </div>
                                            
                                            {/* Recent Violations */}
                                            <div>
                                                <div className="text-[9px] font-bold text-gray-600 mb-2">
                                                    Recent Violations ({detectedViolations.length})
                                                </div>
                                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                                    {detectedViolations.slice(-3).reverse().map((v, i) => (
                                                        <div key={i} className={`text-[8px] p-2 rounded ${
                                                            v.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                                                            v.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                            <div className="font-bold">{v.type.replace(/_/g, ' ')}</div>
                                                            <div className="opacity-75">{v.description}</div>
                                                        </div>
                                                    ))}
                                                    {detectedViolations.length === 0 && (
                                                        <div className="text-[8px] text-center text-gray-400 py-4">
                                                            No violations detected
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Generate Report Button */}
                                            {interviewMongoId && (
                                                <button
                                                    onClick={() => setShowComprehensiveReport(true)}
                                                    className="w-full text-[9px] font-bold px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 shadow-lg"
                                                >
                                                    📊 Generate Complete Report
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>
                )}
            </main>
            
            {/* Comprehensive Report Modal */}
            {showComprehensiveReport && interviewMongoId && (
                <ComprehensiveReport
                    interviewId={interviewMongoId}
                    onClose={() => setShowComprehensiveReport(false)}
                />
            )}

            {/* ── Anxiety Calm Coach Overlay (candidate only) ── */}
            <AnimatePresence>
                {showAnxietyCoach && anxietyData && user?.role === 'candidate' && (
                    <motion.div
                        initial={{ opacity: 0, x: 100, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 20 }}
                        className="fixed bottom-8 right-8 z-[3000] w-[360px]"
                    >
                        <div className="bg-gray-950 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
                            {/* Header */}
                            <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl animate-pulse ${anxietyData.anxiety_score > 70 ? 'bg-red-600/20 text-red-400' : anxietyData.anxiety_score > 50 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                        🧘
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-black uppercase text-white tracking-widest italic">Calm Coach</div>
                                        <div className={`text-[9px] font-black uppercase tracking-widest italic ${anxietyData.anxiety_score > 70 ? 'text-red-400' : 'text-amber-400'}`}>{anxietyData.anxiety_level} Detected</div>
                                    </div>
                                </div>
                                <button onClick={() => setShowAnxietyCoach(false)} className="text-gray-500 hover:text-white transition-colors p-2 text-lg rounded-xl hover:bg-white/10">
                                    <TfiClose />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                {/* Score */}
                                <div className="flex items-center gap-5">
                                    <div className="relative w-16 h-16 flex-shrink-0">
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                                            <circle cx="50" cy="50" r="40" fill="none"
                                                stroke={anxietyData.anxiety_score > 70 ? '#ef4444' : anxietyData.anxiety_score > 50 ? '#f59e0b' : '#10b981'}
                                                strokeWidth="10" strokeLinecap="round"
                                                strokeDasharray={`${(anxietyData.anxiety_score / 100) * 251} 251`}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-lg font-black text-white italic">{anxietyData.anxiety_score}</span>
                                        </div>
                                    </div>
                                    <p className="text-[13px] text-gray-300 italic leading-relaxed">{anxietyData.calm_message}</p>
                                </div>

                                {/* Breathing Exercise */}
                                <div className="p-6 bg-white/5 rounded-[1.5rem] border border-white/5">
                                    <div className="text-[9px] font-black uppercase text-blue-400 tracking-widest italic mb-3">Breathing Exercise</div>
                                    <p className="text-[12px] text-gray-300 italic leading-relaxed">{anxietyData.breathing_exercise}</p>
                                </div>

                                {/* Quick Tip */}
                                <div className="p-5 bg-amber-500/10 rounded-[1.5rem] border border-amber-500/20">
                                    <p className="text-[12px] text-amber-300 italic">💡 {anxietyData.quick_tip}</p>
                                </div>

                                {/* Affirmation */}
                                <div className="text-center">
                                    <p className="text-[14px] font-black text-white italic">{anxietyData.positive_affirmation}</p>
                                </div>

                                <button
                                    onClick={() => setShowAnxietyCoach(false)}
                                    className="w-full py-4 rounded-[1.5rem] bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest italic transition-all"
                                >
                                    I'm Ready · Close
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}