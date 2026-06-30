import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Megaphone, 
  Settings as SettingsIcon, 
  ChevronLeft, 
  Menu,
  Building2,
  HelpCircle,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const menuItems = [
    { name: 'Clientes', path: '/', icon: Users },
    { name: 'Obras', path: '/obras', icon: Building2 },
  ];

  return (
    <>
      {/* Mobile drawer backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out lg:static lg:z-0
          ${isOpen ? 'w-64' : 'w-20 lg:w-20'} 
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <TrendingUp className="h-5 w-5" />
            </div>
            {isOpen && (
              <div className="flex flex-col">
                <span className="font-heading text-lg font-bold tracking-tight text-slate-900">
                  Verini<span className="text-indigo-600">CRM</span>
                </span>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-none">
                  SaaS Core
                </span>
              </div>
            )}
          </div>
          {/* Collapse Toggle for Desktop */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="hidden h-8 w-8 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-900 lg:flex"
            id="sidebar-toggle-btn"
          >
            <ChevronLeft className={`h-4 w-4 transition-transform duration-200 ${!isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Navigation Area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-7">
          {/* Main Menu */}
          <div>
            {isOpen && (
              <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Módulos Core
              </span>
            )}
            <ul className={`space-y-1 ${isOpen ? 'mt-2' : 'mt-4'}`}>
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => `
                        flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150
                        ${isActive 
                          ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                      `}
                      onClick={() => {
                        // Close sidebar drawer on mobile after clicking
                        if (window.innerWidth < 1024) {
                          setIsOpen(false);
                        }
                      }}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {isOpen && <span className="truncate">{item.name}</span>}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>

        </div>

        {/* Footer Area */}
        <div className="p-4 border-t border-slate-200">
          {isOpen ? (
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-700 truncate">Verini Global S.L.</span>
              </div>
              <p className="mt-1 text-[10px] text-slate-400">Plan Profesional Activo</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-400">
                <Building2 className="h-4 w-4" />
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
