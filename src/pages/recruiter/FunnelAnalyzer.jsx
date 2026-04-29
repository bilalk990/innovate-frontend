import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TfiReload, TfiStatsUp, TfiPulse } from 'react-icons/tfi';
import { toast } from 'sonner';
import hrService from '../../services/hrService';

const STATUS_STYLE = { red: 'text-red-700 bg-red-50 border-red-100', amber: 'text-amber-700 bg-amber-50 border-amber-100', green: 'text-emerald-700 bg-emerald-50 border-emerald-100' };
const PRIORITY_COLOR = { 1: 'bg-red-600', 2: 'bg-amber-600', 3: 'bg-blue-600' };

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
            setActiveTab('stages');
        } catch { toast.error('Analysis failed.'); }
        finally { setLoading(false); }
    };

    const STAGES = [
        ['applications', 'Applications'], ['screened', 'Screened'], ['phone_screened', 'Phone Screen'],
        ['assessed', 'Assessment'], ['final_interview', 'Final Interview'],
        ['offers_made', 'Offers Made'], ['offers_accepted', 'Accepted'], ['hired', 'Hired'],
    ];

    return (
        <div className="min-h-screen bg-white text-gray-950 p-8">
            <div className="max-w-6xl mx-auto space-y-12">
                
                {/* Header */}
                <div className="text-center pt-8">
                    <h1 className="text-6xl font-black italic uppercase tracking-tighter text-gray-950 leading-none">
                        FUNNEL <span className="text-red-600 underline decoration-red-600/20 underline-offset-8">ANALYZER</span>
                    </h1>
                    <p className="text-gray-400 text-[10px] mt-6 font-black uppercase tracking-[0.4em] italic">AI Diagnostic Engine for Candidate Drop-off Detection</p>
                </div>

                {/* Data Input Matrix */}
                <div className="bg-white border-2 border-gray-50 rounded-[3.5rem] p-12 shadow-2xl space-y-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/[0.01] blur-[80px]" />
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 italic ml-6">Operational Target (Job Title)</label>
                        <input value={form.job_title} onChange={e => set('job_title', e.target.value)} placeholder="E.G. PRODUCT ARCHITECT"
                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-[2rem] px-10 py-6 text-sm text-gray-950 font-black italic uppercase tracking-tighter focus:outline-none focus:border-red-600/50 focus:bg-white transition-all shadow-inner" />
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {STAGES.map(([k, label]) => (
                            <div key={k} className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 italic ml-4">{label}</label>
                                <input type="number" min={0} value={form[k]} onChange={e => set(k, e.target.value)} placeholder="0"
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-[1.5rem] px-6 py-4 text-sm text-gray-950 font-black focus:outline-none focus:border-red-600/30 shadow-inner" />
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 italic ml-6">Efficiency (Time to Fill — Days)</label>
                            <input type="number" value={form.time_to_fill} onChange={e => set('time_to_fill', e.target.value)} placeholder="45"
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-[2rem] px-10 py-5 text-sm text-gray-950 font-black shadow-inner focus:border-red-600/30" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 italic ml-6">Cost Vector (Cost per Hire — USD)</label>
                            <input type="number" value={form.cost_per_hire} onChange={e => set('cost_per_hire', e.target.value)} placeholder="5000"
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-[2rem] px-10 py-5 text-sm text-gray-950 font-black shadow-inner focus:border-red-600/30" />
                        </div>
                    </div>
                    <button onClick={handleAnalyze} disabled={loading}
                        className="w-full py-8 bg-red-600 hover:bg-red-700 disabled:opacity-30 rounded-[2.5rem] font-black uppercase tracking-[0.5em] text-[11px] text-white transition-all duration-500 flex items-center justify-center gap-4 shadow-[0_20px_40px_-10px_rgba(220,38,38,0.3)] active:scale-[0.98] group">
                        {loading ? <><TfiReload className="animate-spin text-xl" /> AUDITING FUNNEL...</> : <><TfiStatsUp className="text-xl group-hover:scale-125 transition-transform" /> INITIALIZE DIAGNOSTIC</>}
                    </button>
                </div>

                <AnimatePresence>
                    {result && (
                        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                            
                            {/* Executive Health Overview */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-1 bg-gray-50 border-2 border-gray-100 rounded-[4rem] p-12 flex flex-col items-center justify-center gap-8 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-full h-full bg-red-600/[0.02] blur-[80px]" />
                                    <div className="text-8xl font-black text-red-600 italic tracking-tighter uppercase leading-none group-hover:scale-110 transition-transform">{result.funnel_health_score}</div>
                                    <div className="space-y-2 text-center relative z-10">
                                        <div className="text-[10px] uppercase tracking-[0.6em] text-gray-400 font-black italic">HEALTH INDEX</div>
                                        <div className="text-xl font-black uppercase text-gray-950 italic">{result.funnel_health_label}</div>
                                    </div>
                                    <div className="w-full bg-white border border-gray-100 rounded-full h-4 overflow-hidden shadow-inner">
                                        <div className="bg-red-600 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(220,38,38,0.5)]" style={{ width: `${result.funnel_health_score}%` }} />
                                    </div>
                                </div>
                                <div className="lg:col-span-2 bg-white border-2 border-gray-50 rounded-[4rem] p-12 space-y-10 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/[0.01] blur-[80px]" />
                                    <div className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 italic flex items-center gap-4">
                                        <span className="w-12 h-1 bg-gray-950 rounded-full" /> EXECUTIVE INTELLIGENCE SUMMARY
                                    </div>
                                    <p className="text-2xl text-gray-950 font-black italic uppercase tracking-tighter leading-tight">"{result.executive_summary}"</p>
                                    {result.biggest_bottleneck && (
                                        <div className="bg-red-50 border-4 border-red-600/20 rounded-[3rem] p-10 mt-6 shadow-xl hover:scale-[1.02] transition-transform">
                                            <div className="text-[12px] font-black uppercase tracking-[0.4em] text-red-600 mb-6 flex items-center gap-4 italic">
                                                <TfiPulse className="animate-pulse" /> CRITICAL BOTTLENECK: {result.biggest_bottleneck.stage}
                                            </div>
                                            <p className="text-red-950 text-lg font-black italic uppercase tracking-tight leading-tight">"{result.biggest_bottleneck.root_cause}"</p>
                                            <div className="mt-8 pt-8 border-t border-red-200 text-red-600 text-xs font-black uppercase tracking-[0.2em] italic">
                                                RECOMMENDED PATCH: <span className="text-red-950">{result.biggest_bottleneck.quick_fix}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Navigator Tabs */}
                            <div className="flex gap-4 flex-wrap justify-center p-2 bg-gray-50 rounded-[2.5rem] w-fit mx-auto border border-gray-100 shadow-sm">
                                {[
                                    ['stages', '📊 STAGE ANALYSIS'],
                                    ['patterns', '🧩 BEHAVIORAL PATTERNS'],
                                    ['roadmap', '🚀 OPTIMIZATION ROADMAP'],
                                    ['diversity', '🌍 INCLUSION AUDIT']
                                ].map(([t, label]) => (
                                    <button key={t} onClick={() => setActiveTab(t)}
                                        className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 italic ${activeTab === t ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-950'}`}>
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content Section */}
                            <div className="bg-white border-2 border-gray-50 rounded-[3.5rem] p-12 shadow-2xl min-h-[500px]">
                                {activeTab === 'stages' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {Array.isArray(result.stage_analysis) && result.stage_analysis.map((s, i) => (
                                            <div key={i} className={`border-4 rounded-[3rem] p-10 shadow-xl hover:scale-[1.02] transition-all duration-500 group ${STATUS_STYLE[s.status] || 'bg-white border-gray-50 text-gray-300'}`}>
                                                <div className="flex items-center justify-between flex-wrap gap-4 mb-8 border-b border-black/5 pb-6">
                                                    <div className="text-xl font-black uppercase italic tracking-tighter">{s.stage}</div>
                                                    <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest">
                                                        <span className="bg-white/50 px-4 py-1.5 rounded-full border border-black/5">DROP: {s.drop_rate}</span>
                                                        <span className="bg-black/5 px-4 py-1.5 rounded-full">TARGET: {s.industry_benchmark}</span>
                                                    </div>
                                                </div>
                                                <p className="text-sm font-black italic uppercase tracking-tight mb-6 opacity-90 leading-relaxed">"{s.insight}"</p>
                                                <div className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/40 p-5 rounded-2xl border border-black/5">
                                                    <span className="text-gray-900 block mb-2 opacity-60">STRATEGIC FIX:</span>
                                                    {s.fix}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'patterns' && (
                                    <div className="space-y-10">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            {Array.isArray(result.patterns_detected) && result.patterns_detected.map((p, i) => (
                                                <div key={i} className="bg-gray-50 border-2 border-gray-100 rounded-[3rem] p-10 hover:bg-white transition-all duration-500 group relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/[0.01] blur-[60px]" />
                                                    <div className="text-xl font-black text-gray-950 mb-6 italic uppercase tracking-tighter border-b border-gray-100 pb-4 group-hover:text-red-600 transition-colors">{p.pattern}</div>
                                                    <div className="text-[11px] text-gray-400 font-black uppercase tracking-widest mb-6 italic">Evidence: {p.evidence}</div>
                                                    <div className="bg-blue-50 text-blue-700 p-6 rounded-[2rem] border border-blue-100 text-sm font-black italic uppercase tracking-tight shadow-sm">
                                                        REQUIRED ACTION: {p.action}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {result.benchmark_comparison && (
                                            <div className="bg-gray-950 border-4 border-red-600/20 rounded-[4rem] p-16 shadow-2xl relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 blur-[120px]" />
                                                <div className="text-[11px] font-black uppercase tracking-[0.6em] text-red-500 mb-12 italic text-center underline decoration-red-950 underline-offset-8">INDUSTRY BENCHMARK DELTA</div>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                                                    {Object.entries(result.benchmark_comparison).map(([k, v]) => (
                                                        <div key={k} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 text-center hover:bg-white/10 transition-all group">
                                                            <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em] mb-4 italic group-hover:text-red-400 transition-colors">{k.replace(/_/g, ' ')}</div>
                                                            <div className="text-3xl font-black text-white italic tracking-tighter uppercase">{v}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <div className="bg-emerald-50 border-4 border-emerald-100 rounded-[3rem] p-12 text-center shadow-xl group">
                                            <div className="text-[11px] font-black uppercase tracking-[0.5em] text-emerald-600 mb-6 italic">PREDICTED ROI MULTIPLIER</div>
                                            <p className="text-4xl text-emerald-950 font-black italic uppercase tracking-tighter leading-none group-hover:scale-105 transition-transform">"{result.predicted_improvement}"</p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'roadmap' && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {Array.isArray(result.optimization_roadmap) && result.optimization_roadmap.map((item, i) => (
                                            <div key={i} className="bg-gray-50 border-2 border-gray-100 rounded-[3rem] p-10 flex items-center gap-10 hover:bg-white transition-all duration-500 group relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/[0.01] blur-[60px]" />
                                                <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center text-2xl font-black text-white flex-shrink-0 italic shadow-2xl group-hover:rotate-12 transition-transform ${PRIORITY_COLOR[item.priority] || 'bg-gray-600'}`}>{item.priority}</div>
                                                <div className="flex-1 space-y-4">
                                                    <div className="text-xl font-black text-gray-950 italic uppercase tracking-tighter leading-tight">{item.action}</div>
                                                    <div className="flex gap-6 items-center">
                                                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-xl border-2 italic ${item.effort === 'Low' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : item.effort === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>EFFORT: {item.effort}</span>
                                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 italic">IMPACT: {item.impact}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'diversity' && (
                                    <div className="space-y-8">
                                        <div className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 italic text-center mb-10">INCLUSION & EQUITY AUDIT LOG</div>
                                        {Array.isArray(result.diversity_flags) && result.diversity_flags.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {result.diversity_flags.map((f, i) => (
                                                    <div key={i} className="bg-purple-50 border-4 border-purple-100 rounded-[3rem] p-10 shadow-xl hover:scale-[1.02] transition-transform">
                                                        <div className="text-lg text-purple-950 font-black italic uppercase tracking-tight mb-6 border-b border-purple-200 pb-4">"{f.flag}"</div>
                                                        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-purple-600 italic">RECOMMENDATION: <span className="text-purple-950 underline decoration-purple-200 underline-offset-4">{f.recommendation}</span></div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="bg-emerald-50 border-4 border-emerald-100 rounded-[4rem] p-20 text-center shadow-2xl group">
                                                <div className="text-emerald-600 text-6xl font-black italic mb-8 uppercase tracking-tighter group-hover:scale-110 transition-transform">PASSED</div>
                                                <div className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-400 italic">ZERO DIVERSITY FLAGS DETECTED IN CURRENT DATASET</div>
                                            </div>
                                        )}
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
