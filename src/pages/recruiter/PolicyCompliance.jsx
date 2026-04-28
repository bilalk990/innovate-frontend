import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TfiReload, TfiShield, TfiSearch, TfiFile, TfiCheck } from 'react-icons/tfi';
import { toast } from 'sonner';
import hrService from '../../services/hrService';

const SEVERITY_STYLE = {
    Critical: 'bg-red-600/20 text-red-300 border-red-600/30',
    High: 'bg-red-500/10 text-red-400 border-red-500/20',
    Medium: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    Low: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
};
const GRADE_COLOR = { A: 'text-emerald-400', B: 'text-blue-400', C: 'text-amber-400', D: 'text-red-400', F: 'text-red-600' };
const SCORE_COLOR = (s) => s >= 75 ? 'text-emerald-400' : s >= 55 ? 'text-amber-400' : 'text-red-400';
const SCORE_BG = (s) => s >= 75 ? 'bg-emerald-600' : s >= 55 ? 'bg-amber-500' : 'bg-red-600';
const VERDICT_STYLE = {
    'Compliant': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'Mostly Compliant': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'Needs Revision': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'Non-Compliant': 'bg-red-500/20 text-red-300 border-red-500/30',
};

const COUNTRIES = ['Pakistan', 'United Arab Emirates', 'United Kingdom', 'United States', 'India', 'Saudi Arabia', 'Canada', 'Australia', 'Other'];
const INDUSTRIES = ['Technology / Software', 'Finance / Banking', 'Healthcare / Pharma', 'Manufacturing', 'Retail / E-commerce', 'Education', 'Consulting', 'Hospitality', 'Logistics', 'Other'];
const COMPANY_SIZES = ['1-20 employees', '21-50 employees', '51-200 employees', '201-500 employees', '500+ employees'];
const POLICY_TYPES = ['', 'Leave Policy', 'Disciplinary Policy', 'Anti-Harassment Policy', 'Remote Work Policy', 'Code of Conduct', 'Data Privacy Policy', 'Performance Review Policy', 'Termination Policy', 'Compensation Policy', 'Health & Safety Policy', 'General HR Policy'];

const SAMPLE_POLICY = `LEAVE POLICY

1. Annual Leave
All employees are entitled to 12 days of annual leave per calendar year. Leave must be applied for in advance and is subject to manager approval.

2. Sick Leave
Employees may take up to 7 days of sick leave per year. Medical certificate is required for absences exceeding 2 consecutive days.

3. Leave Encashment
Unused leave cannot be carried forward or encashed.

4. Maternity Leave
Female employees are entitled to 45 days of maternity leave.

5. Termination During Leave
The company reserves the right to terminate an employee's contract even while they are on approved leave if required by business needs.`;

