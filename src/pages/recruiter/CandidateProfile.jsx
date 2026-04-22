import { useCallback, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    TfiArrowLeft,
    TfiUser,
    TfiBriefcase,
    TfiCalendar,
    TfiCheck,
    TfiBolt,
    TfiTarget,
    TfiLayers,
    TfiReload,
    TfiStatsUp,
} from 'react-icons/tfi';
import { toast } from 'sonner';
import useFetch from '../../hooks/useFetch';
import authService from '../../services/authService';
import resumeService from '../../services/resumeService';
import reportService from '../../services/reportService';
import jobService from '../../services/jobService';
import evaluationService from '../../services/evaluationService';
import Loader from '../../components/Loader';
import '../../styles/hr.css';

const scoreColorClass = (score) => {
    if (score >= 80) return 'text-hr-red';
    if (score >= 60) return 'text-hr-text-main';
    return 'text-hr-text-muted';
};

function HireProbabilityWidget({ evalId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const TIER_COLORS = {
        'Exceptional Hire': 'text-green-600 border-green-400 bg-green-50',
        'Strong Hire': 'text-blue-600 border-blue-400 bg-blue-50',
        'Potential Hire': 'text-yellow-600 border-yellow-400 bg-yellow-50',
        'Risky Hire': 'text-orange-600 border-orange-400 bg-orange-50',
        'Do Not Hire': 'text-red-600 border-red-400 bg-red-50',
    };

    const handlePredict = async () => {
        setLoading(true);
        try {
            const res = await evaluationService.getHireProbability(evalId);
            setData(res.data);
        } catch {
            toast.error('Prediction service unavailable.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-10 bg-white text-gray-950 rounded-[2.5rem] shadow-2xl border-2 border-red-50 relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/[0.02] blur-[80px] pointer-events-none" />
            <div className="flex items-center gap-4 mb-8 relative">
                <div className="w-12 h-12 rounded-xl bg-gray-950 text-red-600 flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform duration-500">
                    <TfiStatsUp className={!data ? "animate-pulse" : ""} />
                </div>
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-950 italic">Predictive Index</h4>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">Autonomous Hire Score</p>
                </div>
                {data && <button onClick={() => setData(null)} className="ml-auto w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors">↺</button>}
            </div>

            {!data ? (
                <>
                    <div className="p-6 bg-gray-50 rounded-2xl border-l-4 border-red-600 mb-8">
                        <p className="text-[10px] text-gray-500 italic leading-relaxed font-medium uppercase tracking-[0.1em]">AI analyzes all evaluation vectors to quantify hire probability.</p>
                    </div>
                    <button
                        onClick={handlePredict}
                        disabled={loading}
                        className="btn-hr-primary w-full py-5 text-[10px] shadow-xl shadow-red-600/10 active:scale-95 transition-all flex items-center justify-center gap-4"
                    >
                        {loading ? <TfiReload className="animate-spin text-lg" /> : <TfiBolt className="text-lg" />}
                        {loading ? 'SYNTHESIZING...' : 'COMMENCE AI PREDICTION'}
                    </button>
                </>
            ) : (
                <div className="relative">
                    {(() => {
                        const pct = data.hire_probability ?? 0;
                        const tier = pct >= 85 ? 'Exceptional Hire' : pct >= 70 ? 'Strong Hire' : pct >= 50 ? 'Potential Hire' : pct >= 30 ? 'Risky Hire' : 'Do Not Hire';
                        const tierClass = TIER_COLORS[tier] || 'text-gray-600 border-gray-400 bg-gray-50';
                        return (
                            <>
                                <div className="text-center mb-10">
                                    <div className="text-7xl font-black italic text-gray-950 leading-none tracking-tighter mb-2 group-hover:scale-110 transition-transform duration-700">{pct}%</div>
                                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-tight">Match Vector Probability</div>
                                </div>

                                <div className="p-6 bg-red-50 rounded-[2rem] border-2 border-red-100 mb-10">
                                    <div className={`text-center text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-full border-2 ${tierClass} shadow-sm italic`}>
                                        {tier}
                                    </div>
                                </div>

                                {data.recommendation && (
                                    <div className="p-5 bg-gray-50 rounded-2xl border-l-4 border-red-600 mb-6">
                                        <p className="text-[10px] text-gray-500 italic leading-relaxed font-semibold">"{data.recommendation}"</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    {data.key_factors?.length > 0 && (
                                        <div className="space-y-2 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                            {data.key_factors.slice(0, 2).map((g, i) => (
                                                <div key={i} className="flex items-center gap-2 text-[9px] text-emerald-600 font-black uppercase italic tracking-tighter truncate">
                                                    <TfiCheck className="flex-shrink-0" /> {g}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {data.risk_factors?.length > 0 && (
                                        <div className="space-y-2 p-4 bg-red-50 rounded-2xl border border-red-100">
                                            {data.risk_factors.slice(0, 2).map((r, i) => (
                                                <div key={i} className="flex items-center gap-2 text-[9px] text-red-600 font-black uppercase italic tracking-tighter truncate">
                                                    ⚠ {r}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        );
                    })()}
                </div>
            )}
        </motion.div>
    ) ;
}

function JobFitmentWidget({ candidateId, resume }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [jobDescription, setJobDescription] = useState('');

    const analyzeFitment = async () => {
        if (!resume || !jobDescription) {
            toast.error('Resume and job description required');
            return;
        }
        setLoading(true);
        try {
            const resumeData = {
                skills: resume.parsed_data?.skills || [],
                experience: resume.parsed_data?.experience || [],
                education: resume.parsed_data?.education || []
            };
            const res = await jobService.analyzeJobFitment(resumeData, jobDescription);
            setData(res.data);
            toast.success('Job fitment analysis complete!');
        } catch (error) {
            toast.error('Failed to analyze job fitment');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-10 bg-white text-gray-950 rounded-[2.5rem] shadow-2xl border-2 border-blue-50 relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/[0.02] blur-[80px] pointer-events-none" />
            <div className="flex items-center gap-4 mb-8 relative">
                <div className="w-12 h-12 rounded-xl bg-gray-950 text-blue-600 flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform duration-500">
                    <TfiTarget className={!data ? "animate-pulse" : ""} />
                </div>
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-950 italic">Job Fitment</h4>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">Deep Match Analysis</p>
                </div>
                {data && <button onClick={() => setData(null)} className="ml-auto w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors">↺</button>}
            </div>

            {!data ? (
                <>
                    <div className="mb-6">
                        <label className="text-[9px] font-black text-gray-700 uppercase tracking-wider mb-2 block">Job Description</label>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste job description here..."
                            className="w-full h-32 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-600 transition-colors resize-none"
                        />
                    </div>
                    <button
                        onClick={analyzeFitment}
                        disabled={loading || !jobDescription}
                        className="btn-hr-primary w-full py-5 text-[10px] shadow-xl shadow-blue-600/10 active:scale-95 transition-all flex items-center justify-center gap-4"
                    >
                        {loading ? <TfiReload className="animate-spin text-lg" /> : <TfiTarget className="text-lg" />}
                        {loading ? 'ANALYZING...' : 'ANALYZE JOB FIT'}
                    </button>
                </>
            ) : (
                <div className="relative space-y-6">
                    <div className="text-center">
                        <div className="text-7xl font-black italic text-blue-600 leading-none tracking-tighter mb-2 group-hover:scale-110 transition-transform duration-700">
                            {data.fitment_score}%
                        </div>
                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-tight">Overall Fitment Score</div>
                    </div>

                    <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${data.fitment_score}%` }}
                            transition={{ duration: 1.5 }}
                        />
                    </div>

                    {data.matched_skills && data.matched_skills.length > 0 && (
                        <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                            <h5 className="text-[9px] font-black text-emerald-900 uppercase tracking-wider mb-3">Matched Skills</h5>
                            <div className="flex flex-wrap gap-2">
                                {data.matched_skills.slice(0, 6).map((skill, i) => (
                                    <span key={i} className="text-[9px] font-bold px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {data.missing_skills && data.missing_skills.length > 0 && (
                        <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
                            <h5 className="text-[9px] font-black text-red-900 uppercase tracking-wider mb-3">Missing Skills</h5>
                            <div className="flex flex-wrap gap-2">
                                {data.missing_skills.slice(0, 6).map((skill, i) => (
                                    <span key={i} className="text-[9px] font-bold px-3 py-1 bg-red-100 text-red-700 rounded-full">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {data.recommendation && (
                        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                            <p className="text-[10px] text-blue-900 italic leading-relaxed font-semibold">
                                {data.recommendation}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
}

export default function CandidateProfile() {
    const { candidateId } = useParams();
    const navigate = useNavigate();

    const fetchProfile = useCallback(() => authService.getCandidateProfile(candidateId), [candidateId]);
    const fetchResume = useCallback(() => resumeService.getCandidateResume(candidateId), [candidateId]);
    const fetchEvals = useCallback(() => reportService.listEvaluations({ candidate_id: candidateId }), [candidateId]);

    const { data: profile, loading: l1 } = useFetch(fetchProfile);
    const { data: resumeList, loading: l2 } = useFetch(fetchResume);
    const { data: evalsData, loading: l3 } = useFetch(fetchEvals);

    if (l1 || l2 || l3) return <Loader text="Loading candidate profile..." />;

    const resume = (resumeList || []).find(r => r.is_active) || (resumeList || [])[0] || null;
    const parsed = resume?.parsed_data || {};
    const evals = evalsData?.results || evalsData || [];
    const latestEval = evals[0] || null;

    const skills = parsed.skills || profile?.detailed_skills || [];
    const education = parsed.education || [];
    const experience = parsed.experience || [];

    return (
        <div className="hr-content">
            {/* Header */}
            <div className="flex items-center gap-6 mb-12">
                <button
                    onClick={() => navigate(-1)}
                    className="w-12 h-12 rounded-xl bg-hr-black text-white flex items-center justify-center hover:bg-hr-red transition-all shadow-lg flex-shrink-0"
                >
                    <TfiArrowLeft className="text-xl" />
                </button>
                <div>
                    <h1 className="hr-heading text-2xl">Candidate Profile</h1>
                    <p className="hr-subheading text-[10px] mt-1">Full Resume · AI Evaluation · History</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* LEFT — Identity Card */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Profile Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="hr-card p-10 text-center relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-hr-red" />
                        {/* Avatar */}
                        {profile?.profile_pic ? (
                            <img
                                src={profile.profile_pic}
                                alt={profile.name}
                                className="w-24 h-24 rounded-[2rem] object-cover mx-auto mb-6 shadow-xl border-4 border-hr-border"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-[2rem] bg-hr-black text-hr-red border border-hr-red/20 flex items-center justify-center text-4xl font-black italic shadow-xl mx-auto mb-6">
                                {profile?.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                        )}

                        <h2 className="text-xl font-black text-hr-text-main uppercase italic tracking-tight mb-1">
                            {profile?.name || 'Unknown Candidate'}
                        </h2>
                        {profile?.headline && (
                            <p className="text-[11px] text-hr-text-muted italic font-medium mb-4">{profile.headline}</p>
                        )}
                        {profile?.bio && (
                            <p className="text-[11px] text-hr-text-muted leading-relaxed border-t border-hr-border pt-4 mt-4 text-left">
                                {profile.bio}
                            </p>
                        )}

                        <div className="mt-6 space-y-3 text-left">
                            {profile?.email && (
                                <div className="flex items-center gap-3 text-[10px] text-hr-text-muted">
                                    <span className="w-6 h-6 rounded-lg bg-hr-bg flex items-center justify-center text-hr-red flex-shrink-0">@</span>
                                    <span className="font-black truncate">{profile.email}</span>
                                </div>
                            )}
                            {profile?.phone && (
                                <div className="flex items-center gap-3 text-[10px] text-hr-text-muted">
                                    <span className="w-6 h-6 rounded-lg bg-hr-bg flex items-center justify-center text-hr-red flex-shrink-0">📞</span>
                                    <span className="font-black">{profile.phone}</span>
                                </div>
                            )}
                            {parsed.location && (
                                <div className="flex items-center gap-3 text-[10px] text-hr-text-muted">
                                    <span className="w-6 h-6 rounded-lg bg-hr-bg flex items-center justify-center text-hr-red flex-shrink-0">📍</span>
                                    <span className="font-black">{parsed.location}</span>
                                </div>
                            )}
                            {typeof parsed.total_experience_years === 'number' && (
                                <div className="flex items-center gap-3 text-[10px] text-hr-text-muted">
                                    <span className="w-6 h-6 rounded-lg bg-hr-bg flex items-center justify-center text-hr-red flex-shrink-0">
                                        <TfiBriefcase />
                                    </span>
                                    <span className="font-black">{parsed.total_experience_years}+ years experience</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex gap-3">
                            <Link
                                to={`/recruiter/schedule?candidateId=${candidateId}`}
                                className="btn-hr-primary flex-1 text-[9px]"
                            >
                                <TfiCalendar /> SCHEDULE
                            </Link>
                        </div>
                    </motion.div>

                    {/* AI Evaluation Summary */}
                    {latestEval && (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="p-10 bg-white text-gray-950 rounded-[2.5rem] shadow-2xl border-2 border-red-50 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/[0.02] blur-[80px] pointer-events-none" />
                            <div className="flex items-center gap-4 mb-10 relative">
                                <div className="w-12 h-12 rounded-xl bg-gray-950 text-red-600 flex items-center justify-center text-xl shadow-lg group-hover:bg-red-600 group-hover:text-white transition-all duration-500">
                                    <TfiBolt className="animate-pulse" />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-950 italic">AI Performance</h4>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">Evaluation Vector Data</p>
                                </div>
                            </div>

                            <div className="text-center relative mb-10">
                                <div className="text-7xl font-black italic text-red-600 leading-none tracking-tighter mb-2 group-hover:scale-110 transition-transform duration-700">
                                    {latestEval.overall_score ?? '—'}%
                                </div>
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-tight">Match Capability Score</div>
                            </div>
                            
                            <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden mb-10 shadow-inner border border-gray-100 flex items-center">
                                <div
                                    className="h-full bg-red-600 shadow-[0_0_20px_rgba(230,57,70,0.4)]"
                                    style={{ width: `${latestEval.overall_score || 0}%` }}
                                />
                            </div>

                            {latestEval.recommendation && (
                                <div className="flex justify-center mb-8 relative">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2.5 rounded-full bg-red-50 text-red-600 border-2 border-red-100 italic shadow-sm">
                                        {latestEval.recommendation.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>
                            )}

                            {latestEval.summary && (
                                <div className="p-6 bg-gray-50 rounded-2xl border-l-4 border-red-600 mb-8 relative">
                                    <p className="text-[10px] text-gray-500 italic leading-relaxed font-semibold">
                                        "{latestEval.summary}"
                                    </p>
                                </div>
                            )}

                            <Link
                                to={`/recruiter/evaluations/${latestEval.id}`}
                                className="block text-center text-[10px] font-black uppercase tracking-[0.3em] text-red-600 hover:text-gray-950 transition-colors underline underline-offset-8 italic decoration-red-200"
                            >
                                VIEW FULL OPERATIONAL REPORT →
                            </Link>
                        </motion.div>
                    )}

                    {/* Predictive Hiring Score */}
                    {latestEval && (
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                            <HireProbabilityWidget evalId={latestEval.id} />
                        </motion.div>
                    )}

                    {/* Job Fitment Analysis */}
                    {resume && (
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <JobFitmentWidget candidateId={candidateId} resume={resume} />
                        </motion.div>
                    )}
                </div>

                {/* RIGHT — Details */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Skills */}
                    {skills.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                            className="hr-card p-10"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <TfiTarget className="text-hr-red" />
                                <h3 className="hr-subheading">Technical Skills</h3>
                                <span className="hr-badge hr-badge-completed ml-auto">{skills.length} skills</span>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {skills.map((s, i) => (
                                    <span key={i} className="hr-badge hr-badge-completed flex items-center gap-2 py-2 px-4 text-[9px]">
                                        <TfiCheck className="text-hr-red" /> {typeof s === 'string' ? s.toUpperCase() : s}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Experience */}
                    {experience.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="hr-card p-10"
                        >
                            <div className="flex items-center gap-3 mb-8">
                                <TfiBriefcase className="text-hr-red" />
                                <h3 className="hr-subheading">Work Experience</h3>
                            </div>
                            <div className="space-y-6">
                                {experience.map((exp, i) => (
                                    <div key={i} className="relative pl-8 border-l-2 border-hr-border pb-6 last:pb-0 hover:border-hr-red transition-colors group">
                                        <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-hr-border group-hover:bg-hr-red transition-colors" />
                                        <div className="font-black text-hr-text-main uppercase italic text-[12px] mb-1">
                                            {exp.title || exp.role || 'Role'}
                                        </div>
                                        {exp.company && (
                                            <div className="text-[10px] text-hr-red font-black uppercase tracking-widest mb-1">{exp.company}</div>
                                        )}
                                        {exp.duration && (
                                            <div className="text-[9px] text-hr-text-muted font-black uppercase tracking-wider">{exp.duration}</div>
                                        )}
                                        {exp.description && (
                                            <p className="text-[10px] text-hr-text-muted italic mt-2 leading-relaxed">{exp.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Education */}
                    {education.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="hr-card p-10"
                        >
                            <div className="flex items-center gap-3 mb-8">
                                <TfiLayers className="text-hr-red" />
                                <h3 className="hr-subheading">Education</h3>
                            </div>
                            <div className="space-y-6">
                                {education.map((edu, i) => (
                                    <div key={i} className="relative pl-8 border-l-2 border-hr-border pb-6 last:pb-0 hover:border-hr-red transition-colors group">
                                        <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-hr-border group-hover:bg-hr-red transition-colors" />
                                        <div className="font-black text-hr-text-main uppercase italic text-[12px] mb-1">
                                            {edu.degree || 'Degree'}
                                        </div>
                                        {edu.institution && (
                                            <div className="text-[10px] text-hr-red font-black uppercase tracking-widest mb-1">{edu.institution}</div>
                                        )}
                                        {edu.year && (
                                            <div className="text-[9px] text-hr-text-muted font-black uppercase tracking-wider">{edu.year}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Criteria breakdown from latest eval */}
                    {latestEval?.criterion_results?.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="hr-card p-10"
                        >
                            <div className="flex items-center gap-3 mb-8">
                                <TfiBolt className="text-hr-red" />
                                <h3 className="hr-subheading">AI Skill Assessment Breakdown</h3>
                            </div>
                            <div className="space-y-5">
                                {latestEval.criterion_results.map((cr, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-hr-text-main italic">
                                                {cr.criterion?.replace(/_/g, ' ')}
                                            </span>
                                            <span className={`text-sm font-black italic ${scoreColorClass(cr.score * 10)}`}>
                                                {cr.score}<span className="text-[9px] text-hr-text-muted">/10</span>
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-hr-bg rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${cr.score * 10}%` }}
                                                transition={{ duration: 0.6, delay: i * 0.05 }}
                                                className="h-full bg-hr-red rounded-full"
                                            />
                                        </div>
                                        {cr.explanation && (
                                            <p className="text-[10px] text-hr-text-muted italic mt-1">{cr.explanation}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Empty state when no resume */}
                    {!resume && skills.length === 0 && experience.length === 0 && education.length === 0 && (
                        <div className="hr-card p-16 text-center border-dashed border-2 border-hr-border">
                            <TfiUser className="text-5xl text-hr-border mx-auto mb-4" />
                            <p className="text-[10px] font-black text-hr-text-muted uppercase tracking-widest italic">
                                Candidate has not uploaded a resume yet.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
