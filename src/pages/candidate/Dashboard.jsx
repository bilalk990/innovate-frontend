import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  TfiStatsUp, 
  TfiCheck, 
  TfiAlert, 
  TfiShield, 
  TfiCalendar,
  TfiBriefcase,
  TfiBolt,
  TfiAngleRight,
  TfiMapAlt,
  TfiTarget,
  TfiPulse,
  TfiReload
} from 'react-icons/tfi';
import { FaTrophy } from 'react-icons/fa';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  Cell
} from 'recharts';
import useAuth from '../../hooks/useAuth';
import useFetch from '../../hooks/useFetch';
import interviewService from '../../services/interviewService';
import reportService from '../../services/reportService';
import resumeService from '../../services/resumeService';
import Loader from '../../components/Loader';
import { formatDateTime } from '../../utils/formatDate';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';
import jobService from '../../services/jobService';

// Builds last-7-days interview activity from real interview data
function buildPerformanceData(interviews) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const counts = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    counts[days[d.getDay()]] = 0;
  }
  interviews.forEach(iv => {
    const d = new Date(iv.scheduled_at || iv.created_at);
    const diffDays = Math.floor((today - d) / 86400000);
    if (diffDays >= 0 && diffDays < 7) {
      const key = days[d.getDay()];
      if (key in counts) counts[key]++;
    }
  });
  // Return in chronological order (oldest day first)
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = days[d.getDay()];
    result.push({ name: key, apps: counts[key] });
  }
  return result;
}


