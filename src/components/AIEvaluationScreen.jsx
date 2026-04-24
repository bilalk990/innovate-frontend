import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TfiCheck, TfiClose, TfiShield, TfiWrite, TfiTarget, TfiStatsUp, TfiBolt, TfiReload } from 'react-icons/tfi';
import useAuth from '../hooks/useAuth';
import evaluationService from '../services/evaluationService';

// Animated circular progress ring
function ScoreRing({ score, size = 192, stroke = 12, color }) {
    const r = (size / 2) - stroke;
    const circ = 2 * Math.PI * r;
    const dash = (score / 100) * circ;
    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
            <circle
                cx={size / 2} cy={size / 2} r={r}
                stroke={color}
                strokeWidth={stroke}
                fill="none"
                strokeDasharray={`${dash} ${circ}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)' }}
            />
        </svg>
    );
}

function ScoreBar({ score, color }) {
    return (
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(score, 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: color }}
            />
        </div>
    );
}

function getColor(score) {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#dc2626';
}

function getTextColor(score) {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-500';
}

const CRITERION_LABELS = {
    communication_clarity: 'Communication Clarity',
    response_depth: 'Response Depth',
    keyword_alignment: 'Keyword Alignment',
    resume_consistency: 'Resume Consistency',
    response_completeness: 'Response Completeness',
    confidence_indicators: 'Confidence Indicators',
    semantic_accuracy: 'Semantic Accuracy (AI)'
};

export default function AIEvaluationScreen({ evaluation, onClose }) {
    const printRef = useRef();
    const { token } = useAuth();

    // ── Deep AI Analysis state (features 28-31) ──
    const [behavioralData, setBehavioralData] = useState(null);
    const [behavioralLoading, setBehavioralLoading] = useState(false);
    const [integrityData, setIntegrityData] = useState(null);
    const [integrityLoading, setIntegrityLoading] = useState(false);
    const [cultureFitData, setCultureFitData] = useState(null);
    const [cultureFitLoading, setCultureFitLoading] = useState(false);
    const [execSummaryData, setExecSummaryData] = useState(null);
    const [execSummaryLoading, setExecSummaryLoading] = useState(false);

    const runBehavioralAnalysis = async () => {
        setBehavioralLoading(true);
        try {
            const transcript = evaluation?.transcript || evaluation?.summary || '';
            const res = await evaluationService.analyzeBehavioralTraits({ transcript });
            setBehavioralData(res.data);
        } catch { setBehavioralData({ error: 'Analysis failed. Please try again.' }); }
        setBehavioralLoading(false);
    };

    const runIntegrityCheck = async () => {
        setIntegrityLoading(true);
        try {
            const responses = evaluation?.responses || [evaluation?.summary || ''];
            const res = await evaluationService.checkIntegrity({ responses });
            setIntegrityData(res.data);
        } catch { setIntegrityData({ error: 'Integrity check failed.' }); }
        setIntegrityLoading(false);
    };

    const runCultureFit = async () => {
        setCultureFitLoading(true);
        try {
            const transcript = evaluation?.transcript || evaluation?.summary || '';
            const res = await evaluationService.analyzeCultureFit({ transcript });
            setCultureFitData(res.data);
        } catch { setCultureFitData({ error: 'Culture fit analysis failed.' }); }
        setCultureFitLoading(false);
    };

    const runExecutiveSummary = async () => {
        setExecSummaryLoading(true);
        try {
            const res = await evaluationService.generateExecutiveSummary({
                interview_data: { title: evaluation?.job_title || 'Interview' },
                evaluation_results: evaluation,
            });
            setExecSummaryData(res.data);
        } catch { setExecSummaryData({ error: 'Executive summary generation failed.' }); }
        setExecSummaryLoading(false);
    };

    // Feature 6: Follow-up Email state
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailDecision, setEmailDecision] = useState('selected');
    const [generatingEmail, setGeneratingEmail] = useState(false);
    const [generatedEmail, setGeneratedEmail] = useState(null);
    const [emailCopied, setEmailCopied] = useState(false);

    const generateFollowUpEmail = async () => {
        // Guard: require eval_id (the Evaluation MongoDB _id), NOT interview_id
        const evalId = evaluation?.eval_id;
        if (!evalId) {
            alert('Evaluation ID not found. Please reload the evaluation.');
            return;
        }
        setGeneratingEmail(true);
        setGeneratedEmail(null);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
        try {
            const res = await fetch(`${apiUrl}/evaluations/${evalId}/followup-email/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ decision: emailDecision, company_name: 'InnovAIte' })
            });
            if (res.ok) {
                const data = await res.json();
                setGeneratedEmail(data.email);
            } else {
                const err = await res.json().catch(() => ({}));
                alert(err.error || `Failed to generate email (${res.status})`);
            }
        } catch (e) {
            alert('Network error. Please try again.');
        }
        setGeneratingEmail(false);
    };

    const copyEmail = () => {
        if (!generatedEmail) return;
        const full = `${generatedEmail.subject}\n\n${generatedEmail.greeting}\n\n${generatedEmail.body}\n\n${generatedEmail.closing}`;
        navigator.clipboard.writeText(full);
        setEmailCopied(true);
        setTimeout(() => setEmailCopied(false), 2000);
    };

    // Guard
    if (!evaluation) return null;

    const {
        overall_score = 0,
        technical_score = 0,
        communication_score = 0,
        behavioral_score = 0,
        integrity_score = 100,
        recommendation = 'MAYBE',
        confidence = 'MEDIUM',
        violations = [],
        violations_count = 0,
        strengths = [],
        weaknesses = [],
        summary = '',
        behavioral_summary = '',
        integrity_notes = '',
        culture_fit_score = 0,
        ai_summary_used = false,
        criterion_results = [],
        resume_alignment_score = 0
    } = evaluation;

    const recConfig = {
        HIRE:   { label: 'Recommended for Hire',  bg: 'bg-emerald-500', text: 'text-black', icon: '✅', glow: 'shadow-[0_0_40px_#10b981]' },
        MAYBE:  { label: 'Needs Further Review',   bg: 'bg-amber-500',   text: 'text-black', icon: '⚠️', glow: 'shadow-[0_0_40px_#f59e0b]' },
        REJECT: { label: 'Not Recommended',        bg: 'bg-red-600',     text: 'text-white', icon: '❌', glow: 'shadow-[0_0_40px_#dc2626]' }
    };
    const rec = recConfig[recommendation] || recConfig.MAYBE;

    const scoreBreakdown = [
        { label: 'Technical Skills',   score: technical_score,     icon: '💻', detail: 'Based on semantic accuracy, keyword alignment, response depth & resume consistency' },
        { label: 'Communication',      score: communication_score,  icon: '💬', detail: 'Based on speech fluency, clarity of expression & completeness of answers' },
        { label: 'Behavioral',         score: behavioral_score,     icon: '🎯', detail: 'Based on confidence indicators, assertive language & AI behavioral trait analysis' },
        { label: 'Integrity',          score: integrity_score,      icon: '🛡️', detail: `Proctoring score. Violations: ${violations_count}. Deducted 10pts per incident.` }
    ];

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-start justify-center p-4 overflow-y-auto">
            {/* Print Styles */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #evaluation-print-content,
                    #evaluation-print-content * {
                        visibility: visible;
                    }
                    #evaluation-print-content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        background: white !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    /* Ensure all content is visible */
                    .overflow-y-auto {
                        overflow: visible !important;
                        max-height: none !important;
                    }
                    /* Fix colors for print */
                    * {
                        color-adjust: exact !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    /* Page breaks */
                    .page-break-avoid {
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }
                }
            `}</style>
            
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                id="evaluation-print-content"
                ref={printRef}
                className="w-full max-w-5xl bg-gray-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-6"
            >
                {/* ── HEADER ── */}
                <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-800 p-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                                <TfiShield className="text-4xl text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black uppercase tracking-widest text-white italic">
                                    InnovAIte Evaluation Report
                                </h1>
                                <p className="text-white/60 text-xs font-bold uppercase tracking-wider mt-1 flex items-center gap-2">
                                    {ai_summary_used && <span className="bg-white/20 px-2 py-0.5 rounded text-white/90">🤖 AI-Enhanced</span>}
                                    XAI Rule-Based Analysis · Confidence: {confidence}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all border border-white/10 no-print"
                        >
                            <TfiClose className="text-xl text-white" />
                        </button>
                    </div>
                </div>

                <div className="p-8 space-y-8">

                    {/* ── OVERALL SCORE + RECOMMENDATION ── */}
                    <div className="flex flex-col md:flex-row items-center gap-8 bg-white/3 border border-white/10 rounded-2xl p-8">
                        {/* Ring */}
                        <div className="relative flex-shrink-0">
                            <ScoreRing score={overall_score} color={getColor(overall_score)} />
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className={`text-5xl font-black ${getTextColor(overall_score)}`}
                                >
                                    {Math.round(overall_score)}
                                </motion.span>
                                <span className="text-white/40 text-xs font-bold uppercase tracking-wider">/ 100</span>
                            </div>
                        </div>

                        {/* Recommendation + meta */}
                        <div className="flex-1 space-y-4">
                            <div className={`inline-flex items-center gap-3 px-6 py-4 rounded-2xl ${rec.bg} ${rec.text} ${rec.glow}`}>
                                <span className="text-2xl">{rec.icon}</span>
                                <span className="text-lg font-black uppercase tracking-wider">{rec.label}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                {culture_fit_score > 0 && (
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                        <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Culture Fit</p>
                                        <p className={`text-2xl font-black ${getTextColor(culture_fit_score)}`}>{Math.round(culture_fit_score)}%</p>
                                    </div>
                                )}
                                {resume_alignment_score > 0 && (
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                        <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Job Fit</p>
                                        <p className={`text-2xl font-black ${getTextColor(resume_alignment_score)}`}>{Math.round(resume_alignment_score)}%</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── 4 CATEGORY SCORES ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {scoreBreakdown.map((item, i) => (
                            <motion.div
                                key={item.label}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{item.icon}</span>
                                        <span className="text-white font-black uppercase tracking-wider text-sm">{item.label}</span>
                                    </div>
                                    <span className={`text-3xl font-black ${getTextColor(item.score)}`}>
                                        {Math.round(item.score)}
                                    </span>
                                </div>
                                <ScoreBar score={item.score} color={getColor(item.score)} />
                                <p className="text-white/40 text-xs leading-relaxed">{item.detail}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* ── VIOLATIONS ALERT ── */}
                    <AnimatePresence>
                        {violations_count > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-red-950/40 border-2 border-red-600/60 rounded-2xl p-6"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-3xl">🚨</span>
                                    <div>
                                        <h3 className="text-red-400 font-black uppercase tracking-wider">
                                            {violations_count} Integrity Violation{violations_count > 1 ? 's' : ''} Detected
                                        </h3>
                                        {integrity_notes && (
                                            <p className="text-red-400/60 text-xs mt-1">{integrity_notes}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {violations.map((v, i) => (
                                        <div key={i} className="flex items-start gap-3 bg-red-900/20 rounded-xl px-4 py-2 border border-red-800/30">
                                            <span className="text-red-500 mt-0.5">⚠</span>
                                            <div className="flex-1 min-w-0">
                                                <span className="font-black text-red-400 text-xs uppercase">{v.type}: </span>
                                                <span className="text-white/70 text-xs">{v.description}</span>
                                                {v.severity && (
                                                    <span className={`ml-2 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${v.severity === 'HIGH' ? 'bg-red-600 text-white' : 'bg-amber-600/50 text-amber-300'}`}>
                                                        {v.severity}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-white/30 text-[10px] flex-shrink-0">
                                                {v.timestamp ? new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── XAI CRITERION BREAKDOWN ── */}
                    {criterion_results.length > 0 && (
                        <div className="bg-white/3 border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <TfiStatsUp className="text-2xl text-blue-400" />
                                <h3 className="text-white font-black uppercase tracking-wider">XAI Detailed Breakdown</h3>
                                <span className="text-blue-400/60 text-xs ml-auto">Each criterion explained transparently</span>
                            </div>
                            <div className="space-y-4">
                                {criterion_results.map((cr, i) => {
                                    const pct = Math.round((cr.score / (cr.max_score || 10)) * 100);
                                    return (
                                        <div key={i} className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-white/80 text-xs font-bold uppercase tracking-wider">
                                                    {CRITERION_LABELS[cr.criterion] || cr.criterion}
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-white/40 text-[10px]">Weight ×{cr.weight}</span>
                                                    <span className={`text-sm font-black ${getTextColor(pct)}`}>{pct}%</span>
                                                </div>
                                            </div>
                                            <ScoreBar score={pct} color={getColor(pct)} />
                                            {cr.explanation && (
                                                <p className="text-white/35 text-[11px] leading-relaxed italic">{cr.explanation.split('|')[0]}</p>
                                            )}
                                            {cr.evidence?.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {cr.evidence.slice(0, 2).map((ev, j) => (
                                                        <span key={j} className="text-[10px] bg-white/5 border border-white/10 rounded px-2 py-0.5 text-white/50">{ev.slice(0, 80)}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── BEHAVIORAL AI ANALYSIS ── */}
                    {behavioral_summary && (
                        <div className="bg-blue-950/20 border border-blue-600/30 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-2xl">🧠</span>
                                <h3 className="text-blue-400 font-black uppercase tracking-wider">AI Behavioral Analysis</h3>
                            </div>
                            <p className="text-white/70 text-sm leading-relaxed">{behavioral_summary}</p>
                        </div>
                    )}

                    {/* ── STRENGTHS & WEAKNESSES ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-emerald-950/20 border border-emerald-600/30 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <TfiCheck className="text-xl text-emerald-400" />
                                <h3 className="text-emerald-400 font-black uppercase tracking-wider">Strengths</h3>
                            </div>
                            <ul className="space-y-3">
                                {strengths.map((s, i) => (
                                    <li key={i} className="flex items-start gap-2 text-white/70 text-sm">
                                        <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
                                        <span>{s}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-amber-950/20 border border-amber-600/30 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <TfiWrite className="text-xl text-amber-400" />
                                <h3 className="text-amber-400 font-black uppercase tracking-wider">Areas to Improve</h3>
                            </div>
                            <ul className="space-y-3">
                                {weaknesses.map((w, i) => (
                                    <li key={i} className="flex items-start gap-2 text-white/70 text-sm">
                                        <span className="text-amber-400 mt-0.5 flex-shrink-0">→</span>
                                        <span>{w}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* ── AI SUMMARY ── */}
                    {summary && (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <TfiTarget className="text-xl text-white/60" />
                                <h3 className="text-white font-black uppercase tracking-wider">AI Summary</h3>
                                {ai_summary_used && (
                                    <span className="text-[10px] bg-blue-600/30 border border-blue-500/30 text-blue-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider ml-auto">
                                        GPT-Enhanced
                                    </span>
                                )}
                            </div>
                            <p className="text-white/70 text-sm leading-relaxed">{summary}</p>
                        </div>
                    )}

                    {/* ── NEXT STEPS ── */}
                    <div className={`rounded-2xl p-6 border ${
                        recommendation === 'HIRE' ? 'bg-emerald-950/20 border-emerald-600/30' :
                        recommendation === 'MAYBE' ? 'bg-amber-950/20 border-amber-600/30' :
                        'bg-red-950/20 border-red-600/30'
                    }`}>
                        <h3 className="text-white font-black uppercase tracking-wider mb-2">Recommended Next Steps</h3>
                        <p className="text-white/70 text-sm leading-relaxed">
                            {recommendation === 'HIRE' && '✅ Proceed with offer letter and onboarding. Share evaluation with candidate for transparency.'}
                            {recommendation === 'MAYBE' && '⚠️ Schedule a follow-up technical interview or take-home assessment before making a final decision.'}
                            {recommendation === 'REJECT' && '❌ Send a professional rejection email. Consider sharing constructive feedback with the candidate.'}
                        </p>
                    </div>

                    {/* ── DEEP AI ANALYSIS PANELS (Features 28–31) ── */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <TfiBolt className="text-xl text-purple-400" />
                            <h3 className="text-white font-black uppercase tracking-wider text-sm">Deep AI Analysis Suite</h3>
                            <span className="text-purple-400/50 text-[10px] ml-auto italic">On-demand • Powered by Gemini AI</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Behavioral Traits Panel */}
                            <div className="bg-purple-950/20 border border-purple-600/30 rounded-2xl p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">🧠</span>
                                        <h4 className="text-purple-300 font-black uppercase tracking-wider text-xs">Behavioral Traits</h4>
                                    </div>
                                    {!behavioralData && (
                                        <button onClick={runBehavioralAnalysis} disabled={behavioralLoading}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-[10px] font-black uppercase transition-all">
                                            {behavioralLoading ? <TfiReload className="animate-spin" /> : <TfiBolt />}
                                            {behavioralLoading ? 'Analyzing...' : 'Run Analysis'}
                                        </button>
                                    )}
                                    {behavioralData && !behavioralData.error && (
                                        <button onClick={() => setBehavioralData(null)} className="text-white/30 hover:text-white/70 text-[10px]">↺ Reset</button>
                                    )}
                                </div>
                                {!behavioralData && !behavioralLoading && (
                                    <p className="text-white/30 text-[11px] italic">Click to detect confidence, assertiveness, leadership signals from transcript.</p>
                                )}
                                {behavioralData?.error && <p className="text-red-400 text-xs">{behavioralData.error}</p>}
                                {behavioralData && !behavioralData.error && (
                                    <div className="space-y-2 mt-2">
                                        {behavioralData.traits?.slice(0, 4).map((t, i) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <span className="text-white/70 text-[11px] capitalize">{typeof t === 'string' ? t : t.trait || t.name}</span>
                                                {typeof t === 'object' && t.score != null && (
                                                    <span className={`text-[11px] font-black ${t.score >= 70 ? 'text-emerald-400' : t.score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{t.score}%</span>
                                                )}
                                            </div>
                                        ))}
                                        {behavioralData.summary && <p className="text-white/50 text-[10px] italic border-t border-white/10 pt-2 mt-2">{behavioralData.summary}</p>}
                                    </div>
                                )}
                            </div>

                            {/* Integrity / Plagiarism Panel */}
                            <div className="bg-orange-950/20 border border-orange-600/30 rounded-2xl p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">🔍</span>
                                        <h4 className="text-orange-300 font-black uppercase tracking-wider text-xs">Integrity Check</h4>
                                    </div>
                                    {!integrityData && (
                                        <button onClick={runIntegrityCheck} disabled={integrityLoading}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-lg text-[10px] font-black uppercase transition-all">
                                            {integrityLoading ? <TfiReload className="animate-spin" /> : <TfiBolt />}
                                            {integrityLoading ? 'Checking...' : 'Check Now'}
                                        </button>
                                    )}
                                    {integrityData && !integrityData.error && (
                                        <button onClick={() => setIntegrityData(null)} className="text-white/30 hover:text-white/70 text-[10px]">↺ Reset</button>
                                    )}
                                </div>
                                {!integrityData && !integrityLoading && (
                                    <p className="text-white/30 text-[11px] italic">Detect AI-generated content, plagiarism, and rehearsed responses.</p>
                                )}
                                {integrityData?.error && <p className="text-red-400 text-xs">{integrityData.error}</p>}
                                {integrityData && !integrityData.error && (
                                    <div className="space-y-2 mt-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-white/70 text-[11px]">Integrity Score</span>
                                            <span className={`text-lg font-black ${integrityData.integrity_score >= 80 ? 'text-emerald-400' : integrityData.integrity_score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>{integrityData.integrity_score ?? '—'}/100</span>
                                        </div>
                                        {integrityData.red_flags?.length > 0 && (
                                            <div className="space-y-1">
                                                {integrityData.red_flags.slice(0, 3).map((f, i) => (
                                                    <div key={i} className="text-[10px] text-orange-300 flex items-start gap-1.5"><span>⚠</span>{typeof f === 'string' ? f : f.flag || f.description}</div>
                                                ))}
                                            </div>
                                        )}
                                        {integrityData.notes && <p className="text-white/40 text-[10px] italic border-t border-white/10 pt-2 mt-1">{integrityData.notes}</p>}
                                    </div>
                                )}
                            </div>

                            {/* Culture Fit Panel */}
                            <div className="bg-teal-950/20 border border-teal-600/30 rounded-2xl p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">🌱</span>
                                        <h4 className="text-teal-300 font-black uppercase tracking-wider text-xs">Culture Fit</h4>
                                    </div>
                                    {!cultureFitData && (
                                        <button onClick={runCultureFit} disabled={cultureFitLoading}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg text-[10px] font-black uppercase transition-all">
                                            {cultureFitLoading ? <TfiReload className="animate-spin" /> : <TfiBolt />}
                                            {cultureFitLoading ? 'Analyzing...' : 'Analyze Fit'}
                                        </button>
                                    )}
                                    {cultureFitData && !cultureFitData.error && (
                                        <button onClick={() => setCultureFitData(null)} className="text-white/30 hover:text-white/70 text-[10px]">↺ Reset</button>
                                    )}
                                </div>
                                {!cultureFitData && !cultureFitLoading && (
                                    <p className="text-white/30 text-[11px] italic">Measure alignment with company values: innovation, teamwork, growth mindset.</p>
                                )}
                                {cultureFitData?.error && <p className="text-red-400 text-xs">{cultureFitData.error}</p>}
                                {cultureFitData && !cultureFitData.error && (
                                    <div className="space-y-2 mt-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-white/70 text-[11px]">Culture Fit Score</span>
                                            <span className={`text-lg font-black ${cultureFitData.culture_fit_score >= 70 ? 'text-teal-400' : 'text-amber-400'}`}>{cultureFitData.culture_fit_score ?? '—'}/100</span>
                                        </div>
                                        {cultureFitData.aligned_values?.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {cultureFitData.aligned_values.slice(0, 3).map((v, i) => (
                                                    <span key={i} className="text-[9px] px-2 py-0.5 bg-teal-900/50 border border-teal-600/30 text-teal-300 rounded-full font-bold">✓ {v}</span>
                                                ))}
                                            </div>
                                        )}
                                        {cultureFitData.misaligned_values?.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {cultureFitData.misaligned_values.slice(0, 2).map((v, i) => (
                                                    <span key={i} className="text-[9px] px-2 py-0.5 bg-red-900/30 border border-red-600/30 text-red-300 rounded-full font-bold">✗ {v}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Executive Summary Panel */}
                            <div className="bg-blue-950/20 border border-blue-600/30 rounded-2xl p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">📋</span>
                                        <h4 className="text-blue-300 font-black uppercase tracking-wider text-xs">Executive Summary</h4>
                                    </div>
                                    {!execSummaryData && (
                                        <button onClick={runExecutiveSummary} disabled={execSummaryLoading}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-[10px] font-black uppercase transition-all">
                                            {execSummaryLoading ? <TfiReload className="animate-spin" /> : <TfiBolt />}
                                            {execSummaryLoading ? 'Generating...' : 'Generate'}
                                        </button>
                                    )}
                                    {execSummaryData && !execSummaryData.error && (
                                        <button onClick={() => setExecSummaryData(null)} className="text-white/30 hover:text-white/70 text-[10px]">↺ Reset</button>
                                    )}
                                </div>
                                {!execSummaryData && !execSummaryLoading && (
                                    <p className="text-white/30 text-[11px] italic">One-paragraph C-suite ready summary to share with leadership.</p>
                                )}
                                {execSummaryData?.error && <p className="text-red-400 text-xs">{execSummaryData.error}</p>}
                                {execSummaryData && !execSummaryData.error && (
                                    <p className="text-white/70 text-[11px] leading-relaxed italic mt-1">
                                        "{execSummaryData.summary || execSummaryData.executive_summary}"
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── ACTION BUTTONS ── */}
                    <div className="flex gap-3 justify-end pt-2 flex-wrap no-print">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl font-black uppercase tracking-wider transition-all border border-white/10 text-sm"
                        >
                            Close
                        </button>
                        <button
                            onClick={() => setShowEmailModal(true)}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-wider transition-all shadow-lg shadow-blue-600/20 text-sm"
                        >
                            ✉️ Follow-up Email
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase tracking-wider transition-all shadow-lg shadow-red-600/20 text-sm"
                        >
                            Export PDF
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* ── Feature 6: Follow-up Email Modal ── */}
            <AnimatePresence>
            {showEmailModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center p-6"
                    style={{ background: 'rgba(0,0,0,0.85)' }}
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-8 space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-white font-black uppercase tracking-widest text-sm">AI Follow-up Email Generator</h2>
                            <button onClick={() => { setShowEmailModal(false); setGeneratedEmail(null); }}
                                className="text-white/50 hover:text-white transition-colors">
                                <TfiClose />
                            </button>
                        </div>

                        {/* Decision Selector */}
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {[
                                { value: 'selected', label: '✅ Selected', color: 'emerald' },
                                { value: 'next_round', label: '➡️ Next Round', color: 'blue' },
                                { value: 'hold', label: '⏸️ On Hold', color: 'amber' },
                                { value: 'rejected', label: '❌ Rejected', color: 'red' },
                            ].map(opt => (
                                <button key={opt.value}
                                    onClick={() => setEmailDecision(opt.value)}
                                    className={`py-3 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                                        emailDecision === opt.value
                                            ? `border-${opt.color}-500 bg-${opt.color}-900/40 text-${opt.color}-300`
                                            : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10'
                                    }`}
                                >{opt.label}</button>
                            ))}
                        </div>

                        <button
                            onClick={generateFollowUpEmail}
                            disabled={generatingEmail}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-black uppercase tracking-wider transition-all"
                        >
                            {generatingEmail ? '⏳ Generating...' : '✨ Generate Email with AI'}
                        </button>

                        {generatedEmail && (
                            <div className="space-y-4">
                                <div className="bg-white/5 rounded-xl p-5 border border-white/10 space-y-3">
                                    <p className="text-xs font-black text-white/50 uppercase tracking-wider">Subject</p>
                                    <p className="text-white font-semibold">{generatedEmail.subject}</p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-5 border border-white/10 space-y-3">
                                    <p className="text-xs font-black text-white/50 uppercase tracking-wider">Email Body</p>
                                    <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">
                                        {generatedEmail.greeting}{'\n\n'}{generatedEmail.body}{'\n\n'}{generatedEmail.closing}
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={copyEmail}
                                        className={`flex-1 py-3 rounded-xl font-black uppercase tracking-wider text-sm transition-all ${
                                            emailCopied ? 'bg-emerald-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                                        }`}>
                                        {emailCopied ? '✓ Copied!' : '📋 Copy to Clipboard'}
                                    </button>
                                    <button onClick={generateFollowUpEmail}
                                        className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-black uppercase tracking-wider text-sm transition-all">
                                        🔄 Regenerate
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
}
