import React, { useState, useMemo } from 'react';
import { useObras } from '../hooks/useObras';
import { useClients } from '../hooks/useClients';
import ObraCard from '../components/obras/ObraCard';
import ObraDetail from '../components/obras/ObraDetail';
import ObraForm from '../components/obras/ObraForm';
import { Obra } from '../types/obra';
import { Button } from '../components/ui/button';
import { Building2, Plus, TrendingUp, Sparkles, FolderKanban } from 'lucide-react';

export default function Obras() {
  const { clients } = useClients();
  const {
    obras,
    addObra,
    updateObra,
    updateObraStatus,
    deleteObra,
    fetchHorasObra,
    addHoraObra,
    deleteHoraObra
  } = useObras();

  // Screen workflow state: 'list' | 'detail' | 'create' | 'edit'
  const [viewState, setViewState] = useState<'list' | 'detail' | 'create' | 'edit'>('list');
  const [selectedObraId, setSelectedObraId] = useState<string | null>(null);
  const [obraToEdit, setObraToEdit] = useState<Obra | null>(null);

  // Active selected Obra
  const activeSelectedObra = useMemo(() => {
    return obras.find(o => o.id === selectedObraId) || null;
  }, [obras, selectedObraId]);

  // Client object for active Obra
  const activeSelectedClient = useMemo(() => {
    if (!activeSelectedObra) return null;
    return clients.find(c => c.id === activeSelectedObra.clientId) || null;
  }, [clients, activeSelectedObra]);

  // Handler for drag & drop
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetEstado: Obra['estado']) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) {
      updateObraStatus(id, targetEstado);
    }
  };

  // Click on a card
  const handleSelectObra = (obra: Obra) => {
    setSelectedObraId(obra.id);
    setViewState('detail');
  };

  // Create & Edit form handlers
  const handleNewObra = () => {
    setObraToEdit(null);
    setViewState('create');
  };

  const handleEditObra = (obra: Obra) => {
    setObraToEdit(obra);
    setViewState('edit');
  };

  const handleSaveForm = (obraData: Omit<Obra, 'id' | 'codigo'> & { id?: string; codigo?: string }) => {
    if (obraData.id) {
      // Editing
      updateObra(obraData.id, obraData as Partial<Obra>);
    } else {
      // Creating
      addObra(obraData);
    }
    setViewState('list');
    setObraToEdit(null);
  };

  const handleDeleteObra = (id: string) => {
    deleteObra(id);
    setViewState('list');
    setSelectedObraId(null);
  };

  // Helper to get client name for card
  const getClientName = (clientId: string) => {
    const c = clients.find(item => item.id === clientId);
    return c ? `${c.nombre} ${c.apellidos}` : 'Particular / S.A.';
  };

  // Kanban phases
  const phases: { id: Obra['estado']; label: string; color: string; border: string; bg: string }[] = [
    { id: 'Presupuesto', label: 'Presupuesto', color: 'text-verini-grey', border: 'border-slate-200', bg: 'bg-slate-50/50' },
    { id: 'Aceptada', label: 'Aceptada', color: 'text-verini-blue', border: 'border-verini-blue/15', bg: 'bg-verini-blue/5' },
    { id: 'En obra', label: 'En obra', color: 'text-verini-yellow', border: 'border-verini-yellow/15', bg: 'bg-verini-yellow/5' },
    { id: 'Entregada', label: 'Entregada / Finalizada', color: 'text-verini-teal', border: 'border-verini-teal/15', bg: 'bg-verini-teal/5' },
  ];

  return (
    <div className="space-y-6">
      {viewState === 'list' && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <FolderKanban className="h-6 w-6 text-verini-black" />
                Pipeline de Obras
              </h1>
              <p className="text-xs text-slate-500">
                Gestiona y arrastra las obras de Verini CRM a lo largo de sus distintas fases.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                <Sparkles className="h-3 w-3 animate-pulse text-verini-yellow" />
                Tablero Interactivo
              </div>
              <Button
                onClick={handleNewObra}
                className="bg-verini-black hover:bg-black/90 text-white text-xs h-9 gap-1.5 rounded-lg px-4 font-semibold shadow-xs cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Nueva Obra
              </Button>
            </div>
          </div>

          {/* Kanban Board */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {phases.map((phase) => {
              const phaseObras = obras.filter(o => o.estado === phase.id);
              const columnSum = phaseObras.reduce((sum, o) => sum + o.importe, 0);

              return (
                <div
                  key={phase.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, phase.id)}
                  className={`flex flex-col rounded-xl border border-slate-200 bg-slate-50/60 p-4 min-h-[500px] transition-colors duration-150`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-150 mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${
                        phase.id === 'Presupuesto' ? 'bg-verini-grey' :
                        phase.id === 'Aceptada' ? 'bg-verini-blue' :
                        phase.id === 'En obra' ? 'bg-verini-yellow' :
                        'bg-verini-teal'
                      }`} />
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        {phase.label}
                      </h3>
                    </div>
                    <span className="rounded-full bg-slate-200/70 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-600">
                      {phaseObras.length}
                    </span>
                  </div>

                  {/* Financial Total Column Header */}
                  {phaseObras.length > 0 && (
                    <div className="bg-white border border-slate-150 rounded-lg p-2 mb-3 text-center">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Total Cartera</span>
                      <span className="text-xs font-bold font-mono text-slate-700">
                        {columnSum.toLocaleString('es-ES')} €
                      </span>
                    </div>
                  )}

                  {/* Cards Container */}
                  <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                    {phaseObras.length > 0 ? (
                      phaseObras.map((obra) => (
                        <ObraCard
                          key={obra.id}
                          obra={obra}
                          clientName={getClientName(obra.clientId)}
                          onClick={handleSelectObra}
                          onDragStart={handleDragStart}
                        />
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl border border-dashed border-slate-200 bg-white/40">
                        <Building2 className="h-6 w-6 text-slate-300 mb-1" />
                        <span className="text-[10px] font-semibold text-slate-400">Arrastra aquí</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {viewState === 'detail' && activeSelectedObra && (
        <ObraDetail
          obra={activeSelectedObra}
          client={activeSelectedClient}
          onBack={() => setViewState('list')}
          onEdit={handleEditObra}
          onDelete={handleDeleteObra}
          onUpdateStatus={updateObraStatus}
          fetchHorasObra={fetchHorasObra}
          addHoraObra={addHoraObra}
          deleteHoraObra={deleteHoraObra}
        />
      )}

      {(viewState === 'create' || viewState === 'edit') && (
        <ObraForm
          obraToEdit={obraToEdit}
          clients={clients}
          onSave={handleSaveForm}
          onCancel={() => setViewState('list')}
        />
      )}
    </div>
  );
}
