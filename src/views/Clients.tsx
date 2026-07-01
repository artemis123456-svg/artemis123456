import React, { useState } from 'react';
import { useClients } from '../hooks/useClients';
import ClientTable from '../components/clients/ClientTable';
import ClientForm from '../components/clients/ClientForm';
import ClientDetail from '../components/clients/ClientDetail';
import { Client } from '../types/client';
import { Users, TrendingUp, Calendar, Clock, User, Briefcase, CalendarClock } from 'lucide-react';
import { useObras } from '../hooks/useObras';
import { useEventos } from '../hooks/useEventos';

export default function Clients() {
  const {
    clients,
    presupuestos,
    facturas,
    documentos,
    notas,
    historial,
    addClient,
    updateClient,
    deleteClient,
    addPresupuesto,
    addDocumento,
    addNota,
    updatePresupuestoStatus,
    updateFacturaStatus,
  } = useClients();

  const {
    obras,
    addObra,
    updateObraStatus
  } = useObras();

  const { getEventosProximos } = useEventos();
  const proximosEventos = getEventosProximos(7);

  // Workflow state: 'list' | 'detail' | 'create' | 'edit'
  const [viewState, setViewState] = useState<'list' | 'detail' | 'create' | 'edit'>('list');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  // Derive current active selected client object from ID to keep state synchronized
  const activeSelectedClient = React.useMemo(() => {
    return clients.find(c => c.id === selectedClientId) || null;
  }, [clients, selectedClientId]);

  // Handlers for navigation / actions
  const handleSelectClient = (client: Client) => {
    setSelectedClientId(client.id);
    setViewState('detail');
  };

  const handleEditClient = (client: Client) => {
    setClientToEdit(client);
    setViewState('edit');
  };

  const handleNewClient = () => {
    setClientToEdit(null);
    setViewState('create');
  };

  const handleSaveForm = async (clientData: any) => {
    if (viewState === 'edit' && clientToEdit) {
      await updateClient(clientToEdit.id, clientData);
      // If we were viewing details of the edited client, return to details, else to list
      if (selectedClientId === clientToEdit.id) {
        setViewState('detail');
      } else {
        setViewState('list');
      }
    } else {
      const created = await addClient(clientData);
      // Auto-open newly created client details to delight the user
      setSelectedClientId(created.id);
      setViewState('detail');
    }
    setClientToEdit(null);
  };

  const handleCancelForm = () => {
    if (viewState === 'edit' && selectedClientId) {
      setViewState('detail');
    } else {
      setViewState('list');
    }
    setClientToEdit(null);
  };

  const handleDeleteClient = (id: string) => {
    deleteClient(id);
    if (selectedClientId === id) {
      setSelectedClientId(null);
      setViewState('list');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Module Info */}
      {viewState === 'list' && (
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-800 shadow-xs">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Clientes
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Gestión comercial, centros de trabajo (obras), propuestas y cobros de Verini CRM.
              </p>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse mr-1" />
            Mock DB Conectada
          </div>
        </div>
      )}

      {/* Main screen router render */}
      {viewState === 'list' && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3">
            <ClientTable
              clients={clients}
              obras={obras}
              onSelectClient={handleSelectClient}
              onEditClient={handleEditClient}
              onDeleteClient={handleDeleteClient}
              onNewClient={handleNewClient}
            />
          </div>

          {/* Panel de Próximos Eventos */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-150 shadow-xs overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-100 px-4 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-4.5 w-4.5 text-slate-700" />
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Próximos Eventos</h3>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  7 días
                </span>
              </div>
              <div className="p-4 space-y-3.5 divide-y divide-slate-100 max-h-[500px] overflow-y-auto scrollbar-none">
                {proximosEventos.length > 0 ? (
                  proximosEventos.map((ev) => {
                    const evDate = new Date(ev.fechaInicio);
                    const client = ev.clienteId ? clients.find(c => c.id === ev.clienteId) : null;
                    const obra = ev.obraId ? obras.find(o => o.id === ev.obraId) : null;
                    
                    const isToday = evDate.getFullYear() === new Date().getFullYear() &&
                                    evDate.getMonth() === new Date().getMonth() &&
                                    evDate.getDate() === new Date().getDate();

                    return (
                      <div key={ev.id} className={`pt-3 first:pt-0 pb-1 space-y-1 ${isToday ? 'bg-amber-50/25 -mx-4 px-4 border-l-4 border-amber-400' : ''}`}>
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                            ev.tipo === 'Visita' ? 'bg-blue-50 text-blue-700' :
                            ev.tipo === 'Reunión' ? 'bg-purple-50 text-purple-700' :
                            ev.tipo === 'Llamada' ? 'bg-teal-50 text-teal-700' :
                            ev.tipo === 'Inicio obra' ? 'bg-amber-50 text-amber-700' :
                            'bg-slate-50 text-slate-600'
                          }`}>
                            {ev.tipo}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            {evDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                            {!ev.todoElDia && ` • ${evDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`}
                          </span>
                        </div>
                        
                        <h4 className={`text-xs font-bold text-slate-800 ${ev.completado ? 'line-through opacity-50' : ''}`}>
                          {ev.titulo}
                        </h4>

                        {(client || obra) && (
                          <div className="text-[10px] text-slate-400 space-y-0.5 pt-0.5">
                            {client && (
                              <div className="flex items-center gap-1">
                                <User className="h-3.5 w-3.5 shrink-0 text-slate-350" />
                                <span className="truncate">{client.nombre} {client.apellidos}</span>
                              </div>
                            )}
                            {obra && (
                              <div className="flex items-center gap-1">
                                <Briefcase className="h-3.5 w-3.5 shrink-0 text-slate-350" />
                                <span className="truncate">{obra.titulo}</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {isToday && (
                          <div className="text-[9px] font-black text-amber-700 uppercase pt-0.5">
                            ★ ¡Es Hoy!
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-xs text-slate-400 italic">
                    Sin eventos programados para los próximos 7 días.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {viewState === 'detail' && activeSelectedClient && (
        <ClientDetail
          client={activeSelectedClient}
          obras={obras}
          presupuestos={presupuestos}
          facturas={facturas}
          documentos={documentos}
          notas={notas}
          historial={historial}
          onBack={() => setViewState('list')}
          onEdit={handleEditClient}
          onAddObra={(clientId, obraData) => addObra({ ...obraData, clientId })}
          onAddPresupuesto={addPresupuesto}
          onAddDocumento={addDocumento}
          onAddNota={addNota}
          onUpdateObraStatus={updateObraStatus}
          onUpdatePresupuestoStatus={updatePresupuestoStatus}
          onUpdateFacturaStatus={updateFacturaStatus}
        />
      )}

      {(viewState === 'create' || viewState === 'edit') && (
        <ClientForm
          clientToEdit={clientToEdit}
          onSave={handleSaveForm}
          onCancel={handleCancelForm}
        />
      )}
    </div>
  );
}
