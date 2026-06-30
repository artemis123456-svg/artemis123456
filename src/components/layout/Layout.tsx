import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800 font-sans">
      
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* Topbar navigation */}
        <Topbar 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
        />

        {/* Content Outlet scrollable panel */}
        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8 bg-[#fafbfc]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
