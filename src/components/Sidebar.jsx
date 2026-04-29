import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  TfiDashboard,
  TfiBriefcase,
  TfiFile,
  TfiUser,
  TfiTarget,
  TfiBolt,
  TfiStatsUp,
  TfiPulse,
  TfiShield,
  TfiMarker,
  TfiLayers,
  TfiAngleLeft,
  TfiAngleRight,
  TfiPowerOff,
  TfiLayoutGrid2,
  TfiReload,
  TfiMicrophone,
  TfiCup,
  TfiMap,
  TfiAgenda,
  TfiComment,
  TfiBarChart,
  TfiSearch,
  TfiWrite,
  TfiViewListAlt,
} from 'react-icons/tfi';
import useAuth from '../hooks/useAuth';

const candidateNavigation = [
  {
    title: 'MAIN MENU',
    items: [
      { path: '/candidate/dashboard', icon: TfiDashboard, label: 'Dashboard' },
      { path: '/candidate/jobs', icon: TfiBriefcase, label: 'Find Jobs' },
      { path: '/candidate/applications', icon: TfiPulse, label: 'Applications' },
    ]
  },
  {
    title: 'CAREER TOOLS',
    items: [
      { path: '/candidate/profile', icon: TfiUser, label: 'My Profile' },
      { path: '/candidate/resume', icon: TfiShield, label: 'Resume/CV' },
      { path: '/candidate/resume-builder', icon: TfiBolt, label: 'Resume Builder' },
      { path: '/candidate/interviews', icon: TfiTarget, label: 'Interviews' },
    ]
  },
  {
    title: 'AI CAREER TOOLS',
    items: [
      { path: '/candidate/ai-insights', icon: TfiStatsUp, label: 'AI Insights' },
      { path: '/candidate/mock-interview', icon: TfiMicrophone, label: 'Mock Interview' },
      { path: '/candidate/salary-negotiator', icon: TfiCup, label: 'Salary AI' },
      { path: '/candidate/career-path', icon: TfiMap, label: 'Career Path' },
      { path: '/candidate/anxiety-coach', icon: TfiShield, label: 'Anxiety Coach' },
      { path: '/candidate/cover-letter', icon: TfiWrite, label: 'Cover Letter AI' },
      { path: '/candidate/job-match', icon: TfiSearch, label: 'Job Match AI' },
      { path: '/candidate/self-intro', icon: TfiMicrophone, label: 'Intro Coach' },
      { path: '/candidate/portfolio-advisor', icon: TfiLayoutGrid2, label: 'Portfolio AI' },
    ]
  }
];

const recruiterNavigation = [
  {
    title: 'RECRUITER MENU',
    items: [
      { path: '/recruiter/dashboard', icon: TfiDashboard, label: 'Dashboard' },
      { path: '/recruiter/jobs', icon: TfiBriefcase, label: 'Job Postings' },
      { path: '/recruiter/candidates', icon: TfiUser, label: 'Find Candidates' },
    ]
  },
  {
    title: 'RECRUITMENT TOOLS',
    items: [
      { path: '/recruiter/profile', icon: TfiUser, label: 'My Profile' },
      { path: '/recruiter/applications', icon: TfiLayers, label: 'Applications' },
      { path: '/recruiter/pipeline', icon: TfiReload, label: 'Talent Pipeline' },
      { path: '/recruiter/question-bank', icon: TfiBriefcase, label: 'Question Bank' },
      { path: '/recruiter/jd-analyzer', icon: TfiTarget, label: 'JD Analyzer' },
    ]
  },
  {
    title: 'HR AI TOOLS',
    items: [
      { path: '/recruiter/compare-candidates', icon: TfiViewListAlt, label: 'Compare AI' },
      { path: '/recruiter/bias-detector', icon: TfiSearch, label: 'Bias Detector' },
      { path: '/recruiter/reference-check', icon: TfiComment, label: 'Reference AI' },
      { path: '/recruiter/offer-predictor', icon: TfiCup, label: 'Offer AI' },
      { path: '/recruiter/funnel-analyzer', icon: TfiBarChart, label: 'Funnel AI' },
      { path: '/recruiter/team-fit', icon: TfiLayoutGrid2, label: 'Team Fit AI' },
      { path: '/recruiter/interviewer-coach', icon: TfiAgenda, label: 'Coach AI' },
      { path: '/recruiter/bulk-screener', icon: TfiStatsUp, label: 'Bulk Screener' },
      { path: '/recruiter/email-campaign', icon: TfiWrite, label: 'Email AI' },
      { path: '/recruiter/sentiment-tracker', icon: TfiPulse, label: 'Sentiment AI' },
      { path: '/recruiter/candidate-dna', icon: TfiTarget, label: 'DNA Profiler' },
      { path: '/recruiter/talent-rediscovery', icon: TfiReload, label: 'Rediscovery' },
      { path: '/recruiter/interview-quality', icon: TfiStatsUp, label: 'Quality Intel' },
      { path: '/recruiter/hr-documents', icon: TfiFile, label: 'HR Documents' },
      { path: '/recruiter/handbook-builder', icon: TfiAgenda, label: 'Handbook AI' },
      { path: '/recruiter/ld-roadmap', icon: TfiMap, label: 'L&D Planner' },
      { path: '/recruiter/policy-compliance', icon: TfiShield, label: 'Policy Check' },
    ]
  },
  {
    title: 'SYSTEM TOOLS',
    items: [
      { path: '/recruiter/profile', icon: TfiShield, label: 'Profile Settings' },
    ]
  }
];

