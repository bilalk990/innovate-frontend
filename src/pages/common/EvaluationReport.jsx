import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip
} from 'recharts';
import {
    TfiArrowLeft,
    TfiDownload,
    TfiBolt,
    TfiShield,
    TfiPulse,
    TfiMedall,
    TfiStatsUp,
    TfiFile,
    TfiHarddrives,
    TfiReload,
    TfiLightBulb,
} from 'react-icons/tfi';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import reportService from '../../services/reportService';
import useAuth from '../../hooks/useAuth';
import { toast } from 'sonner';

export default function EvaluationReport() {
    const { evalId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [offerDraft, setOfferDraft] = useState('');
    const [generatingOffer, setGeneratingOffer] = useState(false);
    const [generatingPDF, setGeneratingPDF] = useState(false);
    const reportRef = useRef(null);

    useEffect(() => {
        const fetchEval = async () => {
            try {
                const res = await reportService.getEvaluation(evalId);
                setData(res.data);
            } catch (err) {
                if (err.response?.status === 404) setError('Evaluation report not found.');
                else if (err.response?.status === 403) setError('Access restricted to authorized personnel.');
                else setError('Update failed. Please retry.');
            } finally { setLoading(false); }
        };
        if (evalId) fetchEval();
    }, [evalId]);

    const handleGenerateOffer = async () => {
        setGeneratingOffer(true);
        try {
            const res = await reportService.generateOffer(evalId);
            setOfferDraft(res.data.draft);
        } catch { toast.error('AI generation failed. Please try again.'); }
        finally { setGeneratingOffer(false); }
    };

    const downloadPDF = async () => {
        if (!reportRef.current) return;
        setGeneratingPDF(true);
        try {
            const canvas = await html2canvas(reportRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Evaluation_Report_${data?.id?.substring(0, 8)}.pdf`);
        } catch { toast.error('PDF export failed. Please try again.'); }
        finally { setGeneratingPDF(false); }
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen text-red-500 text-3xl animate-pulse"><TfiReload className="animate-spin" /></div>;
    if (error) return <div className="flex flex-col items-center justify-center min-h-screen p-10"><TfiPulse className="text-4xl text-red-500 mb-4" /><h2 className="text-xl font-black">{error}</h2></div>;
    if (!data) return null;

    const radarData = (data.criterion_results || []).map(c => ({
        subject: c.criterion.replace(/_/g, ' ').toUpperCase(),
        score: c.score,
        fullMark: 10,
    }));

    const metrics = [
        { label: 'Technical Accuracy', val: data.overall_score, color: '#E63946', icon: <TfiStatsUp /> },
        { label: 'Security Score', val: data.proctoring_score || 100, color: '#111', icon: <TfiShield /> },
        { label: 'Culture Fit', val: data.culture_fit_score || 0, color: '#E63946', icon: <TfiMedall /> },
        { label: 'Job Alignment', val: data.resume_alignment_score || 0, color: '#111', icon: <TfiBolt /> },
    ];

    return (
        <div className="elite-content">
            <style>{`@media print { .no-print { display: none !important; } }`}</style>

            {/* Actions Bar */}
            <div className="flex justify-between items-center mb-10 no-print flex-wrap gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <button onClick={() => navigate(-1)} className="btn-elite btn-elite-outline py-2 px-4 shadow-sm"><TfiArrowLeft className="mr-2" /> Back</button>
                <div className="flex gap-3">
                    {/* Feature 7 — Debrief button for candidates */}
                    {user?.role === 'candidate' && data?.candidate_visible && (
                        <button
                            onClick={() => navigate(`/candidate/evaluations/${evalId}/debrief`)}
                            className="btn-elite btn-elite-secondary py-3 px-6 shadow-lg flex items-center gap-2 text-[10px] font-black uppercase"
                        >
                            <TfiLightBulb className="text-yellow-500" /> AI Debrief & Coaching
                        </button>
                    )}
                    <button onClick={downloadPDF} disabled={generatingPDF} className="btn-elite btn-elite-primary py-3 px-6 shadow-xl">
                        <TfiDownload className="mr-2" /> {generatingPDF ? 'Generating...' : 'Download PDF Audit'}
                    </button>
                </div>
            </div>

            <div ref={reportRef} className="bg-white rounded-[24px] overflow-hidden shadow-2xl border border-gray-100 p-12 max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-12 border-b border-gray-100 mb-12 gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-red-500/30">I</div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Evaluation Report</h1>
                        </div>
                        <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">AI Assessment Report · Confidential</p>
                    </div>
                    <div className="text-left md:text-right">
                        <div className="text-sm font-black text-gray-900 mb-1">{data.candidate_name || 'Top Candidate'}</div>
                        <div className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4">Report ID: #{data.id?.substring(0, 8) || 'N/A'}</div>
                        <div className="elite-badge badge-green">Verified Result</div>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-12">
                    {/* Performance Heatmap */}
                    <div className="col-span-12 md:col-span-7 space-y-8">
                        <h3 className="text-lg font-black text-gray-900 border-l-4 border-red-500 pl-4 mb-8">Performance Heatmap</h3>
                        <div className="grid grid-cols-2 gap-8">
                            {metrics.map(m => (
                                <div key={m.label} className="elite-card md:p-6 border-none bg-gray-50/50 hover:bg-white transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="text-red-500 text-lg">{m.icon}</div>
                                        <div className="text-2xl font-black text-gray-900">{m.val}%</div>
                                    </div>
                                    <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">{m.label}</div>
                                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: m.val + '%' }}
                                            transition={{ duration: 1.5, delay: 0.5 }}
                                            className="h-full bg-red-500"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Assessment Summary Radar */}
                    <div className="col-span-12 md:col-span-5">
                        <h3 className="text-lg font-black text-gray-900 border-l-4 border-gray-900 pl-4 mb-8">Skill Alignment</h3>
                        <div className="h-[300px] w-full bg-gray-900 rounded-[24px] p-6 shadow-xl">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={radarData}>
                                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 8, fontWeight: 800 }} />
                                    <Radar name="Score" dataKey="score" stroke="#E63946" strokeWidth={3} fill="#E63946" fillOpacity={0.4} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Mission Parameters / Job Brief */}
                <div className="mb-16">
                    <div className="bg-gray-50 border-2 border-gray-100 rounded-[2.5rem] p-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/[0.02] blur-[80px] pointer-events-none" />
                        <div className="flex flex-col lg:flex-row gap-12 relative">
                            <div className="flex-1">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-950 text-red-600 flex items-center justify-center text-xl shadow-lg">
                                        <TfiHarddrives />
                                    </div>
                                    <div>
                                        <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] italic leading-none mb-1">Target Mission</h3>
                                        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-gray-950">{data.job_title || 'Autonomous Role'}</h2>
                                    </div>
                                </div>
                                <p className="text-[11px] text-gray-500 italic leading-relaxed font-medium line-clamp-2 hover:line-clamp-none transition-all cursor-pointer">
                                    "{data.job_description || 'No specialized description provided for this operational slot.'}"
                                </p>
                            </div>
                            <div className="flex flex-wrap lg:flex-nowrap gap-8 items-center border-l-0 lg:border-l-2 border-gray-100 pl-0 lg:pl-12">
                                <div className="text-center sm:text-left">
                                    <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Compensation</div>
                                    <div className="text-xl font-black italic text-red-600">{data.salary_range || 'N/A'}</div>
                                </div>
                                <div className="text-center sm:text-left">
                                    <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Operational Area</div>
                                    <div className="text-xl font-black italic text-gray-950">{data.location || 'Remote'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Executive Summary */}
                <div className="mt-16 bg-white border-2 border-red-50 p-12 rounded-[3.5rem] text-gray-950 relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/[0.03] blur-[100px] pointer-events-none group-hover:bg-red-600/[0.05] transition-all" />
                    <div className="flex items-center gap-6 mb-10 relative">
                        <div className="w-14 h-14 rounded-2xl bg-gray-950 text-red-600 flex items-center justify-center text-2xl shadow-xl animate-pulse">
                            <TfiBolt />
                        </div>
                        <div>
                            <h3 className="text-xl font-black italic uppercase tracking-tighter text-gray-950">AI Analysis Summary</h3>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] italic mt-1">Behavioral & Cognitive Diagnostics</p>
                        </div>
                    </div>
                    
                    <p className="text-[15px] font-medium leading-relaxed text-gray-600 italic border-l-4 border-red-600 pl-8 mb-12 py-2">
                        {data.behavioral_summary || "The candidate profile shows high technical proficiency and strong communication skills for professional roles."}
                    </p>

                    {/* AI HIRING RECOMMENDATION - NEW FEATURE */}
                    <div className="mb-12 p-8 rounded-3xl border-2 relative overflow-hidden" style={{
                        backgroundColor: data.overall_score >= 70 ? 'rgba(16, 185, 129, 0.05)' : data.overall_score >= 50 ? 'rgba(251, 191, 36, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                        borderColor: data.overall_score >= 70 ? 'rgba(16, 185, 129, 0.2)' : data.overall_score >= 50 ? 'rgba(251, 191, 36, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                    }}>
                        <div className="absolute top-0 right-0 w-48 h-48 blur-[80px] pointer-events-none" style={{
                            backgroundColor: data.overall_score >= 70 ? 'rgba(16, 185, 129, 0.1)' : data.overall_score >= 50 ? 'rgba(251, 191, 36, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                        }} />
                        
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg" style={{
                                    backgroundColor: data.overall_score >= 70 ? '#10b981' : data.overall_score >= 50 ? '#fbbf24' : '#ef4444',
                                    color: '#fff'
                                }}>
                                    {data.overall_score >= 70 ? '✓' : data.overall_score >= 50 ? '⚠' : '✗'}
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-1" style={{
                                        color: data.overall_score >= 70 ? '#10b981' : data.overall_score >= 50 ? '#fbbf24' : '#ef4444'
                                    }}>
                                        AI HIRING RECOMMENDATION
                                    </h4>
                                    <p className="text-2xl font-black italic uppercase tracking-tighter" style={{
                                        color: data.overall_score >= 70 ? '#10b981' : data.overall_score >= 50 ? '#fbbf24' : '#ef4444'
                                    }}>
                                        {data.overall_score >= 70 ? 'RECOMMENDED FOR HIRE' : data.overall_score >= 50 ? 'CONDITIONAL RECOMMENDATION' : 'NOT RECOMMENDED'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">Overall Score</div>
                                <div className="text-4xl font-black italic" style={{
                                    color: data.overall_score >= 70 ? '#10b981' : data.overall_score >= 50 ? '#fbbf24' : '#ef4444'
                                }}>
                                    {data.overall_score}%
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 p-6 bg-white/50 rounded-2xl border border-white/50 backdrop-blur-sm">
                            <p className="text-[12px] font-medium text-gray-700 leading-relaxed">
                                {data.overall_score >= 70 ? (
                                    <>
                                        <strong className="text-emerald-700">Strong candidate profile.</strong> The candidate demonstrates excellent technical competency ({data.overall_score}%), high integrity (proctoring score: {data.proctoring_score ?? 100}%), and strong communication skills. {data.confidence_score >= 70 ? 'Confidence indicators are positive.' : ''} Recommended to proceed with offer discussion.
                                    </>
                                ) : data.overall_score >= 50 ? (
                                    <>
                                        <strong className="text-yellow-700">Moderate candidate profile.</strong> The candidate shows acceptable performance ({data.overall_score}%) but has areas requiring improvement. {data.proctoring_score < 80 ? 'Integrity concerns detected. ' : ''}{data.confidence_score < 50 ? 'Confidence levels are below optimal. ' : ''}Consider additional assessment or targeted interview rounds before final decision.
                                    </>
                                ) : (
                                    <>
                                        <strong className="text-red-700">Below threshold performance.</strong> The candidate scored {data.overall_score}%, which is below the recommended hiring threshold. {data.proctoring_score < 80 ? 'Multiple integrity violations detected. ' : ''}{data.confidence_score < 50 ? 'Low confidence indicators observed. ' : ''}Not recommended for this position at this time.
                                    </>
                                )}
                            </p>
                        </div>

                        <div className="mt-6 grid grid-cols-3 gap-4 relative z-10">
                            <div className="text-center p-4 bg-white/30 rounded-xl border border-white/50">
                                <div className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-2">Technical</div>
                                <div className="text-2xl font-black" style={{
                                    color: data.overall_score >= 70 ? '#10b981' : data.overall_score >= 50 ? '#fbbf24' : '#ef4444'
                                }}>
                                    {data.overall_score >= 70 ? 'Strong' : data.overall_score >= 50 ? 'Moderate' : 'Weak'}
                                </div>
                            </div>
                            <div className="text-center p-4 bg-white/30 rounded-xl border border-white/50">
                                <div className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-2">Integrity</div>
                                <div className="text-2xl font-black" style={{
                                    color: (data.proctoring_score ?? 100) >= 80 ? '#10b981' : (data.proctoring_score ?? 100) >= 50 ? '#fbbf24' : '#ef4444'
                                }}>
                                    {(data.proctoring_score ?? 100) >= 80 ? 'Clean' : (data.proctoring_score ?? 100) >= 50 ? 'Caution' : 'Risk'}
                                </div>
                            </div>
                            <div className="text-center p-4 bg-white/30 rounded-xl border border-white/50">
                                <div className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-2">Confidence</div>
                                <div className="text-2xl font-black" style={{
                                    color: (data.confidence_score ?? 50) >= 70 ? '#10b981' : (data.confidence_score ?? 50) >= 50 ? '#fbbf24' : '#ef4444'
                                }}>
                                    {(data.confidence_score ?? 50) >= 70 ? 'High' : (data.confidence_score ?? 50) >= 50 ? 'Medium' : 'Low'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 mb-10">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                           <div className={`w-2 h-2 rounded-full ${data.confidence_score >= 70 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                           <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                               Confidence: {data.confidence_score >= 80 ? 'High' : data.confidence_score >= 50 ? 'Moderate' : 'Low'} ({data.confidence_score ?? 'N/A'}%)
                           </span>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                           <div className={`w-2 h-2 rounded-full ${data.proctoring_score >= 80 ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
                           <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                               Integrity: {data.proctoring_score ?? 100}% · {data.tab_switch_count > 0 ? `${data.tab_switch_count} violations` : 'Clean'}
                           </span>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                           <div className={`w-2 h-2 rounded-full ${data.recommendation === 'hire' ? 'bg-emerald-500' : data.recommendation === 'maybe' ? 'bg-yellow-400' : 'bg-red-500'}`} />
                           <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                               Verdict: {(data.recommendation || 'pending').toUpperCase()}
                           </span>
                        </div>
                    </div>

                    {/* Strengths & Weaknesses from backend */}
                    {((data.strengths?.length > 0) || (data.weaknesses?.length > 0)) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                            {data.strengths?.length > 0 && (
                                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                                    <h4 className="text-[10px] font-black uppercase text-emerald-700 tracking-widest mb-4">✅ Strengths</h4>
                                    <ul className="space-y-2">
                                        {data.strengths.map((s, i) => (
                                            <li key={i} className="text-[11px] text-emerald-800 font-medium flex gap-2">
                                                <span className="text-emerald-500 mt-0.5">•</span>{s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {data.weaknesses?.length > 0 && (
                                <div className="p-6 bg-red-50 rounded-2xl border border-red-100">
                                    <h4 className="text-[10px] font-black uppercase text-red-700 tracking-widest mb-4">⚠️ Areas to Improve</h4>
                                    <ul className="space-y-2">
                                        {data.weaknesses.map((w, i) => (
                                            <li key={i} className="text-[11px] text-red-800 font-medium flex gap-2">
                                                <span className="text-red-500 mt-0.5">•</span>{w}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Criterion Breakdown from backend */}
                    {data.criterion_results?.length > 0 && (
                        <div className="mt-10">
                            <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-6 border-l-4 border-red-600 pl-4">Criterion Breakdown</h4>
                            <div className="space-y-4">
                                {data.criterion_results.map((c, i) => (
                                    <div key={i} className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-black uppercase text-gray-700 tracking-widest">{c.criterion.replace(/_/g, ' ')}</span>
                                            <span className="text-sm font-black text-gray-900">{c.score}/{c.max_score}</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
                                            <div
                                                className="h-full bg-red-500 rounded-full transition-all"
                                                style={{ width: `${(c.score / c.max_score) * 100}%` }}
                                            />
                                        </div>
                                        {c.explanation && (
                                            <p className="text-[10px] text-gray-400 italic">{c.explanation}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Offer Letter Module */}
                <div className="mt-12 no-print">
                    {!offerDraft ? (
                        <button 
                            onClick={handleGenerateOffer}
                            disabled={generatingOffer}
                            className="bg-black text-white w-full py-6 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] shadow-xl group hover:bg-red-600 transition-all"
                        >
                            {generatingOffer ? '... Generating AI Draft' : '✨ Generate AI Offer Letter Draft'} <TfiBolt className="ml-2 group-hover:scale-125 transition-transform" />
                        </button>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="elite-card border-2 border-red-500 p-10 bg-red-50/10"
                        >
                            <h3 className="text-xl font-black mb-6 flex items-center gap-3"><TfiFile className="text-red-500" /> Professional Summary & Offer</h3>
                            <div className="p-8 bg-white border border-red-100 rounded-xl font-mono text-xs leading-relaxed text-gray-700 whitespace-pre-wrap shadow-inner h-[400px] overflow-y-auto">
                                {offerDraft}
                            </div>
                            <div className="mt-6 text-center">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">This document is AI-generated for internal HR review purposes.</p>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Footer Signature */}
                <div className="mt-20 pt-8 border-t border-gray-50 flex justify-between items-center opacity-30 text-[10px] font-black uppercase tracking-widest">
                    <span>Generated by InnovAIte AI Engine</span>
                    <span>Copyright © 2026 InnovAIte Interview Guardian</span>
                    <span>v4.2.2-stable</span>
                </div>
            </div>
        </div>
    );
}
