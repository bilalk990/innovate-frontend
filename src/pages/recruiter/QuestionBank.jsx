import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
    TfiLayoutGrid2,
    TfiPlus,
    TfiTrash,
    TfiClose,
    TfiBolt,
    TfiCheck,
    TfiReload,
    TfiAlert,
    TfiPencil,
} from 'react-icons/tfi';
import useFetch from '../../hooks/useFetch';
import interviewService from '../../services/interviewService';
import Loader from '../../components/Loader';
import '../../styles/hr.css';
const DIFFICULTY_STYLES = {
    easy: 'hr-badge-active',
    medium: 'hr-badge-pending',
    hard: 'hr-badge-red',
};

export default function QuestionBank() {
    const navigate = useNavigate();

    const fetchBanks = useCallback(() => interviewService.listQuestionBanks(), []);
    const { data: banks, loading, execute: reload } = useFetch(fetchBanks);

    // Create/Edit bank modal state
    const [showModal, setShowModal] = useState(false);
    const [editBank, setEditBank] = useState(null);
    const [bankForm, setBankForm] = useState({ name: '', job_title: '', description: '' });
    const [modalQuestions, setModalQuestions] = useState([]);
    const [saving, setSaving] = useState(false);
    const [modalError, setModalError] = useState('');

    // AI generation state
    const [aiGenerating, setAiGenerating] = useState(false);
    const [aiJobTitle, setAiJobTitle] = useState('');
    const [aiJobDesc, setAiJobDesc] = useState('');
    const [showAiPanel, setShowAiPanel] = useState(false);

    // View bank state
    const [viewBank, setViewBank] = useState(null);

    const openCreate = () => {
        setEditBank(null);
        setBankForm({ name: '', job_title: '', description: '' });
        setModalQuestions([{ text: '', category: 'general', difficulty: 'medium', expected_keywords: '', ideal_answer: '' }]);
        setModalError('');
        setShowModal(true);
    };

    const openEdit = (bank) => {
        setEditBank(bank);
        setBankForm({ name: bank.name, job_title: bank.job_title || '', description: bank.description || '' });
        setModalQuestions(bank.questions.map(q => ({
            text: q.text,
            category: q.category,
            difficulty: q.difficulty || 'medium',
            expected_keywords: (q.expected_keywords || []).join(', '),
            ideal_answer: q.ideal_answer || '',
        })));
        setModalError('');
        setShowModal(true);
    };

    const setMQ = (i, k, v) => setModalQuestions(qs => qs.map((q, idx) => idx === i ? { ...q, [k]: v } : q));
    const addMQ = () => setModalQuestions(qs => [...qs, { text: '', category: 'general', difficulty: 'medium', expected_keywords: '', ideal_answer: '' }]);
    const removeMQ = (i) => setModalQuestions(qs => qs.filter((_, idx) => idx !== i));

    const handleAiGenerate = async () => {
        if (!aiJobTitle.trim()) return setModalError('Job title required for AI generation.');
        setAiGenerating(true);
        setModalError('');
        try {
            const res = await interviewService.aiGenerateQuestionBank({
                job_title: aiJobTitle,
                job_description: aiJobDesc,
                count: 15,
            });
            const generated = (res.data.questions || []).map(q => ({
                text: q.text,
                category: q.category,
                difficulty: q.difficulty || 'medium',
                expected_keywords: (q.expected_keywords || []).join(', '),
                ideal_answer: q.ideal_answer || '',
            }));
            const validPrior = modalQuestions.filter(q => q.text.trim());
            setModalQuestions([...validPrior, ...generated]);
            if (!bankForm.name) setBankForm(f => ({ ...f, name: `${aiJobTitle} Bank`, job_title: aiJobTitle }));
            setShowAiPanel(false);
        } catch {
            setModalError('AI generation failed. Please try again.');
        } finally {
            setAiGenerating(false);
        }
    };

    const handleSave = async () => {
        const validQ = modalQuestions.filter(q => q.text.trim());
        if (!bankForm.name.trim()) return setModalError('Bank name is required.');
        if (validQ.length === 0) return setModalError('At least 1 question required.');

        setSaving(true);
        setModalError('');
        try {
            const payload = {
                ...bankForm,
                questions: validQ.map(q => ({
                    text: q.text,
                    category: q.category,
                    difficulty: q.difficulty,
                    expected_keywords: (q.expected_keywords || '').split(',').map(k => k.trim()).filter(Boolean),
                    ideal_answer: q.ideal_answer,
                })),
            };
            if (editBank) {
                await interviewService.updateQuestionBank(editBank.id, payload);
            } else {
                await interviewService.createQuestionBank(payload);
            }
            setShowModal(false);
            reload();
        } catch (err) {
            setModalError(err.response?.data?.error || 'Save failed.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (bankId) => {
        toast('Confirm Deletion', {
            description: 'Delete this question bank? This cannot be undone.',
            action: {
                label: 'Delete',
                onClick: async () => {
                    try {
                        await interviewService.deleteQuestionBank(bankId);
                        toast.success('Question bank deleted.');
                        reload();
                    } catch {
                        toast.error('Failed to delete bank.');
                    }
                },
            },
        });
    };

    if (loading) return <Loader fullScreen text="Loading Question Bank..." />;

    return (
        <div className="hr-content">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
                <div>
                    <h1 className="hr-heading">Question Bank</h1>
                    <p className="hr-subheading mt-2">AI-Powered Content Library</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => navigate('/recruiter/schedule')} className="btn-hr-secondary py-3 px-6 text-[10px]">
                        ← SCHEDULE
                    </button>
                    <button onClick={openCreate} className="btn-hr-primary py-3 px-6 text-[10px]">
                        <TfiPlus /> NEW BANK
                    </button>
                </div>
            </div>

            {/* Banks Grid */}
            {(banks || []).length === 0 ? (
                <div className="py-32 text-center hr-card border-none bg-hr-bg/30">
                    <TfiLayoutGrid2 className="text-6xl text-hr-border mx-auto mb-6 animate-pulse" />
                    <h3 className="hr-heading text-xl">Library Empty</h3>
                    <p className="hr-subheading text-[10px] mt-2 mb-8">Deploy AI generation to initialize your first question bank.</p>
                    <button onClick={openCreate} className="btn-hr-primary py-4 px-10">
                        <TfiBolt /> INITIALIZE WITH AI
                    </button>
                </div>
            ) : (
                <div className="hr-grid">
                    {(banks || []).map((bank, i) => (
                        <motion.div
                            key={bank.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="col-4 hr-card p-10 flex flex-col justify-between group"
                        >
                            <div>
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-hr-black text-hr-red flex items-center justify-center text-xl shadow-lg">
                                        <TfiLayoutGrid2 />
                                    </div>
                                    <span className="hr-badge hr-badge-completed">
                                        {bank.question_count} QUESTIONS
                                    </span>
                                </div>
                                <h2 className="text-lg font-black text-hr-text-main uppercase italic mb-1 group-hover:text-hr-red transition-colors">{bank.name}</h2>
                                <p className="hr-subheading text-[9px] text-hr-red mb-4">{bank.job_title || 'GENERAL BANK'}</p>
                                {bank.description && <p className="text-xs text-hr-text-muted italic line-clamp-2 mb-6">{bank.description}</p>}

                                {/* Sample Questions */}
                                <div className="space-y-3 mb-8">
                                    {bank.questions.slice(0, 2).map((q, qi) => (
                                        <div key={qi} className="flex items-start gap-3 p-3 bg-hr-bg rounded-xl border border-hr-border/50">
                                            <span className={`hr-badge py-1 px-2 text-[8px] flex-shrink-0 ${DIFFICULTY_STYLES[q.difficulty || 'medium']}`}>{q.difficulty?.charAt(0).toUpperCase()}</span>
                                            <p className="text-[10px] text-hr-text-main italic line-clamp-1">{q.text}</p>
                                        </div>
                                    ))}
                                    {bank.question_count > 2 && (
                                        <p className="text-[9px] text-hr-text-muted italic pl-2">+{bank.question_count - 2} additional questions...</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-6 border-t border-hr-border">
                                <button
                                    onClick={() => openEdit(bank)}
                                    className="btn-hr-secondary flex-1 py-2 px-0 text-[10px] border-none"
                                >
                                    <TfiPencil /> EDIT
                                </button>
                                <button
                                    onClick={() => setViewBank(bank)}
                                    className="btn-hr-primary flex-1 py-2 px-0 text-[10px]"
                                >
                                    VIEW ALL
                                </button>
                                <button
                                    onClick={() => handleDelete(bank.id)}
                                    className="p-2 text-hr-text-muted hover:text-hr-red transition-colors"
                                >
                                    <TfiTrash />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* ── Create/Edit Modal ── */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-hr-black/90 backdrop-blur-xl flex items-center justify-center p-6 z-[2000] overflow-y-auto"
                        onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-2xl max-w-4xl w-full my-10 shadow-2xl border-2 border-hr-border overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="p-10 border-b border-hr-border flex items-center justify-between bg-hr-bg/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-hr-black text-hr-red flex items-center justify-center shadow-lg">
                                        <TfiPlus className="text-xl" />
                                    </div>
                                    <div>
                                        <h2 className="hr-heading text-lg">{editBank ? 'Update Question Bank' : 'Create New Bank'}</h2>
                                        <p className="hr-subheading text-[10px]">AI-Powered Question Bank</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-xl bg-hr-black text-white flex items-center justify-center hover:bg-hr-red transition-all">
                                    <TfiClose />
                                </button>
                            </div>

                            <div className="p-10 space-y-8">
                                {modalError && (
                                    <div className="p-4 bg-hr-red-soft border border-hr-red/20 rounded-xl text-hr-red text-xs font-black flex items-center gap-3 italic">
                                        <TfiAlert /> {modalError}
                                    </div>
                                )}

                                {/* Bank Details */}
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <label className="hr-label">Bank Name *</label>
                                        <input className="hr-input"
                                            placeholder="e.g. React Architecture Lib"
                                            value={bankForm.name}
                                            onChange={e => setBankForm(f => ({ ...f, name: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="hr-label">Focus Job Title</label>
                                        <input className="hr-input"
                                            placeholder="e.g. Senior Software Engineer"
                                            value={bankForm.job_title}
                                            onChange={e => setBankForm(f => ({ ...f, job_title: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                {/* AI Generation Panel */}
                                <div className="p-10 bg-white text-gray-950 rounded-[2.5rem] shadow-2xl border-2 border-red-50 relative overflow-hidden group mb-12">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/[0.02] blur-[80px] pointer-events-none" />
                                    <div className="flex items-center justify-between relative">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-2xl bg-gray-950 text-red-600 flex items-center justify-center text-3xl shadow-xl shadow-red-600/10 group-hover:scale-110 transition-transform duration-500">
                                                <TfiBolt className="animate-pulse" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-black italic uppercase tracking-tighter text-gray-950 mb-1 leading-none">AI Matrix Synthesis</p>
                                                <p className="text-[9px] font-black uppercase text-gray-400 tracking-[0.4em] italic">Generate 15 suggested nodes</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowAiPanel(!showAiPanel)}
                                            className="btn-hr-primary py-4 px-8 text-[9px] shadow-lg active:scale-95 transition-all"
                                        >
                                            {showAiPanel ? 'MINIMIZE SYSTEM' : 'ENGAGE AI CORE'}
                                        </button>
                                    </div>
                                    <AnimatePresence>
                                        {showAiPanel && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                <div className="pt-10 space-y-8 relative">
                                                    <div className="group/input">
                                                        <label className="text-[9px] font-black uppercase text-gray-400 tracking-[0.3em] mb-3 block italic flex items-center gap-3">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-red-600" /> TARGET OPERATIONAL ROLE
                                                        </label>
                                                        <input className="hr-input bg-gray-50 border-gray-100 focus:bg-white text-gray-950 placeholder:text-gray-300 shadow-inner group-hover/input:border-red-600/20 transition-all font-black uppercase italic tracking-widest h-14"
                                                            placeholder="e.g. SYSTEMS ARCHITECT"
                                                            value={aiJobTitle}
                                                            onChange={e => setAiJobTitle(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="group/input">
                                                        <label className="text-[9px] font-black uppercase text-gray-400 tracking-[0.3em] mb-3 block italic flex items-center gap-3">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-red-600" /> MISSION PARAMETERS / JD
                                                        </label>
                                                        <textarea className="hr-input bg-gray-50 border-gray-100 focus:bg-white text-gray-950 placeholder:text-gray-300 shadow-inner group-hover/input:border-red-600/20 transition-all font-medium italic h-32"
                                                            placeholder="Paste briefing for high-fidelity synthesis..."
                                                            value={aiJobDesc}
                                                            onChange={e => setAiJobDesc(e.target.value)}
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={handleAiGenerate}
                                                        disabled={aiGenerating}
                                                        className="btn-hr-primary w-full py-6 text-[10px] shadow-2xl shadow-red-600/20 active:scale-95 transition-all flex items-center justify-center gap-4"
                                                    >
                                                        {aiGenerating ? <><TfiReload className="animate-spin text-xl" /> SYNTHESIZING...</> : <><TfiBolt className="text-xl" /> COMMENCE GENERATION</>}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Questions List */}
                                <div className="space-y-6">
                                    <h3 className="hr-subheading flex justify-between items-center">
                                        Questions <span>({modalQuestions.filter(q => q.text.trim()).length})</span>
                                    </h3>
                                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {modalQuestions.map((q, i) => (
                                            <div key={i} className="p-6 bg-hr-bg rounded-2xl border border-hr-border relative group">
                                                <div className="flex items-start gap-4">
                                                    <span className="w-8 h-8 rounded-xl bg-hr-black text-white text-[10px] flex items-center justify-center font-black flex-shrink-0 mt-1">{i + 1}</span>
                                                    <div className="flex-1 space-y-4">
                                                        <textarea className="hr-input bg-white h-24 italic text-sm font-medium"
                                                            placeholder="Enter question text..."
                                                            value={q.text}
                                                            onChange={e => setMQ(i, 'text', e.target.value)}
                                                        />
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="relative">
                                                                <label className="text-[8px] font-black uppercase text-hr-text-muted mb-1 block">Category</label>
                                                                <select className="hr-input py-2 text-xs"
                                                                    value={q.category}
                                                                    onChange={e => setMQ(i, 'category', e.target.value)}
                                                                >
                                                                    {['general', 'technical', 'behavioral', 'situational', 'culture'].map(c => (
                                                                        <option key={c} value={c}>{c.toUpperCase()}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div className="relative">
                                                                <label className="text-[8px] font-black uppercase text-hr-text-muted mb-1 block">Complexity</label>
                                                                <select className="hr-input py-2 text-xs"
                                                                    value={q.difficulty}
                                                                    onChange={e => setMQ(i, 'difficulty', e.target.value)}
                                                                >
                                                                    {['easy', 'medium', 'hard'].map(d => (
                                                                        <option key={d} value={d}>{d.toUpperCase()}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => removeMQ(i)} className="text-hr-text-muted hover:text-hr-red transition-colors p-2"><TfiTrash /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={addMQ} className="w-full py-4 border-2 border-dashed border-hr-border rounded-2xl text-[10px] font-black uppercase text-hr-text-muted hover:border-hr-red hover:text-hr-red transition-all flex items-center justify-center gap-3">
                                        <TfiPlus /> ADD QUESTION
                                    </button>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-10 bg-hr-bg/30 border-t border-hr-border flex gap-4">
                                <button onClick={() => setShowModal(false)} className="btn-hr-secondary flex-1">CANCEL</button>
                                <button onClick={handleSave} disabled={saving} className="btn-hr-primary flex-1">
                                    {saving ? <TfiReload className="animate-spin" /> : <TfiCheck />} {saving ? 'SAVING...' : editBank ? 'SAVE CHANGES' : 'SAVE BANK'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── View All Questions Modal ── */}
            <AnimatePresence>
                {viewBank && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-hr-black/95 backdrop-blur-2xl flex items-center justify-center p-6 z-[2100] overflow-y-auto"
                        onClick={(e) => e.target === e.currentTarget && setViewBank(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-2xl max-w-5xl w-full my-10 shadow-2xl border-2 border-hr-border overflow-hidden"
                        >
                            <div className="p-10 border-b border-hr-border flex items-center justify-between bg-hr-bg/50">
                                <div>
                                    <h2 className="hr-heading text-lg">{viewBank.name}</h2>
                                    <p className="hr-subheading text-[10px]">{viewBank.job_title || 'GENERAL'} · {viewBank.question_count} QUESTIONS</p>
                                </div>
                                <button onClick={() => setViewBank(null)} className="w-10 h-10 rounded-xl bg-hr-black text-white flex items-center justify-center hover:bg-hr-red transition-all">
                                    <TfiClose />
                                </button>
                            </div>
                            <div className="p-10 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                {viewBank.questions.map((q, i) => (
                                    <div key={i} className="p-6 bg-hr-bg rounded-xl border-2 border-hr-border">
                                        <div className="flex items-start gap-4">
                                            <span className="w-8 h-8 rounded-lg bg-hr-black text-white text-[10px] flex items-center justify-center font-black flex-shrink-0">{i + 1}</span>
                                            <div className="flex-1">
                                                <p className="text-md font-black text-hr-text-main mb-3 italic">"{q.text}"</p>
                                                <div className="flex gap-2 flex-wrap mb-4">
                                                    <span className={`hr-badge text-[8px] ${DIFFICULTY_STYLES[q.difficulty || 'medium']}`}>{q.difficulty?.toUpperCase()}</span>
                                                    <span className="hr-badge hr-badge-completed text-[8px]">{q.category?.toUpperCase()}</span>
                                                </div>
                                                {q.ideal_answer && (
                                                    <div className="p-4 bg-white/50 rounded-xl border-l-4 border-hr-red shadow-inner">
                                                        <p className="text-[11px] text-hr-text-muted italic leading-relaxed">TARGET RESPONSE: {q.ideal_answer}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
