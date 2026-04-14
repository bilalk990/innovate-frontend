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
  const [searchFocused, setSearchFocused] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="elite-topbar">
      {/* Search Hub */}
      <div className={`elite-search-container ${searchFocused ? 'active' : ''}`}>
        <Search size={16} className={searchFocused ? 'text-red-500' : 'text-gray-500'} />
        <input
          type="text"
          placeholder="Search jobs and activity..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="elite-search-input"
        />
        <div className="elite-kbd">⌘K</div>
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
