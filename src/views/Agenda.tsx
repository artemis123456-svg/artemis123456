import React, { useState, useMemo } from 'react';
import { useEventos } from '../hooks/useEventos';
import { useClients } from '../hooks/useClients';
import { useObras } from '../hooks/useObras';
import { Evento, EventoVirtual } from '../types/evento';
import EventoForm from '../components/agenda/EventoForm';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  User, 
  Briefcase, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Lock, 
  Eye, 
  MapPin, 
  X,
  Phone,
  Mail,
  CalendarDays
} from 'lucide-react';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  dayNum: number;
}

export default function Agenda() {
  const { 
    eventos, 
    loading: loadingEventos, 
    addEvento, 
    updateEvento, 
    deleteEvento, 
    getEventosAutomaticos, 
    getEventosProximos 
  } = useEventos();

  const { clients } = useClients();
  const { obras } = useObras();

  // State
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  
  // Modals / Overlays
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);
  const [selectedVirtualEvento, setSelectedVirtualEvento] = useState<EventoVirtual | null>(null);

  // Helper arrays for calendar rendering
  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  // Month-grid computation
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDayPrevMonth = new Date(year, month, 0).getDate();
    const totalDays = new Date(year, month + 1, 0).getDate();

    // adjust index to start on Monday (0=Mon, ..., 6=Sun)
    let startDayIdx = firstDay.getDay();
    startDayIdx = startDayIdx === 0 ? 6 : startDayIdx - 1;

    const days: CalendarDay[] = [];
    const today = new Date();

    // 1. Previous month padded days
    for (let i = startDayIdx - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, lastDayPrevMonth - i);
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: isSameDay(d, today),
        dayNum: d.getDate()
      });
    }

    // 2. Active month days
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      days.push({
        date: d,
        isCurrentMonth: true,
        isToday: isSameDay(d, today),
        dayNum: i
      });
    }

    // 3. Next month padded days (filling the rest of the 42 days grid)
    const totalSlots = 42;
    const paddingNext = totalSlots - days.length;
    for (let i = 1; i <= paddingNext; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: isSameDay(d, today),
        dayNum: i
      });
    }

    return days;
  }, [currentDate]);

  // Combined manual and automatic events for the active grid
  const allEventsCombined = useMemo(() => {
    const manuales = eventos;
    const automaticos = getEventosAutomaticos();
    return [...manuales, ...automaticos];
  }, [eventos, getEventosAutomaticos]);

  // Quick lookup dictionary for faster grid matching
  const getEventsForDay = (dayDate: Date) => {
    return allEventsCombined.filter(e => isSameDay(new Date(e.fechaInicio), dayDate));
  };

  // Navigation handlers
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  // Form saving pipeline
  const handleSaveEvento = async (data: Omit<Evento, 'id'> & { id?: string }) => {
    if (data.id) {
      await updateEvento(data.id, data);
    } else {
      await addEvento(data);
    }
    setIsFormOpen(false);
    setEditingEvento(null);
  };

  // Badge visual design helper
  const getBadgeStyles = (tipo: Evento['tipo'], esAutomatico?: boolean, completado?: boolean) => {
    let base = "w-full text-left truncate text-[10px] px-1.5 py-0.5 rounded-md font-bold border transition-all flex items-center justify-between ";
    if (esAutomatico) {
      base += "border-dashed opacity-80 ";
    } else {
      base += "border-solid shadow-sm ";
    }

    if (completado) {
      base += "line-through opacity-50 ";
    }

    switch (tipo) {
      case 'Visita':
        return base + "bg-blue-50 text-blue-700 border-blue-200/60 hover:bg-blue-100";
      case 'Reunión':
        return base + "bg-purple-50 text-purple-700 border-purple-200/60 hover:bg-purple-100";
      case 'Llamada':
        return base + "bg-teal-50 text-teal-700 border-teal-200/60 hover:bg-teal-100";
      case 'Inicio obra':
        return base + "bg-amber-50 text-amber-700 border-amber-200/60 hover:bg-amber-100";
      default:
        return base + "bg-slate-50 text-slate-700 border-slate-200/60 hover:bg-slate-100";
    }
  };

  const handleEventoClick = (ev: EventoVirtual, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent triggering the "New Event" grid-cell day click
    if (ev.esAutomatico) {
      setSelectedVirtualEvento(ev);
    } else {
      setEditingEvento(ev as Evento);
      setIsFormOpen(true);
    }
  };

  const next7DaysEvents = useMemo(() => {
    return getEventosProximos(7);
  }, [getEventosProximos]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-1 sm:p-2">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-verini-black flex items-center justify-center text-white">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                Agenda de Eventos
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full uppercase">CRM Interno</span>
              </h1>
              <p className="text-xs text-slate-500">Organiza tus visitas, reuniones, llamadas y mantén un seguimiento automático de obras y cobros.</p>
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setEditingEvento(null);
              setSelectedDay(null);
              setIsFormOpen(true);
            }}
            className="bg-verini-black hover:bg-black/95 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Evento</span>
          </Button>
        </div>
      </div>

      {/* DISCLOSURE */}
      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-3">
        <Info className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 leading-normal space-y-1">
          <span className="font-extrabold text-slate-800 block uppercase tracking-wide text-[10px]">Eventos de Agenda y Automatizaciones</span>
          <p>
            Los eventos manuales se gestionan de forma nativa en este módulo. Las fechas clave como el <span className="font-semibold text-slate-800">Inicio planificado de Obras</span> o el <span className="font-semibold text-slate-800">Vencimiento de Facturas</span> impagadas aparecen automáticamente representadas con un formato discontinuo y estilo tenue.
          </p>
        </div>
      </div>

      {/* MAIN TWO COLUMN VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT PANEL: MONTH GRID */}
        <div className="lg:col-span-9 space-y-4">
          <Card className="border-slate-150 shadow-sm bg-white overflow-hidden">
            
            {/* MONTH SWITCHER BAR */}
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-sm font-black text-slate-800 uppercase tracking-wider">
                  {monthNames[currentDate.getMonth()]}
                </span>
                <span className="text-sm font-mono font-bold text-slate-400 pl-1.5">
                  {currentDate.getFullYear()}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={prevMonth}
                  className="h-8 w-8 rounded-lg cursor-pointer text-slate-600 hover:text-slate-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={goToday}
                  className="text-[10px] font-black uppercase h-8 px-3 rounded-lg cursor-pointer text-slate-600 hover:text-slate-800"
                >
                  Hoy
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={nextMonth}
                  className="h-8 w-8 rounded-lg cursor-pointer text-slate-600 hover:text-slate-800"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <CardContent className="p-4">
              
              {/* DAYS OF THE WEEK HEADERS */}
              <div className="grid grid-cols-7 text-center pb-2 border-b border-slate-100">
                {weekDays.map(day => (
                  <div key={day} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* GRID */}
              <div className="grid grid-cols-7 grid-rows-6 border-l border-t border-slate-100 mt-1">
                {calendarDays.map((cell, idx) => {
                  const dayEvents = getEventsForDay(cell.date);
                  
                  return (
                    <div 
                      key={idx} 
                      onClick={() => {
                        setSelectedDay(cell.date);
                        setEditingEvento(null);
                        setIsFormOpen(true);
                      }}
                      className={`min-h-[105px] border-r border-b border-slate-100 p-2 flex flex-col justify-between transition-all select-none cursor-pointer hover:bg-slate-50/60 ${
                        cell.isCurrentMonth ? 'bg-white' : 'bg-slate-50/40 text-slate-400'
                      }`}
                    >
                      {/* Day number with highlights */}
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-mono font-extrabold h-6 w-6 rounded-full flex items-center justify-center ${
                          cell.isToday 
                            ? 'bg-verini-black text-white' 
                            : cell.isCurrentMonth 
                              ? 'text-slate-700' 
                              : 'text-slate-350'
                        }`}>
                          {cell.dayNum}
                        </span>
                        
                        {dayEvents.length > 0 && (
                          <span className="text-[9px] font-mono font-bold text-slate-400">
                            {dayEvents.length} {dayEvents.length === 1 ? 'act' : 'acts'}
                          </span>
                        )}
                      </div>

                      {/* Day Event List Stack */}
                      <div className="space-y-1 mt-2 flex-1 overflow-y-auto max-h-[75px] scrollbar-none">
                        {dayEvents.slice(0, 3).map(ev => (
                          <button
                            key={ev.id}
                            type="button"
                            onClick={(e) => handleEventoClick(ev, e)}
                            className={getBadgeStyles(ev.tipo, ev.esAutomatico, ev.completado)}
                          >
                            <span className="truncate pr-1">{ev.titulo}</span>
                            {ev.esAutomatico && <Lock className="h-2.5 w-2.5 shrink-0 opacity-40 ml-0.5" />}
                          </button>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-[9px] font-bold text-slate-400 pl-1.5 italic">
                            + {dayEvents.length - 3} más
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

            </CardContent>
          </Card>
        </div>

        {/* RIGHT PANEL: UPCOMING SIDEBAR */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="border-slate-150 shadow-sm bg-white overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-500" />
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Próximos 7 Días</h3>
              </div>
              <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase">
                {next7DaysEvents.length} listados
              </span>
            </div>

            <CardContent className="p-4 space-y-3 divide-y divide-slate-100 max-h-[660px] overflow-y-auto">
              {next7DaysEvents.length > 0 ? (
                next7DaysEvents.map((ev, i) => {
                  const evDate = new Date(ev.fechaInicio);
                  const clientName = ev.clienteId ? clients.find(c => c.id === ev.clienteId)?.nombre : null;
                  const projectTitle = ev.obraId ? obras.find(o => o.id === ev.obraId)?.titulo : null;
                  const isToday = isSameDay(evDate, new Date());

                  return (
                    <div 
                      key={ev.id} 
                      onClick={(e) => handleEventoClick(ev, e)}
                      className={`pt-3 first:pt-0 pb-1 text-xs cursor-pointer group ${
                        isToday ? 'bg-amber-50/30 -mx-4 px-4 border-l-4 border-amber-400 transition-all' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          ev.tipo === 'Visita' ? 'bg-blue-50 text-blue-700' :
                          ev.tipo === 'Reunión' ? 'bg-purple-50 text-purple-700' :
                          ev.tipo === 'Llamada' ? 'bg-teal-50 text-teal-700' :
                          ev.tipo === 'Inicio obra' ? 'bg-amber-50 text-amber-700' :
                          'bg-slate-50 text-slate-600'
                        }`}>
                          {ev.tipo}
                        </span>

                        <span className="text-[10px] font-mono text-slate-400 font-bold">
                          {evDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                          {!ev.todoElDia && ` • ${evDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`}
                        </span>
                      </div>

                      <h4 className={`font-bold text-slate-800 group-hover:text-black transition-colors ${
                        ev.completado ? 'line-through opacity-55' : ''
                      }`}>
                        {ev.titulo}
                      </h4>

                      {/* Associated resources indicator */}
                      {(clientName || projectTitle) && (
                        <div className="mt-1.5 space-y-0.5 text-[10px] text-slate-400">
                          {clientName && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span className="truncate">{clientName}</span>
                            </div>
                          )}
                          {projectTitle && (
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              <span className="truncate">{projectTitle}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {isToday && (
                        <div className="mt-1.5 text-[9px] font-extrabold text-amber-700 flex items-center gap-1 uppercase tracking-wider">
                          <AlertTriangle className="h-3 w-3" />
                          ¡Es Hoy!
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-xs text-slate-400 italic space-y-1">
                  <CalendarDays className="h-7 w-7 text-slate-300 mx-auto" />
                  <p>Sin eventos programados para la próxima semana.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>

      {/* RENDER EVENT CREATION / EDITING DIALOG (MANUAL ONLY) */}
      {isFormOpen && (
        <EventoForm
          evento={editingEvento}
          initialDate={selectedDay}
          onClose={() => {
            setIsFormOpen(false);
            setEditingEvento(null);
          }}
          onSave={handleSaveEvento}
          onDelete={deleteEvento}
        />
      )}

      {/* RENDER READ-ONLY VIRTUAL EVENT OVERLAY */}
      {selectedVirtualEvento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-slate-400" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aviso Automático (Lectura)</span>
              </div>
              <button 
                onClick={() => setSelectedVirtualEvento(null)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                  selectedVirtualEvento.tipo === 'Inicio obra' ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-600'
                }`}>
                  {selectedVirtualEvento.tipo}
                </span>

                <h3 className="text-base font-extrabold text-slate-900 mt-2">
                  {selectedVirtualEvento.titulo}
                </h3>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-800">
                    {new Date(selectedVirtualEvento.fechaInicio).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>

                <p className="whitespace-pre-wrap bg-slate-50 p-3 rounded-lg border border-slate-100 text-slate-600">
                  {selectedVirtualEvento.notas}
                </p>
              </div>

              {/* Connected details */}
              <div className="border-t border-slate-100 pt-3 space-y-1 text-xs">
                {selectedVirtualEvento.clienteId && (
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <User className="h-4 w-4 text-slate-400" />
                    <span>Cliente: <strong className="text-slate-700">{clients.find(c => c.id === selectedVirtualEvento.clienteId)?.nombre}</strong></span>
                  </div>
                )}
                {selectedVirtualEvento.obraId && (
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Briefcase className="h-4 w-4 text-slate-400" />
                    <span>Proyecto: <strong className="text-slate-700">{obras.find(o => o.id === selectedVirtualEvento.obraId)?.titulo}</strong></span>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
              <Button
                onClick={() => setSelectedVirtualEvento(null)}
                className="bg-verini-black hover:bg-black/95 text-white font-bold text-xs h-9 px-4 rounded-lg cursor-pointer"
              >
                Cerrar
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
