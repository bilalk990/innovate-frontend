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
    'Strong Hire': 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-600/5',
    'Hire': 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-600/5',
    'Maybe': 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-600/5',
    'No Hire': 'bg-red-50 text-red-600 border-red-100 shadow-red-600/5',
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
        <div className="min-h-screen bg-white text-gray-950 p-8">
            <div className="max-w-6xl mx-auto space-y-12 pb-20">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
                    <div className="text-left">
                        <h1 className="text-6xl font-black italic uppercase tracking-tighter text-gray-950 leading-none">
                            CANDIDATE <span className="text-red-600 underline decoration-red-600/20 underline-offset-8">RANKING</span>
                        </h1>
                        <p className="text-gray-400 text-[10px] mt-6 font-black uppercase tracking-[0.4em] italic">AI Neural Analysis Engine · Multi-Factor Talent Alignment</p>
                    </div>
                    <button onClick={() => navigate('/recruiter/dashboard')} className="px-10 py-5 rounded-[2rem] border-2 border-gray-100 text-[10px] font-black uppercase text-gray-400 hover:text-gray-950 hover:bg-gray-50 transition-all italic tracking-[0.4em] active:scale-95 shadow-lg">
                        ← RETURN TO COMMAND
                    </button>
                </div>

                {/* Job Selector Panel */}
                <div className="bg-gray-950 border-4 border-red-600/20 rounded-[4rem] p-16 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-full h-full bg-red-600/[0.05] blur-[120px] pointer-events-none" />
                    <div className="relative z-10 space-y-10">
                        <div className="text-[11px] font-black uppercase tracking-[0.6em] text-red-500 italic underline decoration-red-900 underline-offset-8">TARGET SECTOR PARAMETERS</div>
                        <div className="flex flex-col md:flex-row gap-8 items-end">
                            <div className="flex-1 space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 italic ml-6">Designation Identification *</label>
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-10 py-6 text-sm text-white font-black italic uppercase focus:outline-none focus:border-red-600/50 appearance-none shadow-inner"
                                    value={selectedJobId}
                                    onChange={e => setSelectedJobId(e.target.value)}
                                >
                                    <option value="" className="bg-gray-900 text-gray-500">SELECT TARGET DESIGNATION...</option>
                                    {(jobs || []).map(j => (
                                        <option key={j.id} value={j.id} className="bg-gray-900">{(j.title || 'Untitled').toUpperCase()} — {j.company_name?.toUpperCase() || 'INTERNAL'}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={handleRank}
                                disabled={rankLoading || !selectedJobId}
                                className="px-16 py-7 bg-red-600 hover:bg-red-700 disabled:opacity-30 rounded-[2.5rem] font-black uppercase tracking-[0.5em] text-[11px] text-white transition-all duration-500 flex items-center justify-center gap-4 shadow-[0_20px_40px_-10px_rgba(220,38,38,0.3)] active:scale-[0.98] group"
                            >
                                {rankLoading ? <TfiReload className="animate-spin text-xl" /> : <TfiBolt className="text-xl group-hover:scale-125 transition-transform" />}
                                {rankLoading ? 'SYNTHESIZING...' : 'INITIALIZE RANKING'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Ranking Synthesis Results */}
                <AnimatePresence>
                    {rankData && (
                        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                            
                            {/* Summary Intelligence Matrix */}
                            <div className="bg-white border-2 border-gray-50 rounded-[4rem] p-16 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-full h-full bg-red-600/[0.01] blur-[120px] pointer-events-none" />
                                <div className="flex flex-col lg:flex-row items-center gap-16 relative z-10">
                                    <div className="w-40 h-40 rounded-[3rem] bg-gray-950 text-red-600 flex items-center justify-center text-6xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] group-hover:rotate-12 transition-transform duration-700">
                                        <TfiStatsUp className="animate-pulse" />
                                    </div>
                                    <div className="flex-1 text-center lg:text-left space-y-8 border-l-2 border-gray-100 lg:pl-16">
                                        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-gray-950 leading-none">AI INTELLIGENCE <span className="text-red-600">MATRIX</span></h2>
                                        <p className="text-xl text-gray-400 font-black italic uppercase leading-tight tracking-tight">"{rankData.ranking_rationale}"</p>
                                        {rankData.top_recommendation && (
                                            <div className="p-10 bg-gray-50 rounded-[3rem] border-2 border-gray-100 relative group/insight overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/[0.03] blur-3xl" />
                                                <div className="text-[10px] font-black uppercase text-red-600 tracking-[0.6em] mb-4 italic underline decoration-red-100 underline-offset-8">PRIME RECOMMENDATION</div>
                                                <p className="text-lg text-gray-950 italic font-black leading-relaxed uppercase tracking-tight">"{rankData.top_recommendation}"</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-center lg:text-right flex flex-col items-center lg:items-end flex-shrink-0 lg:border-l-2 lg:border-gray-100 lg:pl-16">
                                        <div className="text-[120px] font-black italic text-red-600 leading-none tracking-tighter group-hover:scale-110 transition-transform duration-700">{(rankData.ranked || []).length}</div>
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.6em] mt-4 italic">VECTORS ANALYZED</div>
                                    </div>
                                </div>
                            </div>

                            {/* Ranked Feed */}
                            <div className="space-y-8">
                                <div className="text-[11px] font-black uppercase tracking-[0.6em] text-gray-400 italic text-center underline decoration-red-600/20 underline-offset-8 mb-12">NEURAL RANKING PROTOCOL</div>
                                {(rankData.ranked || []).length === 0 ? (
                                    <div className="text-center py-32 bg-gray-50 border-4 border-dashed border-gray-100 rounded-[4rem]">
                                        <TfiUser className="text-8xl text-gray-200 mx-auto mb-8 animate-pulse" />
                                        <h3 className="text-2xl font-black italic uppercase text-gray-400 tracking-tighter">NO EVALUATIONS DETECTED</h3>
                                        <p className="text-[10px] font-black uppercase text-gray-300 tracking-widest mt-4">COMPLETE INTERVIEW SESSIONS TO ACTIVATE NEURAL RANKING.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        {(rankData.ranked || []).map((candidate, i) => (
                                            <motion.div
                                                key={candidate.candidate_id}
                                                initial={{ opacity: 0, x: -40 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className={`bg-white border-2 rounded-[4rem] p-12 group relative transition-all duration-500 shadow-2xl hover:border-red-600/20 overflow-hidden ${i === 0 ? 'border-red-600/30 ring-4 ring-red-600/5' : 'border-gray-50'}`}
                                            >
                                                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/[0.01] blur-[80px] pointer-events-none" />
                                                <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10">
                                                    {/* Rank Indicator */}
                                                    <div className="text-6xl flex-shrink-0 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
                                                        {RANK_BADGE[i] || <span className="text-5xl font-black text-gray-200 italic tracking-tighter">#{candidate.rank}</span>}
                                                    </div>

                                                    {/* Operative Avatar */}
                                                    <div className="w-24 h-24 rounded-[2.5rem] bg-gray-950 text-white flex items-center justify-center text-4xl font-black italic shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] flex-shrink-0 group-hover:rotate-12 transition-transform duration-500 border-2 border-white/10">
                                                        {candidate.name?.charAt(0).toUpperCase() || 'C'}
                                                    </div>

                                                    {/* Operational Intel */}
                                                    <div className="flex-1 min-w-0 space-y-6 text-center lg:text-left">
                                                        <div className="flex flex-col lg:flex-row items-center gap-8 mb-2">
                                                            <h3 className="text-4xl font-black text-gray-950 uppercase italic tracking-tighter leading-none">{candidate.name}</h3>
                                                            {(() => {
                                                                const score = candidate.match_score || 0;
                                                                const signal = score >= 80 ? 'Strong Hire' : score >= 60 ? 'Hire' : score >= 40 ? 'Maybe' : 'No Hire';
                                                                return (
                                                                    <span className={`px-10 py-3 rounded-full text-[10px] font-black uppercase italic tracking-[0.4em] border-2 shadow-lg transition-all duration-500 ${HIRE_SIGNAL_STYLES[signal] || 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                                                                        {signal.toUpperCase()}
                                                                    </span>
                                                                );
                                                            })()}
                                                        </div>
                                                        <p className="text-lg text-gray-400 font-black italic uppercase leading-tight tracking-tight">"{candidate.reasoning}"</p>

                                                        <div className="flex flex-col lg:flex-row gap-12 items-end lg:items-center pt-4">
                                                            {/* Performance Vector Bar */}
                                                            <div className="flex-1 w-full">
                                                                <div className="flex justify-between items-end mb-4">
                                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic">NEURAL MATCH VECTOR</span>
                                                                    <span className="text-5xl font-black italic tracking-tighter text-gray-950 leading-none">{candidate.match_score?.toFixed(1)}%</span>
                                                                </div>
                                                                <div className="h-4 bg-gray-50 rounded-full overflow-hidden shadow-inner border border-gray-100 flex items-center">
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${candidate.match_score}%` }}
                                                                        transition={{ duration: 1.5, delay: i * 0.2 }}
                                                                        className="h-full bg-red-600 shadow-[0_0_20px_rgba(230,57,70,0.3)] rounded-full"
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Elite Strengths */}
                                                            {candidate.strengths?.length > 0 && (
                                                                <div className="flex-shrink-0 flex flex-wrap gap-3 justify-center lg:justify-end">
                                                                    {candidate.strengths.slice(0, 3).map((s, si) => (
                                                                        <span key={si} className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-black uppercase italic tracking-widest py-2 px-6 rounded-full shadow-sm hover:bg-white transition-all">
                                                                            <TfiCheck className="inline mr-2" /> {s.toUpperCase()}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Detailed Intel Link */}
                                                    {candidate.eval_id && (
                                                        <button
                                                            onClick={() => navigate(`/recruiter/evaluations/${candidate.eval_id}`)}
                                                            className="px-10 py-5 rounded-[2rem] border-2 border-gray-950 text-[10px] font-black uppercase text-gray-950 hover:bg-gray-950 hover:text-white transition-all italic tracking-[0.3em] active:scale-95 shadow-xl flex items-center gap-4 flex-shrink-0 group/btn"
                                                        >
                                                            ACCESS INTEL <TfiArrowRight className="text-lg group-hover/btn:translate-x-2 transition-transform" />
                                                        </button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
