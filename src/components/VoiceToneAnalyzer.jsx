import React, { useState, useEffect, useRef } from 'react';
import { TfiMicrophone, TfiPulse, TfiStatsUp } from 'react-icons/tfi';
import { motion } from 'framer-motion';
import interviewService from '../services/interviewService';
import { toast } from 'sonner';

export default function VoiceToneAnalyzer({ interviewId, isActive }) {
    const [voiceMetrics, setVoiceMetrics] = useState({
        pitch: 0,
        volume: 0,
        clarity: 0,
        stress: 0,
        confidence: 50
    });
    const [analysis, setAnalysis] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);
    const animationFrameRef = useRef(null);

    // Initialize Web Audio API
    useEffect(() => {
        if (!isActive) return;

        const initAudio = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
                const source = audioContextRef.current.createMediaStreamSource(stream);
                
                analyserRef.current = audioContextRef.current.createAnalyser();
                analyserRef.current.fftSize = 2048;
                
                const bufferLength = analyserRef.current.frequencyBinCount;
                dataArrayRef.current = new Uint8Array(bufferLength);
                
                source.connect(analyserRef.current);
                
                // Start analyzing
                analyzeVoice();
            } catch (error) {
                console.error('[VoiceTone] Failed to initialize audio:', error);
                toast.error('Microphone access required for voice analysis');
            }
        };

        initAudio();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, [isActive]);

    // Real-time voice analysis
    const analyzeVoice = () => {
        if (!analyserRef.current || !dataArrayRef.current) return;

        analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);

        // Calculate metrics
        const volume = calculateVolume(dataArrayRef.current);
        const pitch = calculatePitch(dataArrayRef.current);
        const clarity = calculateClarity(dataArrayRef.current);
        const stress = calculateStress(volume, pitch);
        const confidence = calculateConfidence(volume, pitch, clarity);

        setVoiceMetrics({
            pitch: Math.round(pitch),
            volume: Math.round(volume),
            clarity: Math.round(clarity),
            stress: Math.round(stress),
            confidence: Math.round(confidence)
        });

        animationFrameRef.current = requestAnimationFrame(analyzeVoice);
    };

    // Calculate volume (0-100)
    const calculateVolume = (dataArray) => {
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sum += Math.abs(dataArray[i] - 128);
        }
        const average = sum / dataArray.length;
        return Math.min(100, (average / 128) * 100);
    };

    // Calculate pitch (0-100, higher = higher pitch)
    const calculatePitch = (dataArray) => {
        // Simplified pitch detection using zero-crossing rate
        let crossings = 0;
        for (let i = 1; i < dataArray.length; i++) {
            if ((dataArray[i - 1] < 128 && dataArray[i] >= 128) ||
                (dataArray[i - 1] >= 128 && dataArray[i] < 128)) {
                crossings++;
            }
        }
        return Math.min(100, (crossings / dataArray.length) * 1000);
    };

    // Calculate clarity (0-100)
    const calculateClarity = (dataArray) => {
        // Measure signal consistency
        let variance = 0;
        const mean = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        for (let i = 0; i < dataArray.length; i++) {
            variance += Math.pow(dataArray[i] - mean, 2);
        }
        variance /= dataArray.length;
        const clarity = 100 - Math.min(100, Math.sqrt(variance) / 2);
        return clarity;
    };

    // Calculate stress level (0-100, higher = more stressed)
    const calculateStress = (volume, pitch) => {
        // High volume + high pitch = stress
        const stressIndicator = (volume * 0.6 + pitch * 0.4);
        return Math.min(100, stressIndicator);
    };

    // Calculate confidence (0-100)
    const calculateConfidence = (volume, pitch, clarity) => {
        // Moderate volume + moderate pitch + high clarity = confidence
        const idealVolume = 60;
        const idealPitch = 50;
        
        const volumeScore = 100 - Math.abs(volume - idealVolume);
        const pitchScore = 100 - Math.abs(pitch - idealPitch);
        const clarityScore = clarity;
        
        return (volumeScore * 0.3 + pitchScore * 0.2 + clarityScore * 0.5);
    };

    // Send metrics to backend for AI analysis
    const analyzeWithAI = async () => {
        if (!interviewId) return;
        
        setAnalyzing(true);
        try {
            const response = await interviewService.analyzeVoiceTone(interviewId, {
                pitch: voiceMetrics.pitch,
                volume: voiceMetrics.volume,
                clarity: voiceMetrics.clarity,
                stress: voiceMetrics.stress,
                confidence: voiceMetrics.confidence,
                timestamp: Date.now()
            });
            
            setAnalysis(response.data.voice_analysis);
            toast.success('Voice analysis complete!');
        } catch (error) {
            console.error('[VoiceTone] AI analysis failed:', error);
            toast.error('Failed to analyze voice tone');
        } finally {
            setAnalyzing(false);
        }
    };

    const getConfidenceColor = (confidence) => {
        if (confidence >= 70) return 'text-emerald-500';
        if (confidence >= 40) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getStressColor = (stress) => {
        if (stress >= 70) return 'text-red-500';
        if (stress >= 40) return 'text-yellow-500';
        return 'text-emerald-500';
    };

    if (!isActive) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                        <TfiMicrophone className="text-purple-600 text-lg" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
                            Voice Tone Analysis
                        </h3>
                        <p className="text-xs text-gray-400 uppercase tracking-widest">
                            Real-Time Monitoring
                        </p>
                    </div>
                </div>
                <button
                    onClick={analyzeWithAI}
                    disabled={analyzing}
                    className="px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {analyzing ? (
                        <>
                            <TfiPulse className="animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <TfiStatsUp />
                            AI Analyze
                        </>
                    )}
                </button>
            </div>

            {/* Real-time Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Confidence */}
                <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Confidence
                        </span>
                        <span className={`text-2xl font-black ${getConfidenceColor(voiceMetrics.confidence)}`}>
                            {voiceMetrics.confidence}%
                        </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${voiceMetrics.confidence}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>

                {/* Stress Level */}
                <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Stress Level
                        </span>
                        <span className={`text-2xl font-black ${getStressColor(voiceMetrics.stress)}`}>
                            {voiceMetrics.stress}%
                        </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-red-500 to-red-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${voiceMetrics.stress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>

                {/* Volume */}
                <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Volume
                        </span>
                        <span className="text-2xl font-black text-blue-600">
                            {voiceMetrics.volume}%
                        </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${voiceMetrics.volume}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>

                {/* Clarity */}
                <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Clarity
                        </span>
                        <span className="text-2xl font-black text-purple-600">
                            {voiceMetrics.clarity}%
                        </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${voiceMetrics.clarity}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>
            </div>

            {/* AI Analysis Results */}
            {analysis && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-purple-50 rounded-xl p-4 border border-purple-100"
                >
                    <h4 className="text-xs font-black text-purple-900 uppercase tracking-wider mb-3">
                        AI Analysis
                    </h4>
                    <div className="space-y-2 text-sm text-gray-700">
                        {analysis.confidence_level && (
                            <p><strong>Confidence Level:</strong> {analysis.confidence_level}</p>
                        )}
                        {analysis.stress_indicator && (
                            <p><strong>Stress Indicator:</strong> {analysis.stress_indicator}</p>
                        )}
                        {analysis.coaching_tip && (
                            <p className="text-purple-700 italic">💡 {analysis.coaching_tip}</p>
                        )}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
