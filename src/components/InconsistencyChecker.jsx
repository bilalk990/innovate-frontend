import React, { useState } from 'react';
import { TfiShield, TfiClose, TfiCheck, TfiAlert } from 'react-icons/tfi';
import { motion, AnimatePresence } from 'framer-motion';
import interviewService from '../services/interviewService';
import { toast } from 'sonner';

export default function InconsistencyChecker({ interviewId, candidateId }) {
    const [checking, setChecking] = useState(false);
    const [report, setReport] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const checkInconsistencies = async () => {
        setChecking(true);
        try {
            const response = await interviewService.checkInconsistencies(interviewId, {
                candidate_id: candidateId
            });

            setReport(response.data.inconsistency_report);
            setShowModal(true);
            toast.success('Inconsistency check complete!');
        } catch (error) {
            console.error('[Inconsistency] Check failed:', error);
            toast.error('Failed to check inconsistencies');
        } finally {
            setChecking(false);
        }
    };

    return (
        <>
            <button
                onClick={checkInconsistencies}
                disabled={checking}
                className="px-4 py-2 rounded-lg bg-orange-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
                <TfiShield />
                {checking ? 'Checking...' : 'Check Inconsistencies'}
            </button>

            <AnimatePresence>
                {showModal && report && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                                        <TfiShield className="text-orange-600 text-xl" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-gray-900 uppercase tracking-wider">
                                            Inconsistency Report
                                        </h2>
                                        <p className="text-xs text-gray-500 uppercase tracking-widest">
                                            Resume vs Interview Analysis
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                >
                                    <TfiClose />
                                </button>
                            </div>

                            {/* Integrity Score */}
                            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 mb-6 border border-orange-100">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                                        Integrity Score
                                    </span>
                                    <span className={`text-4xl font-black ${
                                        report.integrity_score >= 80 ? 'text-emerald-600' :
                                        report.integrity_score >= 60 ? 'text-yellow-600' :
                                        'text-red-600'
                                    }`}>
                                        {report.integrity_score}%
                                    </span>
                                </div>
                                <div className="w-full h-3 bg-white rounded-full overflow-hidden mt-4">
                                    <motion.div
                                        className={`h-full ${
                                            report.integrity_score >= 80 ? 'bg-emerald-600' :
                                            report.integrity_score >= 60 ? 'bg-yellow-600' :
                                            'bg-red-600'
                                        }`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${report.integrity_score}%` }}
                                        transition={{ duration: 1 }}
                                    />
                                </div>
                            </div>

                            {/* Inconsistencies Found */}
                            {report.inconsistencies && report.inconsistencies.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <TfiAlert className="text-red-600" />
                                        Flagged Inconsistencies
                                    </h3>
                                    <div className="space-y-3">
                                        {report.inconsistencies.map((item, index) => (
                                            <div key={index} className="bg-red-50 rounded-lg p-4 border border-red-100">
                                                <div className="flex items-start gap-3">
                                                    <TfiClose className="text-red-600 mt-1 flex-shrink-0" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-red-900 mb-1">
                                                            {item.type || 'Inconsistency'}
                                                        </p>
                                                        <p className="text-sm text-red-800 leading-relaxed">
                                                            {item.description || item}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Verified Claims */}
                            {report.verified_claims && report.verified_claims.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <TfiCheck className="text-emerald-600" />
                                        Verified Claims
                                    </h3>
                                    <div className="space-y-2">
                                        {report.verified_claims.map((claim, index) => (
                                            <div key={index} className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                                                <div className="flex items-center gap-2">
                                                    <TfiCheck className="text-emerald-600 flex-shrink-0" />
                                                    <p className="text-sm text-emerald-900">
                                                        {claim}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Summary */}
                            {report.summary && (
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                                        Summary
                                    </h3>
                                    <p className="text-sm text-gray-800 leading-relaxed">
                                        {report.summary}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
