import { useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
    TfiUser,
    TfiArrowLeft,
    TfiCalendar,
    TfiStatsUp,
    TfiBolt,
    TfiClose,
    TfiCheck,
    TfiLayers,
} from 'react-icons/tfi';
import useFetch from '../../hooks/useFetch';
import jobService from '../../services/jobService';
import Loader from '../../components/Loader';
import '../../styles/hr.css';

const STATUS_CONFIG = {
    pending:              { label: 'Pending',             cls: 'hr-badge-pending',   color: '#6b7280' },
    reviewed:             { label: 'Reviewed',            cls: 'hr-badge-completed', color: '#3b82f6' },
    shortlisted:          { label: 'Shortlisted',         cls: 'hr-badge-active',    color: '#6366f1' },
    rejected:             { label: 'Rejected',            cls: 'hr-badge-red',       color: '#dc2626' },
    interview_scheduled:  { label: 'Interview Scheduled', cls: 'hr-badge-completed', color: '#f59e0b' },
    offer_sent:           { label: 'Offer Sent',          cls: 'hr-badge-active',    color: '#10b981' },
    hired:                { label: 'Hired ✓',             cls: 'hr-badge-active',    color: '#059669' },
};

// What actions are available from each status
const STATUS_ACTIONS = {
    pending:             ['reviewed', 'shortlisted', 'rejected'],
    reviewed:            ['shortlisted', 'rejected'],
    shortlisted:         ['interview_scheduled', 'offer_sent', 'rejected'],
    interview_scheduled: ['offer_sent', 'shortlisted', 'rejected'],
    offer_sent:          ['hired', 'rejected'],
    hired:               [],
    rejected:            ['shortlisted'],
};

const ACTION_LABELS = {
    reviewed:             { label: 'Mark Reviewed',      icon: '👁️' },
    shortlisted:          { label: 'Shortlist',          icon: '⭐' },
    rejected:             { label: 'Reject',             icon: '✕' },
    interview_scheduled:  { label: 'Mark Interviewed',  icon: '🎙️' },
    offer_sent:           { label: 'Send Offer',         icon: '📄' },
    hired:                { label: 'Mark Hired',         icon: '🚀' },
};

