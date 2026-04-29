import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { TfiBolt, TfiCheck, TfiAlert, TfiStatsUp, TfiWrite, TfiReload, TfiInfoAlt, TfiTarget } from 'react-icons/tfi';
import interviewService from '../../services/interviewService';
import '../../styles/hr.css';

// ── Score Badge ──
function ScoreBadge({ score, label }) {
    const color = score >= 75 ? 'bg-emerald-100 text-emerald-700' :
                  score >= 50 ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700';
    return (
        <div className={`flex flex-col items-center p-6 rounded-2xl ${color} min-w-[120px] shadow-sm border border-black/5`}>
            <span className="text-3xl font-black italic">{score}%</span>
            <span className="text-[10px] uppercase tracking-widest font-black mt-2 italic">{label}</span>
        </div>
    );
}

// ── Bias Flag Card ──
function BiasFlagCard({ flag }) {
    const severityMap = {
        gender_coded: { color: 'border-pink-400 bg-pink-50', label: 'Gender Bias' },
        age_bias: { color: 'border-orange-400 bg-orange-50', label: 'Age Bias' },
        exclusionary: { color: 'border-red-400 bg-red-50', label: 'Restricted' },
        vague_requirement: { color: 'border-gray-400 bg-gray-50', label: 'Not Clear' },
    };
    const style = severityMap[flag.type] || { color: 'border-gray-300 bg-gray-50', label: flag.type };
    return (
        <div className={`border-l-4 p-5 rounded-r-2xl ${style.color} shadow-sm mb-4`}>
            <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 italic">{style.label}</span>
            </div>
            <p className="text-sm font-bold text-gray-950 mb-2 italic">"{flag.text}"</p>
            <p className="text-[11px] text-gray-600 font-medium">Suggestion: {flag.suggestion}</p>
        </div>
    );
}

