import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TfiReload, TfiWrite, TfiUser, TfiClose } from 'react-icons/tfi';
import { toast } from 'sonner';
import hrService from '../../services/hrService';
import authService from '../../services/authService';

const EMAIL_TYPES = [
    { id: 'invite', label: 'Interview Invite', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { id: 'reject', label: 'Rejection', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
    { id: 'follow_up', label: 'Follow Up', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { id: 'offer', label: 'Job Offer', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { id: 'waitlist', label: 'Waitlist', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
];

export default function EmailCampaign() {
    const [allCandidates, setAllCandidates] = useState([]);
    const [selected, setSelected] = useState([]);
    const [form, setForm] = useState({ email_type: 'invite', job_title: '', company_name: '', custom_message: '' });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState('template');
    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    useEffect(() => {
        authService.getUsers('candidate').then(r => setAllCandidates(r.data || [])).catch(() => {});
    }, []);

    const toggleCandidate = (c) => {
        const id = String(c.id || c._id);
        setSelected(p => p.find(x => x.id === id) ? p.filter(x => x.id !== id) : [...p, { id, name: c.name, note: c.email }]);
    };

    const handleGenerate = async () => {
        if (!form.job_title.trim()) return toast.error('Enter job title.');
        if (selected.length === 0) return toast.error('Select at least 1 candidate.');
        setLoading(true); setResult(null);
        try {
            const r = await hrService.generateEmailCampaign({ ...form, candidates: selected });
            setResult(r.data);
        } catch { toast.error('Campaign generation failed.'); }
        finally { setLoading(false); }
    };

    const activeType = EMAIL_TYPES.find(t => t.id === form.email_type);

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter">
                        AI Email <span className="text-red-600">Campaign</span>
                    </h1>
                    <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest">AI writes personalized bulk emails — invites, rejections, offers, follow-ups</p>
                </div>

                {/* Email Type Picker */}
                <div className="flex gap-3 flex-wrap">
                    {EMAIL_TYPES.map(t => (
                        <button key={t.id} onClick={() => set('email_type', t.id)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${form.email_type === t.id ? `${t.bg} ${t.color}` : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}>
                            {t.label}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Candidate Selector */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="text-xs font-black uppercase tracking-widest text-gray-400">Select Recipients</div>
                            <div className="text-xs text-gray-500">{selected.length} selected</div>
                        </div>
                        <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                            {allCandidates.map(c => {
                                const id = String(c.id || c._id);
                                const isSel = selected.find(x => x.id === id);
                                return (
                                    <button key={id} onClick={() => toggleCandidate(c)}
                                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${isSel ? 'border-red-600 bg-red-600/10' : 'border-white/5 hover:border-white/15'}`}>
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0 ${isSel ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}>{c.name?.charAt(0) || 'C'}</div>
                                        <div className="text-xs font-black truncate">{c.name}</div>
                                        {isSel && <span className="ml-auto text-red-400 text-xs">✓</span>}
                                    </button>
                                );
                            })}
                        </div>
                        {selected.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                                {selected.map(s => (
                                    <span key={s.id} className="flex items-center gap-1 text-[10px] bg-white/5 text-gray-300 px-2 py-1 rounded-lg">
                                        {s.name}
                                        <button onClick={() => setSelected(p => p.filter(x => x.id !== s.id))} className="text-gray-500 hover:text-red-400 ml-1"><TfiClose /></button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Campaign Settings */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4 flex flex-col">
                        {[['job_title', 'Job Title *'], ['company_name', 'Company Name']].map(([k, ph]) => (
                            <div key={k}>
                                <label className="text-[10px] uppercase tracking-widest text-gray-500 block mb-1">{ph}</label>
                                <input value={form[k]} onChange={e => set(k, e.target.value)} placeholder={ph}
                                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600" />
                            </div>
                        ))}
                        <div className="flex-1">
                            <label className="text-[10px] uppercase tracking-widest text-gray-500 block mb-1">Custom Context / Notes</label>
                            <textarea value={form.custom_message} onChange={e => set('custom_message', e.target.value)} rows={4}
                                placeholder="e.g. Mention the interview will be remote, note the start date is flexible..."
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600 resize-none" />
                        </div>
                        <button onClick={handleGenerate} disabled={loading}
                            className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:opacity-40 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2">
                            {loading ? <><TfiReload className="animate-spin" /> Generating Campaign...</> : <><TfiWrite /> Generate Email Campaign</>}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {result && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            {/* Meta Info */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[['Tone', result.tone_analysis], ['Open Rate', result.expected_open_rate], ['Best Send Time', result.best_send_time], ['Follow-Up', result.follow_up_schedule]].map(([label, val]) => (
                                    <div key={label} className="bg-white/[0.03] border border-white/10 rounded-xl p-3 text-center">
                                        <div className="text-[10px] uppercase tracking-widest text-gray-400">{label}</div>
                                        <div className="text-xs font-black text-white mt-1">{val}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 flex-wrap">
                                {['template', 'previews', 'tips'].map(t => (
                                    <button key={t} onClick={() => setActiveTab(t)}
                                        className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                                        {t === 'template' ? 'Email Template' : t === 'previews' ? `Per-Candidate (${result.per_candidate_preview?.length || 0})` : 'Campaign Tips'}
                                    </button>
                                ))}
                            </div>

                            {activeTab === 'template' && (
                                <div className="space-y-4">
                                    <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <div className="text-xs font-black uppercase tracking-widest text-gray-400">Subject Line</div>
                                                <div className="text-sm font-black text-white mt-1">{result.subject_line}</div>
                                            </div>
                                            <button onClick={() => {
                                                const txt = `Subject: ${result.subject_line}\n\n${result.email_template}`;
                                                navigator.clipboard.writeText(txt).then(() => toast.success('Copied!')).catch(() => toast.error('Copy failed'));
                                            }} className="text-xs bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-1.5 rounded-lg font-black uppercase tracking-widest">Copy</button>
                                        </div>
                                        <div className="border-t border-white/10 pt-4">
                                            <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Email Body</div>
                                            <pre className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">{result.email_template}</pre>
                                        </div>
                                    </div>
                                    {(result.personalization_hooks || []).length > 0 && (
                                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                                            <div className="text-xs font-black uppercase tracking-widest text-blue-400 mb-2">Personalization Hooks</div>
                                            {result.personalization_hooks.map((h, i) => <div key={i} className="text-xs text-blue-300 mb-1">→ {h}</div>)}
                                        </div>
                                    )}
                                    {(result.do_not_say || []).length > 0 && (
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                            <div className="text-xs font-black uppercase tracking-widest text-red-400 mb-2">🚫 Avoid These Phrases</div>
                                            {result.do_not_say.map((d, i) => <div key={i} className="text-xs text-red-300 mb-1">"{d}"</div>)}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'previews' && (
                                <div className="space-y-3">
                                    {(result.per_candidate_preview || []).map((p, i) => (
                                        <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center text-xs font-black flex-shrink-0">{p.name?.charAt(0) || 'C'}</div>
                                            <div>
                                                <div className="text-xs font-black uppercase text-white">{p.name}</div>
                                                <div className="text-xs text-gray-300 mt-1 italic">"{p.personalized_opening}"</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'tips' && (
                                <div className="space-y-3">
                                    {(result.campaign_tips || []).map((t, i) => (
                                        <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-lg bg-red-600 flex items-center justify-center text-xs font-black flex-shrink-0">{i + 1}</div>
                                            <span className="text-sm text-gray-200">{t}</span>
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
