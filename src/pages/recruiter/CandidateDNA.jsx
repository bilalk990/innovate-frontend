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
        <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase italic tracking-widest">
                <span style={{ color: DISC_COLOR[label] }}>{label} — {DISC_LABEL[label]}</span>
                <span className="text-gray-400">{value}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 border border-gray-100 overflow-hidden shadow-inner">
                <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${value}%`, backgroundColor: DISC_COLOR[label] }} />
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
        authService.getUsers('candidate').then(r => {
            const data = Array.isArray(r.data) ? r.data : (r.data?.results || []);
            setCandidates(data);
        }).catch(() => { });
    }, []);

    const handleProfile = async () => {
        if (!candidateId) return toast.error('Select a candidate to profile.');
        setLoading(true); setResult(null);
        try {
            const r = await hrService.profileCandidateDNA({ candidate_id: candidateId });
            setResult(r.data);
            setActiveTab('disc');
        } catch (err) { toast.error(err.response?.data?.error || 'DNA profiling failed. Try again.'); }
        finally { setLoading(false); }
    };

    const discScores = result?.disc_scores || {};

    return (
        <div className="min-h-screen bg-white text-gray-950 p-8">
            <div className="max-w-6xl mx-auto space-y-12">
                
                {/* Header */}
                <div className="text-center pt-8">
                    <h1 className="text-6xl font-black italic uppercase tracking-tighter text-gray-950 leading-none">
                        CANDIDATE <span className="text-red-600 underline decoration-red-600/20 underline-offset-8">DNA PROFILER</span>
                    </h1>
                    <p className="text-gray-400 text-[10px] mt-6 font-black uppercase tracking-[0.4em] italic">AI-Driven Behavioral Engineering & Psychological Mapping</p>
                </div>

                {/* Selection Matrix */}
                <div className="bg-white border-2 border-gray-50 rounded-[3rem] p-12 shadow-2xl flex flex-col md:flex-row gap-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/[0.01] blur-[80px]" />
                    <div className="flex-1 space-y-4">
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-3 italic ml-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600" /> SELECT CANDIDATE FOR PROFILING
                        </div>
                        <select value={candidateId} onChange={e => setCandidateId(e.target.value)}
                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-[1.5rem] px-8 py-5 text-sm text-gray-950 font-bold focus:outline-none focus:border-red-600/50 focus:bg-white transition-all italic uppercase tracking-tighter">
                            <option value="">Select a candidate...</option>
                            {candidates.map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.name} ({c.email})</option>)}
                        </select>
                        <p className="text-[10px] text-gray-400 mt-4 italic font-black uppercase tracking-[0.2em] ml-4">AI leverages interview transcripts & technical data for psychometric reconstruction</p>
                    </div>
                    <div className="flex items-end">
                        <button onClick={handleProfile} disabled={loading || !candidateId}
                            className="w-full md:w-auto px-12 py-8 bg-red-600 hover:bg-red-700 disabled:opacity-30 rounded-[2rem] font-black uppercase tracking-[0.4em] text-[11px] text-white transition-all duration-500 flex items-center justify-center gap-4 shadow-[0_20px_40px_-10px_rgba(220,38,38,0.3)] active:scale-[0.98] group">
                            {loading ? <><TfiReload className="animate-spin text-xl" /> AUDITING NEURAL DATA...</> : <><TfiShield className="text-xl group-hover:rotate-12 transition-transform" /> BUILD DNA PROFILE</>}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {result && (
                        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                            
                            {/* DNA Hero */}
                            <div className="bg-gray-50 border-2 border-gray-100 rounded-[4rem] p-16 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center gap-16">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/[0.03] blur-[100px] pointer-events-none" />
                                
                                <div className="flex flex-col items-center flex-shrink-0 lg:border-r-2 border-gray-100 lg:pr-16">
                                    <div className="w-32 h-32 rounded-[2.5rem] bg-white border-4 border-red-600 text-red-600 flex items-center justify-center text-6xl font-black italic shadow-2xl group hover:rotate-12 transition-transform uppercase tracking-tighter">
                                        {result.disc_type}
                                    </div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 mt-8 italic">TYPE: {result.disc_label}</div>
                                    <div className={`mt-8 px-10 py-4 rounded-[2rem] border-2 text-[10px] font-black uppercase tracking-[0.2em] italic shadow-lg bg-white ${result.hiring_recommendation?.includes('Hire') ? 'text-emerald-600 border-emerald-100' : result.hiring_recommendation?.includes('Consider') ? 'text-amber-600 border-amber-100' : 'text-red-600 border-red-100'}`}>
                                        {result.hiring_recommendation?.split('—')[0]?.trim() || result.hiring_recommendation}
                                    </div>
                                </div>

                                <div className="flex-1 space-y-10 relative z-10">
                                    <div className="space-y-4">
                                        <div className="text-[10px] text-red-600 font-black uppercase tracking-[0.4em] italic flex items-center gap-4">
                                            <span className="w-12 h-1 bg-red-600 rounded-full" /> CORE ARCHETYPE SUPERPOWER
                                        </div>
                                        <p className="text-4xl text-gray-950 font-black italic tracking-tighter leading-none uppercase">{result.superpower}</p>
                                    </div>
                                    <p className="text-gray-600 text-xl font-black italic uppercase tracking-tighter leading-tight bg-white p-10 rounded-[3rem] border border-gray-100 shadow-inner">"{result.disc_description}"</p>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                                        {Object.entries(discScores).map(([k, v]) => (
                                            <DISCBar key={k} label={k} value={v} />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Navigator Tabs */}
                            <div className="flex gap-3 flex-wrap justify-center p-2 bg-gray-50 rounded-[2.5rem] w-fit mx-auto border border-gray-100 shadow-sm">
                                {[
                                    ['disc', '🧬 PERSONALITY'],
                                    ['work', '⚡ WORK STYLE'],
                                    ['environment', '🏢 IDEAL ENV'],
                                    ['retention', '🔒 RETENTION'],
                                    ['onboard', '🚀 ONBOARDING']
                                ].map(([t, label]) => (
                                    <button key={t} onClick={() => setActiveTab(t)}
                                        className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 italic ${activeTab === t ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-950'}`}>
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content Section */}
                            <div className="bg-white border-2 border-gray-50 rounded-[3.5rem] p-12 shadow-2xl min-h-[500px]">
                                {activeTab === 'disc' && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                        <div className="bg-gray-50 border-2 border-gray-100 rounded-[3rem] p-12 space-y-10">
                                            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 italic text-center">PSYCHOLOGICAL ATTRIBUTES</div>
                                            <div className="space-y-8">
                                                {Array.isArray(result.personality_traits) && result.personality_traits.map((t, i) => (
                                                    <div key={i} className="flex items-start gap-6 group">
                                                        <span className={`text-[10px] font-black uppercase px-6 py-2 rounded-xl border-2 italic tracking-widest flex-shrink-0 h-fit bg-white ${t.level === 'High' ? 'text-emerald-600 border-emerald-100' : t.level === 'Medium' ? 'text-amber-600 border-amber-100' : 'text-gray-400 border-gray-100'}`}>{t.level}</span>
                                                        <div className="space-y-2">
                                                            <div className="text-lg font-black text-gray-950 italic uppercase tracking-tighter group-hover:text-red-600 transition-colors">{t.trait}</div>
                                                            <div className="text-[11px] text-gray-400 font-black uppercase tracking-widest italic">Impact: {t.work_impact}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-12">
                                            <div className="bg-white border-2 border-gray-100 rounded-[3rem] p-12 shadow-xl">
                                                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-10 italic">COMMUNICATION PROTOCOLS</div>
                                                <div className="space-y-8">
                                                    {result.communication_style && typeof result.communication_style === 'object' && Object.entries(result.communication_style).map(([k, v]) => (
                                                        <div key={k} className="group space-y-3">
                                                            <div className="text-[10px] text-red-600 uppercase font-black italic tracking-widest flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-red-600" /> {k.replace(/_/g, ' ')}</div>
                                                            <div className="text-sm text-gray-950 font-bold italic bg-gray-50 p-6 rounded-2xl border border-gray-100 group-hover:bg-white group-hover:border-red-600/20 transition-all uppercase tracking-tight">"{v}"</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="bg-red-50 border-2 border-red-100 rounded-[3rem] p-12 shadow-sm relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/[0.05] blur-[60px]" />
                                                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600 mb-10 italic flex items-center gap-4">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-600" /> AUDIT ALERT: BLIND SPOTS
                                                </div>
                                                <div className="space-y-4">
                                                    {Array.isArray(result.blind_spots) && result.blind_spots.map((b, i) => (
                                                        <div key={i} className="text-sm text-red-950 font-bold italic flex items-start gap-6 bg-white p-6 rounded-2xl border border-red-50 shadow-xl uppercase tracking-tight">
                                                            <span className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-black shrink-0">!</span>{b}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'work' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        {result.work_style && Object.entries(result.work_style).map(([k, v]) => (
                                            <div key={k} className="bg-gray-50 border-2 border-gray-100 rounded-[3rem] p-10 hover:bg-white hover:border-red-600/20 transition-all duration-500 group relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/[0.01] blur-[60px]" />
                                                <div className="text-[10px] text-gray-400 uppercase font-black tracking-[0.4em] mb-8 italic group-hover:text-red-600 transition-colors border-b border-gray-100 pb-4">{k.replace(/_/g, ' ')}</div>
                                                {Array.isArray(v)
                                                    ? <div className="space-y-4">{v.map((item, i) => <div key={i} className="text-sm text-gray-950 font-bold italic flex items-start gap-4 bg-white p-5 rounded-2xl border border-gray-50 shadow-sm uppercase tracking-tight"><span className="text-red-600 font-black text-lg leading-none">→</span>{item}</div>)}</div>
                                                    : <div className="text-2xl text-gray-950 font-black italic uppercase tracking-tighter leading-none underline decoration-red-100 underline-offset-8">{v}</div>
                                                }
                                            </div>
                                        ))}
                                        <div className="md:col-span-2 bg-blue-50 border-4 border-blue-100 rounded-[4rem] p-16 shadow-2xl relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/[0.05] blur-[120px]" />
                                            <div className="flex flex-col md:flex-row items-center gap-16 relative z-10">
                                                <div className="text-center md:border-r-4 border-blue-100 md:pr-16">
                                                    <div className="text-8xl font-black text-blue-600 italic tracking-tighter uppercase leading-none">{result.leadership_potential}</div>
                                                    <div className="text-[10px] text-blue-400 font-black uppercase tracking-[0.5em] mt-6 italic">LEADERSHIP INDEX</div>
                                                </div>
                                                <div className="flex-1 space-y-8">
                                                    <div className="text-[11px] font-black text-blue-600 uppercase tracking-[0.5em] italic bg-white px-8 py-3 rounded-2xl border border-blue-100 inline-block shadow-lg">GROWTH VECTOR: {result.growth_trajectory}</div>
                                                    <p className="text-3xl text-blue-950 font-black italic leading-tight uppercase tracking-tighter">"{result.leadership_style}"</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'environment' && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                        <div className="space-y-8">
                                            {result.ideal_environment && Object.entries(result.ideal_environment).filter(([k]) => k !== 'red_flag_environments').map(([k, v]) => (
                                                <div key={k} className="bg-emerald-50 border-2 border-emerald-100 rounded-[3rem] p-10 shadow-xl hover:scale-[1.02] transition-transform">
                                                    <div className="text-[10px] text-emerald-600 uppercase font-black tracking-[0.4em] mb-6 italic flex items-center gap-4 border-b border-emerald-100 pb-4"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> {k.replace(/_/g, ' ')}</div>
                                                    <div className="text-3xl text-emerald-950 font-black italic uppercase tracking-tighter leading-none">"{v}"</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bg-red-50 border-4 border-red-600 rounded-[4rem] p-16 shadow-2xl relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/[0.05] blur-[100px] pointer-events-none" />
                                            <div className="text-[12px] font-black uppercase tracking-[0.5em] text-red-600 mb-12 italic flex items-center gap-6">
                                                <span className="w-12 h-1 bg-red-600 rounded-full" /> RED FLAG ENVIRONMENTS
                                            </div>
                                            <div className="space-y-6">
                                                {Array.isArray(result.ideal_environment?.red_flag_environments) && result.ideal_environment.red_flag_environments.map((r, i) => (
                                                    <div key={i} className="text-lg text-red-950 font-black italic flex items-center gap-8 bg-white p-8 rounded-[2.5rem] border-2 border-red-100 shadow-2xl uppercase tracking-tighter group-hover:translate-x-4 transition-transform">
                                                        <span className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center text-2xl font-black shrink-0">✗</span>{r}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'retention' && (
                                    <div className="space-y-12">
                                        <div className="bg-gray-50 border-2 border-gray-100 rounded-[4rem] p-16 text-center shadow-2xl relative overflow-hidden group">
                                            <div className="absolute top-0 left-0 w-full h-full bg-red-600/[0.02] blur-[120px]" />
                                            <div className="text-9xl font-black text-red-600 italic tracking-tighter uppercase relative z-10 leading-none group-hover:scale-110 transition-transform">{result.retention_profile?.likely_stay_duration}</div>
                                            <div className="text-[10px] font-black uppercase tracking-[0.6em] text-gray-400 mt-10 italic relative z-10 border-t border-gray-100 pt-8 w-fit mx-auto px-12">PREDICTED STABILITY HORIZON</div>
                                        </div>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                            <div className="bg-emerald-50 border-2 border-emerald-100 rounded-[3.5rem] p-12 space-y-10 shadow-xl">
                                                <div className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-600 italic flex items-center gap-4">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> RETENTION MULTIPLIERS
                                                </div>
                                                <div className="space-y-6">
                                                    {Array.isArray(result.retention_profile?.what_keeps_them) && result.retention_profile.what_keeps_them.map((w, i) => (
                                                        <div key={i} className="text-base text-emerald-950 font-black italic flex items-start gap-6 bg-white p-8 rounded-[2.5rem] border-2 border-emerald-100 shadow-xl uppercase tracking-tighter">
                                                            <span className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-xl font-black shrink-0">✓</span>{w}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="bg-red-50 border-2 border-red-100 rounded-[3.5rem] p-12 space-y-10 shadow-xl">
                                                <div className="text-[11px] font-black uppercase tracking-[0.4em] text-red-600 italic flex items-center gap-4">
                                                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" /> ATTRITION VECTORS
                                                </div>
                                                <div className="space-y-6">
                                                    {Array.isArray(result.retention_profile?.what_drives_them_away) && result.retention_profile.what_drives_them_away.map((w, i) => (
                                                        <div key={i} className="text-base text-red-950 font-black italic flex items-start gap-6 bg-white p-8 rounded-[2.5rem] border-2 border-red-100 shadow-xl uppercase tracking-tighter">
                                                            <span className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center text-xl font-black shrink-0">⚠</span>{w}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'onboard' && (
                                    <div className="space-y-8">
                                        <div className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 italic text-center mb-10">STRATEGIC DEPLOYMENT PROTOCOLS</div>
                                        {Array.isArray(result.onboarding_tips) && result.onboarding_tips.map((tip, i) => (
                                            <div key={i} className="bg-gray-50 border-2 border-gray-100 rounded-[3rem] p-12 flex items-center gap-10 hover:bg-white hover:border-red-600/20 transition-all duration-500 group relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/[0.01] blur-[80px]" />
                                                <div className="w-20 h-20 rounded-[2rem] bg-gray-950 text-white flex items-center justify-center text-3xl font-black flex-shrink-0 italic shadow-2xl group-hover:bg-red-600 transition-colors">
                                                    {i + 1}
                                                </div>
                                                <p className="text-xl text-gray-950 font-black italic leading-tight uppercase tracking-tighter">"{tip}"</p>
                                            </div>
                                        ))}
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
