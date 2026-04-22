import React, { useState, useEffect } from 'react';
import { TfiStatsUp, TfiTarget, TfiCheck, TfiClose } from 'react-icons/tfi';
import { motion } from 'framer-motion';
import interviewService from '../services/interviewService';

export default function LiveQualityMeter({ interviewId, transcript, questionIndex, elapsedSeconds, isActive }) {
    const [quality, setQuality] = useState({
        score: 0,
        color: 'gray',
        signal: 'waiting',
        coaching_tip: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isActive || !transcript || transcript.length < 20) return;

        const timer = setInterval(() => {
            analyzeQuality();
        }, 10000); // Every 10 seconds

        return () => clearInterval(timer);
    }, [isActive, transcript, questionIndex]);

    const analyzeQuality = async () => {
        if (!interviewId || !transcript) return;

        setLoading(true);
        try {
            const response = await interviewService.getLiveQuality(interviewId, {
                transcript,
                question_index: questionIndex,
                elapsed_seconds: elapsedSeconds
            });

            const data = response.data.quality;
            setQuality({
                score: data.score || 0,
                color: getColorFromScore(data.score),
                signal: data.signal || 'on_track',
                coaching_tip: data.coaching_tip || ''
            });
        } catch (error) {
            console.error('[LiveQuality] Analysis failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const getColorFromScore = (score) => {
        if (score >= 70) return 'green';
        if (score >= 40) return 'yellow';
        return 'red';
    };

    const getBarColor = () => {
        switch (quality.color) {
            case 'green': return 'from-emerald-500 to-emerald-600';
            case 'yellow': return 'from-yellow-500 to-yellow-600';
            case 'red': return 'from-red-500 to-red-600';
            default: return 'from-gray-400 to-gray-500';
        }
    };

    const getSignalIcon = () => {
        switch (quality.signal) {
            case 'strong': return <TfiCheck className="text-emerald-500" />;
            case 'on_track': return <TfiTarget className="text-blue-500" />;
            case 'needs_improvement': return <TfiStatsUp className="text-yellow-500" />;
            case 'off_topic': return <TfiClose className="text-red-500" />;
            default: return <TfiTarget className="text-gray-400" />;
        }
    };

    if (!isActive) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl border border-gray-100 p-4 shadow-md"
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    {getSignalIcon()}
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Live Quality
                    </span>
                </div>
                <span className={`text-2xl font-black ${
                    quality.color === 'green' ? 'text-emerald-600' :
                    quality.color === 'yellow' ? 'text-yellow-600' :
                    quality.color === 'red' ? 'text-red-600' : 'text-gray-400'
                }`}>
                    {quality.score}%
                </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
                <motion.div
                    className={`h-full bg-gradient-to-r ${getBarColor()}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${quality.score}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            {/* Coaching Tip */}
            {quality.coaching_tip && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-blue-50 rounded-lg p-3 border border-blue-100"
                >
                    <p className="text-xs text-blue-900 leading-relaxed">
                        💡 <strong>Tip:</strong> {quality.coaching_tip}
                    </p>
                </motion.div>
            )}

            {loading && (
                <div className="text-xs text-gray-400 text-center mt-2">
                    Analyzing...
                </div>
            )}
        </motion.div>
    );
}
