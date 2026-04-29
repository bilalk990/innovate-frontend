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
    return (
        <div className="flex items-center justify-center gap-10">
            {[{ label: 'Before', score: before, color: '#ef4444' }, { label: 'After Fix', score: after, color: '#10b981' }].map(({ label, score, color }) => (
                <div key={label} className="flex flex-col items-center gap-3">
                    <div className="relative">
                        <svg width="110" height="110" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="8" />
                            <motion.circle 
                                initial={{ strokeDashoffset: circ }}
                                animate={{ strokeDashoffset: circ - (score / 100) * circ }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
                                strokeDasharray={circ} strokeLinecap="round"
                                transform="rotate(-90 50 50)" 
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-black italic" style={{ color }}>{score}</span>
                        </div>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 italic">{label}</div>
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
            toast.success(`Analysis Complete: Found ${r.data?.total_issues_found ?? 0} items to improve.`);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Analysis failed. Try again.');
        }
        finally { setLoading(false); }
    };

    const biasCategories = result?.bias_categories || {};

    return (
        <div className="min-h-screen bg-white text-gray-950 p-8">
            <div className="max-w-6xl mx-auto space-y-10">
                <header className="flex justify-between items-end border-b border-gray-100 pb-10">
                    <div>
                        <h1 className="text-5xl font-black uppercase italic tracking-tighter">
                            Bias <span className="text-red-600">Detector</span>
                        </h1>
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3 italic">Unconscious Bias Audit · Inclusivity Intelligence · AI Rewriting</p>
                    </div>
                    <div className="hidden md:flex gap-4">
                        <div className="p-4 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-widest italic">
                            VERSION: <span className="text-red-600">PRO V2.4</span>
                        </div>
                    </div>
                </header>

                {/* Input Area */}
                <div className="bg-white border-2 border-gray-50 rounded-[2.5rem] p-10 shadow-2xl shadow-gray-100 space-y-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/[0.02] blur-[80px] pointer-events-none" />
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gray-950 text-red-600 flex items-center justify-center text-xl shadow-lg">
                            <TfiTarget />
                        </div>
                        <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-600 italic">Job Description Input</label>
                    </div>
                    <textarea 
                        value={jdText} 
                        onChange={e => setJdText(e.target.value)} 
                        rows={10} 
                        placeholder="PASTE THE FULL JOB DESCRIPTION HERE FOR ANALYSIS..."
                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-3xl px-8 py-8 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-red-600 focus:bg-white transition-all resize-none font-medium italic" 
                    />
                    <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center gap-6">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 px-4 py-2 rounded-lg">{jdText.length} CHARACTERS</span>
                            {jdText.length > 0 && (
                                <button onClick={() => setJdText('')} className="text-[10px] font-black text-red-600 uppercase tracking-widest hover:underline italic">Clear All</button>
                            )}
                        </div>
                        <button onClick={handleAnalyze} disabled={loading}
                            className="px-12 py-5 bg-red-600 text-white hover:bg-gray-950 disabled:opacity-40 rounded-2xl font-black uppercase tracking-[0.3em] text-xs transition-all flex items-center gap-4 shadow-xl shadow-red-600/20 active:scale-95">
                            {loading ? <><TfiReload className="animate-spin" /> ANALYZING...</> : <><TfiShield /> SCAN FOR BIAS</>}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {result && (
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                            {/* Score + Categories */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                <div className="lg:col-span-4 bg-white border-2 border-red-50 rounded-[2.5rem] p-10 shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-emerald-500" />
                                    <ScoreGauge before={result.diversity_score_before} after={result.diversity_score_after} />
                                    <div className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 mt-8 italic">DIVERSITY PERFORMANCE</div>
                                </div>
                                <div className="lg:col-span-8 bg-white border-2 border-gray-50 rounded-[2.5rem] p-10 shadow-xl space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-600 italic">BIAS CATEGORIES DETECTED</div>
                                        <span className="text-[10px] bg-red-50 text-red-600 px-4 py-1.5 rounded-full font-black uppercase italic">{result.total_issues_found} ISSUES</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {Object.entries(biasCategories).map(([k, v]) => v > 0 && (
                                            <div key={k} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 hover:border-red-600/30 transition-all group">
                                                <span className={`text-[11px] font-black uppercase tracking-wider italic ${BIAS_TYPE_COLOR[k] || 'text-gray-500'}`}>{k.replace(/_/g, ' ')}</span>
                                                <span className="text-2xl font-black text-gray-950 italic group-hover:scale-110 transition-transform">{v}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-2xl">
                                        <div className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <TfiStatsUp /> Overall Assessment
                                        </div>
                                        <p className="text-amber-900 text-xs font-medium italic leading-relaxed">{result.overall_assessment}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Tabs */}
                            <div className="flex gap-4 border-b border-gray-100 pb-2 overflow-x-auto scrollbar-hide">
                                {['flags', 'rewrite', 'quickwins'].map(t => (
                                    <button 
                                        key={t} 
                                        onClick={() => setActiveTab(t)}
                                        className={`pb-4 px-2 text-[11px] font-black uppercase tracking-[0.3em] transition-all relative italic ${activeTab === t ? 'text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        {t === 'flags' ? `FLAGGED PHRASES (${result.flagged_phrases?.length || 0})` : t === 'rewrite' ? 'AI REWRITE' : 'QUICK WINS'}
                                        {activeTab === t && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 rounded-full" />}
                                    </button>
                                ))}
                            </div>

                            {activeTab === 'flags' && (
                                <div className="space-y-6">
                                    {Array.isArray(result.flagged_phrases) && result.flagged_phrases.map((item, i) => (
                                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} key={i} className="bg-white border-2 border-gray-50 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:border-red-50/50 transition-all group">
                                            <div className="flex items-start justify-between mb-8">
                                                <div className="flex items-center gap-4">
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border-2 ${SEVERITY_COLOR[item.severity] || 'bg-gray-50 text-gray-400 border-gray-100'}`}>{item.severity}</span>
                                                    <span className={`text-[11px] font-black uppercase tracking-widest italic ${BIAS_TYPE_COLOR[item.type] || 'text-gray-500'}`}>{item.type?.replace(/_/g, ' ')}</span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="bg-red-50/50 border-2 border-red-100 rounded-3xl p-6 relative overflow-hidden">
                                                    <div className="text-[10px] text-red-600 uppercase font-black mb-3 tracking-widest italic opacity-60">Biased Pattern</div>
                                                    <div className="text-base text-red-900 font-black italic">"{item.phrase}"</div>
                                                </div>
                                                <div className="bg-emerald-50/50 border-2 border-emerald-100 rounded-3xl p-6 relative overflow-hidden">
                                                    <div className="text-[10px] text-emerald-600 uppercase font-black mb-3 tracking-widest italic opacity-60">Inclusive Suggestion</div>
                                                    <div className="text-base text-emerald-900 font-black italic">"{item.suggestion}"</div>
                                                </div>
                                            </div>
                                            <div className="mt-8 pt-6 border-t border-gray-50 flex items-start gap-4">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center flex-shrink-0 text-xs italic">AI</div>
                                                <p className="text-gray-500 text-xs font-medium italic leading-relaxed uppercase tracking-wide">{item.explanation}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'rewrite' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                                    <div className="bg-white border-2 border-emerald-50 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/[0.03] blur-[100px] pointer-events-none" />
                                        <div className="flex items-center justify-between mb-10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xl shadow-lg">
                                                    <TfiCheck />
                                                </div>
                                                <div className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600 italic">Inclusive AI Version</div>
                                            </div>
                                            <button onClick={() => { navigator.clipboard.writeText(result.rewritten_jd); toast.success('Copied!'); }}
                                                className="px-6 py-3 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-600 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all border border-emerald-100">
                                                COPY TO CLIPBOARD
                                            </button>
                                        </div>
                                        <div className="bg-gray-50 rounded-[2rem] p-10 border border-gray-100">
                                            <pre className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap font-sans font-medium italic">{result.rewritten_jd}</pre>
                                        </div>
                                    </div>
                                    <div className="px-6">
                                        <div className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 mb-6 italic">CRITICAL REVISIONS MADE</div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {Array.isArray(result.key_changes_made) && result.key_changes_made.map((c, i) => (
                                                <div key={i} className="flex items-start gap-4 text-[11px] font-black uppercase italic tracking-wider text-gray-600 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:border-emerald-600/30 transition-all">
                                                    <span className="text-emerald-500 text-base leading-none">✓</span>{c}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'quickwins' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {Array.isArray(result.quick_wins) && result.quick_wins.map((w, i) => (
                                            <div key={i} className="bg-white border-2 border-gray-50 rounded-[2.5rem] p-8 flex items-start gap-6 hover:shadow-xl transition-all group">
                                                <div className="w-12 h-12 rounded-2xl bg-gray-950 text-red-600 flex items-center justify-center text-xl font-black italic flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">{i + 1}</div>
                                                <div>
                                                    <div className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2 italic">Immediate Action</div>
                                                    <span className="text-sm text-gray-950 font-black uppercase italic tracking-wide leading-relaxed">{w}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-red-600 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-red-600/20">
                                        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-white/10 blur-[150px] pointer-events-none" />
                                        <div className="flex items-center gap-6 mb-6">
                                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl"><TfiPulse /></div>
                                            <div className="text-xs font-black uppercase tracking-[0.5em] italic">Strategic Diversity Impact</div>
                                        </div>
                                        <p className="text-base font-black italic leading-relaxed tracking-wide opacity-90 max-w-4xl">{result.diversity_impact}</p>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
