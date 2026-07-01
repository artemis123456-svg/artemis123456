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
import { Button } from '@/src/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/src/components/ui/dropdown-menu';
import { Input } from '@/src/components/ui/input';
import { useAuth } from '../../context/AuthContext';
import { useEventos } from '../../hooks/useEventos';

interface TopbarProps {
  onMenuToggle: () => void;
}

export default function Topbar({ onMenuToggle }: TopbarProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const { user, signOut } = useAuth();
  const { getEventosProximos } = useEventos();
  
  const proximos = getEventosProximos(7); // today + next 7 days
  
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
          <span className="h-2 w-2 rounded-full bg-verini-yellow" />
          <span>Verini CRM Clientes</span>
        </div>
      </div>

      {/* Right Actions & Profile Area */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Live system date badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[11px] font-medium text-slate-500">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>{currentTime || '30 de junio de 2026'}</span>
        </div>

        {/* Notifications Popover Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger>
              <Button variant="ghost" size="icon" className="relative h-9 w-9 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg">
                <Bell className="h-5 w-5" />
                {proximos.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-verini-black ring-2 ring-white text-[8px] font-black text-white">
                    {proximos.length}
                  </span>
                )}
              </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Próximos Eventos</span>
                {proximos.length > 0 && (
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                    {proximos.length} activos
                  </span>
                )}
              </div>
            </div>
            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {proximos.length > 0 ? (
                proximos.map(ev => {
                  const evDate = new Date(ev.fechaInicio);
                  const isToday = evDate.getFullYear() === new Date().getFullYear() &&
                                  evDate.getMonth() === new Date().getMonth() &&
                                  evDate.getDate() === new Date().getDate();

                  return (
                    <div 
                      key={ev.id} 
                      className={`flex gap-3 p-3.5 hover:bg-slate-50/50 transition-colors ${
                        isToday ? 'bg-amber-50/30 border-l-4 border-amber-400' : ''
                      }`}
                    >
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                            ev.tipo === 'Visita' ? 'bg-blue-50 text-blue-700' :
                            ev.tipo === 'Reunión' ? 'bg-purple-50 text-purple-700' :
                            ev.tipo === 'Llamada' ? 'bg-teal-50 text-teal-700' :
                            ev.tipo === 'Inicio obra' ? 'bg-amber-50 text-amber-700' :
                            'bg-slate-50 text-slate-600'
                          }`}>
                            {ev.tipo}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400 font-bold">
                            {evDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <span className={`text-xs font-bold text-slate-800 mt-1.5 truncate ${ev.completado ? 'line-through opacity-50' : ''}`}>
                          {ev.titulo}
                        </span>
                        {isToday && (
                          <span className="text-[9px] font-black text-amber-700 uppercase mt-0.5 flex items-center gap-0.5">
                            ★ ¡Hoy!
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 italic">
                  No hay eventos próximos en tu agenda.
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-5 w-[1px] bg-slate-200 hidden sm:block"></div>

        {/* User Account Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger>
              <button className="flex items-center gap-2 hover:opacity-90 outline-none">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-slate-600 font-semibold shadow-xs uppercase">
                  {user?.email?.[0] || 'U'}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 leading-tight">Usuario Verini</span>
                  <span className="text-[10px] text-slate-400 font-medium max-w-[120px] truncate">
                    {user?.email || 'email@ejemplo.com'}
                  </span>
                </div>
              </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-heading">Mi Cuenta</DropdownMenuLabel>
            <div className="px-2 pb-2 pt-0.5">
              <p className="text-[11px] font-medium text-slate-400 truncate">{user?.email || 'email@ejemplo.com'}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => signOut()}
              className="cursor-pointer gap-2 py-2 text-rose-600 focus:text-rose-600 focus:bg-rose-50"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  );
}
