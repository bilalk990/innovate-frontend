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

  const handleSearch = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      const role = user?.role || 'candidate';
      const path = role === 'recruiter' ? `/${role}/candidates` : `/${role}/jobs`;
      navigate(`${path}?search=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setSearchFocused(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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
      <div className={`elite-search-container ${searchFocused ? 'active ring-2 ring-red-600/10' : ''} border-gray-100 shadow-xl hover:border-red-600/30 transition-all group px-8 py-4 bg-gray-50/50`}>
        <div className="flex items-center justify-center transition-all group-hover:scale-110">
          <Search size={18} className={`${searchFocused ? 'text-red-600 animate-pulse' : 'text-gray-400'} transition-colors`} />
        </div>
        <input
          id="global-search"
          type="text"
          placeholder="SEARCH JOBS AND ACTIVITY..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearch}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="elite-search-input text-gray-950 placeholder:text-gray-400 font-black italic uppercase tracking-[0.2em] text-[11px] bg-transparent"
        />
        <div className={`flex items-center gap-4 transition-all duration-500 ${searchFocused ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
          <div className="elite-kbd border-gray-200 text-gray-400 flex items-center gap-2 group-hover:bg-red-600/5 group-hover:text-red-600 transition-all px-3 py-1.5 shadow-sm">
            <span className="text-[8px] font-black opacity-40">CMD</span> <span className="mt-[1px]">K</span>
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
          onClick={handleLogout} 
          className="elite-user-dropdown-trigger group"
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
    </header>
  );
}