export default function JDAnalyzer() {
    const [jobTitle, setJobTitle] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    // Difficulty Check state
    const [calibrationLoading, setCalibrationLoading] = useState(false);
    const [calibrationResult, setCalibrationResult] = useState(null);
    const [candidateId, setCandidateId] = useState('');
    const [activeTab, setActiveTab] = useState('jd'); // 'jd' | 'difficulty'

    const handleAnalyzeJD = async () => {
        if (!jobDescription.trim()) {
            toast.error('Please enter a job description first.');
            return;
        }
        setLoading(true);
        setResult(null);
        try {
            const res = await interviewService.analyzeJD({ 
                job_title: jobTitle, 
                job_description: jobDescription 
            });
            
            // The API returns { jd_analysis: { ... } }
            const analysisData = res.data.jd_analysis || res.data;
            setResult(analysisData);
            toast.success('Analysis successful!');
        } catch (e) {
            toast.error('Analysis failed. Please check your connection.');
            console.error(e);
        }
        setLoading(false);
    };

    const handleCalibrate = async () => {
        if (!candidateId.trim()) {
            toast.error('Please enter a Candidate ID.');
            return;
        }
        setCalibrationLoading(true);
        setCalibrationResult(null);
        try {
            const res = await interviewService.calibrateDifficulty({
                candidate_id: candidateId,
                job_title: jobTitle,
                job_description: jobDescription
            });
            const calibrationData = res.data.calibration || res.data;
            setCalibrationResult(calibrationData);
            toast.success('Interview level recommended!');
        } catch (e) {
            toast.error('Calibration failed.');
        }
        setCalibrationLoading(false);
    };

    return (
        <div className="animate-fade-in pb-20 px-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-12">
                <h1 className="hr-heading text-4xl mb-4 italic">AI HR TOOLS</h1>
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                    <p className="text-[11px] font-black uppercase text-gray-400 tracking-[0.4em] italic">Optimize Job Postings & Difficulty Levels</p>
                </div>
            </div>

            {/* Purpose/Info Section */}
            <div className="hr-card p-8 bg-gray-950 text-white border-none mb-12 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[100px] pointer-events-none" />
                <div className="flex items-start gap-6 relative">
                    <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center text-2xl shadow-xl shadow-red-600/20 group-hover:scale-110 transition-transform duration-700">
                        <TfiInfoAlt />
                    </div>
                    <div>
                        <h3 className="text-lg font-black uppercase italic tracking-widest mb-2">What is this for?</h3>
                        <p className="text-xs text-gray-400 leading-relaxed max-w-2xl font-medium italic">
                            This tool helps you write better job postings. It checks if your job is interesting, easy to read, and free of bias. 
                            Switch to <span className="text-red-500 font-black">DIFFICULTY CHECK</span> to find out how hard the interview should be for a specific candidate.
                        </p>
                    </div>
                </div>
            </div>

            {/* Tab Switch */}
            <div className="flex gap-4 mb-10 bg-white p-2 rounded-[2rem] border border-gray-100 shadow-xl w-fit">
                {[
                    { key: 'jd', label: 'JOB ANALYZER', icon: <TfiWrite /> },
                    { key: 'difficulty', label: 'DIFFICULTY CHECK', icon: <TfiTarget /> },
                ].map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest italic transition-all ${
                            activeTab === tab.key
                                ? 'bg-red-600 text-white shadow-xl shadow-red-600/20 scale-105'
                                : 'text-gray-400 hover:text-gray-950 hover:bg-gray-50'
                        }`}>
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'jd' ? (
                    <motion.div key="jd" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                        {/* Input Area */}
                        <div className="hr-card p-10 bg-white border-gray-100 shadow-2xl space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic ml-2">Job Title</label>
                                <input
                                    type="text"
                                    value={jobTitle}
                                    onChange={e => setJobTitle(e.target.value)}
                                    placeholder="e.g. Senior Software Engineer"
                                    className="hr-input bg-gray-50 border-gray-100 focus:bg-white text-gray-950 italic"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic ml-2">Full Job Description</label>
                                <textarea
                                    value={jobDescription}
                                    onChange={e => setJobDescription(e.target.value)}
                                    rows={8}
                                    placeholder="Paste your job requirements and details here..."
                                    className="hr-input bg-gray-50 border-gray-100 focus:bg-white text-gray-950 italic h-48 py-5"
                                />
                            </div>
                            <button
                                onClick={handleAnalyzeJD}
                                disabled={loading}
                                className="btn-hr-primary w-full py-6 text-xs flex items-center justify-center gap-4 shadow-xl shadow-red-600/20 active:scale-[0.98]"
                            >
                                {loading ? <><TfiReload className="animate-spin text-lg" /> ANALYZING...</> : <><TfiBolt className="text-lg" /> ANALYZE JOB POSTING</>}
                            </button>
                        </div>

                        {/* Analysis Results */}
                        {result && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                                <div className="hr-card p-10 bg-white border-gray-100 shadow-2xl">
                                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-red-600 mb-8 italic">AI Assessment Results</h2>
                                    <div className="flex gap-6 flex-wrap mb-10">
                                        <ScoreBadge score={result.attractiveness_score || 0} label="Attractiveness" />
                                        <ScoreBadge score={result.clarity_score || 0} label="Clarity" />
                                        <ScoreBadge score={result.bias_score || 0} label="Bias-Free" />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Readability</p>
                                            <p className="text-lg font-black italic text-gray-950 uppercase">{result.readability || 'Normal'}</p>
                                        </div>
                                        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Candidate Appeal</p>
                                            <p className="text-lg font-black italic text-gray-950 uppercase">{result.candidate_appeal || 'Normal'}</p>
                                        </div>
                                        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Target Level</p>
                                            <p className="text-lg font-black italic text-gray-950 uppercase">{result.estimated_applicant_quality || 'All'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="hr-card p-10 bg-white border-gray-100 shadow-2xl">
                                    <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4 italic">Detailed AI Summary</h2>
                                    <p className="text-sm text-gray-800 leading-relaxed font-medium italic">{result.summary}</p>
                                </div>

                                {result.bias_flags?.length > 0 && (
                                    <div className="hr-card p-10 border-red-100 bg-red-50/30">
                                        <h2 className="text-[11px] font-black uppercase tracking-widest text-red-600 mb-6 flex items-center gap-3 italic">
                                            <TfiAlert size={20} /> {result.bias_flags.length} Potential Issues Found
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {result.bias_flags.map((flag, i) => <BiasFlagCard key={i} flag={flag} />)}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="hr-card p-10 bg-white shadow-xl">
                                        <h2 className="text-[11px] font-black uppercase tracking-widest text-red-600 mb-6 flex items-center gap-3 italic">
                                            <TfiStatsUp /> IMPROVEMENTS
                                        </h2>
                                        <ul className="space-y-4">
                                            {(result.improvements || []).map((imp, i) => (
                                                <li key={i} className="flex items-start gap-4 text-[13px] font-bold text-gray-800 italic">
                                                    <TfiCheck className="text-red-600 mt-1 shrink-0" /> {imp}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="hr-card p-10 bg-emerald-50/30 border-emerald-100 shadow-xl">
                                        <h2 className="text-[11px] font-black uppercase tracking-widest text-emerald-600 mb-6 italic">✓ STRENGTHS</h2>
                                        <ul className="space-y-4">
                                            {(result.strengths || []).map((s, i) => (
                                                <li key={i} className="flex items-start gap-4 text-[13px] font-bold text-gray-800 italic">
                                                    <TfiCheck className="text-emerald-600 mt-1 shrink-0" /> {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div key="difficulty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                        <div className="hr-card p-10 bg-white border-gray-100 shadow-2xl space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic ml-2">Candidate User ID</label>
                                <input
                                    type="text"
                                    value={candidateId}
                                    onChange={e => setCandidateId(e.target.value)}
                                    placeholder="Enter Candidate ID (e.g. 5)"
                                    className="hr-input bg-gray-50 border-gray-100 focus:bg-white text-gray-950 italic"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic ml-2">Job Title</label>
                                    <input
                                        type="text"
                                        value={jobTitle}
                                        onChange={e => setJobTitle(e.target.value)}
                                        placeholder="Job Title"
                                        className="hr-input bg-gray-50 border-gray-100 focus:bg-white italic"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic ml-2">Job Description (Optional)</label>
                                    <input
                                        type="text"
                                        value={jobDescription}
                                        onChange={e => setJobDescription(e.target.value)}
                                        placeholder="Job Details"
                                        className="hr-input bg-gray-50 border-gray-100 focus:bg-white italic"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleCalibrate}
                                disabled={calibrationLoading}
                                className="btn-hr-primary w-full py-6 text-xs flex items-center justify-center gap-4 shadow-xl shadow-red-600/20 active:scale-[0.98]"
                            >
                                {calibrationLoading ? <><TfiReload className="animate-spin text-lg" /> CHECKING...</> : <><TfiTarget className="text-lg" /> CALCULATE LEVEL</>}
                            </button>
                        </div>

                        {calibrationResult && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                                <div className="hr-card p-10 bg-white border-gray-100 shadow-2xl">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 pb-10 border-b border-gray-100">
                                        <div>
                                            <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 italic">Recommended Level</h2>
                                            <div className="text-4xl font-black italic text-red-600 uppercase tracking-tighter">
                                                {calibrationResult.recommended_difficulty || 'Medium'} Complexity
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="text-center p-6 bg-gray-950 text-white rounded-2xl shadow-xl">
                                                <p className="text-[9px] font-black uppercase tracking-widest mb-1 italic opacity-60">Experience</p>
                                                <p className="text-2xl font-black italic uppercase">{calibrationResult.experience_level || 'Junior'}</p>
                                            </div>
                                            <div className="text-center p-6 bg-red-600 text-white rounded-2xl shadow-xl">
                                                <p className="text-[9px] font-black uppercase tracking-widest mb-1 italic opacity-60">Est. Years</p>
                                                <p className="text-2xl font-black italic">{calibrationResult.estimated_years_experience || 0}Y</p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-lg font-bold text-gray-800 leading-relaxed italic border-l-4 border-red-600 pl-6">
                                        {calibrationResult.rationale}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="hr-card p-10 bg-white shadow-xl">
                                        <h2 className="text-[11px] font-black uppercase tracking-widest text-red-600 mb-8 italic">Question Mix</h2>
                                        <div className="space-y-6">
                                            {Object.entries(calibrationResult.question_distribution || { Easy: 3, Medium: 5, Hard: 2 }).map(([diff, count]) => (
                                                <div key={diff} className="space-y-2">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-[10px] font-black uppercase tracking-widest italic text-gray-950">{diff} Questions</span>
                                                        <span className="text-lg font-black italic text-red-600">{count}</span>
                                                    </div>
                                                    <div className="h-2 bg-gray-50 rounded-full overflow-hidden border border-gray-100 shadow-inner">
                                                        <motion.div initial={{ width: 0 }} animate={{ width: `${(count / 10) * 100}%` }} className="h-full bg-red-600" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="hr-card p-10 bg-gray-950 text-white shadow-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-[50px] pointer-events-none" />
                                        <h2 className="text-[11px] font-black uppercase tracking-widest text-red-500 mb-8 italic relative">FOCUS AREAS</h2>
                                        <div className="flex flex-wrap gap-3 relative">
                                            {(calibrationResult.focus_areas || []).map((area, i) => (
                                                <span key={i} className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[11px] font-black italic uppercase tracking-widest text-white hover:bg-red-600 hover:border-red-600 transition-all">
                                                    {area}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
