import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TfiReload, TfiStatsUp, TfiTarget, TfiBarChart } from 'react-icons/tfi';
import { toast } from 'sonner';
import hrService from '../../services/hrService';

const SCORE_COLOR = (s) => s >= 75 ? 'text-emerald-600' : s >= 50 ? 'text-amber-600' : 'text-red-600';
const SCORE_BG = (s) => s >= 75 ? 'bg-emerald-600' : s >= 50 ? 'bg-amber-600' : 'bg-red-600';
const GRADE_COLOR = { A: 'text-emerald-600', B: 'text-blue-600', C: 'text-amber-600', D: 'text-red-600', F: 'text-red-700' };
const SIGNAL_STYLE = { High: 'bg-emerald-50 text-emerald-600 border-emerald-100', Medium: 'bg-amber-50 text-amber-600 border-amber-100', Low: 'bg-red-50 text-red-600 border-red-100' };
const STRENGTH_STYLE = { Strong: 'text-emerald-600', Medium: 'text-amber-600', Weak: 'text-red-600' };
const PRIORITY_BG = { 1: 'bg-red-600', 2: 'bg-amber-600', 3: 'bg-blue-600', 4: 'bg-gray-600', 5: 'bg-gray-700' };

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
        } catch (err) { toast.error(err.response?.data?.error || 'Analysis failed. Make sure you have past interviews.'); }
        finally { setLoading(false); }
    };

    const processScores = result?.interview_process_score || {};

    return (
        <div className="min-h-screen bg-white text-gray-950 p-8">
            <div className="max-w-6xl mx-auto space-y-12 pb-20">
                
                {/* Header Section */}
                <div className="text-center pt-8">
                    <h1 className="text-6xl font-black italic uppercase tracking-tighter text-gray-950 leading-none">
                        QUALITY <span className="text-red-600 underline decoration-red-600/20 underline-offset-8">INTELLIGENCE</span>
                    </h1>
                    <p className="text-gray-400 text-[10px] mt-6 font-black uppercase tracking-[0.4em] italic">Predictive Analytics for Interview Performance & Accuracy</p>
                </div>

                {/* Info & Action Card */}
                <div className="bg-white border-2 border-gray-50 rounded-[3.5rem] p-12 shadow-2xl space-y-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/[0.01] blur-[100px] pointer-events-none" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {[
                            ['📊', 'PREDICTIVE VALIDITY', 'Identifying questions that actually forecast job success'],
                            ['👥', 'SCORING CONSISTENCY', 'Auditing interviewer fairness across all departments'],
                            ['🎯', 'PATTERN RECOGNITION', 'Synthesizing data from top performers vs. attrition risks']
                        ].map(([icon, title, desc]) => (
                            <div key={title} className="bg-gray-50 border-2 border-gray-100 rounded-[2.5rem] p-8 hover:bg-white hover:border-red-600/20 transition-all duration-500 group/item">
                                <div className="text-4xl mb-6 group-hover/item:scale-110 transition-transform">{icon}</div>
                                <div className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-950 mb-3 italic">{title}</div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase italic leading-relaxed">{desc}</div>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleAnalyze} disabled={loading}
                        className="w-full py-8 bg-red-600 hover:bg-red-700 disabled:opacity-30 rounded-[2.5rem] font-black uppercase tracking-[0.5em] text-[11px] text-white transition-all duration-500 flex items-center justify-center gap-4 shadow-[0_20px_40px_-10px_rgba(220,38,38,0.3)] active:scale-[0.98]">
                        {loading ? <><TfiReload className="animate-spin text-xl" /> AUDITING PAST DATA...</> : <><TfiBarChart className="text-xl" /> INITIALIZE QUALITY AUDIT</>}
                    </button>
                </div>

                <AnimatePresence>
                    {result && (
                        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                            
                            {/* Score Hero Matrix */}
                            <div className="bg-gray-50 border-2 border-gray-100 rounded-[4rem] p-16 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-full h-full bg-red-600/[0.02] blur-[100px] pointer-events-none" />
                                <div className="flex flex-col lg:flex-row items-center gap-16 relative">
                                    <div className="flex flex-col items-center flex-shrink-0 text-center">
                                        <div className={`text-8xl font-black italic tracking-tighter leading-none ${SCORE_COLOR(result.overall_interview_quality_score)}`}>{result.overall_interview_quality_score}</div>
                                        <div className="text-[10px] uppercase tracking-[0.6em] text-gray-400 font-black mt-4 italic">OVERALL INDEX</div>
                                        <div className={`text-6xl font-black mt-6 italic ${GRADE_COLOR[result.quality_grade] || 'text-gray-400'}`}>{result.quality_grade}</div>
                                        <div className="text-[10px] text-gray-400 mt-6 font-black uppercase italic tracking-widest bg-white px-6 py-2 rounded-full border border-gray-100">{result.total_interviews_analyzed} DATA POINTS ANALYZED</div>
                                    </div>
                                    <div className="flex-1 space-y-10 w-full">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            {Object.entries(processScores).map(([k, v]) => (
                                                <div key={k} className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 shadow-xl group hover:border-red-600/30 transition-all duration-500">
                                                    <div className="text-[10px] text-gray-400 uppercase font-black mb-4 italic tracking-widest">{k.replace(/_/g, ' ')}</div>
                                                    <div className="flex items-end justify-between mb-4">
                                                        <div className={`text-4xl font-black italic tracking-tighter ${SCORE_COLOR(v)}`}>{v}%</div>
                                                    </div>
                                                    <div className="w-full bg-gray-50 rounded-full h-3 overflow-hidden border border-gray-100">
                                                        <div className={`h-full rounded-full ${SCORE_BG(v)} shadow-[0_0_10px_rgba(220,38,38,0.3)]`} style={{ width: `${v}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bg-white border-l-[12px] border-red-600 rounded-[3rem] p-10 shadow-inner group">
                                            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600 mb-6 italic">EXECUTIVE DIAGNOSTIC SUMMARY</div>
                                            <p className="text-xl text-gray-950 font-black italic uppercase tracking-tighter leading-tight group-hover:translate-x-2 transition-transform">"{result.executive_summary}"</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tab Navigator */}
                            <div className="flex gap-4 p-2 bg-gray-50 rounded-[2.5rem] w-fit mx-auto border border-gray-100 shadow-sm">
                                {['questions', 'interviewers', 'patterns', 'recommendations'].map(t => (
                                    <button key={t} onClick={() => setActiveTab(t)}
                                        className={`px-10 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest italic transition-all duration-500 ${activeTab === t ? 'bg-red-600 text-white shadow-2xl shadow-red-600/30' : 'text-gray-400 hover:text-gray-950'}`}>
                                        {t === 'questions' ? `Question Intel (${result.question_intelligence?.length || 0})` : t === 'interviewers' ? 'Interviewer Audit' : t === 'patterns' ? 'Success Patterns' : 'Strategic Roadmap'}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Matrix */}
                            <div className="min-h-[600px]">
                                {activeTab === 'questions' && (
                                    <div className="space-y-8">
                                        {(result.question_intelligence || []).map((q, i) => (
                                            <div key={i} className="bg-white border-2 border-gray-50 rounded-[3.5rem] p-12 shadow-2xl hover:border-red-600/20 transition-all duration-500 group">
                                                <div className="flex items-start gap-6 flex-wrap mb-10 pb-10 border-b border-gray-100">
                                                    <div className={`text-[10px] font-black uppercase tracking-[0.3em] px-6 py-2.5 rounded-full border-2 italic ${SIGNAL_STYLE[q.signal_quality] || 'bg-gray-100 text-gray-400'}`}>{q.signal_quality} SIGNAL</div>
                                                    <div className="text-[10px] bg-gray-50 text-gray-400 font-black uppercase px-6 py-2.5 rounded-full border border-gray-100 italic">{q.question_type}</div>
                                                    <div className={`text-3xl font-black italic tracking-tighter ml-auto uppercase ${SCORE_COLOR(q.predictive_validity)}`}>VALIDITY: {q.predictive_validity}%</div>
                                                </div>
                                                <p className="text-2xl text-gray-950 font-black italic uppercase tracking-tighter leading-tight mb-10">"{q.question}"</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="bg-blue-50 border-2 border-blue-100 rounded-[2.5rem] p-8 shadow-sm">
                                                        <div className="text-[10px] text-blue-600 font-black uppercase tracking-[0.4em] mb-4 italic">EFFICIENCY LOGIC</div>
                                                        <div className="text-sm text-blue-900 font-bold italic uppercase tracking-tight">{q.why_effective}</div>
                                                    </div>
                                                    <div className="bg-emerald-50 border-2 border-emerald-100 rounded-[2.5rem] p-8 shadow-sm">
                                                        <div className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.4em] mb-4 italic">CALIBRATION OPTIMIZATION</div>
                                                        <div className="text-sm text-emerald-900 font-bold italic uppercase tracking-tight">{q.improvement}</div>
                                                    </div>
                                                </div>
                                                <div className="w-full bg-gray-50 rounded-full h-2 mt-10 overflow-hidden border border-gray-100">
                                                    <div className={`h-full rounded-full ${SCORE_BG(q.predictive_validity)} shadow-[0_0_10px_rgba(220,38,38,0.3)]`} style={{ width: `${q.predictive_validity}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                        {(result.missing_question_types || []).length > 0 && (
                                            <div className="bg-amber-50 border-4 border-amber-100 rounded-[3rem] p-12 text-center shadow-xl">
                                                <div className="text-[11px] font-black uppercase tracking-[0.5em] text-amber-600 mb-8 italic">CRITICAL GAPS IN INTERVIEW BANK</div>
                                                <div className="flex flex-wrap gap-4 justify-center">
                                                    {result.missing_question_types.map((t, i) => <span key={i} className="text-[10px] bg-white text-amber-600 font-black uppercase border-2 border-amber-200 px-8 py-3 rounded-2xl italic shadow-sm hover:scale-110 transition-transform">{t}</span>)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'interviewers' && (
                                    <div className="space-y-8">
                                        {(result.interviewer_consistency || []).map((iv, i) => (
                                            <div key={i} className="bg-white border-2 border-gray-50 rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/[0.01] blur-[60px]" />
                                                <div className="flex items-center justify-between mb-10 pb-10 border-b border-gray-100">
                                                    <div className="text-3xl font-black uppercase italic tracking-tighter text-gray-950">{iv.interviewer}</div>
                                                    <div className={`text-6xl font-black italic tracking-tighter ${SCORE_COLOR(iv.consistency_score)}`}>{iv.consistency_score}%</div>
                                                </div>
                                                <div className="w-full bg-gray-50 rounded-full h-4 mb-12 overflow-hidden border border-gray-100 shadow-inner">
                                                    <div className={`h-full rounded-full ${SCORE_BG(iv.consistency_score)}`} style={{ width: `${iv.consistency_score}%` }} />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                    {iv.bias_detected && (
                                                        <div className="bg-red-50 border-2 border-red-100 rounded-[2.5rem] p-8 shadow-sm">
                                                            <div className="text-[10px] text-red-600 font-black uppercase tracking-[0.4em] mb-4 italic">BIAS RISK LOG</div>
                                                            <div className="text-xs text-red-900 font-bold italic uppercase tracking-tight">{iv.bias_detected}</div>
                                                        </div>
                                                    )}
                                                    <div className="bg-emerald-50 border-2 border-emerald-100 rounded-[2.5rem] p-8 shadow-sm">
                                                        <div className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.4em] mb-4 italic">CORE STRENGTHS</div>
                                                        <div className="text-xs text-emerald-900 font-bold italic uppercase tracking-tight">{iv.strengths}</div>
                                                    </div>
                                                    <div className="bg-blue-50 border-2 border-blue-100 rounded-[2.5rem] p-8 shadow-sm">
                                                        <div className="text-[10px] text-blue-600 font-black uppercase tracking-[0.4em] mb-4 italic">COACHING PROTOCOL</div>
                                                        <div className="text-xs text-blue-900 font-bold italic uppercase tracking-tight">{iv.coaching_tip}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {result.time_analysis && (
                                            <div className="bg-gray-950 border-4 border-red-600/20 rounded-[4rem] p-16 shadow-2xl relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 blur-[120px]" />
                                                <div className="text-[11px] font-black uppercase tracking-[0.6em] text-red-500 mb-12 italic text-center underline decoration-red-950 underline-offset-8">CHRONO-EFFICIENCY AUDIT</div>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                                                    {[
                                                        ['AVG DURATION', result.time_analysis.avg_duration],
                                                        ['OPTIMAL WINDOW', result.time_analysis.optimal_duration],
                                                        ['CADENCE PER Q', result.time_analysis.time_per_question]
                                                    ].map(([label, val]) => (
                                                        <div key={label} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 text-center hover:bg-white/10 transition-all group/stat">
                                                            <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em] mb-4 italic group-hover/stat:text-red-400 transition-colors">{label}</div>
                                                            <div className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">{val}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-12 p-10 bg-white/5 rounded-[3rem] border border-white/10 group/insight">
                                                    <div className="text-[10px] text-red-500 font-black uppercase tracking-[0.4em] mb-6 italic">TEMPORAL INSIGHT</div>
                                                    <p className="text-xl text-white font-black italic uppercase tracking-tighter leading-tight group-hover/insight:translate-x-2 transition-transform">"{result.time_analysis.insight}"</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'patterns' && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                        <div className="bg-emerald-50 border-4 border-emerald-100 rounded-[4rem] p-12 shadow-2xl hover:bg-white transition-all duration-500">
                                            <div className="text-[11px] font-black uppercase tracking-[0.5em] text-emerald-600 mb-12 italic text-center underline decoration-emerald-200 decoration-8 underline-offset-8">SUCCESS PREDICTORS</div>
                                            <div className="space-y-8">
                                                {(result.patterns_that_predict_success || []).map((p, i) => (
                                                    <div key={i} className="bg-white/60 p-8 rounded-[2.5rem] border border-emerald-200 shadow-sm group hover:scale-[1.02] transition-transform">
                                                        <div className="flex items-center gap-6 mb-4 pb-4 border-b border-emerald-100">
                                                            <span className={`text-[10px] font-black uppercase tracking-widest italic px-4 py-1.5 rounded-full border-2 ${STRENGTH_STYLE[p.signal_strength] || 'text-gray-400 border-gray-100'}`}>{p.signal_strength} SIGNAL</span>
                                                            <span className="text-lg text-emerald-950 font-black italic uppercase tracking-tighter">{p.pattern}</span>
                                                        </div>
                                                        <div className="text-[11px] text-emerald-600 font-black uppercase tracking-[0.2em] italic ml-4">ACTION: <span className="text-emerald-950">{p.recommendation}</span></div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-red-50 border-4 border-red-100 rounded-[4rem] p-12 shadow-2xl hover:bg-white transition-all duration-500">
                                            <div className="text-[11px] font-black uppercase tracking-[0.5em] text-red-600 mb-12 italic text-center underline decoration-red-200 decoration-8 underline-offset-8">FAILURE SIGNALS</div>
                                            <div className="space-y-8">
                                                {(result.patterns_that_predict_failure || []).map((p, i) => (
                                                    <div key={i} className="bg-white/60 p-8 rounded-[2.5rem] border border-red-200 shadow-sm group hover:scale-[1.02] transition-transform">
                                                        <div className="text-lg text-red-950 font-black italic uppercase tracking-tighter mb-6 border-b border-red-100 pb-4">"{p.pattern}"</div>
                                                        <div className="text-[11px] text-red-600 font-black uppercase tracking-[0.2em] italic ml-4">DETECTION PROTOCOL: <span className="text-red-950">{p.how_to_detect}</span></div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'recommendations' && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {(result.top_recommendations || []).map((r, i) => (
                                            <div key={i} className="bg-gray-50 border-2 border-gray-100 rounded-[3rem] p-10 flex items-center gap-10 hover:bg-white transition-all duration-500 group relative overflow-hidden shadow-xl">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/[0.01] blur-[60px]" />
                                                <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center text-3xl font-black text-white flex-shrink-0 italic shadow-2xl group-hover:rotate-12 transition-transform ${PRIORITY_BG[r.priority] || 'bg-gray-600'}`}>{r.priority}</div>
                                                <div className="flex-1 space-y-4">
                                                    <div className="text-xl font-black text-gray-950 italic uppercase tracking-tighter leading-tight">{r.recommendation}</div>
                                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 italic">EXPECTED ROI: <span className="text-red-600">{r.expected_impact}</span></div>
                                                </div>
                                            </div>
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
