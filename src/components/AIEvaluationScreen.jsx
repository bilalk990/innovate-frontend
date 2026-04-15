import React from 'react';
import { motion } from 'framer-motion';
import { TfiCheck, TfiClose, TfiShield, TfiWrite } from 'react-icons/tfi';

export default function AIEvaluationScreen({ evaluation, onClose }) {
    const getRecommendationColor = (rec) => {
        if (rec === 'HIRE') return 'bg-emerald-500 text-black';
        if (rec === 'MAYBE') return 'bg-amber-500 text-black';
        return 'bg-red-600 text-white';
    };

    const getRecommendationIcon = (rec) => {
        if (rec === 'HIRE') return '✅';
        if (rec === 'MAYBE') return '⚠️';
        return '❌';
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-500';
        if (score >= 60) return 'text-amber-500';
        return 'text-red-600';
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-8 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-6xl bg-gray-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-800 p-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)]" />
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                                <TfiShield className="text-4xl text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black uppercase tracking-widest text-white italic">
                                    AI Evaluation Complete
                                </h1>
                                <p className="text-white/70 text-sm font-bold uppercase tracking-wider mt-1">
                                    Comprehensive Interview Analysis
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                        >
                            <TfiClose className="text-2xl text-white" />
                        </button>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Overall Score */}
                    <div className="flex items-center justify-center gap-12">
                        <div className="relative">
                            <svg className="w-48 h-48 transform -rotate-90">
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="88"
                                    stroke="rgba(255,255,255,0.1)"
                                    strokeWidth="12"
                                    fill="none"
                                />
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="88"
                                    stroke={evaluation.overall_score >= 80 ? '#10b981' : evaluation.overall_score >= 60 ? '#f59e0b' : '#dc2626'}
                                    strokeWidth="12"
                                    fill="none"
                                    strokeDasharray={`${(evaluation.overall_score / 100) * 553} 553`}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-6xl font-black ${getScoreColor(evaluation.overall_score)}`}>
                                    {Math.round(evaluation.overall_score)}
                                </span>
                                <span className="text-white/50 text-sm font-bold uppercase tracking-wider">
                                    / 100
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 space-y-4">
                            {/* Recommendation Badge */}
                            <div className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl ${getRecommendationColor(evaluation.recommendation)} shadow-2xl`}>
                                <span className="text-3xl">{getRecommendationIcon(evaluation.recommendation)}</span>
                                <span className="text-xl font-black uppercase tracking-widest">
                                    {evaluation.recommendation === 'HIRE' ? 'Recommended for Hire' :
                                     evaluation.recommendation === 'MAYBE' ? 'Needs Review' :
                                     'Not Recommended'}
                                </span>
                            </div>

                            {/* Confidence Level */}
                            <div className="flex items-center gap-3 text-white/70">
                                <span className="text-sm font-bold uppercase tracking-wider">Confidence:</span>
                                <span className="text-lg font-black text-white uppercase">{evaluation.confidence || 'HIGH'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Score Breakdown */}
                    <div className="grid grid-cols-2 gap-6">
                        {[
                            { label: 'Technical Skills', score: evaluation.technical_score, weight: '40%', icon: '💻' },
                            { label: 'Communication', score: evaluation.communication_score, weight: '20%', icon: '💬' },
                            { label: 'Behavioral', score: evaluation.behavioral_score, weight: '20%', icon: '🎯' },
                            { label: 'Integrity', score: evaluation.integrity_score, weight: '20%', icon: '🛡️' }
                        ].map((item, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{item.icon}</span>
                                        <div>
                                            <h3 className="text-white font-black uppercase tracking-wider text-sm">
                                                {item.label}
                                            </h3>
                                            <p className="text-white/50 text-xs font-bold uppercase">
                                                Weight: {item.weight}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`text-3xl font-black ${getScoreColor(item.score)}`}>
                                        {Math.round(item.score)}
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${
                                            item.score >= 80 ? 'bg-emerald-500' :
                                            item.score >= 60 ? 'bg-amber-500' : 'bg-red-600'
                                        }`}
                                        style={{ width: `${item.score}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Violations Alert */}
                    {evaluation.violations_count > 0 && (
                        <div className="bg-red-900/20 border-2 border-red-600 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-3xl">⚠️</span>
                                <h3 className="text-red-500 font-black uppercase tracking-wider text-lg">
                                    {evaluation.violations_count} Integrity Violations Detected
                                </h3>
                            </div>
                            <div className="space-y-2">
                                {evaluation.violations?.map((v, i) => (
                                    <div key={i} className="flex items-start gap-3 text-white/70 text-sm">
                                        <span className="text-red-500">•</span>
                                        <span>
                                            <span className="font-bold text-white">{v.type}:</span> {v.description}
                                            <span className="text-white/50 ml-2">({new Date(v.timestamp).toLocaleTimeString()})</span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Strengths & Weaknesses */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* Strengths */}
                        <div className="bg-emerald-900/20 border border-emerald-600/30 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <TfiCheck className="text-2xl text-emerald-500" />
                                <h3 className="text-emerald-500 font-black uppercase tracking-wider">
                                    Strengths
                                </h3>
                            </div>
                            <ul className="space-y-2">
                                {evaluation.strengths?.map((s, i) => (
                                    <li key={i} className="flex items-start gap-2 text-white/70 text-sm">
                                        <span className="text-emerald-500 mt-1">✓</span>
                                        <span>{s}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Weaknesses */}
                        <div className="bg-amber-900/20 border border-amber-600/30 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <TfiWrite className="text-2xl text-amber-500" />
                                <h3 className="text-amber-500 font-black uppercase tracking-wider">
                                    Areas for Improvement
                                </h3>
                            </div>
                            <ul className="space-y-2">
                                {evaluation.weaknesses?.map((w, i) => (
                                    <li key={i} className="flex items-start gap-2 text-white/70 text-sm">
                                        <span className="text-amber-500 mt-1">→</span>
                                        <span>{w}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Summary */}
                    {evaluation.summary && (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h3 className="text-white font-black uppercase tracking-wider mb-3">
                                AI Summary
                            </h3>
                            <p className="text-white/70 leading-relaxed">
                                {evaluation.summary}
                            </p>
                        </div>
                    )}

                    {/* Next Steps */}
                    <div className="bg-gradient-to-r from-red-600/20 to-red-800/20 border border-red-600/30 rounded-2xl p-6">
                        <h3 className="text-white font-black uppercase tracking-wider mb-3">
                            Next Steps
                        </h3>
                        <p className="text-white/70">
                            {evaluation.recommendation === 'HIRE' && 'Proceed with offer letter and onboarding process.'}
                            {evaluation.recommendation === 'MAYBE' && 'Schedule follow-up interview or technical assessment.'}
                            {evaluation.recommendation === 'REJECT' && 'Send rejection email with constructive feedback.'}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 justify-end">
                        <button
                            onClick={onClose}
                            className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-black uppercase tracking-wider transition-all"
                        >
                            Close
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase tracking-wider transition-all shadow-lg"
                        >
                            Export PDF
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
