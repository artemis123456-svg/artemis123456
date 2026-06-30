import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Search, 
  Plus, 
  TrendingUp, 
  DollarSign, 
  Users, 
  BarChart3, 
  Percent, 
  Mail, 
  Share2, 
  Globe, 
  Video,
  Play,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { getStoredCampaigns, saveStoredCampaigns, getStoredActivities, saveStoredActivities } from '@/src/mockData';
import { Campaign, Activity } from '@/src/types';

export default function Marketing() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog state
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'Email' | 'Social' | 'Search' | 'Webinar'>('Email');
  const [status, setStatus] = useState<'Draft' | 'Scheduled' | 'Active' | 'Completed'>('Draft');
  const [spent, setSpent] = useState('1500');
  const [revenue, setRevenue] = useState('4500');
  const [leads, setLeads] = useState('120');

  const loadData = () => {
    setCampaigns(getStoredCampaigns());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Totals calculations
  const totalSpent = filteredCampaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalRevenue = filteredCampaigns.reduce((sum, c) => sum + c.revenue, 0);
  const totalLeads = filteredCampaigns.reduce((sum, c) => sum + c.leadsGenerated, 0);
  const averageROI = totalSpent > 0 ? ((totalRevenue - totalSpent) / totalSpent) * 100 : 0;

  // Type Badges helpers
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Email':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
            <Mail className="h-3 w-3" /> Email
          </span>
        );
      case 'Social':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-sky-700 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-full">
            <Share2 className="h-3 w-3" /> Social Media
          </span>
        );
      case 'Search':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
            <Globe className="h-3 w-3" /> SEM / Ads
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
            <Video className="h-3 w-3" /> Webinar
          </span>
        );
    }
  };

  // Status Badge helpers
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold hover:bg-emerald-50">Activa</Badge>;
      case 'Completed':
        return <Badge className="bg-slate-50 border border-slate-200 text-slate-600 font-bold hover:bg-slate-50">Finalizada</Badge>;
      case 'Scheduled':
        return <Badge className="bg-blue-50 border border-blue-200 text-blue-700 font-bold hover:bg-blue-50">Programada</Badge>;
      default:
        return <Badge className="bg-amber-50 border border-amber-200 text-amber-700 font-bold hover:bg-amber-50">Borrador</Badge>;
    }
  };

  // Toggle status simulation
  const handleToggleStatus = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Active' ? 'Completed' 
                     : currentStatus === 'Scheduled' ? 'Active' 
                     : currentStatus === 'Completed' ? 'Draft' : 'Scheduled';
    
    const updated = campaigns.map(c => {
      if (c.id === id) {
        return { ...c, status: nextStatus as any };
      }
      return c;
    });

    setCampaigns(updated);
    saveStoredCampaigns(updated);

    // Activity log
    const campaignName = campaigns.find(c => c.id === id)?.name || 'Campaña';
    const activity: Activity = {
      id: `a_${Date.now()}`,
      type: 'Email',
      description: `Campaña "${campaignName}" actualizada a estado: ${nextStatus}`,
      contactName: 'Marketing Engine',
      date: new Date().toISOString(),
      status: 'Completed',
    };
    saveStoredActivities([activity, ...getStoredActivities()]);

    window.dispatchEvent(new Event('storage'));
  };

  // Delete campaign simulation
  const handleDeleteCampaign = (id: string) => {
    const updated = campaigns.filter(c => c.id !== id);
    setCampaigns(updated);
    saveStoredCampaigns(updated);
    window.dispatchEvent(new Event('storage'));
  };

  // Add campaign submission
  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newCampaign: Campaign = {
      id: `cam_${Date.now()}`,
      name,
      type,
      status,
      spent: Number(spent) || 0,
      revenue: Number(revenue) || 0,
      leadsGenerated: Number(leads) || 0,
    };

    const updated = [newCampaign, ...campaigns];
    setCampaigns(updated);
    saveStoredCampaigns(updated);

    // Reset Form
    setName('');
    setType('Email');
    setStatus('Draft');
    setSpent('1500');
    setRevenue('4500');
    setLeads('120');
    setIsOpen(false);
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900">Campañas de Marketing</h1>
          <p className="text-sm text-slate-500">Analiza el retorno de inversión (ROI), capta nuevos leads y optimiza tus canales de adquisición.</p>
        </div>
        <Button 
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-medium text-xs rounded-lg"
        >
          <Plus className="h-4 w-4" />
          Nueva Campaña
        </Button>
      </div>

      {/* Marketing KPI Stats Board */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Ad Spent */}
        <Card className="shadow-xs border-slate-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inversión Publicitaria</span>
              <span className="text-lg font-bold text-slate-900">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(totalSpent)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Attributed Revenue */}
        <Card className="shadow-xs border-slate-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ingresos Atribuidos</span>
              <span className="text-lg font-bold text-slate-900">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(totalRevenue)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Total leads acquired */}
        <Card className="shadow-xs border-slate-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 border border-sky-100 text-sky-600">
              <Users className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Leads Adquiridos</span>
              <span className="text-lg font-bold text-slate-900">{totalLeads} Prospectos</span>
            </div>
          </CardContent>
        </Card>

        {/* Estimated ROI */}
        <Card className="shadow-xs border-slate-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 border border-rose-100 text-rose-600">
              <Percent className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ROI Promedio</span>
              <span className="text-lg font-bold text-slate-900">+{averageROI.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Campaigns Database table */}
      <Card className="border-slate-200 shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Historial y Desempeño de Campañas</h3>
            {/* Search filter input */}
            <div className="relative max-w-xs w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Buscar campaña por nombre..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-9 w-full bg-white border-slate-200 focus-visible:ring-indigo-500 text-xs rounded-lg"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="text-xs font-semibold text-slate-500">Campaña</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500">Canal</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500">Estado</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500">Inversión (€)</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500">Ingresos Atribuidos</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500">Leads</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500">ROI %</TableHead>
                  <TableHead className="text-right text-xs font-semibold text-slate-500">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.length > 0 ? (
                  filteredCampaigns.map((camp) => {
                    const roi = camp.spent > 0 ? ((camp.revenue - camp.spent) / camp.spent) * 100 : 0;
                    return (
                      <TableRow key={camp.id} className="hover:bg-slate-50/40 transition-colors">
                        <TableCell className="py-3.5">
                          <span className="text-xs font-bold text-slate-800 block">{camp.name}</span>
                        </TableCell>
                        <TableCell className="py-3.5">
                          {getTypeBadge(camp.type)}
                        </TableCell>
                        <TableCell className="py-3.5">
                          {getStatusBadge(camp.status)}
                        </TableCell>
                        <TableCell className="py-3.5 text-xs font-semibold text-slate-600">
                          {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(camp.spent)}
                        </TableCell>
                        <TableCell className="py-3.5 text-xs font-bold text-slate-800">
                          {camp.revenue > 0 ? (
                            new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(camp.revenue)
                          ) : (
                            <span className="text-slate-400 font-normal">-</span>
                          )}
                        </TableCell>
                        <TableCell className="py-3.5 text-xs font-bold text-slate-700">
                          {camp.leadsGenerated}
                        </TableCell>
                        <TableCell className={`py-3.5 text-xs font-bold ${roi > 100 ? 'text-emerald-600' : roi > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
                          {roi > 0 ? `+${roi.toFixed(0)}%` : `${roi.toFixed(0)}%`}
                        </TableCell>
                        <TableCell className="py-3.5 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg"
                            onClick={() => handleToggleStatus(camp.id, camp.status)}
                            title="Cambiar estado"
                          >
                            <Play className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg"
                            onClick={() => handleDeleteCampaign(camp.id)}
                            title="Eliminar campaña"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-xs text-slate-400">
                      No hay campañas registradas.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog: Create Marketing Campaign */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateCampaign}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold font-heading text-slate-900">Crear Campaña de Marketing</DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Registra una campaña para medir el retorno económico de tus anuncios y boletines.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-xs font-semibold text-slate-500">Campaña *</label>
                <Input 
                  required
                  placeholder="ej. Campaña Newsletter Verano 2026" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="col-span-3 text-xs" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-xs font-semibold text-slate-500">Canal</label>
                <select 
                  value={type} 
                  onChange={e => setType(e.target.value as any)}
                  className="col-span-3 text-xs rounded-md border border-slate-200 bg-white p-2.5 outline-none focus:border-indigo-500"
                >
                  <option value="Email">Email Marketing</option>
                  <option value="Social">Redes Sociales (LinkedIn / Meta)</option>
                  <option value="Search">Google Search Ads (SEM)</option>
                  <option value="Webinar">Webinar en Vivo</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-xs font-semibold text-slate-500">Estado</label>
                <select 
                  value={status} 
                  onChange={e => setStatus(e.target.value as any)}
                  className="col-span-3 text-xs rounded-md border border-slate-200 bg-white p-2.5 outline-none focus:border-indigo-500"
                >
                  <option value="Draft">Borrador</option>
                  <option value="Scheduled">Programada</option>
                  <option value="Active">Activa</option>
                  <option value="Completed">Finalizada</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-xs font-semibold text-slate-500">Inversión (€)</label>
                <Input 
                  type="number"
                  placeholder="1500" 
                  value={spent}
                  onChange={e => setSpent(e.target.value)}
                  className="col-span-3 text-xs" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-xs font-semibold text-slate-500">Retorno (€)</label>
                <Input 
                  type="number"
                  placeholder="4500" 
                  value={revenue}
                  onChange={e => setRevenue(e.target.value)}
                  className="col-span-3 text-xs" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-xs font-semibold text-slate-500">Leads Generados</label>
                <Input 
                  type="number"
                  placeholder="120" 
                  value={leads}
                  onChange={e => setLeads(e.target.value)}
                  className="col-span-3 text-xs" 
                />
              </div>
            </div>
            <DialogFooter className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="text-xs">
                Cancelar
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
                Crear Campaña
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
