import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL ||
    'https://hifza123.app.n8n.cloud/webhook/38ef0fd5-da1f-4af6-85f5-6907bdd93964';

// Score badge: green 90+, yellow 80-89
const ScoreBadge = ({ score }) => {
    const cls = score >= 90
        ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
        : score >= 80
        ? 'bg-amber-100 text-amber-700 border-amber-300'
        : 'bg-gray-100 text-gray-600 border-gray-300';
    return (
        <span className={`text-xs font-black px-2.5 py-1 rounded-xl border ${cls}`}>
            {score}/100
        </span>
    );
};

const ShortlistCard = ({ candidate, onInvite }) => (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3 hover:shadow-sm transition-shadow">
        <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-black flex-shrink-0">
                    {(candidate.name || 'C')[0].toUpperCase()}
                </div>
                <div>
                    <div className="text-sm font-black text-gray-900">{candidate.name || 'Candidate'}</div>
                    <div className="text-xs text-gray-500">{candidate.title || ''}</div>
                </div>
            </div>
            <ScoreBadge score={candidate.score || 0} />
        </div>
        {candidate.reason && (
            <p className="text-xs text-gray-500 italic border-l-2 border-red-200 pl-3">
                {candidate.reason}
            </p>
        )}
        {(candidate.skills || []).length > 0 && (
            <div className="flex flex-wrap gap-1">
                {candidate.skills.slice(0, 5).map((s, i) => (
                    <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg">{s}</span>
                ))}
            </div>
        )}
        <button
            onClick={() => onInvite(candidate)}
            className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
        >
            Send Interview Invite
        </button>
    </div>
);

const PipelineCard = ({ candidate }) => (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3 hover:shadow-sm transition-shadow">
        <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-sm font-black flex-shrink-0">
                    {(candidate.name || 'C')[0].toUpperCase()}
                </div>
                <div>
                    <div className="text-sm font-black text-gray-900">{candidate.name || 'Candidate'}</div>
                    <div className="text-xs text-gray-500">{candidate.title || ''}</div>
                </div>
            </div>
            <ScoreBadge score={candidate.score || 0} />
        </div>
        {candidate.reason && (
            <p className="text-xs text-gray-500 italic border-l-2 border-amber-200 pl-3">
                {candidate.reason}
            </p>
        )}
        {(candidate.skills || []).length > 0 && (
            <div className="flex flex-wrap gap-1">
                {candidate.skills.slice(0, 5).map((s, i) => (
                    <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg">{s}</span>
                ))}
            </div>
        )}
        <div className="text-[10px] text-amber-600 font-black uppercase tracking-widest bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-center">
            ⏳ Check back in 60 days
        </div>
    </div>
);

