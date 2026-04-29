import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  TfiTarget, TfiReload, TfiCheck, TfiClose, TfiStar,
  TfiLightBulb, TfiBarChart, TfiShield, TfiWrite,
} from 'react-icons/tfi';
import authService from '../../services/authService';

const TABS = ['Match Score', 'Skills Gap', 'Learning Plan', 'ATS & Application', 'Interview Prep'];

const ScoreRing = ({ score }) => {
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  const label = score >= 75 ? 'Strong Match' : score >= 50 ? 'Moderate Match' : 'Weak Match';
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="42" fill="none"
            stroke={color} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2.64 * score} 264`}
            style={{ transition: 'stroke-dasharray 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black" style={{ color }}>{score}</span>
          <span className="text-xs text-gray-500 font-black uppercase tracking-wider italic">/ 100</span>
        </div>
      </div>
      <div>
        <p className="text-center font-black uppercase tracking-widest text-sm italic" style={{ color }}>{label}</p>
        <p className="text-center text-xs text-gray-500 mt-1 italic">{score >= 75 ? 'You\'re a great candidate for this role' : score >= 50 ? 'Worth applying — bridge the gaps first' : 'Consider upskilling before applying'}</p>
      </div>
    </div>
  );
};

export default function JobMatchAnalyzer() {
  const [jdText, setJdText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [manualSkills, setManualSkills] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const analyze = async () => {
    if (!jdText.trim() || jdText.length < 30)
      return toast.error('Paste the full job description (at least 30 chars).');
    setLoading(true);
    setResult(null);
    try {
      const payload = { jd_text: jdText, target_role: targetRole };
      if (manualSkills.trim()) payload.candidate_skills = manualSkills;
      const res = await authService.analyzeJobMatch(payload);
      setResult(res.data);
      setActiveTab(0);
      toast.success('Analysis complete!');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Analysis failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-8">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-600 text-xl shadow-sm">
            <TfiTarget />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight italic text-gray-950">Job Match AI</h1>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1 italic">Tactical Gap Analysis</p>
          </div>
        </div>
      </div>

      {/* Input */}
      {!result && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-10 space-y-8 shadow-2xl">
            <div className="flex items-center gap-4">
               <div className="w-1 h-6 bg-red-600" />
               <h2 className="text-xs font-black uppercase tracking-widest text-gray-950 italic">Target Parameters</h2>
            </div>

            <div className="elite-input-group">
              <label className="elite-label">Target Role (optional)</label>
              <input
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                placeholder="e.g. Full Stack Developer"
                className="elite-input"
              />
            </div>

            <div className="elite-input-group">
              <label className="elite-label">
                Your Skills Override (optional — AI auto-reads your resume)
              </label>
              <input
                value={manualSkills}
                onChange={e => setManualSkills(e.target.value)}
                placeholder="React, Node.js, MongoDB, Python... (comma-separated)"
                className="elite-input"
              />
              <p className="text-[9px] text-gray-400 mt-2 italic font-black uppercase tracking-widest opacity-60">Leave blank to use your saved resume skills automatically.</p>
            </div>

            <div className="elite-input-group">
              <label className="elite-label">Job Description * (paste full JD)</label>
              <textarea
                value={jdText}
                onChange={e => setJdText(e.target.value)}
                rows={12}
                placeholder="Paste the complete job description here..."
                className="elite-input min-h-[300px]"
              />
            </div>

            <button
              onClick={analyze}
              disabled={loading}
              className="elite-button btn-elite-primary w-full py-6 group"
            >
              {loading ? <TfiReload className="animate-spin text-lg" /> : <TfiBarChart className="text-lg group-hover:scale-110 transition-transform" />}
              {loading ? 'INITIALIZING ANALYSIS...' : 'EXECUTE MATCH ANALYSIS'}
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Score + verdict hero */}
            <div className="bg-white border border-gray-100 rounded-3xl p-10 flex flex-col md:flex-row items-center gap-12 shadow-2xl">
              <ScoreRing score={result.match_score || 0} />
              <div className="flex-1 space-y-6">
                {result.overall_verdict && (
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-inner">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-3 italic">Intelligence Verdict</p>
                    <p className="text-sm text-gray-950 leading-relaxed font-medium">{result.overall_verdict}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 text-center shadow-sm transition-transform hover:scale-105">
                    <p className="text-3xl font-black text-emerald-600 italic">{(result.matched_skills || []).length}</p>
                    <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest italic mt-1">Skills Matched</p>
                  </div>
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-center shadow-sm transition-transform hover:scale-105">
                    <p className="text-3xl font-black text-red-600 italic">{(result.missing_skills || []).length}</p>
                    <p className="text-[9px] text-red-500 font-black uppercase tracking-widest italic mt-1">Skills Missing</p>
                  </div>
                </div>
                <button
                  onClick={() => { setResult(null); setJdText(''); }}
                  className="text-[10px] text-gray-400 hover:text-red-600 font-black uppercase tracking-[0.3em] italic transition-all flex items-center gap-2"
                >
                  <TfiReload size={10} /> RE-INITIALIZE ANALYSIS
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-2xl">
              <div className="flex border-b border-gray-50 overflow-x-auto bg-gray-50/30">
                {TABS.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTab(i)}
                    className={`flex-1 min-w-max px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] italic transition-all whitespace-nowrap ${
                      activeTab === i ? 'bg-white text-red-600 border-b-2 border-red-600' : 'text-gray-400 hover:text-gray-950 hover:bg-gray-50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="p-8">
                {/* Match Score tab */}
                {activeTab === 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-4 italic flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> COMPATIBLE NODES
                      </p>
                      {(result.matched_skills || []).map((s, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100/50">
                          <TfiCheck className="text-emerald-600 text-xs flex-shrink-0" />
                          <span className="text-xs font-black uppercase tracking-wider text-emerald-950 italic">{s}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-4 italic flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-amber-600" /> PARTIAL OVERLAP
                      </p>
                      {(result.partial_skills || []).map((s, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100/50">
                          <TfiStar className="text-amber-600 text-xs flex-shrink-0" />
                          <span className="text-xs font-black uppercase tracking-wider text-amber-950 italic">{typeof s === 'object' ? `${s.skill} (${s.gap})` : s}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-4 italic flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-red-600" /> CRITICAL GAPS
                      </p>
                      {(result.missing_skills || []).map((s, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100/50">
                          <TfiClose className="text-red-600 text-xs flex-shrink-0" />
                          <span className="text-xs font-black uppercase tracking-wider text-red-950 italic">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills Gap */}
                {activeTab === 1 && (
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic mb-6">Priority skills to acquire before applying:</p>
                    {(result.missing_skills || []).map((skill, i) => {
                      const priority = i < 2 ? 'High' : i < 4 ? 'Medium' : 'Low';
                      const color = i < 2 ? 'red' : i < 4 ? 'amber' : 'gray';
                      return (
                        <div key={i} className={`flex items-center justify-between p-5 bg-${color}-50 border border-${color}-100 rounded-2xl transition-all hover:translate-x-2`}>
                          <div className="flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full bg-${color}-600 shadow-[0_0_10px_rgba(220,38,38,0.3)]`} />
                            <span className="text-sm font-black text-gray-950 uppercase tracking-widest italic">{skill}</span>
                          </div>
                          <span className={`text-[9px] font-black uppercase tracking-[0.2em] italic text-${color}-600 bg-white px-3 py-1 rounded-lg border border-${color}-100 shadow-sm`}>{priority} Priority</span>
                        </div>
                      );
                    })}
                    {(result.missing_skills || []).length === 0 && (
                      <div className="text-center py-12">
                        <TfiCheck className="text-6xl text-emerald-600 mx-auto mb-4 opacity-20" />
                        <p className="text-gray-400 font-black uppercase tracking-[0.4em] text-xs italic">Optimal Alignment Detected</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Learning Plan */}
                {activeTab === 2 && (
                  <div className="space-y-4">
                    {(result.learning_plan || []).map((item, i) => (
                      <div key={i} className="p-6 bg-gray-50 border border-gray-100 rounded-2xl space-y-3 shadow-sm hover:border-red-600/30 transition-all">
                        <div className="flex items-center justify-between">
                          <p className="font-black text-gray-950 text-sm uppercase tracking-widest italic">{typeof item === 'object' ? item.skill : item}</p>
                          {typeof item === 'object' && item.timeframe && (
                            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest italic bg-white px-3 py-1 rounded-lg border border-red-100">{item.timeframe}</span>
                          )}
                        </div>
                        {typeof item === 'object' && item.resources && (
                          <div className="flex items-center gap-3">
                             <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                             <p className="text-xs text-gray-600 font-medium italic">{Array.isArray(item.resources) ? item.resources.join(', ') : item.resources}</p>
                          </div>
                        )}
                        {typeof item === 'object' && item.how && (
                          <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-gray-50 mt-4 shadow-inner">
                             <TfiLightBulb className="text-amber-500 mt-0.5 flex-shrink-0" />
                             <p className="text-[12px] text-gray-700 leading-relaxed font-medium">{item.how}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* ATS & Application */}
                {activeTab === 3 && (
                  <div className="space-y-6">
                    {result.ats_pass_prediction && (
                      <div className={`p-6 rounded-2xl border-2 ${result.ats_pass_prediction.toLowerCase().includes('high') || result.ats_pass_prediction.toLowerCase().includes('likely') ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100 shadow-sm'}`}>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2 italic">ATS Pass Prediction</p>
                        <p className="text-xl font-black text-gray-950 italic uppercase tracking-tight">{result.ats_pass_prediction}</p>
                      </div>
                    )}
                    {result.application_advice && (
                      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 italic">Deployment Strategy</p>
                        <p className="text-sm text-gray-700 leading-relaxed font-medium italic">{result.application_advice}</p>
                      </div>
                    )}
                    {result.resume_tips && (
                      <div className="bg-red-50 border border-red-100 rounded-2xl p-6 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-3 italic">Resume Optimization Protocols</p>
                        <p className="text-sm text-gray-800 leading-relaxed font-medium">{Array.isArray(result.resume_tips) ? result.resume_tips.join(' • ') : result.resume_tips}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Interview Prep */}
                {activeTab === 4 && (
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic mb-6">Predicted interview vectors based on this JD:</p>
                    {(result.interview_likely_questions || []).map((q, i) => (
                      <div key={i} className="flex items-start gap-4 p-5 bg-gray-50 border border-gray-100 rounded-2xl hover:border-red-600/30 transition-all group">
                        <span className="w-8 h-8 rounded-lg bg-gray-950 text-white font-black text-[10px] flex items-center justify-center flex-shrink-0 group-hover:bg-red-600 transition-colors shadow-lg italic">{String(i + 1).padStart(2, '0')}</span>
                        <p className="text-sm text-gray-800 font-bold leading-relaxed">{q}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
