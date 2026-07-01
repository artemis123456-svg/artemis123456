import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useClients } from '../hooks/useClients';
import { useObras } from '../hooks/useObras';
import { useFacturas, calculateFacturaTotals } from '../hooks/useFacturas';
import { useEventos } from '../hooks/useEventos';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Building2, 
  FileText, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  ArrowRight, 
  Activity,
  Briefcase,
  User as UserIcon,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { clients, loading: loadingClients, historial } = useClients();
  const { obras, loading: loadingObras } = useObras();
  const { facturas, loading: loadingFacturas } = useFacturas();
  const { eventos, getEventosAutomaticos, getEventosProximos, loading: loadingEventos } = useEventos();

  // Loading combined indicator
  const isLoading = loadingClients || loadingObras || loadingFacturas || loadingEventos;

  // 1. SALUDO PERSONALIZADO (cabecera)
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 13) {
      return 'Buenos días';
    } else if (hour >= 13 && hour < 21) {
      return 'Buenas tardes';
    } else {
      return 'Buenas noches';
    }
  }, []);

  const friendlyName = useMemo(() => {
    if (!user?.email) return 'Secretaria';
    const emailPrefix = user.email.split('@')[0];
    return emailPrefix
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, [user]);

  // Calculations for Today
  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const isToday = (dateStr: string) => {
    const d = new Date(dateStr);
    return !isNaN(d.getTime()) && isSameDay(d, new Date());
  };

  const allEvents = useMemo(() => {
    return [...eventos, ...getEventosAutomaticos()];
  }, [eventos, getEventosAutomaticos]);

  const eventsToday = useMemo(() => {
    return allEvents.filter(e => isToday(e.fechaInicio));
  }, [allEvents]);

  const activeObrasCount = useMemo(() => {
    return obras.filter(o => o.estado === 'En obra').length;
  }, [obras]);

  const activeClientsCount = useMemo(() => {
    return clients.filter(c => c.estado === 'Activo').length;
  }, [clients]);

  const pendingBudgetsCount = useMemo(() => {
    return obras.filter(o => o.estado === 'Presupuesto').length;
  }, [obras]);

  const unpaidInvoicesCount = useMemo(() => {
    return facturas.filter(f => f.estado !== 'Cobrada').length;
  }, [facturas]);

  const subtitleText = useMemo(() => {
    const citas = eventsToday.length;
    const obrasCount = activeObrasCount;
    return `Aquí tienes todo bajo control. Hoy tienes ${citas} ${citas === 1 ? 'cita' : 'citas'} y ${obrasCount} ${obrasCount === 1 ? 'obra' : 'obras'} en marcha.`;
  }, [eventsToday, activeObrasCount]);

  // Alertas "Hoy tienes"
  const facturasVencidas = useMemo(() => {
    return facturas.filter(f => f.estado === 'Vencida');
  }, [facturas]);

  const presupuestosSinRespuesta = useMemo(() => {
    return obras.filter(o => o.estado === 'Presupuesto');
  }, [obras]);

  // Cifras Clave
  const facturadoEsteMes = useMemo(() => {
    const now = new Date();
    return facturas
      .filter(f => {
        if (f.estado === 'Borrador') return false;
        const d = new Date(f.fechaEmision);
        return !isNaN(d.getTime()) && 
               d.getFullYear() === now.getFullYear() && 
               d.getMonth() === now.getMonth();
      })
      .reduce((sum, f) => {
        const totals = calculateFacturaTotals(f.lineas);
        return sum + totals.total;
      }, 0);
  }, [facturas]);

  const pendienteCobroTotal = useMemo(() => {
    return facturas
      .filter(f => f.estado === 'Emitida' || f.estado === 'Vencida')
      .reduce((sum, f) => {
        const totals = calculateFacturaTotals(f.lineas);
        return sum + totals.total;
      }, 0);
  }, [facturas]);

  // Próximos 5 eventos (getEventosProximos(7))
  const proximosCincoEventos = useMemo(() => {
    return getEventosProximos(7).slice(0, 5);
  }, [getEventosProximos]);

  // Actividad Reciente (últimos movimientos)
  const recentActivities = useMemo(() => {
    const list: { id: string; date: Date; type: string; title: string; desc: string; color: string }[] = [];

    // Clientes añadidos
    clients.forEach(c => {
      if (c.createdAt) {
        list.push({
          id: `cli-${c.id}`,
          date: new Date(c.createdAt),
          type: 'Cliente',
          title: 'Cliente registrado',
          desc: `${c.nombre} ${c.apellidos} ${c.empresa ? `(${c.empresa})` : ''}`,
          color: '#3B82C4' // Azul
        });
      }
    });

    // Facturas emitidas
    facturas.forEach(f => {
      if (f.fechaEmision) {
        list.push({
          id: `fac-${f.id}`,
          date: new Date(f.fechaEmision),
          type: 'Factura',
          title: `Factura creada ${f.numero}`,
          desc: `${f.titulo} — Estado: ${f.estado}`,
          color: '#F5B301' // Amarillo
        });
      }
    });

    // Obras creadas / modificadas
    obras.forEach((o, idx) => {
      const dateStr = o.fechaInicioReal || o.fechaInicioPrevista || new Date(2026, 5, 1).toISOString();
      const d = new Date(dateStr);
      // Offset slightly to represent separate order
      d.setTime(d.getTime() - idx * 60000);
      list.push({
        id: `obr-${o.id}`,
        date: d,
        type: 'Obra',
        title: `Obra registrada [${o.codigo}]`,
        desc: `${o.titulo} — Estado: ${o.estado}`,
        color: '#E84A8A' // Rosa
      });
    });

    // Historial real de Supabase
    historial.forEach(h => {
      let color = '#2FA69A'; // Verde
      if (h.accion.includes('Obra')) color = '#E84A8A'; // Rosa
      if (h.accion.includes('Factura')) color = '#F5B301'; // Amarillo
      if (h.accion.includes('Presupuesto')) color = '#8B4A9C'; // Morado
      if (h.accion.includes('Cliente')) color = '#3B82C4'; // Azul

      list.push({
        id: `hist-${h.id}`,
        date: new Date(h.fecha),
        type: h.accion,
        title: h.accion,
        desc: `${h.detalle} (por ${h.usuario})`,
        color
      });
    });

    // Deduplicate and Sort
    const seenKeys = new Set<string>();
    const uniqueList = [];
    const sorted = list.sort((a, b) => b.date.getTime() - a.date.getTime());

    for (const item of sorted) {
      const key = `${item.type}-${item.title}-${item.desc.split(' (por')[0]}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        uniqueList.push(item);
      }
    }

    return uniqueList.slice(0, 5);
  }, [clients, facturas, obras, historial]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-[#0E0E0F] text-white rounded-2xl border border-white/10">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#F5B301] border-t-transparent"></div>
          <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Cargando cuadro de mando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#0E0E0F] text-white p-6 lg:p-8 rounded-2xl border border-white/10 flex flex-col gap-8 shadow-2xl">
      
      {/* A) SALUDO PERSONALIZADO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
            {greeting}, <span className="text-[#F5B301]">{friendlyName}</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1.5 font-medium leading-relaxed max-w-2xl">
            {subtitleText}
          </p>
        </div>

        {/* 5 barritas visual signature */}
        <div className="flex gap-1.5 h-9 shrink-0 items-center">
          <div className="w-1.5 h-full bg-[#F5B301] rounded-full" title="Madera"></div>
          <div className="w-1.5 h-full bg-[#E84A8A] rounded-full" title="Textil"></div>
          <div className="w-1.5 h-full bg-[#3B82C4] rounded-full" title="Vidrio"></div>
          <div className="w-1.5 h-full bg-[#2FA69A] rounded-full" title="Metal"></div>
          <div className="w-1.5 h-full bg-[#8B4A9C] rounded-full" title="Piedra"></div>
        </div>
      </div>

      {/* B) TARJETAS RESUMEN (Fila de 4 tarjetas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Clientes Activos */}
        <div className="bg-[#1A1A1D] border border-white/5 rounded-2xl p-5 relative overflow-hidden flex flex-col gap-3 group hover:border-white/10 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Clientes Activos</span>
            <div className="p-2 bg-[#3B82C4]/10 rounded-xl text-[#3B82C4]">
              <Users className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-white font-mono">{activeClientsCount}</span>
            <span className="text-slate-500 text-xs">en el sistema</span>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-1 bg-[#3B82C4]"></div>
        </div>

        {/* Obras Activas */}
        <div className="bg-[#1A1A1D] border border-white/5 rounded-2xl p-5 relative overflow-hidden flex flex-col gap-3 group hover:border-white/10 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Obras en Marcha</span>
            <div className="p-2 bg-[#E84A8A]/10 rounded-xl text-[#E84A8A]">
              <Building2 className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-white font-mono">{activeObrasCount}</span>
            <span className="text-slate-500 text-xs">fase en obra</span>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-1 bg-[#E84A8A]"></div>
        </div>

        {/* Presupuestos Pendientes */}
        <div className="bg-[#1A1A1D] border border-white/5 rounded-2xl p-5 relative overflow-hidden flex flex-col gap-3 group hover:border-white/10 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Presupuestos Enviados</span>
            <div className="p-2 bg-[#8B4A9C]/10 rounded-xl text-[#8B4A9C]">
              <Clock className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-white font-mono">{pendingBudgetsCount}</span>
            <span className="text-slate-500 text-xs font-medium">esperando respuesta</span>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-1 bg-[#8B4A9C]"></div>
        </div>

        {/* Facturas pendientes */}
        <div className="bg-[#1A1A1D] border border-white/5 rounded-2xl p-5 relative overflow-hidden flex flex-col gap-3 group hover:border-white/10 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Facturas Pendientes</span>
            <div className="p-2 bg-[#F5B301]/10 rounded-xl text-[#F5B301]">
              <FileText className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-white font-mono">{unpaidInvoicesCount}</span>
            <span className="text-slate-500 text-xs font-medium">sin cobrar total</span>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-1 bg-[#F5B301]"></div>
        </div>

      </div>

      {/* C) SECCIÓN "HOY TIENES" (Alertas rápidas) & D) CIFRAS CLAVE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* HOY TIENES (8 cols) */}
        <div className="lg:col-span-7 bg-[#1A1A1D] border border-white/5 rounded-2xl p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#E84A8A] animate-pulse"></span>
              Alertas y Tareas Clave
            </h3>
            <span className="text-[10px] text-[#2FA69A] bg-[#2FA69A]/10 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Hoy</span>
          </div>

          <div className="space-y-4">
            
            {/* Alerta de Citas */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-[#0E0E0F] border border-white/5 hover:border-white/10 transition-colors">
              <div className="p-2.5 bg-[#3B82C4]/15 rounded-xl text-[#3B82C4] shrink-0">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white uppercase tracking-wide">Eventos y Visitas Programadas</h4>
                <p className="text-xs text-slate-400 leading-normal">
                  {eventsToday.length > 0 
                    ? `Tienes ${eventsToday.length} ${eventsToday.length === 1 ? 'evento programado' : 'eventos programados'} para el día de hoy.` 
                    : 'No tienes visitas ni reuniones agendadas para el día de hoy.'}
                </p>
                {eventsToday.length > 0 && (
                  <div className="flex flex-col gap-1.5 mt-2.5">
                    {eventsToday.slice(0, 3).map((ev) => (
                      <div key={ev.id} className="text-[11px] text-white flex items-center gap-2 bg-[#1A1A1D] px-2.5 py-1.5 rounded-lg border border-white/5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#3B82C4]"></span>
                        <span className="font-semibold text-slate-300">
                          {ev.todoElDia ? 'Todo el día' : new Date(ev.fechaInicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}:
                        </span>
                        <span className="truncate text-slate-100 font-medium">{ev.titulo}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Alerta de Facturas Vencidas */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-[#0E0E0F] border border-white/5 hover:border-white/10 transition-colors">
              <div className="p-2.5 bg-[#E84A8A]/15 rounded-xl text-[#E84A8A] shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white uppercase tracking-wide">Facturas Excedidas de Plazo</h4>
                <p className="text-xs text-slate-400 leading-normal">
                  {facturasVencidas.length > 0 
                    ? `Atención: Hay ${facturasVencidas.length} ${facturasVencidas.length === 1 ? 'factura que ha vencido' : 'facturas que han vencido'} y siguen sin recibir cobro.` 
                    : 'Excelente: No hay facturas pendientes fuera de fecha de vencimiento.'}
                </p>
                {facturasVencidas.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {facturasVencidas.map(f => (
                      <span key={f.id} className="text-[10px] font-mono font-bold bg-[#E84A8A]/10 text-[#E84A8A] border border-[#E84A8A]/25 px-2 py-1 rounded">
                        {f.numero} ({calculateFacturaTotals(f.lineas).total.toLocaleString('es-ES')} €)
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Alerta de Presupuestos sin respuesta */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-[#0E0E0F] border border-white/5 hover:border-white/10 transition-colors">
              <div className="p-2.5 bg-[#8B4A9C]/15 rounded-xl text-[#8B4A9C] shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white uppercase tracking-wide">Presupuestos por Confirmar</h4>
                <p className="text-xs text-slate-400 leading-normal">
                  {presupuestosSinRespuesta.length > 0 
                    ? `Hay ${presupuestosSinRespuesta.length} ${presupuestosSinRespuesta.length === 1 ? 'presupuesto en fase de estudio' : 'presupuestos en fase de estudio'} pendientes de respuesta del cliente.` 
                    : 'No hay presupuestos pendientes de respuesta en este momento.'}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* D) CIFRAS CLAVE (5 cols) */}
        <div className="lg:col-span-5 bg-[#1A1A1D] border border-white/5 rounded-2xl p-6 flex flex-col justify-between gap-6">
          <div className="border-b border-white/5 pb-3">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#2FA69A]" />
              Rendimiento Económico
            </h3>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-6">
            
            {/* Facturado este mes */}
            <div className="bg-[#0E0E0F] p-4 rounded-xl border border-white/5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Facturado este mes</span>
                <span className="text-2xl font-black text-[#2FA69A] font-mono">
                  {facturadoEsteMes.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </span>
                <span className="text-[10px] text-slate-500 block">Excluyendo presupuestos y borradores</span>
              </div>
              <div className="p-3 bg-[#2FA69A]/10 rounded-xl text-[#2FA69A]">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>

            {/* Pendiente de cobro total */}
            <div className="bg-[#0E0E0F] p-4 rounded-xl border border-white/5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Pendiente de cobro total</span>
                <span className="text-2xl font-black text-[#F5B301] font-mono">
                  {pendienteCobroTotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </span>
                <span className="text-[10px] text-slate-500 block">Facturas emitidas y vencidas activas</span>
              </div>
              <div className="p-3 bg-[#F5B301]/10 rounded-xl text-[#F5B301]">
                <Clock className="h-6 w-6" />
              </div>
            </div>

          </div>

          <div className="pt-2">
            <Link 
              to="/facturas" 
              className="text-xs font-bold text-[#3B82C4] hover:text-[#3B82C4]/80 flex items-center gap-1.5 self-start transition-colors uppercase tracking-wider"
            >
              <span>Gestionar facturación</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* E) PRÓXIMOS EVENTOS & F) ACTIVIDAD RECIENTE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PRÓXIMOS EVENTOS */}
        <div className="bg-[#1A1A1D] border border-white/5 rounded-2xl p-6 flex flex-col gap-4 justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#3B82C4]" />
                Eventos en la Agenda
              </h3>
              <span className="text-[9px] font-mono bg-white/5 text-slate-300 px-2 py-0.5 rounded font-bold">Próximos 7 días</span>
            </div>

            <div className="space-y-3">
              {proximosCincoEventos.length > 0 ? (
                proximosCincoEventos.map((ev) => {
                  const evDate = new Date(ev.fechaInicio);
                  
                  return (
                    <div 
                      key={ev.id}
                      className="p-3 rounded-xl bg-[#0E0E0F] border border-white/5 flex items-center justify-between gap-4 hover:border-white/10 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Dot indicator color-coded by event type */}
                        <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                          ev.tipo === 'Visita' ? 'bg-[#3B82C4]' :
                          ev.tipo === 'Reunión' ? 'bg-[#8B4A9C]' :
                          ev.tipo === 'Llamada' ? 'bg-[#2FA69A]' :
                          ev.tipo === 'Inicio obra' ? 'bg-[#E84A8A]' :
                          'bg-slate-400'
                        }`}></span>

                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{ev.titulo}</h4>
                          <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{ev.notas || 'Sin detalles adicionales'}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-mono text-slate-300 font-bold block">
                          {evDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </span>
                        <span className="text-[9px] text-slate-500 font-bold block mt-0.5">
                          {ev.todoElDia ? 'Todo el día' : evDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 bg-[#0E0E0F] rounded-xl border border-white/5 text-xs text-slate-500 font-medium space-y-1.5">
                  <CalendarDays className="h-6 w-6 text-slate-600 mx-auto" />
                  <p>No hay eventos agendados para la próxima semana.</p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-white/5 pt-4">
            <Link 
              to="/agenda" 
              className="text-xs font-bold text-[#3B82C4] hover:text-[#3B82C4]/80 flex items-center gap-1.5 transition-colors uppercase tracking-wider"
            >
              <span>Ver agenda completa</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* ACTIVIDAD RECIENTE */}
        <div className="bg-[#1A1A1D] border border-white/5 rounded-2xl p-6 flex flex-col gap-4 justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#E84A8A]" />
                Actividad Reciente
              </h3>
              <span className="text-[9px] font-mono bg-white/5 text-slate-300 px-2 py-0.5 rounded font-bold">Últimas acciones</span>
            </div>

            <div className="space-y-4.5 mt-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((act) => {
                  const date = new Date(act.date);
                  const formattedDate = isSameDay(date, new Date())
                    ? 'Hoy'
                    : date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

                  return (
                    <div key={act.id} className="flex gap-3 items-start group">
                      <div className="h-2 w-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: act.color }}></div>
                      
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-300 transition-colors">
                            {act.label}
                          </span>
                          <span className="text-[9px] font-mono font-bold text-slate-500 whitespace-nowrap">
                            {formattedDate}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white truncate leading-snug">{act.title}</h4>
                        <p className="text-[10px] text-slate-500 truncate">{act.desc}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 bg-[#0E0E0F] rounded-xl border border-white/5 text-xs text-slate-500 font-medium space-y-1.5">
                  <Activity className="h-6 w-6 text-slate-600 mx-auto" />
                  <p>No se registran actividades recientes en el CRM.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
