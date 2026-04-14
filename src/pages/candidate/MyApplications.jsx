import { useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TfiBriefcase,
    TfiMapAlt,
    TfiCalendar,
    TfiCheck,
    TfiClose,
    TfiLayers,
    TfiAngleRight,
    TfiBolt,
    TfiPulse,
    TfiTarget,
    TfiCup
} from 'react-icons/tfi';
import useFetch from '../../hooks/useFetch';
import jobService from '../../services/jobService';
import Loader from '../../components/Loader';
import confetti from 'canvas-confetti';

const STATUS_CONFIG = {
    pending:              { label: 'Applied',      color: '#a3a3a3', bg: 'rgba(255,255,255,0.03)', icon: <TfiPulse className="animate-pulse" /> },
    reviewed:             { label: 'Reviewed',            color: '#34d399', bg: 'rgba(52,211,153,0.05)',  icon: <TfiCheck /> },
    shortlisted:          { label: 'Shortlisted',     color: '#818cf8', bg: 'rgba(129,140,248,0.05)', icon: <TfiTarget /> },
    rejected:             { label: 'Declined', color: '#dc2626', bg: 'rgba(220,38,38,0.05)', icon: <TfiClose /> },
    interview_scheduled:  { label: 'Interview Scheduled',      color: '#fbbf24', bg: 'rgba(251,191,36,0.05)', icon: <TfiBolt /> },
    offer_sent:           { label: 'Offer Received',     color: '#f472b6', bg: 'rgba(244,114,182,0.05)', icon: <TfiCup /> },
    hired:                { label: 'Hired',      color: '#10b981', bg: 'rgba(16,185,129,0.1)',  icon: <TfiCheck className="scale-150" /> },
};

const PIPELINE_STEPS = ['pending', 'reviewed', 'shortlisted', 'interview_scheduled', 'offer_sent', 'hired'];

