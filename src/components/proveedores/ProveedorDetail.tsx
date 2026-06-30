import React, { useState, useMemo } from 'react';
import { Proveedor, CompraProveedor, DocumentoProveedor, NotaProveedor } from '../../types/proveedor';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  ArrowLeft,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  Clock,
  MapPin,
  Sparkles,
  Layers,
  Wrench,
  User,
  Plus,
  Trash2,
  Upload,
  StickyNote,
  CheckCircle2,
  Edit2,
  Phone,
  Mail,
  Landmark,
  ShieldCheck,
  Check,
  CreditCard,
  Truck,
  Briefcase
} from 'lucide-react';

interface ProveedorDetailProps {
  proveedor: Proveedor;
  compras: CompraProveedor[];
  documentos: DocumentoProveedor[];
  notas: NotaProveedor[];
  onBack: () => void;
  onEdit: (prov: Proveedor) => void;
  onDelete: (id: string) => void;
  onAddCompra: (compraData: Omit<CompraProveedor, 'id' | 'codigo'>) => void;
  onAddDocumento: (docData: Omit<DocumentoProveedor, 'id'>) => void;
  onDeleteDocumento: (id: string) => void;
  onAddNota: (notaData: Omit<NotaProveedor, 'id'>) => void;
  onDeleteNota: (id: string) => void;
  onUpdateCompraStatus: (id: string, estado: CompraProveedor['estado']) => void;
}

type TabType = 'generales' | 'compras' | 'documentos' | 'notas';

