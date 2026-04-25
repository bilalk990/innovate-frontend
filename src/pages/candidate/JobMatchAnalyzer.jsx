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
          <circle cx="50" cy="50" r="42" fill="none" stroke="#ffffff10" strokeWidth="8" />
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
    <div className="min-h-screen bg-[#050505] text-white p-8">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-600/30 flex items-center justify-center text-red-500 text-xl">
            <TfiTarget />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight italic">Job Match AI</h1>
            <p className="text-gray-500 text-sm mt-0.5">Deep-analyze any job description against your profile — know exactly where you stand</p>
          </div>
        </div>
      </div>

      {/* Input */}
      {!result && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-5">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block italic">Target Role (optional)</label>
              <input
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                placeholder="e.g. Full Stack Developer"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600/50"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block italic">
                Your Skills Override (optional — AI auto-reads your resume)
              </label>
              <input
                value={manualSkills}
                onChange={e => setManualSkills(e.target.value)}
                placeholder="React, Node.js, MongoDB, Python... (comma-separated)"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600/50"
              />
              <p className="text-[10px] text-gray-600 mt-1 italic">Leave blank to use your saved resume skills automatically.</p>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block italic">Job Description * (paste full JD)</label>
              <textarea
                value={jdText}
                onChange={e => setJdText(e.target.value)}
                rows={12}
                placeholder="Paste the complete job description here — all requirements, responsibilities, and qualifications..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600/50 resize-none"
              />
            </div>

            <button
              onClick={analyze}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest text-sm italic transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <TfiReload className="animate-spin text-lg" /> : <TfiBarChart className="text-lg" />}
              {loading ? 'Analyzing Match...' : 'Analyze My Match'}
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
            <div className="bg-white/3 border border-white/8 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8">
              <ScoreRing score={result.match_score || 0} />
              <div className="flex-1 space-y-4">
                {result.overall_verdict && (
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 italic">Overall Verdict</p>
                    <p className="text-sm text-gray-200 leading-relaxed">{result.overall_verdict}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-emerald-400">{(result.matched_skills || []).length}</p>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-wider italic">Skills Matched</p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-red-400">{(result.missing_skills || []).length}</p>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-wider italic">Skills Missing</p>
                  </div>
                </div>
                <button
                  onClick={() => { setResult(null); setJdText(''); }}
                  className="text-xs text-gray-500 hover:text-red-400 font-black uppercase tracking-widest italic transition-colors"
                >
                  ← Analyze Another Job
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
              <div className="flex border-b border-white/8 overflow-x-auto">
                {TABS.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTab(i)}
                    className={`flex-1 min-w-max px-4 py-3 text-[10px] font-black uppercase tracking-widest italic transition-all whitespace-nowrap ${
                      activeTab === i ? 'bg-red-600/15 text-red-400 border-b-2 border-red-600' : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Match Score tab */}
                {activeTab === 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-3 italic">✓ Matched Skills</p>
                      {(result.matched_skills || []).map((s, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <TfiCheck className="text-emerald-400 text-xs flex-shrink-0" />
                          <span className="text-sm text-gray-300">{s}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-yellow-400 mb-3 italic">~ Partial Match</p>
                      {(result.partial_skills || []).map((s, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <TfiStar className="text-yellow-400 text-xs flex-shrink-0" />
                          <span className="text-sm text-gray-300">{typeof s === 'object' ? `${s.skill} (${s.gap})` : s}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-3 italic">✗ Missing Skills</p>
                      {(result.missing_skills || []).map((s, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <TfiClose className="text-red-400 text-xs flex-shrink-0" />
                          <span className="text-sm text-gray-300">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills Gap */}
                {activeTab === 1 && (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500 italic mb-4">Priority skills to acquire before applying:</p>
                    {(result.missing_skills || []).map((skill, i) => {
                      const priority = i < 2 ? 'High' : i < 4 ? 'Medium' : 'Low';
                      const color = i < 2 ? 'red' : i < 4 ? 'yellow' : 'gray';
                      return (
                        <div key={i} className={`flex items-center justify-between p-4 bg-${color}-500/10 border border-${color}-500/20 rounded-xl`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full bg-${color}-400`} />
                            <span className="text-sm font-bold text-white">{skill}</span>
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-wider italic text-${color}-400`}>{priority} Priority</span>
                        </div>
                      );
                    })}
                    {(result.missing_skills || []).length === 0 && (
                      <div className="text-center py-8">
                        <TfiCheck className="text-5xl text-emerald-400 mx-auto mb-3" />
                        <p className="text-gray-400 font-black uppercase tracking-widest text-sm italic">No major skill gaps!</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Learning Plan */}
                {activeTab === 2 && (
                  <div className="space-y-4">
                    {(result.learning_plan || []).map((item, i) => (
                      <div key={i} className="p-4 bg-white/3 border border-white/8 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-black text-white text-sm uppercase tracking-wider italic">{typeof item === 'object' ? item.skill : item}</p>
                          {typeof item === 'object' && item.timeframe && (
                            <span className="text-[10px] text-gray-500 italic">{item.timeframe}</span>
                          )}
                        </div>
                        {typeof item === 'object' && item.resources && (
                          <p className="text-xs text-gray-400">{Array.isArray(item.resources) ? item.resources.join(', ') : item.resources}</p>
                        )}
                        {typeof item === 'object' && item.how && (
                          <p className="text-xs text-gray-400">{item.how}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* ATS & Application */}
                {activeTab === 3 && (
                  <div className="space-y-4">
                    {result.ats_pass_prediction && (
                      <div className={`p-4 rounded-xl border ${result.ats_pass_prediction.toLowerCase().includes('high') || result.ats_pass_prediction.toLowerCase().includes('likely') ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 italic">ATS Pass Prediction</p>
                        <p className="text-sm font-bold text-white">{result.ats_pass_prediction}</p>
                      </div>
                    )}
                    {result.application_advice && (
                      <div className="bg-white/3 border border-white/8 rounded-xl p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 italic">Application Advice</p>
                        <p className="text-sm text-gray-300 leading-relaxed">{result.application_advice}</p>
                      </div>
                    )}
                    {result.resume_tips && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2 italic">Resume Tips for This Role</p>
                        <p className="text-sm text-gray-300 leading-relaxed">{Array.isArray(result.resume_tips) ? result.resume_tips.join(' • ') : result.resume_tips}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Interview Prep */}
                {activeTab === 4 && (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500 italic mb-4">Likely interview questions based on this JD:</p>
                    {(result.interview_likely_questions || []).map((q, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-white/3 border border-white/8 rounded-xl">
                        <span className="text-red-500 font-black text-sm flex-shrink-0">{i + 1}.</span>
                        <p className="text-sm text-gray-300">{q}</p>
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
