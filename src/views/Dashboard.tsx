import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Megaphone,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Phone,
  Mail,
  Calendar,
  CheckSquare,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { getStoredContacts, getStoredDeals, getStoredActivities, getStoredCampaigns } from '@/src/mockData';
import { Contact, Deal, Activity } from '@/src/types';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);

  const loadData = () => {
    setContacts(getStoredContacts());
    setDeals(getStoredDeals());
    setActivities(getStoredActivities());
    setCampaigns(getStoredCampaigns());
  };

  useEffect(() => {
    loadData();
    // Listen for storage events (emitted by Layout or other views)
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  // Compute metrics
  const totalRevenue = deals
    .filter(d => d.stage === 'Closed Won')
    .reduce((sum, d) => sum + d.value, 0);

  const activePipelineValue = deals
    .filter(d => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost')
    .reduce((sum, d) => sum + d.value, 0);

  const totalLeads = contacts.filter(c => c.status === 'Lead').length;
  const activeCampaigns = campaigns.filter(c => c.status === 'Active').length;

  // Chart data 1: Pipeline Value by Stage
  const stagesMap = {
    'Prospect': { name: 'Prospección', value: 0 },
    'Qualification': { name: 'Cualificación', value: 0 },
    'Proposal': { name: 'Propuesta', value: 0 },
    'Negotiation': { name: 'Negociación', value: 0 },
    'Closed Won': { name: 'Ganados', value: 0 },
    'Closed Lost': { name: 'Perdidos', value: 0 }
  };

  deals.forEach(deal => {
    if (stagesMap[deal.stage]) {
      stagesMap[deal.stage].value += deal.value;
    }
  });

  const pipelineChartData = Object.values(stagesMap);

  // Chart data 2: Monthly sales trend (mocked with elegant variation)
  const monthlyRevenueData = [
    { month: 'Ene', ingresos: 18500, leads: 120 },
    { month: 'Feb', ingresos: 22400, leads: 150 },
    { month: 'Mar', ingresos: 34000, leads: 210 },
    { month: 'Abr', ingresos: 29000, leads: 180 },
    { month: 'May', ingresos: 42000, leads: 260 },
    { month: 'Jun', ingresos: totalRevenue > 0 ? totalRevenue : 36500, leads: 294 },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Call': return <Phone className="h-4 w-4 text-emerald-600" />;
      case 'Email': return <Mail className="h-4 w-4 text-indigo-600" />;
      case 'Meeting': return <Calendar className="h-4 w-4 text-amber-600" />;
      default: return <CheckSquare className="h-4 w-4 text-sky-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'Call': return 'bg-emerald-50 border-emerald-100';
      case 'Email': return 'bg-indigo-50 border-indigo-100';
      case 'Meeting': return 'bg-amber-50 border-amber-100';
      default: return 'bg-sky-50 border-sky-100';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            ¡Hola de nuevo, Artemis!
          </h1>
          <p className="text-sm text-slate-500">
            Aquí tienes el resumen de rendimiento comercial y clientes de hoy.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 bg-white shadow-xs border-slate-200">
            <span className="mr-1.5 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Sincronizado en tiempo real
          </Badge>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Card 1: Ingresos Cerrados */}
        <Card className="shadow-xs border-slate-200/80 hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ingresos Cerrados
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <DollarSign className="h-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-slate-900">
              {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(totalRevenue)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> +14.2%
              </span>
              desde el mes pasado
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Embudo Activo */}
        <Card className="shadow-xs border-slate-200/80 hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Embudo de Ventas Activo
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <TrendingUp className="h-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-slate-900">
              {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(activePipelineValue)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-indigo-600 font-semibold flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> +8.5%
              </span>
              en negociación activa
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Leads Pendientes */}
        <Card className="shadow-xs border-slate-200/80 hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Leads Cualificados
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
              <Users className="h-4 text-sky-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-slate-900">
              {totalLeads}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> +22.4%
              </span>
              conversión del tráfico
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Campañas Activas */}
        <Card className="shadow-xs border-slate-200/80 hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Marketing Activo
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
              <Megaphone className="h-4 text-rose-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-slate-900">
              {activeCampaigns}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-slate-500 font-semibold">
                {campaigns.length} en total
              </span>
              campañas configuradas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts section */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Main Area Chart: Sales Trend (2 cols wide) */}
        <Card className="lg:col-span-2 border-slate-200 shadow-xs">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Progreso de Ingresos y Leads</CardTitle>
                <CardDescription className="text-xs text-slate-500">Historial de facturación cerrada y generación de prospectos.</CardDescription>
              </div>
              <Badge className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-semibold">Semestral</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '11px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                />
                <Area name="Ingresos (€)" type="monotone" dataKey="ingresos" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorIngresos)" />
                <Area name="Leads" type="monotone" dataKey="leads" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorLeads)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart: Stage breakdown (1 col wide) */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">Salud del Embudo</CardTitle>
            <CardDescription className="text-xs text-slate-500">Volumen financiero acumulado por etapa de venta.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineChartData} layout="vertical" margin={{ top: 5, right: 15, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} width={80} />
                <Tooltip 
                  formatter={(value: any) => [`${value} €`, 'Valor']}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]}>
                  {pipelineChartData.map((entry, index) => {
                    const colors = {
                      'Prospección': '#a5b4fc',
                      'Cualificación': '#818cf8',
                      'Propuesta': '#6366f1',
                      'Negociación': '#4f46e5',
                      'Ganados': '#10b981',
                      'Perdidos': '#f43f5e'
                    };
                    return <Cell key={`cell-${index}`} fill={colors[entry.name] || '#6366f1'} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>

      {/* Grid: Activities and conversions */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Left: Recent Activity Feed */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Actividades y Tareas</CardTitle>
              <CardDescription className="text-xs text-slate-500">Últimas acciones realizadas y tareas de seguimiento pendientes.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs text-indigo-600 hover:text-indigo-700">
              <Link to="/contacts" className="flex items-center gap-1">
                Ver todos <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="px-1">
            <div className="space-y-4 max-h-[300px] overflow-y-auto px-5">
              {activities.length > 0 ? (
                activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex gap-4 items-start pb-4 border-b border-slate-100 last:border-none last:pb-0">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-800">{activity.description}</span>
                        <Badge variant={activity.status === 'Completed' ? 'secondary' : 'outline'} className={`text-[9px] font-bold py-0 ${activity.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'text-slate-400'}`}>
                          {activity.status === 'Completed' ? 'Hecho' : 'Pendiente'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700">{activity.contactName}</span>
                        <span>•</span>
                        <span>{new Date(activity.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">No hay actividades registradas.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right: Lead Conversion Pipeline (Bento Style) */}
        <Card className="border-slate-200 shadow-xs flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">Embudo de Conversión de Leads</CardTitle>
            <CardDescription className="text-xs text-slate-500">Tasas de avance estimadas entre las distintas etapas del cliente.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Stage 1 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">1. Leads Generados (Campaña / Tráfico)</span>
                <span className="font-bold text-slate-900">425 Leads</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-indigo-300" style={{ width: '100%' }}></div>
              </div>
            </div>

            {/* Stage 2 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">2. Leads Contactados / Cualificados</span>
                <span className="font-bold text-indigo-600">182 Cualificados <span className="text-[10px] text-slate-400 font-normal">(42%)</span></span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-indigo-500" style={{ width: '42%' }}></div>
              </div>
            </div>

            {/* Stage 3 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">3. Con Propuestas Económicas enviadas</span>
                <span className="font-bold text-indigo-700">85 Propuestas <span className="text-[10px] text-slate-400 font-normal">(20%)</span></span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-indigo-700" style={{ width: '20%' }}></div>
              </div>
            </div>

            {/* Stage 4 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">4. Clientes Ganados Cerrados</span>
                <span className="font-bold text-emerald-600">42 Clientes <span className="text-[10px] text-slate-400 font-normal">(10%)</span></span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: '10%' }}></div>
              </div>
            </div>
          </CardContent>
          
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-xl flex justify-between items-center text-xs text-slate-500">
            <span>Tasa de conversión final: <strong>10.2%</strong></span>
            <span className="text-[10px] bg-emerald-100/70 border border-emerald-200/50 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Excelente</span>
          </div>
        </Card>

      </div>

    </div>
  );
}
