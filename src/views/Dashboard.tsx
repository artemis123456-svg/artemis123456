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
  CalendarDays, 
  TrendingUp, 
  ArrowRight,
  Calendar
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

// Custom Tooltip for Recharts that matches Verini theme
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0E0E0F] border border-white/10 p-2.5 rounded-xl shadow-2xl font-mono text-[11px] text-white">
        <p className="font-bold text-slate-400">{payload[0].payload.name} {payload[0].payload.year}</p>
        <p className="text-[#2FA69A] font-extrabold mt-0.5">{payload[0].value.toLocaleString('es-ES')} €</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { user } = useAuth();
  const { clients, loading: loadingClients } = useClients();
  const { obras, loading: loadingObras } = useObras();
  const { facturas, loading: loadingFacturas } = useFacturas();
  const { eventos, getEventosAutomaticos, loading: loadingEventos } = useEventos();

  // Loading combined indicator
  const isLoading = loadingClients || loadingObras || loadingFacturas || loadingEventos;

  // Friendly name from user email
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
    try {
      const auto = getEventosAutomaticos ? getEventosAutomaticos() : [];
      return [...(eventos || []), ...(auto || [])];
    } catch { return eventos || []; }
  }, [eventos, getEventosAutomaticos]);

  const eventsTodayCount = useMemo(() => {
    return (allEvents || []).filter(e => isToday(e.fechaInicio)).length;
  }, [allEvents]);

  // Counts for cards
  const activeClientsCount = useMemo(() => {
    return (clients || []).filter(c => c.estado === 'Activo').length;
  }, [clients]);

  const activeObrasCount = useMemo(() => {
    return (obras || []).filter(o => o.estado === 'En obra').length;
  }, [obras]);

  const pendingBudgetsCount = useMemo(() => {
    return (obras || []).filter(o => o.estado === 'Presupuesto').length;
  }, [obras]);

  const unpaidInvoicesCount = useMemo(() => {
    return (facturas || []).filter(f => f.estado !== 'Cobrada').length;
  }, [facturas]);

  const borradorFacturasCount = useMemo(() => {
    return (facturas || []).filter(f => f.estado === 'Borrador').length;
  }, [facturas]);

  // Billing calculation for current month (excluding Borrador)
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

  // Comparison vs last month (excluding Borrador)
  const percentageComparison = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const prevYear = prevMonthDate.getFullYear();
    const prevMonth = prevMonthDate.getMonth();

    const currentMonthTotal = facturas
      .filter(f => {
        if (f.estado === 'Borrador') return false;
        const fDate = new Date(f.fechaEmision);
        return !isNaN(fDate.getTime()) &&
               fDate.getFullYear() === currentYear &&
               fDate.getMonth() === currentMonth;
      })
      .reduce((sum, f) => {
        const totals = calculateFacturaTotals(f.lineas);
        return sum + totals.total;
      }, 0);

    const prevMonthTotal = facturas
      .filter(f => {
        if (f.estado === 'Borrador') return false;
        const fDate = new Date(f.fechaEmision);
        return !isNaN(fDate.getTime()) &&
               fDate.getFullYear() === prevYear &&
               fDate.getMonth() === prevMonth;
      })
      .reduce((sum, f) => {
        const totals = calculateFacturaTotals(f.lineas);
        return sum + totals.total;
      }, 0);

    if (prevMonthTotal <= 0) return null;
    const change = ((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100;
    return {
      value: change.toFixed(1),
      isPositive: change >= 0
    };
  }, [facturas]);

  // Dynamic last 6 months billing data
  const last6MonthsData = useMemo(() => {
    const data = [];
    const now = new Date();
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const targetYear = d.getFullYear();
      const targetMonth = d.getMonth();

      const monthFacturas = (facturas || []).filter(f => {
        if (f.estado === 'Borrador') return false;
        const fDate = new Date(f.fechaEmision);
        return !isNaN(fDate.getTime()) &&
               fDate.getFullYear() === targetYear &&
               fDate.getMonth() === targetMonth;
      });

      const total = monthFacturas.reduce((sum, f) => {
        const totals = calculateFacturaTotals(f.lineas);
        return sum + totals.total;
      }, 0);

      data.push({
        name: monthNames[targetMonth],
        total: Math.round(total),
        year: targetYear
      });
    }
    return data;
  }, [facturas]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-[#0E0E0F] text-white rounded-[16px] border border-white/10">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#F5B301] border-t-transparent"></div>
          <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Cargando panel de control...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#0E0E0F] text-white p-4 md:p-6 lg:p-8 rounded-[16px] border border-white/10 flex flex-col gap-6 md:gap-8 shadow-2xl">
      
      {/* 1. CABECERA CON IMAGEN HERO */}
      <div className="relative w-full h-[160px] md:h-[220px] rounded-[16px] overflow-hidden flex flex-col justify-end p-6 md:p-8 shadow-lg">
        {/* Unsplash image background */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200')` }}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent" />
        
        {/* Content */}
        <div className="relative z-10 space-y-1.5 md:space-y-2">
          <h1 className="text-xl md:text-3xl font-black text-white tracking-tight">
            ¡Hola, {friendlyName}! Aquí tienes todo bajo control.
          </h1>
          <p className="text-slate-300 text-[10px] md:text-xs font-medium tracking-wider uppercase">
            Verini Espai Creatiu · Gestión de reformas e interiorismo
          </p>
        </div>
      </div>

      {/* 2. TARJETAS DE RESUMEN (fila de 4) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        
        {/* Clientes */}
        <div className="bg-[#1A1A1D] rounded-[16px] p-4 md:p-5 relative overflow-hidden flex flex-col justify-between border-l-4 border-[#2FA69A] hover:border-white/10 transition-all duration-300">
          <div>
            <span className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest block mb-1">Clientes</span>
            <span className="text-2xl md:text-4xl font-black text-white font-mono block mt-1">{activeClientsCount}</span>
          </div>
          <span className="text-[9px] md:text-[10px] text-[#2FA69A] font-semibold mt-2.5 block">Activos en el sistema</span>
        </div>

        {/* Obras Activas */}
        <div className="bg-[#1A1A1D] rounded-[16px] p-4 md:p-5 relative overflow-hidden flex flex-col justify-between border-l-4 border-[#3B82C4] hover:border-white/10 transition-all duration-300">
          <div>
            <span className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest block mb-1">Obras Activas</span>
            <span className="text-2xl md:text-4xl font-black text-white font-mono block mt-1">{activeObrasCount}</span>
          </div>
          <span className="text-[9px] md:text-[10px] text-[#3B82C4] font-semibold mt-2.5 block">En ejecución</span>
        </div>

        {/* Presupuestos */}
        <div className="bg-[#1A1A1D] rounded-[16px] p-4 md:p-5 relative overflow-hidden flex flex-col justify-between border-l-4 border-[#F5B301] hover:border-white/10 transition-all duration-300">
          <div>
            <span className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest block mb-1">Presupuestos</span>
            <span className="text-2xl md:text-4xl font-black text-white font-mono block mt-1">{pendingBudgetsCount}</span>
          </div>
          <span className="text-[9px] md:text-[10px] text-[#F5B301] font-semibold mt-2.5 block">Pendientes de respuesta</span>
        </div>

        {/* Facturas Pendientes */}
        <div className="bg-[#1A1A1D] rounded-[16px] p-4 md:p-5 relative overflow-hidden flex flex-col justify-between border-l-4 border-[#E84A8A] hover:border-white/10 transition-all duration-300">
          <div>
            <span className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest block mb-1">Facturas Pendientes</span>
            <span className="text-2xl md:text-4xl font-black text-white font-mono block mt-1">{unpaidInvoicesCount}</span>
          </div>
          <span className="text-[9px] md:text-[10px] text-[#E84A8A] font-semibold mt-2.5 block">Sin registrar cobro</span>
        </div>

      </div>

      {/* 3. FILA INFERIOR: dos bloques lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* BLOQUE IZQUIERDO — "Hoy tienes" */}
        <div className="bg-[#1A1A1D] rounded-[16px] p-5 md:p-6 flex flex-col justify-between gap-6">
          <div className="space-y-5">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <CalendarDays className="h-5 w-5 text-[#2FA69A]" />
              <h3 className="text-xs md:text-sm font-bold text-white uppercase tracking-wider">Hoy tienes</h3>
            </div>

            <div className="space-y-3 md:space-y-4">
              
              {/* Presupuestos por revisar */}
              <div className="flex items-center gap-3.5 p-3.5 bg-[#0E0E0F] rounded-[12px] border border-white/5">
                <div className="h-8 w-8 rounded-lg bg-[#F5B301]/10 flex items-center justify-center text-[#F5B301] shrink-0">
                  <Clock className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-white font-mono font-bold text-sm md:text-base mr-1.5">{pendingBudgetsCount}</span>
                  <span className="text-xs text-slate-400 font-medium">presupuestos por revisar</span>
                </div>
                <span className="h-2 w-2 rounded-full bg-[#F5B301] shrink-0"></span>
              </div>

              {/* Facturas por registrar */}
              <div className="flex items-center gap-3.5 p-3.5 bg-[#0E0E0F] rounded-[12px] border border-white/5">
                <div className="h-8 w-8 rounded-lg bg-[#E84A8A]/10 flex items-center justify-center text-[#E84A8A] shrink-0">
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-white font-mono font-bold text-sm md:text-base mr-1.5">{borradorFacturasCount}</span>
                  <span className="text-xs text-slate-400 font-medium">facturas por registrar</span>
                </div>
                <span className="h-2 w-2 rounded-full bg-[#E84A8A] shrink-0"></span>
              </div>

              {/* Visitas programadas */}
              <div className="flex items-center gap-3.5 p-3.5 bg-[#0E0E0F] rounded-[12px] border border-white/5">
                <div className="h-8 w-8 rounded-lg bg-[#3B82C4]/10 flex items-center justify-center text-[#3B82C4] shrink-0">
                  <Calendar className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-white font-mono font-bold text-sm md:text-base mr-1.5">{eventsTodayCount}</span>
                  <span className="text-xs text-slate-400 font-medium">visitas programadas</span>
                </div>
                <span className="h-2 w-2 rounded-full bg-[#3B82C4] shrink-0"></span>
              </div>

            </div>
          </div>

          <div className="pt-2 border-t border-white/5">
            <Link 
              to="/agenda" 
              className="text-xs font-bold text-[#3B82C4] hover:text-[#3B82C4]/80 flex items-center gap-1.5 transition-colors uppercase tracking-wider"
            >
              <span>Ver agenda</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* BLOQUE DERECHO — "Beneficio estimado" / cifras clave */}
        <div className="bg-[#1A1A1D] rounded-[16px] p-5 md:p-6 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <TrendingUp className="h-5 w-5 text-[#3B82C4]" />
              <h3 className="text-xs md:text-sm font-bold text-white uppercase tracking-wider">Beneficio estimado</h3>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Facturado este mes</span>
              <div className="flex items-baseline flex-wrap gap-2 md:gap-3">
                <span className="text-2xl md:text-3xl font-black text-[#2FA69A] font-mono leading-none">
                  {facturadoEsteMes.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </span>
                {percentageComparison && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                    percentageComparison.isPositive 
                      ? 'bg-[#2FA69A]/15 text-[#2FA69A]' 
                      : 'bg-[#E84A8A]/15 text-[#E84A8A]'
                  }`}>
                    {percentageComparison.isPositive ? '+' : ''}{percentageComparison.value}% vs mes anterior
                  </span>
                )}
              </div>
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-32 md:h-36 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last6MonthsData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <XAxis 
                    dataKey="name" 
                    stroke="#8B8B90" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#8B8B90" 
                    fontSize={9} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar 
                    dataKey="total" 
                    fill="#2FA69A" 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
