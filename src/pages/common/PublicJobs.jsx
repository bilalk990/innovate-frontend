import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import jobService from '../../services/jobService';
import useAuthStore from '../../store/useAuthStore';
import { toast } from 'sonner';
import Loader from '../../components/Loader';

export default function PublicJobs() {
    const { token, user } = useAuthStore();
    const isAuthenticated = !!token;
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => { loadJobs(); }, []);

    const loadJobs = async () => {
        setLoading(true);
        try {
            const { data } = await jobService.list({ search });
            setJobs(data?.results || data || []);
        } catch { /* error */ }
        finally { setLoading(false); }
    };

    const handleApplyClick = () => {
        if (!isAuthenticated) {
            navigate('/register', { state: { redirectTo: '/candidate/jobs' } });
        } else if (user?.role === 'candidate') {
            navigate('/candidate/jobs');
        } else {
            toast.error('Recruiters cannot apply for jobs.');
        }
    };

    const filteredJobs = filter === 'all'
        ? jobs
        : jobs.filter(j => j.job_type === filter || j.location?.toLowerCase() === filter.toLowerCase());

    const FILTERS = [
        { val: 'all', label: 'All Roles' },
        { val: 'full-time', label: 'Full-Time' },
        { val: 'remote', label: 'Remote' },
        { val: 'contract', label: 'Contract' },
    ];

    return (
        <div className="min-h-screen bg-white font-sans">
            {/* ── NAV ── */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-8 py-4 flex items-center justify-between shadow-sm">
                <Link to="/" className="flex items-center gap-2 text-xl font-black uppercase italic tracking-tighter text-gray-900">
                    Innov<span className="text-red-600">AI</span>te
                </Link>
                <div className="flex items-center gap-6">
                    <Link to="/features" className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-red-600 transition-colors">Features</Link>
                    <Link to="/jobs" className="text-[11px] font-black uppercase tracking-widest text-red-600">Jobs</Link>
                    {!isAuthenticated ? (
                        <div className="flex items-center gap-3">
                            <Link to="/login" className="text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-400">Sign In</Link>
                            <Link to="/register" className="text-[11px] font-black uppercase tracking-widest bg-red-600 text-white px-5 py-2 rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20">Join Free</Link>
                        </div>
                    ) : (
                        <Link to={`/${user.role}/dashboard`} className="text-[11px] font-black uppercase tracking-widest bg-black text-white px-5 py-2 rounded-xl hover:bg-red-600 transition-colors">
                            My Dashboard
                        </Link>
                    )}
                </div>
            </nav>

            {/* ── HERO ── */}
            <div className="relative overflow-hidden bg-black text-white py-24 px-8 text-center">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(230,57,70,0.15)_0%,_transparent_70%)]" />
                <div className="relative z-10 max-w-3xl mx-auto">
                    <div className="inline-block px-4 py-1.5 rounded-full border border-red-600/30 text-red-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                        Global Opportunities
                    </div>
                    <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none mb-6">
                        Find Your Next<br /><span className="text-red-500">Role</span>
                    </h1>
                    <p className="text-gray-400 text-sm font-medium italic max-w-xl mx-auto mb-10 leading-relaxed">
                        Explore high-stakes positions at world-class organizations. Apply in seconds with your AI-verified profile.
                    </p>
                    {/* Search */}
                    <div className="flex gap-3 max-w-lg mx-auto">
                        <input
                            className="flex-1 bg-white/10 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 font-medium"
                            placeholder="Search by title or company..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && loadJobs()}
                        />
                        <button
                            onClick={loadJobs}
                            className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl transition-colors shadow-xl shadow-red-500/30"
                        >
                            Search
                        </button>
                    </div>
                </div>
            </div>

            {/* ── FILTERS ── */}
            <div className="sticky top-[65px] z-40 bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
                <div className="flex gap-2">
                    {FILTERS.map(f => (
                        <button
                            key={f.val}
                            onClick={() => setFilter(f.val)}
                            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                filter === f.val
                                    ? 'bg-black text-white shadow-lg'
                                    : 'bg-gray-50 text-gray-400 border border-gray-200 hover:border-red-300 hover:text-red-600'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {filteredJobs.length} Role{filteredJobs.length !== 1 ? 's' : ''} Found
                </span>
            </div>

            {/* ── JOB CARDS ── */}
            <main className="max-w-6xl mx-auto px-8 py-12">
                {loading ? <Loader text="Loading opportunities..." /> : (
                    <>
                        {filteredJobs.length === 0 && (
                            <div className="text-center py-32">
                                <div className="text-6xl mb-6">🔍</div>
                                <h3 className="text-xl font-black uppercase italic text-gray-300 mb-2">No Roles Found</h3>
                                <p className="text-sm text-gray-400 italic">Try adjusting your search or filters.</p>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredJobs.map((job, i) => (
                                <motion.div
                                    key={job.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="group bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:border-red-100 transition-all duration-300 flex flex-col"
                                >
                                    {/* Company letter avatar */}
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-black text-red-500 flex items-center justify-center text-xl font-black italic shadow-lg">
                                            {job.company_name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-red-50 text-red-600 border border-red-100">
                                            {job.job_type}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-black uppercase italic tracking-tighter text-gray-900 mb-1 group-hover:text-red-600 transition-colors leading-tight">
                                        {job.title}
                                    </h3>
                                    <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase mb-4">
                                        <span>🏢 {job.company_name}</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                                        <span>📍 {job.location}</span>
                                    </div>

                                    <p className="text-xs text-gray-500 italic leading-relaxed mb-6 flex-1 line-clamp-3">
                                        {job.description}
                                    </p>

                                    {/* Skills */}
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {job.requirements?.slice(0, 3).map((r, idx) => (
                                            <span key={idx} className="text-[9px] font-black uppercase px-3 py-1 rounded-lg bg-gray-50 border border-gray-100 text-gray-400 group-hover:border-red-100 group-hover:text-red-500 transition-colors">
                                                #{r}
                                            </span>
                                        ))}
                                        {job.requirements?.length > 3 && (
                                            <span className="text-[9px] font-black text-gray-300">+{job.requirements.length - 3}</span>
                                        )}
                                    </div>

                                    {job.salary_range && job.salary_range !== 'Not disclosed' && (
                                        <div className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-4">💰 {job.salary_range}</div>
                                    )}

                                    <button
                                        onClick={handleApplyClick}
                                        className="w-full py-3.5 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-600 transition-all shadow-lg group-hover:shadow-red-500/20"
                                    >
                                        {isAuthenticated && user?.role === 'candidate' ? 'Apply Now →' : 'Sign Up to Apply →'}
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </>
                )}
            </main>

            {/* ── FOOTER ── */}
            <footer className="border-t border-gray-100 py-8 text-center">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
                    © 2024 InnovAIte Interview Guardian · AI-Powered Recruitment
                </p>
            </footer>
        </div>
    );
}
