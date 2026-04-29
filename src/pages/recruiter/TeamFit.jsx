import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TfiReload, TfiLayoutGrid2, TfiUser } from 'react-icons/tfi';
import { toast } from 'sonner';
import hrService from '../../services/hrService';
import authService from '../../services/authService';

const FIT_COLOR = (s) => s >= 80 ? 'text-emerald-400' : s >= 60 ? 'text-amber-400' : 'text-red-400';
const FIT_LABEL_STYLE = { 'Excellent Fit': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', 'Good Fit': 'bg-blue-500/20 text-blue-300 border-blue-500/30', 'Moderate Fit': 'bg-amber-500/20 text-amber-300 border-amber-500/30', 'Poor Fit': 'bg-red-500/20 text-red-300 border-red-500/30' };

export default function TeamFit() {
    const [candidates, setCandidates] = useState([]);
    const [candidateId, setCandidateId] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [team, setTeam] = useState({ size: 5, skills: '', gaps: '', work_style: 'Collaborative', culture: 'Fast-paced startup', challenges: '', management_style: 'Flat' });

    useEffect(() => {
        authService.getUsers('candidate').then(r => {
            const data = Array.isArray(r.data) ? r.data : (r.data?.results || []);
            setCandidates(data);
        }).catch(() => {});
    }, []);
    const setT = (k, v) => setTeam(p => ({ ...p, [k]: v }));

    const handleAnalyze = async () => {
        if (!candidateId) return toast.error('Select a candidate.');
        if (!team.skills) return toast.error('Enter team skills.');
        setLoading(true); setResult(null);
        try {
            const r = await hrService.predictTeamFit({ candidate_id: candidateId, team_size: team.size, team_skills: team.skills, team_gaps: team.gaps, work_style: team.work_style, team_culture: team.culture, team_challenges: team.challenges, management_style: team.management_style });
            setResult(r.data);
        } catch { toast.error('Analysis failed.'); }
        finally { setLoading(false); }
    };

    const breakdown = result?.fit_breakdown || {};

    return (
        <div className="min-h-screen bg-white text-black p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter text-black">
                        Team Fit <span className="text-red-600">Predictor</span>
                    </h1>
                    <p className="text-gray-600 text-sm mt-1 uppercase tracking-widest">AI predicts how well a candidate will integrate with your team</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Candidate */}
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-4">
                        <div className="text-xs font-black uppercase tracking-widest text-gray-700">Candidate</div>
                        <select value={candidateId} onChange={e => setCandidateId(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-red-600">
                            <option value="">Select candidate...</option>
                            {candidates.map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.name} ({c.email})</option>)}
                        </select>
                    </div>

                    {/* Team */}
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-4">
                        <div className="text-xs font-black uppercase tracking-widest text-gray-700">Your Team Profile</div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] uppercase tracking-widest text-gray-600 block mb-1">Team Size</label>
                                <input type="number" value={team.size} onChange={e => setT('size', +e.target.value)}
                                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-black focus:outline-none focus:border-red-600" />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase tracking-widest text-gray-600 block mb-1">Management Style</label>
                                <select value={team.management_style} onChange={e => setT('management_style', e.target.value)}
                                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-black focus:outline-none focus:border-red-600">
                                    {['Flat', 'Hierarchical', 'Agile', 'Mentorship-driven'].map(o => <option key={o}>{o}</option>)}
                                </select>
                            </div>
                        </div>
                        {[['skills', 'Team Skills (comma-separated) *'], ['gaps', 'Team Gaps (comma-separated)'], ['challenges', 'Team Challenges']].map(([k, ph]) => (
                            <div key={k}>
                                <label className="text-[10px] uppercase tracking-widest text-gray-600 block mb-1">{ph}</label>
                                <input value={team[k]} onChange={e => setT(k, e.target.value)} placeholder={ph}
                                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-black focus:outline-none focus:border-red-600" />
                            </div>
                        ))}
                        <div className="grid grid-cols-2 gap-3">
                            {[['work_style', ['Collaborative', 'Independent', 'Hybrid', 'Fast-paced']], ['culture', ['Fast-paced startup', 'Corporate', 'Remote-first', 'Creative agency', 'Research lab']]].map(([k, opts]) => (
                                <div key={k}>
                                    <label className="text-[10px] uppercase tracking-widest text-gray-600 block mb-1">{k.replace('_', ' ')}</label>
                                    <select value={team[k]} onChange={e => setT(k, e.target.value)}
                                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-black focus:outline-none focus:border-red-600">
                                        {opts.map(o => <option key={o}>{o}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <button onClick={handleAnalyze} disabled={loading}
                    className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:opacity-40 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 text-white">
                    {loading ? <><TfiReload className="animate-spin" /> Analyzing Team Fit...</> : <><TfiLayoutGrid2 /> Predict Team Fit</>}
                </button>

                <AnimatePresence>
                    {result && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            {/* Score Hero */}
                            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8">
                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    <div className="flex flex-col items-center">
                                        <div className={`text-7xl font-black ${FIT_COLOR(result.fit_score)}`}>{result.fit_score}</div>
                                        <div className="text-xs uppercase tracking-widest text-gray-400 mt-1">Fit Score</div>
                                        <div className={`mt-3 px-4 py-1.5 rounded-xl border text-xs font-black uppercase tracking-widest ${FIT_LABEL_STYLE[result.fit_label] || 'bg-gray-700/20 text-gray-400 border-gray-600/30'}`}>{result.fit_label}</div>
                                    </div>
                                    <div className="flex-1 grid grid-cols-2 gap-3">
                                        {[['Skill Complementarity', breakdown.skill_complementarity], ['Culture Alignment', breakdown.culture_alignment], ['Work Style Match', breakdown.work_style_match], ['Gap Filling', breakdown.gap_filling_score]].map(([label, val]) => (
                                            <div key={label} className="bg-white/5 rounded-xl p-3">
                                                <div className="text-[10px] text-gray-400 uppercase font-black mb-1">{label}</div>
                                                <div className={`text-xl font-black ${FIT_COLOR(val)}`}>{val}</div>
                                                <div className="w-full bg-gray-800 rounded-full h-1 mt-1">
                                                    <div className="bg-red-600 h-1 rounded-full" style={{ width: `${val}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 flex-wrap">
                                {['overview', 'dynamics', 'onboarding', 'tips'].map(t => (
                                    <button key={t} onClick={() => setActiveTab(t)}
                                        className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                                        {t === 'overview' ? 'Fit Overview' : t === 'dynamics' ? 'Team Dynamics' : t === 'onboarding' ? 'Onboarding' : 'Manager Tips'}
                                    </button>
                                ))}
                            </div>

                            {activeTab === 'overview' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
                                        <div className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-3">Skills Candidate Brings</div>
                                    {Array.isArray(result.skills_candidate_brings) && result.skills_candidate_brings.map((s, i) => <div key={i} className="text-xs text-emerald-300 flex items-start gap-1 mb-1.5"><span>✓</span>{s}</div>)}
                                </div>
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5">
                                    <div className="text-xs font-black uppercase tracking-widest text-blue-400 mb-3">Team Gaps This Fills</div>
                                    {Array.isArray(result.gaps_candidate_fills) && result.gaps_candidate_fills.map((g, i) => <div key={i} className="text-xs text-blue-300 flex items-start gap-1 mb-1.5"><span>→</span>{g}</div>)}
                                </div>
                                {Array.isArray(result.potential_conflicts) && result.potential_conflicts.length > 0 && (
                                    <div className="md:col-span-2 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
                                        <div className="text-xs font-black uppercase tracking-widest text-amber-400 mb-3">Potential Conflicts</div>
                                        {result.potential_conflicts.map((c, i) => (
                                                <div key={i} className="flex items-start gap-3 mb-3">
                                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded flex-shrink-0 ${c.severity === 'High' ? 'bg-red-500/20 text-red-400' : c.severity === 'Medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>{c.severity}</span>
                                                    <div>
                                                        <div className="text-xs text-amber-200">{c.area}</div>
                                                        <div className="text-xs text-gray-400 mt-1">Mitigation: {c.mitigation}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="md:col-span-2 bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                                        <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Long-Term Potential</div>
                                        <p className="text-gray-200 text-sm">{result.long_term_potential}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <div className={`text-center py-4 rounded-2xl border text-sm font-black uppercase tracking-widest ${Object.keys(FIT_LABEL_STYLE).find(k => result.verdict?.includes(k)) ? FIT_LABEL_STYLE[Object.keys(FIT_LABEL_STYLE).find(k => result.verdict?.includes(k))] : 'bg-gray-700/20 text-gray-400 border-gray-600/30'}`}>
                                            Verdict: {result.verdict}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'dynamics' && (
                                <div className="space-y-4">
                                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                                        <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Team Dynamics Analysis</div>
                                        <p className="text-gray-200 text-sm leading-relaxed">{result.team_dynamics_analysis}</p>
                                    </div>
                                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                                        <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">First 90 Days</div>
                                        <p className="text-gray-200 text-sm leading-relaxed">{result.first_90_days}</p>
                                    </div>
                                    {Array.isArray(result.collaboration_predictions) && result.collaboration_predictions.map((p, i) => (
                                        <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center text-xs flex-shrink-0">🤝</div>
                                            <div>
                                                <div className="text-xs font-black uppercase tracking-wide text-gray-300">{p.with}</div>
                                                <div className="text-xs text-gray-400 mt-1">{p.prediction}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'onboarding' && (
                                <div className="space-y-3">
                                    {Array.isArray(result.onboarding_recommendations) && result.onboarding_recommendations.map((r, i) => (
                                        <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-lg bg-red-600 flex items-center justify-center text-xs font-black flex-shrink-0">{i + 1}</div>
                                            <span className="text-sm text-gray-200">{r}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'tips' && (
                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        {Array.isArray(result.manager_tips) && result.manager_tips.map((t, i) => (
                                            <div key={i} className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
                                                <span className="text-blue-400 text-sm">💼</span>
                                                <span className="text-sm text-blue-200">{t}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {Array.isArray(result.risk_factors) && result.risk_factors.length > 0 && (
                                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
                                            <div className="text-xs font-black uppercase tracking-widest text-amber-400 mb-3">Risk Factors</div>
                                            {result.risk_factors.map((r, i) => <div key={i} className="text-xs text-amber-300 flex items-start gap-1 mb-1.5"><span>⚠</span>{r}</div>)}
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
