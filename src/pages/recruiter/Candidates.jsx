import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TfiTarget,
    TfiBolt,
    TfiShield,
    TfiClose,
    TfiCheck,
    TfiStatsUp,
    TfiReload,
    TfiLayers,
    TfiUser,
    TfiArrowRight
} from 'react-icons/tfi';
import reportService from '../../services/reportService';
import Loader from '../../components/Loader';
import { formatDateTime } from '../../utils/formatDate';
import { AI_EVALUATION_CRITERIA, RECOMMENDATION_MAP } from '../../constants';
import useFetch from '../../hooks/useFetch';
import '../../styles/hr.css';

const scoreColorClass = (score) => {
    if (score >= 80) return 'text-hr-red'; // Using brand red for high performers
    if (score >= 60) return 'text-hr-text-main';
    return 'text-hr-text-muted';
};

const scoreBgClass = (score) => {
    if (score >= 80) return 'bg-hr-red';
    if (score >= 60) return 'bg-hr-black';
    return 'bg-hr-border';
};

const recommendationStyle = (rec) => {
    const map = {
        strong_yes: 'hr-badge-active',
        yes: 'hr-badge-active',
        maybe: 'hr-badge-pending',
        no: 'hr-badge-red',
        strong_no: 'hr-badge-red',
    };
    return map[rec] || 'hr-badge-completed';
};

