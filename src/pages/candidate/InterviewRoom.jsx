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
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth(); // Dynamic authenticated user

    // Mock Contexts
    const interview = { title: 'Senior AI Engineer Assessment', id: id };
    const status = 'active';

    // Core States
    const [audioMuted, setAudioMuted] = useState(false);
    const [videoOff, setVideoOff] = useState(false);
    const [hasVideoFeed, setHasVideoFeed] = useState(true);
    const [screenSharing, setScreenSharing] = useState(false);
    const [transcriptActive, setTranscriptActive] = useState(false);
    const [confirmEnd, setConfirmEnd] = useState(false);
    const [interviewComplete, setInterviewComplete] = useState(false);
    const [evaluating, setEvaluating] = useState(true);
    const [finalVerdict, setFinalVerdict] = useState(null);


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
    const wsUrl = `${wsBaseUrl}/ws/interview/${id}/`;
    const { send } = useWebSocket(wsUrl, {
        onMessage: async (event) => {
            try {
                const data = JSON.parse(event.data);

                // --- Admission Signaling (cross-device via WebSocket) ---
                // Backend sends 'candidate_waiting' to recruiter when candidate joins
                if (data.type === 'candidate_waiting') {
                    if (user?.role !== 'candidate') {
                        setIsCandidateWaiting(true);
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
                    if (user?.role === 'candidate') {
                        setAdmissionStatus('admitted');
                        toast.success('Recruiter has admitted you. Entering room...');
                    }
                }

                // --- Core WebRTC Signaling ---
                if (data.type === 'peer-connected') {
                    // Both peers know someone else is here.
                    // Strictly: Candidate sends offer, Recruiter waits.
                    if (user?.role === 'candidate') {
                        const connection = createPeerConnection();
                        // Add tracks before making offer
                        if (localStream.current) {
                            localStream.current.getTracks().forEach(track => {
                                connection.addTrack(track, localStream.current);
                            });
                        }
                        const offer = await connection.createOffer();
                        await connection.setLocalDescription(offer);
                        send({ type: 'offer', offer });
                        updateLogs({ type: 'NET', text: 'Initiating handshake...', color: 'text-blue-500' });
                    }
                } 
                
                else if (data.type === 'offer') {
                    const connection = createPeerConnection();
                    // Add tracks before answering
                    if (localStream.current) {
                        localStream.current.getTracks().forEach(track => {
                            // Avoid adding same track twice if already added
                            if (!connection.getSenders().find(s => s.track === track)) {
                                connection.addTrack(track, localStream.current);
                            }
                        });
                    }
                    await connection.setRemoteDescription(new RTCSessionDescription(data.offer));
                    const answer = await connection.createAnswer();
                    await connection.setLocalDescription(answer);
                    send({ type: 'answer', answer });
                    updateLogs({ type: 'NET', text: 'Handshake accepted.', color: 'text-emerald-500' });
                }

                else if (data.type === 'answer') {
                    if (pc.current) {
                        await pc.current.setRemoteDescription(new RTCSessionDescription(data.answer));
                    }
                }

                else if (data.type === 'ice-candidate') {
                    if (pc.current && data.candidate) {
                        try {
                            await pc.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                        } catch (e) { console.error("Error adding candidate", e); }
                    }
                }

                // --- Flow Controls ---
                if (data.type === 'end_meeting' || data.type === 'meeting_ended') {
                    if (localStream.current) localStream.current.getTracks().forEach(t => t.stop());
                    if (pc.current) pc.current.close();
                    setInterviewComplete(true);
                    generateMockAIVerdict();
                    setTimeout(() => setEvaluating(false), 2000);
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
    const [violations, setViolations] = useState(0);
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [faceSnapshots, setFaceSnapshots] = useState([]);
    const [localEmotion, setLocalEmotion] = useState({ score: 88, emotion: 'CONFIDENT' });
    const [aiCoachingTip, setAiCoachingTip] = useState("Monitoring baseline response metrics.");
    
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
        if (user?.role === 'candidate' && admissionStatus === 'waiting') {
            // Delay to ensure WS connection is open
            const t = setTimeout(() => {
                send({ type: 'request_admit', room: id });
            }, 1500);
            return () => clearTimeout(t);
        }
    }, [user, admissionStatus, id]);

    // Refs
    const localVideo = useRef(null);
    const remoteVideo = useRef(null);
    const localStream = useRef(null);
    const pc = useRef(null); // WebRTC Peer Connection
    const screenStream = useRef(null); // Screen share stream

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

        const connection = new RTCPeerConnection(iceConfig);

        // Handle ICE Candidates
        connection.onicecandidate = (event) => {
            if (event.candidate) {
                send({ type: 'ice-candidate', candidate: event.candidate });
            }
        };

        // Handle Remote Tracks
        connection.ontrack = (event) => {
            console.log("Receiving remote track:", event.streams[0]);
            if (remoteVideo.current) {
                remoteVideo.current.srcObject = event.streams[0];
            }
        };

        // Connection testing/logging
        connection.onconnectionstatechange = () => {
            console.log("PC Connection State:", connection.connectionState);
            if (connection.connectionState === 'connected') {
                updateLogs({ type: 'NET', text: 'Secure Peer-to-Peer link established.', color: 'text-emerald-500' });
            }
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
            if (document.hidden && user?.role === 'candidate') {
                setViolations(v => {
                    const newVio = v + 1;
                    
                    // Cross tab inject log for HR to see immediately
                    const storedLogs = JSON.parse(localStorage.getItem(`room_${id}_events`) || '[]');
                    const newLog = { type: 'WARN', text: `Integrity Anomaly: Tab Switch Detected (#${newVio})`, color: 'text-red-600 font-bold animate-pulse font-black' };
                    const updatedLogs = [...storedLogs, newLog];
                    localStorage.setItem(`room_${id}_events`, JSON.stringify(updatedLogs));
                    setEventLog(updatedLogs);

                    return newVio;
                });
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // ✅ Start Camera
    useEffect(() => {
        if (admissionStatus === 'admitted') {
            const startCamera = async () => {
                try {
                    let stream;
                    try {
                        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    } catch (e) {
                        console.warn("Camera failed, using mic only in room:", e);
                        stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
                        setHasVideoFeed(false);
                        if (user?.role === 'candidate') {
                            updateLogs({ type: 'CRIT', text: 'Candidate camera hardware unavailable or blocked.', color: 'text-red-700 font-black animate-pulse' });
                            setViolations(v => v + 4); // Automatic 60% penalty
                        }
                    }
                    
                    localStream.current = stream;
                    const attachStreams = () => {
                        if (localVideo.current) {
                            localVideo.current.srcObject = stream;
                            localVideo.current.play().catch(e => console.error("Local play blocked:", e));
                        }
                    };
                    
                    attachStreams();
                    // If connection already exists (e.g. joined late), add tracks
                    if (pc.current) {
                        stream.getTracks().forEach(track => {
                            if (!pc.current.getSenders().find(s => s.track === track)) {
                                pc.current.addTrack(track, stream);
                            }
                        });
                    }
                } catch (err) {
                    console.error('Camera/Mic error:', err);
                }
            };
            startCamera();
            
            // Mock Heatmap generation
            const interval = setInterval(() => {
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
            
            return () => clearInterval(interval);
        }
    }, [admissionStatus]);

    // ✅ Controls Logic
    const toggleAudio = () => {
        const track = localStream.current?.getAudioTracks()[0];
        if (track) {
            track.enabled = !track.enabled;
            setAudioMuted(!track.enabled);
        }
    };

    const toggleVideo = () => {
        const track = localStream.current?.getVideoTracks()[0];
        if (track) {
            track.enabled = !track.enabled;
            setVideoOff(!track.enabled);
        }
    };

    const handleScreenShare = async () => {
        try {
            if (!screenSharing) {
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                screenStream.current = stream;
                setScreenSharing(true);
                
                // Replace video track in PeerConnection
                if (pc.current) {
                    const videoTrack = stream.getVideoTracks()[0];
                    const sender = pc.current.getSenders().find(s => s.track?.kind === 'video');
                    if (sender) {
                        sender.replaceTrack(videoTrack);
                    }
                }

                stream.getTracks()[0].onended = () => {
                    stopScreenSharing();
                };
            } else {
                stopScreenSharing();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const stopScreenSharing = () => {
        if (screenStream.current) {
            screenStream.current.getTracks().forEach(track => track.stop());
            screenStream.current = null;
        }
        setScreenSharing(false);
        
        // Revert to camera track
        if (pc.current && localStream.current) {
            const videoTrack = localStream.current.getVideoTracks()[0];
            const sender = pc.current.getSenders().find(s => s.track?.kind === 'video');
            if (sender && videoTrack) {
                sender.replaceTrack(videoTrack);
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
            if (localStream.current) {
                localStream.current.getTracks().forEach(t => t.stop());
            }
            if (pc.current) pc.current.close();
            setInterviewComplete(true);
            // Navigate recruiter to dashboard — real AI eval will appear there shortly
            setTimeout(() => navigate('/recruiter/dashboard'), 3000);
        }
    };

    const handleChatSubmit = (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        const newMsg = {
            sender: user?.name || 'User',
            text: chatInput,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSystem: false
        };
        const updated = [...chatMessages, newMsg];
        setChatMessages(updated);
        localStorage.setItem(`room_${id}_chat`, JSON.stringify(updated));
        
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

        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white p-6 relative overflow-hidden">
                {/* Tactical Background */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <div className="w-[1000px] h-[1000px] rounded-full bg-red-600 blur-[150px] animate-pulse" />
                </div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />

                <div className="z-10 w-full max-w-4xl relative">
                    {evaluating ? (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
                            <div className="w-40 h-40 relative mb-12">
                                <div className="absolute inset-0 border-[3px] border-dashed border-red-600/30 rounded-full animate-spin duration-[4000ms]" />
                                <div className="absolute inset-4 border-[2px] border-red-500/50 rounded-full animate-spin-reverse duration-[2000ms]" />
                                <div className="flex items-center justify-center w-full h-full text-5xl text-red-500 shadow-[0_0_30px_#dc2626] rounded-full bg-black/50 backdrop-blur-xl">
                                    <TfiReload className="animate-spin" />
                                </div>
                            </div>
                            <h2 className="text-3xl font-black uppercase tracking-[0.4em] italic mb-4">Synthesizing AI Audit</h2>
                            <div className="flex flex-col items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <p className="animate-pulse">Analyzing Micro-Expressions...</p>
                                <p className="animate-pulse transition-delay-100">Scanning for Secondary Devices (Phones)...</p>
                                <p className="animate-pulse transition-delay-200">Evaluating Technical Answer Accuracy...</p>
                                <p className="animate-pulse transition-delay-300">Calculating Job Alignment Percentage...</p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-black/80 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-12 shadow-[0_0_100px_rgba(220,38,38,0.15)] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[80px]" />
                            <div className="flex items-center justify-between border-b border-white/10 pb-8 mb-8">
                                <div>
                                    <h1 className="text-3xl font-black uppercase tracking-tighter italic text-white flex items-center gap-4">
                                        <TfiShield className="text-red-600" />
                                        Final Candidate Verdict
                                    </h1>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-2">AI Behavioral & Technical Assessment</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-1">Eligibility Score</div>
                                    <div className={`text-5xl font-black italic tracking-tighter ${!hasVideoFeed ? 'text-red-800' : (finalVerdict?.score) >= 75 ? 'text-emerald-500' : 'text-red-600'}`}>
                                        {!hasVideoFeed ? 'DISQUALIFIED' : `${finalVerdict?.score}%`}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Technical & Behavioral breakdown */}
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-500 mb-4 border-l-2 border-red-600 pl-3">Technical Accuracy</h3>
                                        <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-bold text-gray-300">Semantic Interview Analysis</span>
                                                <span className={`text-xs font-black ${!hasVideoFeed ? 'text-red-600' : 'text-emerald-500'}`}>
                                                    {!hasVideoFeed ? 'No Verifiable Input' : 'Analyzed'}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-gray-500 italic mt-2">
                                                {!hasVideoFeed ? 'Candidate could not be visually verified; technical inputs discarded due to severe integrity breach.' : finalVerdict?.techText}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-500 mb-4 border-l-2 border-red-600 pl-3">Behavioral Integrity</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center bg-white/5 border border-white/5 rounded-xl p-4">
                                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Eye Contact Ratio</span>
                                                <span className="text-[10px] font-black text-white">{localEmotion?.score > 60 ? 'Optimal (92%)' : 'Erratic (45%)'}</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-white/5 border border-white/5 rounded-xl p-4">
                                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Confidence Index</span>
                                                <span className="text-[10px] font-black text-white">{localEmotion?.emotion || 'Neutral'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Red Flags Array */}
                                <div>
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-500 mb-4 border-l-2 border-amber-500 pl-3">Detected Red Flags</h3>
                                    {violations > 0 ? (
                                        <div className="space-y-4">
                                            {violations >= 1 && (
                                                <div className="bg-red-900/10 border border-red-600/30 rounded-2xl p-5 flex gap-4">
                                                    <div className="mt-1 w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_#dc2626]" />
                                                    <div>
                                                        <div className="text-xs font-black text-white uppercase tracking-widest mb-1">Tab/Window Switched</div>
                                                        <div className="text-[10px] text-red-500/80">Candidate navigated away from the interview screen {violations} times. High probability of external searching.</div>
                                                    </div>
                                                </div>
                                            )}
                                            {/* Mock Phone Usage / Gaze detection flag */}
                                            {localEmotion?.score < 70 && (
                                                <div className="bg-amber-900/10 border border-amber-500/30 rounded-2xl p-5 flex gap-4">
                                                    <div className="mt-1 w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_#f59e0b]" />
                                                    <div>
                                                        <div className="text-xs font-black text-white uppercase tracking-widest mb-1">Downward Gaze Deviation</div>
                                                        <div className="text-[10px] text-amber-500/80">Candidate repeatedly looked down off-screen. Possible use of secondary device or phone.</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="bg-emerald-900/10 border border-emerald-500/30 rounded-2xl p-8 text-center">
                                            <TfiCheck className="text-3xl text-emerald-500 mx-auto mb-4 drop-shadow-[0_0_15px_#10b981]" />
                                            <p className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.3em]">No Integrity Violations Detected</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-12 flex justify-center border-t border-white/10 pt-8">
                                <button onClick={() => navigate(user?.role === 'candidate' ? '/candidate/dashboard' : '/recruiter/dashboard')} className="px-12 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] italic shadow-2xl bg-white text-black hover:bg-red-600 hover:text-white transition-all transform hover:scale-105">
                                    Return to Command Center
                                </button>
                            </div>
                        </motion.div>
                    )}
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
                                <div key={i} className={`w-2 h-2 rounded-full transition-all duration-700 ${i <= Math.max(1, 5 - violations) ? 'bg-red-600 shadow-[0_0_10px_#dc2626]' : 'bg-white/5 shadow-inner'}`} />
                            ))}
                            <span className="ml-2 text-[8px] font-bold text-gray-400 uppercase">Violations: {violations}</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-gray-700 uppercase tracking-[0.4em] mb-1.5 italic">Behavioral Confidence</span>
                        <span className={`text-[11px] font-black italic tracking-widest uppercase transition-colors ${localEmotion?.score >= 70 ? 'text-emerald-500' : localEmotion?.score >= 45 ? 'text-amber-500' : 'text-red-600'}`}>
                            {Math.round(localEmotion?.score)}% MATCH · {localEmotion?.emotion}
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

                    <button onClick={handleEndMeeting} className={`h-12 px-10 text-[11px] font-black uppercase tracking-[0.4em] italic transition-all skew-x-[-15deg] shadow-2xl ${confirmEnd ? 'bg-amber-500 text-black animate-pulse' : 'bg-red-600 text-white hover:bg-red-700 shadow-[0_0_15px_rgba(220,38,38,0.3)]'}`}>
                        <span className="skew-x-[15deg] block">{confirmEnd ? 'CONFIRM END' : 'END INTERVIEW'}</span>
                    </button>
                    
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
                            <video ref={remoteVideo} autoPlay playsInline className="w-full h-full object-cover transition-opacity duration-1000 transform scale-x-[-1]" />
                            
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
                                            onClick={() => {
                                                send({ type: 'admit_candidate', room: id });
                                                setIsCandidateWaiting(false);
                                                toast.success('Candidate admitted!');
                                            }}
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
                        
                        {/* Mini Self-View (PiP) */}
                        <div className="absolute bottom-12 right-12 w-64 h-48 rounded-2xl overflow-hidden border-2 border-red-600/20 shadow-2xl z-20 bg-black">
                            <video ref={localVideo} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                            <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-[8px] text-white font-bold tracking-widest uppercase">
                                You
                            </div>
                        </div>

                         {/* Chat HUD Overlay */}
                         <div className="absolute bottom-12 left-12 z-20 flex flex-col items-start gap-4">
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
                                                sender: 'AI Target Prompt',
                                                text: q,
                                                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                                isSystem: true
                                            };
                                            const updated = [...chatMessages, newMsg];
                                            setChatMessages(updated);
                                            localStorage.setItem(`room_${id}_chat`, JSON.stringify(updated));
                                            
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

                    </div>
                </div>
                )}
            </main>
        </div>
    );
}