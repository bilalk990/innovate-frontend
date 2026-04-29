import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { TfiBolt, TfiCheck, TfiAlert, TfiStatsUp, TfiWrite, TfiReload, TfiInfoAlt, TfiTarget } from 'react-icons/tfi';
import interviewService from '../../services/interviewService';
import '../../styles/hr.css';

// ── Score Badge ──
function ScoreBadge({ score, label }) {
    const color = score >= 75 ? 'text-emerald-600 border-emerald-100' :
                  score >= 50 ? 'text-amber-600 border-amber-100' :
                                'text-red-600 border-red-100';
    return (
        <div className={`flex flex-col items-center p-8 rounded-[2rem] bg-white border-2 ${color} min-w-[160px] shadow-xl hover:scale-105 transition-transform duration-500`}>
            <span className="text-4xl font-black italic tracking-tighter leading-none">{score}%</span>
            <span className="text-[10px] uppercase tracking-[0.3em] font-black mt-4 italic text-gray-400">{label}</span>
        </div>
    );
}

// ── Bias Flag Card ──
function BiasFlagCard({ flag }) {
    const severityMap = {
        gender_coded: { color: 'border-pink-600/20 bg-pink-50', label: 'GENDER BIAS', text: 'text-pink-700' },
        age_bias: { color: 'border-orange-600/20 bg-orange-50', label: 'AGE BIAS', text: 'text-orange-700' },
        exclusionary: { color: 'border-red-600/20 bg-red-50', label: 'RESTRICTED', text: 'text-red-700' },
        vague_requirement: { color: 'border-gray-600/20 bg-gray-50', label: 'AMBIGUITY', text: 'text-gray-700' },
    };
    const style = severityMap[flag.type] || { color: 'border-gray-100 bg-gray-50', label: flag.type.toUpperCase(), text: 'text-gray-700' };
    return (
        <div className={`border-2 p-8 rounded-[2.5rem] ${style.color} shadow-sm group hover:shadow-xl transition-all duration-500`}>
            <div className="flex items-center gap-4 mb-4">
                <span className={`text-[10px] font-black uppercase tracking-[0.4em] italic ${style.text}`}>{style.label}</span>
            </div>
            <p className="text-sm font-black text-gray-950 mb-4 italic uppercase tracking-tight leading-tight">"{flag.text}"</p>
            <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest italic border-t border-black/5 pt-4">Suggestion: {flag.suggestion}</div>
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
    const [activeTab, setActiveTab] = useState('jd'); 

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
            const analysisData = res.data.jd_analysis || res.data;
            setResult(analysisData);
            toast.success('Analysis successful!');
        } catch (e) {
            toast.error('Analysis failed. Please check your connection.');
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
        <div className="min-h-screen bg-white text-gray-950 p-8">
            <div className="max-w-6xl mx-auto space-y-12 pb-20">
                
                {/* Header */}
                <div className="text-center pt-8">
                    <h1 className="text-6xl font-black italic uppercase tracking-tighter text-gray-950 leading-none">
                        JD <span className="text-red-600 underline decoration-red-600/20 underline-offset-8">OPTIMIZER</span>
                    </h1>
                    <p className="text-gray-400 text-[10px] mt-6 font-black uppercase tracking-[0.4em] italic">AI-Driven Job Post Analysis & Difficulty Calibration</p>
                </div>

                {/* Tactical Overview Card */}
                <div className="bg-gray-50 border-2 border-gray-100 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/[0.03] blur-[100px] pointer-events-none" />
                    <div className="flex items-start gap-10 relative">
                        <div className="w-16 h-16 rounded-[2rem] bg-gray-950 text-red-600 flex items-center justify-center text-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] group-hover:rotate-12 transition-transform duration-700">
                            <TfiInfoAlt />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-xl font-black uppercase italic tracking-tighter text-gray-950">STRATEGIC PURPOSE</h3>
                            <p className="text-sm text-gray-500 font-bold italic uppercase tracking-tight leading-relaxed max-w-3xl">
                                Engineering the perfect job posting through linguistic analysis & bias detection. 
                                Transition to <span className="text-red-600">CALIBRATION MODE</span> to align interview complexity with specific candidate profiles.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tab Navigator */}
                <div className="flex gap-4 p-2 bg-gray-50 rounded-[2.5rem] w-fit mx-auto border border-gray-100 shadow-sm">
                    {[
                        { key: 'jd', label: 'Linguistic Analysis', icon: <TfiWrite /> },
                        { key: 'difficulty', label: 'Complexity Calibration', icon: <TfiTarget /> },
                    ].map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-4 px-10 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest italic transition-all duration-500 ${
                                activeTab === tab.key
                                    ? 'bg-red-600 text-white shadow-2xl shadow-red-600/30'
                                    : 'text-gray-400 hover:text-gray-950'
                            }`}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'jd' ? (
                        <motion.div key="jd" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }} className="space-y-12">
                            {/* Input Matrix */}
                            <div className="bg-white border-2 border-gray-50 rounded-[3.5rem] p-16 shadow-2xl space-y-12 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/[0.01] blur-[80px]" />
                                
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] italic ml-6">Operational Title</label>
                                    <input
                                        type="text"
                                        value={jobTitle}
                                        onChange={e => setJobTitle(e.target.value)}
                                        placeholder="E.G. SYSTEMS ARCHITECT (L7)"
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-[2rem] px-10 py-6 text-sm text-gray-950 font-black italic uppercase tracking-tighter focus:outline-none focus:border-red-600/50 focus:bg-white transition-all shadow-inner"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] italic ml-6">Full Requirement Log</label>
                                    <textarea
                                        value={jobDescription}
                                        onChange={e => setJobDescription(e.target.value)}
                                        rows={10}
                                        placeholder="Paste full JD text here for comprehensive audit..."
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-[3rem] px-12 py-12 text-sm text-gray-950 font-bold italic uppercase tracking-tight focus:outline-none focus:border-red-600/50 focus:bg-white transition-all h-64 py-5 resize-none shadow-inner"
                                    />
                                </div>
                                <button
                                    onClick={handleAnalyzeJD}
                                    disabled={loading}
                                    className="w-full py-8 bg-red-600 hover:bg-red-700 disabled:opacity-30 rounded-[2.5rem] font-black uppercase tracking-[0.5em] text-[11px] text-white transition-all duration-500 flex items-center justify-center gap-4 shadow-[0_20px_40px_-10px_rgba(220,38,38,0.3)] active:scale-[0.98] group"
                                >
                                    {loading ? <><TfiReload className="animate-spin text-xl" /> AUDITING DOCUMENT...</> : <><TfiBolt className="text-xl group-hover:rotate-12 transition-transform" /> INITIALIZE ANALYSIS</>}
                                </button>
                            </div>

                            {/* Results Matrix */}
                            {result && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12">
                                    <div className="bg-gray-50 border-2 border-gray-100 rounded-[4rem] p-16 shadow-2xl relative">
                                        <div className="text-[11px] font-black uppercase tracking-[0.6em] text-red-600 mb-12 italic text-center underline decoration-red-200 underline-offset-8">AI AUDIT METRICS</div>
                                        <div className="flex gap-8 justify-center flex-wrap mb-16">
                                            <ScoreBadge score={result.attractiveness_score || 0} label="Attraction" />
                                            <ScoreBadge score={result.clarity_score || 0} label="Precision" />
                                            <ScoreBadge score={result.bias_score || 0} label="Inclusion" />
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            {[
                                                ['Linguistic Grade', result.readability || 'Standard'],
                                                ['Talent Appeal', result.candidate_appeal || 'Medium'],
                                                ['Target Tier', result.estimated_applicant_quality || 'All']
                                            ].map(([label, val]) => (
                                                <div key={label} className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 shadow-xl text-center group hover:border-red-600/20 transition-all duration-500">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 italic">{label}</p>
                                                    <p className="text-2xl font-black italic text-gray-950 uppercase tracking-tighter leading-none">{val}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white border-4 border-gray-50 rounded-[3rem] p-16 shadow-2xl">
                                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-8 italic flex items-center gap-4">
                                            <span className="w-12 h-1 bg-gray-950 rounded-full" /> EXECUTIVE AUDIT SUMMARY
                                        </div>
                                        <p className="text-2xl text-gray-950 font-black italic uppercase tracking-tighter leading-tight">"{result.summary}"</p>
                                    </div>

                                    {result.bias_flags?.length > 0 && (
                                        <div className="bg-red-50 border-4 border-red-600/20 rounded-[4rem] p-16 space-y-10">
                                            <h2 className="text-[12px] font-black uppercase tracking-[0.5em] text-red-600 mb-10 flex items-center gap-6 italic">
                                                <TfiAlert className="text-2xl" /> {result.bias_flags.length} CRITICAL LINGUISTIC RISKS
                                            </h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {result.bias_flags.map((flag, i) => <BiasFlagCard key={i} flag={flag} />)}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="bg-gray-50 border-2 border-gray-100 rounded-[3rem] p-12 shadow-xl hover:bg-white transition-all group">
                                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-red-600 mb-10 flex items-center gap-4 italic underline decoration-red-100 decoration-4 underline-offset-4">
                                                <TfiStatsUp /> IMPROVEMENT PROTOCOLS
                                            </h2>
                                            <ul className="space-y-6">
                                                {(result.improvements || []).map((imp, i) => (
                                                    <li key={i} className="flex items-start gap-6 text-sm font-black text-gray-950 italic uppercase tracking-tight group-hover:translate-x-2 transition-transform leading-relaxed">
                                                        <TfiCheck className="text-red-600 mt-1 shrink-0 text-lg" /> {imp}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="bg-emerald-50 border-2 border-emerald-100 rounded-[3rem] p-12 shadow-xl hover:bg-white transition-all group">
                                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-600 mb-10 italic flex items-center gap-4 underline decoration-emerald-100 decoration-4 underline-offset-4">
                                                ✓ STRUCTURAL STRENGTHS
                                            </h2>
                                            <ul className="space-y-6">
                                                {(result.strengths || []).map((s, i) => (
                                                    <li key={i} className="flex items-start gap-6 text-sm font-black text-gray-950 italic uppercase tracking-tight group-hover:translate-x-2 transition-transform leading-relaxed">
                                                        <TfiCheck className="text-emerald-600 mt-1 shrink-0 text-lg" /> {s}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div key="difficulty" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }} className="space-y-12">
                            <div className="bg-white border-2 border-gray-50 rounded-[3.5rem] p-16 shadow-2xl space-y-12 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/[0.01] blur-[80px]" />
                                
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] italic ml-6">Candidate Identifier</label>
                                    <input
                                        type="text"
                                        value={candidateId}
                                        onChange={e => setCandidateId(e.target.value)}
                                        placeholder="ENTER C-SERIAL (E.G. 7521)"
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-[2rem] px-10 py-6 text-sm text-gray-950 font-black italic uppercase tracking-tighter focus:outline-none focus:border-red-600/50 focus:bg-white transition-all shadow-inner"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] italic ml-6">Target Role</label>
                                        <input
                                            type="text"
                                            value={jobTitle}
                                            onChange={e => setJobTitle(e.target.value)}
                                            placeholder="JOB TITLE"
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-[2rem] px-10 py-6 text-sm text-gray-950 font-black italic uppercase tracking-tighter focus:outline-none focus:border-red-600/50 transition-all shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] italic ml-6">Audit Details (Optional)</label>
                                        <input
                                            type="text"
                                            value={jobDescription}
                                            onChange={e => setJobDescription(e.target.value)}
                                            placeholder="JD CONTEXT"
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-[2rem] px-10 py-6 text-sm text-gray-950 font-black italic uppercase tracking-tighter focus:outline-none focus:border-red-600/50 transition-all shadow-inner"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleCalibrate}
                                    disabled={calibrationLoading}
                                    className="w-full py-8 bg-red-600 hover:bg-red-700 disabled:opacity-30 rounded-[2.5rem] font-black uppercase tracking-[0.5em] text-[11px] text-white transition-all duration-500 flex items-center justify-center gap-4 shadow-[0_20px_40px_-10px_rgba(220,38,38,0.3)] active:scale-[0.98] group"
                                >
                                    {calibrationLoading ? <><TfiReload className="animate-spin text-xl" /> CALIBRATING COMPLEXITY...</> : <><TfiTarget className="text-xl group-hover:scale-125 transition-transform" /> CALCULATE COMPLEXITY INDEX</>}
                                </button>
                            </div>

                            {calibrationResult && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12">
                                    <div className="bg-gray-50 border-2 border-gray-100 rounded-[4rem] p-20 shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/[0.03] blur-[100px] pointer-events-none" />
                                        
                                        <div className="flex flex-col md:flex-row items-center justify-between gap-16 mb-16 pb-16 border-b-2 border-gray-100">
                                            <div className="text-center md:text-left">
                                                <h2 className="text-[11px] font-black uppercase tracking-[0.6em] text-gray-400 mb-6 italic">OPTIMAL COMPLEXITY</h2>
                                                <div className="text-7xl font-black italic text-red-600 uppercase tracking-tighter leading-none">
                                                    {calibrationResult.recommended_difficulty || 'MID'} TIER
                                                </div>
                                            </div>
                                            <div className="flex gap-8">
                                                <div className="text-center p-8 bg-white text-gray-950 rounded-[2.5rem] shadow-xl border-2 border-gray-100 min-w-[160px]">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 italic text-gray-400">EXP PROFILE</p>
                                                    <p className="text-3xl font-black italic uppercase tracking-tighter leading-none">{calibrationResult.experience_level || 'L3'}</p>
                                                </div>
                                                <div className="text-center p-8 bg-gray-950 text-white rounded-[2.5rem] shadow-2xl min-w-[160px] border-4 border-red-600/20">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 italic text-gray-400">YEARS REQ</p>
                                                    <p className="text-4xl font-black italic leading-none">{calibrationResult.estimated_years_experience || 0}Y</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white p-12 rounded-[3rem] border-l-[12px] border-red-600 shadow-inner group">
                                            <div className="text-[11px] font-black uppercase tracking-[0.4em] text-red-600 mb-6 italic">CALIBRATION RATIONALE</div>
                                            <p className="text-2xl font-black text-gray-950 italic uppercase tracking-tighter leading-tight group-hover:translate-x-2 transition-transform">
                                                "{calibrationResult.rationale}"
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="bg-white border-2 border-gray-50 rounded-[4rem] p-16 shadow-2xl">
                                            <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-red-600 mb-12 italic text-center underline decoration-red-100 decoration-8 underline-offset-8">QUESTION ARCHITECTURE</h2>
                                            <div className="space-y-10">
                                                {Object.entries(calibrationResult.question_distribution || { Easy: 3, Medium: 5, Hard: 2 }).map(([diff, count]) => (
                                                    <div key={diff} className="space-y-4">
                                                        <div className="flex justify-between items-end px-4">
                                                            <span className="text-[11px] font-black uppercase tracking-[0.4em] italic text-gray-400">{diff} PHASE</span>
                                                            <span className="text-3xl font-black italic text-gray-950 tracking-tighter">{count} Q</span>
                                                        </div>
                                                        <div className="h-4 bg-gray-50 rounded-full overflow-hidden border-2 border-gray-100 shadow-inner">
                                                            <motion.div initial={{ width: 0 }} animate={{ width: `${(count / 10) * 100}%` }} className="h-full bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)]" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 border-4 border-gray-100 rounded-[4rem] p-16 shadow-2xl relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/[0.05] blur-[80px] pointer-events-none" />
                                            <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-red-600 mb-12 italic relative text-center">STRATEGIC FOCUS VECTORS</h2>
                                            <div className="flex flex-wrap gap-4 relative justify-center">
                                                {(calibrationResult.focus_areas || []).map((area, i) => (
                                                    <span key={i} className="px-8 py-5 bg-white border-2 border-gray-100 rounded-[1.5rem] text-[11px] font-black italic uppercase tracking-[0.2em] text-gray-950 shadow-lg hover:bg-red-600 hover:text-white hover:border-red-600 hover:scale-110 hover:-rotate-2 transition-all cursor-default">
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
        </div>
    );
}
