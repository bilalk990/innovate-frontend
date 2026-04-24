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
  TfiMedall,
  TfiMap
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
      { path: '/candidate/salary-negotiator', icon: TfiMedall, label: 'Salary AI' },
      { path: '/candidate/career-path', icon: TfiMap, label: 'Career Path' },
      { path: '/candidate/interview-prep', icon: TfiTarget, label: 'Prep Lab' },
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

  const userType = user?.role || 'candidate';
  const navigation = userType === 'admin' ? adminNavigation : (userType === 'recruiter' ? recruiterNavigation : candidateNavigation);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`fixed left-0 top-0 h-screen z-50 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] border-r border-white/10 bg-[#050505] flex flex-col ${collapsed ? 'w-20' : 'w-[280px] shadow-[20px_0_40px_rgba(0,0,0,0.4)]'}`}>
      
      {/* Brand Header */}
      <div className={`p-8 flex items-center gap-5 border-b border-white/10 bg-white/5 overflow-hidden ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-12 h-12 min-w-[3rem] rounded-2xl bg-red-600 flex items-center justify-center text-white text-3xl shadow-lg border border-red-500">
          <TfiBolt />
        </div>
        {!collapsed && (
          <div className="whitespace-nowrap flex flex-col">
            <span className="text-2xl font-black italic tracking-tighter text-white">
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
          <div key={sIdx} className="space-y-3">
            {!collapsed && (
              <h3 className="px-6 text-[10px] font-black uppercase tracking-[0.5em] text-gray-300 italic">
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
                    className={`group flex items-center ${collapsed ? 'justify-center w-full' : 'gap-5 px-6'} py-4 rounded-2xl transition-all duration-500 relative ${isActive ? 'bg-red-600/10 text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
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
        className="absolute bottom-32 right-[-14px] w-7 h-7 rounded-full bg-[#050505] border border-white/10 text-gray-500 flex items-center justify-center hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-xl z-50 group"
      >
        {collapsed ? <TfiAngleRight className="group-hover:scale-125" /> : <TfiAngleLeft className="group-hover:scale-125" />}
      </button>

      {/* User Section (Bottom) */}
      <div className={`p-6 border-t border-white/5 bg-white/5 group cursor-pointer hover:bg-white/10 transition-colors mt-auto ${collapsed ? 'flex justify-center' : ''}`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 min-w-[3rem] rounded-2xl bg-gray-900 text-white flex items-center justify-center text-xl font-black italic shadow-md group-hover:bg-red-600 group-hover:text-white transition-all duration-500">
            {user?.name?.charAt(0) || 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
            <div className="text-[13px] font-black text-white italic truncate uppercase tracking-widest leading-none mb-2">
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
                onClick={handleLogout}
                className="p-3 rounded-xl bg-gray-100 text-gray-400 hover:bg-red-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
             >
                <TfiPowerOff className="text-lg" />
             </button>
          )}
        </div>
      </div>
    </aside>
  );
}
