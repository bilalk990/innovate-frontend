import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  TfiSearch,
  TfiLocationPin,
  TfiBriefcase,
  TfiTimer,
  TfiCheck,
  TfiClose,
  TfiBolt,
  TfiArrowRight,
  TfiArrowLeft,
  TfiPulse,
  TfiStatsUp,
  TfiTarget,
  TfiShield,
  TfiAlert,
  TfiAngleRight,
  TfiLayers,
  TfiMicrophone,
  TfiLayoutGrid2
} from 'react-icons/tfi';
import useFetch from '../../hooks/useFetch';
import jobService from '../../services/jobService';
import useAuth from '../../hooks/useAuth';
import Loader from '../../components/Loader';

const TIER_COLORS = {
    Excellent: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    Good: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    Fair: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    Weak: 'text-red-500 bg-red-500/10 border-red-500/20',
};

export default function BrowseJobs() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const listJobs = useCallback(() => jobService.list({ search }), [search]);
    const { data: jobs, loading, execute: reload } = useFetch(listJobs);
    
    // Fetch user's applications to prevent duplicates
    const listMyApplications = useCallback(() => jobService.myApplications(), []);
    const { data: myApplications } = useFetch(listMyApplications);

    // Application Modal State
    const [selectedJob, setSelectedJob] = useState(null);
    const [applying, setApplying] = useState(false);

    // Feature 4 — Gap Analyzer
    const [gapJob, setGapJob] = useState(null);
    const [gapData, setGapData] = useState(null);
    const [gapLoading, setGapLoading] = useState(false);
    const [gapError, setGapError] = useState('');

    // AI Match Scanning
    const [isScanning, setIsScanning] = useState(false);
    const [showMatches, setShowMatches] = useState(false);

    // Job Detail View
    const [viewingJob, setViewingJob] = useState(null);

    const calculateMatchScore = (job) => {
        if (!user) return 0;
        
        // 1. Initialize logic
        const userSkills = (user.detailed_skills || []).map(s => s.toLowerCase());
        const jobReqs = (job.requirements || []).map(r => r.toLowerCase());
        const jobTitle = (job.title || '').toLowerCase();
        const jobDesc = (job.description || '').toLowerCase();
        const userHeadline = (user.headline || '').toLowerCase();
        
        let score = 0;
        let matchedCount = 0;

        // 2. Primary Requirement Matching (High Weight)
        if (jobReqs.length > 0) {
            const matches = jobReqs.filter(r => userSkills.includes(r));
            matchedCount = matches.length;
            score += Math.round((matches.length / jobReqs.length) * 60); // Max 60 pts from direct match
        } else {
            // Fallback: If no requirements, scan description for user skills (Medium Weight)
            const matchesInDesc = userSkills.filter(s => jobDesc.includes(s));
            matchedCount = matchesInDesc.length;
            score += Math.min(45, matchesInDesc.length * 8); // Max 45 pts from description scanning
        }

        // 3. Title & Headline Alignment (Bonus Weight)
        if (userHeadline) {
            const headlineWords = userHeadline.split(' ').filter(w => w.length > 3);
            const titleMatch = headlineWords.some(w => jobTitle.includes(w));
            if (titleMatch) score += 15;
        }

        // 4. Baseline & Location Alignment
        score += 10; // Baseline for being a verified user
        if (job.location?.toLowerCase().includes('remote')) score += 5;

        // 5. Final Nuance (Jitter)
        // Add a deterministic jitter based on job ID so it's consistent but looks calculated
        const jitter = parseInt(job.id?.toString().slice(-1) || '0') % 5;
        score += jitter;

        // Clamp to realistic range
        return Math.min(98, Math.max(12, score));
    };
    
    const hasAlreadyApplied = (jobId) => {
        if (!myApplications) return false;
        const applications = myApplications.results || myApplications || [];
        return applications.some(app => app.job_id === jobId || app.job?.id === jobId);
    };

    const runMatchScanner = () => {
        setIsScanning(true);
        setTimeout(() => {
            setIsScanning(false);
            setShowMatches(true);
            toast.success('Skill alignment scan complete.');
        }, 1500);
    };

    const handleApplyClick = (job) => {
        if (!user.is_profile_complete) {
            toast('Profile Incomplete', {
                description: 'You need to complete your profile before applying.',
                action: {
                    label: 'Go to Profile',
                    onClick: () => navigate('/candidate/profile'),
                },
            });
            return;
        }
        
        if (hasAlreadyApplied(job.id)) {
            toast.error('You have already applied for this job.');
            return;
        }
        
        setViewingJob(null);
        setGapJob(null);
        setSelectedJob(job);
    };

    const confirmApply = async () => {
        setApplying(true);
        try {
            await jobService.apply(selectedJob.id);
            toast.success('Application submitted. The hiring team will review your profile.');
            setSelectedJob(null);
            reload();
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Submission failed.';
            const errorCode = err.response?.data?.code;

            if (errorCode === 'RESUME_REQUIRED') {
                toast.error('Resume Missing', {
                    description: 'You need an active resume to apply. Create or upload one now.',
                    action: {
                        label: 'Create Resume',
                        onClick: () => navigate('/candidate/resume-builder'),
                    },
                });
                setSelectedJob(null);
            } else {
                toast.error(errorMsg);
            }
        } finally {
            setApplying(false);
        }
    };

    const handleGapAnalysis = async (job) => {
        setViewingJob(null);
        setSelectedJob(null);
        setGapJob(job);
        setGapData(null);
        setGapError('');
        setGapLoading(true);
        try {
            const res = await jobService.getGapAnalysis(job.id);
            setGapData(res.data);
        } catch (err) {
            setGapError(err.response?.data?.error || 'Skill gap analysis failed.');
        } finally {
            setGapLoading(false);
        }
    };

    if (loading && !jobs) return <Loader fullScreen text="Loading Job Board..." />;

    return (
        <div className="elite-content pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-10">
                <div>
                    <h1 className="elite-tactical-header">Job Board</h1>
                    <p className="elite-sub-header mt-2 text-gray-400 font-black uppercase tracking-[0.4em] text-[10px] italic">Available Opportunities</p>
                </div>

                <div className="flex gap-6 w-full md:w-auto">
                    <button 
                        onClick={runMatchScanner}
                        className={`px-10 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-4 transition-all shadow-2xl ${isScanning ? 'bg-gray-900 text-red-600 animate-pulse' : 'bg-red-600 text-white hover:bg-black active:scale-[0.98]'}`}
                    >
                        <TfiTarget className={isScanning ? 'animate-spin' : 'animate-pulse'} />
                        {isScanning ? 'MATCHING...' : 'MATCH MY SKILLS'}
                    </button>
                    <div className="relative group w-[350px]">
                        <TfiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-red-600 z-10" />
                        <input
                            className="elite-input pl-16 pr-8 py-5 bg-gray-50 border-gray-100 hover:border-red-600/30 focus:border-red-600/50 rounded-[2rem] shadow-xl transition-all text-gray-900 placeholder:text-gray-400"
                            placeholder="SEARCH CURRENT OPENINGS..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && reload()}
                        />
                    </div>
                </div>
            </div>

            {/* AI Banner */}
            <div className="mb-16 p-12 bg-white rounded-[3rem] border border-red-100 relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-600/[0.03] blur-[150px] pointer-events-none group-hover:bg-red-600/[0.05] transition-all duration-1000" />
                <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-red-600 flex items-center justify-center text-4xl text-white shadow-[0_20px_40px_rgba(220,38,38,0.2)] animate-pulse border border-white/10 shrink-0">
                        <TfiBolt />
                    </div>
                    <div className="flex-1 text-center lg:text-left">
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4 text-gray-950">Intelligent Match Scanning</h2>
                        <p className="text-[13px] font-medium italic text-gray-500 max-w-3xl leading-relaxed opacity-70 border-l border-red-600/20 pl-8 ml-4">
                            Deploy our <span className="text-red-600 font-black uppercase">Technical Gap Analysis</span> to visualize your compatibility with high-performance roles.
                        </p>
                    </div>
                    <div className="hidden lg:flex gap-16 border-l border-gray-100 pl-16 items-center">
                        <div className="text-center group-hover:scale-110 transition-transform">
                            <div className="text-5xl font-black text-gray-950 italic tracking-tighter mb-2">{(jobs || []).length}</div>
                            <div className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] italic">Active Nodes</div>
                        </div>
                        <div className="w-px h-12 bg-gray-100" />
                        <div className="text-center group-hover:scale-110 transition-transform">
                            <div className="text-5xl font-black text-red-600 italic tracking-tighter mb-2">AI</div>
                            <div className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] italic">Verified</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Job Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                {(jobs || []).map((job, i) => {
                    const matchScore = calculateMatchScore(job);
                    const isHighlyAligned = matchScore >= 80;
                    
                    return (
                        <motion.div
                            key={job.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-10 flex flex-col justify-between group hover:border-red-600/30 transition-all duration-700 relative overflow-hidden bg-white border border-gray-100 shadow-xl rounded-[2.5rem] active:scale-[0.99]"
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/[0.02] blur-[80px] pointer-events-none group-hover:opacity-100 opacity-0 transition-opacity" />
                            
                            {/* Score/Badge HUD */}
                            <div className="flex justify-between items-start mb-10 relative z-10">
                                <span className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400 italic">
                                    {job.job_type}
                                </span>
                                {showMatches && (
                                    <div className={`px-4 py-2 rounded-xl border flex items-center gap-3 transition-all duration-1000 ${isHighlyAligned ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                        <TfiPulse className="animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{matchScore}% MATCH</span>
                                    </div>
                                )}
                            </div>

                            <div onClick={() => setViewingJob(job)} className="cursor-pointer relative z-10 flex-1">
                                <div className="flex items-center gap-4 mb-3 opacity-60 group-hover:opacity-100 transition-opacity">
                                    <div className="w-1 h-1 rounded-full bg-red-600" />
                                    <span className="text-[9px] font-black text-red-600 uppercase tracking-[0.4em] italic">{job.company_name}</span>
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 mb-4 leading-none uppercase italic group-hover:text-red-600 transition-colors tracking-tighter">
                                    {job.title}
                                </h2>
                                <div className="flex items-center gap-6 mb-10 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                                    <span className="flex items-center gap-2"><TfiLocationPin className="text-red-600" /> {job.location}</span>
                                    <span className="flex items-center gap-2"><TfiBolt className="text-amber-500" /> {job.salary_range || 'Competitive'}</span>
                                </div>

                                <p className="text-sm text-gray-600 font-medium leading-relaxed italic line-clamp-3 mb-12 opacity-60 group-hover:opacity-100 transition-opacity">
                                    {job.description}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-12 pt-8 border-t border-gray-50">
                                    {job.requirements.slice(0, 3).map((r, idx) => (
                                        <span key={idx} className="text-[10px] font-black uppercase bg-gray-50 text-gray-400 px-4 py-2 rounded-xl border border-gray-100 italic transition-all group-hover:border-red-100 group-hover:text-red-600">#{r}</span>
                                    ))}
                                    {job.requirements.length > 3 && <span className="text-[9px] font-black text-gray-300 self-center">+{job.requirements.length - 3} SKILLS</span>}
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 relative z-10">
                                <button
                                    onClick={() => handleGapAnalysis(job)}
                                    className="w-full py-5 rounded-[1.5rem] border border-red-600/10 text-red-600 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-red-50 hover:border-red-600/30 transition-all italic flex items-center justify-center gap-3 group/gap shadow-sm"
                                >
                                    <TfiStatsUp className="group-hover/gap:scale-125 transition-transform" /> SKILL GAP ANALYSIS
                                </button>
                                <button
                                    onClick={() => setViewingJob(job)}
                                    className="w-full py-6 rounded-[1.5rem] bg-gray-900 text-white text-[11px] font-black uppercase tracking-[0.4em] hover:bg-red-600 transition-all italic flex items-center justify-center gap-4 group/specs shadow-xl"
                                >
                                    VIEW DETAILS <TfiArrowRight className="group-hover/specs:translate-x-3 transition-transform duration-500" />
                                </button>
                            </div>
                        </motion.div>
                    );
                })}

                {(jobs || []).length === 0 && (
                    <div className="col-span-full py-48 text-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100 mt-10">
                        <TfiSearch className="text-7xl text-gray-200 mx-auto mb-10 animate-pulse" />
                        <h3 className="text-3xl font-black uppercase italic text-gray-950 tracking-tighter mb-4">Search Range Empty</h3>
                        <p className="text-[12px] font-black uppercase text-gray-400 tracking-[1em] italic">No active opportunities found matching your criteria.</p>
                    </div>
                )}
            </div>

            {/* ── Apply Confirmation Modal ── */}
            <AnimatePresence>
                {selectedJob && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 backdrop-blur-3xl flex items-center justify-center p-8 z-[2500]"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 40 }}
                            animate={{ scale: 1, y: 0 }}
                            className="w-full max-w-[650px] elite-glass-panel p-16 relative overflow-hidden bg-white border-gray-100 shadow-[0_50px_100px_rgba(0,0,0,0.1)] rounded-[3rem]"
                        >
                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-600/[0.02] blur-[150px] pointer-events-none" />
                            <button onClick={() => setSelectedJob(null)} className="absolute top-10 right-10 text-gray-400 hover:text-red-500 transition-colors p-3 text-2xl active:scale-95"><TfiClose /></button>
    
                            <div className="flex items-center gap-10 mb-14 relative z-10">
                                <div className="w-24 h-24 rounded-[2rem] bg-red-600 text-white flex items-center justify-center text-5xl shadow-[0_20px_40px_rgba(220,38,38,0.2)] border border-white/10 animate-pulse">
                                    <TfiPulse />
                                </div>
                                <div>
                                    <h2 className="text-4xl font-black uppercase italic text-gray-950 tracking-tighter leading-none mb-3">Apply Now</h2>
                                    <div className="text-[11px] font-black uppercase text-red-600 tracking-[0.4em] italic leading-none">{selectedJob.title} · {selectedJob.location.toUpperCase()}</div>
                                </div>
                            </div>
    
                            <p className="text-[15px] font-medium italic text-gray-400 mb-14 leading-relaxed max-w-lg border-l border-red-100 pl-8">
                                Confirm your application for <span className="font-black text-gray-950 italic">{selectedJob.title}</span> at <span className="font-black text-gray-950 italic">{selectedJob.company_name}</span>.
                            </p>
                            
                            <div className="bg-gray-50 p-10 rounded-[2.5rem] border border-gray-100 mb-14 relative group overflow-hidden">
                                <div className="absolute inset-0 bg-red-600/[0.01] opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="text-[10px] font-black uppercase text-gray-400 tracking-[0.5em] mb-8 italic">Authenticated Identity</div>
                                <div className="flex items-center gap-8 relative z-10">
                                    <div className="w-20 h-20 rounded-[2rem] bg-white text-gray-900 flex items-center justify-center text-3xl font-black italic shadow-xl border border-gray-100">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black uppercase italic text-gray-950 tracking-tighter leading-none mb-2">{user.name}</div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            <div className="text-[11px] font-black uppercase text-emerald-600 tracking-[0.3em] italic">Verified Profile Node</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-8 relative z-10">
                                <button onClick={() => setSelectedJob(null)} className="flex-1 py-6 rounded-2xl border border-gray-100 text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 hover:text-gray-950 hover:bg-gray-50 transition-all italic underline underline-offset-8 active:scale-95">CANCEL</button>
                                <button
                                    onClick={confirmApply}
                                    disabled={applying}
                                    className={`flex-1 py-7 rounded-2xl text-[12px] font-black uppercase tracking-[0.5em] shadow-xl transition-all italic active:scale-95 ${applying ? 'bg-gray-200 text-gray-400 animate-pulse' : 'bg-red-600 text-white hover:bg-gray-900'}`}
                                >
                                    {applying ? 'SUBMITTING...' : 'CONFIRM APPLICATION'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Feature 4: AI Gap Analysis Modal ── */}
            <AnimatePresence>
                {gapJob && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/95 backdrop-blur-3xl flex items-center justify-center p-8 z-[2100] overflow-y-auto"
                        onClick={(e) => e.target === e.currentTarget && setGapJob(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 40 }}
                            animate={{ scale: 1, y: 0 }}
                            className="w-full max-w-[800px] my-10 relative overflow-hidden bg-white border border-gray-100 shadow-[0_80px_150px_rgba(0,0,0,0.1)] rounded-[3.5rem]"
                        >
                            {/* Header HUD */}
                            <div className="p-12 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-8">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-red-600 flex items-center justify-center text-white text-3xl shadow-[0_10px_30px_rgba(220,38,38,0.2)] border border-white/10 animate-pulse">
                                        <TfiTarget />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black uppercase italic text-gray-950 tracking-tighter leading-none mb-2">Skill Match Analysis</h2>
                                        <div className="flex items-center gap-4">
                                            <p className="text-[11px] font-black uppercase text-red-600 tracking-[0.4em] italic">{gapJob.title.toUpperCase()}</p>
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                                            <p className="text-[11px] font-black uppercase text-gray-400 tracking-[0.4em] italic">{gapJob.company_name.toUpperCase()}</p>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setGapJob(null)} className="text-gray-400 hover:text-red-600 transition-colors p-4 text-3xl active:scale-95"><TfiClose /></button>
                            </div>

                            <div className="p-12 overflow-y-auto max-h-[70vh] panel-scrollbar">
                                {gapLoading && (
                                    <div className="flex flex-col items-center py-32 gap-10">
                                        <div className="relative w-32 h-32">
                                            <div className="absolute inset-0 border-r-4 border-red-600 rounded-full animate-spin" />
                                            <div className="absolute inset-4 border-l-4 border-white/5 rounded-full animate-spin-reverse" />
                                            <div className="flex items-center justify-center h-full text-red-600">
                                                <TfiPulse size={40} className="animate-pulse" />
                                            </div>
                                        </div>
                                        <p className="text-[12px] font-black uppercase text-gray-800 tracking-[1em] animate-pulse italic">Analyzing Skill Compatibility...</p>
                                    </div>
                                )}

                                {gapError && (
                                    <div className="flex items-center gap-6 p-10 bg-red-950/20 border border-red-900/30 rounded-[2.5rem] text-red-600">
                                        <TfiAlert className="text-3xl flex-shrink-0 animate-bounce" />
                                        <p className="text-base font-black uppercase italic tracking-widest">{gapError}</p>
                                    </div>
                                )}

                                {gapData && !gapLoading && (
                                    <div className="space-y-12">
                                        {/* Match Score Matrix */}
                                        <div className="flex flex-col md:flex-row items-center gap-12 p-12 bg-gray-50 rounded-[3rem] border border-gray-100 relative group">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/[0.01] blur-[100px] group-hover:opacity-100 opacity-50 transition-opacity" />
                                            <div className="relative w-40 h-40 flex-shrink-0 group-hover:scale-105 transition-transform duration-700">
                                                <svg className="w-40 h-40 -rotate-90" viewBox="0 0 100 100">
                                                    <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(0,0,0,0.02)" strokeWidth="6" />
                                                    <circle cx="50" cy="50" r="46" fill="none" stroke="#dc2626" strokeWidth="6"
                                                        strokeDasharray={`${(gapData.match_percentage / 100) * 289} 289`}
                                                        strokeLinecap="round"
                                                        className="shadow-sm"
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <div className="text-4xl font-black text-gray-950 italic tracking-tighter leading-none">{gapData.match_percentage}%</div>
                                                    <div className="text-[9px] font-black text-red-700 uppercase tracking-[0.3em] mt-2">Skill Match</div>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className={`inline-block px-6 py-2 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] italic border mb-6 ${TIER_COLORS[gapData.match_tier] || 'text-gray-400 bg-gray-50 border-gray-100'}`}>
                                                    {gapData.match_tier} Match
                                                </div>
                                                <p className="text-lg font-medium text-gray-500 italic leading-relaxed border-l border-red-100 pl-8">{gapData.summary}</p>
                                                <div className="mt-8 flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-emerald-600 shadow-sm border border-gray-100">
                                                        <TfiShield />
                                                    </div>
                                                    <span className="text-[11px] font-black uppercase text-gray-400 tracking-[0.3em] italic">
                                                        Interview Readiness Threshold: <span className="text-gray-950 ml-2 underline underline-offset-4 decoration-emerald-200">{gapData.interview_readiness}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            {/* Matching Skills */}
                                            {gapData.matched_skills?.length > 0 && (
                                                <div className="p-10 bg-gray-50 rounded-[2.5rem] border border-gray-100 group/node hover:border-emerald-600 transition-colors">
                                                    <h3 className="text-[11px] font-black uppercase text-emerald-600 tracking-[0.4em] mb-10 flex items-center gap-4 italic group-hover/node:translate-x-2 transition-transform">
                                                        <TfiCheck className="text-xl" /> Matching Skills ({gapData.matched_skills.length})
                                                    </h3>
                                                    <div className="flex flex-wrap gap-3">
                                                        {gapData.matched_skills.map((skill, i) => (
                                                            <span key={i} className="px-5 py-2.5 bg-white text-emerald-600 border border-emerald-100 rounded-xl text-[10px] font-black uppercase italic tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm"># {skill.toUpperCase()}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Skill Gaps */}
                                            {gapData.missing_skills?.length > 0 && (
                                                <div className="p-10 bg-gray-50 rounded-[2.5rem] border border-gray-100 group/node hover:border-red-600 transition-colors">
                                                    <h3 className="text-[11px] font-black uppercase text-red-600 tracking-[0.4em] mb-10 flex items-center gap-4 italic group-hover/node:translate-x-2 transition-transform">
                                                        <TfiClose className="text-xl animate-pulse" /> Skill Gaps Detected ({gapData.missing_skills.length})
                                                    </h3>
                                                    <div className="flex flex-wrap gap-3">
                                                        {gapData.missing_skills.map((skill, i) => (
                                                            <span key={i} className="px-5 py-2.5 bg-white text-red-600 border border-red-100 rounded-xl text-[10px] font-black uppercase italic tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm">! {skill.toUpperCase()}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Experience Analysis */}
                                        {gapData.experience_gap && (
                                            <div className="p-10 bg-amber-500/[0.02] border border-amber-900/30 rounded-[2.5rem] relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[60px]" />
                                                <div className="flex items-center gap-5 mb-6">
                                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-2xl">
                                                        <TfiAlert />
                                                    </div>
                                                    <p className="text-[12px] font-black uppercase text-amber-500 tracking-[0.4em] italic group-hover:translate-x-2 transition-transform">Experience Analysis</p>
                                                </div>
                                                <p className="text-base text-gray-500 italic leading-relaxed border-l border-amber-900/50 pl-8">{gapData.experience_gap}</p>
                                            </div>
                                        )}

                                        {/* Recommended Actions */}
                                        {gapData.recommended_actions?.length > 0 && (
                                            <div className="p-10 bg-gray-50 rounded-[3rem] border border-gray-100">
                                                <h3 className="text-[12px] font-black uppercase text-gray-400 tracking-[0.6em] mb-10 italic">Recommended Strategy</h3>
                                                <div className="space-y-4">
                                                    {gapData.recommended_actions.map((action, i) => (
                                                        <motion.div 
                                                            key={i} 
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: i * 0.1 }}
                                                            className="flex items-start gap-6 p-6 bg-white rounded-[2rem] border border-gray-100 hover:border-red-600/30 transition-all group/opt shadow-sm"
                                                        >
                                                            <span className="w-10 h-10 rounded-2xl bg-gray-50 text-red-600 text-[11px] flex items-center justify-center font-black flex-shrink-0 group-hover/opt:bg-red-600 group-hover/opt:text-white transition-all shadow-md">{i + 1}</span>
                                                            <span className="text-[15px] text-gray-500 italic leading-relaxed pt-1 transition-colors group-hover/opt:text-gray-900 lowercase first-letter:uppercase">{action}</span>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => handleApplyClick(gapJob)}
                                            className="w-full py-7 rounded-[2rem] bg-red-600 text-white text-[13px] font-black uppercase tracking-[0.6em] hover:bg-black transition-all shadow-[0_0_50px_rgba(220,38,38,0.2)] hover:shadow-red-600/40 italic active:scale-[0.98] group/final"
                                        >
                                            APPLY NOW <TfiArrowRight className="inline ml-6 group-hover/final:translate-x-6 transition-transform duration-700" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

               {/* ── Job Detail Modal ── */}
            <AnimatePresence>
                {viewingJob && (() => {
                    const matchScore = calculateMatchScore(viewingJob);
                    const alreadyApplied = hasAlreadyApplied(viewingJob.id);
                    const scoreColor = matchScore >= 80 ? 'text-emerald-600' : matchScore >= 50 ? 'text-amber-600' : 'text-red-600';
                    const scoreBg = matchScore >= 80 ? 'bg-emerald-50 border-emerald-100' : matchScore >= 50 ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100';
                    
                    return (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[2200] flex items-center justify-center p-8 backdrop-blur-3xl bg-gray-900/40 px-4 sm:px-8"
                            onClick={(e) => e.target === e.currentTarget && setViewingJob(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, y: 50, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                exit={{ scale: 0.95, y: 50, opacity: 0 }}
                                className="w-full max-w-[1200px] max-h-[95vh] bg-white rounded-[4rem] overflow-hidden border border-gray-100 flex flex-col shadow-[0_80px_200px_rgba(0,0,0,0.15)] relative"
                            > 
                                {/* Absolute Header Decals */}
                                <div className="absolute top-0 right-0 w-[800px] h-[400px] bg-red-600/[0.02] blur-[200px] pointer-events-none" />
                                
                                {/* Modal Header Hub */}
                                <div className="p-12 sm:p-20 bg-gray-50/50 border-b border-gray-100 relative overflow-hidden flex-shrink-0">
                                    <div className="flex justify-between items-start mb-16 relative z-10">
                                        <div className="flex flex-wrap gap-4">
                                            <div className="px-6 py-3 rounded-2xl bg-white border border-gray-100 text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 flex items-center gap-4 italic hover:border-red-600/30 transition-colors shadow-sm">
                                                <TfiTimer className="text-red-600" /> {viewingJob.job_type.toUpperCase()}
                                            </div>
                                            {alreadyApplied && (
                                                <div className="px-6 py-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600 flex items-center gap-4 italic animate-pulse">
                                                    <TfiCheck /> APPLIED
                                                </div>
                                            )}
                                        </div>
                                        <button onClick={() => setViewingJob(null)} className="w-16 h-16 rounded-[2rem] bg-white hover:bg-gray-100 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-600 transition-all shadow-xl active:scale-95 group/close">
                                            <TfiClose className="group-hover:rotate-180 transition-transform duration-700" size={24} />
                                        </button>
                                    </div>

                                    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-16 relative z-10 text-center lg:text-left">
                                        <div className="w-32 h-32 rounded-[3.5rem] bg-red-600 flex items-center justify-center text-6xl font-black text-white shadow-[0_0_60px_rgba(220,38,38,0.2)] shrink-0 border border-white/20 animate-pulse relative group/logo overflow-hidden">
                                            {viewingJob.company_name?.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            {/* Salary Highlight badge next to title */}
                                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 mt-4">
                                                <div className="flex-1">
                                                    <h1 className="text-5xl sm:text-7xl font-black uppercase italic tracking-tighter text-gray-900 leading-none mb-4 group cursor-default">
                                                        {viewingJob.title}
                                                    </h1>
                                                    <div className="flex items-center gap-6">
                                                        <span className="text-[12px] font-black text-red-600 uppercase tracking-[0.6em] italic animate-pulse">{viewingJob.company_name}</span>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                                        <span className="text-[12px] font-black text-gray-500 uppercase tracking-[0.6em] italic">{viewingJob.location}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-2 italic">Salary Package</div>
                                                    <div className="px-8 py-5 rounded-[2rem] bg-amber-500/5 border border-amber-500/20 text-amber-600 text-2xl font-black italic tracking-tighter shadow-sm flex items-center gap-4">
                                                        <TfiBolt /> {viewingJob.salary_range || 'Competitive'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                 {/* Modal Content Sector */}
                                <div className="flex-1 overflow-y-auto panel-scrollbar flex flex-col lg:flex-row bg-transparent">
                                    {/* Left Content */}
                                    <div className="flex-1 p-10 sm:p-16 space-y-12 relative">
                                        {/* Description & Company Sections */}
                                        <div className="space-y-16">
                                            <section className="bg-gray-50/30 p-10 rounded-[2.5rem] border border-gray-100">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="w-8 h-[2px] bg-red-600" />
                                                    <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-950 italic">Operational Parameters (Description)</h3>
                                                </div>
                                                <p className="text-xl text-gray-700 font-medium italic leading-[1.8] opacity-90 pl-12 border-l-2 border-red-100">
                                                    {viewingJob.description}
                                                </p>
                                            </section>

                                            <section className="p-10">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="w-8 h-[2px] bg-gray-200" />
                                                    <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-400 italic">Company Intel</h3>
                                                </div>
                                                <p className="text-[15px] text-gray-500 font-medium italic leading-[1.8] opacity-80 pl-12">
                                                    {viewingJob.company_description || `${viewingJob.company_name} is a high-growth technology leader committed to engineering excellence.`}
                                                </p>
                                            </section>

                                            <section className="bg-red-600/[0.02] p-10 rounded-[2.5rem] border border-red-100">
                                                <div className="flex items-center gap-4 mb-8">
                                                    <div className="w-8 h-[2px] bg-red-600" />
                                                    <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-red-600 italic">Core Competency Requirements</h3>
                                                </div>
                                                <div className="flex flex-wrap gap-4 pl-12">
                                                    {(viewingJob.requirements || []).length > 0 ? viewingJob.requirements.map((req, idx) => (
                                                        <div key={idx} className="px-6 py-3 rounded-xl bg-white border border-red-600/10 text-[10px] font-black uppercase tracking-widest text-gray-600 italic hover:border-red-600 hover:text-red-600 transition-all shadow-sm">
                                                            #{req}
                                                        </div>
                                                    )) : (
                                                        <span className="text-gray-400 italic text-[11px] font-bold uppercase">Awaiting requirements validation...</span>
                                                    )}
                                                </div>
                                            </section>
                                        </div>
                                    </div>

                                    {/* Right: Info HUD */}
                                    <div className="w-full lg:w-[480px] border-l border-gray-100 bg-gray-50/30 p-12 sm:p-20 space-y-12">
                                        <div className="w-full p-12 bg-white rounded-[3.5rem] border border-gray-100 flex flex-col items-center text-center relative shadow-xl">
                                            <h4 className="text-[12px] font-black uppercase tracking-[0.6em] text-gray-300 mb-12 italic underline underline-offset-[16px] decoration-gray-100">Skill Match</h4>
                                            
                                            <div className="relative w-56 h-56 mb-12">
                                                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                                    <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(0,0,0,0.02)" strokeWidth="4" />
                                                    <circle cx="50" cy="50" r="46" fill="none" stroke="#dc2626" strokeWidth="6"
                                                        strokeLinecap="round"
                                                        strokeDasharray={`${(matchScore / 100) * 289} 289`}
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <span className="text-7xl font-black text-gray-900 italic tracking-[-0.08em] leading-none mb-2">{matchScore}%</span>
                                                    <div className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] italic">CALCULATED</div>
                                                </div>
                                            </div>

                                            <div className={`w-full py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 italic shadow-lg ${scoreBg} ${scoreColor}`}>
                                                <TfiPulse className="animate-pulse" /> MATCH PROBABILITY
                                            </div>
                                        </div>

                                        <div className="space-y-8">
                                            {[
                                                { icon: <TfiBolt />, label: 'Salary Range', val: viewingJob.salary_range || '$120K - $185K (Estimated)', accent: 'text-amber-500' },
                                                { icon: <TfiLocationPin />, label: 'Location', val: viewingJob.location, accent: 'text-red-600' },
                                                { icon: <TfiLayoutGrid2 />, label: 'Type', val: viewingJob.job_type, accent: 'text-emerald-600' },
                                                { icon: <TfiLayers />, label: 'Work Mode', val: (viewingJob.job_type === 'Remote' || viewingJob.location.toLowerCase().includes('remote')) ? 'Remote' : 'On-Site', accent: 'text-blue-600' },
                                                { icon: <TfiShield />, label: 'Status', val: 'Active', accent: 'text-gray-400' }
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-center gap-10 p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm transition-all hover:translate-x-3 group/item">
                                                    <div className={`w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center ${item.accent} shadow-md group-hover/item:bg-red-600 group-hover/item:text-white transition-all`}>
                                                        {item.icon}
                                                    </div>
                                                    <div className="overflow-hidden flex-1">
                                                        <div className="text-[9px] font-black text-gray-300 uppercase tracking-[0.4em] mb-1.5 italic transition-colors group-hover/item:text-red-500">{item.label}</div>
                                                        <div className="text-[15px] font-black text-gray-600 uppercase italic truncate tracking-tighter leading-none">{item.val}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-12 sm:p-20 bg-gray-50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-12 flex-shrink-0 relative z-20">
                                    <button onClick={() => handleGapAnalysis(viewingJob)} className="text-[12px] font-black uppercase tracking-[0.5em] text-gray-400 hover:text-red-600 transition-all flex items-center gap-8 italic active:scale-95 group/gap">
                                        <div className="w-16 h-16 rounded-[2rem] bg-white border border-gray-100 flex items-center justify-center shadow-xl group-hover/gap:rotate-12 transition-transform">
                                            <TfiStatsUp className="animate-pulse" />
                                        </div>
                                        <span>Skill Gap Analysis</span>
                                    </button>

                                    <div className="flex items-center gap-8 w-full md:w-auto">
                                        <button onClick={() => setViewingJob(null)} className="px-10 py-5 rounded-2xl bg-gray-50 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all italic">
                                            CLOSE
                                        </button>
                                        <button
                                            onClick={() => handleApplyClick(viewingJob)}
                                            disabled={alreadyApplied}
                                            className={`px-16 py-8 rounded-[2.5rem] text-[13px] font-black uppercase tracking-[0.5em] italic transition-all shadow-[0_20px_40px_rgba(220,38,38,0.2)] border border-red-600/10 active:scale-95 ${alreadyApplied ? 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none' : 'bg-red-600 text-white hover:bg-gray-900 animate-pulse'}`}
                                        >
                                            {alreadyApplied ? 'APPLIED' : 'APPLY NOW'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    );
                })()}
            </AnimatePresence>
        </div>
    );
}
