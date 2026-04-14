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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="elite-sidebar">
      {/* Brand Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">I</div>
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
          onClick={handleLogout}
          className="btn-terminate group"
        >
          <TfiPowerOff className="group-hover:rotate-90 transition-transform" />
          <span className="uppercase tracking-widest font-black">Logout</span>
        </button>
      </div>
    </aside>
  );
}
