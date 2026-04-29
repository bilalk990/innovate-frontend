import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  LogOut 
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

import NotificationBell from './NotificationBell';

export default function TopBar({ collapsed, userType }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      const role = user?.role || 'candidate';
      const path = role === 'recruiter' ? `/${role}/candidates` : `/${role}/jobs`;
      navigate(`${path}?search=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setSearchFocused(false);
    }
  };

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

  // Global Ctrl+K Focus
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('global-search')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="elite-topbar">
      {/* Search Hub */}
      <div className="flex items-center gap-4 w-full max-w-[550px]">
        <div 
          onClick={() => document.getElementById('global-search')?.focus()}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg border border-gray-100 cursor-pointer ${searchFocused ? 'bg-red-600 text-white border-red-600 scale-110 shadow-red-600/20' : 'bg-white text-gray-400 hover:text-red-600 hover:border-red-600'}`}
        >
          <Search size={18} className={searchFocused ? 'animate-pulse' : ''} />
        </div>
        <div className={`flex-1 flex items-center gap-6 px-8 py-3.5 bg-white border border-gray-100 rounded-full shadow-lg transition-all hover:border-red-600/30 group ${searchFocused ? 'ring-2 ring-red-600/10 border-red-600/50' : ''}`}>
          <input
            id="global-search"
            type="text"
            placeholder="SEARCH JOBS AND ACTIVITY..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full bg-transparent text-gray-950 placeholder:text-gray-300 font-black italic uppercase tracking-[0.2em] text-[11px] outline-none"
          />
          <div className={`flex items-center gap-4 transition-all duration-500 ${searchFocused ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
            <div className="elite-kbd border-gray-100 text-gray-400 flex items-center gap-2 group-hover:bg-red-600/5 group-hover:text-red-600 transition-all px-3 py-1.5 shadow-sm">
              <span className="text-[8px] font-black opacity-40">CMD</span> <span className="mt-[1px]">K</span>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Actions */}
      <div className="flex items-center gap-8 shrink-0">
        
        {/* Network Status - Constrained Node */}
        <div className="hidden lg:flex items-center">
            <div className="elite-status-node">
                <div className="status-pulse" />
                <span className="uppercase tracking-[0.2em] font-black italic text-[8px] whitespace-nowrap">
                    Online
                </span>
            </div>
        </div>

        {/* Intelligence Signal Hub */}
        <NotificationBell />

        <div className="h-8 w-[1px] bg-white/5 mx-2" />

        {/* Tactical User Identity */}
        <div 
          onClick={handleLogoutClick} 
          className="elite-user-dropdown-trigger group cursor-pointer"
        >
          <div className="user-node-avatar">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden md:flex flex-col">
            <div className="user-node-name truncate max-w-[120px]">{user?.name || 'User'}</div>
            <div className="user-node-status">
              <LogOut size={9} /> <span className="mt-[0.5px]">Logout</span>
            </div>
          </div>
          <ChevronDown size={14} className="text-gray-600 group-hover:text-white transition-colors ml-2" />
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <LogOut size={24} className="text-red-600" />
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
    </header>
  );
}
