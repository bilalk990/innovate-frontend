import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    TfiCloudUp, 
    TfiFile, 
    TfiCheck, 
    TfiInfoAlt, 
    TfiTime, 
    TfiLink, 
    TfiLocationPin, 
    TfiBriefcase, 
    TfiHarddrives,
    TfiReload,
    TfiBolt,
    TfiTarget,
    TfiStatsUp,
    TfiPulse,
    TfiShield,
    TfiTarget as TfiTargetIcon,
    TfiMapAlt,
    TfiLayers,
    TfiClose
} from 'react-icons/tfi';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import resumeService from '../../services/resumeService';
import { formatDate } from '../../utils/formatDate';
import useFetch from '../../hooks/useFetch';
import { toast } from 'sonner';

export default function ResumeUpload() {
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const [atsReview, setAtsReview] = useState(null);
    const [atsLoading, setAtsLoading] = useState(false);
    const [atsTab, setAtsTab] = useState('score');
    const fileRef = useRef();

    const { data: resumes, loading, execute: reload } = useFetch(
        () => resumeService.list(), true
    );
    const activeResume = (resumes || []).find((r) => r.is_active);

    const POLL_LIMIT = 20;
    const [pollCount, setPollCount] = useState(0);
    const [parseTimedOut, setParseTimedOut] = useState(false);

    useEffect(() => {
        setParseTimedOut(false);
        setPollCount(0);
    }, [activeResume?.id]);

    useEffect(() => {
        let interval;
        const status = activeResume?.parse_status?.toLowerCase();
        if ((status === 'pending' || status === 'processing') && pollCount < POLL_LIMIT) {
            interval = setInterval(() => {
                setPollCount(prev => prev + 1);
                reload();
            }, 3000);
        } else if (pollCount >= POLL_LIMIT && (status === 'pending' || status === 'processing')) {
            setParseTimedOut(true);
        }
        return () => clearInterval(interval);
    }, [activeResume?.parse_status, activeResume?.id, reload, pollCount]);

    const isParsed = activeResume?.parse_status?.toLowerCase() === 'completed' || activeResume?.parse_status?.toLowerCase() === 'parsed';

    const handleAtsReview = async () => {
        setAtsLoading(true); setAtsReview(null);
        try {
            const r = await resumeService.atsReview({ resume_id: activeResume?.id });
            setAtsReview(r.data);
            toast.success('ATS review complete!');
        } catch { toast.error('ATS review failed. Try again.'); }
        finally { setAtsLoading(false); }
    };
    const isAnalyzing = activeResume?.parse_status?.toLowerCase() === 'pending' || activeResume?.parse_status?.toLowerCase() === 'processing';

    // Calculate dynamic gauge score from backend (with proper fallback)
    const qualityScore = activeResume?.parsed_data?.quality_score ?? (activeResume?.parsed_data ? 50 : 0);
    const dynamicGaugeData = [
        { name: 'Match', value: qualityScore },
        { name: 'Gap', value: 100 - qualityScore },
    ];

    const doUpload = async (file) => {
        if (!file) return;

        if (file.size > 20 * 1024 * 1024) {
            return setUploadError('File too large. Maximum size is 20MB.');
        }

        const allowed = ['.pdf', '.txt', '.docx', '.doc'];
        const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        if (!allowed.includes(ext)) {
            return setUploadError(`Unsupported file type. Allowed: ${allowed.join(', ')}`);
        }

        setUploading(true);
        setUploadError('');
        const fd = new FormData();
        fd.append('resume', file);
        try {
            console.log('[Resume] Starting upload for:', file.name);
            const res = await resumeService.upload(fd);
            console.log('[Resume] Upload success:', res.data);
            reload();
        } catch (err) {
            console.error('[Resume] Upload error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                headers: err.response?.headers,
                config: err.config
            });
            setUploadError(err.response?.data?.error || 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="animate-fade-in pb-20 px-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                <div>
                    <h1 className="elite-tactical-header">Resume Analysis</h1>
                    <p className="elite-sub-header mt-2 text-gray-400 font-black uppercase tracking-[0.4em] text-[10px] italic">AI Resume Processing · {resumes?.length || 0} Saved Documents</p>
                </div>
                <div className="flex gap-4">
                    <div className="elite-glass-panel py-3 px-6 border-emerald-500/20 bg-emerald-500/5 text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 italic">
                        <TfiShield className="text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" /> SYSTEM SECURE
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Primary Upload & Analysis Segment */}
                <div className="lg:col-span-8 space-y-12">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`elite-glass-panel p-20 text-center group cursor-pointer border-dashed border-2 relative overflow-hidden transition-all duration-700 ${dragOver ? 'border-red-600 bg-red-600/10' : 'border-white/10 hover:border-red-600/30'}`}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => { e.preventDefault(); setDragOver(false); doUpload(e.dataTransfer.files[0]); }}
                        onClick={() => fileRef.current?.click()}
                    >
                        <div className="absolute inset-0 bg-red-600/[0.02] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        
                        <input ref={fileRef} type="file" accept=".pdf,.txt,.docx,.doc" className="hidden"
                            onChange={(e) => doUpload(e.target.files[0])} />
                        
                        <div className="w-24 h-24 rounded-[2rem] bg-red-600 flex items-center justify-center text-white text-4xl mx-auto mb-10 shadow-[0_0_40px_rgba(220,38,38,0.4)] transition-transform group-hover:scale-110 duration-500 relative z-10">
                            <TfiCloudUp className={uploading ? 'animate-bounce' : ''} />
                        </div>
                        <h3 className="text-3xl font-black mb-4 uppercase italic tracking-tighter text-white relative z-10 transition-colors group-hover:text-red-500">
                            {uploading ? 'Processing Document...' : 'Upload New Resume'}
                        </h3>
                        <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.5em] mb-12 max-w-sm mx-auto italic relative z-10">
                            PDF / DOCX · MAX 10MB · AI ANALYSIS
                        </p>
                        
                        <div className="relative z-10 space-y-6">
                            <button className="bg-white text-black px-12 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] hover:bg-black hover:text-white transition-all shadow-2xl italic active:scale-95 group-hover:bg-red-600 group-hover:text-white">UPLOAD RESUME</button>
                            {uploadError && (
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-600 text-[10px] font-black uppercase tracking-widest italic">{uploadError}</motion.p>
                            )}
                        </div>

                        {uploading && (
                            <motion.div 
                                className="absolute bottom-0 left-0 h-1 bg-red-600 shadow-[0_0_20px_#dc2626]"
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            />
                        )}
                    </motion.div>

                    {/* Processing Indicator */}
                    {isAnalyzing && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-12 elite-glass-panel border-white/5 bg-black/60 text-white text-center relative overflow-hidden group shadow-[0_40px_100px_rgba(0,0,0,0.6)]"
                        >
                            <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 blur-[120px] animate-pulse" />
                            <div className="w-20 h-20 rounded-3xl bg-white text-black flex items-center justify-center text-3xl mx-auto mb-10 shadow-2xl relative z-10 transition-transform group-hover:rotate-[360deg] duration-1000">
                                <TfiReload className="animate-spin" />
                            </div>
                            <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-4 relative z-10 text-white">AI Analysis in Progress</h3>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em] mb-14 relative z-10 animate-pulse italic">
                                Analyzing your professional experience...
                            </p>
                            
                            {parseTimedOut && (
                                <div className="mb-8 p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl relative z-10">
                                    <p className="text-yellow-500 text-sm font-bold mb-2">⚠️ Analysis Taking Longer Than Expected</p>
                                    <p className="text-xs text-gray-400">The system is still processing. Please wait or refresh the page.</p>
                                    <button 
                                        onClick={reload}
                                        className="mt-4 px-6 py-2 bg-yellow-500 text-black rounded-lg text-xs font-bold hover:bg-yellow-400"
                                    >
                                        Refresh Status
                                    </button>
                                </div>
                            )}
                            
                            <div className="max-w-md mx-auto relative z-10 pb-4">
                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(pollCount / POLL_LIMIT) * 100}%` }}
                                        className="h-full bg-red-600 shadow-[0_0_20px_#dc2626]"
                                    />
                                </div>
                                <div className="flex justify-between mt-8 text-[11px] font-black uppercase text-gray-700 tracking-[0.4em] italic">
                                    <span>Analysis Progress:</span>
                                    <span className="text-red-600 tracking-tighter">{Math.round((pollCount / POLL_LIMIT) * 100)}% COMPLETE</span>
                                </div>
                                <div className="mt-4 text-[9px] text-gray-600 italic">
                                    Status: {activeResume?.parse_status?.toUpperCase() || 'UNKNOWN'}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Analysis Results */}
                    <AnimatePresence mode="wait">
                        {/* Failed Status */}
                        {activeResume?.parse_status?.toLowerCase() === 'failed' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-12 elite-glass-panel border-red-500/20 bg-red-500/5 text-center"
                            >
                                <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 text-4xl mx-auto mb-6">
                                    <TfiClose />
                                </div>
                                <h3 className="text-2xl font-black uppercase italic text-red-500 mb-4">Analysis Failed</h3>
                                <p className="text-sm text-gray-400 mb-8">
                                    We couldn't extract information from your resume. Please try uploading again or use a different format.
                                </p>
                                <button
                                    onClick={() => fileRef.current?.click()}
                                    className="px-8 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700"
                                >
                                    Upload New Resume
                                </button>
                                {activeResume.parsed_data?.error && (
                                    <div className="mt-6 p-4 bg-black/40 rounded-lg text-xs text-gray-500 font-mono">
                                        Error: {activeResume.parsed_data.error}
                                    </div>
                                )}
                            </motion.div>
                        )}
                        
                        {isParsed && (
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-12"
                            >
                                <div className="elite-glass-panel p-12 relative overflow-hidden group bg-black/40">
                                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/[0.03] blur-[150px] pointer-events-none transition-opacity group-hover:opacity-100 opacity-50" />
                                    
                                    <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-10">
                                        <div>
                                            <h3 className="text-[12px] font-black text-white italic uppercase tracking-[0.5em] flex items-center gap-4">
                                                <TfiPulse className="text-red-700 animate-pulse shadow-[0_0_10px_#dc2626]" /> RESUME ANALYSIS REPORT
                                            </h3>
                                            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-500 mt-2 italic border-l border-red-900 pl-4 ml-8">Analysis Quality: High</p>
                                        </div>
                                        <div className="px-6 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] italic shadow-2xl">
                                            ANALYSIS COMPLETE
                                        </div>
                                    </div>
 
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
                                        {/* Match Gauge */}
                                        <div className="md:col-span-5 flex flex-col items-center">
                                            <div className="w-full h-[220px] relative">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie data={dynamicGaugeData} innerRadius={70} outerRadius={90} startAngle={180} endAngle={0} dataKey="value">
                                                            <Cell fill="#dc2626" stroke="none" className="drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
                                                            <Cell fill="rgba(255,255,255,0.03)" stroke="none" />
                                                        </Pie>
                                                    </PieChart>
                                                </ResponsiveContainer>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center pt-14">
                                                    <div className="text-6xl font-black text-gray-950 italic tracking-tighter leading-none">{qualityScore}%</div>
                                                    <div className="text-[10px] font-black text-gray-950 uppercase tracking-[0.5em] mt-3 italic">Overall Match</div>
                                                </div>
                                            </div>
                                            <div className="text-[10px] font-black uppercase text-center mt-6 text-gray-700 tracking-[0.3em] italic">Market Relevance Score</div>
                                        </div>
 
                                        {/* AI Feedback Terminal */}
                                        <div className="md:col-span-7 space-y-8">
                                            <div className="p-8 bg-white/[0.01] rounded-[2rem] border border-white/5 text-white relative group/feedback shadow-2xl">
                                                <div className="absolute inset-0 bg-red-600/[0.02] opacity-0 group-hover/feedback:opacity-100 transition-opacity" />
                                                <div className="text-[9px] font-black uppercase text-red-700 tracking-[0.5em] mb-6 italic flex items-center gap-3">
                                                    <TfiTargetIcon /> Professional AI Feedback
                                                </div>
                                                <p className="text-[15px] font-medium leading-relaxed italic text-gray-400 border-l border-red-600/30 pl-6">
                                                    "{activeResume.parsed_data?.summary || 'Standard professional summary detected. Your profile aligns well with current industry requirements.'}"
                                                </p>
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-2 pt-4">
                                                {activeResume.parsed_data?.skills?.map((s, i) => (
                                                    <span key={i} className="bg-white/5 border border-white/10 text-gray-400 px-5 py-2.5 rounded-xl text-[10px] font-black hover:border-red-600/50 hover:bg-red-600/10 hover:text-white transition-all uppercase tracking-widest italic group-hover:scale-105 duration-300">
                                                        #{s.toUpperCase()}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    {/* Work Experience */}
                                    <div className="elite-glass-panel p-10 group hover:border-red-600/20 transition-all bg-black/40">
                                          <h4 className="text-[11px] font-black uppercase text-white tracking-[0.6em] mb-12 flex items-center gap-4 italic">
                                             <TfiMapAlt className="text-red-700 shadow-[0_0_10px_rgba(220,38,38,0.4)]" /> WORK EXPERIENCE TIMELINE
                                          </h4>
                                          <div className="space-y-12 relative">
                                             <div className="absolute left-[3px] top-6 bottom-6 w-[1px] bg-red-600/10" />
                                             {activeResume.parsed_data?.experience?.map((exp, i) => (
                                                 <motion.div 
                                                     key={i} 
                                                     initial={{ opacity: 0, x: -10 }}
                                                     animate={{ opacity: 1, x: 0 }}
                                                     transition={{ delay: i * 0.1 }}
                                                     className="relative pl-12 group/item"
                                                 >
                                                     <div className="absolute left-[-2px] top-2 w-3 h-3 rounded-full bg-black border border-red-600/50 group-hover/item:bg-red-600 group-hover/item:shadow-[0_0_15px_#dc2626] transition-all" />
                                                     <div className="font-black text-lg text-white uppercase italic mb-1 transition-colors group-hover/item:text-red-500 tracking-tight leading-none">
                                                         {exp.title || exp.role || 'Position/Role'}
                                                     </div>
                                                     <div className="text-[10px] text-gray-400 font-black tracking-[0.2em] uppercase mb-4 italic">
                                                         {exp.company ?? 'Organization/Company'}
                                                     </div>
                                                     <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] bg-white/5 px-4 py-2 rounded-xl border border-white/5 italic group-hover/item:border-red-600/30 group-hover/item:text-red-600 transition-all">
                                                         {exp.duration || 'Duration not specified'}
                                                     </span>
                                                     {exp.description && (
                                                         <p className="text-[10px] text-gray-500 mt-4 leading-relaxed">
                                                             {exp.description}
                                                         </p>
                                                     )}
                                                 </motion.div>
                                             ))}
                                             {(!activeResume.parsed_data?.experience || activeResume.parsed_data.experience.length === 0) && (
                                                 <div className="py-20 text-center">
                                                     <TfiLayers className="text-6xl text-gray-900 mx-auto mb-6 opacity-30" />
                                                     <p className="text-[10px] text-gray-800 italic font-black uppercase tracking-[0.5em]">No experience data</p>
                                                 </div>
                                             )}
                                          </div>
                                     </div>

                                     {/* Education Terminal */}
                                     <div className="elite-glass-panel p-10 group hover:border-red-600/20 transition-all bg-black/40">
                                          <h4 className="text-[11px] font-black uppercase text-white tracking-[0.6em] mb-12 flex items-center gap-4 italic">
                                             <TfiTargetIcon className="text-red-700 shadow-[0_0_10px_rgba(220,38,38,0.4)]" /> EDUCATION HISTORY
                                          </h4>
                                          <div className="space-y-6">
                                             {activeResume.parsed_data?.education?.map((edu, i) => (
                                                 <motion.div 
                                                     key={i} 
                                                     initial={{ opacity: 0, scale: 0.95 }}
                                                     animate={{ opacity: 1, scale: 1 }}
                                                     transition={{ delay: i * 0.1 }}
                                                     className="bg-white/[0.02] border border-white/5 p-8 rounded-[1.5rem] hover:border-red-600/30 transition-all group/edu cursor-default shadow-2xl relative overflow-hidden"
                                                 >
                                                     <div className="absolute inset-0 bg-red-600/[0.01] opacity-0 group-hover/edu:opacity-100 transition-opacity" />
                                                     <div className="font-black text-lg text-white uppercase mb-2 italic tracking-tighter leading-none group-hover/edu:text-red-500 transition-colors">
                                                         {edu.degree || 'Degree/Certificate'}
                                                     </div>
                                                     <div className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em] mb-6 italic group-hover/edu:opacity-100 transition-opacity">
                                                         {edu.institution || 'Target Institution'}
                                                     </div>
                                                     {edu.year && (
                                                         <div className="inline-block px-5 py-2 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.4em] italic shadow-xl">
                                                             GRADUATED {edu.year}
                                                         </div>
                                                     )}
                                                 </motion.div>
                                             ))}
                                             {(!activeResume.parsed_data?.education || activeResume.parsed_data.education.length === 0) && (
                                                 <div className="py-20 text-center">
                                                     <TfiLayers className="text-6xl text-gray-900 mx-auto mb-6 opacity-30" />
                                                     <p className="text-[10px] text-gray-800 italic font-black uppercase tracking-[0.5em]">No education entries</p>
                                                 </div>
                                             )}
                                          </div>
                                     </div>
                                </div>

                                {/* ATS Review CTA + Results */}
                                <div className="elite-glass-panel p-8 bg-black/40">
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                                        <div>
                                            <h4 className="text-sm font-black uppercase tracking-widest text-white">🎯 ATS Compatibility Review</h4>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Get your ATS score, weak points & fix suggestions</p>
                                        </div>
                                        <button onClick={handleAtsReview} disabled={atsLoading}
                                            className="px-8 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-40 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 flex-shrink-0">
                                            {atsLoading ? <><TfiReload className="animate-spin" /> Analyzing...</> : <><TfiStatsUp /> Run ATS Review</>}
                                        </button>
                                    </div>

                                    {atsReview && (
                                        <div className="space-y-4">
                                            {/* Score Row */}
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                <div className="bg-white/5 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
                                                    <div className={`text-4xl font-black ${atsReview.ats_score >= 70 ? 'text-emerald-400' : atsReview.ats_score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{atsReview.ats_score}</div>
                                                    <div className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">ATS Score</div>
                                                    <div className={`text-lg font-black mt-1 ${atsReview.ats_score >= 70 ? 'text-emerald-400' : atsReview.ats_score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{atsReview.ats_grade}</div>
                                                </div>
                                                {[['Pass Rate', atsReview.estimated_pass_rate], ['Keyword Score', `${atsReview.keyword_density_score}/100`], ['Verdict', atsReview.ats_verdict]].map(([label, val]) => (
                                                    <div key={label} className="bg-white/5 rounded-xl p-3 text-center">
                                                        <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">{label}</div>
                                                        <div className="text-xs font-black text-white">{val}</div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Tabs */}
                                            <div className="flex gap-2 flex-wrap">
                                                {['score', 'weak', 'quickfixes', 'recs'].map(t => (
                                                    <button key={t} onClick={() => setAtsTab(t)}
                                                        className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${atsTab === t ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                                                        {t === 'score' ? 'Strengths' : t === 'weak' ? `Weak Points (${atsReview.weak_points?.length || 0})` : t === 'quickfixes' ? 'Quick Wins' : 'Full Plan'}
                                                    </button>
                                                ))}
                                            </div>

                                            {atsTab === 'score' && (
                                                <div className="space-y-2">
                                                    {(atsReview.strengths || []).map((s, i) => <div key={i} className="flex items-start gap-2 text-xs text-emerald-300"><span className="text-emerald-500">✓</span>{s}</div>)}
                                                    <div className="mt-3">
                                                        <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Missing Power Keywords</div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {(atsReview.missing_power_keywords || []).map((k, i) => <span key={i} className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-lg">{k}</span>)}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {atsTab === 'weak' && (
                                                <div className="space-y-3">
                                                    {(atsReview.weak_points || []).map((w, i) => (
                                                        <div key={i} className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-[10px] font-black uppercase text-red-400 bg-red-600/10 px-2 py-0.5 rounded">{w.section}</span>
                                                            </div>
                                                            <div className="text-xs text-red-300">{w.problem}</div>
                                                            <div className="text-[11px] text-gray-400 mt-1">Impact: {w.why_it_matters}</div>
                                                            <div className="text-[11px] text-emerald-300 mt-1">→ Fix: {w.fix}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {atsTab === 'quickfixes' && (
                                                <div className="space-y-2">
                                                    {(atsReview.quick_wins || []).map((q, i) => (
                                                        <div key={i} className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2.5">
                                                            <div className="w-5 h-5 rounded-lg bg-emerald-600 flex items-center justify-center text-[9px] font-black text-white flex-shrink-0">{i + 1}</div>
                                                            <span className="text-xs text-emerald-200">{q}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {atsTab === 'recs' && (
                                                <div className="space-y-2">
                                                    {(atsReview.detailed_recommendations || []).map((r, i) => (
                                                        <div key={i} className="bg-white/5 rounded-xl p-3 flex items-start gap-3">
                                                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded flex-shrink-0 ${r.priority === 'High' ? 'bg-red-500/20 text-red-400' : r.priority === 'Medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>{r.priority}</span>
                                                            <div>
                                                                <div className="text-[10px] text-gray-400 uppercase font-black">{r.category}</div>
                                                                <div className="text-xs text-gray-200 mt-0.5">{r.recommendation}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mt-2">
                                                        <div className="text-[10px] text-blue-400 font-black uppercase mb-1">Action Plan</div>
                                                        <p className="text-xs text-blue-200">{atsReview.action_plan}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Resume Details Segment */}
                <div className="lg:col-span-4 space-y-10">
                     <div className="elite-glass-panel p-10 bg-black border border-white/5 relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/10 blur-[80px] pointer-events-none transition-all group-hover:bg-red-600/20" />
                        <h3 className="text-[11px] font-black uppercase text-gray-600 tracking-[0.6em] mb-12 flex items-center gap-4 italic underline underline-offset-[12px] decoration-white/5">
                            <TfiStatsUp /> Active Resume Details
                        </h3>
                        {activeResume ? (
                            <div className="space-y-12 relative z-10">
                                <div>
                                    <div className="text-[10px] font-black text-gray-700 uppercase mb-4 tracking-[0.3em] italic">Currently Active File</div>
                                    <div className="flex items-center gap-5 p-6 bg-white/[0.02] rounded-3xl border border-white/5 group/node hover:border-red-600/50 transition-all shadow-inner">
                                        <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center text-red-600 text-2xl border border-white/5 shadow-2xl group-hover/node:bg-red-600 group-hover/node:text-white transition-all duration-700">
                                            <TfiFile />
                                        </div>
                                        <div className="overflow-hidden">
                                            <span className="font-black text-base uppercase italic truncate block text-white tracking-tighter mb-1">{activeResume.original_filename}</span>
                                            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest block opacity-50">Active Resume Document</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <div className="text-[10px] font-black text-gray-700 uppercase mb-3 tracking-[0.2em] italic">Upload Date</div>
                                        <div className="text-sm font-black text-white italic uppercase tracking-tighter">{formatDate(activeResume.uploaded_at)}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-gray-700 uppercase mb-3 tracking-[0.2em] italic">Analysis Status</div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_15px_#dc2626] animate-pulse" />
                                            <span className="font-black uppercase tracking-[0.3em] text-[11px] text-white italic">{activeResume.parse_status.toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>

                                {activeResume.parsed_data?.linkedin && (
                                    <a href={activeResume.parsed_data.linkedin} target="_blank" rel="noreferrer" className="flex items-center justify-between p-6 bg-white/[0.03] border border-white/10 rounded-[1.5rem] hover:border-red-600 hover:bg-black transition-all group/link shadow-2xl">
                                        <div className="flex items-center gap-5">
                                            <TfiShield className="text-red-700 text-xl group-hover/link:scale-125 transition-transform" />
                                            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/50 group-hover:text-white italic">LinkedIn Profile Link</span>
                                        </div>
                                        <TfiBolt className="animate-pulse text-red-600" />
                                    </a>
                                )}
                            </div>
                        ) : (
                            <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[2rem] bg-white/[0.01]">
                                <TfiPulse className="text-6xl text-gray-900 mx-auto mb-8 opacity-20 animate-pulse" />
                                <p className="text-[12px] text-gray-800 italic uppercase font-black tracking-[1em]">Awaiting Selection</p>
                            </div>
                        )}
                     </div>

                     <div className="elite-glass-panel p-10 bg-black/40">
                        <div className="flex justify-between items-center mb-12">
                            <h3 className="text-[11px] font-black uppercase text-gray-700 tracking-[0.6em] italic">Upload History</h3>
                            <button onClick={reload} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-red-600 hover:text-white border border-white/5 flex items-center justify-center text-gray-700 transition-all shadow-xl">
                                <TfiReload size={14} className="hover:rotate-180 transition-transform duration-700" />
                            </button>
                        </div>
                        <div className="space-y-6">
                            {(resumes || []).slice(0, 5).map((r, i) => (
                                <motion.div 
                                    key={r.id} 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex justify-between items-center p-5 rounded-2xl bg-white/[0.01] border border-transparent hover:border-red-600/30 hover:bg-white/[0.03] transition-all group cursor-pointer shadow-lg"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-[11px] font-black italic transition-all duration-700 ${r.is_active ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'bg-black text-gray-800 border border-white/5 group-hover:bg-gray-900'}`}>
                                            {r.is_active ? <TfiCheck /> : 'FILE'}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-[12px] font-black uppercase italic truncate max-w-[140px] tracking-tight ${r.is_active ? 'text-white' : 'text-gray-700 group-hover:text-gray-400'}`}>{r.original_filename}</span>
                                            <span className="text-[9px] text-gray-800 font-bold uppercase tracking-[0.2em] mt-1 italic">{formatDate(r.uploaded_at)}</span>
                                        </div>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full shadow-lg ${r.parse_status?.toLowerCase() === 'completed' || r.parse_status?.toLowerCase() === 'parsed' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-red-800 animate-pulse shadow-red-500/20'}`} />
                                </motion.div>
                            ))}
                        </div>
                        {(!resumes || resumes.length === 0) && (
                            <div className="py-20 text-center opacity-20">
                                <TfiHarddrives className="text-5xl mx-auto mb-6" />
                                <p className="text-[10px] font-black uppercase tracking-[0.5em]">No history found</p>
                            </div>
                        )}
                     </div>
                </div>
            </div>

            <div className="mt-32 text-center">
                <p className="text-[12px] font-black text-gray-900 uppercase tracking-[1.5em] italic opacity-40">AI Resume Analysis Service · Secure System V2.0</p>
            </div>
        </div>
    );
}