export default function ProveedorDetail({
  proveedor,
  compras,
  documentos,
  notas,
  onBack,
  onEdit,
  onDelete,
  onAddCompra,
  onAddDocumento,
  onDeleteDocumento,
  onAddNota,
  onDeleteNota,
  onUpdateCompraStatus
}: ProveedorDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>('generales');

  // Filter components by providerId
  const providerPurchases = useMemo(() => {
    return compras.filter(c => c.proveedorId === proveedor.id);
  }, [compras, proveedor.id]);

  const providerDocs = useMemo(() => {
    return documentos.filter(d => d.proveedorId === proveedor.id);
  }, [documentos, proveedor.id]);

  const providerNotes = useMemo(() => {
    return notas.filter(n => n.proveedorId === proveedor.id);
  }, [notas, proveedor.id]);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalCount = providerPurchases.length;
    const totalSum = providerPurchases.reduce((sum, c) => sum + c.importe, 0);
    const paidSum = providerPurchases.filter(c => c.estado === 'Pagado').reduce((sum, c) => sum + c.importe, 0);
    const pendingSum = providerPurchases.filter(c => c.estado === 'Pendiente').reduce((sum, c) => sum + c.importe, 0);
    const receivedSum = providerPurchases.filter(c => c.estado === 'Recibido').reduce((sum, c) => sum + c.importe, 0);

    return {
      totalCount,
      totalSum,
      paidSum,
      pendingSum,
      receivedSum
    };
  }, [providerPurchases]);

  // Note form state
  const [newNote, setNewNote] = useState('');

  // Purchase form state
  const [isPurchaseFormOpen, setIsPurchaseFormOpen] = useState(false);
  const [purchaseConcept, setPurchaseConcept] = useState('');
  const [purchaseImport, setPurchaseImport] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [purchaseStatus, setPurchaseStatus] = useState<CompraProveedor['estado']>('Pendiente');

  // Document form state
  const [newDocName, setNewDocName] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Note handlers
  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    onAddNota({
      proveedorId: proveedor.id,
      contenido: newNote.trim(),
      autor: 'Usuario de Verini (Tú)',
      fecha: new Date().toISOString()
    });

    setNewNote('');
  };

  // Purchase handlers
  const handleAddPurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseConcept.trim() || !purchaseImport) {
      alert('Por favor complete los campos obligatorios del pedido.');
      return;
    }

    onAddCompra({
      proveedorId: proveedor.id,
      concepto: purchaseConcept.trim(),
      importe: Number(purchaseImport) || 0,
      fecha: purchaseDate || new Date().toISOString().split('T')[0],
      estado: purchaseStatus
    });

    setPurchaseConcept('');
    setPurchaseImport('');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setPurchaseStatus('Pendiente');
    setIsPurchaseFormOpen(false);
  };

  // Document handlers
  const handleAddDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = newDocName.trim() || 'Ficha_Tecnica_Material.pdf';

    onAddDocumento({
      proveedorId: proveedor.id,
      nombre: finalName.endsWith('.pdf') ? finalName : `${finalName}.pdf`,
      tipo: 'PDF',
      fechaSubida: new Date().toISOString().split('T')[0],
      tamano: '1.5 MB'
    });

    setNewDocName('');
  };

  // Drag & drop file simulator callbacks
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      onAddDocumento({
        proveedorId: proveedor.id,
        nombre: file.name,
        tipo: file.name.split('.').pop()?.toUpperCase() || 'DOCUMENTO',
        fechaSubida: new Date().toISOString().split('T')[0],
        tamano: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      });
    }
  };

  // Badge layouts
  const renderTipoBadge = (tipo: Proveedor['tipo']) => {
    if (tipo === 'Materiales') {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-600/20">
          <Truck className="h-3.5 w-3.5 text-amber-600" />
          Materiales
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-800 ring-1 ring-inset ring-indigo-600/20">
          <Briefcase className="h-3.5 w-3.5 text-indigo-600" />
          Subcontrata
        </span>
      );
    }
  };

  const renderStatusBadge = (activo: boolean) => {
    if (activo) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/10">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Activo
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-600/10">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          Inactivo
        </span>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-9 w-9 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 shadow-xs"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 uppercase tracking-wide">
                {proveedor.codigo}
              </span>
              {renderTipoBadge(proveedor.tipo)}
              {renderStatusBadge(proveedor.activo)}
            </div>
            <h2 className="text-xl font-bold text-slate-950 mt-1 tracking-tight">
              {proveedor.nombre}
            </h2>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(proveedor)}
            className="border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 gap-1.5 rounded-lg h-9 text-xs font-semibold px-3"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Editar Proveedor
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('¿Estás seguro de que deseas eliminar este proveedor permanentemente de Verini CRM? Se eliminarán todas sus compras, documentos y bitácoras asociadas.')) {
                onDelete(proveedor.id);
              }
            }}
            className="border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 gap-1.5 rounded-lg h-9 text-xs font-semibold px-3"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Hero Stats Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Pedidos</span>
            <Layers className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-xl font-bold text-slate-950 font-mono">
            {stats.totalCount}
          </p>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Historial acumulado</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Volumen de Compra</span>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-xl font-bold text-slate-950 font-mono">
            {stats.totalSum.toLocaleString('es-ES')} €
          </p>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Base Imponible pedida</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pagado</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-xl font-bold text-emerald-600 font-mono">
            {stats.paidSum.toLocaleString('es-ES')} €
          </p>
          <p className="text-[10px] text-emerald-400 font-medium mt-0.5">
            {stats.totalSum > 0 ? `${Math.round((stats.paidSum / stats.totalSum) * 100)}% del total` : '0%'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pendiente de Pago</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-xl font-bold text-amber-600 font-mono">
            {stats.pendingSum.toLocaleString('es-ES')} €
          </p>
          <p className="text-[10px] text-amber-400 font-medium mt-0.5">Recibido s/p: {stats.receivedSum.toLocaleString('es-ES')} €</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-100 overflow-x-auto bg-slate-50/50">
          {(
            [
              { id: 'generales', label: 'Datos Generales', icon: Sparkles },
              { id: 'compras', label: `Compras / Pedidos (${providerPurchases.length})`, icon: DollarSign },
              { id: 'documentos', label: `Documentos (${providerDocs.length})`, icon: Upload },
              { id: 'notas', label: `Notas y Bitácora (${providerNotes.length})`, icon: StickyNote }
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-all outline-none
                  ${isActive 
                    ? 'border-indigo-600 text-indigo-700 bg-white font-bold' 
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/40'}`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* TAB 1: DATOS GENERALES */}
          {activeTab === 'generales' && (
            <div className="space-y-6">
              {/* Core Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Contact Data */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                    <Phone className="h-3.5 w-3.5 text-indigo-500" />
                    Contacto de Empresa
                  </h4>
                  <ul className="space-y-3 text-xs">
                    <li className="flex justify-between items-center py-0.5">
                      <span className="font-semibold text-slate-400">Persona de Contacto:</span>
                      <span className="font-bold text-slate-800">{proveedor.personaContacto || 'No declarada'}</span>
                    </li>
                    <li className="flex justify-between items-center py-0.5">
                      <span className="font-semibold text-slate-400">Categoría / Especialidad:</span>
                      <span className="font-bold text-indigo-600 bg-indigo-50/70 px-2 py-0.5 rounded border border-indigo-100/50">{proveedor.categoria}</span>
                    </li>
                    <li className="flex justify-between items-center py-0.5">
                      <span className="font-semibold text-slate-400">Teléfono Fijo:</span>
                      <span className="font-mono text-slate-800">{proveedor.telefono || '-'}</span>
                    </li>
                    <li className="flex justify-between items-center py-0.5">
                      <span className="font-semibold text-slate-400">Móvil:</span>
                      <span className="font-mono text-slate-800">{proveedor.movil || '-'}</span>
                    </li>
                    <li className="flex justify-between items-center py-0.5">
                      <span className="font-semibold text-slate-400">Correo Electrónico:</span>
                      <span className="font-mono text-slate-800 text-indigo-600 hover:underline">{proveedor.email || '-'}</span>
                    </li>
                    <li className="flex justify-between items-center py-0.5">
                      <span className="font-semibold text-slate-400">NIF / CIF:</span>
                      <span className="font-mono font-bold text-slate-800 uppercase">{proveedor.nifCif || '-'}</span>
                    </li>
                  </ul>
                </div>

                {/* Location and bank */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                    <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                    Ubicación y Facturación
                  </h4>
                  <ul className="space-y-3 text-xs">
                    <li className="flex justify-between items-start py-0.5">
                      <span className="font-semibold text-slate-400">Dirección:</span>
                      <span className="font-medium text-slate-700 text-right max-w-xs">{proveedor.direccion || '-'}</span>
                    </li>
                    <li className="flex justify-between items-center py-0.5">
                      <span className="font-semibold text-slate-400">Código Postal:</span>
                      <span className="font-mono text-slate-800">{proveedor.codigoPostal || '-'}</span>
                    </li>
                    <li className="flex justify-between items-center py-0.5">
                      <span className="font-semibold text-slate-400">Ciudad:</span>
                      <span className="font-medium text-slate-800">{proveedor.ciudad || '-'}</span>
                    </li>
                    <li className="flex justify-between items-center py-0.5">
                      <span className="font-semibold text-slate-400">Provincia:</span>
                      <span className="font-medium text-slate-800">{proveedor.provincia || '-'}</span>
                    </li>
                    <li className="flex flex-col gap-1 py-1 border-t border-dashed border-slate-100 mt-2 pt-2">
                      <span className="font-semibold text-slate-400 flex items-center gap-1">
                        <Landmark className="h-3.5 w-3.5 text-slate-400" />
                        Cuenta IBAN para pagos:
                      </span>
                      <span className="font-mono font-bold text-slate-800 bg-slate-50 border border-slate-150 px-2 py-1 rounded select-all block text-center mt-1">
                        {proveedor.iban ? proveedor.iban.replace(/(.{4})/g, '$1 ') : 'No proporcionado'}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Observaciones box */}
              {proveedor.observaciones && (
                <div className="p-4 bg-amber-50/40 border border-amber-100 rounded-xl space-y-1">
                  <h5 className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                    <StickyNote className="h-3.5 w-3.5 text-amber-600" />
                    Condiciones Especiales y Observaciones de Compra
                  </h5>
                  <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                    {proveedor.observaciones}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: COMPRAS / PEDIDOS */}
          {activeTab === 'compras' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Historial de Pedidos y Compras</h3>
                
                <Button
                  onClick={() => setIsPurchaseFormOpen(!isPurchaseFormOpen)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 px-3 gap-1 rounded-lg"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Registrar Pedido
                </Button>
              </div>

              {/* Purchase Create Modal Form */}
              {isPurchaseFormOpen && (
                <form onSubmit={handleAddPurchaseSubmit} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-1 duration-150">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Nuevo Pedido / Gasto Proveedor</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1 lg:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Concepto o Detalle de Partida <span className="text-red-500">*</span></label>
                      <Input
                        required
                        placeholder="ej. Azulejos porcelánicos obra Gran Vía"
                        value={purchaseConcept}
                        onChange={e => setPurchaseConcept(e.target.value)}
                        className="text-xs h-9 bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Importe (€) <span className="text-red-500">*</span></label>
                      <Input
                        required
                        type="number"
                        step="0.01"
                        placeholder="ej. 1500.50"
                        value={purchaseImport}
                        onChange={e => setPurchaseImport(e.target.value)}
                        className="text-xs h-9 bg-white font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Fecha Emisión</label>
                      <Input
                        type="date"
                        value={purchaseDate}
                        onChange={e => setPurchaseDate(e.target.value)}
                        className="text-xs h-9 bg-white font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Estado Pedido</label>
                      <select
                        value={purchaseStatus}
                        onChange={e => setPurchaseStatus(e.target.value as any)}
                        className="w-full text-xs h-9 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 outline-none focus:border-indigo-500"
                      >
                        <option value="Pendiente">Pendiente (No Recibido / No Pagado)</option>
                        <option value="Recibido">Recibido (Servido, Sin Pagar)</option>
                        <option value="Pagado">Pagado (Completado)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsPurchaseFormOpen(false)}
                      className="text-xs h-8 px-3 border border-slate-200 rounded-lg bg-white"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 px-4 rounded-lg"
                    >
                      Guardar Pedido
                    </Button>
                  </div>
                </form>
              )}

              {/* Purchase Table */}
              {providerPurchases.length > 0 ? (
                <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[11px] font-semibold text-slate-600 border-b border-slate-200">
                        <th className="px-4 py-3">Código</th>
                        <th className="px-4 py-3">Fecha</th>
                        <th className="px-4 py-3">Concepto / Partida</th>
                        <th className="px-4 py-3">Importe (Base)</th>
                        <th className="px-4 py-3 text-center">Estado Pago</th>
                        <th className="px-4 py-3 text-right">Acción Rápida</th>
                      </tr>
                    </thead>
                    <tbody>
                      {providerPurchases.map(p => (
                        <tr key={p.id} className="border-b border-slate-100 text-xs hover:bg-slate-50/50">
                          <td className="px-4 py-3.5 font-mono font-semibold text-slate-900">{p.codigo}</td>
                          <td className="px-4 py-3.5 font-mono text-slate-500">{new Date(p.fecha).toLocaleDateString('es-ES')}</td>
                          <td className="px-4 py-3.5 font-medium text-slate-800">{p.concepto}</td>
                          <td className="px-4 py-3.5 font-mono font-bold text-slate-950">{p.importe.toLocaleString('es-ES')} €</td>
                          <td className="px-4 py-3.5 text-center">
                            <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold leading-none
                              ${p.estado === 'Pagado' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10' :
                                p.estado === 'Recibido' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/10' :
                                'bg-amber-50 text-amber-700 ring-1 ring-amber-600/10'}`}>
                              {p.estado}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {p.estado !== 'Pagado' && (
                                <button
                                  onClick={() => onUpdateCompraStatus(p.id, 'Pagado')}
                                  className="text-[10px] text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 border border-emerald-200 rounded font-semibold transition-colors"
                                >
                                  Marcar Pagado
                                </button>
                              )}
                              {p.estado === 'Pendiente' && (
                                <button
                                  onClick={() => onUpdateCompraStatus(p.id, 'Recibido')}
                                  className="text-[10px] text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 border border-blue-200 rounded font-semibold transition-colors"
                                >
                                  Recibido
                                </button>
                              )}
                              {p.estado === 'Pagado' && (
                                <span className="text-[10px] text-slate-400 flex items-center gap-1 select-none">
                                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                                  Listo
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <CreditCard className="h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-xs font-semibold text-slate-600 mb-1">Sin pedidos registrados</p>
                  <p className="text-[11px] text-slate-400 max-w-sm">
                    Registra facturas de compra, certificaciones de subcontratas o albaranes asociados para llevar el control financiero de este proveedor.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DOCUMENTOS */}
          {activeTab === 'documentos' && (
            <div className="space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Expedientes y Documentación Técnica</h3>

              {/* Faux drag and drop block */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center py-8 px-4 text-center rounded-xl border-2 border-dashed transition-all duration-150 cursor-pointer
                  ${isDragging
                    ? 'border-indigo-600 bg-indigo-50/50'
                    : 'border-slate-250 bg-slate-50 hover:bg-slate-100/50'}`}
              >
                <Upload className={`h-8 w-8 mb-2 ${isDragging ? 'text-indigo-600 animate-bounce' : 'text-slate-400'}`} />
                <p className="text-xs font-bold text-slate-700">Arrastra tarifas, catálogos o pólizas de seguro aquí</p>
                <p className="text-[10px] text-slate-400 mt-1">O escribe el nombre del archivo abajo para añadirlo manualmente</p>
              </div>

              {/* Manual submittor */}
              <form onSubmit={handleAddDocSubmit} className="flex gap-2">
                <Input
                  placeholder="ej. Catalogo_Tarifa_Griferia_2026.pdf"
                  value={newDocName}
                  onChange={e => setNewDocName(e.target.value)}
                  className="text-xs h-9 bg-white"
                />
                <Button type="submit" className="bg-indigo-600 text-white text-xs h-9 px-4 gap-1 rounded-lg">
                  <Plus className="h-4 w-4" />
                  Añadir
                </Button>
              </form>

              {/* Document rows */}
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
                {providerDocs.length > 0 ? (
                  providerDocs.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-white text-xs hover:bg-slate-50">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded bg-indigo-50 text-indigo-700 font-bold font-mono text-[10px] select-none">
                          {doc.tipo}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-tight">{doc.nombre}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Tamaño: {doc.tamano || '1.2 MB'} • Subido: {new Date(doc.fechaSubida).toLocaleDateString('es-ES')}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteDocumento(doc.id)}
                        className="h-8 w-8 text-slate-400 hover:text-red-600 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-slate-400 italic">
                    No hay documentos guardados para este proveedor.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: NOTAS / BITÁCORA */}
          {activeTab === 'notas' && (
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Bitácora de Notas y Seguimiento Comercial</h3>

              {/* Add comment form */}
              <form onSubmit={handleAddNoteSubmit} className="space-y-2">
                <textarea
                  rows={3}
                  required
                  placeholder="Añade un comentario sobre incidencias de entrega, notas de negociación de tarifas..."
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 bg-white p-3 text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                />
                <div className="flex justify-end">
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 px-4 gap-1 rounded-lg">
                    <CheckCircle2 className="h-4 w-4" />
                    Guardar Nota
                  </Button>
                </div>
              </form>

              {/* Comment thread */}
              <div className="space-y-4">
                {providerNotes.length > 0 ? (
                  providerNotes.map(note => (
                    <div key={note.id} className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-2 relative group">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-bold text-slate-800">{note.autor}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono bg-white border border-slate-100 px-2 py-0.5 rounded text-[10px]">
                            {new Date(note.fecha).toLocaleString('es-ES')}
                          </span>
                          <button
                            onClick={() => onDeleteNota(note.id)}
                            className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                            title="Eliminar nota"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{note.contenido}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-slate-400 italic">
                    No hay anotaciones registradas en la bitácora comercial de este proveedor.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
