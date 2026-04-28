import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TfiReload, TfiUser, TfiTarget } from 'react-icons/tfi';
import { toast } from 'sonner';
import hrService from '../../services/hrService';
import authService from '../../services/authService';

export default function ReferenceCheck() {
    const [candidates, setCandidates] = useState([]);
    const [candidateId, setCandidateId] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState('targeted');

    useEffect(() => {
        authService.getUsers('candidate').then(r => setCandidates(r.data || [])).catch(() => { });
    }, []);

    const handleGenerate = async () => {
        if (!jobTitle.trim()) return toast.error('Enter a job title.');
        setLoading(true); setResult(null);
        try {
            const r = await hrService.getReferenceQuestions({ candidate_id: candidateId, job_title: jobTitle });
            setResult(r.data);
        } catch (err) {
            const msg = err.response?.data?.error || 'Generation failed.';
            toast.error(msg);
        }
        finally { setLoading(false); }
    };

    const copyAll = () => {
        if (!result) return;
        const all = [
            `REFERENCE CHECK SCRIPT — ${jobTitle}`,
            `\nOPENING: ${result.call_script_opener}`,
            '\nSTANDARD QUESTIONS:',
            ...(result.standard_questions || []).map((q, i) => `${i + 1}. ${q.question}`),
            '\nTARGETED QUESTIONS:',
            ...(result.targeted_questions || []).map((q, i) => `${i + 1}. ${q.question}\n   ✓ If good: ${q.green_flag_if}\n   ⚠ If concern: ${q.red_flag_if}`),
            '\nCLOSING:',
            ...(result.closing_questions || []).map((q, i) => `${i + 1}. ${q}`),
        ].join('\n');
        navigator.clipboard.writeText(all)
            .then(() => toast.success('Full script copied!'))
            .catch(() => toast.error('Copy failed — try again.'));
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter">
                        AI Reference <span className="text-red-600">Check</span>
                    </h1>
                    <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest">AI-generated targeted reference questions specific to each candidate</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">Candidate (Optional)</label>
                        <select value={candidateId} onChange={e => setCandidateId(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600">
                            <option value="">No specific candidate</option>
                            {candidates.map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.name} ({c.email})</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-1">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">Job Title *</label>
                        <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Backend Engineer"
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600" />
                    </div>
                    <div className="flex items-end">
                        <button onClick={handleGenerate} disabled={loading}
                            className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:opacity-40 rounded-xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2">
                            {loading ? <><TfiReload className="animate-spin" /> Generating...</> : <><TfiTarget /> Generate Questions</>}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {result && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            {/* Script opener */}
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-xs font-black uppercase tracking-widest text-blue-400">📞 Call Opening Script</div>
                                    <button onClick={copyAll} className="text-xs bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-1.5 rounded-lg font-black uppercase tracking-widest">
                                        Copy All
                                    </button>
                                </div>
                                <p className="text-blue-200 text-sm italic">"{result.call_script_opener}"</p>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 flex-wrap">
                                {['targeted', 'standard', 'gaps', 'skills', 'legal'].map(t => (
                                    <button key={t} onClick={() => setActiveTab(t)}
                                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                                        {t === 'targeted' ? 'Targeted' : t === 'standard' ? 'Standard' : t === 'gaps' ? 'Gap Verify' : t === 'skills' ? 'Skills' : '⚖ Legal'}
                                    </button>
                                ))}
                            </div>

                            {activeTab === 'targeted' && (
                                <div className="space-y-4">
                                    {(result.targeted_questions || []).map((q, i) => (
                                        <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-xs font-black flex-shrink-0">{i + 1}</div>
                                                <p className="text-white font-medium text-sm">{q.question}</p>
                                            </div>
                                            <div className="text-xs text-gray-500 italic">{q.why_ask}</div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                                                    <div className="text-[10px] text-emerald-400 font-black uppercase mb-1">✓ Green Flag</div>
                                                    <div className="text-xs text-emerald-300">{q.green_flag_if}</div>
                                                </div>
                                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                                                    <div className="text-[10px] text-red-400 font-black uppercase mb-1">⚠ Red Flag</div>
                                                    <div className="text-xs text-red-300">{q.red_flag_if}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'standard' && (
                                <div className="space-y-3">
                                    {(result.standard_questions || []).map((q, i) => (
                                        <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-lg bg-gray-700 flex items-center justify-center text-xs font-black flex-shrink-0">{i + 1}</div>
                                            <div>
                                                <p className="text-sm text-white">{q.question}</p>
                                                <p className="text-xs text-gray-500 mt-1 italic">{q.purpose}</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                                        <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Closing Questions</div>
                                        {(result.closing_questions || []).map((q, i) => (
                                            <div key={i} className="text-sm text-gray-300 mb-2 flex items-start gap-2"><span className="text-gray-600">→</span>{q}</div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'gaps' && (
                                <div className="space-y-3">
                                    {(result.gap_verification_questions || []).map((q, i) => (
                                        <div key={i} className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                                            <p className="text-sm text-white">{q.question}</p>
                                            <p className="text-xs text-amber-400 mt-2 italic">Verifying: {q.verifying}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'skills' && (
                                <div className="space-y-3">
                                    {(result.skills_verification || []).map((s, i) => (
                                        <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex items-start gap-3">
                                            <span className="text-xs font-black uppercase tracking-widest bg-blue-600/20 text-blue-400 border border-blue-500/30 px-2 py-1 rounded-lg flex-shrink-0">{s.skill}</span>
                                            <p className="text-sm text-gray-200">{s.question}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'legal' && (
                                <div className="space-y-4">
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
                                        <div className="text-xs font-black uppercase tracking-widest text-red-400 mb-3">⚖ Legal Compliance — Topics to AVOID</div>
                                        {(result.legal_reminders || []).map((r, i) => (
                                            <div key={i} className="text-sm text-red-300 flex items-start gap-2 mb-2"><span>🚫</span>{r}</div>
                                        ))}
                                    </div>
                                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                                        <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">💡 Pro Tips</div>
                                        <p className="text-gray-300 text-sm">{result.pro_tips}</p>
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
