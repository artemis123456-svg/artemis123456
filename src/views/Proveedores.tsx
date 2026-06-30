import React, { useState, useMemo } from 'react';
import { useProveedores } from '../hooks/useProveedores';
import ProveedorTable from '../components/proveedores/ProveedorTable';
import ProveedorForm from '../components/proveedores/ProveedorForm';
import ProveedorDetail from '../components/proveedores/ProveedorDetail';
import { Proveedor } from '../types/proveedor';
import { Truck, Sparkles, TrendingUp } from 'lucide-react';

export default function Proveedores() {
  const {
    proveedores,
    compras,
    documentos,
    notas,
    addProveedor,
    updateProveedor,
    deleteProveedor,
    addCompra,
    addDocumento,
    deleteDocumento,
    addNota,
    deleteNota,
    updateCompraStatus
  } = useProveedores();

  // Screen workflow state: 'list' | 'detail' | 'create' | 'edit'
  const [viewState, setViewState] = useState<'list' | 'detail' | 'create' | 'edit'>('list');
  const [selectedProveedorId, setSelectedProveedorId] = useState<string | null>(null);
  const [proveedorToEdit, setProveedorToEdit] = useState<Proveedor | null>(null);

  // Derive current active selected provider object from ID to keep state synchronized
  const activeSelectedProveedor = useMemo(() => {
    return proveedores.find(p => p.id === selectedProveedorId) || null;
  }, [proveedores, selectedProveedorId]);

  // Handlers for navigation / actions
  const handleSelectProveedor = (prov: Proveedor) => {
    setSelectedProveedorId(prov.id);
    setViewState('detail');
  };

  const handleEditProveedor = (prov: Proveedor) => {
    setProveedorToEdit(prov);
    setViewState('edit');
  };

  const handleNewProveedor = () => {
    setProveedorToEdit(null);
    setViewState('create');
  };

  const handleSaveForm = async (provData: any) => {
    if (viewState === 'edit' && proveedorToEdit) {
      await updateProveedor(proveedorToEdit.id, provData);
      if (selectedProveedorId === proveedorToEdit.id) {
        setViewState('detail');
      } else {
        setViewState('list');
      }
    } else {
      const created = await addProveedor(provData);
      setSelectedProveedorId(created.id);
      setViewState('detail');
    }
    setProveedorToEdit(null);
  };

  const handleCancelForm = () => {
    if (viewState === 'edit' && selectedProveedorId) {
      setViewState('detail');
    } else {
      setViewState('list');
    }
    setProveedorToEdit(null);
  };

  const handleDeleteProveedor = (id: string) => {
    deleteProveedor(id);
    if (selectedProveedorId === id) {
      setSelectedProveedorId(null);
      setViewState('list');
    }
  };

  // Quick statistics for the header
  const activeProveedoresCount = useMemo(() => {
    return proveedores.filter(p => p.activo).length;
  }, [proveedores]);

  const materialsCount = useMemo(() => {
    return proveedores.filter(p => p.tipo === 'Materiales').length;
  }, [proveedores]);

  const subcontratasCount = useMemo(() => {
    return proveedores.filter(p => p.tipo === 'Subcontrata').length;
  }, [proveedores]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Title & Module Info */}
      {viewState === 'list' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Truck className="h-6 w-6 text-indigo-600" />
              Gestión de Proveedores y Gremios
            </h1>
            <p className="text-xs text-slate-500">
              Controla suministradores de materiales y subcontratas en las reformas de Verini CRM.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg">
              <Sparkles className="h-3 w-3 animate-pulse" />
              {activeProveedoresCount} Activos
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
              {materialsCount} Materiales
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
              {subcontratasCount} Subcontratas
            </div>
          </div>
        </div>
      )}

      {/* Main Views Router */}
      {viewState === 'list' && (
        <ProveedorTable
          proveedores={proveedores}
          onSelectProveedor={handleSelectProveedor}
          onEditProveedor={handleEditProveedor}
          onDeleteProveedor={handleDeleteProveedor}
          onNewProveedor={handleNewProveedor}
        />
      )}

      {viewState === 'detail' && activeSelectedProveedor && (
        <ProveedorDetail
          proveedor={activeSelectedProveedor}
          compras={compras}
          documentos={documentos}
          notas={notas}
          onBack={() => setViewState('list')}
          onEdit={handleEditProveedor}
          onDelete={handleDeleteProveedor}
          onAddCompra={addCompra}
          onAddDocumento={addDocumento}
          onDeleteDocumento={deleteDocumento}
          onAddNota={addNota}
          onDeleteNota={deleteNota}
          onUpdateCompraStatus={updateCompraStatus}
        />
      )}

      {(viewState === 'create' || viewState === 'edit') && (
        <ProveedorForm
          proveedorToEdit={proveedorToEdit}
          onSave={handleSaveForm}
          onCancel={handleCancelForm}
        />
      )}
    </div>
  );
}
