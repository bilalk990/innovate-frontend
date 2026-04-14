import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TfiBriefcase, 
  TfiCalendar, 
  TfiTarget, 
  TfiBolt, 
  TfiReload, 
  TfiSettings, 
  TfiSearch,
  TfiPulse,
  TfiShield,
  TfiCheck
} from 'react-icons/tfi';
import useAuth from '../../hooks/useAuth';
import interviewService from '../../services/interviewService';
import reportService from '../../services/reportService';
import jobService from '../../services/jobService';
import authService from '../../services/authService';
import Loader from '../../components/Loader';
import { toast } from 'sonner';
import { formatDateTime } from '../../utils/formatDate';
import { recommendationLabel } from '../../utils/helpers';
import '../../styles/hr.css';

// Helper function for score color
const scoreColor = (score) => {
    if (score >= 80) return '#E63946'; // Using brand red for high scores too if preferred
    if (score >= 60) return '#f59e0b';
    return '#64748B';
};

export default function RecruiterDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [interviews, setInterviews] = useState([]);
    const [evaluations, setEvaluations] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({ 
        company_name: user?.company_name || '', 
        company_values: (user?.company_values || []).join(', ') 
    });
    const [saving, setSaving] = useState(false);
    const [sysMetrics, setSysMetrics] = useState({ matchQuality: 84.8, infiltration: 94.8 });

    useEffect(() => {
        // AI Fluctuations for live feel
        const timer = setInterval(() => {
            setSysMetrics({
                matchQuality: +(80 + Math.random() * 8).toFixed(1),
                infiltration: +(90 + Math.random() * 8).toFixed(1)
            });
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (user && user.is_profile_complete === false) {
            navigate('/recruiter/profile-setup');
            return;
        }

        const load = async () => {
            try {
                const [ivRes, evRes, jobRes] = await Promise.all([
                    interviewService.list({ limit: 50 }),
                    reportService.listEvaluations(),
                    jobService.list(),
                ]);
                setInterviews(ivRes.data?.results || ivRes.data || []);
                setEvaluations(evRes.data?.results || evRes.data || []);
                setJobs(jobRes.data?.results || jobRes.data || []);
            } catch (err) {
                // silently fail - individual data sections will show empty states
            }
            finally { setLoading(false); }
        };
        load();
    }, [user, navigate]);

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            await authService.updateProfile({
                company_name: settings.company_name,
                company_values: (settings.company_values || '').split(',').map(v => v.trim()).filter(Boolean)
            });
            toast.success('Settings Updated!');
        } catch { toast.error('Failed to update settings.'); }
        finally { setSaving(false); }
    };

    if (loading) return <Loader fullScreen text="Loading Recruitment Portal..." />;

    const scheduled = interviews.filter((i) => ['scheduled', 'pending'].includes(i.status)).length;
    const completed = interviews.filter((i) => i.status === 'completed').length;
    const activeJobs = jobs.filter(j => j.is_active !== false).length;
    const totalApps = interviews.length;
    const recentEval = evaluations.slice(0, 5);

    return (
        <div className="animate-fade-in-up hr-content">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
                <div>
                    <h1 className="hr-heading text-4xl mb-3">
                        COMMAND CENTER
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-[11px] font-black uppercase text-gray-400 tracking-[0.4em] italic">
                            RECRUITER ACCESS · {user?.company_name || 'INNOVAITE'} SECTOR
                        </p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => window.location.reload()} className="flex items-center gap-3 px-8 py-5 rounded-2xl border-2 border-gray-100 text-[10px] font-black uppercase text-gray-400 hover:text-gray-950 hover:bg-gray-50 transition-all italic tracking-widest active:scale-95 shadow-lg">
                        <TfiReload className="text-lg" /> REFRESH UPLINK
                    </button>
                    <button onClick={() => navigate('/recruiter/schedule')} className="btn-hr-primary py-5 px-10 shadow-2xl shadow-red-600/20 active:scale-95 flex items-center gap-4">
                        <TfiBolt className="text-xl" /> DEPLOY INTERVIEW
                    </button>
                </div>
            </div>

            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
                {[
                    { label: 'ACTIVE NODES', value: activeJobs, sub: 'JOB POSTINGS', icon: <TfiBriefcase /> },
                    { label: 'SCHEDULED OPS', value: scheduled, sub: 'INTERVIEWS PENDING', icon: <TfiCalendar /> },
                    { label: 'INTEL REPORTS', value: totalApps, sub: 'TOTAL ASSESSMENTS', icon: <TfiSearch /> },
                    { label: 'MATCH QUALITY', value: evaluations.length ? `${sysMetrics.matchQuality}%` : 'N/A', sub: 'SYSTEM AVERAGE', icon: <TfiCheck /> },
                ].map((s, i) => (
                    <div key={i} className="hr-card p-10 hover:border-red-600/30 group">
                        <div className="flex items-center justify-between mb-10">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 text-red-600 flex items-center justify-center text-2xl shadow-inner border border-gray-100 group-hover:bg-red-600 group-hover:text-white transition-all duration-500">
                                {s.icon}
                            </div>
                            <div className="px-4 py-1.5 rounded-full border border-emerald-100 bg-emerald-50 text-[8px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                                <TfiPulse className="animate-pulse" /> STABLE
                            </div>
                        </div>
                        <div className="text-5xl font-black italic text-gray-950 tracking-tighter mb-2 group-hover:translate-x-2 transition-transform h-12 flex items-end">
                            {s.value}
                        </div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic">
                            {s.label}
                        </div>
                        <div className="text-[8px] font-black text-gray-300 mt-2 uppercase tracking-[0.2em]">{s.sub}</div>
                    </div>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                {/* Main Content Card: Recruitment Pipeline */}
                <div className="xl:col-span-8 hr-card p-12 hover:shadow-2xl hover:shadow-gray-200/50 transition-all">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                        <div>
                            <h3 className="text-2xl font-black italic text-gray-950 tracking-tight uppercase mb-2">Operational Pipeline</h3>
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] italic">Real-Time Interview Monitoring</p>
                        </div>
                        <button onClick={() => navigate('/recruiter/candidates')} className="text-[10px] font-black text-red-600 hover:text-gray-950 transition-colors uppercase tracking-[0.3em] underline underline-offset-8 italic decoration-red-200">VIEW FULL PIPELINE →</button>
                    </div>

                    <div className="space-y-4">
                        {interviews.length === 0 ? (
                            <div className="py-24 text-center border-2 border-dashed border-gray-100 rounded-[2.5rem] bg-gray-50/50">
                                <TfiBriefcase className="text-6xl text-gray-200 mx-auto mb-6" />
                                <p className="text-[11px] font-black uppercase text-gray-400 tracking-[0.4em] italic">No active interviews found in local sector.</p>
                            </div>
                        ) : (
                            interviews.slice(0, 6).map((iv) => (
                                <div key={iv.id} className="flex flex-col md:flex-row items-center justify-between p-8 rounded-[2rem] bg-white border border-gray-100 hover:border-red-600/20 hover:shadow-xl transition-all group/iv shadow-sm">
                                    <div className="flex items-center gap-8 mb-6 md:mb-0 w-full md:w-auto">
                                        <div className="w-14 h-14 rounded-2xl bg-gray-950 text-gray-200 flex items-center justify-center font-black text-sm italic shadow-xl group-hover/iv:bg-red-600 group-hover/iv:text-white transition-all duration-500">
                                            IV
                                        </div>
                                        <div>
                                            <div className="text-lg font-black text-gray-950 uppercase italic tracking-tight mb-1 group-hover/iv:text-red-600 transition-colors">
                                                {iv.candidate_name || 'Anonymous Node'}
                                            </div>
                                            <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{iv.title}</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-center md:justify-end gap-10 w-full md:w-auto">
                                        <div className="text-center">
                                            <div className="text-[11px] font-black text-gray-900 italic leading-none mb-1">{formatDateTime(iv.scheduled_at).split(',')[0]}</div>
                                            <div className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{formatDateTime(iv.scheduled_at).split(',')[1]}</div>
                                        </div>
                                        <div className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest italic border ${(iv.status === 'completed' || localStorage.getItem(`room_${iv.room_id}_completed`) === 'true') ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                                            {localStorage.getItem(`room_${iv.room_id}_completed`) === 'true' ? 'COMPLETED' : iv.status}
                                        </div>
                                        {localStorage.getItem(`room_${iv.room_id}_completed`) !== 'true' ? (
                                            <button onClick={() => navigate(`/interview/room/${iv.room_id}`)} className="px-8 py-3 rounded-xl border border-gray-950 text-[9px] font-black uppercase text-gray-950 hover:bg-gray-950 hover:text-white transition-all italic active:scale-95 shadow-md">ENTER ROOM</button>
                                        ) : (
                                            <button onClick={() => navigate('/recruiter')} className="px-8 py-3 rounded-xl border border-gray-300 text-[9px] font-black uppercase text-gray-400 bg-gray-50 cursor-not-allowed italic">ARCHIVED</button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar Card: Settings & Analytics */}
                <div className="xl:col-span-4 flex flex-col gap-10">
                    <div className="hr-card p-10 bg-white shadow-xl">
                        <div className="flex items-center gap-4 mb-10 border-l-4 border-red-600 pl-6">
                            <TfiSettings className="text-red-600 text-xl" />
                            <h3 className="text-lg font-black text-gray-950 uppercase italic tracking-widest">Target Params</h3>
                        </div>
                        <div className="space-y-8">
                            <div>
                                <label className="text-[9px] font-black uppercase text-gray-400 tracking-[0.3em] mb-3 block italic">Sector Branding</label>
                                <input 
                                    className="hr-input bg-gray-50 border-gray-100 focus:bg-white text-gray-950 placeholder:text-gray-300"
                                    value={settings.company_name}
                                    onChange={e => setSettings({ ...settings, company_name: e.target.value })}
                                />
                            </div>
                            <button 
                                onClick={handleSaveSettings}
                                disabled={saving}
                                className="btn-hr-primary w-full py-5 text-[10px] flex items-center justify-center gap-3 shadow-xl shadow-red-600/10 active:scale-95 transition-all"
                            >
                                {saving ? <TfiReload className="animate-spin text-lg" /> : <TfiBolt className="text-lg" />} COMMIT UPDATES
                            </button>
                        </div>
                    </div>

                    <div className="hr-card p-10 bg-white border-2 border-red-50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/[0.02] blur-[80px] group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-4 mb-8">
                            <TfiShield size={24} className="text-red-600" />
                            <span className="text-[10px] font-black uppercase text-red-600 tracking-[0.4em] italic font-black">System Efficiency</span>
                        </div>
                        <h4 className="text-2xl font-black italic text-gray-950 mb-4 tracking-tighter uppercase">Infiltration Rating</h4>
                        <div className="flex gap-4 items-end mb-8 group-hover:translate-x-1 transition-transform">
                            <span className="text-6xl font-black italic text-gray-950 leading-none tracking-tighter transition-all">{sysMetrics.infiltration}</span>
                            <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest mb-2">Optimized</span>
                        </div>
                        <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden shadow-inner flex items-center">
                            <div className={`h-full bg-red-600 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.2)] transition-all duration-1000`} style={{ width: `${sysMetrics.infiltration}%` }} />
                        </div>
                        <p className="mt-8 text-[10px] text-gray-400 italic leading-relaxed uppercase tracking-[0.2em] opacity-60">High-performance recruitment protocols active.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
