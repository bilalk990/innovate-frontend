import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TfiReload, TfiHeart, TfiTarget, TfiBolt, TfiShield, TfiCheck, TfiAlert } from 'react-icons/tfi';
import { toast } from 'sonner';
import api from '../../services/api';

const ANXIETY_COLOR = {
    Low: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    Moderate: 'text-amber-600 bg-amber-50 border-amber-200',
    High: 'text-red-600 bg-red-50 border-red-200'
};

const ANXIETY_CARD = {
    Low: 'bg-emerald-50 border-emerald-200',
    Moderate: 'bg-amber-50 border-amber-200',
    High: 'bg-red-50 border-red-200'
};

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
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to generate coaching plan. Try again.');
        } finally { setLoading(false); }
    };

    return (
        <div className="elite-content pb-24">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter text-gray-950">
                        Interview <span className="text-red-600">Anxiety Coach</span>
                    </h1>
                    <p className="text-gray-400 text-[11px] mt-2 uppercase tracking-[0.4em] font-black italic">
                        AI-Powered Confidence Builder — Breathing, Mindset & Rituals Personalized For You
                    </p>
                </div>

                {/* Input Form */}
                <div className="p-10 bg-white rounded-[3rem] border border-gray-100 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/[0.03] blur-[120px] pointer-events-none" />
                    <div className="flex items-center gap-5 mb-10">
                        <div className="w-14 h-14 rounded-[1.2rem] bg-red-600 text-white flex items-center justify-center text-2xl shadow-lg shadow-red-500/20">
                            <TfiHeart />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase italic tracking-tighter text-gray-950">Build My Coaching Plan</h2>
                            <p className="text-[10px] font-black uppercase text-red-600 tracking-[0.4em] italic">Personalized · AI-Powered</p>
                        </div>
                    </div>

                    <div className="space-y-6 relative z-10">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 italic block mb-3">
                                    Role You Are Interviewing For *
                                </label>
                                <input
                                    value={form.role}
                                    onChange={e => set('role', e.target.value)}
                                    placeholder="e.g. Senior Software Engineer"
                                    className="elite-input h-14 font-black italic"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 italic block mb-3">
                                    Experience Level
                                </label>
                                <select
                                    value={form.experience_level}
                                    onChange={e => set('experience_level', e.target.value)}
                                    className="elite-input h-14 font-black italic"
                                >
                                    {['Entry-level', 'Mid-level', 'Senior', 'Lead', 'Manager', 'Director'].map(o => (
                                        <option key={o}>{o}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 italic block mb-3">
                                Your Specific Concerns (Optional)
                            </label>
                            <textarea
                                value={form.concerns}
                                onChange={e => set('concerns', e.target.value)}
                                rows={3}
                                placeholder="e.g. I freeze up when asked technical questions, I get nervous in panel interviews..."
                                className="elite-input pt-4 resize-none font-medium italic text-gray-700 leading-relaxed"
                            />
                        </div>

                        <button
                            onClick={handleCoach}
                            disabled={loading}
                            className={`w-full py-6 rounded-[2rem] text-[12px] font-black uppercase tracking-[0.5em] italic flex items-center justify-center gap-3 shadow-xl transition-all ${
                                loading ? 'bg-gray-200 text-gray-400 animate-pulse' : 'bg-red-600 hover:bg-gray-950 text-white active:scale-[0.98]'
                            }`}
                        >
                            {loading ? <><TfiReload className="animate-spin" /> Building Your Plan...</> : <><TfiHeart /> Get My Coaching Plan</>}
                        </button>
                    </div>
                </div>

                {/* Results */}
                <AnimatePresence>
                    {result && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

                            {/* Anxiety Level Banner */}
                            <div className={`border rounded-[2rem] p-8 ${ANXIETY_CARD[result.anxiety_level_assessment] || 'bg-gray-50 border-gray-200'}`}>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border ${ANXIETY_COLOR[result.anxiety_level_assessment] || 'text-gray-600 bg-white border-gray-200'}`}>
                                        {result.anxiety_level_assessment} Anxiety Level
                                    </span>
                                </div>
                                <p className="text-gray-800 text-[15px] leading-relaxed italic font-medium border-l-4 border-red-200 pl-6 mb-4">
                                    "{result.personalized_message}"
                                </p>
                                <p className="text-gray-500 text-[12px] italic">{result.root_cause_analysis}</p>
                            </div>

                            {/* Tab Buttons */}
                            <div className="flex gap-3 flex-wrap bg-gray-50 p-3 rounded-[2rem] border border-gray-100">
                                {['breathing', 'mindset', 'ritual', 'poses', 'anchors'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setActiveTab(t)}
                                        className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] italic transition-all ${
                                            activeTab === t ? 'bg-white shadow-md text-gray-950' : 'text-gray-400 hover:text-gray-700'
                                        }`}
                                    >
                                        {t === 'breathing' ? '🫁 Breathing' : t === 'mindset' ? '🧠 Mindset' : t === 'ritual' ? '☀️ Day Of' : t === 'poses' ? '💪 Poses' : '⚓ Anchors'}
                                    </button>
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                {/* Breathing Tab */}
                                {activeTab === 'breathing' && (
                                    <motion.div key="breathing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                                        {(result.breathing_exercises || []).map((ex, i) => (
                                            <div key={i} className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="text-base font-black uppercase italic text-gray-950">{ex.name}</div>
                                                    <div className="flex gap-2">
                                                        <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-xl font-black italic">{ex.duration}</span>
                                                        <span className="text-[10px] bg-gray-50 text-gray-500 border border-gray-200 px-3 py-1.5 rounded-xl font-black uppercase italic">{ex.when_to_use}</span>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                    <div>
                                                        <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-3">Steps</div>
                                                        {(ex.steps || []).map((s, si) => (
                                                            <div key={si} className="flex items-center gap-3 text-[13px] text-gray-700 mb-2.5 italic">
                                                                <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-[9px] font-black text-white flex-shrink-0">{si + 1}</div>
                                                                {s}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-[1.5rem]">
                                                        <div className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mb-2">Benefit</div>
                                                        <div className="text-[13px] text-emerald-800 italic">{ex.benefit}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {result.emergency_reset && (
                                            <div className="p-6 bg-red-50 border border-red-200 rounded-[2rem]">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-2">🚨 Emergency Reset</div>
                                                <p className="text-red-800 text-[13px] italic">{result.emergency_reset}</p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* Mindset Tab */}
                                {activeTab === 'mindset' && (
                                    <motion.div key="mindset" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                                        {(result.mindset_reframes || []).map((m, i) => (
                                            <div key={i} className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl space-y-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="p-5 bg-red-50 border border-red-100 rounded-[1.5rem]">
                                                        <div className="text-[10px] text-red-600 font-black uppercase mb-2">❌ Negative Thought</div>
                                                        <div className="text-[13px] text-red-800 italic">"{m.negative_thought}"</div>
                                                    </div>
                                                    <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-[1.5rem]">
                                                        <div className="text-[10px] text-emerald-600 font-black uppercase mb-2">✓ Reframe</div>
                                                        <div className="text-[13px] text-emerald-800 italic">{m.reframe}</div>
                                                    </div>
                                                </div>
                                                <div className="p-5 bg-blue-50 border border-blue-100 rounded-[1.5rem] text-center">
                                                    <div className="text-[10px] text-blue-600 font-black uppercase mb-2">Power Affirmation</div>
                                                    <div className="text-[14px] text-blue-800 font-black italic">"{m.affirmation}"</div>
                                                </div>
                                            </div>
                                        ))}
                                        {result.confidence_builders?.length > 0 && (
                                            <div className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-5">Confidence Builders</div>
                                                <div className="space-y-3">
                                                    {result.confidence_builders.map((c, i) => (
                                                        <div key={i} className="flex items-start gap-3 text-[13px] text-gray-700 italic p-3 bg-gray-50 rounded-xl">
                                                            <TfiCheck className="text-red-500 mt-0.5 flex-shrink-0" />{c}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {result.post_interview_care && (
                                            <div className="p-6 bg-gray-50 border border-gray-100 rounded-[2rem]">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Post-Interview Care</div>
                                                <p className="text-gray-700 text-[13px] italic">{result.post_interview_care}</p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* Ritual Tab */}
                                {activeTab === 'ritual' && (
                                    <motion.div key="ritual" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                        <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-8">Your Day-Of Ritual</div>
                                            {(result.day_of_ritual || []).map((step, i) => (
                                                <div key={i} className="flex items-center gap-5 mb-5 p-4 bg-gray-50 rounded-[1.5rem] hover:bg-red-50 transition-colors">
                                                    <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-[11px] font-black text-white flex-shrink-0">{i + 1}</div>
                                                    <div className="text-[13px] text-gray-700 italic">{step}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Poses Tab */}
                                {activeTab === 'poses' && (
                                    <motion.div key="poses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                                        {(result.power_poses || []).map((p, i) => (
                                            <div key={i} className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="text-base font-black uppercase italic text-gray-950">{p.name}</div>
                                                    <span className="text-[10px] bg-purple-50 text-purple-600 border border-purple-200 px-3 py-1.5 rounded-xl font-black">{p.duration}</span>
                                                </div>
                                                <div className="text-[13px] text-gray-600 italic">{p.how_to}</div>
                                                <div className="p-4 bg-purple-50 border border-purple-100 rounded-[1.5rem] text-[13px] text-purple-800 italic">⚡ {p.effect}</div>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}

                                {/* Anchors Tab */}
                                {activeTab === 'anchors' && (
                                    <motion.div key="anchors" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                        <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-8">During Interview — Calm Anchors</div>
                                            {(result.during_interview_anchors || []).map((a, i) => (
                                                <div key={i} className="flex items-start gap-4 mb-4 p-4 bg-blue-50 border border-blue-100 rounded-[1.5rem]">
                                                    <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 text-sm flex-shrink-0">⚓</div>
                                                    <div className="text-[13px] text-blue-900 italic">{a}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
