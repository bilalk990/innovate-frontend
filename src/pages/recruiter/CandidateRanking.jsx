import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
    TfiStatsUp,
    TfiUser,
    TfiSearch,
    TfiArrowRight,
    TfiBolt,
    TfiClose,
    TfiCheck,
    TfiReload,
    TfiAlert,
} from 'react-icons/tfi';
import useFetch from '../../hooks/useFetch';
import jobService from '../../services/jobService';
import evaluationService from '../../services/evaluationService';
import useAuth from '../../hooks/useAuth';
import Loader from '../../components/Loader';
import '../../styles/hr.css';

const HIRE_SIGNAL_STYLES = {
    'Strong Hire': 'hr-badge-active',
    'Hire': 'hr-badge-active',
    'Maybe': 'hr-badge-pending',
    'No Hire': 'hr-badge-red',
};

const RANK_BADGE = ['🥇', '🥈', '🥉'];

export default function CandidateRanking() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const listJobs = useCallback(() => jobService.list(), []);
    const { data: jobs, loading: jobsLoading } = useFetch(listJobs);

    const [selectedJobId, setSelectedJobId] = useState('');
    const [rankData, setRankData] = useState(null);
    const [rankLoading, setRankLoading] = useState(false);

    const handleRank = async () => {
        if (!selectedJobId) return toast.error('Please select a job to rank candidates.');
        
        setRankLoading(true);
        setRankData(null);
        
        try {
            const res = await evaluationService.rankCandidates(selectedJobId);
            setRankData(res.data);
            toast.success('AI Ranking synthesis complete.');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Ranking failed. Please try again.');
        } finally {
            setRankLoading(false);
        }
    };

    if (jobsLoading) return <Loader fullScreen text="Loading AI Ranking Engine..." />;

    return (
        <div className="hr-content">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
                <div>
                    <h1 className="hr-heading">Candidate Ranking</h1>
                    <p className="hr-subheading mt-2">AI Analysis Engine · Multi-Factor Analysis</p>
                </div>
                <button onClick={() => navigate('/recruiter/dashboard')} className="btn-hr-secondary py-3 px-8 text-[10px]">
                    ← DASHBOARD
                </button>
            </div>

            {/* Job Selector */}
            <div className="hr-card p-10 mb-10">
                <h3 className="hr-subheading mb-8 flex items-center gap-4">
                    <TfiSearch className="text-hr-red" /> Select Job Opening
                </h3>
                <div className="flex flex-col md:flex-row gap-6">
                    <select
                        className="hr-input flex-1 italic font-black uppercase text-xs py-4"
                        value={selectedJobId}
                        onChange={e => setSelectedJobId(e.target.value)}
                    >
                        <option value="">SELECT JOB OPENING...</option>
                        {(jobs || []).map(j => (
                            <option key={j.id} value={j.id}>{(j.title || 'Untitled').toUpperCase()} — {j.company_name?.toUpperCase() || 'INTERNAL'}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleRank}
                        disabled={rankLoading || !selectedJobId}
                        className="btn-hr-primary py-4 px-12 group transition-all"
                    >
                        {rankLoading ? <TfiReload className="animate-spin" /> : <TfiBolt />}
                        {rankLoading ? 'ANALYZING...' : 'RANK CANDIDATES'}
                    </button>
                </div>
            </div>


            {/* Ranking Results */}
            {rankData && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                    {/* Summary Intelligence */}
                    <div className="p-12 bg-white text-gray-950 rounded-[3rem] shadow-2xl border-2 border-red-50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/[0.02] blur-[80px] pointer-events-none" />
                        <div className="flex flex-col md:flex-row items-center gap-12 relative">
                            <div className="w-20 h-20 rounded-3xl bg-gray-950 text-red-600 flex items-center justify-center text-4xl shadow-2xl shadow-red-600/10 group-hover:scale-110 transition-transform duration-500">
                                <TfiStatsUp className="animate-pulse" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-gray-950 mb-3">AI Intelligence Matrix</h2>
                                <p className="text-[11px] text-gray-500 italic leading-relaxed border-l-4 border-red-600 pl-6 mb-8 font-medium">"{rankData.ranking_rationale}"</p>
                                {rankData.top_recommendation && (
                                    <div className="p-6 bg-red-50 rounded-2xl border-2 border-red-100 shadow-sm">
                                        <p className="text-[9px] font-black uppercase text-red-600 tracking-[0.4em] mb-2 italic">Prime Operative Recommendation</p>
                                        <p className="text-[12px] text-gray-950 italic font-black leading-relaxed">"{rankData.top_recommendation}"</p>
                                    </div>
                                )}
                            </div>
                            <div className="text-center md:text-right flex flex-col items-center md:items-end flex-shrink-0">
                                <div className="text-7xl font-black italic text-red-600 leading-none tracking-tighter">{(rankData.ranked || []).length}</div>
                                <div className="text-[9px] font-black text-gray-400 uppercase tracking-[0.5em] mt-3 italic">Vectors Analyzed</div>
                            </div>
                        </div>
                    </div>

                    {/* Ranked List */}
                    {(rankData.ranked || []).length === 0 ? (
                        <div className="text-center py-24 hr-card border-none bg-hr-bg/30">
                            <TfiUser className="text-6xl text-hr-border mx-auto mb-6 animate-pulse" />
                            <h3 className="hr-heading text-lg">No Evaluations Found</h3>
                            <p className="hr-subheading text-[10px] mt-2 italic">Complete interview sessions for this job to generate ranking report.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {(rankData.ranked || []).map((candidate, i) => (
                                <motion.div
                                    key={candidate.candidate_id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    className={`hr-card p-10 group relative transition-all ${i === 0 ? 'border-hr-red shadow-2xl' : 'hover:border-hr-red/20'}`}
                                >
                                    <div className="flex flex-col md:flex-row items-center gap-10">
                                        {/* Rank Badge */}
                                        <div className="text-4xl flex-shrink-0 grayscale group-hover:grayscale-0 transition-all">
                                            {RANK_BADGE[i] || <span className="text-2xl font-black text-hr-border italic shadow-sm">#{candidate.rank}</span>}
                                        </div>

                                        {/* Avatar */}
                                        <div className="w-16 h-16 rounded-2xl bg-hr-black text-hr-red flex items-center justify-center text-2xl font-black italic shadow-xl flex-shrink-0 group-hover:scale-110 transition-all">
                                            {candidate.name?.charAt(0) || 'C'}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-6 mb-4 flex-wrap">
                                                <h3 className="text-xl font-black text-hr-text-main uppercase italic tracking-tight truncate">{candidate.name}</h3>
                                                <span className={`hr-badge ${HIRE_SIGNAL_STYLES[candidate.hire_signal] || 'hr-badge-completed'}`}>
                                                    {candidate.hire_signal?.toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-hr-text-muted italic mb-6 leading-relaxed line-clamp-2 md:line-clamp-none">"{candidate.rank_reason}"</p>

                                            <div className="flex flex-col md:flex-row gap-8 items-end md:items-center">
                                                {/* Score Bar */}
                                                <div className="flex-1 w-full">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-[10px] font-black text-hr-text-muted uppercase tracking-widest italic">Overall Candidate Score</span>
                                                        <span className="text-lg font-black italic text-hr-text-main">{candidate.composite_score?.toFixed(1)}%</span>
                                                    </div>
                                                    <div className="h-2 bg-hr-bg rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${candidate.composite_score}%` }}
                                                            transition={{ duration: 1, delay: i * 0.2 }}
                                                            className="h-full bg-hr-red shadow-[0_0_10px_rgba(230,57,70,0.5)]"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Strengths */}
                                                {candidate.key_strengths?.length > 0 && (
                                                    <div className="flex-shrink-0">
                                                        <div className="flex gap-2 flex-wrap justify-end">
                                                            {candidate.key_strengths.slice(0, 2).map((s, si) => (
                                                                <span key={si} className="hr-badge hr-badge-active text-[9px] py-1.5 px-4"><TfiCheck className="text-white mr-2" /> {s.toUpperCase()}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* View Report Button */}
                                        {candidate.eval_id && (
                                            <button
                                                onClick={() => navigate(`/recruiter/evaluations/${candidate.eval_id}`)}
                                                className="btn-hr-secondary py-3 px-6 text-[10px] whitespace-nowrap"
                                            >
                                                VIEW REPORT <TfiArrowRight className="ml-2" />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}
