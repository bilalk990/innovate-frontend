import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TfiReload, TfiShield, TfiUser, TfiStatsUp, TfiTarget, TfiLayoutGrid2 } from 'react-icons/tfi';
import { toast } from 'sonner';
import hrService from '../../services/hrService';
import authService from '../../services/authService';

const SCORE_COLOR = (s) => s >= 8 ? 'text-emerald-400' : s >= 6 ? 'text-amber-400' : 'text-red-400';
const VERDICT_STYLE = { 'Strong Hire': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', 'Consider': 'bg-amber-500/20 text-amber-300 border-amber-500/30', 'Pass': 'bg-red-500/20 text-red-300 border-red-500/30' };

export default function CandidateComparison() {
    const [candidates, setCandidates] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [jobTitle, setJobTitle] = useState('');
    const [blindMode, setBlindMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState('matrix');

    useEffect(() => {
        authService.getUsers('candidate').then(r => setCandidates(r.data || [])).catch(() => {});
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

    const winnerIdx = result ? (result.individual_profiles || []).findIndex(p => p.label === result.winner) : -1;

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter">
                        AI Candidate <span className="text-red-600">Comparison</span>
                    </h1>
                    <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest">Side-by-side AI analysis — who should you hire?</p>
                </div>

                {/* Setup Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Candidate Picker */}
                    <div className="lg:col-span-2 bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Select Candidates (2-5)</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto panel-scrollbar">
                            {candidates.map(c => {
                                const sel = selectedIds.includes(String(c.id || c._id));
                                const cid = String(c.id || c._id);
                                return (
                                    <button key={cid} onClick={() => toggleCandidate(cid)}
                                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${sel ? 'border-red-600 bg-red-600/10' : 'border-white/10 bg-white/[0.02] hover:border-white/20'}`}>
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${sel ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                                            {c.name?.charAt(0) || 'C'}
                                        </div>
                                        <div>
                                            <div className="text-xs font-black uppercase tracking-wide">{c.name || 'Unknown'}</div>
                                            <div className="text-[10px] text-gray-500">{c.email}</div>
                                        </div>
                                    </button>
                                );
                            })}
                            {candidates.length === 0 && <p className="text-gray-500 text-xs col-span-2">No candidates found.</p>}
                        </div>
                        <div className="text-xs text-gray-500">{selectedIds.length}/5 selected</div>
                    </div>

                    {/* Settings */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-5 flex flex-col">
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">Job Title *</label>
                            <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Senior React Developer"
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600" />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs font-black uppercase tracking-widest text-gray-300">Blind Mode</div>
                                <div className="text-[10px] text-gray-500">Hide names for unbiased review</div>
                            </div>
                            <button onClick={() => setBlindMode(b => !b)}
                                className={`w-12 h-6 rounded-full transition-all ${blindMode ? 'bg-red-600' : 'bg-gray-700'}`}>
                                <div className={`w-5 h-5 bg-white rounded-full transition-all mx-0.5 ${blindMode ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                        <button onClick={handleCompare} disabled={loading || selectedIds.length < 2}
                            className="mt-auto w-full py-4 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2">
                            {loading ? <><TfiReload className="animate-spin" /> Comparing...</> : <><TfiStatsUp /> Compare Now</>}
                        </button>
                    </div>
                </div>

                {/* Results */}
                <AnimatePresence>
                    {result && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            {/* Winner Banner */}
                            <div className="bg-gradient-to-r from-red-600/20 to-red-900/10 border border-red-600/30 rounded-2xl p-6 flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center text-3xl font-black">
                                    {result.winner?.charAt(0) || '🏆'}
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs uppercase tracking-widest text-red-400 mb-1">AI Recommends</div>
                                    <div className="text-2xl font-black uppercase italic">{result.winner}</div>
                                    <div className="text-gray-300 text-sm mt-1">{result.winner_reasoning}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-black text-red-400">{result.winner_confidence}%</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-widest">Confidence</div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 flex-wrap">
                                {['matrix', 'profiles', 'verdict'].map(t => (
                                    <button key={t} onClick={() => setActiveTab(t)}
                                        className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                                        {t === 'matrix' ? 'Comparison Matrix' : t === 'profiles' ? 'Individual Profiles' : 'Final Verdict'}
                                    </button>
                                ))}
                            </div>

                            {/* Matrix Tab */}
                            {activeTab === 'matrix' && (
                                <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-white/10">
                                                <th className="p-4 text-left text-xs font-black uppercase tracking-widest text-gray-400">Criterion</th>
                                                {Array.isArray(result.individual_profiles) && result.individual_profiles.map((p, i) => (
                                                    <th key={i} className="p-4 text-center text-xs font-black uppercase tracking-widest text-white">{p.label}</th>
                                                ))}
                                                <th className="p-4 text-center text-xs font-black uppercase tracking-widest text-red-400">Winner</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Array.isArray(result.comparison_matrix) && result.comparison_matrix.map((row, i) => (
                                                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                                                    <td className="p-4 text-xs font-black uppercase tracking-wide text-gray-300">{row.criterion}</td>
                                                    {Array.isArray(result.individual_profiles) && result.individual_profiles.map((p, pi) => {
                                                        const s = row.scores?.[p.label] ?? '-';
                                                        return (
                                                            <td key={pi} className="p-4 text-center">
                                                                <span className={`text-lg font-black ${typeof s === 'number' ? SCORE_COLOR(s) : 'text-gray-500'}`}>
                                                                    {typeof s === 'number' ? s.toFixed(1) : s}
                                                                </span>
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="p-4 text-center">
                                                        <span className="text-xs font-black uppercase text-red-400 bg-red-600/10 px-2 py-1 rounded-lg">{row.winner}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Profiles Tab */}
                            {activeTab === 'profiles' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {Array.isArray(result.individual_profiles) && result.individual_profiles.map((p, i) => (
                                        <div key={i} className={`bg-white/[0.03] border rounded-2xl p-5 space-y-4 ${i === winnerIdx ? 'border-red-600/40' : 'border-white/10'}`}>
                                            {i === winnerIdx && <div className="text-[10px] font-black uppercase tracking-widest text-red-400">⭐ AI Pick</div>}
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm font-black uppercase">{p.label}</div>
                                                <div className="text-2xl font-black text-red-400">{p.hire_probability}%</div>
                                            </div>
                                            <div className="w-full bg-gray-800 rounded-full h-1.5">
                                                <div className="bg-red-600 h-1.5 rounded-full" style={{ width: `${p.hire_probability}%` }} />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Strengths</div>
                                                {Array.isArray(p.top_strengths) && p.top_strengths.map((s, si) => (
                                                    <div key={si} className="text-xs text-gray-300 flex items-start gap-1 mb-1"><span className="text-emerald-500 mt-0.5">✓</span>{s}</div>
                                                ))}
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-1">Concerns</div>
                                                {Array.isArray(p.top_concerns) && p.top_concerns.map((c, ci) => (
                                                    <div key={ci} className="text-xs text-gray-300 flex items-start gap-1 mb-1"><span className="text-amber-500 mt-0.5">⚠</span>{c}</div>
                                                ))}
                                            </div>
                                            <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border text-center ${VERDICT_STYLE[p.verdict] || 'bg-gray-700/20 text-gray-400 border-gray-600/30'}`}>
                                                {p.verdict}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Verdict Tab */}
                            {activeTab === 'verdict' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
                                        <div className="text-xs font-black uppercase tracking-widest text-gray-400">Final Recommendation</div>
                                        <p className="text-gray-200 text-sm leading-relaxed">{result.final_recommendation}</p>
                                    </div>
                                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
                                        <div className="text-xs font-black uppercase tracking-widest text-gray-400">Risk Analysis</div>
                                        <p className="text-gray-200 text-sm leading-relaxed">{result.risk_analysis}</p>
                                    </div>
                                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
                                        <div className="text-xs font-black uppercase tracking-widest text-amber-400">Runner-Up Advice</div>
                                        <p className="text-gray-200 text-sm leading-relaxed">{result.runner_up_advice}</p>
                                    </div>
                                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
                                        <div className="text-xs font-black uppercase tracking-widest text-blue-400">Bias Notes</div>
                                        <p className="text-gray-200 text-sm leading-relaxed">{result.blind_bias_notes}</p>
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
