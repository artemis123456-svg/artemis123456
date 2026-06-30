import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Search, 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  ShieldAlert,
  Building2,
  Briefcase
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { getStoredDeals, saveStoredDeals, getStoredActivities, saveStoredActivities } from '@/src/mockData';
import { Deal, Activity } from '@/src/types';

const STAGES = [
  { key: 'Prospect', name: 'Prospección', color: 'border-slate-200 bg-slate-50 text-slate-800' },
  { key: 'Qualification', name: 'Cualificación', color: 'border-indigo-100 bg-indigo-50/50 text-indigo-800' },
  { key: 'Proposal', name: 'Propuesta', color: 'border-blue-100 bg-blue-50/50 text-blue-800' },
  { key: 'Negotiation', name: 'Negociación', color: 'border-amber-100 bg-amber-50/50 text-amber-800' },
  { key: 'Closed Won', name: 'Ganado 🎉', color: 'border-emerald-100 bg-emerald-50/50 text-emerald-800' },
  { key: 'Closed Lost', name: 'Perdido ❌', color: 'border-rose-100 bg-rose-50/50 text-rose-800' }
] as const;

type StageKey = typeof STAGES[number]['key'];

export default function Deals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog to Add
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [contactName, setContactName] = useState('');
  const [company, setCompany] = useState('');
  const [value, setValue] = useState('12000');
  const [stage, setStage] = useState<StageKey>('Prospect');

  const loadData = () => {
    setDeals(getStoredDeals());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  // Filter deals by query
  const filteredDeals = deals.filter(deal => 
    deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deal.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deal.contactName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute stats
  const totalPipeline = filteredDeals.reduce((sum, d) => sum + d.value, 0);
  const wonPipeline = filteredDeals.filter(d => d.stage === 'Closed Won').reduce((sum, d) => sum + d.value, 0);
  const activeCount = filteredDeals.filter(d => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost').length;

  // Handle stage transition
  const handleMoveStage = (id: string, direction: 'left' | 'right') => {
    const stageKeys = STAGES.map(s => s.key);
    
    const updated = deals.map(deal => {
      if (deal.id === id) {
        const currentIndex = stageKeys.indexOf(deal.stage as any);
        let nextIndex = currentIndex;
        
        if (direction === 'right' && currentIndex < stageKeys.length - 1) {
          nextIndex = currentIndex + 1;
        } else if (direction === 'left' && currentIndex > 0) {
          nextIndex = currentIndex - 1;
        }
        
        const nextStage = stageKeys[nextIndex] as StageKey;
        const probability = nextStage === 'Prospect' ? 10 
          : nextStage === 'Qualification' ? 30 
          : nextStage === 'Proposal' ? 60 
          : nextStage === 'Negotiation' ? 85
          : nextStage === 'Closed Won' ? 100 : 0;

        // Log task
        const activity: Activity = {
          id: `a_${Date.now()}`,
          type: 'Task',
          description: `Trato movido a la fase: ${nextStage}`,
          contactName: deal.contactName,
          date: new Date().toISOString(),
          status: 'Completed',
        };
        saveStoredActivities([activity, ...getStoredActivities()]);

        return {
          ...deal,
          stage: nextStage,
          probability
        };
      }
      return deal;
    });

    setDeals(updated);
    saveStoredDeals(updated);
    window.dispatchEvent(new Event('storage'));
  };

  // Handle Delete Deal
  const handleDeleteDeal = (id: string) => {
    const updated = deals.filter(d => d.id !== id);
    setDeals(updated);
    saveStoredDeals(updated);
    window.dispatchEvent(new Event('storage'));
  };

  // Handle Create Deal
  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !contactName || !company) return;

    const newDeal: Deal = {
      id: `d_${Date.now()}`,
      title,
      contactName,
      company,
      value: Number(value) || 0,
      stage,
      probability: stage === 'Prospect' ? 10 
        : stage === 'Qualification' ? 30 
        : stage === 'Proposal' ? 60 
        : stage === 'Negotiation' ? 85
        : stage === 'Closed Won' ? 100 : 0,
      expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 45 days
    };

    const updated = [newDeal, ...deals];
    setDeals(updated);
    saveStoredDeals(updated);

    // Activity log
    const activity: Activity = {
      id: `a_${Date.now()}`,
      type: 'Meeting',
      description: `Trato creado: ${newDeal.title} (${newDeal.value} €)`,
      contactName: newDeal.contactName,
      date: new Date().toISOString(),
      status: 'Pending',
    };
    saveStoredActivities([activity, ...getStoredActivities()]);

    // Reset Form
    setTitle('');
    setContactName('');
    setCompany('');
    setValue('12000');
    setStage('Prospect');
    setIsAddOpen(false);
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Pipeline Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900">Embudo de Ventas (Pipeline)</h1>
          <p className="text-sm text-slate-500">Supervisa las oportunidades comerciales y avanza tratos en las diferentes fases de venta.</p>
        </div>
        <Button 
          onClick={() => setIsAddOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-medium text-xs rounded-lg"
        >
          <Plus className="h-4 w-4" />
          Añadir Oportunidad
        </Button>
      </div>

      {/* Mini Performance Bar */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cartera Total Ponderada</span>
          <span className="text-lg font-bold text-slate-900">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(totalPipeline)}</span>
        </div>
        <div className="flex flex-col border-slate-100 sm:border-l sm:pl-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Negociaciones en Curso</span>
          <span className="text-lg font-bold text-indigo-600">{activeCount} Tratos Activos</span>
        </div>
        <div className="flex flex-col border-slate-100 sm:border-l sm:pl-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ingresos Facturados</span>
          <span className="text-lg font-bold text-emerald-600">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(wonPipeline)}</span>
        </div>
      </div>

      {/* Search Input Filter */}
      <div className="relative max-w-xs w-full">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          type="text"
          placeholder="Buscar tratos por nombre o cliente..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-9 h-9 w-full bg-white border-slate-200 focus-visible:ring-indigo-500 text-xs rounded-lg"
        />
      </div>

      {/* Kanban Board Container */}
      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin select-none">
        {STAGES.map((col) => {
          const stageDeals = filteredDeals.filter(d => d.stage === col.key);
          const stageTotal = stageDeals.reduce((sum, d) => sum + d.value, 0);

          return (
            <div 
              key={col.key} 
              className="flex flex-col w-72 shrink-0 bg-slate-100/75 rounded-xl border border-slate-200/60 p-3 max-h-[600px] overflow-hidden"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">{col.name}</span>
                  <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-slate-200 text-slate-700 font-bold">
                    {stageDeals.length}
                  </Badge>
                </div>
                <span className="text-[11px] font-bold text-slate-500">
                  {stageTotal > 0 ? `${new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(stageTotal)} €` : '0 €'}
                </span>
              </div>

              {/* Column Cards Stream */}
              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {stageDeals.length > 0 ? (
                  stageDeals.map((deal) => (
                    <div 
                      key={deal.id} 
                      className="group relative flex flex-col justify-between rounded-xl bg-white border border-slate-200/80 p-3.5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200"
                    >
                      {/* Trash icon absolute overlay */}
                      <button 
                        onClick={() => handleDeleteDeal(deal.id)}
                        className="absolute top-3 right-3 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="Eliminar trato"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                      {/* Header */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide truncate max-w-[190px] block">
                          {deal.company}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 leading-snug truncate pr-3" title={deal.title}>
                          {deal.title}
                        </h4>
                      </div>

                      {/* Client row */}
                      <div className="flex items-center gap-1.5 mt-2.5">
                        <div className="h-4 w-4 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
                          <span className="text-[8px] font-bold text-slate-600">C</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium truncate">{deal.contactName}</span>
                      </div>

                      {/* Valuation Row */}
                      <div className="flex items-center justify-between border-t border-slate-100 mt-3 pt-3">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Valor</span>
                          <span className="text-xs font-bold text-indigo-700">
                            {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(deal.value)}
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Probabilidad</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-0.5
                            ${deal.stage === 'Closed Won' ? 'bg-emerald-50 text-emerald-700' 
                              : deal.stage === 'Closed Lost' ? 'bg-rose-50 text-rose-700'
                              : 'bg-indigo-50 text-indigo-700'}`}>
                            {deal.probability}%
                          </span>
                        </div>
                      </div>

                      {/* Move Stage Toggles (Action buttons for UX simulation) */}
                      <div className="flex items-center justify-between mt-3.5 pt-2 border-t border-slate-100 border-dashed">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-900 shrink-0"
                          onClick={() => handleMoveStage(deal.id, 'left')}
                          disabled={col.key === 'Prospect'}
                          title="Retroceder etapa"
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                        </Button>
                        <span className="text-[10px] text-slate-400 font-medium">Fases</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-900 shrink-0"
                          onClick={() => handleMoveStage(deal.id, 'right')}
                          disabled={col.key === 'Closed Lost'}
                          title="Avanzar etapa"
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl py-8 px-4 text-center">
                    <span className="text-[11px] text-slate-400">Sin tratos aquí</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dialog: Create Deal Opportunity */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateDeal}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold font-heading text-slate-900">Añadir Oportunidad al Embudo</DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Registra un trato para proyectar ingresos previstos en la cartera.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-xs font-semibold text-slate-500">Trato *</label>
                <Input 
                  required
                  placeholder="ej. Renovación Licencias SaaS" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="col-span-3 text-xs" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-xs font-semibold text-slate-500">Contacto *</label>
                <Input 
                  required
                  placeholder="ej. Sofía Vergara" 
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  className="col-span-3 text-xs" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-xs font-semibold text-slate-500">Empresa *</label>
                <Input 
                  required
                  placeholder="ej. Media Global" 
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  className="col-span-3 text-xs" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-xs font-semibold text-slate-500">Valor (€)</label>
                <Input 
                  type="number"
                  placeholder="12000" 
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  className="col-span-3 text-xs" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-xs font-semibold text-slate-500">Fase Inicial</label>
                <select 
                  value={stage} 
                  onChange={e => setStage(e.target.value as any)}
                  className="col-span-3 text-xs rounded-md border border-slate-200 bg-white p-2.5 outline-none focus:border-indigo-500"
                >
                  <option value="Prospect">Prospección</option>
                  <option value="Qualification">Cualificación</option>
                  <option value="Proposal">Propuesta Enviada</option>
                  <option value="Negotiation">Negociación</option>
                  <option value="Closed Won">Ganado (Cerrado)</option>
                  <option value="Closed Lost">Perdido (Cerrado)</option>
                </select>
              </div>
            </div>
            <DialogFooter className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)} className="text-xs">
                Cancelar
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
                Crear Oportunidad
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