function PipelineBar({ status }) {
    if (status === 'rejected') {
        return (
            <div className="flex items-center gap-4 mt-8">
                <div className="flex-1 h-0.5 bg-red-600/20 rounded-full overflow-hidden">
                    <div className="h-full bg-red-600 w-full shadow-[0_0_8px_rgba(220,38,38,0.4)]" />
                </div>
                <span className="text-[8px] font-black text-red-600 uppercase tracking-[0.3em] bg-red-600/5 px-3 py-1.5 rounded-lg italic">Application Closed</span>
            </div>
        );
    }
    const currentIdx = PIPELINE_STEPS.indexOf(status);
    return (
        <div className="flex items-center gap-2 mt-8">
            {PIPELINE_STEPS.map((step, idx) => {
                const done = idx <= currentIdx;
                const active = idx === currentIdx;
                return (
                    <div key={step} className="flex-1 relative group/step">
                        <div
                            className={`h-[3px] rounded-full transition-all duration-700 ${done ? 'bg-red-600 shadow-[0_0_12px_rgba(220,38,38,0.5)]' : 'bg-white/[0.03]'}`}
                        />
                        {active && (
                            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-600 border-2 border-white shadow-[0_0_15px_rgba(220,38,38,0.6)] animate-pulse" />
                        )}
                        <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-[7px] font-black uppercase tracking-widest opacity-0 group-hover/step:opacity-100 transition-opacity whitespace-nowrap ${done ? 'text-red-600' : 'text-gray-800'}`}>
                            {step.replace('_', ' ')}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function MyApplications() {
    const getApps = useCallback(() => jobService.myApplications(), []);
    const { data, loading } = useFetch(getApps);

    useEffect(() => {
        if (!loading && data) {
            const apps = Array.isArray(data) ? data : (data?.results || []);
            const hasHired = apps.some(app => app.status === 'hired');
            if (hasHired) {
                const duration = 4 * 1000;
                const animationEnd = Date.now() + duration;
                const defaults = { startVelocity: 40, spread: 360, ticks: 100, zIndex: 0, colors: ['#dc2626', '#ffffff', '#000000'] };

                const interval = setInterval(function() {
                    if (Date.now() > animationEnd) return clearInterval(interval);
                    confetti({ ...defaults, particleCount: 60, origin: { x: Math.random(), y: Math.random() - 0.2 } });
                }, 200);
            }
        }
    }, [loading, data]);

    if (loading) return <Loader text="Loading your applications..." />;

    const apps = Array.isArray(data) ? data : (data?.results || []);

    return (
        <div className="animate-fade-in pb-20 px-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                <div>
                    <h1 className="elite-tactical-header">My Applications</h1>
                    <p className="elite-sub-header mt-2 text-gray-500 font-black uppercase tracking-[0.4em] text-[10px] italic">Active Applications · Tracking {apps.length} Position{apps.length !== 1 ? 's' : ''}</p>
                </div>
                <Link
                    to="/candidate/jobs"
                    className="group px-8 py-5 elite-glass-panel bg-red-600 border-none text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-4 italic shadow-[0_20px_40px_-10px_rgba(220,38,38,0.4)]"
                >
                    <TfiBriefcase className="group-hover:rotate-12 transition-transform" /> BROWSE NEW JOBS
                </Link>
            </div>

            {apps.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="elite-glass-panel p-32 text-center border-dashed border-white/5 bg-white/[0.01]"
                >
                    <div className="relative inline-block mb-10">
                        <TfiLayers className="text-8xl text-gray-900 mx-auto opacity-20" />
                        <div className="absolute inset-0 border-2 border-red-600/10 rounded-full animate-pulse blur-xl" />
                    </div>
                    <h3 className="text-xl font-black uppercase italic text-gray-700 tracking-[0.4em]">No Applications</h3>
                    <p className="text-[10px] text-gray-800 font-black uppercase tracking-[0.6em] mt-4 mb-12 italic">You haven't applied to any positions yet.</p>
                    <Link
                        to="/candidate/jobs"
                        className="btn-elite-primary px-12 py-5 bg-white text-black hover:bg-red-600 hover:text-white"
                    >
                        BROWSE JOBS
                    </Link>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    <AnimatePresence>
                        {apps.map((app, idx) => {
                            const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
                            return (
                                <motion.div
                                    key={app.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="elite-glass-panel p-10 group relative hover:border-red-600/30 transition-all overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-[20rem] h-[20rem] bg-red-600/[0.02] blur-[80px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                                    
                                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-10 relative z-10">
                                        {/* Status Badge */}
                                        <div
                                            className="w-20 h-20 rounded-[2rem] flex items-center justify-center text-3xl flex-shrink-0 border border-white/5 shadow-inner transition-transform group-hover:scale-110 group-hover:bg-red-600 duration-500"
                                            style={{ background: cfg.bg, color: cfg.color }}
                                        >
                                            <span className="group-hover:text-white transition-colors">{cfg.icon}</span>
                                        </div>

                                        {/* Main Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-5 mb-4 flex-wrap">
                                                <h3 className="text-xl font-black uppercase italic text-white tracking-widest group-hover:text-red-500 transition-colors">
                                                    {app.job_title || 'Position'}
                                                </h3>
                                                <span
                                                    className="text-[9px] font-black uppercase tracking-[0.3em] italic px-4 py-2 rounded-xl border-2 shadow-lg"
                                                    style={{ color: cfg.color, borderColor: `${cfg.color}33`, background: `${cfg.color}11` }}
                                                >
                                                    {cfg.label}
                                                </span>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {app.company_name && (
                                                    <p className="text-[11px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1 flex items-center gap-3">
                                                        <TfiMapAlt className="text-red-600" /> {app.company_name}
                                                    </p>
                                                )}
                                                <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em] flex items-center gap-3 italic">
                                                    <TfiCalendar className="text-red-600/50" /> APPLIED: {new Date(app.applied_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                                                </p>
                                            </div>
                                            
                                            <PipelineBar status={app.status} />
                                        </div>

                                        {/* Actions */}
                                        <div className="flex-shrink-0 flex flex-col items-end gap-5">
                                            {app.status === 'offer_sent' && (
                                                <div className="flex items-center gap-4 px-6 py-4 bg-emerald-600/10 border border-emerald-500/20 rounded-[1.5rem] shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                                                    <TfiBolt className="text-emerald-500 animate-pulse text-xl" />
                                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] italic">OFFER RECEIVED</span>
                                                </div>
                                            )}
                                            {app.status === 'hired' && (
                                                <motion.div 
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 }, colors: ['#dc2626', '#ffffff'] });
                                                    }}
                                                    className="flex items-center gap-4 px-8 py-4 bg-red-600 text-white rounded-[1.5rem] cursor-pointer shadow-[0_15px_30px_-5px_rgba(220,38,38,0.5)]"
                                                >
                                                    <TfiCheck className="text-xl font-black" />
                                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">HIRED 🚀</span>
                                                </motion.div>
                                            )}
                                            {app.status === 'interview_scheduled' && (
                                                <Link
                                                    to="/candidate/interviews"
                                                    className="group/btn flex items-center gap-5 px-8 py-5 bg-white text-black text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-black hover:text-white transition-all shadow-2xl relative overflow-hidden italic"
                                                >
                                                    <TfiCalendar /> ENTER LOBBY <TfiAngleRight className="group-hover/btn:translate-x-2 transition-transform" />
                                                    <div className="absolute inset-x-0 bottom-0 h-1 bg-red-600/50" />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* Application Overview */}
            {apps.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-20"
                >
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Total Applications', value: apps.length, color: '#ffffff', icon: <TfiLayers /> },
                            { label: 'Active Applications', value: apps.filter(a => !['rejected', 'hired'].includes(a.status)).length, color: '#f87171', icon: <TfiPulse className="animate-pulse" /> },
                            { label: 'Shortlisted', value: apps.filter(a => ['shortlisted', 'interview_scheduled', 'offer_sent', 'hired'].includes(a.status)).length, color: '#6366f1', icon: <TfiTarget /> },
                            { label: 'Hired', value: apps.filter(a => ['offer_sent', 'hired'].includes(a.status)).length, color: '#10b981', icon: <TfiCup /> },
                        ].map((stat, i) => (
                            <div key={i} className="elite-glass-panel p-10 bg-black group hover:border-red-600/20 transition-all border-white/5 shadow-2xl overflow-hidden relative">
                                <div className="absolute top-0 right-0 text-red-600/5 group-hover:text-red-600/10 transition-colors text-6xl -mr-4 -mt-4 rotate-12">{stat.icon}</div>
                                <div className="text-5xl font-black italic tracking-tighter mb-4 text-white group-hover:scale-110 transition-transform origin-left">{stat.value}</div>
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-700 group-hover:text-gray-400 transition-colors italic">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-14 text-center">
                        <p className="text-[11px] font-black text-gray-800 uppercase tracking-[1em] italic opacity-30">Application Tracking Module</p>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
