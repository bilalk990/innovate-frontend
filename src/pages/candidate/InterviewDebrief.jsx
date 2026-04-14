import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
    TfiLightBulb,
    TfiCheck,
    TfiClose,
    TfiStatsUp,
    TfiUser,
    TfiShield,
    TfiBolt,
    TfiArrowRight,
    TfiAlert,
    TfiDownload,
    TfiReload,
} from 'react-icons/tfi';
import useFetch from '../../hooks/useFetch';
import evaluationService from '../../services/evaluationService';
import Loader from '../../components/Loader';

const TIER_STYLES = {
    Exceptional: 'text-green-700 bg-green-50 border-green-300',
    Strong: 'text-blue-700 bg-blue-50 border-blue-300',
    Developing: 'text-yellow-700 bg-yellow-50 border-yellow-300',
    'Needs Work': 'text-red-700 bg-red-50 border-red-300',
};

export default function InterviewDebrief() {
    const { evalId } = useParams();
    const navigate = useNavigate();

    const fetchDebrief = useCallback(() => evaluationService.getDebrief(evalId), [evalId]);
    const { data: debrief, loading, error } = useFetch(fetchDebrief);
    const [downloading, setDownloading] = useState(false);

    const handleDownloadPDF = async () => {
        if (downloading) return;
        setDownloading(true);
        try {
            const response = await evaluationService.exportPDF(evalId);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const fileName = `Interview_Debrief_${debrief?.candidate_name?.replace(/\s+/g, '_') || evalId}.pdf`;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            toast.success('Report downloaded successfully!');
        } catch (err) {
            toast.error('Failed to generate PDF. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    if (loading) return <Loader fullScreen text="Generating Your Debrief..." />;

    if (error) {
        return (
            <div className="elite-content flex flex-col items-center justify-center py-32">
                <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 text-3xl mb-6">
                    <TfiAlert />
                </div>
                <h2 className="text-xl font-black uppercase italic text-gray-900 mb-2">Debrief Unavailable</h2>
                <p className="text-gray-400 text-sm italic text-center max-w-md">
                    {error?.response?.data?.error || 'Your recruiter has not yet released this debrief, or it is not available.'}
                </p>
                <button onClick={() => navigate('/candidate/dashboard')} className="btn-elite btn-elite-primary px-8 py-4 text-[10px] font-black uppercase mt-8">
                    Back to Dashboard
                </button>
            </div>
        );
    }

    if (!debrief) return null;

    return (
        <div className="elite-content max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-12">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight italic uppercase">Interview Debrief</h1>
                    <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-[10px] mt-2">AI-Powered Coaching Report · Personalized</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={handleDownloadPDF} 
                        disabled={downloading}
                        className="btn-elite btn-elite-primary px-6 py-3 text-[10px] font-black uppercase flex items-center gap-2"
                    >
                        {downloading ? <TfiReload className="animate-spin" /> : <TfiDownload />}
                        {downloading ? 'Generating...' : 'Download Report'}
                    </button>
                    <button onClick={() => navigate('/candidate/ai-insights')} className="btn-elite btn-elite-outline px-6 py-3 text-[10px] font-black uppercase">← Insights</button>
                </div>
            </div>

            {/* Headline Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <div className="p-8 bg-black rounded-3xl text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[100px]" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center text-2xl shadow-xl shadow-red-500/30">
                                <TfiLightBulb />
                            </div>
                            <div>
                                <h2 className="text-lg font-black italic uppercase">{debrief?.headline || 'Performance Summary'}</h2>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Candidate: {debrief?.candidate_name || 'You'}</p>
                            </div>
                            <span className={`ml-auto px-4 py-2 rounded-xl text-sm font-black border ${TIER_STYLES[debrief.performance_tier] || 'bg-gray-800 text-gray-300 border-gray-700'}`}>
                                {debrief.performance_tier}
                            </span>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed italic">{debrief.executive_summary}</p>
                    </div>
                </div>
            </motion.div>

            {/* Skill Scores */}
            {debrief.skill_scores?.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="elite-card p-8 border-none shadow-xl rounded-3xl mb-6">
                    <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-6 flex items-center gap-2">
                        <TfiStatsUp className="text-red-600" /> Skill Performance Breakdown
                    </h3>
                    <div className="space-y-4">
                        {debrief.skill_scores.map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-xs font-bold mb-1">
                                    <span className="text-gray-700 uppercase">{item.skill}</span>
                                    <span className="text-gray-500">{item.score}%</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.score}%` }}
                                        transition={{ duration: 0.7, delay: i * 0.05 }}
                                        className={`h-full rounded-full ${item.score >= 70 ? 'bg-green-500' : item.score >= 45 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                    />
                                </div>
                                {item.feedback && <p className="text-[10px] text-gray-400 italic mt-1">{item.feedback}</p>}
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Top Strengths */}
                {debrief.top_strengths?.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="elite-card p-6 border-none shadow-xl rounded-3xl">
                        <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4 flex items-center gap-2">
                            <TfiCheck className="text-green-600" /> Top Strengths
                        </h3>
                        <div className="space-y-3">
                            {debrief.top_strengths.slice(0, 3).map((item, i) => (
                                <div key={i} className="p-3 bg-green-50 border border-green-100 rounded-xl">
                                    <p className="text-xs font-black text-green-800 uppercase mb-1">{item.title}</p>
                                    {item.detail && <p className="text-[10px] text-green-700 italic">{item.detail}</p>}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Improvement Areas */}
                {debrief.improvement_areas?.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="elite-card p-6 border-none shadow-xl rounded-3xl">
                        <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4 flex items-center gap-2">
                            <TfiAlert className="text-yellow-500" /> Areas to Improve
                        </h3>
                        <div className="space-y-3">
                            {debrief.improvement_areas.slice(0, 3).map((item, i) => (
                                <div key={i} className="p-3 bg-yellow-50 border border-yellow-100 rounded-xl">
                                    <p className="text-xs font-black text-yellow-800 uppercase mb-1">{item.title}</p>
                                    {item.action && <p className="text-[10px] text-yellow-700 italic">→ {item.action}</p>}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Next Steps */}
            {debrief.next_steps?.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="elite-card p-8 border-none shadow-xl rounded-3xl mb-6">
                    <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-6 flex items-center gap-2">
                        <TfiArrowRight className="text-red-600" /> Your Next Steps
                    </h3>
                    <div className="space-y-3">
                        {debrief.next_steps.map((step, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                                <span className="w-6 h-6 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-black flex-shrink-0 mt-0.5">{i + 1}</span>
                                <p className="text-sm text-gray-700 italic">{step}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Recommended Resources */}
            {debrief.recommended_resources?.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="elite-card p-8 border-none shadow-xl rounded-3xl mb-6">
                    <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4 flex items-center gap-2">
                        <TfiLightBulb className="text-yellow-500" /> Recommended Resources
                    </h3>
                    <ul className="space-y-2">
                        {debrief.recommended_resources.map((r, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm text-gray-600 italic">
                                <span className="w-2 h-2 rounded-full bg-red-600 flex-shrink-0" />
                                {r}
                            </li>
                        ))}
                    </ul>
                </motion.div>
            )}

            {/* Motivational Note */}
            {debrief.motivational_note && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="p-8 bg-red-600 rounded-3xl text-white text-center">
                    <TfiBolt className="text-3xl mx-auto mb-4 animate-pulse" />
                    <p className="text-lg font-black italic leading-relaxed">"{debrief.motivational_note}"</p>
                </motion.div>
            )}

            <div className="mt-10 flex gap-4">
                <button onClick={() => navigate('/candidate/jobs')} className="btn-elite btn-elite-outline flex-1 py-5 text-[10px] font-black uppercase">
                    Browse More Jobs
                </button>
                <button onClick={() => navigate('/candidate/dashboard')} className="btn-elite btn-elite-primary flex-1 py-5 text-[10px] font-black uppercase">
                    Dashboard <TfiArrowRight className="ml-2" />
                </button>
            </div>
        </div>
    );
}
