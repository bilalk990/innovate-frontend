import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TfiDownload, TfiPrinter, TfiCheck, TfiClose, TfiAlert } from 'react-icons/tfi';
import { toast } from 'sonner';
import useAuth from '../hooks/useAuth';

/**
 * Comprehensive Interview Report Component
 * Displays complete analysis including violations, performance, and recommendations
 */
export default function ComprehensiveReport({ interviewId, onClose }) {
    const { token } = useAuth();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
        fetchReport();
    }, [interviewId]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
            const response = await fetch(`${apiUrl}/interviews/${interviewId}/comprehensive-report/`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setReport(data);
            } else {
                toast.error('Failed to load report');
            }
        } catch (error) {
            console.error('Report fetch error:', error);
            toast.error('Error loading report');
        } finally {
            setLoading(false);
        }
    };

    const analyzePerformance = async () => {
        try {
            setAnalyzing(true);
            const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
            const response = await fetch(`${apiUrl}/interviews/${interviewId}/analyze-performance/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.ok) {
                toast.success('Performance analysis completed!');
                fetchReport(); // Refresh report
            } else {
                toast.error('Analysis failed');
            }
        } catch (error) {
            console.error('Analysis error:', error);
            toast.error('Error analyzing performance');
        } finally {
            setAnalyzing(false);
        }
    };

    const downloadReport = () => {
        const reportText = generateReportText(report);
        const blob = new Blob([reportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `interview-report-${interviewId}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Report downloaded');
    };

    const printReport = () => {
        window.print();
        toast.success('Opening print dialog');
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading report...</p>
                </div>
            </div>
        );
    }

    if (!report) {
        return null;
    }

    const { overall_assessment } = report;
    const recommendationColor = {
        'PROCEED': 'text-green-600 bg-green-50',
        'REVIEW': 'text-yellow-600 bg-yellow-50',
        'REJECT': 'text-red-600 bg-red-50'
    }[overall_assessment?.recommendation] || 'text-gray-600 bg-gray-50';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">Interview Comprehensive Report</h2>
                            <p className="text-red-100 mt-1">{report.title}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
                        >
                            <TfiClose className="text-xl" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Overall Assessment */}
                    <div className={`rounded-xl p-6 ${recommendationColor} border-2`}>
                        <h3 className="text-xl font-bold mb-2">Overall Assessment</h3>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="text-4xl font-bold">
                                {overall_assessment?.recommendation}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm opacity-80">{overall_assessment?.reason}</p>
                                <p className="text-xs mt-1 opacity-60">
                                    Integrity: {overall_assessment?.integrity_status}
                                </p>
                            </div>
                        </div>
                        {overall_assessment?.requires_hr_review && (
                            <div className="bg-white bg-opacity-50 rounded-lg p-3 flex items-center gap-2">
                                <TfiAlert className="text-xl" />
                                <span className="font-semibold">Requires HR Review</span>
                            </div>
                        )}
                    </div>

                    {/* Behavior Score */}
                    <div className="grid grid-cols-3 gap-4">
                        <MetricCard
                            label="Behavior Score"
                            value={`${report.behavior_score}/100`}
                            color={report.behavior_score >= 70 ? 'green' : report.behavior_score >= 50 ? 'yellow' : 'red'}
                        />
                        <MetricCard
                            label="Total Violations"
                            value={report.violations_summary.total}
                            color={report.violations_summary.total === 0 ? 'green' : report.violations_summary.total < 3 ? 'yellow' : 'red'}
                        />
                        <MetricCard
                            label="Tab Switches"
                            value={report.tab_switch_count}
                            color={report.tab_switch_count === 0 ? 'green' : report.tab_switch_count < 3 ? 'yellow' : 'red'}
                        />
                    </div>

                    {/* Violations Summary */}
                    <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Violations Breakdown</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {Object.entries(report.violations_summary.by_severity).map(([severity, count]) => (
                                <div key={severity} className="text-center">
                                    <div className={`text-2xl font-bold ${getSeverityColor(severity)}`}>
                                        {count}
                                    </div>
                                    <div className="text-xs text-gray-500">{severity}</div>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2">
                            {Object.entries(report.violations_summary.by_type).map(([type, count]) => (
                                <div key={type} className="flex items-center justify-between bg-white rounded-lg p-3">
                                    <span className="text-sm font-medium text-gray-700">
                                        {type.replace(/_/g, ' ')}
                                    </span>
                                    <span className="text-sm font-bold text-red-600">{count}x</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Performance Analysis */}
                    {report.performance_metrics?.analysis_text ? (
                        <div className="bg-blue-50 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Performance Analysis</h3>
                            <div className="prose prose-sm max-w-none">
                                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                                    {report.performance_metrics.analysis_text}
                                </pre>
                            </div>
                            <div className="mt-4 text-xs text-gray-500">
                                Analyzed: {new Date(report.performance_metrics.analyzed_at).toLocaleString()}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-blue-50 rounded-xl p-6 text-center">
                            <p className="text-gray-600 mb-4">Performance analysis not yet generated</p>
                            <button
                                onClick={analyzePerformance}
                                disabled={analyzing}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {analyzing ? 'Analyzing...' : 'Generate Analysis'}
                            </button>
                        </div>
                    )}

                    {/* Questions Summary */}
                    <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">
                            Questions ({report.total_questions})
                        </h3>
                        <div className="space-y-2">
                            {report.questions.map((q, index) => (
                                <div key={index} className="bg-white rounded-lg p-3">
                                    <div className="flex items-start gap-3">
                                        <span className="text-sm font-bold text-gray-400">Q{index + 1}</span>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-700">{q.text}</p>
                                            <div className="flex gap-2 mt-2">
                                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                                    {q.category}
                                                </span>
                                                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                                                    {q.difficulty}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-gray-50 p-6 rounded-b-xl flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                        Generated: {new Date(report.generated_at).toLocaleString()}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={printReport}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2"
                        >
                            <TfiPrinter /> Print
                        </button>
                        <button
                            onClick={downloadReport}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                        >
                            <TfiDownload /> Download
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function MetricCard({ label, value, color }) {
    const colorClasses = {
        green: 'text-green-600 bg-green-50',
        yellow: 'text-yellow-600 bg-yellow-50',
        red: 'text-red-600 bg-red-50',
        blue: 'text-blue-600 bg-blue-50'
    };

    return (
        <div className={`rounded-xl p-4 ${colorClasses[color]}`}>
            <div className="text-xs opacity-70 mb-1">{label}</div>
            <div className="text-2xl font-bold">{value}</div>
        </div>
    );
}

function getSeverityColor(severity) {
    switch (severity) {
        case 'CRITICAL': return 'text-red-600';
        case 'HIGH': return 'text-orange-600';
        case 'MEDIUM': return 'text-yellow-600';
        case 'LOW': return 'text-blue-600';
        default: return 'text-gray-600';
    }
}

function generateReportText(report) {
    return `
INTERVIEW COMPREHENSIVE REPORT
================================

Interview: ${report.title}
Date: ${new Date(report.scheduled_at).toLocaleString()}
Status: ${report.status}
Duration: ${report.duration_minutes} minutes

OVERALL ASSESSMENT
------------------
Recommendation: ${report.overall_assessment.recommendation}
Reason: ${report.overall_assessment.reason}
Behavior Score: ${report.behavior_score}/100
Integrity Status: ${report.overall_assessment.integrity_status}
Requires HR Review: ${report.overall_assessment.requires_hr_review ? 'YES' : 'NO'}

VIOLATIONS SUMMARY
------------------
Total Violations: ${report.violations_summary.total}
Tab Switches: ${report.tab_switch_count}

By Severity:
${Object.entries(report.violations_summary.by_severity).map(([s, c]) => `  ${s}: ${c}`).join('\n')}

By Type:
${Object.entries(report.violations_summary.by_type).map(([t, c]) => `  ${t.replace(/_/g, ' ')}: ${c}`).join('\n')}

PERFORMANCE ANALYSIS
--------------------
${report.performance_metrics?.analysis_text || 'Not yet analyzed'}

QUESTIONS (${report.total_questions})
---------
${report.questions.map((q, i) => `${i + 1}. ${q.text} [${q.category}, ${q.difficulty}]`).join('\n')}

Generated: ${new Date(report.generated_at).toLocaleString()}
`;
}
