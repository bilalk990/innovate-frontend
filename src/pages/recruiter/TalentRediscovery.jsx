import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TfiReload, TfiSearch, TfiTarget, TfiStatsUp } from 'react-icons/tfi';
import { toast } from 'sonner';
import hrService from '../../services/hrService';

const REC_STYLE = {
    'Reach Out Now': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'Worth Considering': 'bg-blue-50 text-blue-600 border-blue-100',
    'Skip': 'bg-gray-50 text-gray-600 border-gray-100',
};
const RISK_COLOR = { Low: 'text-emerald-600', Medium: 'text-amber-600', High: 'text-red-600' };
const SCORE_COLOR = (s) => s >= 75 ? 'text-emerald-600' : s >= 50 ? 'text-amber-600' : 'text-red-600';

export default function TalentRediscovery() {
    const [form, setForm] = useState({ job_title: '', jd_text: '' });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleRediscover = async () => {
        if (!form.job_title.trim()) return toast.error('Enter the new job title.');
        setLoading(true); setResult(null);
        try {
            const r = await hrService.rediscoverTalent(form);
            setResult(r.data);
            const count = r.data?.total_strong_matches || r.data?.rediscovered?.length || 0;
            toast.success(`Found ${count} rediscoverable candidate${count !== 1 ? 's' : ''}!`);
        } catch (err) { toast.error(err.response?.data?.error || 'Talent rediscovery failed. Make sure you have past evaluations.'); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-white text-gray-950 p-8">
            <div className="max-w-6xl mx-auto space-y-12 pb-20">
                
                {/* Header */}
                <div className="text-center pt-8">
                    <h1 className="text-6xl font-black italic uppercase tracking-tighter text-gray-950 leading-none">
                        TALENT <span className="text-red-600 underline decoration-red-600/20 underline-offset-8">REDISCOVERY</span>
                    </h1>
                    <p className="text-gray-400 text-[10px] mt-6 font-black uppercase tracking-[0.4em] italic">AI Mining System for Historical Candidate Pools & Hidden Gems</p>
                </div>

                {/* Tactical Workflow */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    {[
                        ['🗄️', 'ARCHIVE SCAN', 'AI ANALYZES ALL PREVIOUSLY EVALUATED OR REJECTED CANDIDATES'],
                        ['🔄', 'DYNAMIC MATCHING', 'IDENTIFIES TRANSFERABLE SKILLS FOR THE NEW JOB DESIGNATION'],
                        ['📩', 'RE-ENTRY PROTOCOL', 'GENERATES PERSONALIZED OUTREACH SCRIPTS FOR EACH TARGET']
                    ].map(([icon, title, desc]) => (
                        <div key={title} className="bg-gray-50 border-2 border-gray-100 rounded-[3rem] p-8 text-center hover:scale-105 transition-transform group">
                            <div className="text-4xl mb-6 group-hover:rotate-12 transition-transform">{icon}</div>
                            <div className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-950 mb-4 italic underline decoration-red-600/20 underline-offset-4">{title}</div>
                            <div className="text-[10px] text-gray-400 font-black uppercase italic leading-relaxed">{desc}</div>
                        </div>
                    ))}
                </div>

                {/* Configuration Input */}
                <div className="bg-white border-2 border-gray-50 rounded-[4rem] p-16 shadow-2xl space-y-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/[0.01] blur-[80px]" />
                    <div className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 italic flex items-center gap-4">
                        <span className="w-12 h-1 bg-gray-950 rounded-full" /> NEW DESIGNATION CONFIG
                    </div>
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 italic ml-6">Target Job Title *</label>
                            <input value={form.job_title} onChange={e => set('job_title', e.target.value)} placeholder="E.G. DEVOPS ARCHITECT"
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-[2rem] px-10 py-6 text-sm text-gray-950 font-black italic uppercase tracking-tighter focus:outline-none focus:border-red-600/30 shadow-inner" />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 italic ml-6">Designation Requirements (Optional)</label>
                            <textarea value={form.jd_text} onChange={e => set('jd_text', e.target.value)} rows={6}
                                placeholder="PASTE JOB SPECIFICATIONS HERE FOR NEURAL MATCHING..."
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-[2.5rem] px-10 py-8 text-sm text-gray-950 font-black italic uppercase tracking-tighter focus:outline-none focus:border-red-600/30 shadow-inner resize-none" />
                        </div>
                        <button onClick={handleRediscover} disabled={loading}
                            className="w-full py-8 bg-red-600 hover:bg-red-700 disabled:opacity-30 rounded-[2.5rem] font-black uppercase tracking-[0.5em] text-[11px] text-white transition-all duration-500 flex items-center justify-center gap-4 shadow-[0_20px_40px_-10px_rgba(220,38,38,0.3)] active:scale-[0.98] group">
                            {loading ? <><TfiReload className="animate-spin text-xl" /> SCANNING ARCHIVES...</> : <><TfiSearch className="text-xl group-hover:scale-125 transition-transform" /> INITIALIZE REDISCOVERY</>}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {result && (
                        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                            
                            {/* Analytics Summary */}
                            <div className="bg-gray-950 border-4 border-red-600/20 rounded-[4rem] p-16 shadow-2xl flex flex-col lg:flex-row items-center gap-16 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 blur-[120px]" />
                                <div className="text-center flex-shrink-0 relative z-10">
                                    <div className="text-[120px] font-black text-red-600 italic tracking-tighter leading-none group-hover:scale-110 transition-transform duration-700">{result.total_strong_matches ?? result.rediscovered?.length ?? 0}</div>
                                    <div className="text-[10px] uppercase tracking-[0.6em] text-red-500 font-black mt-4 italic">NEURAL MATCHES DETECTED</div>
                                    {result.top_rediscovery && (
                                        <div className="mt-8 bg-white/5 border border-white/10 px-8 py-3 rounded-full text-[10px] font-black text-emerald-400 italic uppercase tracking-widest">🏆 ELITE MATCH: {result.top_rediscovery}</div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-8 relative z-10 text-center lg:text-left">
                                    <p className="text-2xl text-white font-black italic uppercase tracking-tighter leading-tight">"{result.pool_summary}"</p>
                                    {result.rediscovery_insight && (
                                        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 relative group/insight overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl pointer-events-none" />
                                            <p className="text-blue-300 text-sm font-black italic uppercase leading-relaxed tracking-tight">💡 INSIGHT: {result.rediscovery_insight}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Rediscovered Feed */}
                            <div className="space-y-8">
                                <div className="text-[11px] font-black uppercase tracking-[0.6em] text-gray-400 italic text-center underline decoration-red-600/20 underline-offset-8 mb-12">RANKED CANDIDATE MATRIX</div>
                                {Array.isArray(result.rediscovered) && result.rediscovered.map((c, i) => (
                                    <div key={i} className="bg-white border-2 border-gray-50 rounded-[4rem] p-12 shadow-2xl space-y-10 hover:border-red-600/20 transition-all duration-500 group/card">
                                        <div className="flex items-center gap-10 flex-wrap">
                                            <div className="w-24 h-24 rounded-[2.5rem] bg-gray-950 text-white flex items-center justify-center text-3xl font-black italic shadow-2xl group-hover/card:rotate-12 transition-transform">#{i + 1}</div>
                                            <div className="flex-1">
                                                <div className="text-3xl font-black uppercase italic tracking-tighter text-gray-950 leading-none">{c.name}</div>
                                                <div className="text-[10px] text-gray-400 font-black uppercase italic tracking-[0.2em] mt-3">PREVIOUS DECISION: {c.prev_rejection_reason}</div>
                                            </div>
                                            <div className="flex flex-col items-center gap-4">
                                                <div className={`text-6xl font-black italic tracking-tighter leading-none ${SCORE_COLOR(c.new_fit_score)}`}>{c.new_fit_score}%</div>
                                                <div className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 italic">FIT SCORE</div>
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                <div className={`text-[10px] font-black uppercase italic tracking-widest px-8 py-3 rounded-full border-4 shadow-xl ${REC_STYLE[c.recommendation] || 'bg-gray-50 text-gray-600 border-gray-100'}`}>{c.recommendation}</div>
                                                <div className={`text-[9px] font-black uppercase italic tracking-[0.4em] text-center ${RISK_COLOR[c.risk_level] || 'text-gray-400'}`}>{c.risk_level} ATTRITION RISK</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="bg-emerald-50 border-2 border-emerald-100 rounded-[2.5rem] p-8 group/box hover:bg-white transition-all duration-500 shadow-sm">
                                                <div className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.4em] mb-6 italic">FIT LOGIC</div>
                                                <div className="text-sm text-emerald-950 font-black italic uppercase leading-relaxed">"{c.why_fit_now}"</div>
                                            </div>
                                            <div className="bg-blue-50 border-2 border-blue-100 rounded-[2.5rem] p-8 group/box hover:bg-white transition-all duration-500 shadow-sm">
                                                <div className="text-[10px] text-blue-600 font-black uppercase tracking-[0.4em] mb-6 italic">TRANSFERABLE VECTORS</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {(Array.isArray(c.transferable_skills) ? c.transferable_skills : []).map(s => (
                                                        <span key={s} className="bg-white border border-blue-200 text-[9px] font-black text-blue-800 uppercase px-3 py-1 rounded-full italic">{s}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="bg-amber-50 border-2 border-amber-100 rounded-[2.5rem] p-8 group/box hover:bg-white transition-all duration-500 shadow-sm">
                                                <div className="text-[10px] text-amber-600 font-black uppercase tracking-[0.4em] mb-6 italic">CAPABILITY GAPS</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {(Array.isArray(c.gap_from_new_role) ? c.gap_from_new_role : []).map(g => (
                                                        <span key={g} className="bg-white border border-amber-200 text-[9px] font-black text-amber-800 uppercase px-3 py-1 rounded-full italic">{g}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 border-2 border-gray-100 rounded-[3.5rem] p-12 relative group/outreach overflow-hidden shadow-inner">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/[0.01] blur-[80px]" />
                                            <div className="text-[11px] font-black uppercase tracking-[0.6em] text-gray-400 mb-8 italic flex items-center justify-between">
                                                <span>OUTREACH PROTOCOL: <span className="text-gray-950">{c.outreach_angle}</span></span>
                                                <button onClick={() => {
                                                    navigator.clipboard.writeText(c.sample_outreach).then(() => toast.success('Protocol Copied'));
                                                }} className="px-8 py-3 bg-white border-2 border-gray-100 rounded-full text-[9px] font-black text-gray-400 hover:text-red-600 hover:border-red-600/30 transition-all shadow-sm">COPY SCRIPT</button>
                                            </div>
                                            <div className="bg-white border-2 border-gray-100 rounded-[2rem] p-10 shadow-sm">
                                                <p className="text-lg text-gray-950 font-black italic uppercase leading-relaxed tracking-tight">"{c.sample_outreach}"</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {(!Array.isArray(result.rediscovered) || result.rediscovered.length === 0) && (
                                    <div className="bg-amber-50 border-4 border-amber-100 rounded-[3.5rem] p-16 text-center shadow-2xl">
                                        <p className="text-xl text-amber-950 font-black italic uppercase tracking-tighter">NO STRONG REDISCOVERIES FOUND FOR THIS DESIGNATION. EXPAND YOUR ARCHIVE TO IMPROVE NEURAL MATCHING.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}        </AnimatePresence>
            </div>
        </div>
    );
}
