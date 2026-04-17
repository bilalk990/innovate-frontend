import { NavLink, useNavigate } from 'react-router-dom';
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="elite-sidebar">
      {/* Brand Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon bg-red-600 shadow-2xl shadow-red-600/30">R</div>
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
          onClick={handleLogout}
          className="btn-terminate group"
        >
          <TfiPowerOff className="group-hover:rotate-90 transition-transform duration-500" />
          <span className="uppercase tracking-[0.2em] font-black text-[10px]">Logout</span>
        </button>
      </div>
    </aside>
  );
}
