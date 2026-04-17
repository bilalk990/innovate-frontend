import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { TfiBolt, TfiCheck, TfiAlert, TfiStatsUp, TfiWrite, TfiReload } from 'react-icons/tfi';
import useAuth from '../../hooks/useAuth';
import '../../styles/hr.css';

// ── Score Badge ──
function ScoreBadge({ score, label }) {
    const color = score >= 75 ? 'bg-emerald-100 text-emerald-700' :
                  score >= 50 ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700';
    return (
        <div className={`flex flex-col items-center p-4 rounded-2xl ${color} min-w-[90px]`}>
            <span className="text-2xl font-black">{score}</span>
            <span className="text-[9px] uppercase tracking-widest font-bold mt-1">{label}</span>
        </div>
    );
}

// ── Bias Flag Card ──
function BiasFlagCard({ flag }) {
    const severityMap = {
        gender_coded: { color: 'border-pink-400 bg-pink-50', label: 'Gender Coded' },
        age_bias: { color: 'border-orange-400 bg-orange-50', label: 'Age Bias' },
        exclusionary: { color: 'border-red-400 bg-red-50', label: 'Exclusionary' },
        vague_requirement: { color: 'border-gray-400 bg-gray-50', label: 'Vague Req.' },
    };
    const style = severityMap[flag.type] || { color: 'border-gray-300 bg-gray-50', label: flag.type };
    return (
        <div className={`border-l-4 p-4 rounded-r-xl ${style.color}`}>
            <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-gray-500">{style.label}</span>
            </div>
            <p className="text-xs font-semibold text-gray-800 mb-1">❝ {flag.text} ❞</p>
            <p className="text-[10px] text-gray-600">→ {flag.suggestion}</p>
        </div>
    );
}