export default function JobApplicants() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const getJob = useCallback(() => jobService.get(jobId), [jobId]);
    const getApplicants = useCallback(() => jobService.getJobApplicants(jobId), [jobId]);

    const { data: job } = useFetch(getJob);
    const { data: jobApps, loading, refetch } = useFetch(getApplicants);
    const [selectedApp, setSelectedApp] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null); // { appId, status }

    if (loading) return <Loader text="Loading applicants..." />;

    const apps = Array.isArray(jobApps) ? jobApps : (jobApps?.results || []);

    const getScoreColor = (score) => {
        if (!score) return 'text-hr-text-muted';
        if (score >= 80) return 'text-hr-red';
        if (score >= 60) return 'text-hr-text-main font-black';
        return 'text-hr-text-muted';
    };

    const getRecommendationBadge = (rec) => {
        if (!rec) return null;
        const map = {
            strong_hire: { label: 'Strong Hire', cls: 'hr-badge-active' },
            hire: { label: 'Hire', cls: 'hr-badge-active' },
            maybe: { label: 'Maybe', cls: 'hr-badge-pending' },
            no_hire: { label: 'No Hire', cls: 'hr-badge-red' },
        };
        const item = map[rec] || { label: rec.replace('_', ' ').toUpperCase(), cls: 'hr-badge-completed' };
        return <span className={`hr-badge ${item.cls}`}>{item.label}</span>;
    };

    const getStatusBadge = (status) => {
        const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
        return <span className={`hr-badge ${cfg.cls}`}>{cfg.label}</span>;
    };

    const handleStatusUpdate = async (appId, newStatus) => {
        // For irreversible actions, require confirm click
        if (newStatus === 'rejected' || newStatus === 'hired' || newStatus === 'offer_sent') {
            if (!confirmAction || confirmAction.appId !== appId || confirmAction.status !== newStatus) {
                setConfirmAction({ appId, status: newStatus });
                return;
            }
        }
        setConfirmAction(null);
        setUpdatingId(appId);
        try {
            const res = await jobService.updateApplicationStatus(appId, newStatus);
            const updatedApp = res.data;
            toast.success(`Status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
            // Update local state
            if (selectedApp?.id === appId) {
                setSelectedApp(prev => ({ ...prev, status: updatedApp.status }));
            }
            refetch();
        } catch (err) {
            toast.error(err?.response?.data?.error || 'Failed to update status.');
        } finally {
            setUpdatingId(null);
        }
    };

    const renderActionButtons = (app, compact = false) => {
        const actions = STATUS_ACTIONS[app.status] || [];
        if (actions.length === 0) return null;
        return (
            <div className={`flex flex-wrap gap-2 ${compact ? '' : 'mt-4'}`}>
                {actions.map(action => {
                    const cfg = ACTION_LABELS[action];
                    const isConfirming = confirmAction?.appId === app.id && confirmAction?.status === action;
                    const isUpdating = updatingId === app.id;
                    const isDanger = action === 'rejected';
                    const isSuccess = action === 'hired' || action === 'offer_sent';
                    return (
                        <button
                            key={action}
                            disabled={isUpdating}
                            onClick={() => handleStatusUpdate(app.id, action)}
                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2 flex items-center gap-1.5
                                ${isConfirming
                                    ? 'bg-amber-500 border-amber-500 text-white animate-pulse'
                                    : isDanger
                                    ? 'bg-white border-red-300 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500'
                                    : isSuccess
                                    ? 'bg-white border-green-300 text-green-600 hover:bg-green-500 hover:text-white hover:border-green-500'
                                    : 'bg-white border-hr-border text-hr-text-muted hover:border-hr-black hover:text-hr-black'
                                }
                                ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                        >
                            <span>{cfg.icon}</span>
                            {isConfirming ? 'CONFIRM?' : cfg.label}
                        </button>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="hr-content">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-8">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/recruiter/jobs')}
                        className="w-12 h-12 rounded-xl bg-hr-black text-white flex items-center justify-center hover:bg-hr-red transition-all shadow-lg"
                    >
                        <TfiArrowLeft className="text-xl" />
                    </button>
                    <div>
                        <h1 className="hr-heading text-2xl">
                            {job?.title || 'Job Position'}
                        </h1>
                        <p className="hr-subheading text-[10px] mt-1">Hiring Pipeline · {apps.length} Applicant{apps.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-6 py-3 bg-white border border-hr-border rounded-xl shadow-sm">
                        <span className="text-[10px] font-black text-hr-text-muted uppercase tracking-widest flex items-center gap-3">
                            RECORDS <span className="text-hr-red text-xl leading-none">{apps.length}</span>
                        </span>
                    </div>
                    <Link
                        to={`/recruiter/ranking?jobId=${jobId}`}
                        className="btn-hr-secondary py-3 px-6 text-[10px]"
                    >
                        <TfiStatsUp /> AI RANK ALL
                    </Link>
                </div>
            </div>

            {/* Job Brief / Mission Parameters */}
            {job && (
                <div className="mb-12">
                    <div className="bg-white border-2 border-red-50 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/[0.02] blur-[80px] pointer-events-none" />
                        <div className="flex flex-col lg:flex-row gap-12 relative">
                            <div className="flex-1">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-950 text-red-600 flex items-center justify-center text-xl shadow-lg">
                                        <TfiLayers />
                                    </div>
                                    <div>
                                        <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] italic leading-none mb-1">Mission Parameters</h3>
                                        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-gray-950">Job Brief</h2>
                                    </div>
                                </div>
                                <p className="text-[11px] text-gray-500 italic leading-relaxed font-medium line-clamp-2 hover:line-clamp-none transition-all cursor-pointer">
                                    "{job.description}"
                                </p>
                            </div>
                            <div className="flex flex-wrap lg:flex-nowrap gap-8 items-center border-l-0 lg:border-l-2 border-gray-100 pl-0 lg:pl-12">
                                <div className="text-center sm:text-left">
                                    <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Compensation</div>
                                    <div className="text-xl font-black italic text-red-600">{job.salary_range || 'N/A'}</div>
                                </div>
                                <div className="text-center sm:text-left">
                                    <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Operational Area</div>
                                    <div className="text-xl font-black italic text-gray-950">{job.location || 'Remote'}</div>
                                </div>
                                <div className="text-center sm:text-left">
                                    <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Engagement</div>
                                    <div className="text-xl font-black italic text-gray-950 uppercase">{job.job_type || 'Full-Time'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {apps.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hr-card p-24 text-center border-dashed border-2 border-hr-border bg-hr-bg/30"
                >
                    <TfiLayers className="text-6xl text-hr-border mx-auto mb-6" />
                    <h3 className="hr-subheading text-lg">No Candidates Found</h3>
                    <p className="text-[10px] text-hr-text-muted italic uppercase tracking-widest mt-2">Awaiting candidate applications for this position.</p>
                </motion.div>
            ) : (
                <div className="space-y-4">
                    {apps.map((app, idx) => (
                        <motion.div
                            key={app.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="hr-card p-8 flex flex-col md:flex-row items-start md:items-center gap-8 group"
                        >
                            {/* Avatar */}
                            <div className="w-16 h-16 rounded-2xl bg-hr-black text-hr-red border border-hr-red/20 flex items-center justify-center flex-shrink-0 text-2xl font-black italic shadow-xl group-hover:scale-105 transition-all">
                                {app.candidate_name?.charAt(0)?.toUpperCase() || '?'}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-4 mb-2 flex-wrap">
                                    <h3 className="text-lg font-black text-hr-text-main uppercase italic tracking-tight truncate">{app.candidate_name}</h3>
                                    {getStatusBadge(app.status)}
                                    {getRecommendationBadge(app.recommendation)}
                                </div>
                                <p className="text-[11px] text-hr-text-muted italic mb-3 truncate font-medium">
                                    {app.candidate_headline || 'Job Applicant'}
                                </p>
                                {app.resume_skills?.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {app.resume_skills.slice(0, 4).map(s => (
                                            <span key={s} className="hr-badge hr-badge-completed text-[8px] bg-hr-bg/50">
                                                {s}
                                            </span>
                                        ))}
                                        {app.resume_skills.length > 4 && (
                                            <span className="hr-badge text-[8px] bg-hr-black text-white">
                                                +{app.resume_skills.length - 4}
                                            </span>
                                        )}
                                    </div>
                                )}
                                {renderActionButtons(app, true)}
                            </div>

                            {/* Score */}
                            <div className="flex flex-col items-center gap-1 px-6 border-l border-r border-hr-border flex-shrink-0">
                                {app.evaluation_score ? (
                                    <>
                                        <span className={`text-4xl font-black italic ${getScoreColor(app.evaluation_score)}`}>
                                            {app.evaluation_score}%
                                        </span>
                                        <span className="hr-stat-label">AI Score</span>
                                        <div className="w-16 h-1 bg-hr-bg rounded-full overflow-hidden mt-1">
                                            <div
                                                className="h-full bg-hr-red"
                                                style={{ width: `${app.evaluation_score}%` }}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-3xl font-black text-hr-border italic">—</span>
                                        <span className="hr-stat-label">No Score</span>
                                    </>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 pl-4 flex-shrink-0">
                                <button
                                    onClick={() => setSelectedApp(app)}
                                    className="p-3 text-hr-text-muted hover:text-hr-black transition-colors"
                                    title="Quick View"
                                >
                                    <TfiUser className="text-xl" />
                                </button>
                                <Link
                                    to={`/recruiter/candidates/${app.candidate_id}`}
                                    className="btn-hr-secondary py-3 px-5 text-[9px]"
                                    title="Full Profile"
                                >
                                    PROFILE
                                </Link>
                                {app.status !== 'hired' && app.status !== 'rejected' && (
                                    <Link
                                        to={`/recruiter/schedule?candidateId=${app.candidate_id}&jobId=${jobId}`}
                                        className="btn-hr-primary py-3 px-5 text-[9px]"
                                    >
                                        <TfiCalendar /> SCHEDULE
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Candidate Quick View Modal */}
            <AnimatePresence>
                {selectedApp && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-hr-black/90 backdrop-blur-xl"
                        onClick={(e) => e.target === e.currentTarget && setSelectedApp(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="w-full max-w-xl bg-white border border-hr-border rounded-[3rem] overflow-hidden shadow-2xl flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-10 py-8 border-b border-hr-border bg-hr-bg/50">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-hr-black text-hr-red border border-hr-red/20 flex items-center justify-center text-2xl font-black italic shadow-lg">
                                        {selectedApp.candidate_name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="hr-heading text-lg">{selectedApp.candidate_name}</h3>
                                        <p className="hr-subheading text-[10px]">{selectedApp.candidate_headline || 'Professional Summary'}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedApp(null)} className="w-10 h-10 rounded-xl bg-hr-black text-white flex items-center justify-center hover:bg-hr-red transition-all">
                                    <TfiClose />
                                </button>
                            </div>

                            <div className="p-10 space-y-8 overflow-y-auto flex-1">
                                {/* Current Status + Actions */}
                                <div className="p-6 bg-hr-bg rounded-2xl border border-hr-border">
                                    <div className="text-[8px] font-black text-hr-text-muted uppercase tracking-widest mb-3">HIRING STATUS</div>
                                    <div className="flex items-center gap-3 mb-4">
                                        {getStatusBadge(selectedApp.status)}
                                        {selectedApp.status === 'hired' && (
                                            <span className="text-[10px] text-green-600 font-black italic">✓ Candidate has been hired</span>
                                        )}
                                    </div>
                                    {renderActionButtons(selectedApp)}
                                </div>

                                {/* Skills */}
                                <div>
                                    <h4 className="hr-subheading mb-4">Candidate Skills</h4>
                                    <div className="flex flex-wrap gap-3">
                                        {selectedApp.resume_skills?.length > 0
                                            ? selectedApp.resume_skills.map(s => (
                                                <span key={s} className="hr-badge hr-badge-completed flex items-center gap-2 py-1.5 px-4 text-[9px]">
                                                    <TfiCheck className="text-hr-red" /> {s.toUpperCase()}
                                                </span>
                                            ))
                                            : <p className="text-[11px] text-hr-text-muted italic">No skills identified in the candidate's resume.</p>
                                        }
                                    </div>
                                </div>

                                {/* AI Evaluation */}
                                {selectedApp.evaluation_score && (
                                    <div className="p-10 bg-white text-gray-950 rounded-[2.5rem] shadow-2xl border-2 border-red-50 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/[0.03] blur-[40px] pointer-events-none" />
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-950 italic flex items-center gap-3 mb-8 relative">
                                            <TfiBolt className="text-red-600 animate-pulse" /> AI CAPABILITY MATRIX
                                        </h4>
                                        <div className="grid grid-cols-2 gap-10 items-end mb-8 relative">
                                            <div>
                                                <div className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 leading-none">OVERALL MATCH</div>
                                                <div className="text-5xl font-black italic text-red-600 tracking-tighter leading-none">
                                                    {selectedApp.evaluation_score}%
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 leading-none">RECOMMENDATION</div>
                                                <div className="flex">{getRecommendationBadge(selectedApp.recommendation)}</div>
                                            </div>
                                        </div>
                                        <div className="relative mb-8">
                                            <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden shadow-inner border border-gray-100 flex items-center">
                                                <div
                                                    className="h-full bg-red-600 shadow-[0_0_20px_rgba(230,57,70,0.4)] transition-all duration-1000"
                                                    style={{ width: `${selectedApp.evaluation_score}%` }}
                                                />
                                            </div>
                                        </div>
                                        {selectedApp.summary && (
                                            <div className="p-5 bg-gray-50 rounded-2xl border-l-4 border-red-600 relative">
                                                <p className="text-[10px] text-gray-500 italic leading-relaxed font-semibold">"{selectedApp.summary}"</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Meta */}
                                <div className="p-6 bg-hr-bg rounded-2xl border border-hr-border">
                                    <div className="text-[8px] font-black text-hr-text-muted uppercase tracking-widest mb-1">DATE APPLIED</div>
                                    <div className="text-xs font-black text-hr-text-main italic">
                                        {new Date(selectedApp.applied_at).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-10 py-8 bg-hr-bg/30 border-t border-hr-border flex gap-4 flex-wrap">
                                <button
                                    onClick={() => setSelectedApp(null)}
                                    className="btn-hr-secondary flex-1"
                                >
                                    CLOSE
                                </button>
                                <Link
                                    to={`/recruiter/candidates/${selectedApp.candidate_id}`}
                                    className="btn-hr-secondary flex-1"
                                    onClick={() => setSelectedApp(null)}
                                >
                                    <TfiUser /> FULL PROFILE
                                </Link>
                                {selectedApp.status !== 'hired' && selectedApp.status !== 'rejected' && (
                                    <Link
                                        to={`/recruiter/schedule?candidateId=${selectedApp.candidate_id}&jobId=${jobId}`}
                                        className="btn-hr-primary flex-1"
                                        onClick={() => setSelectedApp(null)}
                                    >
                                        <TfiCalendar /> SCHEDULE
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
