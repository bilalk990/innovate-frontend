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
} from 'react-icons/tfi';
import useAuthStore from '../store/useAuthStore';

const navItems = [
  { to: '/candidate/dashboard', icon: <TfiLayoutGrid2 />, label: 'Dashboard' },
  { to: '/candidate/jobs',         icon: <TfiLayers />,    label: 'Job Marketplace' },
  { to: '/candidate/applications', icon: <TfiBriefcase />, label: 'My Applications' },
  { to: '/candidate/interviews',   icon: <TfiCalendar />,  label: 'Interviews' },
  { to: '/candidate/ai-insights', icon: <TfiStatsUp />, label: 'AI Insights' },
  { to: '/candidate/resume', icon: <TfiUser />, label: 'Upload Resume' },
  { to: '/candidate/resume-builder', icon: <TfiBolt />, label: 'AI Resume Builder' },
  { to: '/candidate/profile', icon: <TfiSettings />, label: 'Settings' },
];

export default function CandidateSidebar() {
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
        <div className="logo-text uppercase tracking-tighter">Innov<span className="text-red-600">AI</span>te</div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-label tracking-[0.2em] mb-4">Main Menu</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `elite-nav-link ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span className="uppercase tracking-tighter italic font-black">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Session Section */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar-sm shadow-xl shadow-red-500/20">
            {user?.name?.charAt(0)}
          </div>
          <div className="user-info-sm">
            <h4 className="uppercase italic font-black text-white">{user?.name}</h4>
            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Candidate</p>
          </div>
        </div>
        <button 
          onClick={handleLogoutClick}
          className="btn-terminate group"
        >
          <TfiPowerOff className="group-hover:rotate-90 transition-transform" />
          <span className="uppercase tracking-widest font-black">Logout</span>
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
