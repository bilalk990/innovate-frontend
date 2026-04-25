import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  TfiLayoutGrid2, TfiReload, TfiStar, TfiLightBulb,
  TfiTarget, TfiShield, TfiWrite, TfiBolt,
} from 'react-icons/tfi';
import authService from '../../services/authService';

const LEVELS = ['Student', 'Junior (0-2 yrs)', 'Mid-level (2-5 yrs)', 'Senior (5+ yrs)'];

const COMPLEXITY_COLOR = {
  beginner: 'emerald', easy: 'emerald',
  intermediate: 'yellow', medium: 'yellow',
  advanced: 'red', expert: 'red',
};

const STRATEGY_TABS = ['Projects', 'Portfolio Strategy', 'GitHub Tips', 'Demo Day', 'Presentation'];

export default function PortfolioAdvisor() {
  const [form, setForm] = useState({
    target_role: '',
    experience_level: 'Mid-level (2-5 yrs)',
    industry: 'Technology',
    current_skills: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [expandedProject, setExpandedProject] = useState(0);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const generate = async () => {
    if (!form.target_role.trim()) return toast.error('Enter your target role.');
    setLoading(true);
    setResult(null);
    try {
      const res = await authService.getPortfolioSuggestions(form);
      setResult(res.data);
      setActiveTab(0);
      setExpandedProject(0);
      toast.success('Portfolio plan ready!');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Generation failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const complexityColor = (c = '') => {
    const lower = c.toLowerCase();
    for (const [k, v] of Object.entries(COMPLEXITY_COLOR)) {
      if (lower.includes(k)) return v;
    }
    return 'gray';
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-600/30 flex items-center justify-center text-red-500 text-xl">
            <TfiLayoutGrid2 />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight italic">Portfolio Project AI</h1>
            <p className="text-gray-500 text-sm mt-0.5">AI-curated project ideas that make recruiters stop scrolling — tailored to your exact role</p>
          </div>
        </div>
      </div>

      {!result ? (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-5">
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 italic">Your Target</h2>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block italic">Target Role *</label>
              <input
                value={form.target_role}
                onChange={e => set('target_role', e.target.value)}
                placeholder="e.g. Full Stack Developer, Data Scientist, UX Designer..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600/50"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block italic">Experience Level</label>
              <div className="grid grid-cols-2 gap-2">
                {LEVELS.map(l => (
                  <button
                    key={l}
                    onClick={() => set('experience_level', l)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider italic transition-all ${
                      form.experience_level === l
                        ? 'bg-red-600 text-white border border-red-500'
                        : 'bg-white/5 text-gray-400 border border-white/10 hover:border-red-600/40 hover:text-white'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block italic">Industry</label>
              <input
                value={form.industry}
                onChange={e => set('industry', e.target.value)}
                placeholder="Technology, Healthcare, Finance, E-commerce..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600/50"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block italic">
                Your Current Skills (optional — AI reads your resume)
              </label>
              <input
                value={form.current_skills}
                onChange={e => set('current_skills', e.target.value)}
                placeholder="React, Python, Figma, SQL... (comma-separated)"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600/50"
              />
            </div>

            <button
              onClick={generate}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest text-sm italic transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <TfiReload className="animate-spin text-lg" /> : <TfiBolt className="text-lg" />}
              {loading ? 'Planning Your Portfolio...' : 'Generate Portfolio Plan'}
            </button>
          </div>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Bonus differentiator */}
            {result.bonus_differentiator && (
              <div className="bg-red-600/10 border border-red-600/30 rounded-2xl p-4 flex items-start gap-3">
                <TfiBolt className="text-red-400 text-lg flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1 italic">Bonus Differentiator</p>
                  <p className="text-sm text-gray-200">{result.bonus_differentiator}</p>
                </div>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
              <div className="flex border-b border-white/8 overflow-x-auto">
                {STRATEGY_TABS.map((t, i) => (
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
                {/* Projects tab */}
                {activeTab === 0 && (
                  <div className="space-y-4">
                    <p className="text-xs text-gray-500 italic">Click a project to expand details:</p>
                    {(result.projects || []).map((proj, i) => {
                      const cc = complexityColor(proj.complexity || '');
                      const isExpanded = expandedProject === i;
                      return (
                        <div
                          key={i}
                          className={`border rounded-2xl overflow-hidden transition-all cursor-pointer ${
                            isExpanded ? 'border-red-600/40 bg-red-600/5' : 'border-white/8 bg-white/3 hover:border-white/20'
                          }`}
                          onClick={() => setExpandedProject(isExpanded ? null : i)}
                        >
                          <div className="p-5 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl font-black text-gray-400 italic">
                                {i + 1}
                              </div>
                              <div>
                                <p className="font-black text-white uppercase tracking-wider text-sm italic">{proj.name}</p>
                                {proj.tagline && <p className="text-xs text-gray-400 mt-0.5 italic">{proj.tagline}</p>}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              {proj.complexity && (
                                <span className={`text-[10px] font-black uppercase tracking-wider italic px-2 py-1 rounded-lg bg-${cc}-500/10 border border-${cc}-500/30 text-${cc}-400`}>
                                  {proj.complexity}
                                </span>
                              )}
                              {proj.estimated_build_time && (
                                <span className="text-[10px] text-gray-500 italic">{proj.estimated_build_time}</span>
                              )}
                            </div>
                          </div>

                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="border-t border-white/8 p-5 space-y-4"
                              onClick={e => e.stopPropagation()}
                            >
                              {/* Tech Stack */}
                              {proj.tech_stack && (
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 italic">Tech Stack</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(Array.isArray(proj.tech_stack) ? proj.tech_stack : proj.tech_stack.split(',')).map((t, ti) => (
                                      <span key={ti} className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs font-bold text-blue-400">
                                        {t.trim()}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Key Features */}
                              {proj.key_features_to_build && (
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 italic">Key Features to Build</p>
                                  <div className="space-y-1.5">
                                    {(Array.isArray(proj.key_features_to_build) ? proj.key_features_to_build : [proj.key_features_to_build]).map((f, fi) => (
                                      <div key={fi} className="flex items-start gap-2">
                                        <TfiTarget className="text-red-400 text-xs mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-gray-300">{f}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Wow Factor */}
                              {proj.wow_factor && (
                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-yellow-400 mb-1 italic">Wow Factor</p>
                                  <p className="text-xs text-gray-300">{proj.wow_factor}</p>
                                </div>
                              )}

                              {/* How to Present */}
                              {proj.how_to_present && (
                                <div className="bg-white/3 rounded-xl p-3">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 italic">How to Present</p>
                                  <p className="text-xs text-gray-300">{proj.how_to_present}</p>
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-3">
                                {proj.github_readme_tip && (
                                  <div className="bg-white/3 rounded-xl p-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 italic">GitHub README Tip</p>
                                    <p className="text-xs text-gray-400">{proj.github_readme_tip}</p>
                                  </div>
                                )}
                                {proj.live_demo_tip && (
                                  <div className="bg-white/3 rounded-xl p-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 italic">Live Demo Tip</p>
                                    <p className="text-xs text-gray-400">{proj.live_demo_tip}</p>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Portfolio Strategy */}
                {activeTab === 1 && result.portfolio_strategy && (
                  <div className="space-y-4">
                    {(Array.isArray(result.portfolio_strategy) ? result.portfolio_strategy : [result.portfolio_strategy]).map((s, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-white/3 border border-white/8 rounded-xl">
                        <TfiStar className="text-red-400 text-sm mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-300">{s}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* GitHub Tips */}
                {activeTab === 2 && (
                  <div className="space-y-3">
                    {(result.github_profile_tips || []).map((tip, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-white/3 border border-white/8 rounded-xl">
                        <TfiLightBulb className="text-yellow-400 text-sm mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-300">{tip}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Demo Day */}
                {activeTab === 3 && result.demo_day_advice && (
                  <div className="space-y-4">
                    {(Array.isArray(result.demo_day_advice) ? result.demo_day_advice : [result.demo_day_advice]).map((a, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-white/3 border border-white/8 rounded-xl">
                        <TfiBolt className="text-red-400 text-sm mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-300">{a}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Presentation Tips */}
                {activeTab === 4 && (
                  <div className="space-y-3">
                    {(result.presentation_tips || []).map((tip, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-white/3 border border-white/8 rounded-xl">
                        <TfiWrite className="text-blue-400 text-sm mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-300">{tip}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setResult(null)}
              className="text-xs text-gray-500 hover:text-red-400 font-black uppercase tracking-widest italic transition-colors"
            >
              ← Generate New Portfolio Plan
            </button>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
