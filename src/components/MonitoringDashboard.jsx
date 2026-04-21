import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TfiShield, TfiAlert, TfiEye, TfiUser, TfiMobile } from 'react-icons/tfi';

/**
 * Real-time Monitoring Dashboard for Recruiters
 * Displays violations, behavior score, and detection stats
 */
export default function MonitoringDashboard({ 
    violations = [], 
    detectionStats = {}, 
    behaviorScore = 100,
    isVisible = true 
}) {
    if (!isVisible) return null;

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'CRITICAL': return 'bg-red-600 text-white';
            case 'HIGH': return 'bg-orange-500 text-white';
            case 'MEDIUM': return 'bg-yellow-500 text-white';
            case 'LOW': return 'bg-blue-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-yellow-500';
        if (score >= 40) return 'text-orange-500';
        return 'text-red-500';
    };

    const recentViolations = violations.slice(-5).reverse();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <TfiShield className="text-2xl text-red-600" />
                    <h3 className="text-xl font-bold text-gray-800">Interview Monitoring</h3>
                </div>
                <div className="text-right">
                    <div className="text-sm text-gray-500">Behavior Score</div>
                    <div className={`text-3xl font-bold ${getScoreColor(behaviorScore)}`}>
                        {behaviorScore}/100
                    </div>
                </div>
            </div>

            {/* Detection Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={<TfiAlert />}
                    label="Total Violations"
                    value={violations.length}
                    color="text-red-600"
                />
                <StatCard
                    icon={<TfiMobile />}
                    label="Phone Detected"
                    value={detectionStats.phoneDetected ? 'YES' : 'NO'}
                    color={detectionStats.phoneDetected ? 'text-red-600' : 'text-green-600'}
                />
                <StatCard
                    icon={<TfiUser />}
                    label="Multiple Persons"
                    value={detectionStats.multiplePersons ? 'YES' : 'NO'}
                    color={detectionStats.multiplePersons ? 'text-red-600' : 'text-green-600'}
                />
                <StatCard
                    icon={<TfiEye />}
                    label="Gaze Direction"
                    value={detectionStats.gazeDirection || 'CENTER'}
                    color="text-blue-600"
                />
            </div>

            {/* Eye Tracking Stats */}
            {detectionStats.eyeTrackingActive && (
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-3">Eye Tracking Analysis</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <div className="text-gray-500">Look Away Count</div>
                            <div className="text-lg font-bold text-gray-800">
                                {detectionStats.lookAwayCount || 0}
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-500">Head Pose</div>
                            <div className="text-lg font-bold text-gray-800">
                                {detectionStats.headPose ? 
                                    `Y:${Math.round(detectionStats.headPose.yaw)}° P:${Math.round(detectionStats.headPose.pitch)}°` 
                                    : 'N/A'}
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-500">Suspicious Score</div>
                            <div className={`text-lg font-bold ${getScoreColor(100 - (detectionStats.suspiciousBehaviorScore || 0))}`}>
                                {detectionStats.suspiciousBehaviorScore || 0}/100
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Violations */}
            <div>
                <h4 className="font-semibold text-gray-700 mb-3">Recent Violations</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    <AnimatePresence>
                        {recentViolations.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                <TfiShield className="text-4xl mx-auto mb-2 opacity-50" />
                                <p>No violations detected</p>
                            </div>
                        ) : (
                            recentViolations.map((violation, index) => (
                                <motion.div
                                    key={`${violation.timestamp}-${index}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className={`p-3 rounded-lg ${getSeverityColor(violation.severity)} bg-opacity-10 border-l-4`}
                                    style={{ borderLeftColor: getSeverityColor(violation.severity).includes('red') ? '#dc2626' : '#f59e0b' }}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${getSeverityColor(violation.severity)}`}>
                                                    {violation.severity}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(violation.timestamp).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-gray-800">
                                                {violation.type.replace(/_/g, ' ')}
                                            </p>
                                            <p className="text-xs text-gray-600 mt-1">
                                                {violation.description}
                                            </p>
                                            {violation.confidence > 0 && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Confidence: {violation.confidence}%
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Objects Detected */}
            {detectionStats.objectsDetected && detectionStats.objectsDetected.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Objects in Frame</h4>
                    <div className="flex flex-wrap gap-2">
                        {detectionStats.objectsDetected.map((obj, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                            >
                                {obj.class} ({Math.round(obj.confidence * 100)}%)
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}

function StatCard({ icon, label, value, color }) {
    return (
        <div className="bg-gray-50 rounded-lg p-4">
            <div className={`text-2xl mb-2 ${color}`}>{icon}</div>
            <div className="text-xs text-gray-500 mb-1">{label}</div>
            <div className={`text-lg font-bold ${color}`}>{value}</div>
        </div>
    );
}
