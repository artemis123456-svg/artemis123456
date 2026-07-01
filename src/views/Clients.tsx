import React, { useState } from 'react';
import { useClients } from '../hooks/useClients';
import ClientTable from '../components/clients/ClientTable';
import ClientForm from '../components/clients/ClientForm';
import ClientDetail from '../components/clients/ClientDetail';
import { Client } from '../types/client';
import { Users, TrendingUp } from 'lucide-react';
import { useObras } from '../hooks/useObras';

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
        <ClientTable
          clients={clients}
          obras={obras}
          onSelectClient={handleSelectClient}
          onEditClient={handleEditClient}
          onDeleteClient={handleDeleteClient}
          onNewClient={handleNewClient}
        />
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
