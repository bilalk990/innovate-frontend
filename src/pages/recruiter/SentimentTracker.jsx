import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TfiReload, TfiPulse, TfiUser, TfiPlus, TfiClose } from 'react-icons/tfi';
import { toast } from 'sonner';
import hrService from '../../services/hrService';
import authService from '../../services/authService';

const SENTIMENT_COLOR = {
    'Very Positive': 'text-emerald-600', 'Positive': 'text-green-600',
    'Neutral': 'text-gray-600', 'Negative': 'text-amber-600', 'Very Negative': 'text-red-600'
};
const SENTIMENT_BG = {
    'Very Positive': 'bg-emerald-50 border-emerald-100',
    'Positive': 'bg-green-50 border-green-100',
    'Neutral': 'bg-gray-50 border-gray-100',
    'Negative': 'bg-amber-50 border-amber-100',
    'Very Negative': 'bg-red-50 border-red-100',
};
const DROPOUT_COLOR = { Low: 'text-emerald-600', Medium: 'text-amber-600', High: 'text-red-600' };
const URGENCY_COLOR = { Immediate: 'bg-red-600 shadow-red-600/30', 'This Week': 'bg-amber-600 shadow-amber-600/30', Standard: 'bg-blue-600 shadow-blue-600/30' };
const INTERACTION_TYPES = ['Application', 'Phone Screen', 'Interview', 'Email Sent', 'Email Received', 'No Response', 'Follow-up', 'Offer Extended', 'Reference Check', 'Other'];

