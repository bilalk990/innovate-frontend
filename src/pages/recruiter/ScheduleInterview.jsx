import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
    TfiCalendar,
    TfiUser,
    TfiBriefcase,
    TfiBolt,
    TfiCheck,
    TfiArrowRight,
    TfiArrowLeft,
    TfiClose,
    TfiPlus,
    TfiTrash,
    TfiTarget,
    TfiReload,
    TfiSearch,
    TfiLayoutGrid2,
} from 'react-icons/tfi';
import useAuth from '../../hooks/useAuth';
import interviewService from '../../services/interviewService';
import authService from '../../services/authService';
import jobService from '../../services/jobService';
import { QUESTION_CATEGORIES } from '../../constants';
import Loader from '../../components/Loader';
import '../../styles/hr.css';

const DIFFICULTY_STYLES = {
    easy: 'hr-badge-active',
    medium: 'hr-badge-pending',
    hard: 'hr-badge-red',
};

export default function ScheduleInterview() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const prefillCandidateId = searchParams.get('candidateId');
    const prefillJobId = searchParams.get('jobId');

    const [form, setForm] = useState({
        title: '',
        candidate_id: '',
        scheduled_at: '',
        duration_minutes: 45,
        job_id: '',
        job_title: '',
        job_description: '',
        notes: '',
        generate_meet_link: false,
    });
    const [questions, setQuestions] = useState([{ text: '', category: 'general', expected_keywords: '', difficulty: 'medium' }]);
    const [loading, setLoading] = useState(false);
    const [createdMeetLink, setCreatedMeetLink] = useState('');
    const [generating, setGenerating] = useState(false);
    const [candidateSearch, setCandidateSearch] = useState('');
    const [candidates, setCandidates] = useState([]);
    const [candidateLoading, setCandidateLoading] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [step, setStep] = useState(0); // 0: Details, 1: Questions

    // Feature 5 — Smart Slot Suggestions
    const [slotLoading, setSlotLoading] = useState(false);
    const [slotSuggestions, setSlotSuggestions] = useState([]);
    const [showSlots, setShowSlots] = useState(false);
    const [slotTip, setSlotTip] = useState('');

    // Feature 8 — Question Bank
    const [banks, setBanks] = useState([]);
    const [banksLoading, setBanksLoading] = useState(false);
    const [showBankPicker, setShowBankPicker] = useState(false);

    useEffect(() => {
        const prefill = async () => {
            if (prefillCandidateId) {
                try {
                    const { data: users } = await authService.getUsers('candidate');
                    const usersArray = Array.isArray(users) ? users : (users?.results || []);
                    const candidate = usersArray.find(u => u.id === prefillCandidateId);
                    if (candidate) {
                        setSelectedCandidate(candidate);
                        set('candidate_id', candidate.id);
                    }
                } catch { /* ignore */ }
            }
            if (prefillJobId) {
                try {
                    const { data: job } = await jobService.get(prefillJobId);
                    if (job) {
                        set('job_id', prefillJobId);
                        set('job_title', job.title);
                        set('job_description', job.description);
                        set('title', `Interview for ${job.title}`);
                    }
                } catch { /* ignore */ }
            }
        };
        prefill();
        loadBanks();
    }, [prefillCandidateId, prefillJobId]);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const setQ = (i, k, v) => setQuestions(qs => qs.map((q, idx) => idx === i ? { ...q, [k]: v } : q));
    const addQ = () => setQuestions(qs => [...qs, { text: '', category: 'general', expected_keywords: '', difficulty: 'medium' }]);
    const removeQ = (i) => setQuestions(qs => qs.filter((_, idx) => idx !== i));

    useEffect(() => {
        if (!candidateSearch.trim() || candidateSearch.length < 2) { setCandidates([]); return; }
        const timer = setTimeout(async () => {
            setCandidateLoading(true);
            try {
                const { data } = await authService.getUsers('candidate');
                const allCandidates = Array.isArray(data) ? data : (data?.results || []);
                const filtered = allCandidates.filter(u =>
                    u.name?.toLowerCase().includes(candidateSearch.toLowerCase()) ||
                    u.email?.toLowerCase().includes(candidateSearch.toLowerCase())
                );
                setCandidates(filtered.slice(0, 8));
            } catch { setCandidates([]); }
            finally { setCandidateLoading(false); }
        }, 400);
        return () => clearTimeout(timer);
    }, [candidateSearch]);

    const handleGenerateAI = async () => {
        if (!form.job_title) return toast.error('Role title required for AI question generation.');
        setGenerating(true);
        try {
            const res = await interviewService.generateQuestions({
                job_title: form.job_title,
                job_description: form.job_description,
                num_questions: 8,
                candidate_id: form.candidate_id || undefined,
            });
            setQuestions(res.data.questions.map(q => ({
                text: q.text,
                category: q.category,
                expected_keywords: (q.expected_keywords || []).join(', '),
                difficulty: q.difficulty || 'medium',
            })));
            toast.success(`AI generated ${res.data.count} tailored questions.`);
        } catch {
            toast.error('AI question generation failed. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    const handleSuggestSlots = async () => {
        setSlotLoading(true);
        setShowSlots(false);
        try {
            const res = await interviewService.suggestSlots({
                job_title: form.job_title || 'General Interview',
                duration_minutes: form.duration_minutes,
                recruiter_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            });
            setSlotSuggestions(res.data.suggested_slots || []);
            setSlotTip(res.data.scheduling_tip || '');
            setShowSlots(true);
        } catch {
            toast.error('Slot suggestion service unavailable.');
        } finally {
            setSlotLoading(false);
        }
    };

    const applySlot = (slot) => {
        const dt = new Date(slot.datetime_utc);
        const localDT = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
            .toISOString().slice(0, 16);
        set('scheduled_at', localDT);
        setShowSlots(false);
        toast.success(`Slot applied: ${slot.day_label}`);
    };

    const loadBanks = async () => {
        setBanksLoading(true);
        try {
            const res = await interviewService.listQuestionBanks();
            setBanks(res.data || []);
        } catch { /* ignore */ }
        finally { setBanksLoading(false); }
    };

    const loadFromBank = (bank) => {
        if (!Array.isArray(bank?.questions) || bank.questions.length === 0) {
            toast.error('This bank has no questions yet.');
            return;
        }
        const loaded = bank.questions.map(q => ({
            text: q.text,
            category: q.category,
            expected_keywords: (q.expected_keywords || []).join(', '),
            difficulty: q.difficulty || 'medium',
        }));
        setQuestions(loaded);
        setShowBankPicker(false);
        toast.success(`Loaded ${loaded.length} questions from "${bank.name}".`);
    };

    const handleSubmit = async () => {
        const validQuestions = questions.filter(q => q.text.trim());
        if (validQuestions.length === 0) return toast.error('At least 1 question is required.');
        if (!form.candidate_id) return toast.error('Please select a candidate.');
        if (!form.scheduled_at) return toast.error('Please set a scheduled date and time.');
        if (!form.title) return toast.error('Session title is required.');

        setLoading(true);
        try {
            // Convert local datetime-local value to UTC ISO string
            // Without this, backend (UTC) misinterprets local PKT time as UTC
            const scheduledAtUTC = form.scheduled_at
                ? new Date(form.scheduled_at).toISOString()
                : '';

            const { data } = await interviewService.create({
                ...form,
                scheduled_at: scheduledAtUTC,
                questions: validQuestions.map(q => ({
                    text: q.text,
                    category: q.category,
                    difficulty: q.difficulty || 'medium',
                    expected_keywords: (q.expected_keywords || '').split(',').map(k => k.trim()).filter(Boolean),
                })),
            });
            const meetLink = data?.meet_link || '';
            setCreatedMeetLink(meetLink);
            toast.success(meetLink
                ? `Interview scheduled! Google Meet link generated. Candidate notified.`
                : 'Interview scheduled successfully! Candidate has been notified.'
            );
            setTimeout(() => navigate('/recruiter/dashboard'), meetLink ? 5000 : 2000);
        } catch (err) {
            const errorData = err.response?.data;
            if (errorData?.error) {
                toast.error(errorData.error);
            } else if (errorData && typeof errorData === 'object') {
                // Handle DRF-style field validation errors
                const firstKey = Object.keys(errorData)[0];
                const message = Array.isArray(errorData[firstKey]) ? errorData[firstKey][0] : JSON.stringify(errorData[firstKey]);
                toast.error(`${firstKey.toUpperCase()}: ${message}`);
            } else {
                toast.error('Failed to schedule interview. Please check your connection.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="hr-content">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
                <div>
                    <h1 className="hr-heading">Schedule Interview</h1>
                    <p className="hr-subheading mt-2">AI-Powered Interview Scheduling</p>
                </div>
                <button onClick={() => navigate('/recruiter/dashboard')} className="btn-hr-secondary py-4 px-8 text-[10px]">
                    ← BACK TO DASHBOARD
                </button>
            </div>

            {/* Step Indicators */}
            <div className="flex gap-4 mb-12">
                {[
                    { label: 'INTERVIEW DETAILS', icon: <TfiBriefcase /> },
                    { label: 'INTERVIEW QUESTIONS', icon: <TfiTarget /> }
                ].map((s, i) => (
                    <button
                        key={i}
                        onClick={() => setStep(i)}
                        className={`flex items-center gap-3 px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border-2 ${step === i ? 'bg-hr-black text-white border-hr-red shadow-xl' : 'bg-white text-hr-text-muted border-hr-border hover:border-hr-red/40'}`}
                    >
                        <span className="text-lg">{s.icon}</span>
                        {i + 1}. {s.label}
                    </button>
                ))}
            </div>

            {createdMeetLink && (
                <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-2xl">
                    <p className="text-green-700 text-xs font-black italic mb-2">✅ Interview Scheduled</p>
                    <div className="mt-3 p-4 bg-white rounded-xl border border-green-100 flex items-center gap-3">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex-shrink-0">Meet Link:</span>
                        <a
                            href={createdMeetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-black text-green-600 hover:text-green-800 underline underline-offset-2 truncate"
                        >
                            {createdMeetLink}
                        </a>
                    </div>
                </div>
            )}

            {/* ── STEP 0: Configuration ── */}
            {step === 0 && (
                <div className="hr-grid">
                    <div className="col-7 space-y-8">
                        <div className="hr-card p-10">
                            <h3 className="hr-subheading mb-10 flex items-center gap-4">
                                <TfiBriefcase className="text-hr-red" /> Interview Details
                            </h3>
                            <div className="space-y-8">
                                <div>
                                    <label className="hr-label">Interview Title *</label>
                                    <input
                                        className="hr-input"
                                        placeholder="e.g. Senior Software Engineer - Technical Round 1"
                                        value={form.title}
                                        onChange={e => set('title', e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <label className="hr-label">Job Role</label>
                                        <input
                                            className="hr-input"
                                            placeholder="e.g. React Developer"
                                            value={form.job_title}
                                            onChange={e => set('job_title', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="hr-label">Interview Duration (Minutes)</label>
                                        <select
                                            className="hr-input font-black uppercase italic text-xs py-4"
                                            value={form.duration_minutes}
                                            onChange={e => set('duration_minutes', parseInt(e.target.value))}
                                        >
                                            {[30, 45, 60, 90, 120].map(d => (
                                                <option key={d} value={d}>{d} MINUTES</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Scheduled At + AI Slot Suggestions */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="hr-label mb-0">Scheduled Time *</label>
                                        <button
                                            type="button"
                                            onClick={handleSuggestSlots}
                                            disabled={slotLoading}
                                            className="btn-hr-primary py-2 px-4 text-[9px] bg-hr-black hover:bg-hr-red"
                                        >
                                            {slotLoading ? <TfiReload className="animate-spin" /> : <TfiBolt />}
                                            {slotLoading ? 'OPTIMIZING...' : 'AI SUGGEST TIMES'}
                                        </button>
                                    </div>
                                    <input
                                        type="datetime-local"
                                        className="hr-input"
                                        value={form.scheduled_at}
                                        onChange={e => set('scheduled_at', e.target.value)}
                                    />
                                    <p className="text-[9px] text-gray-400 mt-2 italic uppercase tracking-widest">
                                        ⚠️ Minimum 1 hour advance notice required for proper preparation
                                    </p>
                                </div>

                                {/* AI Slot Suggestions Panel */}
                                <AnimatePresence>
                                    {showSlots && slotSuggestions.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="p-8 bg-white text-gray-950 rounded-[2rem] shadow-2xl border-2 border-red-50 relative overflow-hidden group"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/[0.03] blur-[40px] pointer-events-none" />
                                            <div className="flex items-center justify-between mb-6 relative">
                                                <h4 className="text-sm font-black text-gray-950 flex items-center gap-3 uppercase italic tracking-widest">
                                                    <TfiBolt className="text-red-600 animate-pulse" /> AI Optimized Slots
                                                </h4>
                                                <button onClick={() => setShowSlots(false)} className="text-gray-400 hover:text-red-600 transition-colors"><TfiClose /></button>
                                            </div>
                                            {slotTip && <p className="text-[10px] text-gray-400 italic mb-6 border-l-2 border-red-600/40 pl-4 uppercase tracking-widest">{slotTip}</p>}
                                            <div className="space-y-3 relative">
                                                {slotSuggestions.map((slot, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => applySlot(slot)}
                                                        className="w-full flex items-center justify-between p-5 bg-gray-50/50 hover:bg-white rounded-2xl transition-all border border-gray-100 hover:border-red-600/40 group/slot hover:shadow-lg shadow-sm"
                                                    >
                                                        <div className="text-left">
                                                            <div className="text-xs font-black text-gray-900 uppercase italic group-hover/slot:text-red-600 transition-colors">{slot.day_label}</div>
                                                            <div className="text-[9px] text-gray-400 mt-1 uppercase tracking-widest">{slot.time_recruiter} · {slot.reason}</div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-[10px] font-black text-red-600 italic bg-red-50 px-3 py-1 rounded-lg border border-red-100">{slot.quality_score}% SCORE</span>
                                                            <TfiArrowRight className="text-gray-300 group-hover/slot:text-red-600 transition-all group-hover/slot:translate-x-1" />
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div>
                                    <label className="hr-label">Interview Context (for AI Analysis)</label>
                                    <textarea
                                        className="hr-input h-32 italic"
                                        placeholder="Paste job description — AI will tailor interview questions based on this context."
                                        value={form.job_description}
                                        onChange={e => set('job_description', e.target.value)}
                                    />
                                </div>

                                {/* Google Meet Toggle */}
                                <div className="p-8 bg-gray-50 rounded-[2.5rem] border-2 border-gray-100 flex items-center justify-between gap-6 hover:border-red-600/20 transition-all group/toggle">
                                    <div>
                                        <div className="text-[10px] font-black text-gray-950 uppercase tracking-[0.3em] mb-2 flex items-center gap-3 italic">
                                            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span> AUTO-GENERATE UPLINK (GOOGLE MEET)
                                        </div>
                                        <p className="text-[10px] text-gray-400 italic uppercase tracking-widest">Broadcasts calendar event with encrypted meet link to candidate.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => set('generate_meet_link', !form.generate_meet_link)}
                                        className={`relative w-16 h-8 rounded-full transition-all flex-shrink-0 shadow-inner ${form.generate_meet_link ? 'bg-red-600' : 'bg-gray-200'}`}
                                    >
                                        <span className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-xl transition-all ${form.generate_meet_link ? 'left-9' : 'left-1'}`} />
                                    </button>
                                </div>

                                <button
                                    onClick={() => setStep(1)}
                                    disabled={!form.title || !form.scheduled_at || !form.candidate_id}
                                    className="btn-hr-primary w-full py-5 text-[10px]"
                                >
                                    PROCEED TO QUESTIONS <TfiArrowRight className="ml-3" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Candidate Selection Sidebar */}
                    <div className="col-5 space-y-8">
                        <div className="hr-card p-10 bg-white border-2 border-gray-100 shadow-2xl shadow-gray-200/50">
                            <h3 className="text-xs font-black text-gray-950 mb-8 flex items-center gap-4 border-l-4 border-red-600 pl-4 uppercase italic tracking-widest">
                                <TfiUser className="text-red-600" /> MISSION CANDIDATE
                            </h3>

                            {/* Candidate Search */}
                            <div className="relative mb-8">
                                <TfiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    className="hr-input bg-gray-50 border-gray-100 focus:bg-white text-gray-900 pl-14 h-16 shadow-inner tracking-widest"
                                    placeholder="SCAN NAME / ENCRYPTED EMAIL..."
                                    value={candidateSearch}
                                    onChange={e => setCandidateSearch(e.target.value)}
                                />
                            </div>

                            {selectedCandidate && (
                                <div className="flex items-center gap-5 p-6 bg-red-50 rounded-[2rem] border-2 border-red-100 mb-8 shadow-xl shadow-red-600/5 animate-fade-in">
                                    <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black text-2xl italic shadow-lg">
                                        {selectedCandidate.name?.charAt(0)}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="text-sm font-black text-gray-950 uppercase italic truncate tracking-tight">{selectedCandidate.name}</div>
                                        <div className="text-[9px] text-red-600 font-bold uppercase tracking-[0.2em] truncate">{selectedCandidate.email}</div>
                                    </div>
                                    <button onClick={() => { setSelectedCandidate(null); set('candidate_id', ''); }} className="w-10 h-10 rounded-xl bg-white text-gray-400 hover:text-red-600 hover:shadow-md transition-all flex items-center justify-center border border-gray-100">
                                        <TfiClose />
                                    </button>
                                </div>
                            )}

                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {candidateLoading && <div className="text-center py-12 text-gray-400 text-[9px] animate-pulse font-black uppercase tracking-[0.4em] italic">SCANNING TALENT DATABASE...</div>}
                                {!candidateLoading && candidates.map(c => (
                                    <div
                                        key={c.id}
                                        onClick={() => { setSelectedCandidate(c); set('candidate_id', c.id); setCandidates([]); setCandidateSearch(''); }}
                                        className={`p-6 rounded-[1.8rem] border-2 transition-all cursor-pointer flex items-center gap-5 shadow-sm ${form.candidate_id === c.id ? 'border-red-600 bg-red-50/50 shadow-md' : 'border-gray-100 bg-white hover:border-red-200 hover:bg-gray-50/50'}`}
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-gray-950 text-white flex items-center justify-center font-black italic group-hover:bg-red-600 transition-colors">{c.name?.charAt(0)}</div>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="text-sm font-black text-gray-900 uppercase italic truncate tracking-tight">{c.name}</div>
                                            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest truncate">{c.email}</div>
                                        </div>
                                        {form.candidate_id === c.id && <TfiCheck className="text-red-600 text-xl" />}
                                    </div>
                                ))}
                                {!candidateLoading && candidateSearch.length >= 2 && candidates.length === 0 && (
                                    <div className="py-16 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                                        <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.3em] italic">Target Not Found.</p>
                                    </div>
                                )}
                                {candidateSearch.length < 2 && !selectedCandidate && (
                                    <div className="py-16 text-center border-2 border-dashed border-gray-100 rounded-3xl group">
                                        <p className="text-[9px] text-gray-300 group-hover:text-red-600/40 transition-colors font-black uppercase tracking-[0.5em] italic">Awaiting Input Scan...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tactical Reminder */}
                        <div className="p-10 bg-hr-red-soft border-2 border-hr-red/20 rounded-[2.5rem]">
                            <h3 className="hr-subheading text-hr-red mb-4 flex items-center gap-3">
                                <TfiTarget className="animate-pulse" /> Scheduling Reminder
                            </h3>
                            <p className="text-[11px] font-black text-hr-text-muted leading-relaxed italic border-l-4 border-hr-red pl-6">
                                "Scheduling an interview requires a candidate and a confirmed time for accurate assessment."
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── STEP 1: Inquiry Questions ── */}
            {step === 1 && (
                <div className="space-y-12">
                    <div className="hr-card p-12">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
                            <h3 className="hr-subheading flex items-center gap-4 text-lg">
                                <TfiLayoutGrid2 className="text-hr-red" /> Interview Question Bank ({questions.length})
                            </h3>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowBankPicker(true)}
                                    className="btn-hr-secondary py-3 px-6 text-[10px]"
                                >
                                    <TfiLayoutGrid2 /> QUESTION BANK
                                </button>
                                <button
                                    onClick={handleGenerateAI}
                                    disabled={generating}
                                    className="btn-hr-primary py-3 px-8 text-[10px] shadow-xl shadow-hr-red/20"
                                >
                                    {generating ? <TfiReload className="animate-spin" /> : <TfiBolt />}
                                    {generating ? 'SYNTHESIZING...' : 'AI TAILOR QUESTIONS'}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {questions.map((q, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-8 bg-hr-bg/50 rounded-[2rem] border border-hr-border relative group hover:border-hr-red/10 transition-all"
                                >
                                    <div className="flex items-start gap-6">
                                        <div className="w-10 h-10 rounded-xl bg-hr-black text-hr-red flex items-center justify-center font-black text-lg italic flex-shrink-0 mt-1 shadow-lg">{i + 1}</div>
                                        <div className="flex-1 space-y-4">
                                            <textarea
                                                className="hr-input h-24 italic font-medium bg-white"
                                                placeholder="Enter interview question..."
                                                value={q.text}
                                                onChange={e => setQ(i, 'text', e.target.value)}
                                            />
                                            <div className="grid grid-cols-3 gap-6">
                                                <div>
                                                    <label className="text-[8px] font-black text-hr-text-muted mb-1 block">CATEGORY</label>
                                                    <select
                                                        className="hr-input py-2 text-xs"
                                                        value={q.category}
                                                        onChange={e => setQ(i, 'category', e.target.value)}
                                                    >
                                                        {(QUESTION_CATEGORIES || ['general', 'technical', 'behavioral']).map(cat => (
                                                            <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-[8px] font-black text-hr-text-muted mb-1 block">COMPLEXITY</label>
                                                    <select
                                                        className="hr-input py-2 text-xs"
                                                        value={q.difficulty || 'medium'}
                                                        onChange={e => setQ(i, 'difficulty', e.target.value)}
                                                    >
                                                        {['easy', 'medium', 'hard'].map(d => (
                                                            <option key={d} value={d}>{d.toUpperCase()}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-[8px] font-black text-hr-text-muted mb-1 block">EXPECTED KEYWORDS (CSV)</label>
                                                    <input
                                                        className="hr-input py-2 text-xs"
                                                        placeholder="Important topics..."
                                                        value={q.expected_keywords}
                                                        onChange={e => setQ(i, 'expected_keywords', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        {questions.length > 1 && (
                                            <button onClick={() => removeQ(i)} className="p-3 text-hr-text-muted hover:text-hr-red transition-colors">
                                                <TfiTrash />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <button
                            onClick={addQ}
                            className="mt-8 w-full py-5 border-2 border-dashed border-hr-border rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-hr-text-muted hover:border-hr-red hover:text-hr-red transition-all flex items-center justify-center gap-4"
                        >
                            <TfiPlus /> ADD MANUAL QUESTION
                        </button>
                    </div>

                    <div className="flex gap-8">
                        <button onClick={() => setStep(0)} className="btn-hr-secondary flex-1 py-6">
                            <TfiArrowLeft className="mr-3" /> BACK TO DETAILS
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="btn-hr-primary flex-2 py-6 shadow-[0_0_40px_rgba(230,57,70,0.3)]"
                        >
                            {loading ? <TfiReload className="animate-spin mr-3" /> : null}
                            {loading ? 'DEPLOYING...' : 'SCHEDULE INTERVIEW 🚀'}
                        </button>
                    </div>
                </div>
            )}

            {/* Question Bank Picker Modal */}
            <AnimatePresence>
                {showBankPicker && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-hr-black/95 backdrop-blur-2xl flex items-center justify-center p-6 z-[2000]"
                        onClick={(e) => e.target === e.currentTarget && setShowBankPicker(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-[3rem] max-w-xl w-full p-12 shadow-2xl border border-hr-border max-h-[85vh] overflow-hidden flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h2 className="hr-heading text-xl">Question Bank</h2>
                                    <p className="hr-subheading text-[10px]">Select Questions to Add</p>
                                </div>
                                <button onClick={() => setShowBankPicker(false)} className="w-10 h-10 rounded-xl bg-hr-black text-white flex items-center justify-center hover:bg-hr-red transition-all"><TfiClose /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                                {banksLoading && <div className="text-center py-12 text-hr-text-muted text-[10px] animate-pulse uppercase tracking-widest">LOADING BANK...</div>}

                                {!banksLoading && banks.length === 0 && (
                                    <div className="text-center py-12">
                                        <p className="hr-subheading text-xs mb-8">Vault Empty.</p>
                                        <button
                                            onClick={() => { setShowBankPicker(false); navigate('/recruiter/question-bank'); }}
                                            className="btn-hr-primary py-4 px-10"
                                        >
                                            INITIALIZE VAULT
                                        </button>
                                    </div>
                                )}

                                {banks.map(bank => (
                                    <div key={bank.id} className="p-6 bg-hr-bg rounded-2xl border-2 border-transparent hover:border-hr-red/40 transition-all cursor-pointer group flex items-center justify-between" onClick={() => loadFromBank(bank)}>
                                        <div>
                                            <h3 className="text-sm font-black text-hr-text-main uppercase italic group-hover:text-hr-red transition-colors">{bank.name}</h3>
                                            <p className="text-[10px] text-hr-text-muted mt-2 tracking-widest uppercase">{bank.job_title || 'GENERAL'} · {bank.question_count} QUESTIONS</p>
                                        </div>
                                        <TfiArrowRight className="text-hr-text-muted group-hover:text-hr-red transition-all group-hover:translate-x-2" />
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
