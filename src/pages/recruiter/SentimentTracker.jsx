import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TfiReload, TfiPulse, TfiUser, TfiPlus, TfiClose } from 'react-icons/tfi';
import { toast } from 'sonner';
import hrService from '../../services/hrService';
import authService from '../../services/authService';

const SENTIMENT_COLOR = {
    'Very Positive': 'text-emerald-400', 'Positive': 'text-green-400',
    'Neutral': 'text-gray-400', 'Negative': 'text-amber-400', 'Very Negative': 'text-red-400'
};
const SENTIMENT_BG = {
    'Very Positive': 'bg-emerald-500/10 border-emerald-500/20',
    'Positive': 'bg-green-500/10 border-green-500/20',
    'Neutral': 'bg-gray-500/10 border-gray-500/20',
    'Negative': 'bg-amber-500/10 border-amber-500/20',
    'Very Negative': 'bg-red-500/10 border-red-500/20',
};
const DROPOUT_COLOR = { Low: 'text-emerald-400', Medium: 'text-amber-400', High: 'text-red-400' };
const URGENCY_COLOR = { Immediate: 'bg-red-600', 'This Week': 'bg-amber-500', Standard: 'bg-blue-600' };
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
        authService.getUsers('candidate').then(r => setCandidates(r.data || [])).catch(() => { });
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
        } catch (err) {
            const msg = err.response?.data?.error || 'Sentiment analysis failed.';
            toast.error(msg);
        }
        finally { setLoading(false); }
    };

    const engScore = result?.engagement_score ?? 0;

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter">
                        Candidate Sentiment <span className="text-red-600">Tracker</span>
                    </h1>
                    <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest">AI reads between the lines — tracks engagement, predicts dropout, suggests action</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Candidate + Job */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
                        <div className="text-xs font-black uppercase tracking-widest text-gray-400">Candidate & Role</div>
                        <div>
                            <label className="text-[10px] uppercase tracking-widest text-gray-500 block mb-1">Candidate</label>
                            <select value={candidateId} onChange={e => setCandidateId(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600">
                                <option value="">Select candidate (or leave blank)</option>
                                {candidates.map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.name} ({c.email})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-widest text-gray-500 block mb-1">Job Title *</label>
                            <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Product Designer"
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600" />
                        </div>

                        {/* Add Interaction */}
                        <div className="border-t border-white/5 pt-4">
                            <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">Log Interaction</div>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                                <input type="date" value={newInteraction.date} onChange={e => setNewInteraction(p => ({ ...p, date: e.target.value }))}
                                    className="bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600" />
                                <select value={newInteraction.type} onChange={e => setNewInteraction(p => ({ ...p, type: e.target.value }))}
                                    className="bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600">
                                    {INTERACTION_TYPES.map(t => <option key={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <input value={newInteraction.notes} onChange={e => setNewInteraction(p => ({ ...p, notes: e.target.value }))}
                                    placeholder="Notes on this touchpoint..."
                                    className="flex-1 bg-black border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                                    onKeyDown={e => e.key === 'Enter' && addInteraction()} />
                                <button onClick={addInteraction} className="px-3 py-2 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-black transition-all"><TfiPlus /></button>
                            </div>
                        </div>

                        {/* Logged Interactions */}
                        {interactions.length > 0 && (
                            <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                {interactions.map((it, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
                                        <span className="text-[9px] text-gray-500">{it.date}</span>
                                        <span className="text-[9px] font-black uppercase text-red-400 bg-red-600/10 px-1.5 py-0.5 rounded">{it.type}</span>
                                        <span className="text-xs text-gray-300 flex-1 truncate">{it.notes}</span>
                                        <button onClick={() => setInteractions(p => p.filter((_, idx) => idx !== i))} className="text-gray-600 hover:text-red-400 transition-colors"><TfiClose className="text-xs" /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Analyze CTA */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex flex-col justify-between gap-4">
                        <div>
                            <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">How It Works</div>
                            {['Log every interaction with a candidate', 'AI detects sentiment patterns and signals', 'Get dropout risk + predicted outcome', 'Receive specific action recommendations'].map((s, i) => (
                                <div key={i} className="flex items-start gap-3 mb-3">
                                    <div className="w-5 h-5 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center text-[9px] font-black flex-shrink-0">{i + 1}</div>
                                    <div className="text-xs text-gray-300">{s}</div>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <div className="text-xs text-gray-500">{interactions.length} interaction{interactions.length !== 1 ? 's' : ''} logged</div>
                            <button onClick={handleAnalyze} disabled={loading}
                                className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:opacity-40 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2">
                                {loading ? <><TfiReload className="animate-spin" /> Analyzing Sentiment...</> : <><TfiPulse /> Analyze Sentiment</>}
                            </button>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {result && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            {/* Score Hero */}
                            <div className={`border rounded-2xl p-6 ${SENTIMENT_BG[result.overall_sentiment] || 'bg-white/[0.03] border-white/10'}`}>
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    <div className="text-center">
                                        <div className={`text-6xl font-black ${SENTIMENT_COLOR[result.overall_sentiment] || 'text-gray-400'}`}>{engScore}</div>
                                        <div className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">Engagement Score</div>
                                        <div className={`mt-2 text-sm font-black uppercase ${SENTIMENT_COLOR[result.overall_sentiment] || 'text-gray-400'}`}>{result.overall_sentiment}</div>
                                    </div>
                                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {[['Interest Level', result.interest_level, 'text-white'], ['Sentiment Trend', result.sentiment_trend, 'text-blue-400'], ['Dropout Risk', result.dropout_risk, DROPOUT_COLOR[result.dropout_risk] || 'text-gray-400']].map(([label, val, color]) => (
                                            <div key={label} className="bg-white/5 rounded-xl p-3 text-center">
                                                <div className="text-[10px] text-gray-400 uppercase font-black mb-1">{label}</div>
                                                <div className={`text-xs font-black uppercase ${color}`}>{val}</div>
                                            </div>
                                        ))}
                                        <div className="bg-white/5 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
                                            <div className="text-[10px] text-gray-400 uppercase font-black mb-1">Predicted Outcome</div>
                                            <div className="text-xs font-black text-white">{result.predicted_outcome}</div>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase text-white ${URGENCY_COLOR[result.urgency_level] || 'bg-gray-600'}`}>{result.urgency_level}</div>
                                        <div className="text-[10px] text-gray-500 mt-1">Urgency</div>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 flex-wrap">
                                {['overview', 'timeline', 'action'].map(t => (
                                    <button key={t} onClick={() => setActiveTab(t)}
                                        className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                                        {t === 'overview' ? 'Signals' : t === 'timeline' ? 'Sentiment Timeline' : 'Action Plan'}
                                    </button>
                                ))}
                            </div>

                            {activeTab === 'overview' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
                                        <div className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-3">Positive Signals</div>
                                        {(result.positive_signals || []).map((s, i) => <div key={i} className="text-xs text-emerald-300 flex items-start gap-1 mb-1.5"><span>✓</span>{s}</div>)}
                                    </div>
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
                                        <div className="text-xs font-black uppercase tracking-widest text-red-400 mb-3">Risk Flags</div>
                                        {(result.risk_flags || []).map((f, i) => <div key={i} className="text-xs text-red-300 flex items-start gap-1 mb-1.5"><span>⚠</span>{f}</div>)}
                                    </div>
                                    <div className="md:col-span-2 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5">
                                        <div className="text-xs font-black uppercase tracking-widest text-blue-400 mb-3">Re-Engagement Strategy</div>
                                        <p className="text-blue-200 text-sm">{result.re_engagement_strategy}</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'timeline' && (
                                <div className="space-y-3">
                                    {(result.sentiment_timeline || []).map((t, i) => (
                                        <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex items-start gap-4">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 ${t.sentiment === 'Positive' ? 'bg-emerald-500/20 text-emerald-400' : t.sentiment === 'Negative' ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-400'}`}>{t.score}</div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-black uppercase text-white">{t.touchpoint}</span>
                                                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${t.sentiment === 'Positive' ? 'bg-emerald-500/20 text-emerald-400' : t.sentiment === 'Negative' ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-400'}`}>{t.sentiment}</span>
                                                </div>
                                                <div className="text-xs text-gray-400">{t.notes}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'action' && (
                                <div className="space-y-4">
                                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                                        <div className="text-xs font-black uppercase tracking-widest text-red-400 mb-3">Recommended Next Action</div>
                                        <p className="text-white text-sm font-medium">{result.recommended_action}</p>
                                    </div>
                                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                                        <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Talking Points for Next Interaction</div>
                                        {(result.talking_points || []).map((p, i) => (
                                            <div key={i} className="flex items-start gap-2 mb-2 text-sm text-gray-300">
                                                <span className="text-red-500 mt-0.5 flex-shrink-0">→</span>{p}
                                            </div>
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
