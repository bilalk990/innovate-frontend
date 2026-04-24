import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
    TfiBolt, TfiReload, TfiTarget, TfiStatsUp, TfiCheck,
    TfiAngleRight, TfiShield, TfiPulse, TfiLayers, TfiTimer
} from 'react-icons/tfi';
import authService from '../../services/authService';
import useAuth from '../../hooks/useAuth';

const GROWTH_COLORS = {
    'Very High': 'text-emerald-600 bg-emerald-50 border-emerald-200',
    'High': 'text-blue-600 bg-blue-50 border-blue-200',
    'Medium': 'text-amber-600 bg-amber-50 border-amber-200',
    'Steady': 'text-gray-600 bg-gray-50 border-gray-200',
};

const PATH_ACCENT = ['red', 'blue', 'purple'];
const PATH_STYLES = [
    { border: 'border-red-200', bg: 'bg-red-50', dot: 'bg-red-600', text: 'text-red-600', ring: 'ring-red-200' },
    { border: 'border-blue-200', bg: 'bg-blue-50', dot: 'bg-blue-600', text: 'text-blue-600', ring: 'ring-blue-200' },
    { border: 'border-purple-200', bg: 'bg-purple-50', dot: 'bg-purple-600', text: 'text-purple-600', ring: 'ring-purple-200' },
];