export default function Candidates() {
    const navigate = useNavigate();
    const { data: evaluationsData, loading } = useFetch(reportService.listEvaluations);
    const evaluations = Array.isArray(evaluationsData) ? evaluationsData : (evaluationsData?.results || []);
    const [selected, setSelected] = useState(null);
    const [hrNotes, setHrNotes] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');

    const handleSaveNotes = async () => {
        setSaving(true);
        try {
            await reportService.addHrNotes(selected.id, hrNotes);
            setSaveMsg('✅ HR notes saved.');
            setTimeout(() => setSaveMsg(''), 3000);
        } catch {
            setSaveMsg('❌ Save failed. Try again.');
            setTimeout(() => setSaveMsg(''), 3000);
        }
        setSaving(false);
    };

    const openModal = (ev) => {
        setSelected(ev);
        setHrNotes(ev.hr_notes || '');
        setSaveMsg('');
    };

    if (loading) return <Loader text="Loading candidate database..." />;

    return (
        <div className="hr-content">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                    <h1 className="hr-heading">Talent Repository</h1>
                    <p className="hr-subheading mt-2">Evaluation Database · AI Performance Index</p>
                </div>
                <div className="px-6 py-3 bg-gray-900 text-white rounded-xl shadow-lg border border-red-600/20">
                    <span className="text-xs font-black uppercase tracking-widest flex items-center gap-3">
                        Total Assessments <span className="text-red-600 text-xl font-black">{evaluations.length}</span>
                    </span>
                </div>
            </div>

            {evaluations.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hr-card p-20 text-center border-dashed border-2 border-hr-border bg-hr-bg/30"
                >
                    <TfiLayers className="text-6xl text-hr-border mx-auto mb-6" />
                    <h3 className="hr-subheading mb-2">No Evaluations Found</h3>
                    <p className="text-xs text-hr-text-muted italic">Complete an interview session and trigger an AI assessment to populate this list.</p>
                </motion.div>
            ) : (
                 <div className="hr-grid md:space-y-0 space-y-6">
                    {evaluations.map((ev, idx) => (
                        <motion.div
                            key={ev.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="col-12 hr-card p-10 flex flex-col md:flex-row items-center gap-10 group"
                        >
                            {/* Candidate Avatar */}
                            <div className="w-20 h-20 rounded-[2rem] bg-hr-black text-hr-red border border-hr-red/20 flex items-center justify-center text-3xl font-black italic shadow-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                                <TfiUser />
                            </div>

                            {/* Info Block */}
                            <div className="flex-1 min-w-0 text-center md:text-left">
                                <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                                    <span className="font-black text-hr-text-main uppercase italic tracking-tighter text-2xl">
                                        ASSESSMENT #{ev.id?.slice(-8).toUpperCase() || 'N/A'}
                                    </span>
                                    {ev.reviewed_by_hr && (
                                        <span className="hr-badge hr-badge-active flex items-center gap-2 py-2 px-4 shadow-lg border border-hr-red/20">
                                            <TfiCheck className="text-[12px]" /> REVIEWED ASSESSMENT
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-center md:justify-start gap-4">
                                    <div className="hr-subheading text-[11px] text-hr-red font-black uppercase tracking-widest flex items-center gap-2">
                                        <TfiReload className="text-[10px]" /> {formatDateTime(ev.created_at)}
                                    </div>
                                    <span className="w-1.5 h-1.5 rounded-full bg-hr-border" />
                                    <div className="text-[10px] font-black text-hr-text-muted uppercase tracking-[0.2em]">AI Analysis Complete</div>
                                </div>

                                {/* Dynamic Skill Bars */}
                                {ev.criterion_results?.length > 0 && (
                                    <div className="flex flex-wrap justify-center md:justify-start gap-8 mt-6 pt-6 border-t border-hr-border">
                                        {ev.criterion_results.slice(0, 3).map((cr, cIdx) => (
                                            <div key={cIdx} className="flex items-center gap-4 group/skill">
                                                <span className="text-[10px] text-hr-text-muted font-black uppercase tracking-widest group-hover/skill:text-hr-red transition-colors">
                                                    {AI_EVALUATION_CRITERIA?.[cr.criterion] || cr.criterion}
                                                </span>
                                                <div className="w-24 h-1.5 bg-hr-bg rounded-full overflow-hidden shadow-inner">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${cr.score * 10}%` }}
                                                        className={`h-full rounded-full ${scoreBgClass(cr.score * 10)} shadow-[0_0_10px_rgba(230,57,70,0.3)]`}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-black text-hr-text-main italic">{cr.score}<span className="text-hr-text-muted text-[8px] italic opacity-50">/10</span></span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Main Score Area */}
                            <div className="flex flex-col items-center gap-2 px-10 border-l border-r border-hr-border bg-hr-bg/20 py-6 rounded-3xl mx-4">
                                <span className={`text-5xl font-black italic tracking-tighter ${scoreColorClass(ev.overall_score)}`}>
                                    {ev.overall_score ?? '—'}%
                                </span>
                                <span className="hr-stat-label mt-0 text-[10px] opacity-70">AI Score Index</span>
                                {ev.overall_score && (
                                    <div className="w-24 h-1.5 bg-white rounded-full overflow-hidden mt-3 shadow-inner">
                                        <div className={`h-full ${scoreBgClass(ev.overall_score)} shadow-[0_0_15px_rgba(230,57,70,0.4)]`} style={{ width: `${ev.overall_score}%` }} />
                                    </div>
                                )}
                            </div>

                            {/* Recommendation Area */}
                            <div className="px-8 flex flex-col items-center gap-4">
                                {ev.recommendation && (
                                    <span className={`hr-badge ${recommendationStyle(ev.recommendation)} py-3 px-6 text-[10px] shadow-xl border border-hr-border group-hover:border-hr-red/20 transition-all`}>
                                        {RECOMMENDATION_MAP?.[ev.recommendation]?.label || ev.recommendation.replace('_', ' ').toUpperCase()}
                                    </span>
                                )}
                                <div className="flex items-center gap-4 mt-2">
                                    <button
                                        onClick={() => navigate(`/recruiter/evaluations/${ev.id}`)}
                                        className="btn-hr-secondary py-3 px-8 text-[11px] shadow-xl group/btn"
                                    >
                                        REPORT <TfiArrowRight className="ml-2 group-hover/btn:translate-x-2 transition-transform" />
                                    </button>
                                    <button
                                        onClick={() => openModal(ev)}
                                        className="btn-hr-primary py-3 px-8 text-[11px] shadow-2xl shadow-hr-red/20"
                                    >
                                        <TfiBolt /> AI ANALYSIS
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* AI Analysis Modal */}
            <AnimatePresence>
                {selected && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-hr-black/90 backdrop-blur-xl"
                        onClick={(e) => e.target === e.currentTarget && setSelected(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="w-full max-w-2xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col border border-hr-border"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-10 py-8 border-b border-hr-border bg-hr-bg/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-hr-black text-hr-red flex items-center justify-center shadow-lg">
                                        <TfiTarget className="text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="hr-heading text-lg">AI Evaluation Summary</h3>
                                        <p className="hr-subheading text-[10px]">Assessment #{selected.id?.slice(-8)}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelected(null)} className="w-10 h-10 rounded-xl bg-hr-black text-white flex items-center justify-center hover:bg-hr-red transition-all">
                                    <TfiClose />
                                </button>
                            </div>

                            <div className="overflow-y-auto flex-1 p-10 space-y-8">
                                {/* Overall score */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center p-10 bg-white rounded-[2.5rem] shadow-2xl border-2 border-red-50 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/[0.03] blur-[40px] pointer-events-none" />
                                    <div className="text-center relative">
                                        <div className="text-6xl font-black italic text-red-600 tracking-tighter mb-2 group-hover:scale-110 transition-transform duration-500">
                                            {selected.overall_score ?? '—'}%
                                        </div>
                                        <div className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] italic mb-1">OVERALL MATCH</div>
                                        <div className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 inline-block">AI VERIFIED</div>
                                    </div>
                                    <div className="md:col-span-2 space-y-6 relative">
                                        <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden shadow-inner border border-gray-100 flex items-center">
                                            <div className="h-full bg-red-600 shadow-[0_0_20px_rgba(230,57,70,0.4)] transition-all duration-1000" style={{ width: `${selected.overall_score || 0}%` }} />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            {selected.recommendation && (
                                                <span className={`hr-badge ${recommendationStyle(selected.recommendation)} py-2 px-5 text-[9px] shadow-sm border border-gray-100`}>
                                                    {RECOMMENDATION_MAP?.[selected.recommendation]?.label || selected.recommendation.replace('_', ' ')}
                                                </span>
                                            )}
                                        </div>
                                        {selected.summary && (
                                            <div className="p-5 bg-gray-50/50 rounded-2xl border-l-4 border-red-600 group-hover:bg-white transition-colors">
                                                <p className="text-[11px] text-gray-500 italic leading-relaxed font-medium">"{selected.summary}"</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Criteria breakdown */}
                                {selected.criterion_results?.length > 0 && (
                                    <div className="space-y-6">
                                        <h4 className="hr-subheading flex items-center gap-3">
                                            <TfiBolt className="text-hr-red" /> Skill Breakdown Analysis
                                        </h4>
                                        <div className="grid grid-cols-1 gap-4">
                                            {selected.criterion_results.map((cr, idx) => (
                                                <div key={idx} className="p-6 bg-hr-bg rounded-2xl border border-hr-border group hover:border-hr-red/20 transition-all">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="text-xs font-black text-hr-text-main uppercase italic">
                                                            {AI_EVALUATION_CRITERIA?.[cr.criterion] || cr.criterion}
                                                        </span>
                                                        <span className={`text-md font-black italic ${scoreColorClass(cr.score * 10)}`}>{cr.score}<span className="text-[10px] text-hr-text-muted">/10</span></span>
                                                    </div>
                                                    <div className="w-full h-1 bg-white rounded-full overflow-hidden mb-3">
                                                        <div className={`h-full ${scoreBgClass(cr.score * 10)}`} style={{ width: `${cr.score * 10}%` }} />
                                                    </div>
                                                    {cr.explanation && (
                                                        <p className="text-[11px] text-hr-text-muted italic leading-relaxed">{cr.explanation}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* HR Notes */}
                                <div>
                                    <h4 className="hr-subheading mb-4">Assessment Notes</h4>
                                    <textarea
                                        className="hr-input h-32"
                                        value={hrNotes}
                                        onChange={(e) => setHrNotes(e.target.value)}
                                        placeholder="Add assessment reviews and notes..."
                                    />
                                    {saveMsg && (
                                        <p className="text-[10px] font-black uppercase tracking-widest mt-2 text-hr-red italic">{saveMsg}</p>
                                    )}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-10 pb-8 pt-4 flex gap-4 bg-hr-bg/30">
                                <button
                                    onClick={() => setSelected(null)}
                                    className="btn-hr-secondary flex-1"
                                >
                                    CLOSE
                                </button>
                                <button
                                    onClick={handleSaveNotes}
                                    disabled={saving}
                                    className="btn-hr-primary flex-1"
                                >
                                    {saving ? <TfiReload className="animate-spin" /> : <TfiCheck />} {saving ? 'SAVING...' : 'SAVE NOTES'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
