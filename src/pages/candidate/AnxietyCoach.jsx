import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TfiReload, TfiHeart, TfiTarget, TfiBolt, TfiShield } from 'react-icons/tfi';
import { toast } from 'sonner';
import api from '../../services/api';

const ANXIETY_COLOR = { Low: 'text-emerald-400', Moderate: 'text-amber-400', High: 'text-red-400' };
const ANXIETY_BG = { Low: 'bg-emerald-500/10 border-emerald-500/20', Moderate: 'bg-amber-500/10 border-amber-500/20', High: 'bg-red-500/10 border-red-500/20' };

export default function AnxietyCoach() {
    const [form, setForm] = useState({ role: '', experience_level: 'Mid-level', concerns: '' });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState('breathing');
    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleCoach = async () => {
        if (!form.role.trim()) return toast.error('Enter the role you are interviewing for.');
        setLoading(true); setResult(null);
        try {
            const r = await api.post('/auth/anxiety-coach/', form);
            setResult(r.data);
        } catch { toast.error('Failed to generate coaching plan. Try again.'); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter">
                        Interview <span className="text-red-600">Anxiety Coach</span>
                    </h1>
                    <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest">AI-powered confidence builder — breathing, mindset, and rituals personalized for your interview</p>
                </div>

                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">Role You Are Interviewing For *</label>
                            <input value={form.role} onChange={e => set('role', e.target.value)} placeholder="e.g. Senior Software Engineer"
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600" />
                        </div>
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">Experience Level</label>
                            <select value={form.experience_level} onChange={e => set('experience_level', e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600">
                                {['Entry-level', 'Mid-level', 'Senior', 'Lead', 'Manager', 'Director'].map(o => <option key={o}>{o}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">Your Specific Concerns (optional)</label>
                        <textarea value={form.concerns} onChange={e => set('concerns', e.target.value)} rows={3}
                            placeholder="e.g. I freeze up when asked technical questions, I get nervous in panel interviews..."
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600 resize-none" />
                    </div>
                    <button onClick={handleCoach} disabled={loading}
                        className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:opacity-40 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2">
                        {loading ? <><TfiReload className="animate-spin" /> Building Your Plan...</> : <><TfiHeart /> Get My Coaching Plan</>}
                    </button>
                </div>

                <AnimatePresence>
                    {result && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            {/* Hero Message */}
                            <div className={`border rounded-2xl p-6 ${ANXIETY_BG[result.anxiety_level_assessment] || 'bg-white/[0.03] border-white/10'}`}>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${ANXIETY_BG[result.anxiety_level_assessment] || ''} ${ANXIETY_COLOR[result.anxiety_level_assessment] || 'text-gray-400'}`}>
                                        {result.anxiety_level_assessment} Anxiety
                                    </span>
                                </div>
                                <p className="text-white text-sm leading-relaxed italic">"{result.personalized_message}"</p>
                                <p className="text-gray-400 text-xs mt-3">{result.root_cause_analysis}</p>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 flex-wrap">
                                {['breathing', 'mindset', 'ritual', 'poses', 'anchors'].map(t => (
                                    <button key={t} onClick={() => setActiveTab(t)}
                                        className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                                        {t === 'breathing' ? '🫁 Breathing' : t === 'mindset' ? '🧠 Mindset' : t === 'ritual' ? '☀️ Day Of' : t === 'poses' ? '💪 Power Poses' : '⚓ Anchors'}
                                    </button>
                                ))}
                            </div>

                            {activeTab === 'breathing' && (
                                <div className="space-y-4">
                                    {(result.breathing_exercises || []).map((ex, i) => (
                                        <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm font-black text-white uppercase">{ex.name}</div>
                                                <div className="flex gap-2">
                                                    <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-1 rounded-lg font-black">{ex.duration}</span>
                                                    <span className="text-xs bg-white/5 text-gray-400 px-2 py-1 rounded-lg font-black uppercase">{ex.when_to_use}</span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div>
                                                    <div className="text-[10px] text-gray-500 uppercase font-black mb-2">Steps</div>
                                                    {(ex.steps || []).map((s, si) => (
                                                        <div key={si} className="flex items-center gap-2 text-xs text-gray-300 mb-1.5">
                                                            <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-[9px] font-black flex-shrink-0">{si + 1}</div>
                                                            {s}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                                                    <div className="text-[10px] text-emerald-400 font-black uppercase mb-1">Benefit</div>
                                                    <div className="text-xs text-emerald-300">{ex.benefit}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                        <div className="text-xs font-black uppercase tracking-widest text-red-400 mb-2">🚨 Emergency Reset</div>
                                        <p className="text-red-200 text-sm">{result.emergency_reset}</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'mindset' && (
                                <div className="space-y-4">
                                    {(result.mindset_reframes || []).map((m, i) => (
                                        <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-3">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                                                    <div className="text-[10px] text-red-400 font-black uppercase mb-1">❌ Negative Thought</div>
                                                    <div className="text-sm text-red-300 italic">"{m.negative_thought}"</div>
                                                </div>
                                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                                                    <div className="text-[10px] text-emerald-400 font-black uppercase mb-1">✓ Reframe</div>
                                                    <div className="text-sm text-emerald-300">{m.reframe}</div>
                                                </div>
                                            </div>
                                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
                                                <div className="text-[10px] text-blue-400 font-black uppercase mb-1">Power Affirmation</div>
                                                <div className="text-sm text-blue-200 font-black italic">"{m.affirmation}"</div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                                        <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Confidence Builders</div>
                                        <div className="space-y-2">
                                            {(result.confidence_builders || []).map((c, i) => (
                                                <div key={i} className="flex items-start gap-2 text-xs text-gray-300">
                                                    <span className="text-red-500 mt-0.5">→</span>{c}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                                        <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Post-Interview Care</div>
                                        <p className="text-gray-300 text-sm">{result.post_interview_care}</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'ritual' && (
                                <div className="space-y-3">
                                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                                        <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Your Day-Of Ritual</div>
                                        {(result.day_of_ritual || []).map((step, i) => (
                                            <div key={i} className="flex items-center gap-4 mb-4">
                                                <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-xs font-black flex-shrink-0">{i + 1}</div>
                                                <div className="text-sm text-gray-200">{step}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'poses' && (
                                <div className="space-y-4">
                                    {(result.power_poses || []).map((p, i) => (
                                        <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm font-black uppercase text-white">{p.name}</div>
                                                <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-1 rounded-lg font-black">{p.duration}</span>
                                            </div>
                                            <div className="text-xs text-gray-300">{p.how_to}</div>
                                            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-xs text-purple-300">⚡ {p.effect}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'anchors' && (
                                <div className="space-y-4">
                                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                                        <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">During Interview — Calm Anchors</div>
                                        {(result.during_interview_anchors || []).map((a, i) => (
                                            <div key={i} className="flex items-start gap-3 mb-3">
                                                <div className="w-6 h-6 rounded-lg bg-blue-600/30 flex items-center justify-center text-blue-400 text-xs font-black flex-shrink-0">⚓</div>
                                                <div className="text-sm text-gray-200">{a}</div>
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
