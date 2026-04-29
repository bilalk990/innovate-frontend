import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TfiReload, TfiCup, TfiUser } from 'react-icons/tfi';
import { toast } from 'sonner';
import hrService from '../../services/hrService';
import authService from '../../services/authService';

const PROB_COLOR = (p) => p >= 75 ? 'text-emerald-600' : p >= 50 ? 'text-amber-600' : 'text-red-600';
const PROB_BG = (p) => p >= 75 ? 'bg-emerald-600' : p >= 50 ? 'bg-amber-600' : 'bg-red-600';

export default function OfferPredictor() {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [form, setForm] = useState({
        candidate_id: '', candidate_name: '', current_salary: '', expected_salary: '',
        base_salary: '', total_package: '', benefits: 'Health, Dental, PTO',
        remote_policy: 'Hybrid', start_date: 'Flexible', role_level: 'Mid',
        enthusiasm_score: 7, has_competing_offers: false, notes: ''
    });

    useEffect(() => {
        authService.getUsers('candidate').then(r => {
            const data = Array.isArray(r.data) ? r.data : (r.data?.results || []);
            setCandidates(data);
        }).catch(() => { });
    }, []);

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handlePredict = async () => {
        if (!form.base_salary) return toast.error('Enter the base salary offer.');
        setLoading(true); setResult(null);
        try {
            const r = await hrService.predictOfferAcceptance(form);
            setResult(r.data);
            setActiveTab('overview');
        } catch { toast.error('Prediction failed.'); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-white text-gray-950 p-8">
            <div className="max-w-6xl mx-auto space-y-12 pb-20">
                
                {/* Header Section */}
                <div className="text-center pt-8">
                    <h1 className="text-6xl font-black italic uppercase tracking-tighter text-gray-950 leading-none">
                        OFFER <span className="text-red-600 underline decoration-red-600/20 underline-offset-8">PREDICTOR</span>
                    </h1>
                    <p className="text-gray-400 text-[10px] mt-6 font-black uppercase tracking-[0.4em] italic">AI Simulation for Offer Acceptance Probability & Negotiation Strategy</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Candidate Configuration */}
                    <div className="bg-white border-2 border-gray-50 rounded-[3.5rem] p-12 shadow-2xl space-y-10 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-red-600/[0.01] blur-[80px]" />
                        <div className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 italic flex items-center gap-4">
                            <span className="w-12 h-1 bg-gray-950 rounded-full" /> CANDIDATE PROFILE
                        </div>
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 italic ml-6">Target Candidate</label>
                                <select value={form.candidate_id} onChange={e => {
                                    const id = e.target.value;
                                    const found = candidates.find(c => String(c.id || c._id) === id);
                                    setForm(p => ({ ...p, candidate_id: id, candidate_name: found ? (found.name || '') : p.candidate_name }));
                                }}
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-[2rem] px-10 py-5 text-sm text-gray-950 font-black italic uppercase tracking-tighter focus:outline-none focus:border-red-600/50 shadow-inner appearance-none">
                                    <option value="">MANUAL ENTRY</option>
                                    {candidates.map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.name?.toUpperCase()}</option>)}
                                </select>
                            </div>
                            {[['candidate_name', 'Full Name'], ['current_salary', 'Current Compensation'], ['expected_salary', 'Expectation Range']].map(([k, ph]) => (
                                <div key={k} className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 italic ml-6">{ph}</label>
                                    <input value={form[k]} onChange={e => set(k, e.target.value)} placeholder={`E.G. ${ph.toUpperCase()}`}
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-[2rem] px-10 py-5 text-sm text-gray-950 font-black italic uppercase tracking-tighter focus:outline-none focus:border-red-600/30 shadow-inner" />
                                </div>
                            ))}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 italic ml-6">Engagement Level: {form.enthusiasm_score}/10</label>
                                <div className="px-6">
                                    <input type="range" min={1} max={10} value={form.enthusiasm_score} onChange={e => set('enthusiasm_score', +e.target.value)}
                                        className="w-full h-3 bg-gray-100 rounded-full appearance-none cursor-pointer accent-red-600" />
                                </div>
                            </div>
                            <button onClick={() => set('has_competing_offers', !form.has_competing_offers)}
                                className={`w-full py-6 rounded-[2rem] border-2 transition-all duration-500 font-black uppercase tracking-[0.3em] text-[10px] italic flex items-center justify-center gap-4 ${form.has_competing_offers ? 'bg-red-50 border-red-200 text-red-600 shadow-lg' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                                {form.has_competing_offers ? 'COMPETING OFFERS DETECTED' : 'NO COMPETING OFFERS'}
                            </button>
                        </div>
                    </div>

                    {/* Offer Parameters */}
                    <div className="bg-white border-2 border-gray-50 rounded-[3.5rem] p-12 shadow-2xl space-y-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/[0.01] blur-[80px]" />
                        <div className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 italic flex items-center gap-4">
                            <span className="w-12 h-1 bg-gray-950 rounded-full" /> PROPOSED OFFER
                        </div>
                        <div className="space-y-6">
                            {[['base_salary', 'Base Salary *'], ['total_package', 'Total Compensation'], ['benefits', 'Benefits / Perks'], ['start_date', 'Anticipated Start']].map(([k, ph]) => (
                                <div key={k} className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 italic ml-6">{ph}</label>
                                    <input value={form[k]} onChange={e => set(k, e.target.value)} placeholder={`E.G. ${ph.toUpperCase()}`}
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-[2.5rem] px-10 py-4 text-sm text-gray-950 font-black italic uppercase tracking-tighter focus:outline-none focus:border-red-600/30 shadow-inner" />
                                </div>
                            ))}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 italic ml-6">Remote Policy</label>
                                    <select value={form.remote_policy} onChange={e => set('remote_policy', e.target.value)}
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-[2rem] px-8 py-4 text-sm text-gray-950 font-black italic uppercase tracking-tighter appearance-none shadow-inner">
                                        {['On-site', 'Hybrid', 'Fully Remote'].map(o => <option key={o}>{o.toUpperCase()}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 italic ml-6">Seniority Level</label>
                                    <select value={form.role_level} onChange={e => set('role_level', e.target.value)}
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-[2rem] px-8 py-4 text-sm text-gray-950 font-black italic uppercase tracking-tighter appearance-none shadow-inner">
                                        {['Junior', 'Mid', 'Senior', 'Lead', 'Manager', 'Director'].map(o => <option key={o}>{o.toUpperCase()}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <button onClick={handlePredict} disabled={loading}
                            className="w-full py-8 bg-red-600 hover:bg-red-700 disabled:opacity-30 rounded-[2.5rem] font-black uppercase tracking-[0.5em] text-[11px] text-white transition-all duration-500 flex items-center justify-center gap-4 shadow-[0_20px_40px_-10px_rgba(220,38,38,0.3)] active:scale-[0.98] group">
                            {loading ? <><TfiReload className="animate-spin text-xl" /> RUNNING SIMULATION...</> : <><TfiCup className="text-xl group-hover:scale-125 transition-transform" /> ANALYZE PROBABILITY</>}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {result && (
                        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                            
                            {/* Probability Hero */}
                            <div className="bg-gray-50 border-2 border-gray-100 rounded-[4rem] p-16 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center gap-16">
                                <div className="absolute top-0 right-0 w-full h-full bg-red-600/[0.02] blur-[100px] pointer-events-none" />
                                <div className="flex flex-col items-center flex-shrink-0 text-center relative z-10">
                                    <div className={`text-[120px] font-black italic tracking-tighter leading-none group-hover:scale-110 transition-transform ${PROB_COLOR(result.acceptance_probability)}`}>
                                        {result.acceptance_probability}%
                                    </div>
                                    <div className="text-[10px] uppercase tracking-[0.6em] text-gray-400 font-black mt-4 italic">ACCEPTANCE INDEX</div>
                                    <div className="w-64 bg-white border border-gray-100 rounded-full h-5 mt-8 overflow-hidden shadow-inner p-1">
                                        <div className={`h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(220,38,38,0.3)] ${PROB_BG(result.acceptance_probability)}`} style={{ width: `${result.acceptance_probability}%` }} />
                                    </div>
                                </div>
                                <div className="flex-1 space-y-8 relative z-10">
                                    <div className="space-y-2">
                                        <div className="text-4xl font-black italic uppercase tracking-tighter text-gray-950 leading-none">{result.verdict}</div>
                                        <div className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-black italic">{result.confidence_level} CONFIDENCE SCORE</div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                                        <div className="space-y-4">
                                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 italic">POSITIVE VECTORS</div>
                                            {Array.isArray(result.positive_signals) && result.positive_signals.map((s, i) => (
                                                <div key={i} className="text-xs text-emerald-900 font-black italic uppercase flex items-start gap-4"><span className="w-2 h-2 rounded-full bg-emerald-500 mt-1" />{s}</div>
                                            ))}
                                        </div>
                                        <div className="space-y-4">
                                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 italic">FRICTION FACTORS</div>
                                            {Array.isArray(result.risk_factors) && result.risk_factors.map((s, i) => (
                                                <div key={i} className="text-xs text-red-900 font-black italic uppercase flex items-start gap-4"><span className="w-2 h-2 rounded-full bg-red-500 mt-1" />{s}</div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Strategy Tabs */}
                            <div className="flex gap-4 p-2 bg-gray-50 rounded-[2.5rem] w-fit mx-auto border border-gray-100 shadow-sm">
                                {['overview', 'script', 'counter', 'sweeteners'].map(t => (
                                    <button key={t} onClick={() => setActiveTab(t)}
                                        className={`px-10 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest italic transition-all duration-500 ${activeTab === t ? 'bg-red-600 text-white shadow-2xl shadow-red-600/30' : 'text-gray-400 hover:text-gray-950'}`}>
                                        {t === 'overview' ? 'Market Analysis' : t === 'script' ? 'Negotiation Script' : t === 'counter' ? 'Counter Defense' : 'Offer Sweeteners'}
                                    </button>
                                ))}
                            </div>

                            {/* Content Section */}
                            <div className="min-h-[500px]">
                                {activeTab === 'overview' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {result.salary_gap_analysis && (
                                            <div className="bg-amber-50 border-4 border-amber-100 rounded-[3.5rem] p-12 shadow-2xl hover:scale-[1.02] transition-transform">
                                                <div className="text-[11px] font-black uppercase tracking-[0.5em] text-amber-600 mb-8 italic flex items-center gap-4"><span className="w-12 h-1 bg-amber-200 rounded-full" /> SALARY DELTA AUDIT</div>
                                                <div className="text-5xl font-black text-gray-950 italic tracking-tighter mb-2">{result.salary_gap_analysis.gap_amount}</div>
                                                <div className="text-[10px] text-amber-600 font-black uppercase italic tracking-widest mb-10">{result.salary_gap_analysis.gap_severity} DISCREPANCY</div>
                                                <div className="bg-white/80 p-8 rounded-[2rem] border-2 border-amber-100">
                                                    <p className="text-amber-950 text-sm font-black italic uppercase leading-relaxed">"{result.salary_gap_analysis.recommendation}"</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="bg-white border-2 border-gray-50 rounded-[3.5rem] p-12 shadow-2xl group hover:border-red-600/20 transition-all duration-500">
                                            <div className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-400 mb-8 italic flex items-center gap-4"><span className="w-12 h-1 bg-gray-200 rounded-full" /> TEMPORAL ADVICE</div>
                                            <p className="text-xl text-gray-950 font-black italic uppercase tracking-tighter leading-tight">"{result.timing_advice}"</p>
                                        </div>
                                        <div className="md:col-span-2 bg-gray-950 border-4 border-red-600/20 rounded-[4rem] p-16 shadow-2xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 blur-[120px]" />
                                            <div className="text-[11px] font-black uppercase tracking-[0.6em] text-red-500 mb-12 italic text-center underline decoration-red-950 underline-offset-8">RECOMMENDED PACKAGE REVISIONS</div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {Array.isArray(result.recommended_offer_adjustments) && result.recommended_offer_adjustments.map((a, i) => (
                                                    <div key={i} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex items-center gap-8 hover:bg-white/10 transition-all group">
                                                        <div className="text-[10px] font-black text-red-500 uppercase tracking-widest italic group-hover:scale-110 transition-transform">{a.impact}</div>
                                                        <div className="flex-1 space-y-2">
                                                            <div className="text-sm text-white font-black italic uppercase tracking-tight leading-relaxed">{a.adjustment}</div>
                                                            <div className={`text-[9px] font-black uppercase tracking-[0.2em] w-fit px-4 py-1 rounded-full italic ${a.cost === 'Low' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-900/50' : 'bg-red-900/30 text-red-400 border border-red-900/50'}`}>COST: {a.cost}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'script' && (
                                    <div className="bg-gray-50 border-2 border-gray-100 rounded-[3.5rem] p-16 shadow-2xl relative group">
                                        <div className="absolute top-8 right-12 flex gap-4">
                                            <button onClick={() => { navigator.clipboard.writeText(result.negotiation_script); toast.success('Protocol Copied'); }}
                                                className="px-8 py-4 bg-white border-2 border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] italic text-gray-400 hover:text-red-600 hover:border-red-600/30 transition-all active:scale-95 shadow-sm">COPY PROTOCOL</button>
                                        </div>
                                        <div className="text-[11px] font-black uppercase tracking-[0.6em] text-gray-400 mb-12 italic border-b border-gray-200 pb-8 flex items-center gap-6"><span className="w-12 h-1 bg-gray-200 rounded-full" /> VERBAL NEGOTIATION SCRIPT</div>
                                        <div className="bg-white border-2 border-gray-100 rounded-[2rem] p-12 shadow-inner">
                                            <p className="text-lg text-gray-950 font-black italic uppercase leading-relaxed tracking-tight whitespace-pre-wrap">"{result.negotiation_script}"</p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'counter' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {Array.isArray(result.counter_offer_scenarios) && result.counter_offer_scenarios.map((s, i) => (
                                            <div key={i} className="bg-white border-2 border-gray-50 rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden group hover:border-red-600/20 transition-all duration-500">
                                                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600 mb-8 italic">SCENARIO {i + 1} DEFENSE</div>
                                                <p className="text-xl text-gray-950 font-black italic uppercase tracking-tighter leading-tight mb-10">"{s.scenario}"</p>
                                                <div className="bg-emerald-50 border-2 border-emerald-100 rounded-[2rem] p-8 mb-6">
                                                    <div className="text-[9px] text-emerald-600 font-black uppercase tracking-[0.3em] mb-4 italic">OPTIMIZED RESPONSE</div>
                                                    <p className="text-emerald-950 text-sm font-bold italic uppercase leading-relaxed">"{s.response}"</p>
                                                </div>
                                                <div className="text-[10px] text-gray-400 font-black uppercase italic tracking-[0.2em] ml-4">FLEXIBILITY THRESHOLD: <span className="text-gray-950">{s.max_flex}</span></div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'sweeteners' && (
                                    <div className="space-y-10">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            {Array.isArray(result.package_sweeteners) && result.package_sweeteners.map((s, i) => (
                                                <div key={i} className="bg-gray-50 border-2 border-gray-100 rounded-[2.5rem] p-8 flex items-center gap-8 hover:bg-white transition-all duration-500 group shadow-xl">
                                                    <div className="w-16 h-16 rounded-[1.5rem] bg-red-600 text-white flex items-center justify-center text-3xl font-black shadow-2xl group-hover:rotate-12 transition-transform">🎁</div>
                                                    <span className="text-lg text-gray-950 font-black italic uppercase tracking-tighter">{s}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bg-red-50 border-4 border-red-100 rounded-[4rem] p-16 shadow-2xl">
                                            <div className="text-[11px] font-black uppercase tracking-[0.5em] text-red-600 mb-10 italic text-center">WALK-AWAY TERMINATION SIGNALS</div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {Array.isArray(result.walk_away_signals) && result.walk_away_signals.map((s, i) => (
                                                    <div key={i} className="flex items-center gap-6 bg-white/60 p-6 rounded-[2rem] border-2 border-red-100 hover:scale-[1.02] transition-transform">
                                                        <span className="text-2xl">🚩</span>
                                                        <span className="text-xs text-red-950 font-black italic uppercase tracking-tight">{s}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
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
