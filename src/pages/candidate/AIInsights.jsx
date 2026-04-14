import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  Cell
} from 'recharts';
import { 
  TfiStatsUp, 
  TfiBolt, 
  TfiTarget, 
  TfiPulse, 
  TfiHarddrives,
  TfiMapAlt,
  TfiAngleRight,
  TfiShield,
  TfiLayers,
  TfiBriefcase
} from 'react-icons/tfi';
import useFetch from '../../hooks/useFetch';
import reportService from '../../services/reportService';
import Loader from '../../components/Loader';

const PERFORMANCE_GUIDE = {
    technical: [
        { role: 'Senior Architect', threshold: 85, icon: 'SA' },
        { role: 'Backend specialist', threshold: 70, icon: 'BE' },
        { role: 'Technical Specialist', threshold: 0, icon: 'TS' }
    ],
    communication: [
        { role: 'Team Lead / PM', threshold: 85, icon: 'TL' },
        { role: 'Integrator', threshold: 60, icon: 'IN' },
        { role: 'Communicator', threshold: 0, icon: 'CR' }
    ]
};

export default function AIInsights() {
    const navigate = useNavigate();
    const listEvaluations = useCallback(() => reportService.listEvaluations(), []);
    const { data: evaluationsData, loading } = useFetch(listEvaluations);

    const evaluations = useMemo(() => evaluationsData?.results || evaluationsData || [], [evaluationsData]);

    const analytics = useMemo(() => {
        if (!evaluations.length) return { tech: 65, comm: 70, overall: 68, topMatch: PERFORMANCE_GUIDE.technical[2], evolutionMatch: PERFORMANCE_GUIDE.technical[0], directive: 'Generating initial profile baseline. Complete more interviews to unlock career insights.' };

        const tech = Math.round(evaluations.reduce((acc, ev) => acc + (ev.technical_score || 0), 0) / evaluations.length);
        const comm = Math.round(evaluations.reduce((acc, ev) => acc + (ev.communication_score || 0), 0) / evaluations.length);
        const overall = Math.round(evaluations.reduce((acc, ev) => acc + (ev.overall_score || 0), 0) / evaluations.length);

        const topMatch = (tech >= comm) 
            ? PERFORMANCE_GUIDE.technical.find(r => tech >= r.threshold) 
            : PERFORMANCE_GUIDE.communication.find(r => comm >= r.threshold);
            
        const evolutionMatch = (tech >= comm)
            ? PERFORMANCE_GUIDE.communication[0]
            : PERFORMANCE_GUIDE.technical[0];

        const directive = overall >= 80 
            ? `High skill proficiency detected. Career Path: Target Lead Architect or Project Manager roles.`
            : tech > comm 
            ? `Technical skills are strong at ${tech}%. Directive: Enhance communication skills to better support leadership roles.`
            : `Communication skills are superior. Directive: Strengthen core technical foundations to support high-complexity projects.`;

        return { tech, comm, overall, topMatch, evolutionMatch, directive };
    }, [evaluations]);

    const skillData = [
      { subject: 'Problem Solving', A: analytics.tech, B: 85, fullMark: 100 },
      { subject: 'Communication', A: analytics.comm, B: 80, fullMark: 100 },
      { subject: 'Technical Depth', A: analytics.tech + 5, B: 90, fullMark: 100 },
      { subject: 'Logic Depth', A: analytics.overall, B: 85, fullMark: 100 },
      { subject: 'Culture Fit', A: analytics.comm - 5, B: 80, fullMark: 100 },
    ];

    const growthData = evaluations.length > 0 
        ? evaluations.slice(-5).map((ev, idx) => ({
            month: `Update ${idx + 1}`,
            technical: ev.overall_score,
            soft: (ev.communication_score + ev.technical_score) / 2
        }))
        : [
            { month: 'Q1', technical: 60, soft: 65 },
            { month: 'Q2', technical: 65, soft: 68 },
            { month: 'Q3', technical: 72, soft: 70 },
            { month: 'Q4', technical: 80, soft: 75 },
            { month: 'Current', technical: analytics.overall, soft: analytics.comm }
        ];

    if (loading) return <Loader text="Analyzing Career Insights..." />;

    return (
        <div className="animate-fade-in pb-24 px-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                <div>
                    <h1 className="elite-tactical-header">Career Insights</h1>
                    <p className="elite-sub-header mt-2 text-gray-400 font-black uppercase tracking-[0.4em] text-[10px] italic">Profile Performance Analytics · Overview</p>
                </div>
                <div className="flex gap-4">
                    <div className="elite-glass-panel py-3 px-6 border-red-100 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 italic">
                        <TfiBolt className="animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.2)]" /> AI SYSTEM ACTIVE
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-10">
                {/* 1. Radar Chart: Skill Analysis */}
                <div className="lg:col-span-5 elite-glass-panel p-12 flex flex-col items-center relative overflow-hidden group bg-white shadow-2xl border-gray-100">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/[0.01] blur-[100px] pointer-events-none group-hover:bg-red-600/[0.03] transition-all duration-1000" />
                    <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-gray-950 italic mb-16 w-full flex items-center gap-4">
                        <TfiTarget className="text-red-600 shadow-sm" /> Skill Analysis
                    </h3>
                    <div className="w-full h-[350px] relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={skillData}>
                                <PolarGrid stroke="rgba(0,0,0,0.05)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(0,0,0,0.4)', fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                                <Radar name="Profile" dataKey="A" stroke="#dc2626" strokeWidth={3} fill="#dc2626" fillOpacity={0.3} />
                                <Radar name="Target" dataKey="B" stroke="rgba(0,0,0,0.1)" strokeWidth={1} fill="rgba(0,0,0,0.05)" fillOpacity={0.1} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-8 flex gap-8">
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic">Current Rating</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-gray-100" />
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic">Target Baseline</span>
                        </div>
                    </div>
                </div>

                {/* 2. Area Chart: Growth Curve */}
                <div className="lg:col-span-7 elite-glass-panel p-12 relative overflow-hidden bg-white shadow-2xl border-gray-100">
                     <div className="absolute top-0 left-0 w-80 h-80 bg-red-600/[0.01] blur-[120px] pointer-events-none" />
                     <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-gray-950 italic mb-16 flex items-center gap-4">
                        <TfiPulse className="text-red-600 animate-pulse shadow-sm" /> Performance Trajectory
                     </h3>
                     <div className="w-full h-[350px] relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={growthData}>
                                <defs>
                                    <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(0,0,0,0.3)', fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }} />
                                <YAxis hide domain={[0, 100]} />
                                <Tooltip 
                                    contentStyle={{ background: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '1.5rem', padding: '1.5rem', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ color: '#000', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                    cursor={{ stroke: 'rgba(220,38,38,0.2)', strokeWidth: 2 }}
                                />
                                <Area type="monotone" dataKey="technical" stroke="#dc2626" strokeWidth={4} fillOpacity={1} fill="url(#redGrad)" className="drop-shadow-[0_0_15px_rgba(220,38,38,0.2)]" />
                                <Area type="monotone" dataKey="soft" stroke="rgba(0,0,0,0.1)" strokeWidth={2} strokeDasharray="8 8" fill="none" />
                            </AreaChart>
                        </ResponsiveContainer>
                     </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* 3. AI Dynamic Recommendations */}
                <div className="lg:col-span-8 space-y-10">
                    <div className="elite-glass-panel p-12 relative overflow-hidden group bg-white shadow-2xl border-gray-100">
                        <div className="absolute inset-0 bg-red-600/[0.01] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <h3 className="text-[12px] font-black text-gray-950 mb-16 flex items-center gap-5 italic uppercase tracking-[0.6em]">
                            <TfiHarddrives className="text-red-700 animate-pulse shadow-sm" /> Performance Analysis
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                            {/* Match Card */}
                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic mb-4">Role Suitability Status</div>
                                    <div className="flex items-center gap-6 p-6 bg-gray-50 border border-gray-100 rounded-3xl group/match hover:border-red-600/30 transition-all shadow-md">
                                        <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-red-600 text-2xl font-black italic shadow-sm group-hover/match:bg-red-600 group-hover/match:text-white transition-all duration-700">
                                            {analytics.topMatch?.icon || 'TS'}
                                        </div>
                                        <div>
                                            <div className="text-xl font-black text-gray-950 italic tracking-tighter uppercase mb-1">{analytics.topMatch?.role || 'Top Candidate'}</div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                <div className="text-[11px] text-emerald-600 font-black uppercase tracking-[0.2em]">{analytics.overall}% Proficiency Threshold</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                     <div className="text-[10px] font-black text-gray-700 uppercase tracking-[0.4em] italic mb-4">Development Guidelines</div>
                                     <div className="relative p-8 rounded-[2rem] bg-white/[0.01] border border-white/5 border-l-4 border-l-red-600 shadow-2xl group/directive">
                                        <div className="absolute top-4 right-6 text-red-900 group-hover/directive:text-red-600 transition-colors"><TfiShield /></div>
                                        <p className="text-[15px] text-gray-400 font-medium leading-relaxed italic pr-8">"{analytics.directive}"</p>
                                     </div>
                                </div>
                            </div>

                            {/* Upskilling Card */}
                            <div className="space-y-8">
                                <div className="p-10 rounded-[3rem] bg-gray-50 border border-gray-100 group/upskill hover:border-red-600/30 transition-all shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-[60px]" />
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-12 italic">Skill Development Focus</div>
                                    <div className="flex items-center gap-6 mb-12">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-white border border-gray-100 flex items-center justify-center text-red-600 text-3xl shadow-sm group-hover/upskill:text-white group-hover/upskill:bg-red-600 transition-all">
                                            <TfiBolt />
                                        </div>
                                        <div>
                                            <div className="text-[14px] font-black text-gray-950 uppercase italic tracking-widest leading-none mb-2">TARGET: {analytics.evolutionMatch?.role || 'EXPERT ROLE'}</div>
                                            <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] italic">Key Career Goal</div>
                                        </div>
                                    </div>
                                    <button 
                                        className="w-full py-6 rounded-2xl bg-white text-black text-[11px] font-black uppercase tracking-[0.5em] hover:bg-red-600 hover:text-white transition-all italic shadow-2xl group/btn" 
                                        onClick={() => navigate('/candidate/jobs')}
                                    >
                                        EXPLORE NEW JOBS <TfiAngleRight className="inline ml-3 group-hover/btn:translate-x-3 transition-transform" />
                                    </button>
                                </div>
                                <div className="p-8 bg-white/[0.01] border border-dashed border-white/5 rounded-[2rem] text-center">
                                    <p className="text-[11px] font-black text-gray-800 uppercase tracking-[0.5em] italic">Confidential Career Analysis Overview</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Secondary Metrics Hub */}
                <div className="lg:col-span-4 space-y-10">
                    <div className="elite-glass-panel p-10 bg-white border-gray-100 relative overflow-hidden group shadow-2xl">
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-600/[0.05] blur-[100px] pointer-events-none" />
                        <h4 className="text-[12px] font-black uppercase tracking-[0.6em] text-gray-400 mb-12 flex items-center gap-4 italic underline underline-offset-[16px] decoration-gray-100">
                            <TfiStatsUp /> Core Metrics
                        </h4>
                        <div className="space-y-12 relative z-10">
                             {[
                                { label: 'Communication Confidence', val: 88, color: 'text-red-600', shadow: 'rgba(220,38,38,0.2)' },
                                { label: 'Technical Accuracy', val: analytics.tech, color: 'text-gray-950', shadow: 'rgba(0,0,0,0.1)' },
                                { label: 'System Reliability', val: 99, color: 'text-red-700', shadow: 'rgba(220,38,38,0.2)' }
                             ].map((m, idx) => (
                                <div key={idx} className="group/metric">
                                    <div className="flex justify-between items-end mb-4">
                                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em] italic group-hover/metric:text-gray-900 transition-colors uppercase">{m.label}</span>
                                        <span className={`text-2xl font-black italic tracking-tighter ${m.color} group-hover/metric:scale-110 transition-transform duration-500`}>{m.val}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden border border-gray-100 relative">
                                        <motion.div 
                                            initial={{ width: 0 }} 
                                            animate={{ width: `${m.val}%` }} 
                                            className={`h-full absolute left-0 top-0 transition-all duration-1000 ${m.color === 'text-gray-950' ? 'bg-gray-900' : 'bg-red-600'}`}
                                            style={{ boxShadow: `0 0 15px ${m.shadow}` }}
                                        />
                                    </div>
                                </div>
                             ))}
                        </div>
                    </div>

                    <div 
                        onClick={() => navigate('/candidate/dashboard')} 
                        className="p-8 elite-glass-panel group cursor-pointer border-gray-100 hover:border-red-600/30 transition-all duration-700 bg-white relative overflow-hidden shadow-2xl"
                    >
                        <div className="absolute inset-0 bg-red-600/[0.01] opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-8">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl text-gray-400 group-hover:bg-red-600 group-hover:text-white transition-all shadow-xl group-hover:rotate-[360deg] duration-1000">
                                    <TfiMapAlt />
                                </div>
                                <div>
                                    <div className="text-[13px] font-black uppercase text-gray-950 group-hover:text-red-600 leading-tight italic tracking-[0.3em] transition-colors">Dashboard</div>
                                    <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.4em] mt-2 italic opacity-50">Return to Home</div>
                                </div>
                            </div>
                            <TfiAngleRight className="text-gray-300 group-hover:text-red-600 group-hover:translate-x-4 transition-all duration-700 text-2xl" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-32 text-center">
                <p className="text-[11px] font-black text-gray-950 uppercase tracking-[2.5em] italic opacity-20">InnovAIte Analytics · Career Insights Engine</p>
            </div>
        </div>
    );
}
