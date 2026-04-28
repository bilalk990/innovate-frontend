import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TfiReload, TfiCup, TfiUser } from 'react-icons/tfi';
import { toast } from 'sonner';
import hrService from '../../services/hrService';
import authService from '../../services/authService';

const PROB_COLOR = (p) => p >= 75 ? 'text-emerald-400' : p >= 50 ? 'text-amber-400' : 'text-red-400';
const PROB_BG = (p) => p >= 75 ? 'bg-emerald-600' : p >= 50 ? 'bg-amber-500' : 'bg-red-600';

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
        authService.getUsers('candidate').then(r => setCandidates(r.data || [])).catch(() => { });
    }, []);

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handlePredict = async () => {
        if (!form.base_salary) return toast.error('Enter the base salary offer.');
        setLoading(true); setResult(null);
        try {
            const r = await hrService.predictOfferAcceptance(form);
            setResult(r.data);
        } catch { toast.error('Prediction failed.'); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter">
                        Offer Acceptance <span className="text-red-600">Predictor</span>
                    </h1>
                    <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest">AI predicts if candidate will accept — with negotiation strategy</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Candidate Info */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
                        <div className="text-xs font-black uppercase tracking-widest text-gray-400">Candidate Details</div>
                        <div>
                            <label className="text-[10px] uppercase tracking-widest text-gray-500 block mb-1">Select Candidate</label>
                            <select value={form.candidate_id} onChange={e => {
                                const id = e.target.value;
                                const found = candidates.find(c => String(c.id || c._id) === id);
                                setForm(p => ({ ...p, candidate_id: id, candidate_name: found ? (found.name || '') : p.candidate_name }));
                            }}
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600">
                                <option value="">Manual entry below</option>
                                {candidates.map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>)}
                            </select>
                        </div>
                        {[['candidate_name', 'Candidate Name'], ['current_salary', 'Current Salary (e.g. $80,000)'], ['expected_salary', 'Expected Salary (e.g. $95,000)']].map(([k, ph]) => (
                            <div key={k}>
                                <label className="text-[10px] uppercase tracking-widest text-gray-500 block mb-1">{ph}</label>
                                <input value={form[k]} onChange={e => set(k, e.target.value)} placeholder={ph}
                                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600" />
                            </div>
                        ))}
                        <div>
                            <label className="text-[10px] uppercase tracking-widest text-gray-500 block mb-1">Enthusiasm Level (1-10): {form.enthusiasm_score}</label>
                            <input type="range" min={1} max={10} value={form.enthusiasm_score} onChange={e => set('enthusiasm_score', +e.target.value)}
                                className="w-full accent-red-600" />
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-xs text-gray-300">Has Competing Offers?</label>
                            <button onClick={() => set('has_competing_offers', !form.has_competing_offers)}
                                className={`w-12 h-6 rounded-full transition-all ${form.has_competing_offers ? 'bg-red-600' : 'bg-gray-700'}`}>
                                <div className={`w-5 h-5 bg-white rounded-full transition-all mx-0.5 ${form.has_competing_offers ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Offer Details */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
                        <div className="text-xs font-black uppercase tracking-widest text-gray-400">Offer Details</div>
                        {[['base_salary', 'Base Salary *'], ['total_package', 'Total Package'], ['benefits', 'Benefits'], ['start_date', 'Start Date']].map(([k, ph]) => (
                            <div key={k}>
                                <label className="text-[10px] uppercase tracking-widest text-gray-500 block mb-1">{ph}</label>
                                <input value={form[k]} onChange={e => set(k, e.target.value)} placeholder={ph}
                                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600" />
                            </div>
                        ))}
                        <div>
                            <label className="text-[10px] uppercase tracking-widest text-gray-500 block mb-1">Remote Policy</label>
                            <select value={form.remote_policy} onChange={e => set('remote_policy', e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600">
                                {['On-site', 'Hybrid', 'Fully Remote'].map(o => <option key={o}>{o}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-widest text-gray-500 block mb-1">Role Level</label>
                            <select value={form.role_level} onChange={e => set('role_level', e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600">
                                {['Junior', 'Mid', 'Senior', 'Lead', 'Manager', 'Director'].map(o => <option key={o}>{o}</option>)}
                            </select>
                        </div>
                        <button onClick={handlePredict} disabled={loading}
                            className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:opacity-40 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2">
                            {loading ? <><TfiReload className="animate-spin" /> Predicting...</> : <><TfiCup /> Predict Acceptance</>}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {result && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            {/* Probability Hero */}
                            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8">
                                <div className="flex flex-col items-center">
                                    <div className={`text-7xl font-black ${PROB_COLOR(result.acceptance_probability)}`}>
                                        {result.acceptance_probability}%
                                    </div>
                                    <div className="text-xs uppercase tracking-widest text-gray-400 mt-1">Acceptance Probability</div>
                                    <div className="w-48 bg-gray-800 rounded-full h-2 mt-3">
                                        <div className={`h-2 rounded-full transition-all ${PROB_BG(result.acceptance_probability)}`} style={{ width: `${result.acceptance_probability}%` }} />
                                    </div>
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div className="text-xl font-black uppercase">{result.verdict}</div>
                                    <div className="text-xs uppercase tracking-widest text-gray-400">{result.confidence_level} confidence</div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                                        {(result.positive_signals || []).map((s, i) => (
                                            <div key={i} className="text-xs text-emerald-300 flex items-start gap-1"><span className="text-emerald-500">✓</span>{s}</div>
                                        ))}
                                        {(result.risk_factors || []).map((s, i) => (
                                            <div key={i} className="text-xs text-red-300 flex items-start gap-1"><span className="text-red-500">⚠</span>{s}</div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 flex-wrap">
                                {['overview', 'script', 'counter', 'sweeteners'].map(t => (
                                    <button key={t} onClick={() => setActiveTab(t)}
                                        className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                                        {t === 'overview' ? 'Analysis' : t === 'script' ? 'Offer Script' : t === 'counter' ? 'Counter Scenarios' : 'Sweeteners'}
                                    </button>
                                ))}
                            </div>

                            {activeTab === 'overview' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {result.salary_gap_analysis && (
                                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
                                            <div className="text-xs font-black uppercase tracking-widest text-amber-400 mb-2">Salary Gap Analysis</div>
                                            <div className="text-2xl font-black text-white">{result.salary_gap_analysis.gap_amount}</div>
                                            <div className="text-xs text-amber-300 mt-1 capitalize">{result.salary_gap_analysis.gap_severity} gap</div>
                                            <p className="text-gray-300 text-xs mt-3">{result.salary_gap_analysis.recommendation}</p>
                                        </div>
                                    )}
                                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                                        <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Timing Advice</div>
                                        <p className="text-gray-300 text-sm">{result.timing_advice}</p>
                                    </div>
                                    <div className="md:col-span-2 bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                                        <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Recommended Adjustments</div>
                                        <div className="space-y-2">
                                            {(result.recommended_offer_adjustments || []).map((a, i) => (
                                                <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                                                    <div className="text-xs font-black text-red-400 flex-shrink-0">{a.impact}</div>
                                                    <div className="text-xs text-gray-200 flex-1">{a.adjustment}</div>
                                                    <div className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${a.cost === 'Low' ? 'bg-emerald-500/20 text-emerald-400' : a.cost === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>{a.cost}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'script' && (
                                <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="text-xs font-black uppercase tracking-widest text-gray-400">Word-for-Word Offer Script</div>
                                        <button onClick={() => { navigator.clipboard.writeText(result.negotiation_script); toast.success('Script copied!'); }}
                                            className="text-xs bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-1.5 rounded-lg font-black uppercase tracking-widest">Copy</button>
                                    </div>
                                    <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{result.negotiation_script}</p>
                                </div>
                            )}

                            {activeTab === 'counter' && (
                                <div className="space-y-4">
                                    {(result.counter_offer_scenarios || []).map((s, i) => (
                                        <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-3">
                                            <div className="text-xs font-black uppercase tracking-widest text-amber-400">Scenario {i + 1}</div>
                                            <div className="text-sm font-medium text-white">"{s.scenario}"</div>
                                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                                                <div className="text-[10px] text-emerald-400 font-black uppercase mb-1">Your Response</div>
                                                <p className="text-emerald-200 text-sm">{s.response}</p>
                                            </div>
                                            <div className="text-xs text-gray-500">Max flexibility: {s.max_flex}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'sweeteners' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {(result.package_sweeteners || []).map((s, i) => (
                                        <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center text-xs font-black flex-shrink-0">🎁</div>
                                            <span className="text-sm text-gray-200">{s}</span>
                                        </div>
                                    ))}
                                    <div className="sm:col-span-2 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                        <div className="text-xs font-black uppercase tracking-widest text-red-400 mb-2">Walk-Away Signals</div>
                                        {(result.walk_away_signals || []).map((s, i) => (
                                            <div key={i} className="text-xs text-red-300 flex items-start gap-2 mb-1"><span>🚩</span>{s}</div>
                                        ))}
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
