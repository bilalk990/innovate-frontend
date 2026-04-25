import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
    TfiBolt, TfiReload, TfiCheck, TfiClose, TfiTarget,
    TfiStatsUp, TfiShield, TfiAngleRight, TfiAlert,
    TfiTimer, TfiLayers, TfiPulse, TfiMicrophone
} from 'react-icons/tfi';
import authService from '../../services/authService';

// ── STACK PRESETS ─────────────────────────────────────────────────────────────
const STACK_PRESETS = [
    { label: 'React', category: 'Frontend' },
    { label: 'JavaScript', category: 'Frontend' },
    { label: 'TypeScript', category: 'Frontend' },
    { label: 'Vue.js', category: 'Frontend' },
    { label: 'Angular', category: 'Frontend' },
    { label: 'HTML/CSS', category: 'Frontend' },
    { label: 'Python', category: 'Backend' },
    { label: 'Node.js', category: 'Backend' },
    { label: 'Django', category: 'Backend' },
    { label: 'FastAPI', category: 'Backend' },
    { label: 'Java', category: 'Backend' },
    { label: 'Spring Boot', category: 'Backend' },
    { label: 'SQL', category: 'Database' },
    { label: 'MongoDB', category: 'Database' },
    { label: 'PostgreSQL', category: 'Database' },
    { label: 'Redis', category: 'Database' },
    { label: 'Data Structures', category: 'CS Fundamentals' },
    { label: 'Algorithms', category: 'CS Fundamentals' },
    { label: 'System Design', category: 'CS Fundamentals' },
    { label: 'OOP', category: 'CS Fundamentals' },
    { label: 'Docker', category: 'DevOps' },
    { label: 'AWS', category: 'DevOps' },
    { label: 'CI/CD', category: 'DevOps' },
    { label: 'Git', category: 'DevOps' },
    { label: 'Machine Learning', category: 'Data/AI' },
    { label: 'TensorFlow', category: 'Data/AI' },
    { label: 'Pandas', category: 'Data/AI' },
    { label: 'REST APIs', category: 'General' },
    { label: 'GraphQL', category: 'General' },
    { label: 'Microservices', category: 'General' },
];

const STACK_CATEGORIES = [...new Set(STACK_PRESETS.map(s => s.category))];

const LEVELS = [
    { value: 'junior', label: 'Junior', desc: '0-2 years' },
    { value: 'mid', label: 'Mid-Level', desc: '2-5 years' },
    { value: 'senior', label: 'Senior', desc: '5+ years' },
];

const PRIORITY_COLORS = {
    'Must Know': 'bg-red-50 border-red-200 text-red-700',
    'Good to Know': 'bg-blue-50 border-blue-200 text-blue-700',
    'Bonus': 'bg-gray-50 border-gray-200 text-gray-500',
};

const WEIGHT_DOT = {
    'High': 'bg-red-500',
    'Medium': 'bg-amber-500',
    'Low': 'bg-gray-300',
};