export default function SentimentTracker() {
    const [candidates, setCandidates] = useState([]);
    const [candidateId, setCandidateId] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [interactions, setInteractions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [newInteraction, setNewInteraction] = useState({ date: new Date().toISOString().slice(0, 10), type: 'Email Sent', notes: '' });

    useEffect(() => {
        authService.getUsers('candidate').then(r => {
            const data = Array.isArray(r.data) ? r.data : (r.data?.results || []);
            setCandidates(data);
        }).catch(() => { });
    }, []);

    const addInteraction = () => {
        if (!newInteraction.notes.trim()) return toast.error('Add notes for this interaction.');
        setInteractions(p => [...p, { ...newInteraction }]);
        setNewInteraction(p => ({ ...p, notes: '' }));
    };

    const handleAnalyze = async () => {
        if (!jobTitle.trim()) return toast.error('Enter the job title.');
        setLoading(true); setResult(null);
        try {
            const cand = candidates.find(c => String(c.id || c._id) === candidateId);
            const r = await hrService.trackSentiment({
                candidate_id: candidateId,
                candidate_name: cand?.name || 'Unknown Candidate',
                job_title: jobTitle,
                interactions,
            });
            setResult(r.data);
            setActiveTab('overview');
        } catch (err) {
            const msg = err.response?.data?.error || 'Sentiment analysis failed.';
            toast.error(msg);
        }
        finally { setLoading(false); }
    };

    const engScore = result?.engagement_score ?? 0;

    return (
        <div className="min-h-screen bg-white text-gray-950 p-8">
            <div className="max-w-6xl mx-auto space-y-12 pb-20">
                
                {/* Header */}
                <div className="text-center pt-8">
                    <h1 className="text-6xl font-black italic uppercase tracking-tighter text-gray-950 leading-none">
                        SENTIMENT <span className="text-red-600 underline decoration-red-600/20 underline-offset-8">TRACKER</span>
                    </h1>
                    <p className="text-gray-400 text-[10px] mt-6 font-black uppercase tracking-[0.4em] italic">AI Linguistics for Engagement Monitoring & Attrition Prediction</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Interaction Matrix */}
                    <div className="bg-white border-2 border-gray-50 rounded-[3.5rem] p-12 shadow-2xl space-y-10 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-red-600/[0.01] blur-[80px]" />
                        <div className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 italic flex items-center gap-4">
                            <span className="w-12 h-1 bg-gray-950 rounded-full" /> TARGET SELECTION
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 italic ml-6">Target Candidate</label>
                                <select value={candidateId} onChange={e => setCandidateId(e.target.value)}
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-[2rem] px-10 py-5 text-sm text-gray-950 font-black italic uppercase tracking-tighter focus:outline-none focus:border-red-600/50 shadow-inner appearance-none">
                                    <option value="">SELECT CANDIDATE</option>
                                    {candidates.map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.name?.toUpperCase()}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 italic ml-6">Job Designation *</label>
                                <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="E.G. PRODUCT ARCHITECT"
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-[2rem] px-10 py-5 text-sm text-gray-950 font-black italic uppercase tracking-tighter focus:outline-none focus:border-red-600/30 shadow-inner" />
                            </div>
                        </div>

                        {/* Touchpoint Logging */}
                        <div className="border-t-2 border-gray-50 pt-10 space-y-8">
                            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 italic ml-4">LOG TOUCHPOINT</div>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="date" value={newInteraction.date} onChange={e => setNewInteraction(p => ({ ...p, date: e.target.value }))}
                                    className="bg-gray-50 border-2 border-gray-100 rounded-[1.5rem] px-8 py-4 text-xs text-gray-950 font-black italic shadow-inner" />
                                <select value={newInteraction.type} onChange={e => setNewInteraction(p => ({ ...p, type: e.target.value }))}
                                    className="bg-gray-50 border-2 border-gray-100 rounded-[1.5rem] px-8 py-4 text-xs text-gray-950 font-black italic shadow-inner appearance-none">
                                    {INTERACTION_TYPES.map(t => <option key={t}>{t.toUpperCase()}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-4">
                                <input value={newInteraction.notes} onChange={e => setNewInteraction(p => ({ ...p, notes: e.target.value }))}
                                    placeholder="QUALITATIVE NOTES..."
                                    className="flex-1 bg-gray-50 border-2 border-gray-100 rounded-[2rem] px-10 py-5 text-sm text-gray-950 font-black italic shadow-inner focus:border-red-600/30"
                                    onKeyDown={e => e.key === 'Enter' && addInteraction()} />
                                <button onClick={addInteraction} className="w-20 h-20 bg-red-600 hover:bg-red-700 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl transition-all active:scale-90"><TfiPlus className="text-2xl" /></button>
                            </div>
                        </div>

                        {/* History Feed */}
                        {interactions.length > 0 && (
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                                {interactions.map((it, i) => (
                                    <div key={i} className="flex items-center gap-6 bg-gray-50 border border-gray-100 rounded-[2rem] p-6 hover:bg-white transition-all group/item">
                                        <span className="text-[9px] font-black text-gray-400 italic tracking-widest">{it.date}</span>
                                        <span className="text-[9px] font-black uppercase text-red-600 bg-red-50 border border-red-100 px-4 py-1.5 rounded-full italic">{it.type}</span>
                                        <span className="text-xs text-gray-950 font-bold italic uppercase flex-1 truncate">{it.notes}</span>
                                        <button onClick={() => setInteractions(p => p.filter((_, idx) => idx !== i))} className="text-gray-300 hover:text-red-600 transition-colors opacity-0 group-hover/item:opacity-100"><TfiClose className="text-xl" /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Operational Intelligence */}
                    <div className="bg-gray-950 border-4 border-red-600/20 rounded-[4rem] p-16 shadow-2xl flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-full h-full bg-red-600/[0.05] blur-[120px] pointer-events-none" />
                        <div className="relative z-10">
                            <div className="text-[11px] font-black uppercase tracking-[0.6em] text-red-500 mb-12 italic underline decoration-red-950 underline-offset-8">DIAGNOSTIC WORKFLOW</div>
                            <div className="space-y-10">
                                {[
                                    'AGGREGATE QUALITATIVE TOUCHPOINTS',
                                    'AI NEURAL SENTIMENT SCANNING',
                                    'REAL-TIME ENGAGEMENT INDEXING',
                                    'PREDICTIVE OUTCOME PROBABILITY'
                                ].map((s, i) => (
                                    <div key={i} className="flex items-center gap-8 group/flow">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 border border-white/10 text-red-500 flex items-center justify-center text-xl font-black italic shadow-2xl group-hover/flow:scale-110 transition-transform">{i + 1}</div>
                                        <div className="text-sm text-gray-300 font-black italic uppercase tracking-widest">{s}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="pt-20 space-y-6 relative z-10">
                            <div className="text-center">
                                <div className="text-5xl font-black text-white italic tracking-tighter leading-none">{interactions.length}</div>
                                <div className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-500 mt-2 italic">DATA POINTS LOGGED</div>
                            </div>
                            <button onClick={handleAnalyze} disabled={loading}
                                className="w-full py-8 bg-red-600 hover:bg-red-700 disabled:opacity-30 rounded-[2.5rem] font-black uppercase tracking-[0.5em] text-[11px] text-white transition-all duration-500 flex items-center justify-center gap-4 shadow-[0_20px_40px_-10px_rgba(220,38,38,0.3)] active:scale-[0.98] group">
                                {loading ? <><TfiReload className="animate-spin text-xl" /> DECRYPTING SIGNALS...</> : <><TfiPulse className="text-xl group-hover:scale-125 transition-transform" /> INITIALIZE ANALYTICS</>}
                            </button>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {result && (
                        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                            
                            {/* Result Hero */}
                            <div className={`border-4 rounded-[4rem] p-16 shadow-2xl relative overflow-hidden transition-all duration-1000 ${SENTIMENT_BG[result.overall_sentiment] || 'bg-white border-gray-50'}`}>
                                <div className="absolute top-0 right-0 w-full h-full bg-white/40 pointer-events-none" />
                                <div className="flex flex-col lg:flex-row items-center gap-16 relative z-10">
                                    <div className="text-center flex-shrink-0">
                                        <div className={`text-[120px] font-black italic tracking-tighter leading-none ${SENTIMENT_COLOR[result.overall_sentiment] || 'text-gray-950'}`}>{engScore}</div>
                                        <div className="text-[10px] uppercase tracking-[0.6em] text-gray-400 font-black mt-4 italic">ENGAGEMENT INDEX</div>
                                        <div className={`mt-8 px-10 py-3 rounded-full text-sm font-black uppercase italic border-4 tracking-widest ${SENTIMENT_COLOR[result.overall_sentiment] || 'text-gray-400 border-gray-100 bg-white'}`}>{result.overall_sentiment}</div>
                                    </div>
                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                                        {[
                                            ['INTEREST LEVEL', result.interest_level, 'text-gray-950'],
                                            ['SENTIMENT TREND', result.sentiment_trend, 'text-blue-600'],
                                            ['DROPOUT RISK', result.dropout_risk, DROPOUT_COLOR[result.dropout_risk] || 'text-gray-950']
                                        ].map(([label, val, color]) => (
                                            <div key={label} className="bg-white/80 border border-white rounded-[2.5rem] p-8 text-center shadow-sm group hover:scale-105 transition-transform">
                                                <div className="text-[9px] text-gray-400 uppercase font-black mb-4 italic tracking-widest">{label}</div>
                                                <div className={`text-xl font-black italic uppercase tracking-tighter ${color}`}>{val}</div>
                                            </div>
                                        ))}
                                        <div className="bg-white/80 border border-white rounded-[2.5rem] p-8 text-center col-span-1 sm:col-span-2 lg:col-span-1 shadow-sm">
                                            <div className="text-[9px] text-gray-400 uppercase font-black mb-4 italic tracking-widest">PREDICTED OUTCOME</div>
                                            <div className="text-xl font-black text-gray-950 italic uppercase tracking-tighter">{result.predicted_outcome}</div>
                                        </div>
                                        <div className="bg-gray-950 border-4 border-white/10 rounded-[2.5rem] p-8 text-center col-span-full shadow-2xl group overflow-hidden relative">
                                            <div className="absolute top-0 right-0 w-full h-full bg-red-600/[0.05] blur-3xl pointer-events-none" />
                                            <div className="flex items-center justify-between relative z-10">
                                                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500 italic">RESPONSE URGENCY</div>
                                                <div className={`px-12 py-4 rounded-[1.5rem] text-[10px] font-black uppercase italic tracking-widest text-white shadow-2xl transition-all group-hover:scale-110 ${URGENCY_COLOR[result.urgency_level] || 'bg-gray-600'}`}>{result.urgency_level}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tactical Navigator */}
                            <div className="flex gap-4 p-2 bg-gray-50 rounded-[2.5rem] w-fit mx-auto border border-gray-100 shadow-sm">
                                {['overview', 'timeline', 'action'].map(t => (
                                    <button key={t} onClick={() => setActiveTab(t)}
                                        className={`px-10 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest italic transition-all duration-500 ${activeTab === t ? 'bg-red-600 text-white shadow-2xl shadow-red-600/30' : 'text-gray-400 hover:text-gray-950'}`}>
                                        {t === 'overview' ? 'Linguistic Signals' : t === 'timeline' ? 'Chrono-Timeline' : 'Deployment Strategy'}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Matrix */}
                            <div className="min-h-[500px]">
                                {activeTab === 'overview' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="bg-emerald-50 border-4 border-emerald-100 rounded-[3.5rem] p-12 shadow-2xl hover:bg-white transition-all duration-500">
                                            <div className="text-[11px] font-black uppercase tracking-[0.5em] text-emerald-600 mb-10 italic flex items-center gap-4"><span className="w-12 h-1 bg-emerald-200 rounded-full" /> POSITIVE VECTORS</div>
                                            <div className="space-y-6">
                                                {Array.isArray(result.positive_signals) && result.positive_signals.map((s, i) => (
                                                    <div key={i} className="text-sm text-emerald-950 font-black italic uppercase flex items-start gap-6 bg-white/60 p-6 rounded-[2rem] border-2 border-emerald-100 group hover:scale-[1.02] transition-transform">
                                                        <span className="text-2xl group-hover:rotate-12 transition-transform">✓</span>
                                                        <span className="leading-relaxed">{s}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-red-50 border-4 border-red-100 rounded-[3.5rem] p-12 shadow-2xl hover:bg-white transition-all duration-500">
                                            <div className="text-[11px] font-black uppercase tracking-[0.5em] text-red-600 mb-10 italic flex items-center gap-4"><span className="w-12 h-1 bg-red-200 rounded-full" /> ATTRITION FLAGS</div>
                                            <div className="space-y-6">
                                                {Array.isArray(result.risk_flags) && result.risk_flags.map((f, i) => (
                                                    <div key={i} className="text-sm text-red-950 font-black italic uppercase flex items-start gap-6 bg-white/60 p-6 rounded-[2rem] border-2 border-red-100 group hover:scale-[1.02] transition-transform">
                                                        <span className="text-2xl group-hover:rotate-12 transition-transform">⚠</span>
                                                        <span className="leading-relaxed">{f}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 bg-gray-950 border-4 border-red-600/20 rounded-[4rem] p-16 shadow-2xl relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 blur-[120px]" />
                                            <div className="text-[11px] font-black uppercase tracking-[0.6em] text-red-500 mb-12 italic text-center underline decoration-red-950 underline-offset-8">RE-ENGAGEMENT DEPLOYMENT PROTOCOL</div>
                                            <p className="text-2xl text-white font-black italic uppercase tracking-tighter text-center leading-tight max-w-4xl mx-auto group-hover:scale-105 transition-transform duration-700">"{result.re_engagement_strategy}"</p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'timeline' && (
                                    <div className="space-y-6">
                                        {Array.isArray(result.sentiment_timeline) && result.sentiment_timeline.map((t, i) => (
                                            <div key={i} className="bg-white border-2 border-gray-50 rounded-[3rem] p-10 flex items-center gap-12 shadow-xl hover:border-red-600/20 transition-all duration-500 group">
                                                <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center text-4xl font-black italic flex-shrink-0 shadow-2xl transition-transform group-hover:rotate-12 ${t.sentiment === 'Positive' ? 'bg-emerald-600 text-white' : t.sentiment === 'Negative' ? 'bg-red-600 text-white' : 'bg-gray-950 text-white'}`}>{t.score}</div>
                                                <div className="flex-1 space-y-4">
                                                    <div className="flex items-center gap-8 border-b border-gray-100 pb-4">
                                                        <span className="text-xl font-black uppercase italic tracking-tighter text-gray-950">{t.touchpoint}</span>
                                                        <span className={`text-[10px] font-black uppercase italic tracking-widest px-6 py-2 rounded-full border-2 ${t.sentiment === 'Positive' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : t.sentiment === 'Negative' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-50 text-gray-600 border-gray-100'}`}>{t.sentiment}</span>
                                                    </div>
                                                    <div className="text-sm text-gray-400 font-bold italic uppercase leading-relaxed">"{t.notes}"</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'action' && (
                                    <div className="space-y-12">
                                        <div className="bg-red-600 border-4 border-white rounded-[3.5rem] p-16 shadow-2xl text-center group">
                                            <div className="text-[11px] font-black uppercase tracking-[0.5em] text-red-100 mb-10 italic">PRIMARY STRATEGIC ACTION</div>
                                            <p className="text-4xl text-white font-black italic uppercase tracking-tighter leading-tight group-hover:scale-105 transition-transform duration-500">"{result.recommended_action}"</p>
                                        </div>
                                        <div className="bg-white border-2 border-gray-50 rounded-[4rem] p-16 shadow-2xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/[0.01] blur-[80px]" />
                                            <div className="text-[11px] font-black uppercase tracking-[0.6em] text-gray-400 mb-12 italic text-center">TACTICAL TALKING POINTS</div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {Array.isArray(result.talking_points) && result.talking_points.map((p, i) => (
                                                    <div key={i} className="flex items-center gap-8 bg-gray-50 p-10 rounded-[2.5rem] border-2 border-gray-100 group hover:bg-white hover:border-red-600/30 transition-all duration-500">
                                                        <span className="text-4xl group-hover:translate-x-4 transition-transform duration-500">🎯</span>
                                                        <span className="text-sm text-gray-950 font-black italic uppercase tracking-tight leading-relaxed">{p}</span>
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
