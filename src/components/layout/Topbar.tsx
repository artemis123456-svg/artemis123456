import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  User, 
  LogOut, 
  Settings as SettingsIcon,
  Menu,
  Sparkles,
  Calendar,
  CheckCircle,
  TrendingUp,
  Sliders
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

interface TopbarProps {
  onMenuToggle: () => void;
}

export default function Topbar({ onMenuToggle }: TopbarProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  
  useEffect(() => {
    // Standard system time presentation for 2026-06-30
    const today = new Date("2026-06-30T11:12:22-07:00");
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    setCurrentTime(today.toLocaleDateString('es-ES', options));
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6 shadow-xs">
      
      {/* Mobile Toggle & Left Search Section */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="lg:hidden text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg"
          id="mobile-sidebar-toggle-btn"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Brand visual accent */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 select-none">
          <span className="h-2 w-2 rounded-full bg-indigo-500" />
          <span>Verini CRM Clientes</span>
        </div>
      </div>

      {/* Right Actions & Profile Area */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Live system date badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[11px] font-medium text-slate-500">
          <Calendar className="h-3.5 w-3.5 text-indigo-500" />
          <span>{currentTime || '30 de junio de 2026'}</span>
        </div>

        {/* Notifications Popover Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-white"></span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Notificaciones</span>
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-600">Nueva</span>
              </div>
            </div>
            <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
              <div className="flex gap-3 p-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-800">Verini CRM Activo 🚀</span>
                  <span className="text-[11px] text-slate-500 mt-0.5">Módulo Clientes listo para producción.</span>
                  <span className="text-[9px] text-slate-400 mt-1">Hace unos instantes</span>
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-5 w-[1px] bg-slate-200 hidden sm:block"></div>

        {/* User Account Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:opacity-90 outline-none">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-slate-600 font-semibold shadow-xs">
                U
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-800 leading-tight">Usuario Verini</span>
                <span className="text-[10px] text-slate-400 font-medium max-w-[120px] truncate">
                  artemis123456@gmail.com
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-heading">Mi Cuenta</DropdownMenuLabel>
            <div className="px-2 pb-2 pt-0.5">
              <p className="text-[11px] font-medium text-slate-400 truncate">artemis123456@gmail.com</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer gap-2 py-2">
              <Sliders className="h-4 w-4 text-slate-400" />
              <span>Mi Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer gap-2 py-2 text-rose-600 focus:text-rose-600 focus:bg-rose-50">
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  );
}
