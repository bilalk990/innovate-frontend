import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TfiReload, TfiStatsUp, TfiPulse } from 'react-icons/tfi';
import { toast } from 'sonner';
import hrService from '../../services/hrService';

const STATUS_STYLE = { red: 'text-red-400 bg-red-500/10 border-red-500/30', amber: 'text-amber-400 bg-amber-500/10 border-amber-500/30', green: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
const PRIORITY_COLOR = { 1: 'bg-red-600', 2: 'bg-amber-500', 3: 'bg-blue-500' };

export default function FunnelAnalyzer() {
    const [form, setForm] = useState({ job_title: '', applications: '', screened: '', phone_screened: '', assessed: '', final_interview: '', offers_made: '', offers_accepted: '', hired: '', time_to_fill: '', cost_per_hire: '' });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState('stages');

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleAnalyze = async () => {
        if (!form.job_title.trim()) return toast.error('Enter job title.');
        if (!form.applications) return toast.error('Enter number of applications.');
        setLoading(true); setResult(null);
        const sanitizedForm = {
            ...form,
            applications: parseInt(form.applications) || 0,
            screened: parseInt(form.screened) || 0,
            phone_screened: parseInt(form.phone_screened) || 0,
            assessed: parseInt(form.assessed) || 0,
            final_interview: parseInt(form.final_interview) || 0,
            offers_made: parseInt(form.offers_made) || 0,
            offers_accepted: parseInt(form.offers_accepted) || 0,
            hired: parseInt(form.hired) || 0,
            time_to_fill: parseInt(form.time_to_fill) || 0,
            cost_per_hire: parseInt(form.cost_per_hire) || 0,
        };
        try {
            const r = await hrService.analyzeFunnel(sanitizedForm);
            setResult(r.data);
        } catch { toast.error('Analysis failed.'); }
        finally { setLoading(false); }
    };

    const STAGES = [
        ['applications', 'Applications'], ['screened', 'Screened'], ['phone_screened', 'Phone Screen'],
        ['assessed', 'Assessment'], ['final_interview', 'Final Interview'],
        ['offers_made', 'Offers Made'], ['offers_accepted', 'Accepted'], ['hired', 'Hired'],
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter">
                        Hiring Funnel <span className="text-red-600">Analyzer</span>
                    </h1>
                    <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest">AI detects where candidates drop off — with actionable fixes</p>
                </div>

                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-5">
                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">Job Title *</label>
                        <input value={form.job_title} onChange={e => set('job_title', e.target.value)} placeholder="e.g. Product Manager"
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {STAGES.map(([k, label]) => (
                            <div key={k}>
                                <label className="text-[10px] uppercase tracking-widest text-gray-500 block mb-1">{label}</label>
                                <input type="number" min={0} value={form[k]} onChange={e => set(k, e.target.value)} placeholder="0"
                                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-600" />
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] uppercase tracking-widest text-gray-500 block mb-1">Time to Fill (days)</label>
                            <input type="number" value={form.time_to_fill} onChange={e => set('time_to_fill', e.target.value)} placeholder="45"
                                className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-600" />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-widest text-gray-500 block mb-1">Cost per Hire ($)</label>
                            <input type="number" value={form.cost_per_hire} onChange={e => set('cost_per_hire', e.target.value)} placeholder="5000"
                                className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-600" />
                        </div>
                    </div>
                    <button onClick={handleAnalyze} disabled={loading}
                        className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:opacity-40 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2">
                        {loading ? <><TfiReload className="animate-spin" /> Analyzing...</> : <><TfiStatsUp /> Analyze My Funnel</>}
                    </button>
                </div>

                <AnimatePresence>
                    {result && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            {/* Health Score */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-1 bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-3">
                                    <div className="text-6xl font-black text-red-400">{result.funnel_health_score}</div>
                                    <div className="text-xs uppercase tracking-widest text-gray-400">Funnel Health</div>
                                    <div className="text-sm font-black uppercase text-white">{result.funnel_health_label}</div>
                                    <div className="w-full bg-gray-800 rounded-full h-2">
                                        <div className="bg-red-600 h-2 rounded-full" style={{ width: `${result.funnel_health_score}%` }} />
                                    </div>
                                </div>
                                <div className="md:col-span-2 bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-3">
                                    <div className="text-xs font-black uppercase tracking-widest text-gray-400">Executive Summary</div>
                                    <p className="text-gray-200 text-sm leading-relaxed">{result.executive_summary}</p>
                                    {result.biggest_bottleneck && (
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mt-3">
                                            <div className="text-xs font-black uppercase tracking-widest text-red-400 mb-1">🚨 Biggest Bottleneck — {result.biggest_bottleneck.stage}</div>
                                            <p className="text-red-200 text-xs">{result.biggest_bottleneck.root_cause}</p>
                                            <p className="text-red-300 text-xs mt-2 font-medium">Quick Fix: {result.biggest_bottleneck.quick_fix}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 flex-wrap">
                                {['stages', 'patterns', 'roadmap', 'diversity'].map(t => (
                                    <button key={t} onClick={() => setActiveTab(t)}
                                        className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                                        {t === 'stages' ? 'Stage Analysis' : t === 'patterns' ? 'Patterns' : t === 'roadmap' ? 'Fix Roadmap' : 'Diversity'}
                                    </button>
                                ))}
                            </div>

                            {activeTab === 'stages' && (
                                <div className="space-y-3">
                                    {(result.stage_analysis || []).map((s, i) => (
                                        <div key={i} className={`border rounded-2xl p-5 ${STATUS_STYLE[s.status] || 'bg-white/[0.03] border-white/10 text-gray-300'}`}>
                                            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                                                <div className="text-sm font-black uppercase">{s.stage}</div>
                                                <div className="flex gap-3 text-xs font-black uppercase">
                                                    <span>Drop: {s.drop_rate}</span>
                                                    <span className="text-gray-400">Benchmark: {s.industry_benchmark}</span>
                                                </div>
                                            </div>
                                            <p className="text-xs mb-2 opacity-80">{s.insight}</p>
                                            <div className="text-xs font-medium opacity-90">💡 Fix: {s.fix}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'patterns' && (
                                <div className="space-y-4">
                                    {(result.patterns_detected || []).map((p, i) => (
                                        <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                                            <div className="text-sm font-black text-white mb-2">{p.pattern}</div>
                                            <div className="text-xs text-gray-400 mb-2">Evidence: {p.evidence}</div>
                                            <div className="text-xs text-blue-300">→ Action: {p.action}</div>
                                        </div>
                                    ))}
                                    {result.benchmark_comparison && (
                                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5">
                                            <div className="text-xs font-black uppercase tracking-widest text-blue-400 mb-3">Benchmark Comparison</div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                {Object.entries(result.benchmark_comparison).map(([k, v]) => (
                                                    <div key={k} className="bg-white/5 rounded-xl p-3 text-center">
                                                        <div className="text-xs text-gray-400 uppercase">{k.replace(/_/g, ' ')}</div>
                                                        <div className="text-sm font-black text-white mt-1">{v}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                                        <div className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-2">Predicted Improvement</div>
                                        <p className="text-emerald-200 text-sm">{result.predicted_improvement}</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'roadmap' && (
                                <div className="space-y-3">
                                    {(result.optimization_roadmap || []).map((item, i) => (
                                        <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex items-start gap-4">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0 ${PRIORITY_COLOR[item.priority] || 'bg-gray-600'}`}>{item.priority}</div>
                                            <div className="flex-1">
                                                <div className="text-sm font-black text-white">{item.action}</div>
                                                <div className="flex gap-3 mt-2">
                                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${item.effort === 'Low' ? 'bg-emerald-500/20 text-emerald-400' : item.effort === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>Effort: {item.effort}</span>
                                                    <span className="text-xs text-gray-400">{item.impact}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'diversity' && (
                                <div className="space-y-3">
                                    {(result.diversity_flags || []).length > 0 ? (result.diversity_flags || []).map((f, i) => (
                                        <div key={i} className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                                            <div className="text-sm text-purple-200 mb-2">{f.flag}</div>
                                            <div className="text-xs text-purple-300">→ {f.recommendation}</div>
                                        </div>
                                    )) : (
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center text-emerald-300 text-sm">No diversity flags detected with current data.</div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
