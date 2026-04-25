import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TfiReload, TfiSearch, TfiUser, TfiStatsUp } from 'react-icons/tfi';
import { toast } from 'sonner';
import hrService from '../../services/hrService';
import authService from '../../services/authService';

const TIER_STYLE = {
    'Tier 1: Strong': 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    'Tier 2: Good': 'border-blue-500/30 bg-blue-500/10 text-blue-300',
    'Tier 3: Consider': 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    'Tier 4: Pass': 'border-red-500/30 bg-red-500/10 text-red-300',
};
const REC_COLOR = { Shortlist: 'bg-emerald-600', 'Phone Screen': 'bg-blue-600', Hold: 'bg-amber-500', Reject: 'bg-red-600' };
const SCORE_COLOR = (s) => s >= 75 ? 'text-emerald-400' : s >= 50 ? 'text-amber-400' : 'text-red-400';

export default function BulkResumeScreener() {
    const [candidates, setCandidates] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [jdText, setJdText] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        authService.getUsers('candidate').then(r => setCandidates(r.data || [])).catch(() => {});
    }, []);

    const toggle = (id) => setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : p.length < 15 ? [...p, id] : p);

    const handleScreen = async () => {
        if (selectedIds.length < 1) return toast.error('Select at least 1 candidate.');
        if (!jdText.trim()) return toast.error('Paste the job description.');
        if (!jobTitle.trim()) return toast.error('Enter the job title.');
        setLoading(true); setResult(null);
        try {
            const r = await hrService.bulkScreenResumes({ candidate_ids: selectedIds, jd_text: jdText, job_title: jobTitle });
            setResult(r.data);
            toast.success(`Screened ${r.data.ranked_candidates?.length || 0} candidates!`);
        } catch { toast.error('Screening failed. Try again.'); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter">
                        Bulk Resume <span className="text-red-600">Screener</span>
                    </h1>
                    <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest">AI ranks up to 15 candidates against your JD in seconds</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Candidate Picker */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
                        <div className="text-xs font-black uppercase tracking-widest text-gray-400">Select Candidates (up to 15)</div>
                        <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto pr-1">
                            {candidates.map(c => {
                                const id = String(c.id || c._id);
                                const sel = selectedIds.includes(id);
                                return (
                                    <button key={id} onClick={() => toggle(id)}
                                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${sel ? 'border-red-600 bg-red-600/10' : 'border-white/10 hover:border-white/20'}`}>
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${sel ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}>{c.name?.charAt(0) || 'C'}</div>
                                        <div>
                                            <div className="text-xs font-black uppercase">{c.name}</div>
                                            <div className="text-[10px] text-gray-500">{c.email}</div>
                                        </div>
                                        {sel && <div className="ml-auto text-red-400 text-xs font-black">✓</div>}
                                    </button>
                                );
                            })}
                            {candidates.length === 0 && <p className="text-gray-500 text-xs text-center py-4">No candidates found.</p>}
                        </div>
                        <div className="text-xs text-gray-500">{selectedIds.length}/15 selected</div>
                    </div>

                    {/* JD Input */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4 flex flex-col">
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">Job Title *</label>
                            <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Senior Backend Engineer"
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600" />
                        </div>
                        <div className="flex-1 flex flex-col">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">Job Description *</label>
                            <textarea value={jdText} onChange={e => setJdText(e.target.value)} rows={8}
                                placeholder="Paste the full job description here..."
                                className="w-full flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600 resize-none" />
                        </div>
                        <button onClick={handleScreen} disabled={loading || selectedIds.length < 1}
                            className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:opacity-40 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2">
                            {loading ? <><TfiReload className="animate-spin" /> Screening {selectedIds.length} Candidates...</> : <><TfiSearch /> Screen All Candidates</>}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {result && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            {/* Summary Bar */}
                            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
                                <div className="flex gap-6 text-center">
                                    <div>
                                        <div className="text-3xl font-black text-red-400">{result.ranked_candidates?.length || 0}</div>
                                        <div className="text-[10px] uppercase tracking-widest text-gray-400">Screened</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-black text-emerald-400">{result.shortlist_count || 0}</div>
                                        <div className="text-[10px] uppercase tracking-widest text-gray-400">Shortlist</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-black text-white">{result.pool_quality}</div>
                                        <div className="text-[10px] uppercase tracking-widest text-gray-400">Pool Quality</div>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">🏆 Top Pick: <span className="text-red-400">{result.top_pick}</span></div>
                                    <p className="text-gray-300 text-sm">{result.screening_summary}</p>
                                    {(result.common_gaps || []).length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <span className="text-[10px] text-gray-500 uppercase font-black">Common Gaps:</span>
                                            {result.common_gaps.map((g, i) => <span key={i} className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-lg">{g}</span>)}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Ranked List */}
                            <div className="space-y-4">
                                {(result.ranked_candidates || []).map((c, i) => (
                                    <div key={i} className={`border rounded-2xl p-5 space-y-3 ${TIER_STYLE[c.tier] || 'bg-white/[0.03] border-white/10 text-white'}`}>
                                        <div className="flex items-center gap-4 flex-wrap">
                                            <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-lg font-black text-white flex-shrink-0">#{c.rank}</div>
                                            <div className="flex-1">
                                                <div className="text-sm font-black uppercase">{c.name}</div>
                                                <div className="text-xs text-gray-400 mt-0.5">{c.one_liner}</div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className={`text-2xl font-black ${SCORE_COLOR(c.match_score)}`}>{c.match_score}%</div>
                                                <div className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl text-white ${REC_COLOR[c.recommendation] || 'bg-gray-600'}`}>{c.recommendation}</div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div className="bg-white/5 rounded-xl p-3">
                                                <div className="text-[10px] text-gray-400 uppercase font-black mb-1">Experience Fit</div>
                                                <div className="text-xs text-white font-black">{c.experience_fit}</div>
                                            </div>
                                            <div className="bg-emerald-500/10 rounded-xl p-3">
                                                <div className="text-[10px] text-emerald-400 uppercase font-black mb-1">Matched Skills</div>
                                                <div className="text-xs text-emerald-300">{(c.matched_skills || []).slice(0, 4).join(', ') || '—'}</div>
                                            </div>
                                            <div className="bg-red-500/10 rounded-xl p-3">
                                                <div className="text-[10px] text-red-400 uppercase font-black mb-1">Missing Skills</div>
                                                <div className="text-xs text-red-300">{(c.missing_skills || []).slice(0, 3).join(', ') || 'None'}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {(c.strengths || []).map((s, si) => <span key={si} className="text-[10px] bg-white/5 text-gray-300 px-2 py-0.5 rounded-lg">✓ {s}</span>)}
                                            {(c.concerns || []).map((co, ci) => <span key={ci} className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-lg">⚠ {co}</span>)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
