import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 selection:bg-red-600/10" style={{ '--sidebar-width': collapsed ? '80px' : '280px' }}>
      {/* Sidebar - Role-based navigation is handled inside Sidebar component */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div 
        className="flex-1 flex flex-col transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] pt-[80px]"
        style={{ paddingLeft: 'var(--sidebar-width)' }}
      >
        {/* Global Header Hub */}
        <Navbar />

        {/* Main Operational Surface */}
        <main className="flex-1 p-10 overflow-x-hidden panel-scrollbar relative">
          {/* Subtle background grid/glow */}
          <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-red-600/[0.02] blur-[100px] pointer-events-none" />
          
          <div className="relative z-10">
            <Outlet />
          </div>
        </main>

        {/* System Status Footer */}
        <footer className="p-6 border-t border-gray-100 bg-white text-center">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[1em] italic">
            InnovAIte Global HQ · Encryption Active · Sector Command
          </p>
        </footer>
      </div>
    </div>
  );
}
