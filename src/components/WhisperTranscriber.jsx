import React, { useState, useRef } from 'react';
import { TfiMicrophone, TfiDownload, TfiCheck } from 'react-icons/tfi';
import { motion } from 'framer-motion';
import interviewService from '../services/interviewService';
import { toast } from 'sonner';

export default function WhisperTranscriber({ interviewId, questionIndex }) {
    const [recording, setRecording] = useState(false);
    const [transcribing, setTranscribing] = useState(false);
    const [result, setResult] = useState(null);
    
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                await transcribeAudio(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setRecording(true);
            toast.success('Recording started');
        } catch (error) {
            console.error('[Whisper] Recording failed:', error);
            toast.error('Failed to start recording');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && recording) {
            mediaRecorderRef.current.stop();
            setRecording(false);
        }
    };

    const transcribeAudio = async (audioBlob) => {
        setTranscribing(true);
        try {
            // Convert blob to base64
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64Audio = reader.result.split(',')[1];
                
                const response = await interviewService.transcribeAudio(interviewId, {
                    audio_base64: base64Audio,
                    question_index: questionIndex,
                    mime_type: 'audio/webm'
                });

                setResult(response.data);
                toast.success('Transcription complete!');
            };
        } catch (error) {
            console.error('[Whisper] Transcription failed:', error);
            toast.error('Failed to transcribe audio');
        } finally {
            setTranscribing(false);
        }
    };

    const downloadTranscript = () => {
        if (!result?.transcript) return;
        
        const element = document.createElement('a');
        const file = new Blob([result.transcript], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `transcript_q${questionIndex}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-md">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Whisper Transcription
                </h3>
                {recording ? (
                    <button
                        onClick={stopRecording}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-all flex items-center gap-2 animate-pulse"
                    >
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        Stop Recording
                    </button>
                ) : (
                    <button
                        onClick={startRecording}
                        disabled={transcribing}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <TfiMicrophone />
                        Start Recording
                    </button>
                )}
            </div>

            {transcribing && (
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2" />
                    <p className="text-xs text-blue-900 font-bold">Transcribing with Whisper AI...</p>
                </div>
            )}

            {result && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                >
                    {/* Transcript */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-600 uppercase">Transcript</span>
                            <button
                                onClick={downloadTranscript}
                                className="text-blue-600 hover:text-blue-700 transition-colors"
                                title="Download"
                            >
                                <TfiDownload />
                            </button>
                        </div>
                        <p className="text-sm text-gray-800 leading-relaxed">
                            {result.transcript}
                        </p>
                    </div>

                    {/* Summary */}
                    {result.summary && (
                        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                            <div className="flex items-center gap-2 mb-2">
                                <TfiCheck className="text-green-600" />
                                <span className="text-xs font-bold text-green-900 uppercase">AI Summary</span>
                            </div>
                            <p className="text-sm text-green-900 leading-relaxed">
                                {result.summary.summary || 'Summary generated'}
                            </p>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}
