import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TfiDashboard, 
  TfiBriefcase, 
  TfiUser, 
  TfiStatsUp, 
  TfiTarget, 
  TfiCalendar, 
  TfiShield, 
  TfiBolt, 
  TfiPulse, 
  TfiInfinite, 
  TfiAlert, 
  TfiHarddrives, 
  TfiArrowTopRight 
} from 'react-icons/tfi';
import useFetch from '../../hooks/useFetch';
import authService from '../../services/authService';
import interviewService from '../../services/interviewService';
import reportService from '../../services/reportService';
import Loader from '../../components/Loader';
import api from '../../api/axios';

export default function AdminDashboard() {
    const listInterviews = useCallback(() => interviewService.list({ limit: 50 }), []);
    const getAuditLogs = useCallback(() => api.get('/auth/audit-logs/'), []);

    const { data: users, loading: l1 } = useFetch(authService.getUsers);
    const { data: interviewsData, loading: l2 } = useFetch(listInterviews);
    const interviews = Array.isArray(interviewsData) ? interviewsData : (interviewsData?.results || []);
    const { data: evaluationsData, loading: l3 } = useFetch(reportService.listEvaluations);
    const evaluations = Array.isArray(evaluationsData) ? evaluationsData : (evaluationsData?.results || []);
    const { data: auditLogsData, loading: l4 } = useFetch(getAuditLogs);
    const auditLogs = auditLogsData?.data || [];

    // AI Status Check
    const [aiStatus, setAiStatus] = useState(null);
    useEffect(() => {
        reportService.checkAIStatus().then(setAiStatus);
    }, []);

    if (l1 || l2 || l3 || l4) return <Loader fullScreen text="Synchronizing Platform Data..." />;

    const usersArray = Array.isArray(users) ? users : (users?.results || []);
    const totalUsers = users?.total ?? usersArray.length;
    const avgScore = evaluations.length > 0
        ? Math.round((evaluations.reduce((a, e) => a + e.overall_score, 0)) / evaluations.length)
        : 0;

    return (
        <div className="animate-fade-in pb-20 px-6 max-w-7xl mx-auto">
            {/* AI Status + Usage HUD */}
            {aiStatus && (() => {
                const usage = aiStatus.usage || {};
                const pct = usage.usage_pct ?? 0;
                const isOk = aiStatus.status === 'ok';
                const statusColor = !isOk ? 'text-red-600' : pct >= 70 ? 'text-amber-600' : 'text-emerald-600';
                
                return (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12 elite-glass-panel p-6 border-gray-200 bg-white shadow-xl relative overflow-hidden mt-8"
                    >
                         <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/[0.02] blur-[80px] pointer-events-none" />
                         <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                            <div className="flex items-center gap-5">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-2xl border border-gray-100 bg-gray-50 ${statusColor}`}>
                                    {isOk ? <TfiBolt className={pct >= 70 ? 'animate-pulse' : ''} /> : <TfiAlert className="animate-bounce" />}
                                </div>
                                <div>
                                    <div className={`text-[10px] font-black uppercase tracking-[0.4em] italic mb-1 ${statusColor}`}>
                                        AI Connection: {isOk ? (pct >= 70 ? 'High Load' : 'Operational') : 'Offline'}
                                    </div>
                                    <div className="text-[12px] font-black text-gray-900 uppercase italic tracking-widest leading-none">
                                        {aiStatus.error_type === 'AI_QUOTA_EXHAUSTED' ? 'Quota Exhausted' : 
                                         aiStatus.message || 'System Performance Optimal'}
                                    </div>
                                </div>
                            </div>

                            <div className="w-full md:w-72">
                                <div className="flex justify-between items-end mb-3">
                                    <span className="text-[9px] font-black uppercase text-gray-600 tracking-[0.3em] italic">Daily AI Usage</span>
                                    <span className={`text-[11px] font-black italic ${statusColor}`}>{pct}%</span>
                                </div>
                                <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                                    <motion.div 
                                        initial={{ width: 0 }} 
                                        animate={{ width: `${pct}%` }} 
                                        className={`h-full ${!isOk ? 'bg-red-600' : pct >= 70 ? 'bg-amber-600' : 'bg-emerald-600'}`} 
                                    />
                                </div>
                            </div>
                         </div>
                    </motion.div>
                );
            })()}

            {/* Header Hub */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                <div>
                    <h1 className="elite-tactical-header text-gray-900">Global HQ</h1>
                    <p className="elite-sub-header mt-2 text-gray-600 font-black uppercase tracking-[0.4em] text-[10px] italic">Platform Overview · System Management</p>
                </div>
                <div className="flex gap-4">
                    <div className="elite-glass-panel py-4 px-8 border-red-600/20 bg-red-600/5 text-red-600 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 italic shadow-2xl">
                        <TfiShield className="animate-pulse" /> SECURE ACCESS AUTHORIZED
                    </div>
                </div>
            </div>

            {/* Macro Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {[
                    { label: 'User Directory', value: totalUsers, trend: '+12%', icon: <TfiUser /> },
                    { label: 'Pending Interviews', value: interviews.length, trend: '+5%', icon: <TfiCalendar /> },
                    { label: 'AI Assessments', value: evaluations.length, trend: '+18%', icon: <TfiTarget /> },
                    { label: 'Platform performance', value: `${avgScore}%`, trend: '+2%', icon: <TfiStatsUp /> },
                ].map((s, idx) => (
                    <motion.div 
                        key={s.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group elite-glass-panel p-10 bg-white hover:border-red-600/30 transition-all duration-700 relative overflow-hidden shadow-2xl border border-gray-100"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/[0.03] blur-[60px] pointer-events-none group-hover:bg-red-600/10 transition-colors" />
                        <div className="flex justify-between items-start mb-10">
                            <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-red-600 text-2xl group-hover:bg-red-600 group-hover:text-white transition-all duration-700 shadow-2xl">
                                {s.icon}
                            </div>
                            <div className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 italic">{s.trend}</div>
                        </div>
                        <div className="text-4xl font-black italic text-gray-900 tracking-tighter mb-2 group-hover:scale-105 origin-left transition-transform duration-700">{s.value}</div>
                        <div className="text-[10px] font-black uppercase text-gray-500 tracking-[0.4em] italic group-hover:text-gray-900 pb-2">{s.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* System Intelligence Surface */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                 <div className="lg:col-span-8 elite-glass-panel p-0 overflow-hidden bg-white border-gray-100 group shadow-2xl relative">
                    <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-red-600/[0.01] blur-[120px] pointer-events-none" />
                    <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/10 relative z-10">
                        <div>
                            <h3 className="text-[11px] font-black uppercase text-gray-900 italic tracking-[0.5em] mb-2 flex items-center gap-4">
                                <TfiHarddrives className="text-red-700" /> Platform Audit Logs
                            </h3>
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest italic pr-8">Real-time system activity logs</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-red-600 animate-ping shadow-[0_0_10px_#dc2626]" />
                            <span className="text-[9px] font-black text-red-600 uppercase tracking-widest italic">LIVE FEED</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto relative z-10 scrollbar-tactical">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="py-8 px-12 text-[10px] font-black uppercase tracking-[0.5em] text-gray-600 italic">User Account</th>
                                    <th className="py-8 px-12 text-[10px] font-black uppercase tracking-[0.5em] text-gray-600 italic">Action Type</th>
                                    <th className="py-8 px-12 text-[10px] font-black uppercase tracking-[0.5em] text-gray-600 italic text-center">Status</th>
                                    <th className="py-8 px-12 text-[10px] font-black uppercase tracking-[0.5em] text-gray-600 italic text-right">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(auditLogs || []).slice(0, 8).map((log, idx) => (
                                    <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50 transition-all group/row">
                                        <td className="py-8 px-12">
                                            <div className="text-[13px] font-black text-gray-900 italic tracking-widest group-hover/row:text-red-600 transition-colors uppercase pr-4 truncate max-w-[200px]">{log.user_email || 'ROOT_CMD'}</div>
                                        </td>
                                        <td className="py-8 px-12">
                                            <code className="bg-gray-100 px-4 py-2 rounded-xl text-[9px] font-black text-gray-600 group-hover/row:text-red-600 transition-colors border border-gray-200">{log.action || 'SYSTEM_SYNC'}</code>
                                        </td>
                                        <td className="py-8 px-12 text-center">
                                            <div className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border italic inline-block ${log.status === 'success' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-red-600 border-red-200 bg-red-50'}`}>
                                                {log.status === 'success' ? 'VERIFIED' : 'DENIED'}
                                            </div>
                                        </td>
                                        <td className="py-8 px-12 text-right">
                                            <div className="text-[10px] font-black text-gray-700 group-hover/row:text-gray-900 transition-colors italic uppercase tracking-widest">
                                                {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 </div>

                 <div className="lg:col-span-4 space-y-8 flex flex-col">
                    <div className="elite-glass-panel p-10 bg-white border-gray-100 group shadow-2xl flex-1 relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/[0.02] blur-[80px]" />
                         <h3 className="text-[11px] font-black uppercase text-gray-900 tracking-[0.5em] mb-12 italic border-b border-gray-100 pb-6">Control Center</h3>
                         <div className="space-y-6 relative z-10">
                            {[
                                { label: 'Platform Announcements', icon: '📡' },
                                { label: 'Security Assets', icon: '🛡️' },
                                { label: 'Activity Reports', icon: '📂' },
                                { label: 'System Config', icon: '🔧' }
                            ].map(item => (
                                <button key={item.label} className="w-full bg-gray-50 border border-gray-100 hover:border-red-600/40 hover:translate-x-3 p-6 rounded-[1.5rem] transition-all duration-500 flex items-center justify-between group shadow-md">
                                    <div className="flex items-center gap-6">
                                        <span className="text-2xl group-hover:scale-125 transition-transform duration-700 grayscale group-hover:grayscale-0">{item.icon}</span>
                                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-600 group-hover:text-red-600 transition-colors italic">
                                            {item.label}
                                        </span>
                                    </div>
                                    <TfiArrowTopRight className="text-gray-400 group-hover:text-red-400 transition-colors" />
                                </button>
                            ))}
                         </div>
                    </div>
                </div>
            </div>

            <div className="mt-32 text-center overflow-hidden">
                <p className="text-[11px] font-black text-gray-950 uppercase tracking-[2.5em] italic opacity-20 whitespace-nowrap">System Management · Secure Access · Platform Optimized</p>
            </div>
        </div>
    );
}
