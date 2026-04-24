import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
    TfiBolt, TfiReload, TfiCheck, TfiShield, TfiAlert,
    TfiTarget, TfiStatsUp, TfiAngleRight, TfiClose, TfiPulse
} from 'react-icons/tfi';
import authService from '../../services/authService';
import useAuth from '../../hooks/useAuth';

const COMPANY_SIZES = [
    { value: 'startup', label: 'Startup', desc: '<50 employees' },
    { value: 'small', label: 'Small', desc: '50-200 employees' },
    { value: 'medium', label: 'Medium', desc: '200-1000 employees' },
    { value: 'large', label: 'Large', desc: '1000-10K employees' },
    { value: 'enterprise', label: 'Enterprise', desc: '10K+ employees' },
];

export default function SalaryNegotiator() {
    const { user } = useAuth();

    const [form, setForm] = useState({
        job_title: '',
        location: user?.location || '',
        experience_years: '',
        current_offer: '',
        company_size: 'medium',
    });
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    const handleAnalyze = async () => {
        if (!form.job_title.trim()) return toast.error('Please enter the job title.');
        setLoading(true);
        setData(null);
        try {
            const res = await authService.getSalaryNegotiation({
                job_title: form.job_title.trim(),
                location: form.location || 'United States',
                experience_years: parseInt(form.experience_years) || (user?.work_history?.length || 0),
                current_offer: form.current_offer ? parseFloat(form.current_offer) : null,
                company_size: form.company_size,
            });
            setData(res.data);
            setActiveTab('overview');
            toast.success('Salary analysis complete!');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Analysis failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fmt = (n) => {
        if (!n) return 'N/A';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: data?.currency === 'USD' ? 'USD' : 'USD', maximumFractionDigits: 0 }).format(n);
    };

    const TABS = ['overview', 'script', 'counters', 'tips'];

    return (
        <div className="elite-content pb-24">
            {/* Header */}
            <div className="mb-16">
                <h1 className="elite-tactical-header">Salary Negotiation AI</h1>
                <p className="elite-sub-header mt-2 text-gray-400 font-black uppercase tracking-[0.4em] text-[10px] italic">
                    Know Your Worth · Get Market Data · Negotiate With Confidence
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-10">
                {/* ── LEFT: Input Panel ── */}
                <div className="space-y-8">
                    <div className="p-12 bg-white rounded-[3rem] border border-gray-100 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/[0.03] blur-[120px] pointer-events-none" />
                        <div className="flex items-center gap-6 mb-12 relative z-10">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-amber-500 text-white flex items-center justify-center text-3xl shadow-[0_10px_30px_rgba(245,158,11,0.2)] animate-pulse">
                                <TfiBolt />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black uppercase italic tracking-tighter text-gray-950">Analyze My Worth</h2>
                                <p className="text-[10px] font-black uppercase text-amber-600 tracking-[0.4em] italic">AI-Powered · Real Market Data</p>
                            </div>
                        </div>

                        <div className="space-y-8 relative z-10">
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] italic block mb-3">Job Title *</label>
                                <input
                                    className="elite-input h-14 font-black uppercase italic"
                                    placeholder="E.G. SENIOR ENGINEER"
                                    value={form.job_title}
                                    onChange={e => setForm({ ...form, job_title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] italic block mb-3">Location</label>
                                    <input
                                        className="elite-input h-14 font-black italic"
                                        placeholder="City / Country"
                                        value={form.location}
                                        onChange={e => setForm({ ...form, location: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] italic block mb-3">Years of Exp.</label>
                                    <input
                                        type="number" min="0" max="40"
                                        className="elite-input h-14 font-black italic"
                                        placeholder="0"
                                        value={form.experience_years}
                                        onChange={e => setForm({ ...form, experience_years: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] italic block mb-3">Current Offer (optional)</label>
                                <input
                                    type="number" min="0"
                                    className="elite-input h-14 font-black italic"
                                    placeholder="Annual amount, e.g. 70000"
                                    value={form.current_offer}
                                    onChange={e => setForm({ ...form, current_offer: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] italic block mb-4">Company Size</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {COMPANY_SIZES.map(s => (
                                        <button
                                            key={s.value}
                                            onClick={() => setForm({ ...form, company_size: s.value })}
                                            className={`p-3 rounded-xl border text-center transition-all ${form.company_size === s.value ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'}`}
                                        >
                                            <div className="text-[10px] font-black uppercase italic">{s.label}</div>
                                            <div className="text-[8px] text-gray-400 mt-1 hidden sm:block">{s.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleAnalyze}
                                disabled={loading}
                                className={`w-full py-7 rounded-[2rem] text-[12px] font-black uppercase tracking-[0.5em] italic flex items-center justify-center gap-4 shadow-2xl transition-all ${loading ? 'bg-gray-200 text-gray-400 animate-pulse' : 'bg-amber-500 hover:bg-gray-950 text-white active:scale-[0.98]'}`}
                            >
                                {loading ? <><TfiReload className="animate-spin" /> ANALYZING...</> : <><TfiStatsUp className="animate-pulse" /> ANALYZE MY WORTH</>}
                            </button>
                        </div>
                    </div>

                    {/* Skills being used */}
                    {user?.detailed_skills?.length > 0 && (
                        <div className="p-8 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                            <div className="text-[9px] font-black uppercase text-gray-400 tracking-[0.4em] italic mb-6">Your Skills (Used in Analysis)</div>
                            <div className="flex flex-wrap gap-2">
                                {user.detailed_skills.slice(0, 10).map((s, i) => (
                                    <span key={i} className="text-[9px] font-black uppercase bg-gray-50 text-gray-600 px-4 py-2 rounded-xl border border-gray-100 italic">{s}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── RIGHT: Results Panel ── */}
                <div>
                    <AnimatePresence mode="wait">
                        {!data && !loading && (
                            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center py-48 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                                <TfiBolt className="text-8xl text-amber-200 mx-auto mb-10 animate-pulse" />
                                <h3 className="text-3xl font-black uppercase italic text-gray-950 tracking-tighter mb-4">Know Your Value</h3>
                                <p className="text-[12px] font-black uppercase text-gray-400 tracking-[0.5em] italic max-w-md">Fill in the form and let AI calculate your market worth with a complete negotiation strategy.</p>
                            </motion.div>
                        )}

                        {loading && (
                            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center py-48 bg-white rounded-[3rem] border border-gray-100">
                                <div className="relative w-32 h-32 mb-10">
                                    <div className="absolute inset-0 border-r-4 border-amber-500 rounded-full animate-spin" />
                                    <div className="absolute inset-4 border-l-4 border-gray-100 rounded-full animate-spin" style={{ animationDirection: 'reverse' }} />
                                    <div className="flex items-center justify-center h-full text-amber-500"><TfiBolt size={32} className="animate-pulse" /></div>
                                </div>
                                <p className="text-[12px] font-black uppercase text-gray-800 tracking-[1em] animate-pulse italic">Analyzing Market Data...</p>
                            </motion.div>
                        )}

                        {data && (
                            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                {/* Salary Range Card */}
                                <div className="p-12 bg-white rounded-[3rem] border border-gray-100 shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/[0.03] blur-[120px]" />
                                    <div className="flex items-center justify-between mb-10 relative z-10">
                                        <h3 className="text-[11px] font-black uppercase text-gray-400 tracking-[0.5em] italic">Market Salary Range</h3>
                                        <div className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase italic border ${data.confidence === 'high' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : data.confidence === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                            {data.confidence} confidence
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-6 mb-10 relative z-10">
                                        {[
                                            { label: 'Market Min', val: data.market_min, color: 'text-gray-500' },
                                            { label: 'Market Mid', val: data.market_mid, color: 'text-gray-950', big: true },
                                            { label: 'Market Max', val: data.market_max, color: 'text-gray-500' },
                                        ].map((item, i) => (
                                            <div key={i} className={`p-8 bg-gray-50 rounded-[2rem] border border-gray-100 text-center ${item.big ? 'ring-2 ring-amber-400 bg-amber-50 border-amber-100' : ''}`}>
                                                <div className="text-[9px] font-black uppercase text-gray-400 tracking-widest italic mb-4">{item.label}</div>
                                                <div className={`text-3xl font-black italic tracking-tighter ${item.big ? 'text-amber-600' : item.color}`}>{fmt(item.val)}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-6 p-8 bg-gray-950 rounded-[2rem] relative z-10">
                                        <TfiTarget className="text-amber-400 text-2xl flex-shrink-0 animate-pulse" />
                                        <div>
                                            <div className="text-[9px] font-black uppercase text-gray-400 tracking-widest italic mb-1">Recommended Ask</div>
                                            <div className="text-4xl font-black text-amber-400 italic tracking-tighter">{fmt(data.recommended_ask)}</div>
                                        </div>
                                    </div>

                                    {data.market_insight && (
                                        <p className="mt-8 text-[13px] text-gray-500 italic border-l-4 border-amber-200 pl-8 relative z-10">{data.market_insight}</p>
                                    )}
                                </div>

                                {/* Tabs */}
                                <div className="flex gap-3 bg-gray-50 p-3 rounded-[2rem] border border-gray-100">
                                    {TABS.map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] italic transition-all ${activeTab === tab ? 'bg-white shadow-md text-gray-950' : 'text-gray-400 hover:text-gray-700'}`}
                                        >
                                            {tab === 'overview' ? 'Benefits' : tab === 'script' ? 'Script' : tab === 'counters' ? 'Counter-Offers' : 'Tips & Flags'}
                                        </button>
                                    ))}
                                </div>

                                <AnimatePresence mode="wait">
                                    {/* Benefits to negotiate */}
                                    {activeTab === 'overview' && (
                                        <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                                            <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl">
                                                <h3 className="text-[11px] font-black uppercase text-amber-600 tracking-[0.5em] italic mb-8">Beyond Salary — Benefits to Negotiate</h3>
                                                <div className="flex flex-wrap gap-3">
                                                    {(data.benefits_to_negotiate || []).map((b, i) => (
                                                        <span key={i} className="px-6 py-3 bg-amber-50 border border-amber-100 rounded-xl text-[11px] font-black uppercase text-amber-700 italic">{b}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl">
                                                <h3 className="text-[11px] font-black uppercase text-blue-600 tracking-[0.5em] italic mb-8">Power Phrases</h3>
                                                <div className="space-y-4">
                                                    {(data.power_phrases || []).map((p, i) => (
                                                        <div key={i} className="flex items-start gap-4 p-6 bg-blue-50 border border-blue-100 rounded-[1.5rem] text-[13px] text-blue-800 italic">
                                                            <TfiBolt className="text-blue-400 flex-shrink-0 mt-0.5" /> "{p}"
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Negotiation Script */}
                                    {activeTab === 'script' && (
                                        <motion.div key="script" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                            <div className="p-12 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl">
                                                <h3 className="text-[11px] font-black uppercase text-emerald-600 tracking-[0.5em] italic mb-8 flex items-center gap-4">
                                                    <TfiShield /> Your Word-for-Word Negotiation Script
                                                </h3>
                                                <div className="p-10 bg-gray-950 rounded-[2rem] border border-gray-800 relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[60px]" />
                                                    <div className="flex items-start gap-4 mb-6 relative z-10">
                                                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0"><TfiPulse /></div>
                                                        <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest italic pt-2">READY TO USE</span>
                                                    </div>
                                                    <p className="text-[16px] text-white italic leading-[1.9] relative z-10 border-l-4 border-amber-500/30 pl-8">
                                                        "{data.negotiation_script}"
                                                    </p>
                                                </div>
                                                <div className="mt-8 p-6 bg-amber-50 border border-amber-100 rounded-[1.5rem] text-[12px] text-amber-700 italic flex items-center gap-4">
                                                    <TfiAlert className="flex-shrink-0" />
                                                    Practice this script out loud at least 3 times before the actual call. Confidence matters as much as the words.
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Counter-offer responses */}
                                    {activeTab === 'counters' && (
                                        <motion.div key="counters" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                                            {(data.counter_offer_responses || []).map((item, i) => (
                                                <div key={i} className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl">
                                                    <div className="flex items-center gap-4 mb-6">
                                                        <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[11px] font-black flex items-center justify-center">S{i + 1}</div>
                                                        <span className="text-[11px] font-black uppercase text-red-600 tracking-widest italic">{item.scenario}</span>
                                                    </div>
                                                    <div className="p-8 bg-gray-950 rounded-[2rem]">
                                                        <p className="text-[15px] text-white italic leading-relaxed">"{item.response}"</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}

                                    {/* Tips & Red Flags */}
                                    {activeTab === 'tips' && (
                                        <motion.div key="tips" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                                            <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl">
                                                <h3 className="text-[11px] font-black uppercase text-emerald-600 tracking-[0.5em] italic mb-8 flex items-center gap-4"><TfiCheck /> Timing Tips</h3>
                                                <div className="space-y-4">
                                                    {(data.timing_tips || []).map((t, i) => (
                                                        <div key={i} className="flex items-start gap-4 p-5 bg-emerald-50 border border-emerald-100 rounded-[1.5rem] text-[13px] text-emerald-800 italic">
                                                            <TfiCheck className="text-emerald-500 flex-shrink-0 mt-0.5" /> {t}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl">
                                                <h3 className="text-[11px] font-black uppercase text-red-600 tracking-[0.5em] italic mb-8 flex items-center gap-4"><TfiAlert /> Red Flags to Watch</h3>
                                                <div className="space-y-4">
                                                    {(data.red_flags || []).map((r, i) => (
                                                        <div key={i} className="flex items-start gap-4 p-5 bg-red-50 border border-red-100 rounded-[1.5rem] text-[13px] text-red-800 italic">
                                                            <TfiClose className="text-red-500 flex-shrink-0 mt-0.5" /> {r}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
