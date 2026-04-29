import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TfiPlus,
  TfiLocationPin,
  TfiBriefcase,
  TfiPencil,
  TfiClose,
  TfiTarget,
  TfiPulse,
  TfiArrowRight,
  TfiInfinite,
  TfiBolt,
  TfiReload,
  TfiCheck,
  TfiSearch,
} from 'react-icons/tfi';
import { useEffect, useCallback } from 'react';
import useFetch from '../../hooks/useFetch';
import jobService from '../../services/jobService';
import useAuth from '../../hooks/useAuth';
import Loader from '../../components/Loader';
import { toast } from 'sonner';
import '../../styles/hr.css';

const MOCK_LOAD_PULSE = [92, 45, 78, 12, 64];

const EMPTY_JOB = {
    title: '',
    location: 'Remote',
    job_type: 'full-time',
    salary_range: '',
    description: '',
    requirements: [],
};

export default function JobPostings() {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const listJobs = useCallback(() => jobService.list({ search }), [search]);
    const listApplications = useCallback(() => jobService.myApplications(), []);

    const { data: jobs, loading, execute: reload } = useFetch(listJobs);
    const { data: applications } = useFetch(listApplications);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            reload();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, reload]);

    const [showPostModal, setShowPostModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [posting, setPosting] = useState(false);
    const [editing, setEditing] = useState(false);
    const [newJob, setNewJob] = useState(EMPTY_JOB);
    const [editJob, setEditJob] = useState(EMPTY_JOB);

    const handleCreateJob = async () => {
        if (!newJob.title || !newJob.description) {
            toast.warning('Title and Job Description are required.');
            return;
        }
        setPosting(true);
        try {
            // Convert skills string to array if it was entered that way
            const processedJob = {
                ...newJob,
                requirements: Array.isArray(newJob.requirements) 
                    ? newJob.requirements 
                    : newJob.requirements.split(',').map(s => s.trim()).filter(s => s)
            };
            await jobService.post(processedJob);
            setShowPostModal(false);
            setNewJob(EMPTY_JOB);
            reload();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to post job. Check your recruiter profile is complete.');
        } finally {
            setPosting(false);
        }
    };

    const openEdit = (job) => {
        setEditingJob(job);
        setEditJob({
            title: job.title,
            location: job.location,
            job_type: job.job_type,
            salary_range: job.salary_range || '',
            description: job.description,
            requirements: job.requirements || [],
        });
        setShowEditModal(true);
    };

    const handleEditJob = async () => {
        if (!editJob.title || !editJob.description) {
            toast.warning('Title and Job Description are required.');
            return;
        }
        setEditing(true);
        try {
            const processedJob = {
                ...editJob,
                requirements: Array.isArray(editJob.requirements) 
                    ? editJob.requirements 
                    : editJob.requirements.split(',').map(s => s.trim()).filter(s => s)
            };
            await jobService.update(editingJob.id, processedJob);
            setShowEditModal(false);
            setEditingJob(null);
            reload();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update job.');
        } finally {
            setEditing(false);
        }
    };

    if (loading && !jobs) return <Loader fullScreen text="Loading Job Postings..." />;

    return (
        <div className="hr-content">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
                <div>
                    <h1 className="hr-heading">Job Postings</h1>
                    <p className="hr-subheading mt-2">Active Openings · Candidate Pipeline Management</p>
                </div>
                <div className="flex flex-wrap items-center gap-6 w-full md:w-auto">
                    <div className="relative group w-full md:w-[350px] flex items-center bg-white border border-gray-200 hover:border-red-500/30 focus-within:border-red-500/50 rounded-2xl shadow-xl transition-all overflow-hidden">
                        <TfiSearch className="absolute left-5 text-red-600 z-10 flex-shrink-0 transition-transform group-hover:scale-110 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="SEARCH OPENINGS..."
                            className="w-full pl-12 pr-6 py-5 bg-transparent text-gray-900 placeholder:text-gray-400 font-black italic uppercase tracking-widest text-[10px] outline-none border-none"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setShowPostModal(true)}
                        className="btn-hr-primary group py-5 px-10"
                    >
                        <TfiPlus className="group-hover:rotate-90 transition-transform duration-500" />
                        CREATE NEW JOB
                    </button>
                </div>
            </div>

            {/* Active Nodes Grid */}
            <div className="hr-grid">
            {(Array.isArray(jobs) ? jobs : (jobs?.results || [])).map((job, idx) => {
                    const appCount = (applications || []).filter(a => a.job_id === job.id).length;
                    const loadIndex = MOCK_LOAD_PULSE[idx % MOCK_LOAD_PULSE.length];

                    return (
                        <motion.div
                            key={job.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="col-6 hr-card p-8 flex flex-col gap-5 group hover:shadow-xl transition-all"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-start pb-4 border-b border-hr-border">
                                <div className="flex-1 min-w-0 pr-3">
                                    <div className="text-xs font-bold text-hr-text-muted mb-1">JOB ID #{job.id.toString().slice(-6)}</div>
                                    <h3 className="text-lg font-black text-hr-text-main leading-snug group-hover:text-hr-red transition-colors">
                                        {job.title}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg flex-shrink-0" style={{ background: 'rgba(230,57,70,0.08)' }}>
                                    <TfiPulse className="text-hr-red animate-pulse text-xs" />
                                    <span className="text-xs font-black" style={{ color: 'var(--hr-red)' }}>{loadIndex}%</span>
                                </div>
                            </div>

                            {/* Job Details */}
                            <div className="flex flex-wrap gap-3 text-sm font-semibold text-hr-text-muted">
                                <span className="flex items-center gap-1.5">
                                    <TfiLocationPin className="text-hr-red" /> {job.location || 'Remote'}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <TfiBriefcase className="text-hr-red" /> {job.job_type || 'Full-Time'}
                                </span>
                                {job.salary_range && (
                                    <span className="flex items-center gap-1.5 font-black" style={{ color: 'var(--hr-red)' }}>
                                        💰 {job.salary_range}
                                    </span>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 border border-hr-border rounded-xl overflow-hidden">
                                <div className="text-center py-5">
                                    <div className="text-3xl font-black text-hr-text-main">{appCount}</div>
                                    <div className="text-xs font-bold text-hr-text-muted uppercase tracking-wider mt-1">Candidates</div>
                                </div>
                                <div className="text-center py-5 border-l border-hr-border">
                                    <div className="text-3xl font-black">
                                        {job.is_active ? <span className="text-green-500">●</span> : <span className="text-gray-400">○</span>}
                                    </div>
                                    <div className="text-xs font-bold text-hr-text-muted uppercase tracking-wider mt-1">
                                        {job.is_active ? 'Active' : 'Closed'}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => openEdit(job)}
                                    className="flex-1 py-3 px-4 bg-white border-2 border-hr-border text-hr-text-main rounded-lg text-xs font-black uppercase hover:border-hr-red hover:text-hr-red transition-all flex items-center justify-center gap-2"
                                >
                                    <TfiPencil /> Edit
                                </button>
                                <Link
                                    to={`/recruiter/jobs/${job.id}/applicants`}
                                    className="flex-[1.5] py-3 px-4 text-white rounded-lg text-xs font-black uppercase transition-all flex items-center justify-center gap-2 shadow-md"
                                    style={{ background: 'var(--hr-red)' }}
                                >
                                    View Applicants <TfiArrowRight />
                                </Link>
                            </div>
                        </motion.div>
                    );
                })}

                {(Array.isArray(jobs) ? jobs : (jobs?.results || [])).length === 0 && (
                    <div className="col-12 py-32 text-center hr-card border-none bg-hr-bg/30">
                        <TfiInfinite className="text-6xl text-hr-border mx-auto mb-6 animate-pulse" />
                        <h3 className="hr-subheading text-lg">No Active Job Postings Found</h3>
                        <p className="text-[10px] font-black uppercase text-hr-text-muted mt-2 italic tracking-widest">Create a new job posting to start recruiting candidates.</p>
                    </div>
                )}
            </div>

            {/* ── Post Job Modal ── */}
            <AnimatePresence>
                {showPostModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-hr-black/90 backdrop-blur-xl flex items-center justify-center p-6 z-[2000]"
                        onClick={(e) => e.target === e.currentTarget && setShowPostModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-white rounded-[2.5rem] max-w-2xl w-full p-12 relative overflow-hidden shadow-2xl border border-hr-border max-h-[90vh] overflow-y-auto"
                        >
                            <button onClick={() => setShowPostModal(false)} className="absolute top-8 right-8 text-hr-text-muted hover:text-hr-black transition-colors p-2 text-xl"><TfiClose /></button>

                            <div className="flex items-center gap-6 mb-12">
                                <div className="w-16 h-16 rounded-2xl bg-gray-950 text-red-600 flex items-center justify-center text-3xl shadow-xl shadow-red-600/10">
                                    <TfiTarget className="animate-pulse" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-gray-950 mb-1 leading-none">Job Deployment</h2>
                                    <div className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] italic">Operational Mission Start</div>
                                </div>
                            </div>

                            <JobForm job={newJob} setJob={setNewJob} />

                            <div className="flex gap-6 mt-10">
                                <button onClick={() => setShowPostModal(false)} className="btn-hr-secondary flex-1 py-4">CANCEL</button>
                                <button
                                    onClick={handleCreateJob}
                                    disabled={posting}
                                    className="btn-hr-primary flex-1 py-4"
                                >
                                    {posting ? <TfiReload className="animate-spin" /> : <TfiBolt />}
                                    {posting ? 'POSTING...' : 'POST JOB'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Edit Job Modal ── */}
            <AnimatePresence>
                {showEditModal && editingJob && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-hr-black/90 backdrop-blur-xl flex items-center justify-center p-6 z-[2000]"
                        onClick={(e) => e.target === e.currentTarget && setShowEditModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-white rounded-[2.5rem] max-w-2xl w-full p-12 relative overflow-hidden shadow-2xl border border-hr-border max-h-[90vh] overflow-y-auto"
                        >
                            <button onClick={() => setShowEditModal(false)} className="absolute top-8 right-8 text-hr-text-muted hover:text-hr-black transition-colors p-2 text-xl"><TfiClose /></button>

                            <div className="flex items-center gap-6 mb-12">
                                <div className="w-16 h-16 rounded-2xl bg-gray-950 text-red-600 flex items-center justify-center text-3xl shadow-xl shadow-red-600/10">
                                    <TfiPencil />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-gray-950 mb-1 leading-none">Edit Parameters</h2>
                                    <div className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] italic">Mission Revision #{editingJob.id?.slice(-6)}</div>
                                </div>
                            </div>

                            <JobForm job={editJob} setJob={setEditJob} />

                            <div className="flex gap-6 mt-10">
                                <button onClick={() => setShowEditModal(false)} className="btn-hr-secondary flex-1 py-4">CANCEL</button>
                                <button
                                    onClick={handleEditJob}
                                    disabled={editing}
                                    className="btn-hr-primary flex-1 py-4"
                                >
                                    {editing ? <TfiReload className="animate-spin" /> : <TfiCheck />}
                                    {editing ? 'UPDATING...' : 'SAVE CHANGES'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Shared form fields for create + edit modals
function JobForm({ job, setJob }) {
    return (
        <div className="space-y-8">
            <div>
                <label className="hr-label">Job Title *</label>
                <input
                    className="hr-input"
                    value={job.title}
                    onChange={e => setJob({ ...job, title: e.target.value })}
                    placeholder="e.g. Lead Software Engineer"
                />
            </div>

            <div className="grid grid-cols-2 gap-8">
                <div>
                    <label className="hr-label">Location</label>
                    <input
                        className="hr-input"
                        value={job.location}
                        onChange={e => setJob({ ...job, location: e.target.value })}
                        placeholder="Remote / Bangalore"
                    />
                </div>
                <div>
                    <label className="hr-label">Engagement Type</label>
                    <select
                        className="hr-input font-black uppercase italic text-xs"
                        value={job.job_type}
                        onChange={e => setJob({ ...job, job_type: e.target.value })}
                    >
                        <option value="full-time">Full-Time</option>
                        <option value="part-time">Part-Time</option>
                        <option value="contract">Contract</option>
                        <option value="freelance">Freelance</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="hr-label">Salary Range</label>
                <input
                    className="hr-input"
                    value={job.salary_range}
                    onChange={e => setJob({ ...job, salary_range: e.target.value })}
                    placeholder="e.g. $150k – $220k / year"
                />
            </div>

            <div>
                <label className="hr-label text-hr-red font-black">Required Skills (Comma Separated)</label>
                <input
                    className="hr-input border-hr-red/30 shadow-sm"
                    value={Array.isArray(job.requirements) ? job.requirements.join(', ') : job.requirements}
                    onChange={e => setJob({ ...job, requirements: e.target.value })}
                    placeholder="e.g. Python, React, System Design, Communication"
                />
                <p className="text-[9px] font-bold text-gray-400 mt-2 italic uppercase">These skills are used for the Intelligent AI Match Score</p>
            </div>

            <div>
                <label className="hr-label">Job Description & Requirements *</label>
                <textarea
                    className="hr-input h-36 italic font-medium"
                    value={job.description}
                    onChange={e => setJob({ ...job, description: e.target.value })}
                    placeholder="Outline the requirements and objectives of this job role..."
                />
            </div>
        </div>
    );
}