export default function PolicyCompliance() {
    const [form, setForm] = useState({
        policy_text: '',
        country: 'Pakistan',
        industry: 'Technology / Software',
        company_size: '51-200 employees',
        policy_type: '',
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState('violations');
    const [copiedFixed, setCopiedFixed] = useState(false);
    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleCheck = async () => {
        if (form.policy_text.trim().length < 50)
            return toast.error('Please paste the full policy text (at least 50 characters).');
        setLoading(true); setResult(null);
        try {
            const r = await hrService.checkPolicyCompliance(form);
            setResult(r.data);
            const vCount = r.data?.violations?.length || 0;
            if (vCount === 0) toast.success('Policy looks compliant! Review the report.');
            else toast.warning(`Found ${vCount} compliance issue${vCount > 1 ? 's' : ''} — review required.`);
            setActiveTab('violations');
        } catch { toast.error('Compliance check failed. Please try again.'); }
        finally { setLoading(false); }
    };

    const handleCopyFixed = () => {
        if (!result?.corrected_policy) return;
        navigator.clipboard.writeText(result.corrected_policy)
            .then(() => { setCopiedFixed(true); toast.success('Fixed policy copied!'); setTimeout(() => setCopiedFixed(false), 2500); })
            .catch(() => toast.error('Copy failed.'));
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter">
                        HR Policy <span className="text-red-600">Compliance Checker</span>
                    </h1>
                    <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest">AI reviews your HR policy against local labor laws — flags violations, rewrites it to be fully compliant</p>
                </div>

                {/* What AI Checks */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[['⚖️', 'Labor Laws', 'Country-specific acts & regulations'], ['🚫', 'Violations', 'Illegal clauses & non-compliant language'], ['📋', 'Missing Clauses', 'Required sections you forgot to include'], ['✍️', 'Fixed Policy', 'AI rewrites it to be fully compliant']].map(([icon, title, desc]) => (
                        <div key={title} className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-center">
                            <div className="text-2xl mb-2">{icon}</div>
                            <div className="text-xs font-black uppercase tracking-widest text-white mb-1">{title}</div>
                            <div className="text-[11px] text-gray-500">{desc}</div>
                        </div>
                    ))}
                </div>

                {/* Form */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">Country</label>
                            <select value={form.country} onChange={e => set('country', e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600">
                                {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">Industry</label>
                            <select value={form.industry} onChange={e => set('industry', e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600">
                                {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">Company Size</label>
                            <select value={form.company_size} onChange={e => set('company_size', e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600">
                                {COMPANY_SIZES.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">Policy Type</label>
                            <select value={form.policy_type} onChange={e => set('policy_type', e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600">
                                {POLICY_TYPES.map(p => <option key={p} value={p}>{p || 'Auto-detect'}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Paste Your Policy Text *</label>
                            <button onClick={() => set('policy_text', SAMPLE_POLICY)}
                                className="text-[10px] font-black uppercase px-3 py-1 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg transition-all">
                                Load Sample Policy
                            </button>
                        </div>
                        <textarea value={form.policy_text} onChange={e => set('policy_text', e.target.value)} rows={14}
                            placeholder="Paste your full HR policy document here — the more complete the text, the more accurate the compliance analysis..."
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600 resize-none font-mono" />
                        <div className="text-[10px] text-gray-600 mt-1">{form.policy_text.split(' ').filter(Boolean).length} words</div>
                    </div>

                    <button onClick={handleCheck} disabled={loading}
                        className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:opacity-40 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2">
                        {loading ? <><TfiReload className="animate-spin" /> Analyzing Against {form.country} Labor Laws...</> : <><TfiShield /> Run Compliance Check</>}
                    </button>
                </div>

                {/* Results */}
                <AnimatePresence>
                    {result && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

                            {/* Score Hero */}
                            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8">
                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    <div className="flex flex-col items-center flex-shrink-0">
                                        <div className={`text-7xl font-black ${SCORE_COLOR(result.compliance_score)}`}>{result.compliance_score}</div>
                                        <div className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">Compliance Score</div>
                                        <div className={`text-3xl font-black mt-2 ${GRADE_COLOR[result.compliance_grade] || 'text-gray-400'}`}>{result.compliance_grade}</div>
                                        <div className="w-24 bg-gray-800 rounded-full h-2 mt-2">
                                            <div className={`h-2 rounded-full ${SCORE_BG(result.compliance_score)}`} style={{ width: `${result.compliance_score}%` }} />
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className={`text-xs font-black uppercase px-4 py-2 rounded-xl border inline-block ${VERDICT_STYLE[result.overall_verdict] || 'bg-gray-700/20 text-gray-400 border-gray-600/30'}`}>
                                            {result.overall_verdict}
                                        </div>
                                        <p className="text-gray-300 text-sm leading-relaxed">{result.verdict_summary}</p>
                                        <div className="grid grid-cols-3 gap-3 text-center">
                                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                                                <div className="text-xl font-black text-red-400">{Array.isArray(result.violations) ? result.violations.length : 0}</div>
                                                <div className="text-[10px] text-gray-400 uppercase">Violations</div>
                                            </div>
                                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                                                <div className="text-xl font-black text-amber-400">{Array.isArray(result.warnings) ? result.warnings.length : 0}</div>
                                                <div className="text-[10px] text-gray-400 uppercase">Warnings</div>
                                            </div>
                                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                                                <div className="text-xl font-black text-emerald-400">{Array.isArray(result.compliant_clauses) ? result.compliant_clauses.length : 0}</div>
                                                <div className="text-[10px] text-gray-400 uppercase">Good Clauses</div>
                                            </div>
                                        </div>
                                        {Array.isArray(result.laws_checked) && result.laws_checked.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {result.laws_checked.map((law, i) => (
                                                    <span key={i} className="text-[10px] bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded-lg">{law}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 flex-wrap">
                                {[['violations', '🔴 Violations'], ['warnings', '🟡 Warnings'], ['compliant', '✅ Good Parts'], ['missing', '📋 Missing'], ['fixed', '✍️ Fixed Policy'], ['steps', '📌 Next Steps']].map(([t, label]) => (
                                    <button key={t} onClick={() => setActiveTab(t)}
                                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                                        {label}
                                        {t === 'violations' && Array.isArray(result.violations) && result.violations.length > 0 && <span className="ml-1.5 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{result.violations.length}</span>}
                                    </button>
                                ))}
                            </div>

                            {/* Violations */}
                            {activeTab === 'violations' && (
                                <div className="space-y-4">
                                    {!Array.isArray(result.violations) || result.violations.length === 0 ? (
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center">
                                            <div className="text-4xl mb-2">🎉</div>
                                            <p className="text-emerald-300 font-black text-sm uppercase">No critical violations found!</p>
                                        </div>
                                    ) : result.violations.map((v, i) => (
                                        <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-3">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <div className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg border ${SEVERITY_STYLE[v.severity] || ''}`}>{v.severity}</div>
                                                <div className="text-sm font-black text-white flex-1">{v.issue}</div>
                                            </div>
                                            {v.clause && (
                                                <div className="bg-red-900/20 border-l-2 border-red-600 pl-3 py-1">
                                                    <div className="text-[10px] text-red-400 font-black uppercase mb-0.5">Problematic Clause</div>
                                                    <p className="text-xs text-red-200 italic">"{v.clause}"</p>
                                                </div>
                                            )}
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                                                    <div className="text-[10px] text-gray-500 font-black uppercase mb-1">Legal Reference</div>
                                                    <div className="text-xs text-gray-300">{v.legal_reference}</div>
                                                </div>
                                                <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3">
                                                    <div className="text-[10px] text-red-400 font-black uppercase mb-1">Risk if Not Fixed</div>
                                                    <div className="text-xs text-red-300">{v.risk}</div>
                                                </div>
                                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                                                    <div className="text-[10px] text-emerald-400 font-black uppercase mb-1">How to Fix</div>
                                                    <div className="text-xs text-emerald-300">{v.fix}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Warnings */}
                            {activeTab === 'warnings' && (
                                <div className="space-y-3">
                                    {!Array.isArray(result.warnings) || result.warnings.length === 0 ? (
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center">
                                            <p className="text-emerald-300 font-black text-sm uppercase">No warnings found!</p>
                                        </div>
                                    ) : result.warnings.map((w, i) => (
                                        <div key={i} className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 space-y-2">
                                            <div className="text-sm font-black text-amber-300">{w.issue}</div>
                                            {w.clause && <p className="text-xs text-amber-200/70 italic border-l-2 border-amber-500/40 pl-3">"{w.clause}"</p>}
                                            <div className="text-xs text-amber-200">💡 {w.recommendation}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Compliant */}
                            {activeTab === 'compliant' && (
                                <div className="space-y-3">
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
                                        <div className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-3">✅ What Your Policy Gets Right</div>
                                        {Array.isArray(result.compliant_clauses) && result.compliant_clauses.map((c, i) => (
                                            <div key={i} className="flex items-start gap-2 mb-2 text-sm text-emerald-200">
                                                <TfiCheck className="text-emerald-400 flex-shrink-0 mt-0.5" />{c}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Missing Clauses */}
                            {activeTab === 'missing' && (
                                <div className="space-y-3">
                                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
                                        <div className="text-xs font-black uppercase tracking-widest text-amber-400 mb-3">📋 Legally Required Clauses That Are Missing</div>
                                        {Array.isArray(result.missing_required_clauses) && result.missing_required_clauses.map((m, i) => (
                                            <div key={i} className="flex items-start gap-2 mb-2 text-sm text-amber-200">
                                                <span className="text-amber-500 flex-shrink-0">⚠</span>{m}
                                            </div>
                                        ))}
                                        {(!Array.isArray(result.missing_required_clauses) || result.missing_required_clauses.length === 0) && (
                                            <p className="text-emerald-300 text-sm">All required clauses are present!</p>
                                        )}
                                    </div>
                                    {Array.isArray(result.key_improvements) && result.key_improvements.length > 0 && (
                                        <div className="space-y-3">
                                            <div className="text-xs font-black uppercase tracking-widest text-gray-400">Priority Improvements</div>
                                            {result.key_improvements.map((imp, i) => (
                                                <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex items-start gap-3">
                                                    <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-xs font-black flex-shrink-0">{imp.priority}</div>
                                                    <div>
                                                        <div className="text-sm font-black text-white">{imp.improvement}</div>
                                                        <div className="text-xs text-gray-400 mt-0.5">{imp.reason}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Fixed Policy */}
                            {activeTab === 'fixed' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between flex-wrap gap-3">
                                        <div>
                                            <div className="text-sm font-black text-white uppercase">AI-Corrected Policy</div>
                                            <div className="text-xs text-gray-400">All violations fixed • Missing clauses added • Legally compliant language</div>
                                        </div>
                                        <button onClick={handleCopyFixed}
                                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${copiedFixed ? 'bg-emerald-600 text-white' : 'bg-red-600 hover:bg-red-500 text-white'}`}>
                                            {copiedFixed ? <><TfiCheck /> Copied!</> : <><TfiFile /> Copy Fixed Policy</>}
                                        </button>
                                    </div>
                                    <div className="bg-white text-gray-900 rounded-2xl p-8 text-sm leading-relaxed whitespace-pre-wrap font-mono shadow-2xl">
                                        {result.corrected_policy}
                                    </div>
                                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                                        <div className="text-xs text-amber-300 italic">⚖️ {result.legal_disclaimer}</div>
                                    </div>
                                </div>
                            )}

                            {/* Next Steps */}
                            {activeTab === 'steps' && (
                                <div className="space-y-3">
                                    {Array.isArray(result.next_steps) && result.next_steps.map((step, i) => (
                                        <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex items-start gap-3">
                                            <div className="w-7 h-7 rounded-xl bg-red-600 flex items-center justify-center text-xs font-black flex-shrink-0">{i + 1}</div>
                                            <span className="text-sm text-gray-200">{step}</span>
                                        </div>
                                    ))}
                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mt-4">
                                        <div className="text-xs text-blue-300 italic">⚖️ {result.legal_disclaimer}</div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
