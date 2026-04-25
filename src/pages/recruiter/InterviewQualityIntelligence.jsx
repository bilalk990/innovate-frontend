import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TfiReload, TfiStatsUp, TfiTarget, TfiBarChart } from 'react-icons/tfi';
import { toast } from 'sonner';
import hrService from '../../services/hrService';

const SCORE_COLOR = (s) => s >= 75 ? 'text-emerald-400' : s >= 50 ? 'text-amber-400' : 'text-red-400';
const SCORE_BG = (s) => s >= 75 ? 'bg-emerald-600' : s >= 50 ? 'bg-amber-500' : 'bg-red-600';
const GRADE_COLOR = { A: 'text-emerald-400', B: 'text-blue-400', C: 'text-amber-400', D: 'text-red-400', F: 'text-red-600' };
const SIGNAL_STYLE = { High: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', Medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30', Low: 'bg-red-500/20 text-red-300 border-red-500/30' };
const STRENGTH_STYLE = { Strong: 'text-emerald-400', Medium: 'text-amber-400', Weak: 'text-red-400' };
const PRIORITY_BG = { 1: 'bg-red-600', 2: 'bg-amber-500', 3: 'bg-blue-500', 4: 'bg-gray-600', 5: 'bg-gray-700' };

export default function InterviewQualityIntelligence() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState('questions');

    const handleAnalyze = async () => {
        setLoading(true); setResult(null);
        try {
            const r = await hrService.analyzeInterviewQuality({});
            setResult(r.data);
            toast.success('Interview quality analysis complete!');
        } catch { toast.error('Analysis failed. Make sure you have past interviews.'); }
        finally { setLoading(false); }
    };

    const processScores = result?.interview_process_score || {};

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter">
                        Interview Quality <span className="text-red-600">Intelligence</span>
                    </h1>
                    <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest">AI analyzes all your past interviews — what questions predict success, what to fix</p>
                </div>

                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                        {[['📊', 'Predictive Validity', 'Which questions actually predict job performance'], ['👥', 'Interviewer Consistency', 'Are your interviewers scoring fairly and consistently'], ['🎯', 'Pattern Recognition', 'What top hires vs failures had in common']].map(([icon, title, desc]) => (
                            <div key={title} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                                <div className="text-2xl mb-2">{icon}</div>
                                <div className="text-xs font-black uppercase tracking-widest text-white mb-1">{title}</div>
                                <div className="text-[11px] text-gray-500">{desc}</div>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleAnalyze} disabled={loading}
                        className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:opacity-40 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2">
                        {loading ? <><TfiReload className="animate-spin" /> Analyzing All Interviews...</> : <><TfiBarChart /> Run Quality Intelligence</>}
                    </button>
                </div>

                <AnimatePresence>
                    {result && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            {/* Score Hero */}
                            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8">
                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    <div className="flex flex-col items-center flex-shrink-0">
                                        <div className={`text-7xl font-black ${SCORE_COLOR(result.overall_interview_quality_score)}`}>{result.overall_interview_quality_score}</div>
                                        <div className="text-xs uppercase tracking-widest text-gray-400 mt-1">Quality Score</div>
                                        <div className={`text-3xl font-black mt-2 ${GRADE_COLOR[result.quality_grade] || 'text-gray-400'}`}>{result.quality_grade}</div>
                                        <div className="text-[10px] text-gray-500">{result.total_interviews_analyzed} interviews analyzed</div>
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            {Object.entries(processScores).map(([k, v]) => (
                                                <div key={k} className="bg-white/5 rounded-xl p-3">
                                                    <div className="text-[10px] text-gray-400 uppercase font-black mb-1">{k.replace(/_/g, ' ')}</div>
                                                    <div className={`text-xl font-black ${SCORE_COLOR(v)}`}>{v}</div>
                                                    <div className="w-full bg-gray-800 rounded-full h-1 mt-1">
                                                        <div className={`h-1 rounded-full ${SCORE_BG(v)}`} style={{ width: `${v}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                                            <p className="text-gray-300 text-sm leading-relaxed">{result.executive_summary}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 flex-wrap">
                                {['questions', 'interviewers', 'patterns', 'recommendations'].map(t => (
                                    <button key={t} onClick={() => setActiveTab(t)}
                                        className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                                        {t === 'questions' ? `Questions (${result.question_intelligence?.length || 0})` : t === 'interviewers' ? 'Interviewers' : t === 'patterns' ? 'Patterns' : 'Fix Plan'}
                                    </button>
                                ))}
                            </div>

                            {activeTab === 'questions' && (
                                <div className="space-y-4">
                                    {(result.question_intelligence || []).map((q, i) => (
                                        <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-3">
                                            <div className="flex items-start gap-3 flex-wrap">
                                                <div className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg border flex-shrink-0 ${SIGNAL_STYLE[q.signal_quality] || 'bg-gray-700/20 text-gray-400 border-gray-600/30'}`}>{q.signal_quality} Signal</div>
                                                <div className="text-[10px] bg-white/5 text-gray-400 px-2 py-1 rounded-lg flex-shrink-0">{q.question_type}</div>
                                                <div className={`text-[10px] font-black uppercase ml-auto ${SCORE_COLOR(q.predictive_validity)}`}>Validity: {q.predictive_validity}%</div>
                                            </div>
                                            <p className="text-white text-sm font-medium">"{q.question}"</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                                                    <div className="text-[10px] text-blue-400 font-black uppercase mb-1">Why Effective</div>
                                                    <div className="text-xs text-blue-200">{q.why_effective}</div>
                                                </div>
                                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                                                    <div className="text-[10px] text-emerald-400 font-black uppercase mb-1">How to Improve</div>
                                                    <div className="text-xs text-emerald-200">{q.improvement}</div>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-800 rounded-full h-1.5">
                                                <div className={`h-1.5 rounded-full ${SCORE_BG(q.predictive_validity)}`} style={{ width: `${q.predictive_validity}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                    {(result.missing_question_types || []).length > 0 && (
                                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                                            <div className="text-xs font-black uppercase tracking-widest text-amber-400 mb-2">Missing Question Types</div>
                                            <div className="flex flex-wrap gap-2">
                                                {result.missing_question_types.map((t, i) => <span key={i} className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-3 py-1 rounded-lg">{t}</span>)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'interviewers' && (
                                <div className="space-y-4">
                                    {(result.interviewer_consistency || []).map((iv, i) => (
                                        <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm font-black uppercase text-white">{iv.interviewer}</div>
                                                <div className={`text-2xl font-black ${SCORE_COLOR(iv.consistency_score)}`}>{iv.consistency_score}%</div>
                                            </div>
                                            <div className="w-full bg-gray-800 rounded-full h-1.5">
                                                <div className={`h-1.5 rounded-full ${SCORE_BG(iv.consistency_score)}`} style={{ width: `${iv.consistency_score}%` }} />
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                {iv.bias_detected && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3"><div className="text-[10px] text-red-400 font-black uppercase mb-1">Bias Detected</div><div className="text-xs text-red-300">{iv.bias_detected}</div></div>}
                                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3"><div className="text-[10px] text-emerald-400 font-black uppercase mb-1">Strengths</div><div className="text-xs text-emerald-300">{iv.strengths}</div></div>
                                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3"><div className="text-[10px] text-blue-400 font-black uppercase mb-1">Coaching Tip</div><div className="text-xs text-blue-300">{iv.coaching_tip}</div></div>
                                            </div>
                                        </div>
                                    ))}
                                    {result.time_analysis && (
                                        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                                            <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">⏱ Time Analysis</div>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                {[['Avg Duration', result.time_analysis.avg_duration], ['Optimal', result.time_analysis.optimal_duration], ['Per Question', result.time_analysis.time_per_question], ['Insight', result.time_analysis.insight]].map(([label, val]) => (
                                                    <div key={label} className={`bg-white/5 rounded-xl p-3 ${label === 'Insight' ? 'col-span-2 sm:col-span-4' : ''}`}>
                                                        <div className="text-[10px] uppercase tracking-widest text-gray-500">{label}</div>
                                                        <div className="text-xs text-white mt-1">{val}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'patterns' && (
                                <div className="space-y-4">
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
                                        <div className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-3">✓ Patterns That Predict Success</div>
                                        {(result.patterns_that_predict_success || []).map((p, i) => (
                                            <div key={i} className="mb-3">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[10px] font-black uppercase ${STRENGTH_STYLE[p.signal_strength] || 'text-gray-400'}`}>{p.signal_strength}</span>
                                                    <span className="text-xs text-emerald-200 font-medium">{p.pattern}</span>
                                                </div>
                                                <div className="text-[11px] text-emerald-400/70 ml-10">→ {p.recommendation}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
                                        <div className="text-xs font-black uppercase tracking-widest text-red-400 mb-3">⚠ Patterns That Predict Failure</div>
                                        {(result.patterns_that_predict_failure || []).map((p, i) => (
                                            <div key={i} className="mb-3">
                                                <div className="text-xs text-red-300 font-medium">{p.pattern}</div>
                                                <div className="text-[11px] text-red-400/70 mt-0.5">Detect: {p.how_to_detect}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'recommendations' && (
                                <div className="space-y-3">
                                    {(result.top_recommendations || []).map((r, i) => (
                                        <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex items-start gap-4">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0 ${PRIORITY_BG[r.priority] || 'bg-gray-600'}`}>{r.priority}</div>
                                            <div className="flex-1">
                                                <div className="text-sm font-black text-white">{r.recommendation}</div>
                                                <div className="text-xs text-gray-400 mt-1">Expected impact: {r.expected_impact}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
