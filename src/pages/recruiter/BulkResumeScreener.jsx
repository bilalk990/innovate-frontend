import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TfiReload, TfiSearch, TfiUser, TfiStatsUp } from 'react-icons/tfi';
import { toast } from 'sonner';
import hrService from '../../services/hrService';
import authService from '../../services/authService';

const TIER_STYLE = {
    'Tier 1: Strong': 'border-emerald-100 bg-emerald-50 text-emerald-950',
    'Tier 2: Good': 'border-blue-100 bg-blue-50 text-blue-950',
    'Tier 3: Consider': 'border-amber-100 bg-amber-50 text-amber-950',
    'Tier 4: Pass': 'border-red-100 bg-red-50 text-red-950',
};
const REC_COLOR = { Shortlist: 'bg-emerald-600 shadow-emerald-600/30', 'Phone Screen': 'bg-blue-600 shadow-blue-600/30', Hold: 'bg-amber-600 shadow-amber-600/30', Reject: 'bg-red-600 shadow-red-600/30' };
const SCORE_COLOR = (s) => s >= 75 ? 'text-emerald-600' : s >= 50 ? 'text-amber-600' : 'text-red-600';

export default function BulkResumeScreener() {
    const [candidates, setCandidates] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [jdText, setJdText] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        authService.getUsers('candidate').then(r => {
            const data = Array.isArray(r.data) ? r.data : (r.data?.results || []);
            setCandidates(data);
        }).catch(() => {});
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
        <div className="min-h-screen bg-white text-gray-950 p-8">
            <div className="max-w-6xl mx-auto space-y-12 pb-20">
                
                {/* Header */}
                <div className="text-center pt-8">
                    <h1 className="text-6xl font-black italic uppercase tracking-tighter text-gray-950 leading-none">
                        RESUME <span className="text-red-600 underline decoration-red-600/20 underline-offset-8">SCREENER</span>
                    </h1>
                    <p className="text-gray-400 text-[10px] mt-6 font-black uppercase tracking-[0.4em] italic">AI Neural Batch Processing for Rapid Candidate Qualification</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Candidate Matrix */}
                    <div className="bg-white border-2 border-gray-50 rounded-[3.5rem] p-12 shadow-2xl space-y-10 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-red-600/[0.01] blur-[80px]" />
                        <div className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 italic flex items-center gap-4">
                            <span className="w-12 h-1 bg-gray-950 rounded-full" /> TARGET SELECTION (MAX 15)
                        </div>
                        <div className="grid grid-cols-1 gap-3 max-h-[450px] overflow-y-auto pr-4 custom-scrollbar">
                            {candidates.map(c => {
                                const id = String(c.id || c._id);
                                const sel = selectedIds.includes(id);
                                return (
                                    <button key={id} onClick={() => toggle(id)}
                                        className={`flex items-center gap-6 p-6 rounded-[2rem] border-2 text-left transition-all duration-500 group/item ${sel ? 'border-red-600 bg-red-50 shadow-xl' : 'border-gray-50 hover:border-gray-100 bg-gray-50/50'}`}>
                                        <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center text-sm font-black italic flex-shrink-0 transition-all duration-500 ${sel ? 'bg-red-600 text-white rotate-12' : 'bg-gray-200 text-gray-500'}`}>{c.name?.charAt(0).toUpperCase() || 'C'}</div>
                                        <div className="flex-1">
                                            <div className="text-sm font-black uppercase italic tracking-tight text-gray-950 leading-none">{c.name}</div>
                                            <div className="text-[10px] text-gray-400 font-black uppercase mt-2 tracking-widest">{c.email}</div>
                                        </div>
                                        {sel && <div className="text-red-600 text-xl font-black italic">✓</div>}
                                    </button>
                                );
                            })}
                            {candidates.length === 0 && <p className="text-gray-400 text-xs font-black uppercase italic text-center py-10">NO TARGETS DETECTED</p>}
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 italic border-t border-gray-50 pt-8 text-center">{selectedIds.length} / 15 DEPLOYED</div>
                    </div>

                    {/* Operational JD Input */}
                    <div className="bg-white border-2 border-gray-50 rounded-[4rem] p-16 shadow-2xl flex flex-col relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-full h-full bg-red-600/[0.01] blur-[120px] pointer-events-none" />
                        <div className="space-y-10 relative z-10 flex-1 flex flex-col">
                            <div className="text-[11px] font-black uppercase tracking-[0.6em] text-red-600 mb-6 italic underline decoration-red-100 underline-offset-8">DESIGNATION PARAMETERS</div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 italic ml-6">Target Designation *</label>
                                <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="E.G. SYSTEMS ARCHITECT"
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-[2rem] px-10 py-6 text-sm text-gray-950 font-black italic uppercase focus:outline-none focus:border-red-600/50 focus:bg-white transition-all shadow-inner" />
                            </div>
                            <div className="flex-1 flex flex-col space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 italic ml-6">Requirement Manifest *</label>
                                <textarea value={jdText} onChange={e => setJdText(e.target.value)}
                                    placeholder="PASTE JOB SPECIFICATIONS HERE FOR NEURAL ALIGNMENT..."
                                    className="w-full flex-1 bg-gray-50 border-2 border-gray-100 rounded-[2.5rem] px-10 py-8 text-sm text-gray-950 font-black italic uppercase resize-none focus:outline-none focus:border-red-600/50 focus:bg-white transition-all shadow-inner scrollbar-hide" />
                            </div>
                        </div>
                        <button onClick={handleScreen} disabled={loading || selectedIds.length < 1}
                            className="w-full py-8 bg-red-600 hover:bg-red-700 disabled:opacity-30 rounded-[2.5rem] font-black uppercase tracking-[0.5em] text-[11px] text-white transition-all duration-500 flex items-center justify-center gap-4 shadow-[0_20px_40px_-10px_rgba(220,38,38,0.3)] active:scale-[0.98] mt-10 group relative z-10">
                            {loading ? <><TfiReload className="animate-spin text-xl" /> NEURAL PROCESSING...</> : <><TfiSearch className="text-xl group-hover:scale-125 transition-transform" /> INITIALIZE BATCH SCREENING</>}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {result && (
                        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                            
                            {/* Analytics Summary */}
                            <div className="bg-gray-50 border-2 border-gray-100 rounded-[4rem] p-16 shadow-2xl flex flex-col lg:flex-row items-center gap-16 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-full h-full bg-red-600/[0.02] blur-[120px] pointer-events-none" />
                                <div className="flex gap-16 text-center relative z-10 flex-shrink-0">
                                    {[
                                        ['SCREENED', result.ranked_candidates?.length || 0, 'text-gray-950'],
                                        ['SHORTLIST', result.shortlist_count || 0, 'text-emerald-600'],
                                        ['POOL QUALITY', result.pool_quality, 'text-red-600']
                                    ].map(([label, val, color]) => (
                                        <div key={label} className="group-hover:scale-110 transition-transform duration-500">
                                            <div className={`text-6xl font-black italic tracking-tighter leading-none ${color}`}>{val}</div>
                                            <div className="text-[9px] uppercase tracking-[0.4em] text-gray-400 font-black mt-3 italic">{label}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex-1 space-y-6 relative z-10 text-center lg:text-left border-l-2 border-gray-200 lg:pl-16">
                                    <div className="text-[11px] font-black uppercase tracking-[0.5em] text-red-600 italic">ELITE CANDIDATE DETECTED: <span className="text-gray-950 underline decoration-red-600/20 underline-offset-4">{result.top_pick}</span></div>
                                    <p className="text-xl text-gray-950 font-black italic uppercase tracking-tighter leading-tight">"{result.screening_summary}"</p>
                                    {(result.common_gaps || []).length > 0 && (
                                        <div className="flex flex-wrap gap-3 pt-4 justify-center lg:justify-start">
                                            <span className="text-[10px] text-gray-400 font-black uppercase italic tracking-widest mt-2">SYSTEMIC GAPS:</span>
                                            {result.common_gaps.map((g, i) => <span key={i} className="text-[9px] font-black uppercase italic tracking-widest bg-amber-50 text-amber-600 border border-amber-100 px-4 py-1.5 rounded-full shadow-sm">{g}</span>)}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Ranked Candidate Matrix */}
                            <div className="space-y-8">
                                <div className="text-[11px] font-black uppercase tracking-[0.6em] text-gray-400 italic text-center underline decoration-red-600/20 underline-offset-8 mb-12">NEURAL RANKING MATRIX</div>
                                {(result.ranked_candidates || []).map((c, i) => (
                                    <div key={i} className={`border-4 rounded-[4rem] p-12 space-y-8 hover:scale-[1.01] transition-all duration-500 group/card shadow-2xl relative overflow-hidden ${TIER_STYLE[c.tier] || 'bg-white border-gray-50'}`}>
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 blur-[100px] pointer-events-none" />
                                        <div className="flex items-center gap-10 flex-wrap relative z-10">
                                            <div className="w-24 h-24 rounded-[2.5rem] bg-gray-950 text-white flex items-center justify-center text-4xl font-black italic shadow-2xl group-hover/card:rotate-12 transition-transform">#{c.rank}</div>
                                            <div className="flex-1">
                                                <div className="text-3xl font-black uppercase italic tracking-tighter text-gray-950 leading-none">{c.name}</div>
                                                <div className="text-[10px] text-gray-500 font-black uppercase italic mt-4 tracking-widest">DIAGNOSTIC: {c.one_liner}</div>
                                            </div>
                                            <div className="flex flex-col items-center gap-3">
                                                <div className={`text-[120px] font-black italic tracking-tighter leading-none h-[110px] flex items-center ${SCORE_COLOR(c.match_score)}`}>{c.match_score}%</div>
                                                <div className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 italic">NEURAL MATCH</div>
                                            </div>
                                            <div className="flex flex-col gap-4">
                                                <div className={`px-10 py-4 rounded-[2rem] text-[10px] font-black uppercase italic tracking-widest text-white text-center ${REC_COLOR[c.recommendation] || 'bg-gray-600'}`}>{c.recommendation}</div>
                                                <div className="text-[9px] font-black uppercase tracking-[0.6em] text-gray-400 italic text-center">{c.tier}</div>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                                            <div className="bg-white/80 border-2 border-gray-100 rounded-[2.5rem] p-8 group/box hover:bg-white transition-all duration-500 shadow-sm">
                                                <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.4em] mb-6 italic">EXPERIENCE VECTOR</div>
                                                <div className="text-sm text-gray-950 font-black italic uppercase leading-tight">"{c.experience_fit}"</div>
                                            </div>
                                            <div className="bg-emerald-50 border-2 border-emerald-100 rounded-[2.5rem] p-8 group/box hover:bg-white transition-all duration-500 shadow-sm">
                                                <div className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.4em] mb-6 italic">MATCHED COMPETENCIES</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {(c.matched_skills || []).slice(0, 5).map(s => <span key={s} className="bg-emerald-600 text-white text-[9px] font-black uppercase px-4 py-1.5 rounded-full italic shadow-lg">{s}</span>)}
                                                </div>
                                            </div>
                                            <div className="bg-red-50 border-2 border-red-100 rounded-[2.5rem] p-8 group/box hover:bg-white transition-all duration-500 shadow-sm">
                                                <div className="text-[10px] text-red-600 font-black uppercase tracking-[0.4em] mb-6 italic">CRITICAL GAPS</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {(c.missing_skills || []).slice(0, 4).map(s => <span key={s} className="bg-red-600 text-white text-[9px] font-black uppercase px-4 py-1.5 rounded-full italic shadow-lg">{s}</span>)}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3 flex-wrap relative z-10 pt-4 border-t border-gray-100/50">
                                            {(c.strengths || []).map((s, si) => <span key={si} className="text-[9px] font-black uppercase italic tracking-widest bg-emerald-50 text-emerald-600 px-6 py-2 rounded-full border border-emerald-100">ELITE: {s}</span>)}
                                            {(c.concerns || []).map((co, ci) => <span key={ci} className="text-[9px] font-black uppercase italic tracking-widest bg-amber-50 text-amber-600 px-6 py-2 rounded-full border border-amber-100">WARNING: {co}</span>)}
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