const VERDICT_STYLES = {
    'Apply Now': { bg: 'bg-emerald-950', border: 'border-emerald-500', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    'Almost Ready': { bg: 'bg-blue-950', border: 'border-blue-500', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    'Needs Practice': { bg: 'bg-amber-950', border: 'border-amber-500', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    'Not Ready': { bg: 'bg-red-950', border: 'border-red-700', text: 'text-red-400', badge: 'bg-red-500/20 text-red-300 border-red-500/30' },
};

const QUIZ_TIMER = 45; // seconds per question

export default function InterviewPrepLab() {
    const navigate = useNavigate();

    // ── Phase state ──
    const [phase, setPhase] = useState('setup'); // setup | prep | quiz | report

    // ── Setup ──
    const [role, setRole] = useState('');
    const [selectedStacks, setSelectedStacks] = useState([]);
    const [level, setLevel] = useState('mid');
    const [activeCategory, setActiveCategory] = useState('Frontend');
    const [loadingPlan, setLoadingPlan] = useState(false);
    const [prepPlan, setPrepPlan] = useState(null);

    // ── Quiz ──
    const [loadingQuiz, setLoadingQuiz] = useState(false);
    const [quiz, setQuiz] = useState(null);
    const [currentQIdx, setCurrentQIdx] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [answers, setAnswers] = useState([]); // [{correct: bool, topic, timeTaken}]
    const [timer, setTimer] = useState(QUIZ_TIMER);
    const timerRef = useRef(null);
    const qStartTimeRef = useRef(Date.now());

    // ── Integrity / Tab detection ──
    const [tabSwitches, setTabSwitches] = useState(0);
    const [showIntegrityWarning, setShowIntegrityWarning] = useState(false);
    const tabSwitchRef = useRef(0);

    // ── Report ──
    const [loadingReport, setLoadingReport] = useState(false);
    const [report, setReport] = useState(null);

    // ── Tab switch detection (active during quiz phase) ──
    useEffect(() => {
        if (phase !== 'quiz') return;

        // visibilitychange = actual tab switch (most reliable)
        // blur only fires for window focus loss NOT covered by visibilitychange (e.g. alt-tab to another app without hiding the tab)
        let lastVisibilitySwitch = 0;
        const handleVisibility = () => {
            if (document.hidden) {
                tabSwitchRef.current += 1;
                lastVisibilitySwitch = Date.now();
                setTabSwitches(tabSwitchRef.current);
                setShowIntegrityWarning(true);
                setTimeout(() => setShowIntegrityWarning(false), 4000);
            }
        };
        const handleBlur = () => {
            // Skip if visibilitychange already fired within last 200ms (avoid double-count)
            if (Date.now() - lastVisibilitySwitch < 200) return;
            tabSwitchRef.current += 1;
            setTabSwitches(tabSwitchRef.current);
            setShowIntegrityWarning(true);
            setTimeout(() => setShowIntegrityWarning(false), 4000);
        };

        document.addEventListener('visibilitychange', handleVisibility);
        window.addEventListener('blur', handleBlur);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
            window.removeEventListener('blur', handleBlur);
        };
    }, [phase]);

    // ── Timer logic ──
    const startTimer = useCallback(() => {
        clearInterval(timerRef.current);
        setTimer(QUIZ_TIMER);
        qStartTimeRef.current = Date.now();
        timerRef.current = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    handleTimeOut();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    useEffect(() => {
        if (phase === 'quiz' && quiz && !showExplanation) {
            startTimer();
        }
        return () => clearInterval(timerRef.current);
    }, [currentQIdx, phase, quiz, showExplanation, startTimer]);

    const handleTimeOut = () => {
        if (selectedOption !== null) return;
        const q = quiz.questions[currentQIdx];
        const timeTaken = QUIZ_TIMER;
        setSelectedOption(-1); // -1 = timed out
        setShowExplanation(true);
        setAnswers(prev => [...prev, { correct: false, topic: q.topic, difficulty: q.difficulty, timeTaken, timedOut: true }]);
    };

    // ── Stack toggle ──
    const toggleStack = (s) => {
        setSelectedStacks(prev =>
            prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
        );
    };

    // ── Phase 1→2: Generate Prep Plan ──
    const handleBuildPlan = async () => {
        if (!role.trim()) return toast.error('Please enter a job role.');
        if (selectedStacks.length === 0) return toast.error('Select at least one tech stack.');
        setLoadingPlan(true);
        try {
            const res = await authService.getInterviewPrepPlan({ role: role.trim(), stacks: selectedStacks, level });
            setPrepPlan(res.data);
            setPhase('prep');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to generate prep plan.');
        } finally {
            setLoadingPlan(false);
        }
    };

    // ── Phase 2→3: Load Quiz ──
    const handleStartQuiz = async () => {
        setLoadingQuiz(true);
        setAnswers([]);
        setCurrentQIdx(0);
        setSelectedOption(null);
        setShowExplanation(false);
        tabSwitchRef.current = 0;
        setTabSwitches(0);
        try {
            const res = await authService.getInterviewPrepQuiz({ role: role.trim(), stacks: selectedStacks, level, count: 10 });
            setQuiz(res.data);
            setPhase('quiz');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to generate quiz.');
        } finally {
            setLoadingQuiz(false);
        }
    };

    // ── Answer selection ──
    const handleSelectOption = (optIdx) => {
        if (selectedOption !== null || showExplanation) return;
        clearInterval(timerRef.current);
        const timeTaken = Math.round((Date.now() - qStartTimeRef.current) / 1000);
        const q = quiz.questions[currentQIdx];
        const isCorrect = optIdx === q.correct_index;
        setSelectedOption(optIdx);
        setShowExplanation(true);
        setAnswers(prev => [...prev, { correct: isCorrect, topic: q.topic, difficulty: q.difficulty, timeTaken, timedOut: false }]);
    };

    // ── Next question or finish ──
    const handleNext = async () => {
        const nextIdx = currentQIdx + 1;
        if (nextIdx >= quiz.questions.length) {
            // All questions done — generate report
            await handleGenerateReport();
        } else {
            setCurrentQIdx(nextIdx);
            setSelectedOption(null);
            setShowExplanation(false);
        }
    };

    // ── Phase 3→4: Generate Report ──
    const handleGenerateReport = async () => {
        setLoadingReport(true);
        setPhase('report');
        const score = answers.filter(a => a.correct).length;
        const wrongTopics = answers.filter(a => !a.correct).map(a => a.topic).filter(Boolean);
        const avgTime = answers.length > 0 ? answers.reduce((s, a) => s + a.timeTaken, 0) / answers.length : 30;
        try {
            const res = await authService.getInterviewPrepReport({
                role: role.trim(),
                stacks: selectedStacks,
                level,
                quiz_score: score,
                total_questions: quiz.questions.length,
                tab_switches: tabSwitchRef.current,
                wrong_topics: [...new Set(wrongTopics)],
                time_per_q_avg: avgTime,
            });
            setReport(res.data);
        } catch (err) {
            toast.error('Report generation failed. Returning to quiz.');
            setReport(null);
            setPhase('quiz');
        } finally {
            setLoadingReport(false);
        }
    };

    // ── Reset ──
    const handleReset = () => {
        setPhase('setup');
        setPrepPlan(null);
        setQuiz(null);
        setReport(null);
        setAnswers([]);
        setCurrentQIdx(0);
        setSelectedOption(null);
        setShowExplanation(false);
        setTabSwitches(0);
        tabSwitchRef.current = 0;
        clearInterval(timerRef.current);
    };

    // Derived
    const currentQ = quiz?.questions?.[currentQIdx];
    const quizScore = answers.filter(a => a.correct).length;
    const timerPct = (timer / QUIZ_TIMER) * 100;

    return (
        <div className="elite-content pb-24 relative">

            {/* ── INTEGRITY WARNING TOAST ── */}
            <AnimatePresence>
                {showIntegrityWarning && (
                    <motion.div
                        initial={{ opacity: 0, y: -60 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -60 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-10 py-5 bg-red-600 text-white rounded-[2rem] shadow-2xl flex items-center gap-5 text-[12px] font-black uppercase tracking-widest italic"
                    >
                        <TfiAlert className="animate-bounce text-xl" />
                        Tab switch detected! ({tabSwitches}) — This affects your integrity score
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="mb-16">
                <div className="flex items-center gap-6 mb-4">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-red-600 text-white flex items-center justify-center text-3xl shadow-[0_10px_30px_rgba(220,38,38,0.2)] animate-pulse">
                        <TfiTarget />
                    </div>
                    <div>
                        <h1 className="elite-tactical-header">Interview Prep Lab</h1>
                        <p className="elite-sub-header text-gray-400 font-black uppercase tracking-[0.4em] text-[10px] italic">
                            AI Roadmap → Knowledge Quiz → Mock Interview → Readiness Report
                        </p>
                    </div>
                </div>

                {/* Phase indicator */}
                <div className="flex items-center gap-0 mt-10 max-w-2xl">
                    {['Setup', 'Prep Briefing', 'Knowledge Quiz', 'Report'].map((p, i) => {
                        const phaseMap = { 0: 'setup', 1: 'prep', 2: 'quiz', 3: 'report' };
                        const isCurrent = phase === phaseMap[i];
                        const isDone = ['setup', 'prep', 'quiz', 'report'].indexOf(phase) > i;
                        return (
                            <div key={i} className="flex items-center flex-1">
                                <div className={`flex items-center gap-3 px-5 py-3 rounded-[1.5rem] text-[10px] font-black uppercase italic tracking-widest transition-all ${isCurrent ? 'bg-red-600 text-white shadow-lg' : isDone ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}>
                                    {isDone ? <TfiCheck className="text-sm" /> : <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center text-[9px]">{i + 1}</span>}
                                    <span className="hidden sm:inline">{p}</span>
                                </div>
                                {i < 3 && <div className="flex-1 h-0.5 bg-gray-100 mx-2" />}
                            </div>
                        );
                    })}
                </div>
            </div>

            <AnimatePresence mode="wait">

                {/* ══════════════════════════════════════════════
                    PHASE 1: SETUP
                ══════════════════════════════════════════════ */}
                {phase === 'setup' && (
                    <motion.div key="setup" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-10">
                            {/* Left: Stack Selector */}
                            <div className="space-y-8">
                                {/* Role Input */}
                                <div className="p-12 bg-white rounded-[3rem] border border-gray-100 shadow-xl">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.5em] italic block mb-4">Target Job Role</label>
                                    <input
                                        className="elite-input h-16 text-lg font-black uppercase italic w-full"
                                        placeholder="E.G. FRONTEND DEVELOPER, DATA ENGINEER..."
                                        value={role}
                                        onChange={e => setRole(e.target.value)}
                                    />
                                </div>

                                {/* Stack Selector */}
                                <div className="p-12 bg-white rounded-[3rem] border border-gray-100 shadow-xl">
                                    <div className="flex items-center justify-between mb-8">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.5em] italic">Select Your Tech Stack</label>
                                        {selectedStacks.length > 0 && (
                                            <button onClick={() => setSelectedStacks([])} className="text-[10px] font-black uppercase text-red-500 tracking-widest italic hover:text-red-700">
                                                Clear ({selectedStacks.length})
                                            </button>
                                        )}
                                    </div>

                                    {/* Category Tabs */}
                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {STACK_CATEGORIES.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setActiveCategory(cat)}
                                                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase italic tracking-widest transition-all ${activeCategory === cat ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Stack Chips */}
                                    <div className="flex flex-wrap gap-3">
                                        {STACK_PRESETS.filter(s => s.category === activeCategory).map(s => {
                                            const sel = selectedStacks.includes(s.label);
                                            return (
                                                <button
                                                    key={s.label}
                                                    onClick={() => toggleStack(s.label)}
                                                    className={`px-6 py-3 rounded-[1.5rem] border text-[11px] font-black uppercase italic tracking-widest transition-all ${sel ? 'bg-red-600 border-red-600 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-600 hover:border-red-200 hover:text-red-600'}`}
                                                >
                                                    {sel && <TfiCheck className="inline mr-2 text-xs" />}{s.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Level + CTA */}
                            <div className="space-y-8">
                                {/* Level */}
                                <div className="p-10 bg-white rounded-[3rem] border border-gray-100 shadow-xl">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.5em] italic block mb-8">Experience Level</label>
                                    <div className="space-y-4">
                                        {LEVELS.map(l => (
                                            <button
                                                key={l.value}
                                                onClick={() => setLevel(l.value)}
                                                className={`w-full p-6 rounded-[1.5rem] border-2 text-left transition-all flex items-center justify-between ${level === l.value ? 'border-red-600 bg-red-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                                            >
                                                <div>
                                                    <div className={`text-[13px] font-black uppercase italic ${level === l.value ? 'text-red-600' : 'text-gray-900'}`}>{l.label}</div>
                                                    <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{l.desc}</div>
                                                </div>
                                                {level === l.value && <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center"><TfiCheck className="text-white text-xs" /></div>}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Selected Stacks Preview */}
                                {selectedStacks.length > 0 && (
                                    <div className="p-8 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                                        <div className="text-[9px] font-black uppercase text-gray-400 tracking-widest italic mb-5">Selected ({selectedStacks.length})</div>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedStacks.map(s => (
                                                <span key={s} className="text-[10px] font-black uppercase bg-red-50 text-red-600 px-4 py-2 rounded-xl border border-red-100 italic flex items-center gap-2">
                                                    {s}
                                                    <TfiClose className="cursor-pointer hover:text-red-800" onClick={() => toggleStack(s)} />
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handleBuildPlan}
                                    disabled={loadingPlan || !role.trim() || selectedStacks.length === 0}
                                    className={`w-full py-8 rounded-[2.5rem] text-[12px] font-black uppercase tracking-[0.6em] italic flex items-center justify-center gap-5 shadow-2xl transition-all ${loadingPlan ? 'bg-gray-200 text-gray-400 animate-pulse' : !role.trim() || selectedStacks.length === 0 ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-gray-950 active:scale-[0.98]'}`}
                                >
                                    {loadingPlan ? <><TfiReload className="animate-spin" /> BUILDING PLAN...</> : <><TfiBolt className="animate-pulse" /> BUILD MY PREP PLAN</>}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ══════════════════════════════════════════════
                    PHASE 2: PREP BRIEFING
                ══════════════════════════════════════════════ */}
                {phase === 'prep' && prepPlan && (
                    <motion.div key="prep" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-10">
                        {/* Overview Banner */}
                        <div className="p-12 bg-white rounded-[3rem] border border-gray-100 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/[0.02] blur-[120px]" />
                            <div className="flex flex-wrap items-start gap-10 relative z-10">
                                <div className="flex-1">
                                    <div className="text-[10px] font-black uppercase text-red-600 tracking-[0.5em] italic mb-4">AI Prep Plan · {role} · {level}</div>
                                    <p className="text-[17px] text-gray-700 italic leading-relaxed border-l-4 border-red-100 pl-8">{prepPlan.prep_overview}</p>
                                </div>
                                <div className="flex flex-col gap-4 shrink-0">
                                    {[
                                        { label: 'Est. Prep Time', val: `${prepPlan.estimated_prep_days} Days`, color: 'text-blue-600' },
                                        { label: 'Difficulty', val: prepPlan.difficulty, color: 'text-amber-600' },
                                        { label: 'Stack', val: selectedStacks.slice(0, 2).join(' + ') + (selectedStacks.length > 2 ? ` +${selectedStacks.length - 2}` : ''), color: 'text-red-600' },
                                    ].map((stat, i) => (
                                        <div key={i} className="px-8 py-4 bg-gray-50 rounded-[1.5rem] border border-gray-100 text-center">
                                            <div className="text-[9px] font-black uppercase text-gray-400 tracking-widest italic">{stat.label}</div>
                                            <div className={`text-[15px] font-black italic ${stat.color}`}>{stat.val}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Must Know */}
                        <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl">
                            <h3 className="text-[11px] font-black uppercase text-red-600 tracking-[0.5em] italic mb-8 flex items-center gap-4"><TfiAlert /> Must Know Concepts</h3>
                            <div className="flex flex-wrap gap-3">
                                {(prepPlan.must_know_concepts || []).map((c, i) => (
                                    <span key={i} className="px-6 py-3 bg-red-50 border border-red-100 rounded-xl text-[11px] font-black uppercase text-red-700 italic">{c}</span>
                                ))}
                            </div>
                        </div>

                        {/* Topics Grid */}
                        <div>
                            <h3 className="text-[11px] font-black uppercase text-gray-400 tracking-[0.5em] italic mb-8">Study Topics by Category</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {(prepPlan.topics || []).map((topic, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                        className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl hover:shadow-2xl transition-all">
                                        <div className="flex items-center justify-between mb-6">
                                            <span className={`px-4 py-2 rounded-xl border text-[9px] font-black uppercase italic ${PRIORITY_COLORS[topic.priority] || 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                                                {topic.priority}
                                            </span>
                                            <div className={`w-3 h-3 rounded-full ${WEIGHT_DOT[topic.interview_weight] || 'bg-gray-300'}`} title={`Interview Weight: ${topic.interview_weight}`} />
                                        </div>
                                        <h4 className="text-[15px] font-black uppercase italic text-gray-950 tracking-tighter mb-6">{topic.category}</h4>
                                        <div className="space-y-3">
                                            {(topic.concepts || []).map((c, j) => (
                                                <div key={j} className="flex items-center gap-3 text-[12px] text-gray-600 italic">
                                                    <TfiAngleRight className="text-red-400 flex-shrink-0" /> {c}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Question Patterns */}
                        {prepPlan.common_question_patterns?.length > 0 && (
                            <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl">
                                <h3 className="text-[11px] font-black uppercase text-blue-600 tracking-[0.5em] italic mb-10">Common Interview Question Patterns</h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {prepPlan.common_question_patterns.map((qp, i) => (
                                        <div key={i} className="p-8 bg-blue-50 border border-blue-100 rounded-[2rem]">
                                            <div className="text-[11px] font-black uppercase text-blue-700 italic mb-3">{qp.pattern}</div>
                                            <div className="text-[12px] text-blue-800 italic mb-4 border-l-2 border-blue-200 pl-4">"{qp.example}"</div>
                                            <div className="text-[11px] text-blue-600 italic">→ {qp.how_to_answer}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Pro Tips + Red Flags */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl">
                                <h3 className="text-[11px] font-black uppercase text-emerald-600 tracking-[0.5em] italic mb-8 flex items-center gap-4"><TfiShield /> Pro Tips</h3>
                                <div className="space-y-4">
                                    {(prepPlan.pro_tips || []).map((t, i) => (
                                        <div key={i} className="flex items-start gap-4 text-[13px] text-gray-600 italic p-5 bg-emerald-50 border border-emerald-100 rounded-[1.5rem]">
                                            <TfiCheck className="text-emerald-500 flex-shrink-0 mt-0.5" /> {t}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl">
                                <h3 className="text-[11px] font-black uppercase text-red-600 tracking-[0.5em] italic mb-8 flex items-center gap-4"><TfiAlert /> Red Flag Topics (Often Failed)</h3>
                                <div className="space-y-4">
                                    {(prepPlan.red_flag_topics || []).map((t, i) => (
                                        <div key={i} className="flex items-start gap-4 text-[13px] text-gray-600 italic p-5 bg-red-50 border border-red-100 rounded-[1.5rem]">
                                            <TfiClose className="text-red-400 flex-shrink-0 mt-0.5" /> {t}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Daily Schedule */}
                        {prepPlan.daily_schedule?.length > 0 && (
                            <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl">
                                <h3 className="text-[11px] font-black uppercase text-purple-600 tracking-[0.5em] italic mb-10 flex items-center gap-4"><TfiTimer /> Daily Study Schedule</h3>
                                <div className="flex flex-wrap gap-4">
                                    {prepPlan.daily_schedule.map((day, i) => (
                                        <div key={i} className="flex-1 min-w-[200px] p-8 bg-purple-50 border border-purple-100 rounded-[2rem]">
                                            <div className="text-[10px] font-black uppercase text-purple-600 tracking-widest italic mb-3">{day.day}</div>
                                            <div className="text-[14px] font-black text-gray-900 italic mb-3">{day.focus}</div>
                                            <div className="text-[11px] text-gray-500 italic border-l-2 border-purple-200 pl-3">Goal: {day.goal}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* CTA */}
                        <div className="flex flex-col sm:flex-row gap-6">
                            <button onClick={handleReset} className="flex-1 py-7 rounded-[2rem] border border-gray-200 text-[11px] font-black uppercase tracking-widest italic text-gray-500 hover:border-red-300 hover:text-red-600 transition-all flex items-center justify-center gap-4">
                                <TfiReload /> Start Over
                            </button>
                            <button
                                onClick={handleStartQuiz}
                                disabled={loadingQuiz}
                                className={`flex-[3] py-8 rounded-[2.5rem] text-[13px] font-black uppercase tracking-[0.6em] italic flex items-center justify-center gap-5 shadow-2xl transition-all ${loadingQuiz ? 'bg-gray-200 text-gray-400 animate-pulse' : 'bg-red-600 text-white hover:bg-gray-950 active:scale-[0.98]'}`}
                            >
                                {loadingQuiz ? <><TfiReload className="animate-spin" /> LOADING QUIZ...</> : <><TfiStatsUp /> START KNOWLEDGE QUIZ (10 Questions)</>}
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* ══════════════════════════════════════════════
                    PHASE 3: QUIZ
                ══════════════════════════════════════════════ */}
                {phase === 'quiz' && quiz && (
                    <motion.div key="quiz" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <div className="max-w-3xl mx-auto space-y-8">
                            {/* Quiz HUD */}
                            <div className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl">
                                <div className="flex items-center justify-between mb-5">
                                    <div>
                                        <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic">Question {currentQIdx + 1} of {quiz.questions.length}</div>
                                        <div className="text-[11px] font-black uppercase text-gray-950 italic mt-1">{quiz.quiz_title}</div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        {/* Score */}
                                        <div className="text-center">
                                            <div className="text-2xl font-black text-emerald-600 italic">{quizScore}</div>
                                            <div className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Correct</div>
                                        </div>
                                        {/* Tab switches */}
                                        <div className={`text-center px-5 py-3 rounded-xl border ${tabSwitches > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}>
                                            <div className={`text-2xl font-black italic ${tabSwitches > 0 ? 'text-red-600' : 'text-gray-400'}`}>{tabSwitches}</div>
                                            <div className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Tab Switches</div>
                                        </div>
                                        {/* Timer */}
                                        <div className={`text-center px-5 py-3 rounded-xl border ${timer <= 10 ? 'bg-red-50 border-red-200 animate-pulse' : 'bg-gray-50 border-gray-100'}`}>
                                            <div className={`text-2xl font-black italic ${timer <= 10 ? 'text-red-600' : 'text-gray-900'}`}>{timer}s</div>
                                            <div className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Remaining</div>
                                        </div>
                                    </div>
                                </div>
                                {/* Progress bars */}
                                <div className="space-y-2">
                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div className="h-full bg-red-600 rounded-full" animate={{ width: `${((currentQIdx) / quiz.questions.length) * 100}%` }} />
                                    </div>
                                    <div className="w-full h-2 rounded-full overflow-hidden bg-gray-100">
                                        <motion.div
                                            className={`h-full rounded-full transition-all ${timer <= 10 ? 'bg-red-500' : timer <= 20 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                            animate={{ width: `${timerPct}%` }}
                                            transition={{ duration: 0.5 }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Question Card */}
                            <AnimatePresence mode="wait">
                                <motion.div key={currentQIdx} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
                                    className="p-12 bg-white rounded-[3rem] border border-gray-100 shadow-2xl">
                                    {/* Topic + Difficulty */}
                                    <div className="flex items-center gap-4 mb-8">
                                        <span className={`px-5 py-2 rounded-xl border text-[10px] font-black uppercase italic ${currentQ?.difficulty === 'Hard' ? 'bg-red-50 text-red-600 border-red-200' : currentQ?.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                                            {currentQ?.difficulty}
                                        </span>
                                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic">{currentQ?.topic}</span>
                                    </div>

                                    <h2 className="text-[20px] font-black text-gray-950 italic leading-relaxed mb-10 border-l-4 border-red-600 pl-8">
                                        {currentQ?.question}
                                    </h2>

                                    {/* Options */}
                                    <div className="space-y-4">
                                        {(currentQ?.options || []).map((opt, optIdx) => {
                                            const isSelected = selectedOption === optIdx;
                                            const isCorrect = optIdx === currentQ.correct_index;
                                            const isTimedOut = selectedOption === -1;
                                            let style = 'bg-white border-gray-100 text-gray-700 hover:border-red-200 hover:text-red-600';
                                            if (showExplanation) {
                                                if (isCorrect) style = 'bg-emerald-50 border-emerald-400 text-emerald-800';
                                                else if (isSelected && !isCorrect) style = 'bg-red-50 border-red-400 text-red-700';
                                                else style = 'bg-gray-50 border-gray-100 text-gray-400';
                                            } else if (isSelected) {
                                                style = 'bg-red-600 border-red-600 text-white';
                                            }

                                            return (
                                                <button
                                                    key={optIdx}
                                                    onClick={() => handleSelectOption(optIdx)}
                                                    disabled={showExplanation || selectedOption !== null}
                                                    className={`w-full p-7 rounded-[2rem] border-2 text-left text-[14px] font-bold italic transition-all flex items-center gap-5 ${style} ${!showExplanation && selectedOption === null ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'}`}
                                                >
                                                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black flex-shrink-0 ${showExplanation ? (isCorrect ? 'bg-emerald-500 text-white' : isSelected ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500') : 'bg-gray-100 text-gray-600'}`}>
                                                        {showExplanation && isCorrect ? <TfiCheck /> : showExplanation && isSelected && !isCorrect ? <TfiClose /> : String.fromCharCode(65 + optIdx)}
                                                    </span>
                                                    {opt}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Timed out */}
                                    {showExplanation && selectedOption === -1 && (
                                        <div className="mt-6 p-6 bg-red-50 border border-red-200 rounded-[1.5rem] flex items-center gap-4 text-red-700 text-[12px] font-black uppercase italic">
                                            <TfiTimer className="text-xl" /> Time's up! The correct answer is highlighted above.
                                        </div>
                                    )}

                                    {/* Explanation */}
                                    {showExplanation && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-5">
                                            <div className="p-8 bg-blue-50 border border-blue-100 rounded-[2rem]">
                                                <div className="text-[10px] font-black uppercase text-blue-600 tracking-widest italic mb-3">Explanation</div>
                                                <p className="text-[14px] text-blue-800 italic leading-relaxed">{currentQ?.explanation}</p>
                                            </div>
                                            <button
                                                onClick={handleNext}
                                                className="w-full py-7 rounded-[2rem] bg-gray-950 text-white text-[12px] font-black uppercase tracking-[0.5em] italic flex items-center justify-center gap-5 hover:bg-red-600 transition-all shadow-xl active:scale-[0.98]"
                                            >
                                                {currentQIdx + 1 >= quiz.questions.length ? <><TfiStatsUp /> VIEW MY REPORT</> : <>NEXT QUESTION <TfiAngleRight /></>}
                                            </button>
                                        </motion.div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}

                {/* ══════════════════════════════════════════════
                    PHASE 4: REPORT
                ══════════════════════════════════════════════ */}
                {phase === 'report' && (
                    <motion.div key="report" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        {loadingReport ? (
                            <div className="flex flex-col items-center justify-center py-48 bg-white rounded-[3rem] border border-gray-100 shadow-xl">
                                <div className="relative w-40 h-40 mb-12">
                                    <div className="absolute inset-0 border-r-4 border-red-600 rounded-full animate-spin" />
                                    <div className="absolute inset-6 border-l-4 border-gray-100 rounded-full animate-spin" style={{ animationDirection: 'reverse' }} />
                                    <div className="flex items-center justify-center h-full text-red-600 text-5xl animate-pulse"><TfiStatsUp /></div>
                                </div>
                                <p className="text-[13px] font-black uppercase text-gray-800 tracking-[1em] animate-pulse italic">Generating Your Report...</p>
                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.5em] italic mt-4">Analyzing performance · Calculating readiness</p>
                            </div>
                        ) : report && (
                            <div className="max-w-4xl mx-auto space-y-10">
                                {/* Verdict Banner */}
                                {(() => {
                                    const vs = VERDICT_STYLES[report.verdict] || VERDICT_STYLES['Needs Practice'];
                                    return (
                                        <div className={`p-16 ${vs.bg} border-2 ${vs.border} rounded-[3rem] relative overflow-hidden`}>
                                            <div className={`absolute inset-0 opacity-10 blur-[100px] ${vs.bg}`} />
                                            <div className="flex flex-col lg:flex-row items-center gap-16 relative z-10">
                                                {/* Score Gauge */}
                                                <div className="relative w-56 h-56 flex-shrink-0">
                                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                                        <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                                        <motion.circle cx="50" cy="50" r="44" fill="none"
                                                            stroke={report.readiness_score >= 80 ? '#10b981' : report.readiness_score >= 65 ? '#3b82f6' : report.readiness_score >= 45 ? '#f59e0b' : '#ef4444'}
                                                            strokeWidth="8" strokeLinecap="round"
                                                            initial={{ strokeDasharray: '0 276' }}
                                                            animate={{ strokeDasharray: `${(report.readiness_score / 100) * 276} 276` }}
                                                            transition={{ duration: 1.5, ease: 'easeOut' }}
                                                        />
                                                    </svg>
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className={`text-6xl font-black italic ${vs.text}`}>{report.readiness_score}</motion.span>
                                                        <span className="text-[10px] font-black text-white/50 uppercase tracking-widest mt-1">/ 100</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1 text-center lg:text-left">
                                                    <span className={`inline-block px-8 py-3 rounded-[2rem] border text-[13px] font-black uppercase italic tracking-widest mb-8 ${vs.badge}`}>{report.verdict}</span>
                                                    <p className="text-[16px] text-white/80 italic leading-relaxed mb-8">{report.verdict_explanation}</p>
                                                    <p className="text-[14px] text-white/60 italic leading-relaxed border-l-4 border-white/10 pl-8">{report.personalized_feedback}</p>
                                                    {report.estimated_days_to_ready > 0 && (
                                                        <div className="mt-8 inline-flex items-center gap-4 px-8 py-4 bg-white/10 rounded-[1.5rem] text-[12px] text-white font-black uppercase italic">
                                                            <TfiTimer className="animate-pulse" /> {report.estimated_days_to_ready} More Days to Be Ready
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* 3-Score Breakdown */}
                                <div className="grid grid-cols-3 gap-6">
                                    {[
                                        { label: 'Knowledge', score: report.knowledge_score, icon: <TfiLayers />, color: 'blue' },
                                        { label: 'Speed', score: report.speed_score, icon: <TfiTimer />, color: 'emerald' },
                                        { label: 'Integrity', score: report.integrity_score, icon: <TfiShield />, color: tabSwitches > 0 ? 'red' : 'emerald' },
                                    ].map((item, i) => {
                                        const c = { blue: ['text-blue-600', 'bg-blue-600'], emerald: ['text-emerald-600', 'bg-emerald-600'], red: ['text-red-600', 'bg-red-600'] }[item.color] || ['text-gray-600', 'bg-gray-600'];
                                        return (
                                            <div key={i} className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl text-center">
                                                <div className={`w-12 h-12 rounded-[1.2rem] mx-auto mb-6 flex items-center justify-center text-xl ${c[0]} bg-gray-50 border border-gray-100`}>{item.icon}</div>
                                                <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic mb-3">{item.label}</div>
                                                <div className={`text-5xl font-black italic ${c[0]}`}>{item.score}</div>
                                                <div className="text-[9px] text-gray-400 font-black uppercase italic">/100</div>
                                                <div className="mt-5 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <motion.div className={`h-full rounded-full ${c[1]}`} initial={{ width: 0 }} animate={{ width: `${item.score}%` }} transition={{ duration: 1, delay: 0.3 + i * 0.15 }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Q&A Summary */}
                                <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl">
                                    <h3 className="text-[11px] font-black uppercase text-gray-400 tracking-[0.5em] italic mb-10">Quiz Breakdown ({answers.filter(a => a.correct).length}/{answers.length} Correct)</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {answers.map((a, i) => (
                                            <div key={i} className={`w-12 h-12 rounded-[1.2rem] border-2 flex flex-col items-center justify-center transition-all ${a.correct ? 'bg-emerald-50 border-emerald-400' : 'bg-red-50 border-red-400'}`} title={`Q${i + 1}: ${a.topic} — ${a.correct ? 'Correct' : 'Wrong'} (${a.timeTaken}s)`}>
                                                <span className={`text-[10px] font-black ${a.correct ? 'text-emerald-600' : 'text-red-600'}`}>{a.correct ? '✓' : '✗'}</span>
                                                <span className="text-[8px] text-gray-400 font-black">Q{i + 1}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Strong + Weak Topics */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl">
                                        <h3 className="text-[11px] font-black uppercase text-emerald-600 tracking-[0.5em] italic mb-8 flex items-center gap-4"><TfiCheck /> Strong Topics</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {(report.strong_topics || []).map((t, i) => (
                                                <span key={i} className="px-5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] font-black uppercase text-emerald-700 italic">{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl">
                                        <h3 className="text-[11px] font-black uppercase text-red-600 tracking-[0.5em] italic mb-8 flex items-center gap-4"><TfiAlert /> Weak Topics</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {(report.weak_topics || []).map((t, i) => (
                                                <span key={i} className="px-5 py-2.5 bg-red-50 border border-red-200 rounded-xl text-[11px] font-black uppercase text-red-700 italic">{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Next Steps */}
                                <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl">
                                    <h3 className="text-[11px] font-black uppercase text-blue-600 tracking-[0.5em] italic mb-10 flex items-center gap-4"><TfiAngleRight /> Next Steps</h3>
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                                        {(report.next_steps || []).map((s, i) => (
                                            <div key={i} className="flex items-start gap-5 p-7 bg-blue-50 border border-blue-100 rounded-[2rem]">
                                                <span className="w-8 h-8 rounded-xl bg-blue-500 text-white text-[11px] font-black flex items-center justify-center flex-shrink-0">{i + 1}</span>
                                                <p className="text-[13px] text-blue-800 italic leading-relaxed">{s}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Motivational Closing */}
                                {report.motivational_closing && (
                                    <div className="p-12 bg-gray-950 rounded-[2.5rem] text-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-red-600/5 blur-[100px]" />
                                        <TfiBolt className="text-4xl text-red-600 mx-auto mb-6 animate-pulse relative z-10" />
                                        <p className="text-[18px] font-black text-white italic tracking-tight relative z-10">{report.motivational_closing}</p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-5">
                                    <button onClick={handleReset} className="flex-1 py-7 rounded-[2rem] border border-gray-200 text-[11px] font-black uppercase tracking-widest italic text-gray-500 hover:border-red-300 hover:text-red-600 transition-all flex items-center justify-center gap-4">
                                        <TfiReload /> Prep Another Role
                                    </button>
                                    <button
                                        onClick={() => navigate('/candidate/mock-interview', { state: { role, level } })}
                                        className="flex-[2] py-8 rounded-[2.5rem] bg-red-600 text-white text-[12px] font-black uppercase tracking-[0.5em] italic flex items-center justify-center gap-5 shadow-2xl hover:bg-gray-950 transition-all active:scale-[0.98]"
                                    >
                                        <TfiMicrophone className="animate-pulse" /> Practice in AI Mock Interview
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