export default function CareerPath() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [selected, setSelected] = useState(0);

    const fetchPaths = async () => {
        setLoading(true);
        setData(null);
        try {
            const res = await authService.getCareerPath();
            setData(res.data);
            setSelected(0);
            toast.success('Career paths generated!');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to generate career paths. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const paths = data?.career_paths || [];
    const activePath = paths[selected];
    const style = PATH_STYLES[selected % 3];

    return (
        <div className="elite-content pb-24">
            {/* Header */}
            <div className="mb-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div>
                    <h1 className="elite-tactical-header">AI Career Path</h1>
                    <p className="elite-sub-header mt-2 text-gray-400 font-black uppercase tracking-[0.4em] text-[10px] italic">
                        Discover Your Future · 3 Tailored Paths · Personalized Roadmap
                    </p>
                </div>
                <button
                    onClick={fetchPaths}
                    disabled={loading}
                    className={`px-12 py-6 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.4em] italic flex items-center gap-4 shadow-2xl transition-all ${loading ? 'bg-gray-200 text-gray-400 animate-pulse' : 'bg-red-600 text-white hover:bg-gray-950 active:scale-[0.98]'}`}
                >
                    {loading ? <><TfiReload className="animate-spin" /> ANALYZING...</> : data ? <><TfiReload /> REGENERATE</> : <><TfiBolt className="animate-pulse" /> DISCOVER MY PATHS</>}
                </button>
            </div>

            {/* Profile Preview */}
            {!data && !loading && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
                    <div className="p-12 bg-white rounded-[3rem] border border-gray-100 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/[0.02] blur-[120px]" />
                        <h3 className="text-[11px] font-black uppercase text-gray-400 tracking-[0.5em] italic mb-10 relative z-10">What AI Analyzes</h3>
                        <div className="space-y-6 relative z-10">
                            {[
                                { label: 'Your Skills', val: user?.detailed_skills?.slice(0, 5).join(', ') || 'Not set', icon: <TfiBolt /> },
                                { label: 'Experience', val: `${user?.work_history?.length || 0} positions`, icon: <TfiLayers /> },
                                { label: 'Headline', val: user?.headline || 'Not set', icon: <TfiTarget /> },
                                { label: 'Interview History', val: 'Past evaluations & scores', icon: <TfiStatsUp /> },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-6 p-6 bg-gray-50 rounded-[1.5rem] border border-gray-100">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-red-600 shadow-sm">{item.icon}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[9px] font-black uppercase text-gray-400 tracking-widest italic">{item.label}</div>
                                        <div className="text-[12px] font-bold text-gray-700 italic truncate">{item.val}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center p-16 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 text-center">
                        <div className="w-24 h-24 rounded-[2.5rem] bg-red-600 text-white flex items-center justify-center text-4xl mb-10 animate-pulse shadow-[0_20px_40px_rgba(220,38,38,0.2)]">
                            <TfiTarget />
                        </div>
                        <h3 className="text-3xl font-black uppercase italic tracking-tighter text-gray-950 mb-4">Your Roadmap Awaits</h3>
                        <p className="text-[12px] font-black uppercase text-gray-400 tracking-[0.4em] italic max-w-sm">Click "Discover My Paths" — AI will recommend 3 personalized career paths with timelines, salaries, and step-by-step guidance.</p>
                    </div>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-48 bg-white rounded-[3rem] border border-gray-100 shadow-xl">
                    <div className="relative w-40 h-40 mb-12">
                        <div className="absolute inset-0 border-r-4 border-red-600 rounded-full animate-spin" />
                        <div className="absolute inset-6 border-l-4 border-gray-100 rounded-full animate-spin" style={{ animationDirection: 'reverse' }} />
                        <div className="flex items-center justify-center h-full text-red-600 text-5xl animate-pulse"><TfiTarget /></div>
                    </div>
                    <p className="text-[12px] font-black uppercase text-gray-800 tracking-[1em] animate-pulse italic">Mapping Your Future...</p>
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.6em] italic mt-4">Analyzing profile · Scanning market trends</p>
                </div>
            )}

            {/* Results */}
            {data && !loading && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                    {/* Overall Assessment Banner */}
                    <div className="p-12 bg-white rounded-[3rem] border border-gray-100 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/[0.02] blur-[120px]" />
                        <div className="flex items-start gap-8 relative z-10">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-red-600 text-white flex items-center justify-center text-2xl animate-pulse flex-shrink-0">
                                <TfiShield />
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase text-red-600 tracking-[0.5em] italic mb-4">AI Profile Assessment</div>
                                <p className="text-[16px] text-gray-700 italic leading-relaxed">{data.overall_assessment}</p>
                                {data.top_strength && (
                                    <div className="mt-6 inline-flex items-center gap-4 px-8 py-4 bg-emerald-50 border border-emerald-200 rounded-[1.5rem] text-[12px] text-emerald-700 font-black uppercase italic">
                                        <TfiCheck /> Top Strength: {data.top_strength}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Path Selector Tabs */}
                    <div className="flex gap-4">
                        {paths.map((path, i) => {
                            const s = PATH_STYLES[i % 3];
                            return (
                                <button
                                    key={i}
                                    onClick={() => setSelected(i)}
                                    className={`flex-1 p-8 rounded-[2rem] border-2 text-left transition-all ${selected === i ? `${s.border} ${s.bg} ring-4 ${s.ring}` : 'border-gray-100 bg-white hover:border-gray-200'}`}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`text-[10px] font-black uppercase tracking-widest italic ${selected === i ? s.text : 'text-gray-400'}`}>Path {i + 1}</span>
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase italic border ${selected === i ? `${s.text} ${s.bg} ${s.border}` : 'text-gray-400 bg-gray-50 border-gray-100'}`}>{path.match_score}%</span>
                                    </div>
                                    <div className={`text-[15px] font-black uppercase italic tracking-tighter leading-none ${selected === i ? s.text : 'text-gray-700'}`}>{path.title}</div>
                                    <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-2 italic">{path.timeline}</div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Active Path Detail */}
                    <AnimatePresence mode="wait">
                        {activePath && (
                            <motion.div key={selected} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Main Detail */}
                                <div className="lg:col-span-2 space-y-8">
                                    {/* Why Suited */}
                                    <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl">
                                        <h3 className={`text-[11px] font-black uppercase tracking-[0.5em] italic mb-8 flex items-center gap-4 ${style.text}`}>
                                            <TfiTarget /> Why You're Suited
                                        </h3>
                                        <p className="text-[15px] text-gray-600 italic leading-relaxed border-l-4 border-gray-100 pl-8">{activePath.why_suited}</p>
                                    </div>

                                    {/* Skills */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl">
                                            <h3 className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.4em] italic mb-6 flex items-center gap-3"><TfiCheck /> You Already Have</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {(activePath.current_skills_applicable || []).map((s, i) => (
                                                    <span key={i} className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 italic">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl">
                                            <h3 className="text-[10px] font-black uppercase text-red-600 tracking-[0.4em] italic mb-6 flex items-center gap-3"><TfiAngleRight /> Skills to Acquire</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {(activePath.skills_to_acquire || []).map((s, i) => (
                                                    <span key={i} className="text-[10px] font-black uppercase bg-red-50 text-red-600 px-4 py-2 rounded-xl border border-red-100 italic">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Career Progression */}
                                    <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl">
                                        <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.5em] italic mb-10">Career Progression Ladder</h3>
                                        <div className="flex items-center gap-4 flex-wrap">
                                            {(activePath.job_titles_on_path || []).map((title, i, arr) => (
                                                <div key={i} className="flex items-center gap-4">
                                                    <div className={`px-6 py-4 rounded-[1.5rem] border text-[11px] font-black uppercase italic ${i === 0 ? `${style.bg} ${style.border} ${style.text}` : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                                                        {title}
                                                    </div>
                                                    {i < arr.length - 1 && <TfiAngleRight className="text-gray-300 text-xl flex-shrink-0" />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* First Step CTA */}
                                    <div className={`p-10 rounded-[2.5rem] border-2 ${style.border} ${style.bg} relative overflow-hidden`}>
                                        <div className="flex items-start gap-8">
                                            <div className={`w-16 h-16 rounded-[1.5rem] ${style.dot} text-white flex items-center justify-center text-2xl flex-shrink-0`}><TfiBolt /></div>
                                            <div>
                                                <div className={`text-[10px] font-black uppercase tracking-[0.5em] italic mb-3 ${style.text}`}>Your First Step</div>
                                                <p className="text-[16px] font-black text-gray-950 italic leading-relaxed">{activePath.first_step}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Stats Column */}
                                <div className="space-y-6">
                                    {/* Match Score */}
                                    <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl text-center">
                                        <div className="text-[10px] font-black uppercase text-gray-400 tracking-[0.5em] italic mb-8">Match Score</div>
                                        <div className="relative w-36 h-36 mx-auto mb-6">
                                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                                <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="8" />
                                                <motion.circle
                                                    cx="50" cy="50" r="44" fill="none"
                                                    stroke={selected === 0 ? '#dc2626' : selected === 1 ? '#3b82f6' : '#9333ea'}
                                                    strokeWidth="8" strokeLinecap="round"
                                                    initial={{ strokeDasharray: '0 276' }}
                                                    animate={{ strokeDasharray: `${(activePath.match_score / 100) * 276} 276` }}
                                                    transition={{ duration: 1 }}
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className={`text-4xl font-black italic ${style.text}`}>{activePath.match_score}%</span>
                                            </div>
                                        </div>
                                        <div className={`text-[11px] font-black uppercase italic ${style.text}`}>AI Match</div>
                                    </div>

                                    {/* Key Stats */}
                                    {[
                                        { icon: <TfiBolt />, label: 'Salary Range', val: activePath.salary_range, color: 'text-amber-600' },
                                        { icon: <TfiTimer />, label: 'Timeline', val: activePath.timeline, color: 'text-blue-600' },
                                        { icon: <TfiStatsUp />, label: 'Growth', val: activePath.growth_potential, color: 'text-emerald-600' },
                                    ].map((stat, i) => (
                                        <div key={i} className="flex items-center gap-6 p-8 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                                            <div className={`w-12 h-12 rounded-[1.2rem] bg-gray-50 border border-gray-100 flex items-center justify-center ${stat.color} shadow-sm`}>{stat.icon}</div>
                                            <div>
                                                <div className="text-[9px] font-black uppercase text-gray-400 tracking-widest italic">{stat.label}</div>
                                                <div className={`text-[15px] font-black italic tracking-tighter ${stat.color}`}>{stat.val}</div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Growth Badge */}
                                    <div className={`p-6 rounded-[2rem] border text-center text-[12px] font-black uppercase italic ${GROWTH_COLORS[activePath.growth_potential] || 'text-gray-500 bg-gray-50 border-gray-200'}`}>
                                        <TfiPulse className="inline mr-3 animate-pulse" />
                                        {activePath.growth_potential} Growth Potential
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    );
}
