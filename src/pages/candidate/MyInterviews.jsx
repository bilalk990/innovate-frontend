import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TfiCalendar, 
  TfiTime, 
  TfiBriefcase, 
  TfiLocationPin, 
  TfiCheck, 
  TfiReload, 
  TfiArrowRight,
  TfiClose,
  TfiLayers,
  TfiShield,
  TfiStatsUp,
  TfiPulse,
  TfiBolt,
  TfiTarget,
  TfiVolume
} from 'react-icons/tfi';
import interviewService from '../../services/interviewService';
import useFetch from '../../hooks/useFetch';
import Loader from '../../components/Loader';
import { formatDateTime } from '../../utils/formatDate';

export default function MyInterviews() {
    const navigate = useNavigate();
    const listInterviews = useCallback(() => interviewService.list({ limit: 50 }), []);
    const { data: interviewsData, loading, execute: reload } = useFetch(listInterviews);

    const interviews = interviewsData?.results || interviewsData || [];

    const getStatusStyles = (status) => {
        switch (status) {
            case 'completed': return { color: '#10b981', bg: 'rgba(16,185,129,0.05)', label: 'COMPLETED' };
            case 'scheduled': return { color: '#fbbf24', bg: 'rgba(251,191,36,0.05)', label: 'SCHEDULED' };
            case 'active': return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'LIVE NOW' };
            case 'pending': return { color: '#a3a3a3', bg: 'rgba(255,255,255,0.03)', label: 'PENDING' };
            case 'cancelled': return { color: '#dc2626', bg: 'rgba(220,38,38,0.05)', label: 'CANCELLED' };
            default: return { color: '#dc2626', bg: 'rgba(220,38,38,0.05)', label: 'UNKNOWN' };
        }
    };

    if (loading && !interviews.length) return <Loader fullScreen text="Loading Interviews..." />;

    const upcoming = interviews.filter(i => ['scheduled', 'pending', 'active'].includes(i.status));
    const historical = interviews.filter(i => ['completed', 'cancelled'].includes(i.status));

    return (
        <div className="animate-fade-in-up pb-20 px-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-10">
                <div>
                    <h1 className="elite-tactical-header">My Interviews</h1>
                    <p className="elite-sub-header mt-2 text-gray-400 font-black uppercase tracking-[0.4em] text-[10px] italic">Interview Schedule · {interviews.length} Total Interviews</p>
                </div>
                <button 
                  onClick={reload} 
                  className="group elite-glass-panel py-4 px-10 border-white/5 bg-white/5 text-gray-500 hover:text-white transition-all flex items-center gap-4 italic"
                >
                    <TfiReload className="group-hover:rotate-180 transition-transform duration-1000 text-red-600" /> 
                    <span className="uppercase tracking-[0.3em] font-black text-[10px]">Refresh Schedule</span>
                </button>
            </div>

            <div className="space-y-24">
                {/* 1. Upcoming Sessions (Interview Cards) */}
                <section>
                    <div className="flex items-center gap-6 mb-12">
                        <div className="h-0.5 bg-red-600/20 flex-1" />
                        <h3 className="text-[11px] font-black uppercase tracking-[0.6em] text-white flex items-center gap-4 italic">
                            <TfiBolt className="animate-pulse text-red-600 shadow-[0_0_10px_rgba(220,38,38,0.4)]" /> LIVE & UPCOMING INTERVIEWS
                        </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {upcoming.map((iv, idx) => {
                            const styles = getStatusStyles(iv.status);
                            return (
                                <motion.div 
                                    key={iv.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="elite-glass-panel p-10 flex flex-col justify-between group hover:border-red-600/40 transition-all duration-700 bg-black/40 relative overflow-hidden shadow-2xl"
                                >
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/[0.03] blur-[60px] pointer-events-none group-hover:bg-red-600/10 transition-colors" />
                                    
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center text-2xl font-black italic shadow-[0_0_30px_rgba(255,255,255,0.1)] group-hover:bg-red-600 group-hover:text-white transition-all duration-700">IV</div>
                                            <div 
                                              className="text-[9px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-xl border border-white/5 italic"
                                              style={{ color: styles.color, background: styles.bg, borderColor: `${styles.color}22` }}
                                            >
                                                {styles.label}
                                            </div>
                                        </div>
                                        
                                        <h4 className="text-2xl font-black text-white mb-3 group-hover:text-red-500 transition-colors uppercase italic tracking-tighter leading-tight">{iv.title || 'Interview Session'}</h4>
                                        <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mb-10 flex items-center gap-4 italic">
                                            <TfiBriefcase className="text-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)]" /> {iv.job_title || 'General'}
                                        </div>
                                        
                                        <div className="space-y-5 p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] shadow-2xl relative overflow-hidden group/box">
                                            <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover/box:opacity-100 transition-opacity" />
                                            <div className="flex items-center gap-4 text-[11px] font-black uppercase italic relative z-10 text-white">
                                                <TfiCalendar className="text-red-600" />
                                                <span>{formatDateTime(iv.scheduled_at).toUpperCase()}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.3em] text-gray-500 relative z-10 italic">
                                                <TfiLocationPin className="text-gray-700" />
                                                <span>VIRTUAL INTERVIEW ROOM</span>
                                            </div>
                                            {iv.meet_link && (
                                                <a
                                                    href={iv.meet_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={e => e.stopPropagation()}
                                                    className="flex items-center justify-center gap-3 w-full py-4 mt-4 bg-emerald-600/10 border border-emerald-500/20 rounded-xl text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] hover:bg-emerald-600 hover:text-white transition-all shadow-xl italic"
                                                >
                                                    <TfiVolume className="animate-pulse" /> JOIN EXTERNAL LINK
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {(() => {
                                        const isLive = iv.status === 'active';
                                        const isScheduled = iv.status === 'scheduled' || iv.status === 'pending';
                                        
                                        // Show join button for active or scheduled interviews
                                        if (!isLive && !isScheduled) return null;

                                        return (
                                            <button 
                                                onClick={() => navigate(`/candidate/interview/lobby/${iv.room_id || iv.id}`)}
                                                className={`w-full py-6 mt-10 text-[11px] font-black uppercase tracking-[0.4em] rounded-[1.5rem] flex items-center justify-center gap-4 transition-all shadow-2xl relative overflow-hidden italic ${
                                                    isLive
                                                        ? 'bg-red-600 text-white animate-pulse shadow-[0_0_30px_rgba(220,38,38,0.4)]'
                                                        : 'bg-white text-black hover:bg-red-600 hover:text-white hover:scale-105 active:scale-95'
                                                }`}
                                            >
                                                <span className="relative z-10 flex items-center gap-3">
                                                    {isLive ? 'INTERVIEW IS LIVE — JOIN NOW' : 'ENTER INTERVIEW LOBBY'}
                                                    <TfiArrowRight className="text-lg group-hover:translate-x-3 transition-transform duration-500" />
                                                </span>
                                                {isLive && <div className="absolute inset-0 bg-white/20 animate-ping opacity-20" />}
                                            </button>
                                        );
                                    })()}
                                </motion.div>
                            );
                        })}
                    </div>
                    {upcoming.length === 0 && (
                        <div className="p-32 text-center elite-glass-panel border-dashed border-white/5 bg-white/[0.01] group">
                            <TfiCalendar className="text-8xl text-gray-900 mx-auto mb-8 opacity-20 group-hover:scale-110 transition-transform duration-700" />
                            <p className="text-[12px] font-black text-gray-700 uppercase tracking-[1em] italic">No interviews scheduled.</p>
                        </div>
                    )}
                </section>

                {/* 2. Interview History (Table) */}
                <section>
                    <div className="flex items-center gap-6 mb-12">
                        <div className="h-0.5 bg-white/5 flex-1" />
                        <h3 className="text-[11px] font-black uppercase tracking-[0.6em] text-gray-500 flex items-center gap-4 italic underline underline-offset-8 decoration-white/5">
                            <TfiLayers className="text-gray-800" /> INTERVIEW HISTORY
                        </h3>
                    </div>

                     <div className="elite-glass-panel overflow-hidden border-white/5 bg-black/60 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative group">
                        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-red-600/[0.02] blur-[150px] pointer-events-none" />
                        
                        <div className="overflow-x-auto scrollbar-tactical">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/[0.02]">
                                        <th className="py-8 px-12 text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 italic">Interview Title</th>
                                        <th className="py-8 px-12 text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 italic">Job Role</th>
                                        <th className="py-8 px-12 text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 italic">Date & Time</th>
                                        <th className="py-8 px-12 text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 italic">Status</th>
                                        <th className="py-8 px-12 text-[10px] font-black uppercase tracking-[0.5em] text-red-600 italic">Verification</th>
                                        <th className="py-8 px-12 text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 italic text-right">Interview Feedback</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {historical.map((iv, idx) => {
                                            const styles = getStatusStyles(iv.status);
                                            return (
                                                <motion.tr 
                                                    key={iv.id} 
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className="border-b border-white/5 hover:bg-white/[0.02] transition-all group/row cursor-default"
                                                >
                                                    <td className="py-10 px-12 border-l-4 border-transparent group-hover/row:border-red-600 transition-all">
                                                        <div className="font-black text-white italic uppercase text-[15px] tracking-widest group-hover/row:text-red-500 transition-colors">
                                                            {iv.title || 'PAST INTERVIEW'}
                                                        </div>
                                                    </td>
                                                    <td className="py-10 px-12">
                                                        <div className="font-black text-gray-600 text-[10px] uppercase tracking-[0.2em] italic group-hover/row:text-gray-400">
                                                            {iv.job_title}
                                                        </div>
                                                    </td>
                                                    <td className="py-10 px-12">
                                                        <div className="text-[10px] text-gray-600 font-black uppercase italic group-hover/row:text-gray-400">
                                                            {formatDateTime(iv.created_at).toUpperCase()}
                                                        </div>
                                                    </td>
                                                    <td className="py-10 px-12">
                                                        <div 
                                                          className="inline-block px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] italic border border-white/5"
                                                          style={{ color: styles.color, background: styles.bg, borderColor: `${styles.color}11` }}
                                                        >
                                                            {styles.label}
                                                        </div>
                                                    </td>
                                                    <td className="py-10 px-12">
                                                        <div className="flex items-center gap-4 font-black text-white text-[11px] italic group-hover/row:scale-110 transition-transform origin-left">
                                                            <TfiShield className="text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" /> VERIFIED
                                                        </div>
                                                    </td>
                                                    <td className="py-10 px-12 text-right">
                                                        {iv.evaluation_id ? (
                                                            <button 
                                                                onClick={() => navigate(`/candidate/evaluations/${iv.evaluation_id}`)}
                                                                className="px-8 py-4 bg-white text-black text-[9px] font-black uppercase tracking-[0.3em] rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-2xl italic group/btn"
                                                            >
                                                                VIEW FEEDBACK <TfiStatsUp className="inline ml-2 group-hover/btn:translate-y-[-2px] transition-transform" />
                                                            </button>
                                                        ) : (
                                                            <span className="text-[9px] font-black text-gray-800 uppercase tracking-[0.4em] italic animate-pulse">Processing Feedback...</span>
                                                        )}
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                        
                        {historical.length === 0 && (
                            <div className="p-32 text-center bg-black/20">
                                <TfiLayers className="text-7xl text-gray-900 mx-auto mb-8 opacity-20" />
                                <p className="text-[12px] font-black text-gray-800 uppercase tracking-[1em] italic">No past interviews found.</p>
                            </div>
                        )}
                     </div>
                </section>
            </div>
            
            <div className="mt-24 text-center">
                <p className="text-[11px] font-black text-gray-800 uppercase tracking-[1.2em] italic opacity-30">Interview Management System</p>
            </div>
        </div>
    );
}
