import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TfiReload, TfiShield, TfiUser, TfiStatsUp, TfiTarget, TfiLayoutGrid2 } from 'react-icons/tfi';
import { toast } from 'sonner';
import hrService from '../../services/hrService';
import authService from '../../services/authService';

const SCORE_COLOR = (s) => s >= 8 ? 'text-emerald-600' : s >= 6 ? 'text-amber-600' : 'text-red-600';
const VERDICT_STYLE = { 'Strong Hire': 'bg-emerald-50 text-emerald-600 border-emerald-100', 'Consider': 'bg-amber-50 text-amber-600 border-amber-100', 'Pass': 'bg-red-50 text-red-600 border-red-100' };

export default function CandidateComparison() {
    const [candidates, setCandidates] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [jobTitle, setJobTitle] = useState('');
    const [blindMode, setBlindMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState('matrix');

    useEffect(() => {
        authService.getUsers('candidate').then(r => {
            const data = Array.isArray(r.data) ? r.data : (r.data?.results || []);
            setCandidates(data);
        }).catch(() => {});
    }, []);

    const toggleCandidate = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 5 ? [...prev, id] : prev);
    };

    const handleCompare = async () => {
        if (selectedIds.length < 2) return toast.error('Select at least 2 candidates.');
        if (!jobTitle.trim()) return toast.error('Enter the job title.');
        setLoading(true);
        setResult(null);
        try {
            const r = await hrService.compareCandidates({ candidate_ids: selectedIds, job_title: jobTitle, blind_mode: blindMode });
            setResult(r.data);
        } catch { toast.error('Comparison failed. Try again.'); }
        finally { setLoading(false); }
    };

    const winnerIdx = (result && Array.isArray(result.individual_profiles)) ? result.individual_profiles.findIndex(p => p.label === result.winner) : -1;

    return (
        <div className="min-h-screen bg-white text-gray-950 p-8">
            <div className="max-w-6xl mx-auto space-y-12 pb-20">
                
                {/* Header */}
                <div className="text-center pt-8">
                    <h1 className="text-6xl font-black italic uppercase tracking-tighter text-gray-950 leading-none">
                        CANDIDATE <span className="text-red-600 underline decoration-red-600/20 underline-offset-8">COMPARISON</span>
                    </h1>
                    <p className="text-gray-400 text-[10px] mt-6 font-black uppercase tracking-[0.4em] italic">Side-by-Side Neural Analysis & Comparative Talent Matrix</p>
                </div>

                {/* Setup Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Candidate Matrix Selection */}
                    <div className="lg:col-span-2 bg-white border-2 border-gray-50 rounded-[3.5rem] p-12 shadow-2xl space-y-10 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-red-600/[0.01] blur-[80px]" />
                        <div className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 italic flex items-center gap-4">
                            <span className="w-12 h-1 bg-gray-950 rounded-full" /> SELECTION POOL (2-5)
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-72 overflow-y-auto pr-4 custom-scrollbar">
                            {candidates.map(c => {
                                const id = String(c.id || c._id);
                                const sel = selectedIds.includes(id);
                                return (
                                    <button key={id} onClick={() => toggleCandidate(id)}
                                        className={`flex items-center gap-6 p-6 rounded-[2rem] border-2 text-left transition-all duration-500 group/item ${sel ? 'border-red-600 bg-red-50 shadow-xl' : 'border-gray-50 hover:border-gray-100 bg-gray-50/50'}`}>
                                        <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center text-sm font-black italic transition-all duration-500 ${sel ? 'bg-red-600 text-white rotate-12' : 'bg-gray-200 text-gray-500'}`}>
                                            {c.name?.charAt(0).toUpperCase() || 'C'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-black uppercase italic tracking-tight text-gray-950 leading-none">{c.name || 'Unknown'}</div>
                                            <div className="text-[10px] text-gray-400 font-black uppercase mt-2 tracking-widest">{c.email}</div>
                                        </div>
                                        {sel && <div className="text-red-600 text-xl font-black italic">✓</div>}
                                    </button>
                                );
                            })}
                            {candidates.length === 0 && <p className="text-gray-400 text-xs font-black uppercase italic py-10">NO TARGETS DETECTED</p>}
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 italic border-t border-gray-50 pt-8 text-center">{selectedIds.length} / 5 DEPLOYED</div>
                    </div>

                    {/* Operational Settings */}
                    <div className="bg-gray-950 border-4 border-red-600/20 rounded-[4rem] p-16 shadow-2xl flex flex-col relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-full h-full bg-red-600/[0.05] blur-[120px] pointer-events-none" />
                        <div className="space-y-10 relative z-10 flex-1">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 italic ml-6">Target Designation *</label>
                                <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="E.G. SYSTEMS ARCHITECT"
                                    className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-10 py-6 text-sm text-white font-black italic uppercase focus:outline-none focus:border-red-600/50" />
                            </div>
                            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white italic">BLIND MODE</div>
                                    <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest mt-1">NEUTRALIZE UNCONSCIOUS BIAS</div>
                                </div>
                                <button onClick={() => setBlindMode(b => !b)}
                                    className={`w-16 h-8 rounded-full transition-all duration-500 relative ${blindMode ? 'bg-red-600' : 'bg-white/10'}`}>
                                    <div className={`w-6 h-6 bg-white rounded-full transition-all duration-500 shadow-xl absolute top-1 ${blindMode ? 'left-9' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>
                        <button onClick={handleCompare} disabled={loading || selectedIds.length < 2}
                            className="mt-10 w-full py-8 bg-red-600 hover:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-[2.5rem] font-black uppercase tracking-[0.5em] text-[11px] text-white transition-all duration-500 flex items-center justify-center gap-4 shadow-[0_20px_40px_-10px_rgba(220,38,38,0.3)] active:scale-[0.98] group relative z-10">
                            {loading ? <><TfiReload className="animate-spin text-xl" /> RUNNING SIMULATION...</> : <><TfiStatsUp className="text-xl group-hover:scale-125 transition-transform" /> INITIALIZE COMPARISON</>}
                        </button>
                    </div>
                </div>

                {/* Results Workspace */}
                <AnimatePresence>
                    {result && (
                        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                            
                            {/* Winner Hero Banner */}
                            <div className="bg-gray-950 border-4 border-red-600/20 rounded-[4.5rem] p-16 shadow-2xl flex flex-col lg:flex-row items-center gap-16 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-600/10 blur-[150px] pointer-events-none" />
                                <div className="w-40 h-40 rounded-[3.5rem] bg-red-600 flex items-center justify-center text-7xl font-black italic text-white shadow-[0_0_80px_rgba(220,38,38,0.4)] group-hover:rotate-12 transition-transform duration-700">
                                    {result.winner?.charAt(0).toUpperCase() || '🏆'}
                                </div>
                                <div className="flex-1 space-y-8 relative z-10 text-center lg:text-left">
                                    <div>
                                        <div className="text-[11px] uppercase tracking-[0.6em] text-red-500 font-black mb-4 italic underline decoration-red-950 underline-offset-8">AI SYSTEM SELECTION</div>
                                        <div className="text-6xl font-black italic tracking-tighter text-white uppercase leading-none">{result.winner}</div>
                                    </div>
                                    <p className="text-xl text-gray-400 font-black italic uppercase leading-tight tracking-tight opacity-90">"{result.winner_reasoning}"</p>
                                </div>
                                <div className="text-center lg:text-right flex-shrink-0 relative z-10 border-l-2 border-white/5 lg:pl-16">
                                    <div className="text-[120px] font-black italic tracking-tighter text-red-600 leading-none group-hover:scale-110 transition-transform duration-700">{result.winner_confidence}%</div>
                                    <div className="text-[10px] text-red-500/60 font-black uppercase tracking-[0.6em] mt-4 italic">NEURAL CONFIDENCE</div>
                                </div>
                            </div>

                            {/* View Controllers */}
                            <div className="flex gap-4 border-b-2 border-gray-50 pb-4 overflow-x-auto scrollbar-hide">
                                {[
                                    { id: 'matrix', label: 'COMPARISON MATRIX' },
                                    { id: 'profiles', label: 'INDIVIDUAL PROFILES' },
                                    { id: 'verdict', label: 'FINAL VERDICT' }
                                ].map(t => (
                                    <button key={t.id} onClick={() => setActiveTab(t.id)}
                                        className={`px-12 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.4em] italic transition-all duration-500 relative overflow-hidden group ${activeTab === t.id ? 'bg-gray-950 text-white shadow-2xl' : 'bg-gray-50 text-gray-400 hover:text-gray-950'}`}>
                                        <span className="relative z-10">{t.label}</span>
                                        {activeTab === t.id && <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent pointer-events-none" />}
                                    </button>
                                ))}
                            </div>

                            {/* Matrix Tab */}
                            {activeTab === 'matrix' && (
                                <div className="bg-white border-2 border-gray-50 rounded-[4rem] overflow-hidden shadow-2xl group/matrix">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-950">
                                                <th className="p-10 text-left text-[11px] font-black uppercase tracking-[0.4em] text-gray-500 italic">CRITERION</th>
                                                {Array.isArray(result.individual_profiles) && result.individual_profiles.map((p, i) => (
                                                    <th key={i} className="p-10 text-center text-[11px] font-black uppercase tracking-[0.4em] text-white italic underline decoration-red-600/20 underline-offset-8">{p.label}</th>
                                                ))}
                                                <th className="p-10 text-center text-[11px] font-black uppercase tracking-[0.4em] text-red-500 italic">VECTOR WINNER</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Array.isArray(result.comparison_matrix) && result.comparison_matrix.map((row, i) => (
                                                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/80 transition-all group/row">
                                                    <td className="p-10 text-sm font-black italic uppercase tracking-widest text-gray-950 group-hover/row:pl-14 transition-all">{row.criterion}</td>
                                                    {Array.isArray(result.individual_profiles) && result.individual_profiles.map((p, pi) => {
                                                        const s = row.scores?.[p.label] ?? '-';
                                                        return (
                                                            <td key={pi} className="p-10 text-center">
                                                                <span className={`text-4xl font-black italic tracking-tighter group-hover/row:scale-125 transition-transform inline-block ${typeof s === 'number' ? SCORE_COLOR(s) : 'text-gray-200'}`}>
                                                                    {typeof s === 'number' ? s.toFixed(1) : s}
                                                                </span>
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="p-10 text-center">
                                                        <span className="text-[10px] font-black uppercase italic tracking-[0.2em] text-red-600 bg-red-50 border border-red-100 px-6 py-2 rounded-full shadow-sm">{row.winner}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Profiles Tab */}
                            {activeTab === 'profiles' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {Array.isArray(result.individual_profiles) && result.individual_profiles.map((p, i) => (
                                        <div key={i} className={`bg-white border-2 rounded-[4rem] p-12 space-y-8 hover:scale-[1.02] transition-all duration-500 group/card shadow-2xl relative overflow-hidden ${i === winnerIdx ? 'border-red-600/30' : 'border-gray-50'}`}>
                                            {i === winnerIdx && (
                                                <div className="absolute top-0 right-0 bg-red-600 text-white px-8 py-2 rounded-bl-[2rem] text-[9px] font-black uppercase italic tracking-[0.4em] shadow-xl">AI PROTOCOL PICK</div>
                                            )}
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="text-3xl font-black uppercase italic tracking-tighter text-gray-950 leading-none">{p.label}</div>
                                                <div className="text-5xl font-black italic text-red-600 tracking-tighter leading-none">{p.hire_probability}%</div>
                                            </div>
                                            <div className="w-full bg-gray-50 rounded-full h-4 shadow-inner overflow-hidden flex items-center">
                                                <div className="bg-red-600 h-full rounded-full shadow-[0_0_15px_rgba(220,38,38,0.2)] transition-all duration-1000" style={{ width: `${p.hire_probability}%` }} />
                                            </div>
                                            <div className="space-y-8 pt-4">
                                                <div className="bg-emerald-50 border-2 border-emerald-100 rounded-[2.5rem] p-8">
                                                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600 mb-6 italic underline decoration-emerald-200 underline-offset-8">STRENGTHS</div>
                                                    <div className="space-y-3">
                                                        {Array.isArray(p.top_strengths) && p.top_strengths.map((s, si) => (
                                                            <div key={si} className="text-xs text-emerald-950 font-black italic uppercase leading-tight flex items-start gap-3"><span className="text-emerald-600">✓</span>{s}</div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="bg-amber-50 border-2 border-amber-100 rounded-[2.5rem] p-8">
                                                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600 mb-6 italic underline decoration-amber-200 underline-offset-8">VULNERABILITIES</div>
                                                    <div className="space-y-3">
                                                        {Array.isArray(p.top_concerns) && p.top_concerns.map((c, ci) => (
                                                            <div key={ci} className="text-xs text-amber-950 font-black italic uppercase leading-tight flex items-start gap-3"><span className="text-amber-600">⚠</span>{c}</div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`text-[10px] font-black uppercase italic tracking-[0.3em] py-5 rounded-[2rem] border-4 text-center shadow-xl ${VERDICT_STYLE[p.verdict] || 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                                                {p.verdict}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Verdict Tab */}
                            {activeTab === 'verdict' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    {[
                                        { title: 'FINAL RECOGNITION', text: result.final_recommendation, color: 'text-red-600', bg: 'bg-white border-red-100' },
                                        { title: 'RISK PROTOCOL', text: result.risk_analysis, color: 'text-gray-950', bg: 'bg-gray-50 border-gray-100 shadow-inner' },
                                        { title: 'RUNNER-UP LOGISTICS', text: result.runner_up_advice, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
                                        { title: 'NEURAL BIAS AUDIT', text: result.blind_bias_notes, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' }
                                    ].map((v, idx) => (
                                        <div key={idx} className={`border-2 rounded-[3.5rem] p-12 space-y-8 shadow-2xl group/v hover:scale-[1.02] transition-all duration-500 ${v.bg}`}>
                                            <div className={`text-[11px] font-black uppercase tracking-[0.5em] italic flex items-center gap-4 ${v.color}`}>
                                                <span className={`w-12 h-1 rounded-full ${v.color === 'text-red-600' ? 'bg-red-600' : 'bg-gray-300'}`} /> {v.title}
                                            </div>
                                            <p className="text-lg text-gray-950 font-black italic uppercase leading-relaxed tracking-tight">"{v.text}"</p>
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
