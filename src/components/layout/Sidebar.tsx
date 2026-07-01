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
  TrendingUp,
  Truck,
  Package,
  FileText,
  ReceiptText
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
    { name: 'Proveedores', path: '/proveedores', icon: Truck },
    { name: 'Productos', path: '/productos', icon: Package },
    { name: 'Facturas', path: '/facturas', icon: FileText },
    { name: 'Facturas Proveedor', path: '/facturas-proveedor', icon: ReceiptText },
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
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/10 bg-verini-black text-white transition-all duration-300 ease-in-out lg:static lg:z-0
          ${isOpen ? 'w-64' : 'w-20 lg:w-20'} 
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-white/10">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Elegant vertical color bars as material swatches (firma visual) */}
            <div className="flex gap-1 h-7 shrink-0 pr-1.5">
              <div className="w-1 h-full bg-[#F5B301] rounded-xs" title="Muestra Madera"></div>
              <div className="w-1 h-full bg-[#E84A8A] rounded-xs" title="Muestra Textil"></div>
              <div className="w-1 h-full bg-[#3B82C4] rounded-xs" title="Muestra Vidrio"></div>
              <div className="w-1 h-full bg-[#2FA69A] rounded-xs" title="Muestra Metal"></div>
              <div className="w-1 h-full bg-[#8B4A9C] rounded-xs" title="Muestra Piedra"></div>
            </div>
            <div className="flex flex-col shrink-0">
              <span className="font-sans font-black tracking-[0.2em] text-white text-lg leading-none">
                VERINI
              </span>
              {isOpen && (
                <span className="text-[8px] font-bold text-verini-grey uppercase tracking-widest leading-none mt-1">
                  ESPAI CREATIU
                </span>
              )}
            </div>
          </div>
          {/* Collapse Toggle for Desktop */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="hidden h-8 w-8 rounded-lg border border-white/10 bg-verini-charcoal text-slate-400 hover:text-white hover:bg-white/10 lg:flex"
            id="sidebar-toggle-btn"
          >
            <ChevronLeft className={`h-4 w-4 transition-transform duration-200 ${!isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Navigation Area */}
        <div className="flex-1 overflow-y-auto px-3 py-6 space-y-7">
          {/* Main Menu */}
          <div>
            {isOpen && (
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-verini-grey">
                MÓDULOS CRM
              </span>
            )}
            <ul className={`space-y-1 ${isOpen ? 'mt-3' : 'mt-5'}`}>
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                // Assign a subtle color bar to each item on active
                const activeColors = ['border-[#F5B301]', 'border-[#E84A8A]', 'border-[#3B82C4]', 'border-[#2FA69A]', 'border-[#8B4A9C]'];
                const accentBorder = activeColors[index % activeColors.length];
                
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => `
                        flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 relative overflow-hidden
                        ${isActive 
                          ? `bg-verini-charcoal text-white font-semibold border-l-4 ${accentBorder}` 
                          : 'text-slate-400 hover:bg-white/5 hover:text-white'}
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
        <div className="p-4 border-t border-white/10">
          {isOpen ? (
            <div className="rounded-xl bg-verini-charcoal p-3 border border-white/5">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-verini-grey shrink-0" />
                <span className="text-xs font-semibold text-white truncate">Verini Global S.L.</span>
              </div>
              <p className="mt-1 text-[9px] text-verini-grey tracking-wider uppercase">CRM PREMIUM</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-verini-charcoal border border-white/10 text-slate-400">
                <Building2 className="h-4 w-4" />
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