export default function JDAnalyzer() {
    const { token } = useAuth();
    const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

    const [jobTitle, setJobTitle] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    // Feature 8: Difficulty Calibrator
    const [calibrationLoading, setCalibrationLoading] = useState(false);
    const [calibrationResult, setCalibrationResult] = useState(null);
    const [candidateId, setCandidateId] = useState('');
    const [activeTab, setActiveTab] = useState('jd'); // 'jd' | 'difficulty'

    const analyzeJD = async () => {
        if (!jobDescription.trim()) {
            toast.error('Please enter a job description.');
            return;
        }
        setLoading(true);
        setResult(null);
        try {
            const res = await fetch(`${apiUrl}/interviews/analyze-jd/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ job_title: jobTitle, job_description: jobDescription })
            });
            if (!res.ok) throw new Error('Analysis failed');
            const data = await res.json();
            setResult(data.jd_analysis);
            toast.success('JD Analysis complete!');
        } catch (e) {
            toast.error('Analysis failed. Please try again.');
        }
        setLoading(false);
    };

    const calibrateDifficulty = async () => {
        if (!candidateId.trim() && !jobTitle.trim()) {
            toast.error('Enter a Candidate ID and Job Title.');
            return;
        }
        setCalibrationLoading(true);
        setCalibrationResult(null);
        try {
            const res = await fetch(`${apiUrl}/interviews/calibrate-difficulty/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    candidate_id: candidateId,
                    job_title: jobTitle,
                    job_description: jobDescription
                })
            });
            if (!res.ok) throw new Error('Calibration failed');
            const data = await res.json();
            setCalibrationResult(data.calibration);
            toast.success('Difficulty calibrated!');
        } catch (e) {
            toast.error('Calibration failed. Please try again.');
        }
        setCalibrationLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-black text-gray-900 uppercase tracking-wider">AI Tools</h1>
                    <p className="text-sm text-gray-500 mt-1">Job Description Analyzer + Interview Difficulty Calibrator</p>
                </div>

                {/* Tab Switch */}
                <div className="flex gap-2 bg-white border border-gray-100 rounded-2xl p-1 w-fit shadow-sm">
                    {[
                        { key: 'jd', label: '📋 JD Analyzer' },
                        { key: 'difficulty', label: '🎯 Difficulty Calibrator' },
                    ].map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                                activeTab === tab.key
                                    ? 'bg-red-600 text-white shadow'
                                    : 'text-gray-500 hover:text-gray-800'
                            }`}>{tab.label}</button>
                    ))}
                </div>

                <AnimatePresence mode="wait">

                {/* ── JD ANALYZER TAB ── */}
                {activeTab === 'jd' && (
                <motion.div key="jd" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="space-y-6">

                    {/* Input */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                        <input
                            type="text"
                            value={jobTitle}
                            onChange={e => setJobTitle(e.target.value)}
                            placeholder="Job Title (e.g. Senior Backend Engineer)"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <textarea
                            value={jobDescription}
                            onChange={e => setJobDescription(e.target.value)}
                            rows={8}
                            placeholder="Paste your full job description here..."
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                        />
                        <button
                            onClick={analyzeJD}
                            disabled={loading}
                            className="w-full py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-black uppercase tracking-wider text-sm transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <><TfiReload className="animate-spin" /> Analyzing...</> : <><TfiBolt /> Analyze JD with AI</>}
                        </button>
                    </div>

                    {/* Results */}
                    {result && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

                        {/* Score Row */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h2 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-5">Analysis Scores</h2>
                            <div className="flex gap-4 flex-wrap">
                                <ScoreBadge score={result.attractiveness_score} label="Attractiveness" />
                                <ScoreBadge score={result.clarity_score} label="Clarity" />
                                <ScoreBadge score={result.bias_score} label="Bias-Free" />
                            </div>
                            <div className="mt-4 flex gap-3 flex-wrap">
                                <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                                    result.readability === 'excellent' ? 'bg-emerald-100 text-emerald-700' :
                                    result.readability === 'good' ? 'bg-blue-100 text-blue-700' :
                                    result.readability === 'average' ? 'bg-amber-100 text-amber-700' :
                                    'bg-red-100 text-red-700'
                                }`}>Readability: {result.readability}</span>
                                <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                                    result.candidate_appeal === 'high' ? 'bg-emerald-100 text-emerald-700' :
                                    result.candidate_appeal === 'medium' ? 'bg-amber-100 text-amber-700' :
                                    'bg-red-100 text-red-700'
                                }`}>Appeal: {result.candidate_appeal}</span>
                                <span className="text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider bg-gray-100 text-gray-600">
                                    Target: {result.estimated_applicant_quality} level
                                </span>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h2 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">AI Assessment</h2>
                            <p className="text-sm text-gray-700 leading-relaxed">{result.summary}</p>
                        </div>

                        {/* Bias Flags */}
                        {result.bias_flags?.length > 0 && (
                        <div className="bg-white rounded-2xl border border-red-100 p-6 shadow-sm">
                            <h2 className="text-xs font-black uppercase tracking-widest text-red-500 mb-4 flex items-center gap-2">
                                <TfiAlert /> {result.bias_flags.length} Bias Flag{result.bias_flags.length > 1 ? 's' : ''} Detected
                            </h2>
                            <div className="space-y-3">
                                {result.bias_flags.map((flag, i) => <BiasFlagCard key={i} flag={flag} />)}
                            </div>
                        </div>
                        )}

                        {/* Improvements */}
                        {result.improvements?.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h2 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                                <TfiStatsUp /> Suggested Improvements
                            </h2>
                            <ul className="space-y-2">
                                {result.improvements.map((imp, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                        <TfiCheck className="text-red-500 mt-0.5 shrink-0" />{imp}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        )}

                        {/* Strengths */}
                        {result.strengths?.length > 0 && (
                        <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-6 shadow-sm">
                            <h2 className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-4">✓ What's Working Well</h2>
                            <ul className="space-y-2">
                                {result.strengths.map((s, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                        <TfiCheck className="text-emerald-500 mt-0.5 shrink-0" />{s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        )}

                        {/* Missing Sections */}
                        {result.missing_sections?.length > 0 && (
                        <div className="bg-amber-50 rounded-2xl border border-amber-100 p-6 shadow-sm">
                            <h2 className="text-xs font-black uppercase tracking-widest text-amber-600 mb-4">⚠️ Missing Sections</h2>
                            <div className="flex flex-wrap gap-2">
                                {result.missing_sections.map((s, i) => (
                                    <span key={i} className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-semibold">{s}</span>
                                ))}
                            </div>
                        </div>
                        )}

                    </motion.div>
                    )}
                </motion.div>
                )}

                {/* ── DIFFICULTY CALIBRATOR TAB ── */}
                {activeTab === 'difficulty' && (
                <motion.div key="difficulty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="space-y-6">

                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Enter a candidate's ID and job details. AI will analyze the resume and recommend the ideal interview difficulty level + question distribution.
                        </p>
                        <input
                            type="text"
                            value={candidateId}
                            onChange={e => setCandidateId(e.target.value)}
                            placeholder="Candidate User ID (from dashboard)"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <input
                            type="text"
                            value={jobTitle}
                            onChange={e => setJobTitle(e.target.value)}
                            placeholder="Job Title"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <textarea
                            value={jobDescription}
                            onChange={e => setJobDescription(e.target.value)}
                            rows={4}
                            placeholder="Job Description (optional but improves accuracy)"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                        />
                        <button
                            onClick={calibrateDifficulty}
                            disabled={calibrationLoading}
                            className="w-full py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-black uppercase tracking-wider text-sm transition-all flex items-center justify-center gap-2"
                        >
                            {calibrationLoading ? <><TfiReload className="animate-spin" /> Calibrating...</> : <><TfiBolt /> Calibrate Difficulty</>}
                        </button>
                    </div>

                    {/* Calibration Results */}
                    {calibrationResult && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

                        {/* Main Result */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">Calibration Result</h2>
                                <span className={`text-xs font-black px-4 py-1.5 rounded-full uppercase ${
                                    calibrationResult.recommended_difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                                    calibrationResult.recommended_difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
                                    'bg-green-100 text-green-700'
                                }`}>{calibrationResult.recommended_difficulty} difficulty</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Experience Level</p>
                                    <p className="text-lg font-black text-gray-800 capitalize">{calibrationResult.experience_level}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Est. Years</p>
                                    <p className="text-lg font-black text-gray-800">{calibrationResult.estimated_years_experience} yrs</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed border-l-4 border-red-400 pl-3">{calibrationResult.rationale}</p>
                        </div>

                        {/* Question Distribution */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h2 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">Recommended Question Distribution</h2>
                            <div className="space-y-3">
                                {Object.entries(calibrationResult.question_distribution || {}).map(([diff, count]) => (
                                    <div key={diff} className="flex items-center gap-4">
                                        <span className={`text-[9px] font-black uppercase w-14 ${
                                            diff === 'hard' ? 'text-red-600' :
                                            diff === 'medium' ? 'text-amber-600' : 'text-green-600'
                                        }`}>{diff}</span>
                                        <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                            <div className={`h-2.5 rounded-full ${
                                                diff === 'hard' ? 'bg-red-500' :
                                                diff === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                                            }`} style={{ width: `${(count / 10) * 100}%` }} />
                                        </div>
                                        <span className="text-xs font-black text-gray-600 w-6">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Focus Areas */}
                        {calibrationResult.focus_areas?.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h2 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">Focus Areas to Probe</h2>
                            <div className="flex flex-wrap gap-2">
                                {calibrationResult.focus_areas.map((area, i) => (
                                    <span key={i} className="text-xs bg-red-50 text-red-700 border border-red-100 px-3 py-1 rounded-full font-semibold">{area}</span>
                                ))}
                            </div>
                        </div>
                        )}

                    </motion.div>
                    )}
                </motion.div>
                )}

                </AnimatePresence>
            </div>
        </div>
    );
}
