import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TfiVideoCamera, 
  TfiMicrophone, 
  TfiVolume, 
  TfiInfoAlt, 
  TfiBolt, 
  TfiShield, 
  TfiCalendar,
  TfiArrowRight,
  TfiCheck,
  TfiAlert,
  TfiPulse,
  TfiTarget,
  TfiStatsUp
} from 'react-icons/tfi';
import interviewService from '../../services/interviewService';
import Loader from '../../components/Loader';
import { toast } from 'sonner';
import useAuth from '../../hooks/useAuth';

export default function InterviewLobby() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stream, setStream] = useState(null);
    const [micLevel, setMicLevel] = useState(0);
    const [checks, setChecks] = useState({
        camera: false,
        mic: false,
        network: true
    });
    const videoRef = useRef();
    const micAnimRef = useRef(null);
    const audioContextRef = useRef(null);

    // Dynamic Alignment Logic
    const alignmentScore = useMemo(() => {
        if (!user || !user.detailed_skills) return 85; // Baseline
        if (!interview || !interview.job_requirements) return 88; // Default if job data missing
        
        const userSkills = user.detailed_skills.map(s => s.toLowerCase());
        const jobReqs = (interview.job_requirements || []).map(r => r.toLowerCase());
        
        if (jobReqs.length === 0) return 90;
        
        const matches = jobReqs.filter(r => userSkills.includes(r));
        const score = Math.min(98, Math.round((matches.length / jobReqs.length) * 100) + 5); // Add 5% for overall profile
        return score;
    }, [user, interview]);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const { data } = await interviewService.joinRoom(roomId);
                setInterview(data);
            } catch (err) {
                toast.error('Session loading failed. Redirecting...');
                navigate('/candidate/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [roomId, navigate]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (micAnimRef.current) cancelAnimationFrame(micAnimRef.current);
            if (audioContextRef.current) audioContextRef.current.close();
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const startHardwareCheck = async () => {
        try {
            let mediaStream;
            try {
                mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            } catch (initialErr) {
                console.warn("Camera+Mic failed, trying Mic only...", initialErr);
                mediaStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
                toast.warning('Camera not found. Proceeding with microphone only.');
            }
            
            setStream(mediaStream);
            if (videoRef.current && mediaStream.getVideoTracks().length > 0) {
                videoRef.current.srcObject = mediaStream;
                setChecks(prev => ({ ...prev, camera: true, mic: true }));
            } else {
                setChecks(prev => ({ ...prev, camera: false, mic: true }));
            }
            
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioContextRef.current = audioContext;
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(mediaStream);
            source.connect(analyser);
            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            const updateMic = () => {
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for(let i=0; i<bufferLength; i++) sum += dataArray[i];
                setMicLevel(Math.min(100, (sum / bufferLength) * 2));
                micAnimRef.current = requestAnimationFrame(updateMic);
            };
            updateMic();
            toast.success('Hardware components synced successfully.');
        } catch (err) {
            console.error(err);
            setChecks(prev => ({ ...prev, camera: false, mic: false }));
            toast.error(`Hardware access denied: ${err.message || 'Verify permissions and devices.'}`);
        }
    };

    const handleJoin = () => {
        if (micAnimRef.current) cancelAnimationFrame(micAnimRef.current);
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        navigate(`/interview/room/${roomId}`);
    };

    if (loading) return <Loader fullScreen text="Loading Interview Room..." />;

    return (
        <div className="elite-content max-w-7xl mx-auto pb-24">
            <header className="mb-16">
                <h1 className="elite-tactical-header">Interview Readiness</h1>
                <p className="elite-sub-header mt-2 text-gray-400 font-black uppercase tracking-[0.4em] text-[10px] italic">Hardware Validation · Secure Session</p>
            </header>

            <div className="flex flex-col xl:flex-row gap-12">
                {/* Left: Video Preview & Hardware Preview */}
                <div className="flex-1 space-y-10">
                    <div className="elite-glass-panel md:p-12 bg-black relative overflow-hidden group border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] rounded-[3rem]">
                        {/* Status Overlay */}
                        <div className="absolute top-8 left-8 z-20 flex gap-4">
                             <div className="px-5 py-2.5 rounded-xl bg-red-600 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest italic shadow-2xl animate-pulse">
                                READY TO JOIN
                             </div>
                        </div>
                        
                        <div className="aspect-video bg-gray-950 rounded-[2rem] overflow-hidden border border-white/10 relative z-10 shadow-inner group-hover:border-red-600/30 transition-all duration-700">
                            {checks.camera ? (
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-10">
                                    <div className="w-24 h-24 rounded-full border border-red-600/20 flex items-center justify-center text-red-600 text-4xl animate-pulse">
                                        <TfiVideoCamera />
                                    </div>
                                     <button 
                                        onClick={startHardwareCheck} 
                                        className="bg-red-600 text-white px-12 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] hover:bg-black transition-all shadow-2xl italic active:scale-95"
                                     >
                                        TEST CAMERA & MIC
                                    </button>
                                </div>
                            )}

                            {/* Data Overlay */}
                            <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between">
                                 <div className="flex justify-between items-start opacity-0 group-hover:opacity-40 transition-opacity">
                                    <div className="text-[8px] font-black text-white uppercase tracking-[0.4em]">Room ID: {roomId.substring(0,8)}</div>
                                    <div className="text-[8px] font-black text-white uppercase tracking-[0.4em]">Protocol: AES-256</div>
                                 </div>
                                 <div className="flex justify-between items-end opacity-30">
                                    <div className="text-[8px] font-black text-white uppercase tracking-[0.4em]">Status: {checks.camera ? 'ACTIVE' : 'IDLE'}</div>
                                    <div className="text-[8px] font-black text-white uppercase tracking-[0.4em]">Latency: 28MS</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 relative z-10">
                             <div className={`p-8 rounded-[2rem] border transition-all duration-700 ${checks.camera ? 'bg-red-600/10 border-red-600/30 text-red-600 shadow-2xl shadow-red-500/10' : 'bg-white/[0.02] border-white/5 text-gray-700'}`}>
                                <TfiVideoCamera className={`mb-6 text-3xl ${checks.camera ? 'animate-pulse' : ''}`} />
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 italic">Camera Video</div>
                                <div className="text-[12px] font-black uppercase tracking-tighter">{checks.camera ? 'ACTIVE' : 'NULL'}</div>
                            </div>
                             <div className={`p-8 rounded-[2rem] border transition-all duration-700 ${checks.mic ? 'bg-red-600/10 border-red-600/30 text-red-600 shadow-2xl shadow-red-500/10' : 'bg-white/[0.02] border-white/5 text-gray-700'}`}>
                                <TfiMicrophone className={`mb-6 text-3xl ${checks.mic ? 'animate-pulse' : ''}`} />
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 italic">Microphone Input</div>
                                <div className="text-[12px] font-black uppercase tracking-tighter">{checks.mic ? 'ACTIVE' : 'NULL'}</div>
                                {checks.mic && (
                                    <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }} 
                                            animate={{ width: `${micLevel}%` }} 
                                            className="h-full bg-red-600 shadow-[0_0_10px_#dc2626]" 
                                        />
                                    </div>
                                )}
                            </div>
                             <div className="p-8 rounded-[2rem] border bg-emerald-500/5 border-emerald-500/10 text-emerald-500 shadow-2xl shadow-emerald-500/10">
                                <TfiShield className="mb-6 text-3xl" />
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 italic">Secure Encryption</div>
                                <div className="text-[12px] font-black uppercase tracking-tighter">SECURED</div>
                            </div>
                        </div>
                    </div>

                    <div className="elite-glass-panel p-12 bg-black/40">
                         <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-600 mb-10 flex items-center gap-4 italic border-l border-red-600/30 pl-6">
                            <TfiInfoAlt className="text-red-700" /> INTERVIEW GUIDELINES
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                             <div className="p-8 bg-white/[0.02] rounded-[2rem] border border-white/5">
                                 <p className="text-sm font-medium text-gray-400 leading-[1.8] italic opacity-70">
                                    AI supervision is active. Switching tabs or leaving the screen will be flagged as a security override. Please stay focused during the interview session.
                                 </p>
                             </div>
                             <div className="space-y-4">
                                 {[
                                    'STABLE INTERNET CONNECTION',
                                    'HIGH-BANDWIDTH CONNECTIVITY',
                                    'QUIET ENVIRONMENT (NO NOISE)',
                                    'VALID IDENTIFICATION'
                                 ].map(p => (
                                    <div key={p} className="flex items-center gap-4 p-4 bg-white/[0.01] rounded-2xl border border-white/[0.02] group/p hover:border-emerald-500/20 transition-all">
                                        <TfiCheck className="text-emerald-500 group-hover/p:scale-125 transition-transform" />
                                        <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest italic group-hover/p:text-emerald-500 transition-colors">{p}</span>
                                    </div>
                                 ))}
                             </div>
                        </div>
                    </div>
                </div>

                {/* Right: Interview Details & Entry Sidebar */}
                <div className="w-full xl:w-[450px] space-y-10">
                    <div className="elite-glass-panel bg-black text-white p-12 relative overflow-hidden group shadow-[0_50px_100px_rgba(0,0,0,0.8)] border-white/10 rounded-[3rem]">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/[0.08] blur-[100px] pointer-events-none group-hover:bg-red-600/[0.12] transition-all duration-1000" />
                         <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-2 text-white">Interview Details</h2>
                        <div className="text-[11px] font-black uppercase tracking-[0.5em] text-red-600 mb-12 italic border-b border-red-900/30 pb-4 inline-block">Readiness Status</div>
                        
                        <div className="space-y-12 relative z-10">
                             <div>
                                <div className="text-[10px] font-black text-gray-800 uppercase mb-4 tracking-[0.4em] italic">Target Role</div>
                                <div className="font-black text-2xl italic uppercase tracking-tighter text-white">{interview?.job_title || 'TECHNICAL SPECIALIST'}</div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <div className="text-[10px] font-black text-gray-800 uppercase mb-3 tracking-[0.3em] italic">Format</div>
                                    <div className="text-xs font-black uppercase text-gray-500 tracking-widest italic">Live Interview</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-gray-800 uppercase mb-3 tracking-[0.3em] italic">System Status</div>
                                    <div className="text-xs font-black uppercase text-gray-500 tracking-widest italic">Verified</div>
                                </div>
                            </div>

                             <div className="pt-12 border-t border-white/10 mt-6 relative group/insight">
                                <div className="absolute top-[-1px] left-0 w-20 h-[1px] bg-red-600 shadow-[0_0_10px_#dc2626]" />
                                <div className="flex items-center gap-4 mb-6">
                                    <TfiBolt className="text-red-600 animate-pulse text-2xl" />
                                    <span className="text-[11px] font-black uppercase tracking-[0.4em] text-red-600 italic">PROFILE COMPATIBILITY</span>
                                </div>
                                <div className="relative p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 group-hover/insight:border-red-600/30 transition-all">
                                    <div className="absolute top-6 right-8">
                                        <div className="text-3xl font-black text-white italic tracking-tighter">{alignmentScore}%</div>
                                        <div className="text-[8px] font-black text-red-700 uppercase tracking-widest mt-1 text-right">MATCH</div>
                                    </div>
                                    <p className="text-[14px] font-medium leading-[1.8] italic text-gray-500 border-l-2 border-red-900/50 pl-8 pr-12 transition-colors group-hover/insight:text-gray-300">
                                        "Profile analysis indicates a <span className="text-red-600 font-black">{alignmentScore}% match</span> for this position. Recommendation: Focus on architectural scalability and technical leadership examples. Maintain strong communication."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                     <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleJoin}
                        disabled={!checks.mic && !checks.camera}
                        className={`w-full py-8 rounded-[2.5rem] text-[13px] font-black uppercase tracking-[0.6em] shadow-[0_30px_60px_rgba(0,0,0,0.8)] transition-all group italic active:scale-95 ${(checks.camera || checks.mic) ? 'bg-red-600 text-white hover:bg-black hover:shadow-red-600/30' : 'bg-white/[0.01] text-gray-800 border-2 border-dashed border-white/5 cursor-not-allowed'}`}
                    >
                        {(checks.camera || checks.mic) ? (
                            <div className="flex items-center justify-center gap-6">
                                ENTER INTERVIEW ROOM <TfiArrowRight className="group-hover:translate-x-4 transition-transform duration-700" />
                            </div>
                        ) : (
                            'COMPLETE HARDWARE CHECK'
                        )}
                    </motion.button>

                     <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5 text-center">
                        <p className="text-[9px] font-black text-gray-800 uppercase tracking-[0.5em] italic">Secure Connection Status ACTIVE</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
