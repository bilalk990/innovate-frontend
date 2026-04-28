import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TfiReload, TfiTarget, TfiShield, TfiStatsUp } from 'react-icons/tfi';
import { toast } from 'sonner';
import hrService from '../../services/hrService';
import interviewService from '../../services/interviewService';

const SCORE_COLOR = (s) => s >= 80 ? 'text-emerald-400' : s >= 60 ? 'text-amber-400' : 'text-red-400';
const SCORE_BG = (s) => s >= 80 ? 'bg-emerald-600' : s >= 60 ? 'bg-amber-500' : 'bg-red-600';
const SEV_STYLE = { high: 'border-red-500/30 bg-red-500/10 text-red-300', medium: 'border-amber-500/30 bg-amber-500/10 text-amber-300', low: 'border-blue-500/30 bg-blue-500/10 text-blue-300' };
const Q_TYPE_COLOR = { behavioral: 'text-blue-400', technical: 'text-purple-400', situational: 'text-emerald-400', leading: 'text-red-400', general: 'text-gray-400' };

export default function InterviewerCoach() {
    const [interviews, setInterviews] = useState([]);
    const [interviewId, setInterviewId] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        interviewService.list({ page_size: 50 })
            .then(r => setInterviews(r.data?.results || r.data || []))
            .catch(() => { });
    }, []);

    const handleCoach = async () => {
        if (!interviewId) return toast.error('Select an interview to analyze.');
        setLoading(true); setResult(null);
        try {
            const r = await hrService.coachInterviewer({ interview_id: interviewId });
            setResult(r.data);
        } catch (err) {
            const msg = err.response?.data?.error || 'Coaching analysis failed.';
            toast.error(msg);
        }
        finally { setLoading(false); }
    };

    const scores = result ? [
        { label: 'Overall', value: result.overall_score, grade: result.grade },
        { label: 'Fairness', value: result.fairness_score },
        { label: 'Coverage', value: result.coverage_score },
        { label: 'Depth', value: result.depth_score },
        { label: 'Structure', value: result.structure_score },
    ] : [];

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter">
                        Interviewer <span className="text-red-600">Coach</span>
                    </h1>
                    <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest">AI analyzes your interviewing technique — scores, issues, and personalized coaching</p>
                </div>

                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">Select Interview to Analyze</label>
                        <select value={interviewId} onChange={e => setInterviewId(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600">
                            <option value="">Select an interview...</option>
                            {interviews.map(iv => (
                                <option key={iv.id || iv._id} value={iv.id || iv._id}>
                                    {iv.title} — {iv.candidate_id ? 'With candidate' : 'No candidate'} ({new Date(iv.scheduled_at).toLocaleDateString()})
                                </option>
                            ))}
                        </select>
                        {interviews.length === 0 && (
                            <p className="text-xs text-gray-500 mt-2">No interviews found. Complete an interview first.</p>
                        )}
                    </div>
                    <div className="flex items-end">
                        <button onClick={handleCoach} disabled={loading || !interviewId}
                            className="w-full sm:w-auto px-8 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-40 rounded-xl font-black uppercase tracking-widest text-sm transition-all flex items-center gap-2">
                            {loading ? <><TfiReload className="animate-spin" /> Analyzing...</> : <><TfiTarget /> Get Coaching</>}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {result && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            {/* Score Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                {scores.map(({ label, value, grade }) => (
                                    <div key={label} className={`bg-white/[0.03] border rounded-2xl p-4 text-center ${label === 'Overall' ? 'border-red-600/30 sm:col-span-1' : 'border-white/10'}`}>
                                        {grade && <div className="text-2xl font-black text-red-400 mb-1">{grade}</div>}
                                        <div className={`text-3xl font-black ${SCORE_COLOR(value)}`}>{value}</div>
                                        <div className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">{label}</div>
                                        <div className="w-full bg-gray-800 rounded-full h-1 mt-2">
                                            <div className={`h-1 rounded-full ${SCORE_BG(value)}`} style={{ width: `${value}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Summary */}
                            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
                                <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Executive Feedback</div>
                                <p className="text-gray-200 text-sm leading-relaxed">{result.executive_summary}</p>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 flex-wrap">
                                {['overview', 'issues', 'questions', 'improve'].map(t => (
                                    <button key={t} onClick={() => setActiveTab(t)}
                                        className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                                        {t === 'overview' ? 'Strengths & Gaps' : t === 'issues' ? `Issues (${result.issues_found?.length || 0})` : t === 'questions' ? 'Q Quality' : 'Improve'}
                                    </button>
                                ))}
                            </div>

                            {activeTab === 'overview' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
                                        <div className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-3">Your Strengths</div>
                                        {(result.strengths || []).map((s, i) => <div key={i} className="text-xs text-emerald-300 flex items-start gap-1 mb-1.5"><span>✓</span>{s}</div>)}
                                    </div>
                                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
                                        <div className="text-xs font-black uppercase tracking-widest text-amber-400 mb-3">Missed Areas</div>
                                        {(result.missed_areas || []).map((m, i) => (
                                            <div key={i} className="mb-3">
                                                <div className="text-xs text-amber-300 font-medium">{m.area}</div>
                                                <div className="text-[11px] text-amber-400/70 mt-0.5">{m.why_important}</div>
                                                <div className="text-[11px] text-amber-200 mt-1 italic">→ Try: "{m.suggested_question}"</div>
                                            </div>
                                        ))}
                                    </div>
                                    {(result.bias_warnings || []).length > 0 && (
                                        <div className="md:col-span-2 bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
                                            <div className="text-xs font-black uppercase tracking-widest text-red-400 mb-3">⚠ Bias Warnings</div>
                                            {(result.bias_warnings || []).map((w, i) => (
                                                <div key={i} className="mb-2">
                                                    <div className="text-xs text-red-300">{w.warning}</div>
                                                    <div className="text-[11px] text-red-400/70 mt-0.5">Context: {w.context} — Impact: {w.impact}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="md:col-span-2 bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                                        <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Next Interview Checklist</div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {(result.next_interview_checklist || []).map((item, i) => (
                                                <div key={i} className="flex items-center gap-2 text-xs text-gray-300 bg-white/5 rounded-xl p-3">
                                                    <input type="checkbox" className="accent-red-600" /> {item}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'issues' && (
                                <div className="space-y-4">
                                    {(result.issues_found || []).map((issue, i) => (
                                        <div key={i} className={`border rounded-2xl p-5 space-y-3 ${SEV_STYLE[issue.severity] || 'bg-white/[0.03] border-white/10'}`}>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${SEV_STYLE[issue.severity] || ''}`}>{issue.severity}</span>
                                                <span className="text-xs uppercase tracking-wide font-black">{issue.type?.replace(/_/g, ' ')}</span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                                                    <div className="text-[10px] text-red-400 font-black uppercase mb-1">Problematic</div>
                                                    <div className="text-xs text-red-300 italic">"{issue.question}"</div>
                                                </div>
                                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                                                    <div className="text-[10px] text-emerald-400 font-black uppercase mb-1">Better Version</div>
                                                    <div className="text-xs text-emerald-300 italic">"{issue.better_version}"</div>
                                                </div>
                                            </div>
                                            <p className="text-xs opacity-80">{issue.problem}</p>
                                        </div>
                                    ))}
                                    {(result.issues_found || []).length === 0 && (
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center text-emerald-300">
                                            No issues detected — excellent interviewing technique!
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'questions' && (
                                <div className="space-y-2">
                                    {(result.question_quality_breakdown || []).map((q, i) => (
                                        <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex items-center gap-4">
                                            <div className="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center text-xs font-black flex-shrink-0">Q{q.question_number}</div>
                                            <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded flex-shrink-0 ${Q_TYPE_COLOR[q.type] || 'text-gray-400'} bg-white/5`}>{q.type}</div>
                                            <div className="flex-1 text-xs text-gray-300">{q.note}</div>
                                            <div className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${q.quality === 'good' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>{q.quality}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'improve' && (
                                <div className="space-y-4">
                                    {(result.improvement_tips || []).map((tip, i) => (
                                        <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-2">
                                            <div className="text-sm font-black text-white">{tip.tip}</div>
                                            <div className="text-xs text-gray-400">{tip.how_to}</div>
                                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-300 italic">Example: {tip.example}</div>
                                        </div>
                                    ))}
                                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                                        <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Recommended Training</div>
                                        <div className="flex flex-wrap gap-2">
                                            {(result.recommended_training || []).map((t, i) => (
                                                <span key={i} className="text-xs bg-red-600/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg font-medium">{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