export default function SmartTalentPool() {
    const [query, setQuery] = useState('');
    const [recruiterEmail, setRecruiterEmail] = useState('');
    const [topN, setTopN] = useState(5);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [activeTab, setActiveTab] = useState('shortlisted');

    const handleSearch = async () => {
        if (!query.trim()) return toast.error('Enter a role or candidate description.');
        setLoading(true);
        setResults(null);

        try {
            const res = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: query.trim(),
                    recruiter_email: recruiterEmail.trim(),
                    top_n: topN,
                }),
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setResults(data);
            setActiveTab('shortlisted');
            toast.success(`Scanned ${data.total_scanned || 0} candidates!`);
        } catch (err) {
            toast.error(`Failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = (candidate) => {
        toast.success(`Interview invite sent to ${candidate.name}!`);
    };

    const shortlisted = results?.shortlist || [];
    const pipeline = results?.pipeline || [];
    const skillGapInsight = results?.skill_gap_insight || '';
    const totalScanned = results?.total_scanned || 0;

    const TABS = [
        { id: 'shortlisted', label: `✅ Shortlisted`, count: shortlisted.length },
        { id: 'pipeline', label: `⏳ Pipeline`, count: pipeline.length },
        { id: 'skillgap', label: `🔍 Skill Gap`, count: skillGapInsight ? 1 : 0 },
    ];

    return (
        <div className="min-h-screen bg-white text-gray-900 p-8">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter">
                        Smart Talent <span className="text-red-600">Pool Builder</span>
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest">
                        AI scores candidates — shortlisted, pipeline, and skill gap insights
                    </p>
                </div>

                {/* Search Form */}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-4">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">
                            Describe the candidate you need *
                        </label>
                        <textarea
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            rows={3}
                            placeholder="e.g. 5 year React dev Karachi, TypeScript, remote-friendly"
                            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-red-500 resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">
                                Recruiter Email (for Gmail summary)
                            </label>
                            <input
                                value={recruiterEmail}
                                onChange={e => setRecruiterEmail(e.target.value)}
                                placeholder="hr@company.com"
                                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-red-500"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">
                                Top N Candidates
                            </label>
                            <select
                                value={topN}
                                onChange={e => setTopN(Number(e.target.value))}
                                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-red-500"
                            >
                                {[3, 5, 10, 15, 20].map(n => (
                                    <option key={n} value={n}>Top {n}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={handleSearch}
                        disabled={loading || !query.trim()}
                        className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:opacity-40 rounded-2xl font-black uppercase tracking-widest text-sm text-white transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Analyzing Talent Pool...
                            </>
                        ) : '🔍 Find Candidates'}
                    </button>
                </div>

                {/* Results */}
                <AnimatePresence>
                    {results && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                                    <div className="text-2xl font-black text-emerald-700">{shortlisted.length}</div>
                                    <div className="text-xs font-black uppercase text-emerald-600 mt-1">Shortlisted</div>
                                    <div className="text-[10px] text-emerald-500">Score 80+</div>
                                </div>
                                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
                                    <div className="text-2xl font-black text-amber-700">{pipeline.length}</div>
                                    <div className="text-xs font-black uppercase text-amber-600 mt-1">Pipeline</div>
                                    <div className="text-[10px] text-amber-500">Check in 60 days</div>
                                </div>
                                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center">
                                    <div className="text-2xl font-black text-gray-700">{totalScanned}</div>
                                    <div className="text-xs font-black uppercase text-gray-500 mt-1">Scanned</div>
                                    <div className="text-[10px] text-gray-400">Total candidates</div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 flex-wrap">
                                {TABS.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                                            activeTab === tab.id
                                                ? 'bg-red-600 text-white'
                                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                        }`}
                                    >
                                        {tab.label}
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-lg ${activeTab === tab.id ? 'bg-red-500' : 'bg-gray-200 text-gray-600'}`}>
                                            {tab.count}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            {activeTab === 'shortlisted' && (
                                <div className="space-y-3">
                                    {shortlisted.length === 0 ? (
                                        <div className="text-center text-gray-400 py-12 text-sm">No shortlisted candidates found.</div>
                                    ) : (
                                        shortlisted.map((c, i) => (
                                            <ShortlistCard key={i} candidate={c} onInvite={handleInvite} />
                                        ))
                                    )}
                                </div>
                            )}

                            {activeTab === 'pipeline' && (
                                <div className="space-y-3">
                                    {pipeline.length === 0 ? (
                                        <div className="text-center text-gray-400 py-12 text-sm">No pipeline candidates found.</div>
                                    ) : (
                                        pipeline.map((c, i) => (
                                            <PipelineCard key={i} candidate={c} />
                                        ))
                                    )}
                                </div>
                            )}

                            {activeTab === 'skillgap' && (
                                <div>
                                    {!skillGapInsight ? (
                                        <div className="text-center text-gray-400 py-12 text-sm">No skill gap data available.</div>
                                    ) : (
                                        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 space-y-3">
                                            <div className="text-xs font-black uppercase tracking-widest text-red-600 mb-2">
                                                🔍 Recruiter Recommendation
                                            </div>
                                            <p className="text-sm text-red-800 leading-relaxed">{skillGapInsight}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