const adminNavigation = [
  {
    title: 'ADMIN MENU',
    items: [
      { path: '/admin/dashboard', icon: TfiDashboard, label: 'Dashboard' },
      { path: '/admin/users', icon: TfiUser, label: 'User Management' },
    ]
  },
  {
    title: 'ADMIN TOOLS',
    items: [
      { path: '/admin/reports', icon: TfiStatsUp, label: 'Activity Reports' },
      { path: '/admin/settings', icon: TfiShield, label: 'Settings' },
    ]
  }
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  const userType = user?.role || 'candidate';
  const navigation = userType === 'admin' ? adminNavigation : (userType === 'recruiter' ? recruiterNavigation : candidateNavigation);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/login');
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <aside className={`fixed left-0 top-0 h-screen z-50 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] border-r border-gray-100 bg-white flex flex-col ${collapsed ? 'w-20' : 'w-[280px] shadow-[20px_0_60px_rgba(0,0,0,0.05)]'}`}>

      {/* Brand Header */}
      <div className={`p-8 flex items-center gap-5 border-b border-gray-50 bg-gray-50/50 overflow-hidden ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-12 h-12 min-w-[3rem] rounded-2xl bg-red-600 flex items-center justify-center text-white text-3xl shadow-lg border border-red-500 transition-transform hover:rotate-12">
          <TfiBolt />
        </div>
        {!collapsed && (
          <div className="whitespace-nowrap flex flex-col">
            <span className="text-2xl font-black italic tracking-tighter text-gray-950">
              Innov<span className="text-red-600">AIte</span>
            </span>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] mt-[-2px]">
              {userType} Panel
            </span>
          </div>
        )}
      </div>

      {/* Nav Content */}
      <nav className="p-4 flex flex-col gap-10 overflow-y-auto flex-1 panel-scrollbar mt-6">
        {navigation.map((section, sIdx) => (
          <div key={sIdx} className="space-y-4">
            {!collapsed && (
              <h3 className="px-6 text-[9px] font-black uppercase tracking-[0.6em] text-gray-400 italic">
                {section.title}
              </h3>
            )}
            <div className="space-y-1.5">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`group flex items-center ${collapsed ? 'justify-center w-full' : 'gap-5 px-6'} py-4 rounded-2xl transition-all duration-500 relative ${isActive ? 'bg-red-50 text-red-600' : 'text-gray-500 hover:text-gray-950 hover:bg-gray-50'}`}
                  >
                    {isActive && (
                      <div className={`absolute left-0 top-1/2 -translate-y-1/2 ${collapsed ? 'w-1 h-8' : 'w-1.5 h-6'} bg-red-600 rounded-r-full shadow-md`} />
                    )}
                    <Icon className={`text-xl flex-shrink-0 transition-all duration-500 ${isActive ? 'text-red-600 scale-110' : 'group-hover:text-red-600'}`} />
                    {!collapsed && (
                      <span className="text-[11px] font-black uppercase tracking-[0.2em] italic transition-colors">
                        {item.label}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute bottom-32 right-[-14px] w-8 h-8 rounded-full bg-white border border-gray-100 text-gray-400 flex items-center justify-center hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-xl z-50 group"
      >
        {collapsed ? <TfiAngleRight size={14} className="group-hover:scale-125" /> : <TfiAngleLeft size={14} className="group-hover:scale-125" />}
      </button>

      {/* User Section (Bottom) */}
      <div className={`p-6 border-t border-gray-50 bg-gray-50/30 group cursor-pointer hover:bg-gray-50 transition-colors mt-auto ${collapsed ? 'flex justify-center' : ''}`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 min-w-[3rem] rounded-2xl bg-white border border-gray-100 text-gray-950 flex items-center justify-center text-xl font-black italic shadow-sm group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 transition-all duration-500">
            {user?.name?.charAt(0) || 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <div className="text-[13px] font-black text-gray-950 italic truncate uppercase tracking-widest leading-none mb-2">
                {user?.name || 'Authorized'}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic opacity-70">Active Now</span>
              </div>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogoutClick}
              className="p-3 rounded-xl bg-white border border-gray-100 text-gray-400 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
            >
              <TfiPowerOff className="text-lg" />
            </button>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <TfiPowerOff size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-wider">Confirm Logout</h3>
                <p className="text-sm text-gray-500 mt-1">Are you sure you want to logout?</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={cancelLogout}
                className="flex-1 px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold uppercase tracking-wider text-sm transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider text-sm transition-all shadow-lg shadow-red-600/20"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
