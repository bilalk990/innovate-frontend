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
    <div className="min-h-screen bg-transparent p-8">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-600 text-xl shadow-sm">
            <TfiLayoutGrid2 />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight italic text-gray-950">Portfolio Project AI</h1>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1 italic">Tactical Asset Deployment</p>
          </div>
        </div>
      </div>

      {!result ? (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border border-gray-100 rounded-3xl p-10 space-y-8 shadow-2xl">
            <div className="flex items-center gap-4">
               <div className="w-1 h-6 bg-red-600" />
               <h2 className="text-xs font-black uppercase tracking-widest text-gray-950 italic">Project Parameters</h2>
            </div>

            <div className="elite-input-group">
              <label className="elite-label">Target Role *</label>
              <input
                value={form.target_role}
                onChange={e => set('target_role', e.target.value)}
                placeholder="e.g. Full Stack Developer, Data Scientist, UX Designer..."
                className="elite-input"
              />
            </div>

            <div className="elite-input-group">
              <label className="elite-label">Experience Level</label>
              <div className="grid grid-cols-2 gap-3">
                {LEVELS.map(l => (
                  <button
                    key={l}
                    onClick={() => set('experience_level', l)}
                    className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider italic transition-all ${
                      form.experience_level === l
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                        : 'bg-gray-50 text-gray-400 border border-gray-100 hover:border-red-600/40 hover:text-gray-900'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="elite-input-group">
              <label className="elite-label">Industry</label>
              <input
                value={form.industry}
                onChange={e => set('industry', e.target.value)}
                placeholder="Technology, Healthcare, Finance, E-commerce..."
                className="elite-input"
              />
            </div>

            <div className="elite-input-group">
              <label className="elite-label">
                Your Current Skills (optional — AI reads your resume)
              </label>
              <input
                value={form.current_skills}
                onChange={e => set('current_skills', e.target.value)}
                placeholder="React, Python, Figma, SQL... (comma-separated)"
                className="elite-input"
              />
            </div>

            <button
              onClick={generate}
              disabled={loading}
              className="elite-button btn-elite-primary w-full py-6 group"
            >
              {loading ? <TfiReload className="animate-spin text-lg" /> : <TfiBolt className="text-lg group-hover:scale-110 transition-transform" />}
              {loading ? 'INITIALIZING ASSETS...' : 'EXECUTE PORTFOLIO STRATEGY'}
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
              <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-white border border-red-100 flex items-center justify-center text-red-600 shadow-sm flex-shrink-0">
                   <TfiBolt className="text-xl" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mb-2 italic">Intelligence Edge</p>
                  <p className="text-sm text-gray-950 font-medium leading-relaxed italic">{result.bonus_differentiator}</p>
                </div>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-2xl">
              <div className="flex border-b border-gray-50 overflow-x-auto bg-gray-50/30">
                {STRATEGY_TABS.map((t, i) => (
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
                {/* Projects tab */}
                {activeTab === 0 && (
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic mb-6">Click a node to expand technical specifications:</p>
                    {(result.projects || []).map((proj, i) => {
                      const cc = complexityColor(proj.complexity || '');
                      const isExpanded = expandedProject === i;
                      return (
                        <div
                          key={i}
                          className={`border-2 rounded-2xl overflow-hidden transition-all ${
                            isExpanded ? 'border-red-600 bg-red-50/10 shadow-xl' : 'border-gray-50 bg-gray-50/50 hover:border-gray-200 hover:bg-white'
                          }`}
                          onClick={() => setExpandedProject(isExpanded ? null : i)}
                        >
                          <div className="p-6 flex items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black italic transition-colors ${isExpanded ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-white text-gray-400 border border-gray-100'}`}>
                                {String(i + 1).padStart(2, '0')}
                              </div>
                              <div>
                                <p className="font-black text-gray-950 uppercase tracking-widest text-sm italic">{proj.name}</p>
                                {proj.tagline && <p className="text-[11px] text-gray-500 mt-1 italic font-medium">{proj.tagline}</p>}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 flex-shrink-0">
                              {proj.complexity && (
                                <span className={`text-[9px] font-black uppercase tracking-widest italic px-3 py-1.5 rounded-lg bg-${cc}-50 text-${cc}-700 border border-${cc}-100 shadow-sm`}>
                                  {proj.complexity}
                                </span>
                              )}
                              {proj.estimated_build_time && (
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic bg-white px-3 py-1.5 rounded-lg border border-gray-100">{proj.estimated_build_time}</span>
                              )}
                            </div>
                          </div>

                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="border-t border-gray-100 p-8 space-y-8 bg-white shadow-inner"
                              onClick={e => e.stopPropagation()}
                            >
                              {/* Tech Stack */}
                              {proj.tech_stack && (
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4 italic">System Stack</p>
                                  <div className="flex flex-wrap gap-3">
                                    {(Array.isArray(proj.tech_stack) ? proj.tech_stack : proj.tech_stack.split(',')).map((t, ti) => (
                                      <span key={ti} className="px-3 py-1.5 bg-gray-950 text-white rounded-lg text-[10px] font-black uppercase tracking-wider italic shadow-lg">
                                        {t.trim()}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Key Features */}
                                {proj.key_features_to_build && (
                                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-950 mb-4 italic flex items-center gap-2">
                                       <div className="w-1.5 h-1.5 rounded-full bg-red-600" /> DEPLOYMENT FEATURES
                                    </p>
                                    <div className="space-y-3">
                                      {(Array.isArray(proj.key_features_to_build) ? proj.key_features_to_build : [proj.key_features_to_build]).map((f, fi) => (
                                        <div key={fi} className="flex items-start gap-3">
                                          <TfiTarget className="text-red-600 text-[10px] mt-1 flex-shrink-0" />
                                          <p className="text-xs text-gray-700 font-medium">{f}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Wow Factor */}
                                {proj.wow_factor && (
                                  <div className="bg-amber-50 border-2 border-amber-100 rounded-2xl p-6 shadow-sm">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-3 italic flex items-center gap-2">
                                       <TfiStar size={10} /> DIFFERENTIATOR
                                    </p>
                                    <p className="text-xs text-amber-900 font-bold leading-relaxed italic">{proj.wow_factor}</p>
                                  </div>
                                )}
                              </div>

                              {/* How to Present */}
                              {proj.how_to_present && (
                                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-700 mb-3 italic">Presentation Strategy</p>
                                  <p className="text-xs text-blue-900 leading-relaxed font-medium">{proj.how_to_present}</p>
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-6">
                                {proj.github_readme_tip && (
                                  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 italic">Repository Protocol</p>
                                    <p className="text-[11px] text-gray-700 leading-relaxed italic">{proj.github_readme_tip}</p>
                                  </div>
                                )}
                                {proj.live_demo_tip && (
                                  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 italic">Visual Hook</p>
                                    <p className="text-[11px] text-gray-700 leading-relaxed italic">{proj.live_demo_tip}</p>
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
                      <div key={i} className="flex items-start gap-4 p-5 bg-gray-50 border border-gray-100 rounded-2xl shadow-sm">
                        <div className="w-6 h-6 rounded-lg bg-red-600/10 flex items-center justify-center text-red-600 flex-shrink-0 mt-0.5">
                           <TfiStar size={12} />
                        </div>
                        <p className="text-sm text-gray-800 font-medium leading-relaxed">{s}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* GitHub Tips */}
                {activeTab === 2 && (
                  <div className="space-y-4">
                    {(result.github_profile_tips || []).map((tip, i) => (
                      <div key={i} className="flex items-start gap-4 p-5 bg-gray-50 border border-gray-100 rounded-2xl shadow-sm">
                        <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 flex-shrink-0 mt-0.5">
                           <TfiLightBulb size={12} />
                        </div>
                        <p className="text-sm text-gray-800 font-medium leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Demo Day */}
                {activeTab === 3 && result.demo_day_advice && (
                  <div className="space-y-4">
                    {(Array.isArray(result.demo_day_advice) ? result.demo_day_advice : [result.demo_day_advice]).map((a, i) => (
                      <div key={i} className="flex items-start gap-4 p-5 bg-gray-50 border border-gray-100 rounded-2xl shadow-sm">
                        <div className="w-6 h-6 rounded-lg bg-red-600/10 flex items-center justify-center text-red-600 flex-shrink-0 mt-0.5">
                           <TfiBolt size={12} />
                        </div>
                        <p className="text-sm text-gray-800 font-medium leading-relaxed">{a}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Presentation Tips */}
                {activeTab === 4 && (
                  <div className="space-y-4">
                    {(result.presentation_tips || []).map((tip, i) => (
                      <div key={i} className="flex items-start gap-4 p-5 bg-gray-50 border border-gray-100 rounded-2xl shadow-sm">
                        <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5">
                           <TfiWrite size={12} />
                        </div>
                        <p className="text-sm text-gray-800 font-medium leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setResult(null)}
              className="text-[10px] text-gray-400 hover:text-red-600 font-black uppercase tracking-[0.3em] italic transition-all flex items-center gap-2"
            >
              <TfiReload size={10} /> RE-INITIALIZE STRATEGY
            </button>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
