import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TfiReload, TfiUser, TfiTarget, TfiShield } from 'react-icons/tfi';
import { toast } from 'sonner';
import hrService from '../../services/hrService';
import authService from '../../services/authService';

const DISC_COLOR = { D: '#ef4444', I: '#f59e0b', S: '#10b981', C: '#3b82f6' };
const DISC_LABEL = { D: 'Dominant', I: 'Influential', S: 'Steady', C: 'Conscientious' };
const LEVEL_STYLE = { High: 'bg-emerald-500/20 text-emerald-300', Medium: 'bg-amber-500/20 text-amber-300', Low: 'bg-gray-500/20 text-gray-400' };
const HIRE_STYLE = { 'Hire': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', 'Consider': 'bg-amber-500/20 text-amber-300 border-amber-500/30', 'Pass': 'bg-red-500/20 text-red-300 border-red-500/30' };

function DISCBar({ label, value }) {
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-black uppercase">
                <span style={{ color: DISC_COLOR[label] }}>{label} — {DISC_LABEL[label]}</span>
                <span className="text-gray-400">{value}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${value}%`, backgroundColor: DISC_COLOR[label] }} />
            </div>
        </div>
    );
}

export default function CandidateDNA() {
    const [candidates, setCandidates] = useState([]);
    const [candidateId, setCandidateId] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState('disc');

    useEffect(() => {
        authService.getUsers('candidate').then(r => setCandidates(r.data || [])).catch(() => {});
    }, []);

    const handleProfile = async () => {
        if (!candidateId) return toast.error('Select a candidate to profile.');
        setLoading(true); setResult(null);
        try {
            const r = await hrService.profileCandidateDNA({ candidate_id: candidateId });
            setResult(r.data);
        } catch { toast.error('DNA profiling failed. Try again.'); }
        finally { setLoading(false); }
    };

    const discScores = result?.disc_scores || {};

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter">
                        Candidate <span className="text-red-600">DNA Profiler</span>
                    </h1>
                    <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest">Deep personality + behavioral profiling — DISC type, work style, retention, communication</p>
                </div>

                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">Select Candidate to Profile</label>
                        <select value={candidateId} onChange={e => setCandidateId(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600">
                            <option value="">Select a candidate...</option>
                            {candidates.map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.name} ({c.email})</option>)}
                        </select>
                        <p className="text-[10px] text-gray-600 mt-1">AI uses resume, interview transcripts, and evaluations to build the profile</p>
                    </div>
                    <div className="flex items-end">
                        <button onClick={handleProfile} disabled={loading || !candidateId}
                            className="w-full sm:w-auto px-8 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-40 rounded-xl font-black uppercase tracking-widest text-sm transition-all flex items-center gap-2">
                            {loading ? <><TfiReload className="animate-spin" /> Profiling...</> : <><TfiShield /> Build DNA Profile</>}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {result && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            {/* Hero: DISC Type + Superpower */}
                            <div className="bg-gradient-to-br from-red-600/10 to-purple-900/10 border border-red-600/20 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8">
                                <div className="flex flex-col items-center flex-shrink-0">
                                    <div className="w-24 h-24 rounded-3xl bg-red-600 flex items-center justify-center text-4xl font-black text-white shadow-[0_0_40px_rgba(220,38,38,0.4)]">
                                        {result.disc_type}
                                    </div>
                                    <div className="text-xs font-black uppercase tracking-widest text-gray-400 mt-2">{result.disc_label}</div>
                                    <div className={`mt-3 px-4 py-1.5 rounded-xl border text-xs font-black uppercase tracking-widest ${HIRE_STYLE[result.hiring_recommendation?.split(' ')[0]] || 'bg-gray-700/20 text-gray-400 border-gray-600/30'}`}>
                                        {result.hiring_recommendation?.split('—')[0]?.trim() || result.hiring_recommendation}
                                    </div>
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <div className="text-[10px] text-red-400 font-black uppercase tracking-widest mb-1">⚡ Superpower</div>
                                        <p className="text-white font-medium text-sm">{result.superpower}</p>
                                    </div>
                                    <p className="text-gray-300 text-sm leading-relaxed">{result.disc_description}</p>
                                    <div className="space-y-2">
                                        {Object.entries(discScores).map(([k, v]) => <DISCBar key={k} label={k} value={v} />)}
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 flex-wrap">
                                {['disc', 'work', 'environment', 'retention', 'onboard'].map(t => (
                                    <button key={t} onClick={() => setActiveTab(t)}
                                        className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                                        {t === 'disc' ? 'Personality' : t === 'work' ? 'Work Style' : t === 'environment' ? 'Ideal Env' : t === 'retention' ? 'Retention' : 'Onboarding'}
                                    </button>
                                ))}
                            </div>

                            {activeTab === 'disc' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-3">
                                        <div className="text-xs font-black uppercase tracking-widest text-gray-400">Personality Traits</div>
                                        {(result.personality_traits || []).map((t, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded flex-shrink-0 ${LEVEL_STYLE[t.level] || ''}`}>{t.level}</span>
                                                <div>
                                                    <div className="text-xs font-black text-white">{t.trait}</div>
                                                    <div className="text-[11px] text-gray-400">{t.work_impact}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-3">
                                        <div className="text-xs font-black uppercase tracking-widest text-gray-400">Communication Style</div>
                                        {result.communication_style && Object.entries(result.communication_style).map(([k, v]) => (
                                            <div key={k}>
                                                <div className="text-[10px] text-gray-500 uppercase font-black">{k.replace(/_/g, ' ')}</div>
                                                <div className="text-xs text-gray-200 mt-0.5">{v}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="md:col-span-2 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
                                        <div className="text-xs font-black uppercase tracking-widest text-amber-400 mb-3">Blind Spots</div>
                                        {(result.blind_spots || []).map((b, i) => <div key={i} className="text-xs text-amber-300 flex items-start gap-1 mb-1.5"><span>⚠</span>{b}</div>)}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'work' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {result.work_style && Object.entries(result.work_style).map(([k, v]) => (
                                        <div key={k} className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                                            <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">{k.replace(/_/g, ' ')}</div>
                                            {Array.isArray(v)
                                                ? v.map((item, i) => <div key={i} className="text-xs text-gray-200">• {item}</div>)
                                                : <div className="text-xs text-gray-200 font-medium">{v}</div>
                                            }
                                        </div>
                                    ))}
                                    <div className="sm:col-span-2 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                                        <div className="text-[10px] text-blue-400 uppercase font-black tracking-widest mb-1">Leadership</div>
                                        <div className="text-xs text-blue-300 font-black">{result.leadership_potential} Potential — {result.growth_trajectory}</div>
                                        <div className="text-xs text-blue-200 mt-1">{result.leadership_style}</div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'environment' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {result.ideal_environment && Object.entries(result.ideal_environment).filter(([k]) => k !== 'red_flag_environments').map(([k, v]) => (
                                        <div key={k} className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                                            <div className="text-[10px] text-emerald-400 uppercase font-black tracking-widest mb-1">{k.replace(/_/g, ' ')}</div>
                                            <div className="text-sm text-emerald-200 font-black">{v}</div>
                                        </div>
                                    ))}
                                    <div className="md:col-span-2 bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
                                        <div className="text-xs font-black uppercase tracking-widest text-red-400 mb-3">🚩 Red Flag Environments</div>
                                        {(result.ideal_environment?.red_flag_environments || []).map((r, i) => (
                                            <div key={i} className="text-xs text-red-300 flex items-start gap-1 mb-1.5"><span>✗</span>{r}</div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'retention' && (
                                <div className="space-y-4">
                                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-center">
                                        <div className="text-4xl font-black text-red-400">{result.retention_profile?.likely_stay_duration}</div>
                                        <div className="text-xs uppercase tracking-widest text-gray-400 mt-1">Predicted Tenure</div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
                                            <div className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-3">What Keeps Them</div>
                                            {(result.retention_profile?.what_keeps_them || []).map((w, i) => <div key={i} className="text-xs text-emerald-300 flex items-start gap-1 mb-1.5"><span>✓</span>{w}</div>)}
                                        </div>
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
                                            <div className="text-xs font-black uppercase tracking-widest text-red-400 mb-3">What Drives Them Away</div>
                                            {(result.retention_profile?.what_drives_them_away || []).map((w, i) => <div key={i} className="text-xs text-red-300 flex items-start gap-1 mb-1.5"><span>⚠</span>{w}</div>)}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'onboard' && (
                                <div className="space-y-3">
                                    {(result.onboarding_tips || []).map((tip, i) => (
                                        <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex items-start gap-3">
                                            <div className="w-7 h-7 rounded-xl bg-red-600 flex items-center justify-center text-xs font-black flex-shrink-0">{i + 1}</div>
                                            <span className="text-sm text-gray-200">{tip}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
