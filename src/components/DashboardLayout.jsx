import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import useAuth from '../hooks/useAuth';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const userType = user?.role || 'candidate';

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      background: 'var(--panel-bg)',
      color: 'var(--panel-text-primary)',
      fontFamily: 'var(--font-body)'
    }}>
      {/* Universal Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        marginLeft: collapsed ? '80px' : '280px',
        transition: 'margin-left 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        minWidth: 0
      }}>
        {/* Universal TopBar */}
        <TopBar collapsed={collapsed} userType={userType} />

        {/* Scrollable Content grid */}
        <main className="panel-scrollbar" style={{
          flex: 1,
          padding: '104px 32px 32px', // 72px TopBar + 32px padding
          overflowY: 'auto',
          background: 'transparent'
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
