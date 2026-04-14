import useFetch from '../../hooks/useFetch';
import reportService from '../../services/reportService';
import interviewService from '../../services/interviewService';
import Loader from '../../components/Loader';
import { AI_EVALUATION_CRITERIA, RECOMMENDATION_MAP } from '../../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import { 
  TfiTarget, 
  TfiStatsUp, 
  TfiCalendar, 
  TfiCheck, 
  TfiPulse, 
  TfiBolt,
  TfiInfinite,
  TfiAngleRight,
  TfiHarddrives,
  TfiMapAlt
} from 'react-icons/tfi';

export default function Reports() {
    const { data: evaluationsData, loading } = useFetch(reportService.listEvaluations);
    const evaluations = Array.isArray(evaluationsData) ? evaluationsData : (evaluationsData?.results || []);
    const { data: interviewsRaw } = useFetch(interviewService.list);
    const interviews = Array.isArray(interviewsRaw) ? interviewsRaw : (interviewsRaw?.results || []);

    if (loading) return <Loader text="Loading Reports..." />;

    const evList = evaluations || [];
    const ivList = interviews || [];

    const avgScore = evList.length
        ? (evList.reduce((a, e) => a + e.overall_score, 0) / evList.length).toFixed(1)
        : 0;
    const hrReviewed = evList.filter((e) => e.reviewed_by_hr).length;

    // Aggregate criterion averages
    const criteriaAgg = {};
    evList.forEach((ev) => {
        (ev.criterion_results || []).forEach((cr) => {
            if (!criteriaAgg[cr.criterion]) criteriaAgg[cr.criterion] = [];
            criteriaAgg[cr.criterion].push(cr.score);
        });
    });
    const criteriaAvgData = Object.entries(criteriaAgg).map(([k, v]) => ({
        name: AI_EVALUATION_CRITERIA[k] || k,
        avg: +(v.reduce((a, b) => a + b, 0) / v.length).toFixed(1),
    })).sort((a, b) => b.avg - a.avg);

    // Recommendation distribution
    const recDist = {};
    evList.forEach((e) => { recDist[e.recommendation] = (recDist[e.recommendation] || 0) + 1; });
    const pieData = Object.entries(recDist).map(([name, value]) => ({ name, value }));

    const COLORS = ['#dc2626', '#ffffff', '#1f2937', '#374151', '#4b5563'];

    return (
        <div className="animate-fade-in pb-20 px-6 max-w-7xl mx-auto">
            {/* Header Hub */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-10">
                <div>
                    <h1 className="elite-tactical-header">Platform Analytics</h1>
                    <p className="elite-sub-header mt-2 text-gray-500 font-black uppercase tracking-[0.4em] text-[10px] italic">Performance Reports · General Analytics</p>
                </div>
                <div className="flex gap-4">
                    <div className="elite-glass-panel py-4 px-8 border-red-600/20 bg-red-600/5 text-red-600 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 italic shadow-2xl">
                        <TfiBolt className="animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.4)]" /> REPORTS LOADING
                    </div>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                {[
                    { label: 'Performance Evaluations', value: evList.length, icon: <TfiTarget />, color: '#dc2626' },
                    { label: 'Average Score', value: `${avgScore}/100`, icon: <TfiStatsUp />, color: '#ffffff' },
                    { label: 'Verified Evaluations', value: hrReviewed, icon: <TfiCheck />, color: '#10b981' },
                    { label: 'Total Interviews', value: ivList.length, icon: <TfiCalendar />, color: '#ffffff' },
                ].map((s, idx) => (
                    <motion.div 
                        key={s.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group elite-glass-panel p-10 bg-white hover:border-red-600/30 transition-all duration-700 relative overflow-hidden shadow-2xl"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/[0.03] blur-[60px] pointer-events-none group-hover:bg-red-600/10 transition-colors" />
                        <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-red-600 text-2xl group-hover:bg-red-600 group-hover:text-white transition-all duration-700 shadow-2xl mb-8">
                            {s.icon}
                        </div>
                        <div className="text-4xl font-black italic text-gray-950 tracking-tighter mb-2 group-hover:scale-105 origin-left transition-transform duration-700">{s.value}</div>
                        <div className="text-[10px] font-black uppercase text-gray-500 tracking-[0.4em] italic group-hover:text-gray-600 pb-2">{s.label}</div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                {/* 1. Core Competency Heatmap */}
                <div className="lg:col-span-8 elite-glass-panel p-12 relative overflow-hidden bg-white border-gray-100 group shadow-2xl">
                    <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-red-600/[0.01] blur-[150px] pointer-events-none" />
                    <div className="mb-14 relative z-10 flex justify-between items-center">
                        <div>
                            <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-gray-900 italic mb-2 flex items-center gap-4">
                                <TfiHarddrives className="text-red-700" /> Performance Criteria Averages
                            </h3>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic opacity-50">Overall performance by criteria</p>
                        </div>
                        <TfiPulse className="text-red-600 text-3xl animate-pulse" />
                    </div>
                    
                    <div className="w-full h-[400px] relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={criteriaAvgData || []} layout="vertical" margin={{ left: 20, right: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(0,0,0,0.03)" />
                                <XAxis type="number" domain={[0, 10]} hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'rgba(0,0,0,0.4)', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }} width={160} />
                                <Tooltip 
                                    contentStyle={{ background: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '1.5rem', padding: '1.5rem', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ color: '#000', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                    cursor={{ fill: 'rgba(220,38,38,0.05)' }}
                                />
                                <Bar dataKey="avg" radius={[0, 8, 8, 0]} barSize={24}>
                                    {(criteriaAvgData || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.avg >= 7 ? '#dc2626' : 'rgba(0,0,0,0.05)'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Recruitment Verdicts Orbit */}
                <div className="lg:col-span-4 elite-glass-panel p-12 relative overflow-hidden bg-white border-gray-100 group shadow-2xl flex flex-col items-center">
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-600/[0.05] blur-[80px]" />
                    <div className="mb-14 w-full text-center">
                         <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-gray-900 italic mb-2">Recommendation Distribution</h3>
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic opacity-50">Distribution of hiring recommendations</p>
                    </div>
                    
                    <div className="w-full h-[300px] relative z-10">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    innerRadius={70}
                                    outerRadius={95}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]" />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ background: '#050505', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.5rem', padding: '1rem' }}
                                    itemStyle={{ textTransform: 'uppercase', fontSize: '10px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    
                    <div className="mt-10 space-y-4 w-full">
                        {pieData.map((entry, i) => (
                            <div key={entry.name} className="flex items-center justify-between group/legend p-3 rounded-xl hover:bg-gray-50 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ background: COLORS[i % COLORS.length] }} />
                                    <span className="text-[10px] font-black text-gray-500 group-hover/legend:text-gray-900 transition-colors uppercase italic tracking-widest">{entry.name.replace('_', ' ')}</span>
                                </div>
                                <span className="text-[10px] font-black text-gray-900 italic">{entry.value} Interviews</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Evaluation History Matrix */}
            <div className="elite-glass-panel p-0 overflow-hidden bg-white border-gray-100 shadow-2xl group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-red-600/[0.01] blur-[150px] pointer-events-none" />
                <div className="p-12 border-b border-gray-100 flex justify-between items-center bg-gray-50/10 relative z-10">
                    <div>
                        <h3 className="text-[11px] font-black uppercase text-gray-900 italic tracking-[0.5em] mb-2 flex items-center gap-4">
                            <TfiInfinite className="text-red-700" /> Evaluation History Logs
                        </h3>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic opacity-50">Detailed history of all evaluations</p>
                    </div>
                </div>
                
                <div className="overflow-x-auto relative z-10 scrollbar-tactical">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/30">
                                <th className="py-8 px-12 text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 italic">Candidate ID</th>
                                <th className="py-8 px-12 text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 italic">Score</th>
                                <th className="py-8 px-12 text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 italic">Recommendation</th>
                                <th className="py-8 px-12 text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 italic text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {evList.slice(0, 10).map((ev, idx) => (
                                    <motion.tr 
                                        key={ev.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="border-b border-gray-100 hover:bg-gray-50 transition-all group/row cursor-default"
                                    >
                                        <td className="py-10 px-12 border-l-4 border-transparent group-hover/row:border-red-600 transition-all font-black text-gray-950 italic uppercase text-[13px] tracking-widest">
                                            {ev.candidate_id?.substring(0, 12)}...
                                        </td>
                                        <td className="py-10 px-12">
                                            <div className="flex items-center gap-5">
                                                <div className="text-xl font-black italic text-red-600 group-hover/row:scale-110 transition-transform origin-left">{ev.overall_score}%</div>
                                                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden border border-gray-100">
                                                    <motion.div initial={{ width: 0 }} animate={{ width: `${ev.overall_score}%` }} className="h-full bg-red-600 shadow-[0_0_10px_#dc2626]" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-10 px-12">
                                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 group-hover/row:text-gray-900 transition-colors italic">
                                                {RECOMMENDATION_MAP[ev.recommendation]?.label || 'UNSPECIFIED'}
                                            </div>
                                        </td>
                                        <td className="py-10 px-12 text-right">
                                            <div className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] inline-block italic border transition-all ${ev.reviewed_by_hr ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 'text-amber-500 border-amber-500/20 bg-amber-500/5'}`}>
                                                {ev.reviewed_by_hr ? 'VERIFIED' : 'PENDING REVIEW'}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-24 text-center overflow-hidden">
                <p className="text-[11px] font-black text-gray-950 uppercase tracking-[2.5em] italic opacity-20 whitespace-nowrap">Platform Reports · General Analytics · AI Optimized</p>
            </div>
        </div>
    );
}
