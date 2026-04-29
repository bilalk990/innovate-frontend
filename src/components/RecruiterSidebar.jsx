import { NavLink, useNavigate } from 'react-router-dom';
import React from 'react';
import {
  TfiLayoutGrid2,
  TfiStatsUp,
  TfiUser,
  TfiSettings,
  TfiPowerOff,
  TfiLayers,
  TfiCalendar,
  TfiBriefcase,
  TfiBolt,
  TfiShield,
  TfiPulse,
  TfiTarget,
  TfiLink,
} from 'react-icons/tfi';
import useAuthStore from '../store/useAuthStore';

const navItems = [
  { to: '/recruiter/dashboard', icon: <TfiLayoutGrid2 />, label: 'Dashboard' },
  { to: '/recruiter/jobs', icon: <TfiBriefcase />, label: 'Job Postings' },
  { to: '/recruiter/candidates', icon: <TfiUser />, label: 'Candidates' },
  { to: '/recruiter/schedule', icon: <TfiCalendar />, label: 'Interviews' },
  { to: '/recruiter/ranking', icon: <TfiStatsUp />, label: 'Candidate Ranking' },
  { to: '/recruiter/question-bank', icon: <TfiLayoutGrid2 />, label: 'Question Bank' },
  { to: '/recruiter/ai-tools', icon: <TfiBolt />, label: 'AI Tools' },
  { to: '/recruiter/profile', icon: <TfiLink />, label: 'Profile Settings' },
];

export default function RecruiterSidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

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
    <aside className="elite-sidebar">
      {/* Brand Logo */}
      <div className="sidebar-logo">
        <img src="/logo.png" alt="InnovAIte" className="h-10 w-auto" />
        <div className="logo-text uppercase tracking-tighter italic">Innov<span className="text-red-600">AI</span>te <span className="text-[10px] font-black opacity-40 ml-1">Pro</span></div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-label tracking-[0.3em] mb-4">Recruitment</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `elite-nav-link ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span className="uppercase tracking-widest italic font-black text-xs">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Session Section */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar-sm shadow-xl shadow-red-500/10 border-red-500/20">
            {user?.name?.charAt(0)}
          </div>
          <div className="user-info-sm">
            <h4 className="uppercase italic font-black text-white">{user?.name}</h4>
            <p className="text-[9px] font-black uppercase text-gray-500 tracking-[0.2em] leading-none">Recruiter · {user?.company_name?.substring(0, 10)}</p>
          </div>
        </div>
        <button 
          onClick={handleLogoutClick}
          className="btn-terminate group"
        >
          <TfiPowerOff className="group-hover:rotate-90 transition-transform duration-500" />
          <span className="uppercase tracking-[0.2em] font-black text-[10px]">Logout</span>
        </button>
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