export default function CandidateDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const listInterviews = useCallback(() => interviewService.list({ limit: 50 }), []);
  const listEvaluations = useCallback(() => reportService.listEvaluations(), []);
  const listResumes = useCallback(() => resumeService.list(), []);
  const listApplications = useCallback(() => jobService.myApplications(), []);

  const { data: interviewsData, loading: l1 } = useFetch(listInterviews);
  const { data: evaluationsData, loading: l2 } = useFetch(listEvaluations);
  const { data: resumeData, loading: l3 } = useFetch(listResumes);
  const { data: appsData, loading: l4 } = useFetch(listApplications);

  useEffect(() => {
    if (!l4 && appsData) {
      const apps = Array.isArray(appsData) ? appsData : (appsData?.results || []);
      const hasHired = apps.some(app => app.status === 'hired');
      if (hasHired) {
        // Celebration burst
        const end = Date.now() + 3 * 1000;
        const colors = ['#E63946', '#ffffff', '#000000'];

        (function frame() {
          confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: colors });
          confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: colors });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        }());
      }
    }
  }, [l4, appsData]);

  if (l1 || l2 || l3 || l4) return <Loader text="Loading Dashboard..." />;

  const apps = Array.isArray(appsData) ? appsData : (appsData?.results || []);
  const hiredApps = apps.filter(a => a.status === 'hired');

  const interviews = Array.isArray(interviewsData) ? interviewsData : (interviewsData?.results || []);
  const evaluations = Array.isArray(evaluationsData) ? evaluationsData : (evaluationsData?.results || []);
  
  const upcomingInterviews = interviews.filter(i => ['scheduled', 'pending'].includes(i.status)).slice(0, 3);
  
  // Dynamic Score Calculation from real evaluation data
  const completedEvals = evaluations.filter(ev => ev.status === 'complete');
  const avg = (key) => completedEvals.length
    ? Math.round(completedEvals.reduce((acc, ev) => acc + (ev[key] || 0), 0) / completedEvals.length)
    : 0;

  const avgTechnical = avg('overall_score') || 0;
  const avgBehavioral = avg('confidence_score') || 0;
  const avgIntegrity = avg('proctoring_score') || 0;
  const avgCommunication = avg('fluency_score') || 0;
  const avgCultureFit = avg('culture_fit_score') || 0;

  const RADAR_DATA = [
    { subject: 'Technical', A: avgTechnical || 60, fullMark: 100 },
    { subject: 'Behavioral', A: avgBehavioral || 60, fullMark: 100 },
    { subject: 'Integrity', A: avgIntegrity || 100, fullMark: 100 },
    { subject: 'Communication', A: avgCommunication || 60, fullMark: 100 },
    { subject: 'Culture Fit', A: avgCultureFit || 60, fullMark: 100 },
  ];

  const PERFORMANCE_DATA = buildPerformanceData(interviews);

  const stats = [
    { label: 'Total Interviews', value: interviews.length, trend: '', icon: <TfiBriefcase /> },
    { label: 'Upcoming Interviews', value: upcomingInterviews.length, trend: '', icon: <TfiCalendar /> },
    { label: 'Integrity Score', value: completedEvals.length ? `${avgIntegrity}%` : 'N/A', trend: '', icon: <TfiShield /> },
    { label: 'Technical Score', value: completedEvals.length ? `${avgTechnical}%` : 'N/A', trend: '', icon: <TfiStatsUp /> },
  ];

    return (
        <div className="animate-fade-in-up">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-10">
                <div>
                    <h1 className="elite-tactical-header">Dashboard</h1>
                    <p className="elite-sub-header text-gray-500 font-black uppercase tracking-[0.4em] text-[10px] mt-2 italic">Activity Overview · {user?.name || 'User'}</p>
                </div>
                <div className="flex gap-4">
                    <button className="elite-button bg-gray-50 border border-gray-100 text-gray-500 hover:border-red-600/30 transition-all shadow-md active:scale-95" onClick={() => window.location.reload()}>
                        <TfiReload size={14} className="animate-spin-slow" /> REFRESH UPLINK
                    </button>
                    <button className="elite-button bg-red-600 text-white shadow-xl shadow-red-600/20 hover:bg-black transition-all active:scale-95" onClick={() => navigate('/candidate/resume')}>
                        <TfiBolt size={14} /> UPDATE RESUME
                    </button>
                </div>
            </div>

            {/* Stats Cards Row */}
            <div className="elite-grid-4 mb-12">
                {stats.map((s, i) => (
                    <div key={i} className="elite-glass-panel p-8 group hover:border-red-600/30 transition-all duration-500 relative overflow-hidden bg-white shadow-xl">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 blur-[40px] pointer-events-none group-hover:bg-red-600/10 transition-colors" />
                        <div className="flex items-center justify-between mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-red-600 group-hover:text-white transition-all text-gray-400">
                                {s.icon}
                            </div>
                            <div className="text-[8px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2 bg-emerald-500/5 px-3 py-1.5 rounded-xl border border-emerald-500/10">
                                <TfiPulse size={8} className="animate-pulse" /> ACTIVE
                            </div>
                        </div>
                        <div className="text-4xl font-black text-gray-900 mb-2 italic tracking-tighter leading-none">
                            {s.value}
                        </div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] italic">
                            {s.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Grid */}
            <div className="hr-grid gap-10">
                {/* Main Content Card: Recent Activity & Performance */}
                <div className="col-8 elite-glass-panel p-12 relative overflow-hidden bg-white shadow-2xl border-gray-50">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/[0.02] blur-[120px] pointer-events-none" />
                    
                    <div className="flex justify-between items-center mb-12">
                        <div className="flex items-center gap-4">
                            <div className="w-1 h-8 bg-red-600" />
                            <h3 className="text-sm font-black uppercase text-gray-900 tracking-[0.2em] italic">Interview Activity</h3>
                        </div>
                        <span className="text-[9px] font-black text-gray-400 tracking-[0.4em] uppercase italic">Performance Summary</span>
                    </div>
                    
                    <div className="w-full h-[320px] mb-12 px-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={PERFORMANCE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#dc2626" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(0,0,0,0.3)', fontSize: 9, fontWeight: 900 }} />
                                <YAxis hide />
                                <Tooltip 
                                    contentStyle={{ background: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '16px', padding: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ color: '#000', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' }}
                                    cursor={{ stroke: 'rgba(220,38,38,0.2)', strokeWidth: 2 }}
                                />
                                <Area type="monotone" dataKey="apps" stroke="#dc2626" strokeWidth={4} fillOpacity={1} fill="url(#colorApps)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-12 border-t border-gray-100 pt-12">
                        <div>
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-8 italic">Recent Applications</h4>
                            <div className="flex flex-col gap-4">
                                {apps.slice(0, 3).map((app, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-red-600/20 transition-all group">
                                        <div>
                                            <div className="text-[13px] font-black text-gray-950 italic group-hover:text-red-500 transition-colors uppercase">{app.job_title}</div>
                                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                                <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest opacity-50">{app.company_name}</div>
                                                <div className="w-1 h-1 rounded-full bg-gray-200" />
                                                <div className="text-[9px] text-red-600 font-black uppercase tracking-widest italic">{app.salary_range || 'N/A'}</div>
                                                <div className="w-1 h-1 rounded-full bg-gray-200" />
                                                <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest">{app.location || 'Remote'}</div>
                                            </div>
                                            {app.skills && app.skills.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {app.skills.slice(0, 3).map(s => (
                                                        <span key={s} className="px-2 py-0.5 bg-gray-100 text-[8px] font-black text-gray-400 uppercase tracking-tighter rounded-full border border-gray-100 italic transition-all group-hover:bg-red-50 group-hover:text-red-600 group-hover:border-red-100">
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest border border-gray-200 px-3 py-1 rounded-lg bg-white">{app.status}</div>
                                    </div>
                                ))}
                                {apps.length === 0 && <p className="text-[10px] text-gray-700 italic uppercase py-4">No active applications</p>}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] mb-8 italic">Skill Analysis</h4>
                            <div className="flex flex-col gap-8">
                                {[
                                    { label: 'Technical depth', val: avgTechnical },
                                    { label: 'Communication', val: avgCommunication },
                                    { label: 'Integrity', val: avgIntegrity }
                                ].map((skill, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                                            <span className="text-gray-400">{skill.label}</span>
                                            <span className="text-gray-950 italic">{skill.val}%</span>
                                        </div>
                                        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden border border-gray-100">
                                            <div 
                                                className="h-full bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all duration-1000" 
                                                style={{ width: `${skill.val}%` }} 
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Card: Upcoming & Actions */}
                <div className="col-4 flex flex-col gap-10">
                    {/* Skill Matrix Radar */}
                    <div className="elite-glass-panel p-10 relative overflow-hidden bg-white shadow-2xl border-gray-50 group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/[0.02] blur-[60px] pointer-events-none" />
                        <div className="flex items-center gap-4 mb-10 border-l-4 border-red-600 pl-6">
                            <TfiStatsUp className="text-red-500" />
                            <h3 className="text-[11px] font-black uppercase text-gray-950 tracking-[0.4em] italic leading-none">AI Skill Matrix</h3>
                        </div>
                        
                        <div className="w-full h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={RADAR_DATA}>
                                    <PolarGrid stroke="rgba(0,0,0,0.05)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(0,0,0,0.4)', fontSize: 9, fontWeight: 900 }} />
                                    <Radar
                                        name="Skills"
                                        dataKey="A"
                                        stroke="#dc2626"
                                        fill="#dc2626"
                                        fillOpacity={0.15}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-[9px] text-center text-gray-400 font-black uppercase tracking-[0.3em] mt-6 italic opacity-50">Operational Competency Map</p>
                    </div>

                    <div className="elite-glass-panel p-10 relative overflow-hidden bg-white shadow-2xl border-gray-50">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-[60px] pointer-events-none" />
                        <h3 className="text-sm font-black uppercase text-gray-950 tracking-[0.2em] italic mb-10 flex items-center gap-4">
                            <TfiCalendar className="text-red-500" /> Recent Interviews
                        </h3>
                        <div className="flex flex-col gap-8">
                            {upcomingInterviews.map((iv, idx) => (
                                <div key={idx} className="flex gap-6 items-center group cursor-pointer" onClick={() => navigate(`/candidate/interviews`)}>
                                    <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-red-500 font-black italic text-lg group-hover:bg-red-600 group-hover:text-white transition-all shadow-xl">
                                        {String(idx + 1).padStart(2, '0')}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-[12px] font-black text-gray-950 uppercase italic tracking-wider group-hover:text-red-500 transition-colors leading-tight">{iv.title || 'Interview Session'}</div>
                                        <div className="text-[9px] text-gray-400 font-bold tracking-widest uppercase mt-1.5 opacity-60">{formatDateTime(iv.scheduled_at)}</div>
                                    </div>
                                    <TfiAngleRight className="text-gray-300 group-hover:text-red-600 group-hover:translate-x-2 transition-all" />
                                </div>
                            ))}
                            {upcomingInterviews.length === 0 && (
                                <div className="text-center py-10">
                                    <TfiMapAlt className="text-4xl text-gray-800 mx-auto mb-4 opacity-20" />
                                    <p className="text-[10px] font-black text-gray-800 uppercase italic tracking-widest">No upcoming interviews</p>
                                </div>
                            )}
                        </div>
                        <button className="btn-elite-secondary w-full mt-12 py-5 bg-white/5 border-white/5 text-gray-400 hover:text-white transition-all text-[10px]" onClick={() => navigate('/candidate/interviews')}>
                            VIEW ALL
                        </button>
                    </div>

                    <div className="elite-card p-10 bg-gradient-to-br from-red-600 to-red-900 border-none shadow-[0_25px_50px_-12px_rgba(220,38,38,0.5)] relative overflow-hidden group">
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shadow-lg">
                                <TfiShield size={18} className="text-white" />
                            </div>
                            <span className="text-[11px] font-black text-white/60 tracking-[0.2em] uppercase italic">AI Suggestion</span>
                        </div>
                        <h4 className="text-xl font-black text-white uppercase italic tracking-tighter mb-4 relative z-10 leading-tight">Profile Improvement Recommended</h4>
                        <p className="text-[13px] text-white/80 font-medium leading-relaxed mb-0 relative z-10 italic">
                            Analysis suggests updating your technical skills to increase job match success rates by 22%.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

