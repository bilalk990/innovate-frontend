import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TfiReload, TfiShield, TfiTarget, TfiStatsUp } from 'react-icons/tfi';
import { toast } from 'sonner';
import hrService from '../../services/hrService';

const SEVERITY_COLOR = { high: 'bg-red-500/20 text-red-300 border-red-500/30', medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30', low: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
const BIAS_TYPE_COLOR = { 'masculine-coded': 'text-blue-400', 'feminine-coded': 'text-pink-400', 'age_bias': 'text-orange-400', 'cultural_bias': 'text-purple-400', 'credential_inflation': 'text-amber-400', 'ability_bias': 'text-red-400' };

function ScoreGauge({ before, after }) {
    const r = 40;
    const circ = 2 * Math.PI * r;
    const dashBefore = (before / 100) * circ;
    const dashAfter = (after / 100) * circ;
    return (
        <div className="flex items-center justify-center gap-8">
            {[{ label: 'Before', score: before, color: '#ef4444' }, { label: 'After Fix', score: after, color: '#10b981' }].map(({ label, score, color }) => (
                <div key={label} className="flex flex-col items-center gap-2">
                    <svg width="100" height="100" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r={r} fill="none" stroke="#1f2937" strokeWidth="10" />
                        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10"
                            strokeDasharray={`${(score / 100) * circ} ${circ}`} strokeLinecap="round"
                            transform="rotate(-90 50 50)" />
                        <text x="50" y="55" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">{score}</text>
                    </svg>
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</div>
                </div>
            ))}
        </div>
    );
}

export default function BiasDetector() {
    const [jdText, setJdText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState('flags');

    const handleAnalyze = async () => {
        if (jdText.trim().length < 50) return toast.error('Paste a full job description (at least 50 chars).');
        setLoading(true); setResult(null);
        try {
            const r = await hrService.detectBias({ jd_text: jdText });
            setResult(r.data);
            toast.success(`Found ${r.data?.total_issues_found ?? 0} bias issues!`);
        } catch (err) {
            const msg = err.response?.data?.error || 'Analysis failed. Try again.';
            toast.error(msg);
        }
        finally { setLoading(false); }
    };

    const biasCategories = result?.bias_categories || {};

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter">
                        JD Bias <span className="text-red-600">Detector</span>
                    </h1>
                    <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest">Scan job descriptions for unconscious bias — AI rewrites for inclusivity</p>
                </div>

                {/* Input */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Paste Your Job Description</label>
                    <textarea value={jdText} onChange={e => setJdText(e.target.value)} rows={10} placeholder="Paste the full job description here..."
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600 resize-none panel-scrollbar" />
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{jdText.length} characters</span>
                        <button onClick={handleAnalyze} disabled={loading}
                            className="px-8 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-40 rounded-xl font-black uppercase tracking-widest text-sm transition-all flex items-center gap-2">
                            {loading ? <><TfiReload className="animate-spin" /> Scanning...</> : <><TfiShield /> Scan for Bias</>}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {result && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            {/* Score + Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-1 bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center">
                                    <ScoreGauge before={result.diversity_score_before} after={result.diversity_score_after} />
                                    <div className="text-xs font-black uppercase tracking-widest text-gray-400 mt-2">Diversity Score</div>
                                </div>
                                <div className="md:col-span-2 bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
                                    <div className="text-xs font-black uppercase tracking-widest text-gray-400">Bias Categories Found</div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {Object.entries(biasCategories).map(([k, v]) => v > 0 && (
                                            <div key={k} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                                                <span className={`text-xs font-black uppercase tracking-wide ${BIAS_TYPE_COLOR[k] || 'text-gray-300'}`}>{k.replace(/_/g, ' ')}</span>
                                                <span className="text-lg font-black text-white">{v}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                                        <p className="text-amber-300 text-xs leading-relaxed">{result.overall_assessment}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 flex-wrap">
                                {['flags', 'rewrite', 'quickwins'].map(t => (
                                    <button key={t} onClick={() => setActiveTab(t)}
                                        className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                                        {t === 'flags' ? `Flagged Phrases (${result.flagged_phrases?.length || 0})` : t === 'rewrite' ? 'AI Rewrite' : 'Quick Wins'}
                                    </button>
                                ))}
                            </div>

                            {activeTab === 'flags' && (
                                <div className="space-y-3">
                                    {Array.isArray(result.flagged_phrases) && result.flagged_phrases.map((item, i) => (
                                        <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                                            <div className="flex items-start justify-between gap-4 flex-wrap">
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${SEVERITY_COLOR[item.severity] || 'bg-gray-700/20 text-gray-400 border-gray-600/30'}`}>{item.severity}</span>
                                                    <span className={`text-xs font-black uppercase tracking-wide ${BIAS_TYPE_COLOR[item.type] || 'text-gray-400'}`}>{item.type?.replace(/_/g, ' ')}</span>
                                                </div>
                                            </div>
                                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                                                    <div className="text-[10px] text-red-400 uppercase font-black mb-1">Biased</div>
                                                    <div className="text-sm text-red-300 font-mono">"{item.phrase}"</div>
                                                </div>
                                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                                                    <div className="text-[10px] text-emerald-400 uppercase font-black mb-1">Replace With</div>
                                                    <div className="text-sm text-emerald-300 font-mono">"{item.suggestion}"</div>
                                                </div>
                                            </div>
                                            <p className="text-gray-400 text-xs mt-3">{item.explanation}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'rewrite' && (
                                <div className="space-y-4">
                                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="text-xs font-black uppercase tracking-widest text-emerald-400">AI-Rewritten (Inclusive Version)</div>
                                            <button onClick={() => { navigator.clipboard.writeText(result.rewritten_jd); toast.success('Copied!'); }}
                                                className="text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 px-3 py-1.5 rounded-lg font-black uppercase tracking-widest transition-all">
                                                Copy
                                            </button>
                                        </div>
                                        <pre className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">{result.rewritten_jd}</pre>
                                    </div>
                                    <div>
                                        <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Key Changes Made</div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {Array.isArray(result.key_changes_made) && result.key_changes_made.map((c, i) => (
                                                <div key={i} className="flex items-start gap-2 text-xs text-gray-300 bg-white/[0.02] border border-white/5 rounded-xl p-3">
                                                    <span className="text-emerald-500 mt-0.5">✓</span>{c}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'quickwins' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {Array.isArray(result.quick_wins) && result.quick_wins.map((w, i) => (
                                            <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-lg bg-red-600 flex items-center justify-center text-xs font-black flex-shrink-0">{i + 1}</div>
                                                <span className="text-sm text-gray-200">{w}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                                        <div className="text-xs font-black uppercase tracking-widest text-blue-400 mb-2">Diversity Impact</div>
                                        <p className="text-blue-200 text-sm">{result.diversity_impact}</p>
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
