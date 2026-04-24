import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
    TfiMicrophone, TfiBolt, TfiTarget, TfiCheck, TfiClose,
    TfiReload, TfiStatsUp, TfiPulse, TfiShield, TfiAlert,
    TfiAngleRight, TfiTimer, TfiUser
} from 'react-icons/tfi';
import evaluationService from '../../services/evaluationService';

const LEVEL_OPTIONS = [
    { value: 'junior', label: 'Junior', desc: 'Entry-level • 0-2 years', color: 'emerald' },
    { value: 'mid', label: 'Mid-Level', desc: 'Intermediate • 2-5 years', color: 'blue' },
    { value: 'senior', label: 'Senior', desc: 'Expert • 5+ years', color: 'purple' },
];

const GRADE_COLORS = {
    Excellent: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    Good: 'text-blue-600 bg-blue-50 border-blue-200',
    Average: 'text-amber-600 bg-amber-50 border-amber-200',
    'Below Average': 'text-orange-600 bg-orange-50 border-orange-200',
    Poor: 'text-red-600 bg-red-50 border-red-200',
};

export default function MockInterview() {
    // Setup State
    const [phase, setPhase] = useState('setup'); // setup | interview | report
    const [role, setRole] = useState('');
    const [level, setLevel] = useState('mid');
    const [starting, setStarting] = useState(false);

    // Interview State
    const [sessionId, setSessionId] = useState(null);
    const [currentQ, setCurrentQ] = useState(null);   // question_data object
    const [qNumber, setQNumber] = useState(1);
    const [totalQ] = useState(5);
    const [answer, setAnswer] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [lastFeedback, setLastFeedback] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [history, setHistory] = useState([]);

    // Report State
    const [report, setReport] = useState(null);

    const handleStart = async () => {
        if (!role.trim()) return toast.error('Please enter a job role.');
        setStarting(true);
        try {
            const res = await evaluationService.startMockInterview({ role: role.trim(), level });
            setSessionId(res.data.session_id);
            setCurrentQ(res.data.question_data);
            setQNumber(1);
            setHistory([]);
            setAnswer('');
            setLastFeedback(null);
            setShowFeedback(false);
            setPhase('interview');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to start interview. Try again.');
        } finally {
            setStarting(false);
        }
    };

    const handleSubmitAnswer = async () => {
        if (!answer.trim() || answer.trim().length < 5) return toast.error('Please write a proper answer.');
        setSubmitting(true);
        try {
            const res = await evaluationService.submitMockAnswer({ session_id: sessionId, answer: answer.trim() });
            const data = res.data;

            // Save feedback
            setLastFeedback(data.feedback);
            setShowFeedback(true);

            // Update history
            const newEntry = {
                question: currentQ.question,
                question_type: currentQ.question_type,
                answer: answer.trim(),
                ...data.feedback,
            };
            setHistory(prev => [...prev, newEntry]);

            if (data.status === 'completed') {
                setReport(data.final_report);
                // Show feedback briefly then go to report
                setTimeout(() => {
                    setPhase('report');
                    setShowFeedback(false);
                }, 3000);
            } else {
                // Move to next question after showing feedback
                setTimeout(() => {
                    setCurrentQ(data.question_data);
                    setQNumber(data.next_question);
                    setAnswer('');
                    setShowFeedback(false);
                    setLastFeedback(null);
                }, 3500);
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Submission failed. Try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRestart = () => {
        setPhase('setup');
        setSessionId(null);
        setCurrentQ(null);
        setQNumber(1);
        setAnswer('');
        setLastFeedback(null);
        setShowFeedback(false);
        setHistory([]);
        setReport(null);
    };

    const progressPct = ((qNumber - 1) / totalQ) * 100;

    return (
        <div className="elite-content pb-24">
            {/* Header */}
            <div className="mb-16">
                <h1 className="elite-tactical-header">AI Mock Interview</h1>
                <p className="elite-sub-header mt-2 text-gray-400 font-black uppercase tracking-[0.4em] text-[10px] italic">
                    Practice with AI · Get Real-time Feedback · Ace Your Interview
                </p>
            </div>

            <AnimatePresence mode="wait">
                {/* ── SETUP PHASE ── */}
                {phase === 'setup' && (
                    <motion.div key="setup" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}>
                        <div className="max-w-3xl mx-auto space-y-10">
                            {/* Hero Banner */}
                            <div className="p-16 bg-white rounded-[3rem] border border-gray-100 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/[0.03] blur-[150px] pointer-events-none" />
                                <div className="flex items-center gap-10 mb-10 relative z-10">
                                    <div className="w-20 h-20 rounded-[2rem] bg-red-600 text-white flex items-center justify-center text-4xl shadow-[0_20px_40px_rgba(220,38,38,0.2)] animate-pulse">
                                        <TfiMicrophone />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-950 mb-2">Ready to Practice?</h2>
                                        <p className="text-[12px] font-black uppercase text-red-600 tracking-[0.4em] italic">AI Interviewer · 5 Questions · Instant Feedback</p>
                                    </div>
                                </div>
                                <p className="text-[14px] text-gray-500 italic leading-relaxed border-l-4 border-red-100 pl-8 relative z-10">
                                    Our AI will ask you <span className="font-black text-gray-950">5 progressive interview questions</span> tailored to your role and level. Answer each one, receive instant detailed feedback, and get a comprehensive performance report at the end.
                                </p>
                            </div>

                            {/* Config Card */}
                            <div className="p-12 bg-white rounded-[3rem] border border-gray-100 shadow-xl space-y-10">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.5em] italic block mb-4">Job Role / Position</label>
                                    <input
                                        className="elite-input h-16 text-lg font-black uppercase italic"
                                        placeholder="E.G. SOFTWARE ENGINEER, PRODUCT MANAGER..."
                                        value={role}
                                        onChange={e => setRole(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleStart()}
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.5em] italic block mb-6">Experience Level</label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {LEVEL_OPTIONS.map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setLevel(opt.value)}
                                                className={`p-8 rounded-[2rem] border-2 text-left transition-all relative overflow-hidden group ${level === opt.value ? 'border-red-600 bg-red-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                                            >
                                                {level === opt.value && <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-red-600 flex items-center justify-center"><TfiCheck className="text-white text-xs" /></div>}
                                                <div className={`text-[13px] font-black uppercase italic tracking-tight mb-2 ${level === opt.value ? 'text-red-600' : 'text-gray-900'}`}>{opt.label}</div>
                                                <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{opt.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={handleStart}
                                    disabled={starting || !role.trim()}
                                    className={`w-full py-8 rounded-[2.5rem] text-[13px] font-black uppercase tracking-[0.6em] italic shadow-2xl transition-all flex items-center justify-center gap-6 ${starting ? 'bg-gray-200 text-gray-400 animate-pulse' : 'bg-red-600 text-white hover:bg-gray-900 active:scale-[0.98]'}`}
                                >
                                    {starting ? (<><TfiReload className="animate-spin" /> SETTING UP AI INTERVIEWER...</>) : (<><TfiBolt className="animate-pulse" /> START MOCK INTERVIEW</>)}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ── INTERVIEW PHASE ── */}
                {phase === 'interview' && (
                    <motion.div key="interview" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}>
                        <div className="max-w-4xl mx-auto space-y-8">
                            {/* Progress HUD */}
                            <div className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-[1.2rem] bg-red-600 text-white flex items-center justify-center text-xl animate-pulse">
                                            <TfiTimer />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] italic">Question Progress</div>
                                            <div className="text-2xl font-black text-gray-950 italic">{qNumber} <span className="text-gray-300">/ {totalQ}</span></div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] italic mb-1">{role.toUpperCase()} · {level.toUpperCase()}</div>
                                        <div className="text-[11px] font-black text-red-600 uppercase italic">AI Interviewer Active</div>
                                    </div>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-red-600 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPct}%` }}
                                        transition={{ duration: 0.8 }}
                                    />
                                </div>
                                <div className="flex justify-between mt-3">
                                    {Array.from({ length: totalQ }).map((_, i) => (
                                        <div key={i} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[9px] font-black transition-all ${i < history.length ? 'bg-emerald-500 border-emerald-500 text-white' : i === qNumber - 1 ? 'bg-red-600 border-red-600 text-white animate-pulse' : 'bg-white border-gray-200 text-gray-400'}`}>
                                            {i < history.length ? <TfiCheck /> : i + 1}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Question Card */}
                            {currentQ && !showFeedback && (
                                <motion.div key={qNumber} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} className="p-12 bg-white rounded-[3rem] border border-gray-100 shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/[0.02] blur-[100px] pointer-events-none" />
                                    <div className="flex items-center gap-5 mb-8 relative z-10">
                                        <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border italic ${currentQ.question_type === 'technical' ? 'bg-blue-50 text-blue-600 border-blue-200' : currentQ.question_type === 'behavioral' ? 'bg-purple-50 text-purple-600 border-purple-200' : currentQ.question_type === 'situational' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                                            {currentQ.question_type}
                                        </span>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Q{qNumber} of {totalQ}</span>
                                    </div>
                                    <div className="w-12 h-12 rounded-[1.2rem] bg-gray-950 text-white flex items-center justify-center text-xl mb-8 relative z-10">
                                        <TfiUser />
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-950 italic leading-relaxed mb-10 relative z-10 border-l-4 border-red-600 pl-8">
                                        {currentQ.question}
                                    </h2>
                                    {currentQ.tip_for_candidate && (
                                        <div className="flex items-start gap-4 p-8 bg-amber-50 border border-amber-100 rounded-[2rem] relative z-10">
                                            <TfiBolt className="text-amber-500 text-xl flex-shrink-0 mt-0.5" />
                                            <p className="text-[12px] text-amber-700 font-bold italic leading-relaxed">
                                                <span className="font-black uppercase">Tip: </span>{currentQ.tip_for_candidate}
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* Feedback Card (shown after submission) */}
                            <AnimatePresence>
                                {showFeedback && lastFeedback && (
                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="p-12 bg-white rounded-[3rem] border border-gray-100 shadow-xl">
                                        <div className="flex items-center gap-6 mb-10">
                                            <div className={`px-6 py-3 rounded-2xl border text-[13px] font-black uppercase italic ${GRADE_COLORS[lastFeedback.grade] || 'text-gray-600 bg-gray-50 border-gray-200'}`}>
                                                {lastFeedback.grade} · {lastFeedback.score}/10
                                            </div>
                                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic animate-pulse">
                                                {qNumber < totalQ ? `Loading Q${qNumber + 1}...` : 'Generating Report...'}
                                            </div>
                                        </div>
                                        <p className="text-[15px] text-gray-600 italic leading-relaxed mb-10 border-l-4 border-gray-200 pl-8">{lastFeedback.feedback}</p>
                                        <div className="grid grid-cols-2 gap-6">
                                            {lastFeedback.strengths?.length > 0 && (
                                                <div>
                                                    <div className="text-[9px] font-black uppercase text-emerald-600 tracking-widest mb-4 italic">Strengths</div>
                                                    {lastFeedback.strengths.map((s, i) => (
                                                        <div key={i} className="flex items-start gap-3 mb-3 text-[12px] text-gray-600 italic">
                                                            <TfiCheck className="text-emerald-500 mt-0.5 flex-shrink-0" /> {s}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {lastFeedback.improvements?.length > 0 && (
                                                <div>
                                                    <div className="text-[9px] font-black uppercase text-red-500 tracking-widest mb-4 italic">Improve</div>
                                                    {lastFeedback.improvements.map((s, i) => (
                                                        <div key={i} className="flex items-start gap-3 mb-3 text-[12px] text-gray-600 italic">
                                                            <TfiAngleRight className="text-red-400 mt-0.5 flex-shrink-0" /> {s}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {lastFeedback.better_answer_hint && (
                                            <div className="mt-8 p-6 bg-gray-50 border border-gray-100 rounded-[1.5rem] text-[12px] text-gray-600 italic">
                                                <span className="font-black text-gray-950 uppercase">Hint: </span>{lastFeedback.better_answer_hint}
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Answer Box */}
                            {!showFeedback && (
                                <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.5em] italic block mb-6">Your Answer</label>
                                    <textarea
                                        className="elite-input min-h-[200px] pt-6 font-medium italic text-gray-800 leading-relaxed resize-none"
                                        placeholder="Type your answer here... Be specific, use real examples, structure your response clearly."
                                        value={answer}
                                        onChange={e => setAnswer(e.target.value)}
                                    />
                                    <div className="flex items-center justify-between mt-6">
                                        <span className={`text-[10px] font-black uppercase tracking-widest italic ${answer.length < 50 ? 'text-red-400' : 'text-emerald-500'}`}>
                                            {answer.length} chars {answer.length < 50 ? '(write more)' : '✓ Good length'}
                                        </span>
                                        <button
                                            onClick={handleSubmitAnswer}
                                            disabled={submitting || answer.trim().length < 5}
                                            className={`px-12 py-6 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.5em] italic transition-all flex items-center gap-4 ${submitting ? 'bg-gray-200 text-gray-400 animate-pulse' : 'bg-red-600 text-white hover:bg-gray-900 shadow-xl active:scale-95'}`}
                                        >
                                            {submitting ? <TfiReload className="animate-spin" /> : <TfiAngleRight />}
                                            {submitting ? 'EVALUATING...' : qNumber === totalQ ? 'FINISH INTERVIEW' : 'SUBMIT ANSWER'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* ── REPORT PHASE ── */}
                {phase === 'report' && report && (
                    <motion.div key="report" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <div className="max-w-4xl mx-auto space-y-10">
                            {/* Score Banner */}
                            <div className="p-16 bg-white rounded-[3rem] border border-gray-100 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/[0.02] blur-[200px]" />
                                <div className="flex flex-col lg:flex-row items-center gap-16 relative z-10">
                                    <div className="relative w-52 h-52 flex-shrink-0">
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="8" />
                                            <motion.circle
                                                cx="50" cy="50" r="44" fill="none"
                                                stroke={report.overall_score >= 80 ? '#10b981' : report.overall_score >= 60 ? '#3b82f6' : report.overall_score >= 40 ? '#f59e0b' : '#ef4444'}
                                                strokeWidth="8" strokeLinecap="round"
                                                initial={{ strokeDasharray: '0 276' }}
                                                animate={{ strokeDasharray: `${(report.overall_score / 100) * 276} 276` }}
                                                transition={{ duration: 1.5, ease: 'easeOut' }}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-6xl font-black text-gray-950 italic tracking-tighter">{report.overall_score}</motion.span>
                                            <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] italic mt-2">/ 100</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 text-center lg:text-left">
                                        <div className={`inline-block px-8 py-3 rounded-[2rem] border text-[13px] font-black uppercase italic tracking-wide mb-8 ${GRADE_COLORS[report.performance_grade] || 'text-gray-600 bg-gray-50 border-gray-200'}`}>
                                            {report.performance_grade}
                                        </div>
                                        <p className="text-[16px] text-gray-600 italic leading-relaxed border-l-4 border-red-100 pl-8 mb-8">{report.interview_summary}</p>
                                        <div className={`inline-flex items-center gap-4 px-8 py-4 rounded-[1.5rem] border text-[11px] font-black uppercase italic tracking-widest ${report.readiness_for_real_interview === 'Ready' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : report.readiness_for_real_interview === 'Almost Ready' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                                            <TfiTarget /> {report.readiness_for_real_interview}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Strengths */}
                                <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl">
                                    <h3 className="text-[11px] font-black uppercase text-emerald-600 tracking-[0.5em] italic mb-8 flex items-center gap-4"><TfiCheck className="text-xl" /> Top Strengths</h3>
                                    <div className="space-y-4">
                                        {(report.top_strengths || []).map((s, i) => (
                                            <div key={i} className="flex items-start gap-4 p-5 bg-emerald-50 border border-emerald-100 rounded-[1.5rem] text-[13px] text-emerald-800 italic">
                                                <span className="w-6 h-6 rounded-lg bg-emerald-500 text-white text-[10px] flex items-center justify-center font-black flex-shrink-0">{i + 1}</span>
                                                {s}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Improvements */}
                                <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl">
                                    <h3 className="text-[11px] font-black uppercase text-red-600 tracking-[0.5em] italic mb-8 flex items-center gap-4"><TfiAlert className="text-xl" /> Critical Improvements</h3>
                                    <div className="space-y-4">
                                        {(report.critical_improvements || []).map((s, i) => (
                                            <div key={i} className="flex items-start gap-4 p-5 bg-red-50 border border-red-100 rounded-[1.5rem] text-[13px] text-red-800 italic">
                                                <span className="w-6 h-6 rounded-lg bg-red-500 text-white text-[10px] flex items-center justify-center font-black flex-shrink-0">{i + 1}</span>
                                                {s}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Q&A Review */}
                            <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl">
                                <h3 className="text-[11px] font-black uppercase text-gray-400 tracking-[0.5em] italic mb-10">Question-by-Question Breakdown</h3>
                                <div className="space-y-6">
                                    {history.map((item, i) => (
                                        <div key={i} className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest italic">Q{i + 1} · {item.question_type}</span>
                                                <span className={`px-4 py-1.5 rounded-xl border text-[10px] font-black uppercase italic ${GRADE_COLORS[item.grade] || 'text-gray-500 bg-white border-gray-200'}`}>{item.grade} · {item.score}/10</span>
                                            </div>
                                            <p className="text-[13px] font-bold text-gray-900 italic mb-3">{item.question}</p>
                                            <p className="text-[12px] text-gray-500 italic border-l-2 border-gray-200 pl-4 mb-4 line-clamp-2">{item.answer}</p>
                                            {item.better_answer_hint && (
                                                <p className="text-[11px] text-amber-700 italic bg-amber-50 px-5 py-3 rounded-xl border border-amber-100">
                                                    <span className="font-black">Hint: </span>{item.better_answer_hint}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Next Steps + Resources */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl">
                                    <h3 className="text-[11px] font-black uppercase text-blue-600 tracking-[0.5em] italic mb-8 flex items-center gap-4"><TfiAngleRight /> Next Steps</h3>
                                    <div className="space-y-4">
                                        {(report.next_steps || []).map((s, i) => (
                                            <div key={i} className="flex items-start gap-4 text-[13px] text-gray-600 italic p-4 rounded-xl hover:bg-gray-50 transition-colors">
                                                <span className="w-6 h-6 rounded-lg bg-blue-500 text-white text-[10px] flex items-center justify-center font-black flex-shrink-0 mt-0.5">{i + 1}</span>
                                                {s}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl">
                                    <h3 className="text-[11px] font-black uppercase text-purple-600 tracking-[0.5em] italic mb-8 flex items-center gap-4"><TfiStatsUp /> Resources</h3>
                                    <div className="space-y-4">
                                        {(report.recommended_resources || []).map((s, i) => (
                                            <div key={i} className="flex items-start gap-4 text-[13px] text-gray-600 italic p-4 rounded-xl hover:bg-gray-50 transition-colors">
                                                <TfiShield className="text-purple-400 flex-shrink-0 mt-0.5" /> {s}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Motivational Note */}
                            {report.motivational_note && (
                                <div className="p-12 bg-gray-950 rounded-[2.5rem] text-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-red-600/10 blur-[100px]" />
                                    <TfiBolt className="text-4xl text-red-600 mx-auto mb-6 animate-pulse relative z-10" />
                                    <p className="text-[18px] font-black text-white italic tracking-tight relative z-10">{report.motivational_note}</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-6">
                                <button onClick={handleRestart} className="flex-1 py-8 rounded-[2.5rem] bg-white border border-gray-200 text-[12px] font-black uppercase tracking-[0.5em] italic text-gray-600 hover:border-red-600 hover:text-red-600 transition-all flex items-center justify-center gap-4 shadow-xl">
                                    <TfiReload /> PRACTICE AGAIN
                                </button>
                                <button onClick={() => { setLevel('senior'); setPhase('setup'); }} className="flex-1 py-8 rounded-[2.5rem] bg-red-600 text-white text-[12px] font-black uppercase tracking-[0.5em] italic hover:bg-gray-950 transition-all flex items-center justify-center gap-4 shadow-xl">
                                    <TfiTarget /> TRY HARDER LEVEL
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
