import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TfiReload, TfiTarget, TfiStatsUp, TfiMap, TfiCup, TfiCheck } from 'react-icons/tfi';
import { toast } from 'sonner';
import hrService from '../../services/hrService';

const PRIORITY_STYLE = {
    Critical: 'bg-red-500/20 text-red-300 border-red-500/30',
    High: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    Medium: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'Must Have': 'bg-red-500/20 text-red-300 border-red-500/30',
    'Strongly Recommended': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    Optional: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};
const READINESS_COLOR = (s) => s >= 75 ? 'text-emerald-400' : s >= 50 ? 'text-amber-400' : 'text-red-400';
const READINESS_BG = (s) => s >= 75 ? 'bg-emerald-600' : s >= 50 ? 'bg-amber-500' : 'bg-red-600';
const PHASE_COLORS = ['bg-red-600', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500'];

const LEARNING_STYLES = ['Visual (Videos & Infographics)', 'Reading (Books & Articles)', 'Hands-on (Projects & Labs)', 'Blended (Mix of all)'];
const BUDGET_OPTIONS = ['Under $100', '$100 - $300', '$300 - $500', '$500 - $1000', '$1000 - $2000', '$2000+', 'Company Sponsored (No Limit)'];
const TIMELINES = [3, 6, 9, 12, 18, 24];
const INDUSTRIES = ['Technology / Software', 'Finance / Banking', 'Healthcare / Pharma', 'Marketing / Media', 'Manufacturing', 'Education', 'Consulting', 'Retail / E-commerce', 'Logistics', 'Real Estate', 'Other'];

export default function LDRoadmap() {
    const [form, setForm] = useState({
        employee_name: '',
        current_role: '',
        target_role: '',
        current_skills: '',
        experience_years: '',
        learning_style: 'Blended (Mix of all)',
        budget_range: '$300 - $500',
        timeline_months: 6,
        industry: '',
        company_name: '',
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState('roadmap');
    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleGenerate = async () => {
        if (!form.employee_name.trim()) return toast.error('Enter employee name.');
        if (!form.current_role.trim()) return toast.error('Enter current role.');
        if (!form.target_role.trim()) return toast.error('Enter target role / goal.');
        setLoading(true); setResult(null);
        try {
            const r = await hrService.generateLDRoadmap(form);
            setResult(r.data);
            setActiveTab('roadmap');
            toast.success('L&D Roadmap generated!');
        } catch { toast.error('Roadmap generation failed. Please try again.'); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter">
                        Training & Development <span className="text-red-600">Planner</span>
                    </h1>
                    <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest">AI builds a personalized L&D roadmap — courses, certifications, timeline, budget & ROI</p>
                </div>

                {/* How It Works */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    {[['🎯', 'Gap Analysis', 'AI identifies exact skill gaps'], ['📚', 'Course Plan', 'Real courses with platforms & costs'], ['🏅', 'Certifications', 'Target certs with prep timeline'], ['📈', 'ROI Calc', 'Company ROI & retention impact']].map(([icon, title, desc]) => (
                        <div key={title} className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-center">
                            <div className="text-2xl mb-2">{icon}</div>
                            <div className="text-xs font-black uppercase tracking-widest text-white mb-1">{title}</div>
                            <div className="text-[11px] text-gray-500">{desc}</div>
                        </div>
                    ))}
                </div>

                {/* Form */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-5">
                    <div className="text-xs font-black uppercase tracking-widest text-gray-400 border-b border-white/5 pb-3">Employee Development Profile</div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">Employee Name *</label>
                            <input value={form.employee_name} onChange={e => set('employee_name', e.target.value)} placeholder="e.g. Ali Hassan"
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">Company Name</label>
                            <input value={form.company_name} onChange={e => set('company_name', e.target.value)} placeholder="e.g. TechCorp"
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">Current Role *</label>
                            <input value={form.current_role} onChange={e => set('current_role', e.target.value)} placeholder="e.g. Junior Software Engineer"
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">Target Role / Career Goal *</label>
                            <input value={form.target_role} onChange={e => set('target_role', e.target.value)} placeholder="e.g. Senior Software Engineer / Team Lead"
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">Years of Experience</label>
                            <input type="number" min="0" max="40" value={form.experience_years} onChange={e => set('experience_years', e.target.value)} placeholder="e.g. 3"
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">Industry</label>
                            <select value={form.industry} onChange={e => set('industry', e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600">
                                <option value="">Select Industry...</option>
                                {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">Learning Style</label>
                            <select value={form.learning_style} onChange={e => set('learning_style', e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600">
                                {LEARNING_STYLES.map(l => <option key={l}>{l}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">Training Budget</label>
                            <select value={form.budget_range} onChange={e => set('budget_range', e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600">
                                {BUDGET_OPTIONS.map(b => <option key={b}>{b}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">Current Skills <span className="text-gray-600">(comma-separated)</span></label>
                        <textarea value={form.current_skills} onChange={e => set('current_skills', e.target.value)} rows={3}
                            placeholder="e.g. JavaScript, React, Node.js, Git, SQL, REST APIs, Agile, Problem Solving..."
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600 resize-none" />
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-2">Development Timeline</label>
                        <div className="flex gap-2 flex-wrap">
                            {TIMELINES.map(t => (
                                <button key={t} onClick={() => set('timeline_months', t)}
                                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${form.timeline_months === t ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                                    {t} months
                                </button>
                            ))}
                        </div>
                    </div>

                    <button onClick={handleGenerate} disabled={loading}
                        className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:opacity-40 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2">
                        {loading ? <><TfiReload className="animate-spin" /> Building Personalized Roadmap...</> : <><TfiMap /> Generate L&D Roadmap</>}
                    </button>
                </div>

                {/* Results */}
                <AnimatePresence>
                    {result && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

                            {/* Hero */}
                            <div className="bg-gradient-to-br from-red-600/10 to-blue-900/10 border border-red-600/20 rounded-2xl p-8">
                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    <div className="flex flex-col items-center flex-shrink-0">
                                        <div className={`text-6xl font-black ${READINESS_COLOR(result.readiness_score)}`}>{result.readiness_score}</div>
                                        <div className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">Readiness Score</div>
                                        <div className={`mt-2 text-xs font-black uppercase px-4 py-1.5 rounded-xl ${READINESS_COLOR(result.readiness_score)} bg-white/5`}>
                                            {result.readiness_label}
                                        </div>
                                        <div className="w-full bg-gray-800 rounded-full h-2 mt-3">
                                            <div className={`h-2 rounded-full ${READINESS_BG(result.readiness_score)}`} style={{ width: `${result.readiness_score}%` }} />
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <p className="text-gray-200 text-sm leading-relaxed">{result.employee_summary}</p>
                                        <div className="grid grid-cols-3 gap-3 text-center">
                                            <div className="bg-white/5 rounded-xl p-3">
                                                <div className="text-lg font-black text-white">{result.recommended_courses?.length || 0}</div>
                                                <div className="text-[10px] text-gray-400 uppercase">Courses</div>
                                            </div>
                                            <div className="bg-white/5 rounded-xl p-3">
                                                <div className="text-lg font-black text-white">{result.certifications?.length || 0}</div>
                                                <div className="text-[10px] text-gray-400 uppercase">Certs</div>
                                            </div>
                                            <div className="bg-white/5 rounded-xl p-3">
                                                <div className="text-lg font-black text-white">{result.learning_roadmap?.length || 0}</div>
                                                <div className="text-[10px] text-gray-400 uppercase">Phases</div>
                                            </div>
                                        </div>
                                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                                            <div className="text-[10px] text-blue-400 font-black uppercase mb-1">💬 For {form.employee_name}</div>
                                            <p className="text-xs text-blue-200 italic">{result.motivational_note}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 flex-wrap">
                                {[['roadmap', '🗺️ Roadmap'], ['gaps', '🎯 Skill Gaps'], ['courses', '📚 Courses'], ['certs', '🏅 Certs'], ['schedule', '📅 Schedule'], ['roi', '📈 ROI']].map(([t, label]) => (
                                    <button key={t} onClick={() => setActiveTab(t)}
                                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {/* Roadmap Phases */}
                            {activeTab === 'roadmap' && (
                                <div className="space-y-4">
                                    {(result.learning_roadmap || []).map((phase, i) => (
                                        <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex gap-4">
                                            <div className={`w-10 h-10 rounded-2xl ${PHASE_COLORS[i] || 'bg-gray-600'} flex items-center justify-center text-white font-black text-sm flex-shrink-0`}>
                                                {phase.phase}
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <div className="text-sm font-black text-white uppercase">{phase.phase_title}</div>
                                                    <div className="text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 rounded-lg">{phase.duration}</div>
                                                </div>
                                                <p className="text-xs text-gray-400">{phase.focus}</p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    <div>
                                                        <div className="text-[10px] text-emerald-400 font-black uppercase mb-1">Milestones</div>
                                                        {(phase.milestones || []).map((m, mi) => (
                                                            <div key={mi} className="text-xs text-emerald-300 flex items-start gap-1"><TfiCheck className="flex-shrink-0 mt-0.5" />{m}</div>
                                                        ))}
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] text-blue-400 font-black uppercase mb-1">Activities</div>
                                                        {(phase.activities || []).map((a, ai) => (
                                                            <div key={ai} className="text-xs text-blue-300 flex items-start gap-1"><span>→</span>{a}</div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Skill Gaps */}
                            {activeTab === 'gaps' && result.skill_gap_analysis && (
                                <div className="space-y-4">
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
                                        <div className="text-xs font-black uppercase tracking-widest text-red-400 mb-3">🔴 Critical Gaps — Fix First</div>
                                        <div className="flex flex-wrap gap-2">
                                            {(result.skill_gap_analysis.critical_gaps || []).map((g, i) => (
                                                <span key={i} className="text-xs bg-red-500/20 text-red-300 border border-red-500/30 px-3 py-1.5 rounded-xl font-black">{g}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
                                        <div className="text-xs font-black uppercase tracking-widest text-amber-400 mb-3">🟡 Moderate Gaps — Develop Over Time</div>
                                        <div className="flex flex-wrap gap-2">
                                            {(result.skill_gap_analysis.moderate_gaps || []).map((g, i) => (
                                                <span key={i} className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl font-black">{g}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
                                        <div className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-3">✅ Existing Strengths — Build On These</div>
                                        <div className="flex flex-wrap gap-2">
                                            {(result.skill_gap_analysis.existing_strengths || []).map((s, i) => (
                                                <span key={i} className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-black">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                                        <div className="text-[10px] text-gray-400 font-black uppercase mb-1">Gap Summary</div>
                                        <p className="text-sm text-gray-200">{result.skill_gap_analysis.gap_summary}</p>
                                    </div>
                                </div>
                            )}

                            {/* Courses */}
                            {activeTab === 'courses' && (
                                <div className="space-y-3">
                                    {(result.recommended_courses || []).map((c, i) => (
                                        <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-2">
                                            <div className="flex items-start gap-3 flex-wrap">
                                                <div className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg border flex-shrink-0 ${PRIORITY_STYLE[c.priority] || 'bg-gray-700/20 text-gray-400 border-gray-600/30'}`}>{c.priority}</div>
                                                <div className="flex-1">
                                                    <div className="text-sm font-black text-white">{c.title}</div>
                                                    <div className="flex gap-3 mt-1 flex-wrap">
                                                        <span className="text-[11px] text-blue-400 font-black">{c.platform}</span>
                                                        <span className="text-[11px] text-gray-500">{c.duration}</span>
                                                        <span className="text-[11px] text-emerald-400 font-black">{c.cost}</span>
                                                        <span className="text-[10px] bg-white/5 text-gray-500 px-2 py-0.5 rounded">Phase {c.phase}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-400 italic">💡 {c.why}</p>
                                            <div className="text-[10px] text-gray-600">🔍 Search: "{c.url_hint}"</div>
                                        </div>
                                    ))}
                                    {result.cost_breakdown && (
                                        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                                            <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">💰 Budget Breakdown</div>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                {[['Courses', result.cost_breakdown.courses], ['Certifications', result.cost_breakdown.certifications], ['Books / Resources', result.cost_breakdown.books_resources], ['Total', result.cost_breakdown.total]].map(([label, val]) => (
                                                    <div key={label} className={`bg-white/5 rounded-xl p-3 ${label === 'Total' ? 'border border-red-600/30' : ''}`}>
                                                        <div className="text-[10px] uppercase tracking-widest text-gray-500">{label}</div>
                                                        <div className={`text-sm font-black mt-1 ${label === 'Total' ? 'text-red-400' : 'text-white'}`}>{val}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Certifications */}
                            {activeTab === 'certs' && (
                                <div className="space-y-4">
                                    {(result.certifications || []).map((cert, i) => (
                                        <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-3">
                                            <div className="flex items-start gap-3 flex-wrap">
                                                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                                                    <TfiMedall className="text-amber-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm font-black text-white">{cert.name}</div>
                                                    <div className="text-[11px] text-gray-400 mt-0.5">by {cert.issuing_body}</div>
                                                </div>
                                                <div className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg border flex-shrink-0 ${PRIORITY_STYLE[cert.priority] || 'bg-gray-700/20 text-gray-400 border-gray-600/30'}`}>{cert.priority}</div>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                {[['Relevance', cert.relevance], ['Cost', cert.estimated_cost], ['Prep Time', cert.prep_time], ['Target Month', `Month ${cert.target_month}`]].map(([label, val]) => (
                                                    <div key={label} className="bg-white/5 rounded-xl p-3">
                                                        <div className="text-[10px] text-gray-500 uppercase">{label}</div>
                                                        <div className="text-xs text-white mt-1">{val}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Monthly Schedule */}
                            {activeTab === 'schedule' && (
                                <div className="space-y-3">
                                    <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Month-by-Month Plan</div>
                                    {(result.monthly_schedule || []).map((m, i) => (
                                        <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex gap-4">
                                            <div className={`w-10 h-10 rounded-2xl ${PHASE_COLORS[Math.floor(i / 3)] || 'bg-gray-600'} flex items-center justify-center text-white font-black text-sm flex-shrink-0`}>
                                                M{m.month}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 flex-wrap mb-1">
                                                    <div className="text-sm font-black text-white">{m.focus}</div>
                                                    <div className="text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 rounded-lg">{m.hours_per_week}h/week</div>
                                                </div>
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {(m.key_tasks || []).map((task, ti) => (
                                                        <span key={ti} className="text-[11px] text-gray-300 bg-white/5 px-2 py-0.5 rounded">• {task}</span>
                                                    ))}
                                                </div>
                                                <div className="text-[11px] text-emerald-400">✓ Checkpoint: {m.checkpoint}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {(result.success_metrics || []).length > 0 && (
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
                                            <div className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-3">📊 Success Metrics</div>
                                            {result.success_metrics.map((sm, i) => (
                                                <div key={i} className="text-xs text-emerald-300 flex items-start gap-1 mb-1.5"><TfiCheck />{sm}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ROI */}
                            {activeTab === 'roi' && result.roi_for_company && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {[
                                            ['📈 Productivity Gain', result.roi_for_company.productivity_gain, 'emerald'],
                                            ['🔒 Retention Impact', result.roi_for_company.retention_impact, 'blue'],
                                            ['💼 Value Delivered', result.roi_for_company.value_delivered, 'purple'],
                                            ['⏱ Payback Period', result.roi_for_company.payback_period, 'amber'],
                                        ].map(([label, val, color]) => (
                                            <div key={label} className={`bg-${color}-500/10 border border-${color}-500/20 rounded-2xl p-5`}>
                                                <div className={`text-[10px] text-${color}-400 font-black uppercase tracking-widest mb-2`}>{label}</div>
                                                <p className={`text-sm text-${color}-200`}>{val}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
                                        <div className="text-xs font-black uppercase tracking-widest text-red-400 mb-2">⚠️ Cost of NOT Training</div>
                                        <p className="text-sm text-red-200">{result.roi_for_company.cost_of_not_training}</p>
                                    </div>
                                    {(result.manager_tips || []).length > 0 && (
                                        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                                            <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">👔 Manager Support Tips</div>
                                            {result.manager_tips.map((tip, i) => (
                                                <div key={i} className="text-xs text-gray-200 flex items-start gap-2 mb-2"><span className="text-red-500 flex-shrink-0">→</span>{tip}</div>
                                            ))}
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
