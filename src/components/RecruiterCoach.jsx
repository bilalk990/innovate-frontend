import React, { useState, useEffect } from 'react';
import { TfiBolt, TfiTarget, TfiLightbulb } from 'react-icons/tfi';
import { motion } from 'framer-motion';
import interviewService from '../services/interviewService';

export default function RecruiterCoach({ interviewId, transcript, currentQuestion, candidatePerformance }) {
    const [coaching, setCoaching] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (transcript && transcript.length > 100) {
            const timer = setTimeout(() => {
                getCoaching();
            }, 15000); // Every 15 seconds

            return () => clearTimeout(timer);
        }
    }, [transcript]);

    const getCoaching = async () => {
        if (!interviewId || !transcript) return;

        setLoading(true);
        try {
            const response = await interviewService.getRecruiterCoaching(interviewId, {
                transcript,
                current_question: currentQuestion,
                candidate_performance: candidatePerformance || {}
            });

            setCoaching(response.data.coaching);
        } catch (error) {
            console.error('[RecruiterCoach] Failed:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!coaching) return null;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-100 p-4 shadow-lg"
        >
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
                    <TfiBolt className="text-white" />
                </div>
                <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                    AI Coach
                </h3>
            </div>

            {/* Performance Signal */}
            {coaching.performance_signal && (
                <div className={`rounded-lg p-3 mb-3 ${
                    coaching.performance_signal === 'strong' ? 'bg-emerald-100 border border-emerald-200' :
                    coaching.performance_signal === 'moderate' ? 'bg-yellow-100 border border-yellow-200' :
                    'bg-red-100 border border-red-200'
                }`}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-1">
                        Performance: {coaching.performance_signal}
                    </p>
                </div>
            )}

            {/* Suggested Follow-up Questions */}
            {coaching.suggested_questions && coaching.suggested_questions.length > 0 && (
                <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                        <TfiTarget className="text-purple-600" />
                        <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                            Suggested Questions
                        </span>
                    </div>
                    <div className="space-y-2">
                        {coaching.suggested_questions.slice(0, 3).map((q, index) => (
                            <div key={index} className="bg-white rounded-lg p-3 border border-purple-100">
                                <p className="text-sm text-gray-800 leading-relaxed mb-1">
                                    {q.question || q}
                                </p>
                                {q.why && (
                                    <p className="text-xs text-purple-700 italic">
                                        Why: {q.why}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Coaching Tip */}
            {coaching.coaching_tip && (
                <div className="bg-blue-100 rounded-lg p-3 border border-blue-200">
                    <div className="flex items-start gap-2">
                        <TfiLightbulb className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-900 leading-relaxed">
                            <strong>Tip:</strong> {coaching.coaching_tip}
                        </p>
                    </div>
                </div>
            )}

            {loading && (
                <div className="text-xs text-purple-600 text-center mt-2">
                    Analyzing...
                </div>
            )}
        </motion.div>
    );
}
