import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TfiReload, TfiSearch, TfiTarget, TfiStatsUp } from 'react-icons/tfi';
import { toast } from 'sonner';
import hrService from '../../services/hrService';

const REC_STYLE = {
    'Reach Out Now': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'Worth Considering': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'Skip': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};
const RISK_COLOR = { Low: 'text-emerald-400', Medium: 'text-amber-400', High: 'text-red-400' };
const SCORE_COLOR = (s) => s >= 75 ? 'text-emerald-400' : s >= 50 ? 'text-amber-400' : 'text-red-400';

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
        <div className="min-h-screen bg-[#050505] text-white p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter">
                        Smart Talent <span className="text-red-600">Rediscovery</span>
                    </h1>
                    <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest">AI mines your past rejected candidates — finds hidden gems for new openings</p>
                </div>

                {/* How it works */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[['🗄️', 'Scans Past Pool', 'AI analyzes all candidates you previously evaluated or rejected'], ['🔄', 'Matches New Role', 'Finds transferable skills that fit your NEW job opening'], ['📩', 'Re-engagement Ready', 'Gives you personalized outreach scripts for each rediscovery']].map(([icon, title, desc]) => (
                        <div key={title} className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-center">
                            <div className="text-2xl mb-2">{icon}</div>
                            <div className="text-xs font-black uppercase tracking-widest text-white mb-1">{title}</div>
                            <div className="text-[11px] text-gray-500">{desc}</div>
                        </div>
                    ))}
                </div>

                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">New Job Title *</label>
                        <input value={form.job_title} onChange={e => set('job_title', e.target.value)} placeholder="e.g. DevOps Engineer"
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600" />
                    </div>
                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">Job Description (optional but improves accuracy)</label>
                        <textarea value={form.jd_text} onChange={e => set('jd_text', e.target.value)} rows={5}
                            placeholder="Paste the new job description here..."
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600 resize-none" />
                    </div>
                    <button onClick={handleRediscover} disabled={loading}
                        className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:opacity-40 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2">
                        {loading ? <><TfiReload className="animate-spin" /> Scanning Past Talent Pool...</> : <><TfiSearch /> Rediscover Hidden Talent</>}
                    </button>
                </div>

                <AnimatePresence>
                    {result && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            {/* Summary */}
                            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
                                <div className="text-center flex-shrink-0">
                                    <div className="text-5xl font-black text-red-400">{result.total_strong_matches ?? result.rediscovered?.length ?? 0}</div>
                                    <div className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">Strong Matches</div>
                                    {result.top_rediscovery && (
                                        <div className="mt-2 text-xs font-black text-emerald-400">🏆 Top: {result.top_rediscovery}</div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-gray-300 text-sm leading-relaxed">{result.pool_summary}</p>
                                    {result.rediscovery_insight && (
                                        <div className="mt-3 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                                            <p className="text-blue-200 text-xs italic">💡 {result.rediscovery_insight}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Rediscovered Candidates */}
                            <div className="space-y-4">
                                <div className="text-xs font-black uppercase tracking-widest text-gray-400">Rediscovered Candidates — Ranked by Fit</div>
                                {(result.rediscovered || []).map((c, i) => (
                                    <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-4">
                                        <div className="flex items-center gap-4 flex-wrap">
                                            <div className="w-10 h-10 rounded-xl bg-red-600/20 flex items-center justify-center text-red-400 text-sm font-black flex-shrink-0">#{i + 1}</div>
                                            <div className="flex-1">
                                                <div className="text-sm font-black uppercase text-white">{c.name}</div>
                                                <div className="text-[11px] text-gray-400 mt-0.5">Previously: {c.prev_rejection_reason}</div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className={`text-2xl font-black ${SCORE_COLOR(c.new_fit_score)}`}>{c.new_fit_score}%</div>
                                                <div className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border ${REC_STYLE[c.recommendation] || 'bg-gray-700/20 text-gray-400 border-gray-600/30'}`}>{c.recommendation}</div>
                                                <div className={`text-[10px] font-black uppercase ${RISK_COLOR[c.risk_level] || 'text-gray-400'}`}>{c.risk_level} Risk</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                                                <div className="text-[10px] text-emerald-400 font-black uppercase mb-1">Why Fit Now</div>
                                                <div className="text-xs text-emerald-300">{c.why_fit_now}</div>
                                            </div>
                                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                                                <div className="text-[10px] text-blue-400 font-black uppercase mb-1">Transferable Skills</div>
                                                <div className="text-xs text-blue-300">{(c.transferable_skills || []).join(', ') || '—'}</div>
                                            </div>
                                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                                                <div className="text-[10px] text-amber-400 font-black uppercase mb-1">Still Missing</div>
                                                <div className="text-xs text-amber-300">{(c.gap_from_new_role || []).slice(0, 2).join(', ') || 'None identified'}</div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-900/60 border border-white/5 rounded-xl p-4">
                                            <div className="text-[10px] text-gray-400 font-black uppercase mb-2">📩 Re-engagement Angle: <span className="text-white">{c.outreach_angle}</span></div>
                                            <div className="text-sm text-gray-200 italic border-l border-red-600/40 pl-3">"{c.sample_outreach}"</div>
                                            <button onClick={() => {
                                                navigator.clipboard.writeText(c.sample_outreach)
                                                    .then(() => toast.success('Message copied!'))
                                                    .catch(() => toast.error('Copy failed'));
                                            }} className="mt-2 text-[10px] bg-white/5 hover:bg-white/10 text-gray-400 px-3 py-1 rounded-lg font-black uppercase tracking-widest transition-all">Copy Message</button>
                                        </div>
                                    </div>
                                ))}

                                {(result.rediscovered || []).length === 0 && (
                                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 text-center">
                                        <p className="text-amber-300 text-sm">No strong rediscoveries found for this role. Try completing more candidate evaluations to build your talent pool.</p>
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
