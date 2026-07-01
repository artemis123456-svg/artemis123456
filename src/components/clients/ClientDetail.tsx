import React, { useState, useMemo } from 'react';
import { 
  Client, 
  Obra, 
  Presupuesto, 
  Factura, 
  Documento, 
  Nota, 
  HistorialEntry 
} from '../../types/client';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Badge } from '@/src/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from '@/src/components/ui/dialog';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead
} from '@/src/components/ui/table';
import { 
  ArrowLeft, 
  Pencil, 
  Plus, 
  Upload, 
  Building2, 
  FileCheck, 
  Receipt, 
  FolderOpen, 
  MessageSquare, 
  History, 
  Info,
  Calendar,
  MapPin,
  Mail,
  Phone,
  CreditCard,
  Building,
  DollarSign,
  FileText,
  User,
  Clock,
  ExternalLink,
  Trash2,
  File,
  Sparkles
} from 'lucide-react';

interface ClientDetailProps {
  client: Client;
  obras: Obra[];
  presupuestos: Presupuesto[];
  facturas: Factura[];
  documentos: Documento[];
  notas: Nota[];
  historial: HistorialEntry[];
  onBack: () => void;
  onEdit: (client: Client) => void;
  onAddObra: (clientId: string, obra: Omit<Obra, 'id' | 'codigo' | 'clientId'>) => void;
  onAddPresupuesto: (clientId: string, presupuesto: Omit<Presupuesto, 'id' | 'codigo' | 'clientId'>) => void;
  onAddDocumento: (clientId: string, doc: Omit<Documento, 'id' | 'fechaSubida' | 'clientId'>) => void;
  onAddNota: (clientId: string, contenido: string, autor: string) => void;
  
  // Quick status updates
  onUpdateObraStatus?: (id: string, status: Obra['estado']) => void;
  onUpdatePresupuestoStatus?: (id: string, status: Presupuesto['estado']) => void;
  onUpdateFacturaStatus?: (id: string, status: Factura['estado']) => void;
}

type TabType = 'generales' | 'obras' | 'presupuestos' | 'facturas' | 'documentos' | 'notas' | 'historial';

export default function ClientDetail({
  client,
  obras,
  presupuestos,
  facturas,
  documentos,
  notas,
  historial,
  onBack,
  onEdit,
  onAddObra,
  onAddPresupuesto,
  onAddDocumento,
  onAddNota,
  onUpdateObraStatus,
  onUpdatePresupuestoStatus,
  onUpdateFacturaStatus
}: ClientDetailProps) {
  
  const [activeTab, setActiveTab] = useState<TabType>('generales');

  // Dialog open states
  const [isObraModalOpen, setIsObraModalOpen] = useState(false);
  const [isPresupuestoModalOpen, setIsPresupuestoModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  // New Obra Fields
  const [obraTitulo, setObraTitulo] = useState('');
  const [obraDireccion, setObraDireccion] = useState('');
  const [obraPresupuesto, setObraPresupuesto] = useState('');
  const [obraEstado, setObraEstado] = useState<Obra['estado']>('En obra');
  const [obraTipoReforma, setObraTipoReforma] = useState<Obra['tipoReforma']>('Integral');
  const [obraFecha, setObraFecha] = useState('');

  // New Presupuesto Fields
  const [presTitulo, setPresTitulo] = useState('');
  const [presImporte, setPresImporte] = useState('');
  const [presObraId, setPresObraId] = useState('');
  const [presEstado, setPresEstado] = useState<Presupuesto['estado']>('Borrador');

  // New Doc Fields
  const [docNombre, setDocNombre] = useState('');
  const [docFileObj, setDocFileObj] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // New Note Field
  const [newNoteContent, setNewNoteContent] = useState('');

  // Derived client details
  const clientObras = useMemo(() => obras.filter(o => o.clientId === client.id), [obras, client.id]);
  const clientPresupuestos = useMemo(() => presupuestos.filter(p => p.clientId === client.id), [presupuestos, client.id]);
  const clientFacturas = useMemo(() => facturas.filter(f => f.clientId === client.id), [facturas, client.id]);
  const clientDocumentos = useMemo(() => documentos.filter(d => d.clientId === client.id), [documentos, client.id]);
  const clientNotas = useMemo(() => notas.filter(n => n.clientId === client.id), [notas, client.id]);
  const clientHistorial = useMemo(() => historial.filter(h => h.clientId === client.id), [historial, client.id]);

  // Financial calculations
  const stats = useMemo(() => {
    const totalInvoiced = clientFacturas.reduce((sum, f) => sum + f.total, 0);
    const totalCollected = clientFacturas.filter(f => f.estado === 'Cobrada').reduce((sum, f) => sum + f.total, 0);
    const pendingCollected = clientFacturas.filter(f => f.estado === 'Emitida' || f.estado === 'Vencida').reduce((sum, f) => sum + f.total, 0);
    const totalBudgets = clientPresupuestos.reduce((sum, p) => sum + p.importe, 0);
    const acceptedBudgets = clientPresupuestos.filter(p => p.estado === 'Aceptado').reduce((sum, p) => sum + p.importe, 0);

    return {
      totalInvoiced,
      totalCollected,
      pendingCollected,
      totalBudgets,
      acceptedBudgets
    };
  }, [clientFacturas, clientPresupuestos]);

  // Submit handlers
  const handleCreateObraSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!obraTitulo.trim()) return;

    onAddObra(client.id, {
      titulo: obraTitulo.trim(),
      direccion: obraDireccion.trim() || client.direccion,
      tipoReforma: obraTipoReforma,
      metrosCuadrados: 0,
      fechaInicioPrevista: obraFecha || new Date().toISOString().split('T')[0],
      fechaInicioReal: null,
      fechaFinPrevista: null,
      fechaFinReal: null,
      estado: obraEstado,
      importe: Number(obraPresupuesto) || 0
    });

    // Reset
    setObraTitulo('');
    setObraDireccion('');
    setObraPresupuesto('');
    setObraEstado('En obra');
    setObraTipoReforma('Integral');
    setObraFecha('');
    setIsObraModalOpen(false);
  };

  const handleCreatePresupuestoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presTitulo.trim() || !presImporte) return;

    onAddPresupuesto(client.id, {
      titulo: presTitulo.trim(),
      importe: Number(presImporte) || 0,
      obraId: presObraId || undefined,
      estado: presEstado,
      fechaEmision: new Date().toISOString().split('T')[0]
    });

    // Reset
    setPresTitulo('');
    setPresImporte('');
    setPresObraId('');
    setPresEstado('Borrador');
    setIsPresupuestoModalOpen(false);
  };

  const handleAddDocumentoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = docNombre.trim() || (docFileObj ? docFileObj.name : 'Documento_Adjunto.pdf');
    if (!finalName) return;

    // Estimate file size
    const finalSize = docFileObj 
      ? `${(docFileObj.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${(Math.random() * 5 + 0.2).toFixed(1)} MB`;

    const finalType = finalName.split('.').pop()?.toUpperCase() || 'PDF';

    onAddDocumento(client.id, {
      nombre: finalName,
      tipo: finalType,
      tamano: finalSize
    });

    // Reset
    setDocNombre('');
    setDocFileObj(null);
    setIsDocModalOpen(false);
  };

  // Drag & drop handlers
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setDocFileObj(file);
      setDocNombre(file.name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setDocFileObj(file);
      setDocNombre(file.name);
    }
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    onAddNota(client.id, newNoteContent.trim(), 'Gestor Verini (Móvil)');
    setNewNoteContent('');
  };

  // Status color mappings
  const renderStatusBadge = (estado: Client['estado']) => {
    switch (estado) {
      case 'Activo':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/10">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Cliente Activo
          </span>
        );
      case 'Inactivo':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-600/10">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Ficha Inactiva
          </span>
        );
      case 'Potencial':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-600/10">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Lead Potencial
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button & edit button row */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-slate-500 hover:text-slate-900 gap-1.5 h-8 text-xs px-2.5 rounded-lg border border-slate-200 bg-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al listado
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(client)}
            className="h-8 text-xs font-semibold text-slate-700 border-slate-200 bg-white rounded-lg hover:bg-slate-50 gap-1.5"
          >
            <Pencil className="h-3.5 w-3.5 text-slate-400" />
            Editar Datos
          </Button>
        </div>
      </div>

      {/* CRM Client Header Card */}
      <div className="bg-white rounded-xl border border-slate-150 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-800 border border-gray-100 font-bold text-lg shadow-sm">
            {client.nombre.charAt(0)}{client.apellidos.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-semibold tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                {client.codigo}
              </span>
              {renderStatusBadge(client.estado)}
            </div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">
              {client.nombre} {client.apellidos}
            </h1>
            {client.empresa && client.empresa !== 'Particular' && (
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Building className="h-3.5 w-3.5" />
                {client.empresa} (NIF/CIF: {client.nifCif})
              </p>
            )}
          </div>
        </div>

        {/* Dynamic Action Buttons on Header */}
        <div className="flex items-center gap-2 flex-wrap md:justify-end">
          <Button
            size="sm"
            onClick={() => setIsObraModalOpen(true)}
            className="h-8.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-lg gap-1.5 px-3"
          >
            <Plus className="h-3.5 w-3.5" />
            Crear Obra
          </Button>

          <Button
            size="sm"
            onClick={() => setIsPresupuestoModalOpen(true)}
            className="h-8.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg gap-1.5 px-3"
          >
            <FileText className="h-3.5 w-3.5" />
            Crear Presupuesto
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsDocModalOpen(true)}
            className="h-8.5 text-xs font-semibold text-slate-700 border-slate-200 bg-white rounded-lg hover:bg-slate-50 gap-1.5 px-3"
          >
            <Upload className="h-3.5 w-3.5 text-slate-400" />
            Subir Documento
          </Button>
        </div>
      </div>

      {/* Financial Mini Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Obras Registradas</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-slate-900">{clientObras.length}</span>
            <span className="text-xs text-slate-400">obras</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Presupuestado</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-slate-900">{stats.totalBudgets.toLocaleString('es-ES')} €</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Total Cobrado</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-emerald-600">{stats.totalCollected.toLocaleString('es-ES')} €</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Pendiente de Cobro</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-amber-600">{stats.pendingCollected.toLocaleString('es-ES')} €</span>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="space-y-4">
        {/* Tab Headers */}
        <div className="flex items-center border-b border-slate-200 overflow-x-auto no-scrollbar py-0.5 gap-1">
          {[
            { id: 'generales', label: 'Datos generales', icon: Info },
            { id: 'obras', label: `Obras (${clientObras.length})`, icon: Building2 },
            { id: 'presupuestos', label: `Presupuestos (${clientPresupuestos.length})`, icon: FileCheck },
            { id: 'facturas', label: `Facturas (${clientFacturas.length})`, icon: Receipt },
            { id: 'documentos', label: `Documentos (${clientDocumentos.length})`, icon: FolderOpen },
            { id: 'notas', label: `Notas (${clientNotas.length})`, icon: MessageSquare },
            { id: 'historial', label: 'Historial', icon: History }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all shrink-0 select-none whitespace-nowrap
                  ${isActive 
                    ? 'border-gray-900 text-gray-800 font-bold' 
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-gray-900' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="bg-white rounded-xl border border-slate-150 p-6 shadow-sm min-h-[300px]">
          
          {/* TAB 1: DATOS GENERALES */}
          {activeTab === 'generales' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Col 1: Contact Details */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-1">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    Contacto Principal
                  </h4>

                  <ul className="space-y-3 text-xs">
                    <li className="flex items-center gap-3">
                      <span className="font-semibold text-slate-400 w-24">Nombre:</span>
                      <span className="text-slate-800 font-medium">{client.nombre} {client.apellidos}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="font-semibold text-slate-400 w-24">Empresa:</span>
                      <span className="text-slate-800 font-medium">{client.empresa || 'Particular'}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="font-semibold text-slate-400 w-24">NIF/CIF:</span>
                      <span className="text-slate-800 font-mono font-medium">{client.nifCif || '-'}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="font-semibold text-slate-400 w-24">Teléfono Fijo:</span>
                      <span className="text-slate-800 font-mono font-medium">{client.telefono || '-'}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="font-semibold text-slate-400 w-24">Móvil:</span>
                      <span className="text-slate-800 font-mono font-medium">{client.movil || '-'}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="font-semibold text-slate-400 w-24">Email:</span>
                      <span className="text-gray-900 hover:underline font-sans font-medium">
                        {client.email ? <a href={`mailto:${client.email}`}>{client.email}</a> : '-'}
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Col 2: Location and Bank details */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    Ubicación y Facturación
                  </h4>

                  <ul className="space-y-3 text-xs">
                    <li className="flex items-start gap-3">
                      <span className="font-semibold text-slate-400 w-24">Dirección:</span>
                      <span className="text-slate-800 leading-tight font-medium">{client.direccion || '-'}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="font-semibold text-slate-400 w-24">Código Postal:</span>
                      <span className="text-slate-800 font-mono font-medium">{client.codigoPostal || '-'}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="font-semibold text-slate-400 w-24">Ciudad:</span>
                      <span className="text-slate-800 font-medium">{client.ciudad || '-'}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="font-semibold text-slate-400 w-24">Provincia:</span>
                      <span className="text-slate-800 font-medium">{client.provincia || '-'}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="font-semibold text-slate-400 w-24">IBAN Banco:</span>
                      <span className="text-slate-800 font-mono tracking-wider font-medium">
                        {client.iban ? client.iban.replace(/(.{4})/g, '$1 ') : '-'}
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="font-semibold text-slate-400 w-24">Registrado:</span>
                      <span className="text-slate-500 font-medium">
                        {new Date(client.createdAt).toLocaleString('es-ES', { dateStyle: 'long' })}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* RGPD & Origen */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                {/* Fuente de Captación */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-1">
                    <Sparkles className="h-3.5 w-3.5 text-gray-700" />
                    Origen y Captación
                  </h4>
                  <ul className="space-y-3 text-xs">
                    <li className="flex items-center gap-3">
                      <span className="font-semibold text-slate-400 w-36">Fuente del Lead:</span>
                      <span className="text-slate-800 font-medium">{client.fuenteLead || 'Otro'}</span>
                    </li>
                  </ul>
                </div>

                {/* Consentimiento RGPD */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-1">
                    <FileText className="h-3.5 w-3.5 text-gray-700" />
                    Consentimiento RGPD
                  </h4>
                  <ul className="space-y-3 text-xs">
                    <li className="flex items-center gap-3">
                      <span className="font-semibold text-slate-400 w-36">Estado:</span>
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${client.consentimientoRGPD ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10' : 'bg-red-50 text-red-700 ring-red-600/10'}`}>
                        {client.consentimientoRGPD ? 'Sí (Aceptado)' : 'No (Pendiente)'}
                      </span>
                    </li>
                    {client.consentimientoRGPD && client.fechaConsentimiento && (
                      <li className="flex items-center gap-3">
                        <span className="font-semibold text-slate-400 w-36">Fecha de consentimiento:</span>
                        <span className="text-slate-700 font-medium">
                          {new Date(client.fechaConsentimiento).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Remarks */}
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                  Observaciones Comerciales
                </h4>
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs text-slate-700 leading-relaxed italic">
                  {client.observaciones || 'No hay observaciones adicionales cargadas en este cliente.'}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OBRAS */}
          {activeTab === 'obras' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Obras y Centros de Trabajo</h3>
                <Button 
                  size="sm" 
                  onClick={() => setIsObraModalOpen(true)}
                  className="bg-gray-900 hover:bg-gray-800 text-white text-xs h-8 gap-1 rounded-lg"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Añadir Obra
                </Button>
              </div>

              {clientObras.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {clientObras.map(obra => (
                    <div key={obra.id} className="border border-slate-200 rounded-xl p-4 space-y-3 hover:border-slate-300 hover:shadow-sm transition-all bg-slate-50/50">
                      <div className="flex items-start justify-between">
                        <div className="space-y-0.5">
                          <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{obra.codigo}</span>
                          <h4 className="text-xs font-bold text-slate-950 leading-snug">{obra.titulo}</h4>
                        </div>
                        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold leading-none
                          ${obra.estado === 'En obra' ? 'bg-gray-100 text-gray-800 ring-1 ring-gray-900/10' :
                            obra.estado === 'Aceptada' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/10' :
                            obra.estado === 'Entregada' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10' :
                            'bg-slate-100 text-slate-600 ring-1 ring-slate-600/10'}`}
                        >
                          {obra.estado}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-[11px] text-slate-600 border-t border-slate-150 pt-2.5">
                        <p className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{obra.direccion}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>Inicio: {obra.fechaInicioPrevista ? new Date(obra.fechaInicioPrevista).toLocaleDateString('es-ES') : 'Sin fecha'}</span>
                        </p>
                        <p className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <DollarSign className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>Ppto: {obra.importe.toLocaleString('es-ES')} €</span>
                        </p>
                      </div>

                      {onUpdateObraStatus && (
                        <div className="flex items-center gap-1.5 justify-end border-t border-slate-100 pt-2.5 text-[11px]">
                          <span className="text-slate-400 text-[10px] font-medium mr-1">Cambiar estado:</span>
                          {(['Presupuesto', 'Aceptada', 'En obra', 'Entregada'] as Obra['estado'][]).map((st) => (
                            <button
                              key={st}
                              disabled={obra.estado === st}
                              onClick={() => onUpdateObraStatus(obra.id, st)}
                              className={`px-1.5 py-0.5 rounded text-[9px] font-semibold transition-colors
                                ${obra.estado === st 
                                  ? 'bg-slate-200 text-slate-700 font-bold' 
                                  : 'text-gray-900 hover:bg-gray-100'}`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Building2 className="h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-xs font-semibold text-slate-600 mb-1">No hay obras registradas</p>
                  <p className="text-[11px] text-slate-400 max-w-xs mb-3">Registra centros de trabajo u obras vinculadas a este cliente.</p>
                  <Button 
                    size="xs" 
                    onClick={() => setIsObraModalOpen(true)}
                    className="bg-gray-900 text-white text-[11px] h-7"
                  >
                    Añadir Primera Obra
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PRESUPUESTOS */}
          {activeTab === 'presupuestos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Historial de Presupuestos</h3>
                <Button 
                  size="sm" 
                  onClick={() => setIsPresupuestoModalOpen(true)}
                  className="bg-gray-900 hover:bg-gray-800 text-white text-xs h-8 gap-1 rounded-lg"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Añadir Presupuesto
                </Button>
              </div>

              {clientPresupuestos.length > 0 ? (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <Table className="w-full">
                    <TableHeader className="bg-slate-50 text-[11px] font-semibold text-slate-600 border-b border-slate-200">
                      <TableRow>
                        <TableHead className="px-4 py-2.5">Código</TableHead>
                        <TableHead className="px-4 py-2.5">Título / Descripción</TableHead>
                        <TableHead className="px-4 py-2.5">Obra Asociada</TableHead>
                        <TableHead className="px-4 py-2.5">Fecha Emisión</TableHead>
                        <TableHead className="px-4 py-2.5">Importe</TableHead>
                        <TableHead className="px-4 py-2.5">Estado</TableHead>
                        {onUpdatePresupuestoStatus && <TableHead className="px-4 py-2.5 text-right">Fase</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientPresupuestos.map(pres => {
                        const linkedObra = obras.find(o => o.id === pres.obraId);
                        return (
                          <TableRow key={pres.id} className="border-b border-slate-100 text-xs hover:bg-slate-50/50">
                            <TableCell className="px-4 py-3 font-mono font-semibold text-slate-900">{pres.codigo}</TableCell>
                            <TableCell className="px-4 py-3 font-medium text-slate-800">{pres.titulo}</TableCell>
                            <TableCell className="px-4 py-3 text-slate-500">
                              {linkedObra ? (
                                <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                                  <Building2 className="h-3 w-3 text-gray-700" />
                                  {linkedObra.titulo}
                                </span>
                              ) : 'General / Sin obra'}
                            </TableCell>
                            <TableCell className="px-4 py-3 font-mono text-slate-500">{new Date(pres.fechaEmision).toLocaleDateString('es-ES')}</TableCell>
                            <TableCell className="px-4 py-3 font-semibold text-slate-900 font-mono">{pres.importe.toLocaleString('es-ES')} €</TableCell>
                            <TableCell className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold leading-none
                                ${pres.estado === 'Aceptado' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10' :
                                  pres.estado === 'Enviado' ? 'bg-gray-100 text-gray-800 ring-1 ring-gray-900/10' :
                                  pres.estado === 'Rechazado' ? 'bg-red-50 text-red-700 ring-1 ring-red-600/10' :
                                  'bg-slate-100 text-slate-600 ring-1 ring-slate-600/10'}`}
                              >
                                {pres.estado}
                              </span>
                            </TableCell>
                            {onUpdatePresupuestoStatus && (
                              <TableCell className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex justify-end gap-1">
                                  {(['Borrador', 'Enviado', 'Aceptado', 'Rechazado'] as Presupuesto['estado'][]).map(st => (
                                    <button
                                      key={st}
                                      disabled={pres.estado === st}
                                      onClick={() => onUpdatePresupuestoStatus(pres.id, st)}
                                      className={`px-1 py-0.5 rounded text-[9px] font-semibold transition-colors
                                        ${pres.estado === st 
                                          ? 'bg-slate-200 text-slate-700 font-bold' 
                                          : 'text-gray-900 hover:bg-gray-100'}`}
                                    >
                                      {st}
                                    </button>
                                  ))}
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <FileCheck className="h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-xs font-semibold text-slate-600 mb-1">No hay presupuestos</p>
                  <p className="text-[11px] text-slate-400 max-w-xs mb-3">Redacta propuestas comerciales e importes estimativos para el cliente.</p>
                  <Button 
                    size="xs" 
                    onClick={() => setIsPresupuestoModalOpen(true)}
                    className="bg-gray-900 text-white text-[11px] h-7"
                  >
                    Crear Presupuesto
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: FACTURAS */}
          {activeTab === 'facturas' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Estado de Facturación</h3>
                <div className="text-xs text-slate-400">
                  * Las facturas se generan automáticamente al marcar presupuestos como <span className="text-emerald-600 font-semibold">Aceptados</span>.
                </div>
              </div>

              {clientFacturas.length > 0 ? (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <Table className="w-full">
                    <TableHeader className="bg-slate-50 text-[11px] font-semibold text-slate-600 border-b border-slate-200">
                      <TableRow>
                        <TableHead className="px-4 py-2.5">Código</TableHead>
                        <TableHead className="px-4 py-2.5">Concepto</TableHead>
                        <TableHead className="px-4 py-2.5">Fecha Emisión</TableHead>
                        <TableHead className="px-4 py-2.5">Vencimiento</TableHead>
                        <TableHead className="px-4 py-2.5">Base Imponible</TableHead>
                        <TableHead className="px-4 py-2.5">Total (con IVA)</TableHead>
                        <TableHead className="px-4 py-2.5">Estado</TableHead>
                        {onUpdateFacturaStatus && <TableHead className="px-4 py-2.5 text-right">Acciones</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientFacturas.map(fac => (
                        <TableRow key={fac.id} className="border-b border-slate-100 text-xs hover:bg-slate-50/50">
                          <TableCell className="px-4 py-3 font-mono font-semibold text-slate-900">{fac.codigo}</TableCell>
                          <TableCell className="px-4 py-3 font-medium text-slate-850">{fac.titulo}</TableCell>
                          <TableCell className="px-4 py-3 font-mono text-slate-500">{new Date(fac.fechaEmision).toLocaleDateString('es-ES')}</TableCell>
                          <TableCell className="px-4 py-3 font-mono text-slate-500">{new Date(fac.fechaVencimiento).toLocaleDateString('es-ES')}</TableCell>
                          <TableCell className="px-4 py-3 font-mono text-slate-500">{fac.baseImponible.toLocaleString('es-ES')} €</TableCell>
                          <TableCell className="px-4 py-3 font-semibold text-slate-950 font-mono">{fac.total.toLocaleString('es-ES')} €</TableCell>
                          <TableCell className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold leading-none
                              ${fac.estado === 'Cobrada' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10' :
                                fac.estado === 'Emitida' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/10' :
                                fac.estado === 'Vencida' ? 'bg-red-50 text-red-700 ring-1 ring-red-600/10' :
                                'bg-slate-100 text-slate-600 ring-1 ring-slate-600/10'}`}
                            >
                              {fac.estado}
                            </span>
                          </TableCell>
                          {onUpdateFacturaStatus && (
                            <TableCell className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex justify-end gap-1">
                                {(['Emitida', 'Cobrada', 'Vencida'] as Factura['estado'][]).map(st => (
                                  <button
                                    key={st}
                                    disabled={fac.estado === st}
                                    onClick={() => onUpdateFacturaStatus(fac.id, st)}
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-semibold transition-colors
                                      ${fac.estado === st 
                                        ? 'bg-slate-200 text-slate-700 font-bold' 
                                        : 'text-gray-900 hover:bg-gray-100'}`}
                                  >
                                    {st === 'Cobrada' ? 'Marcar Cobrada' : st}
                                  </button>
                                ))}
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Receipt className="h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-xs font-semibold text-slate-600 mb-1">No hay facturas emitidas</p>
                  <p className="text-[11px] text-slate-400 max-w-sm">Para emitir una factura, crea un presupuesto y configúralo como &quot;Aceptado&quot; para simular la emisión automática de su certificación.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: DOCUMENTOS */}
          {activeTab === 'documentos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Documentos Adjuntos</h3>
                <Button 
                  size="sm" 
                  onClick={() => setIsDocModalOpen(true)}
                  className="bg-gray-900 hover:bg-gray-800 text-white text-xs h-8 gap-1 rounded-lg"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Subir Documento
                </Button>
              </div>

              {/* Drag and Drop Simulator Panel */}
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-2
                  ${isDragging ? 'border-gray-700 bg-gray-100/50' : 'border-slate-200 hover:bg-slate-50/50'}`}
                onClick={() => setIsDocModalOpen(true)}
              >
                <div className="p-2 bg-gray-100 text-gray-900 rounded-full">
                  <Upload className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700">Arrastra archivos aquí o haz clic para examinar</p>
                <p className="text-[10px] text-slate-400">Archivos PDF, ZIP, DWG, PNG hasta 50MB</p>
              </div>

              {/* Document list */}
              {clientDocumentos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {clientDocumentos.map(doc => {
                    const isPDF = doc.tipo.toLowerCase() === 'pdf';
                    const isZIP = doc.tipo.toLowerCase() === 'zip';
                    return (
                      <div key={doc.id} className="border border-slate-200 rounded-xl p-3 flex items-center justify-between bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className={`p-2 shrink-0 rounded-lg text-xs font-bold font-mono
                            ${isPDF ? 'bg-red-50 text-red-600 border border-red-100' :
                              isZIP ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                              'bg-gray-100 text-gray-900 border border-gray-100'}`}
                          >
                            {doc.tipo}
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-xs font-semibold text-slate-850 truncate" title={doc.nombre}>{doc.nombre}</span>
                            <span className="text-[10px] text-slate-400 font-mono leading-none">{doc.tamano} • {new Date(doc.fechaSubida).toLocaleDateString('es-ES')}</span>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => window.open('https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800')}
                          title="Descargar"
                          className="h-8 w-8 text-slate-400 hover:text-gray-900 hover:bg-gray-100 shrink-0"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-400 italic">
                  No hay documentos subidos en esta ficha todavía.
                </div>
              )}
            </div>
          )}

          {/* TAB 6: NOTAS */}
          {activeTab === 'notas' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">Anotaciones y Comentarios Internos</h3>

              {/* Note input form */}
              <form onSubmit={handleAddNoteSubmit} className="space-y-2">
                <textarea
                  placeholder="Redacta un nuevo comentario en la ficha..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  rows={3}
                  className="w-full text-xs rounded-lg border border-slate-200 bg-white p-2.5 outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700/20"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={!newNoteContent.trim()}
                    className="h-8 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-lg shadow-sm gap-1.5 px-3 transition-all"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Publicar Nota
                  </Button>
                </div>
              </form>

              {/* Note Timeline */}
              {clientNotas.length > 0 ? (
                <div className="space-y-4 mt-6 pt-4 border-t border-slate-100">
                  {clientNotas.map((nota) => (
                    <div key={nota.id} className="bg-slate-50/50 border border-slate-150 rounded-xl p-4 space-y-2 relative">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <User className="h-3.5 w-3.5 text-gray-700 shrink-0" />
                          {nota.autor}
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="h-3 w-3" />
                          {new Date(nota.fechaCreacion).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">{nota.contenido}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-400 italic">
                  Aún no hay comentarios en la bitácora de este cliente.
                </div>
              )}
            </div>
          )}

          {/* TAB 7: HISTORIAL */}
          {activeTab === 'historial' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">Historial de Auditoría</h3>
              
              {clientHistorial.length > 0 ? (
                <div className="relative border-l border-slate-200 pl-4 ml-2 space-y-6 py-2">
                  {clientHistorial.map((entry) => (
                    <div key={entry.id} className="relative group">
                      {/* Timeline dot */}
                      <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-gray-700 ring-4 ring-white border border-gray-900 transition-colors duration-150 group-hover:bg-gray-900" />
                      
                      <div className="space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-1">
                          <span className="font-bold text-slate-800 text-xs flex items-center gap-1">
                            <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            {entry.accion}
                          </span>
                          <span className="font-mono bg-slate-50 border border-slate-100 px-2 py-0.5 rounded text-[10px]">
                            {new Date(entry.fecha).toLocaleString('es-ES')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-sans">{entry.detalle}</p>
                        <p className="text-[10px] text-slate-400 font-medium">Realizado por: <span className="font-semibold">{entry.usuario}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-400 italic">
                  No hay registros en el historial de auditoría.
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* DIALOGS FOR ACTIONS */}
      
      {/* 1. Modal Crear Obra */}
      <Dialog open={isObraModalOpen} onOpenChange={setIsObraModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateObraSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900">Crear Nueva Obra</DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Registra un centro de coste y obra vinculada a {client.nombre} {client.apellidos}.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4 text-xs">
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right font-semibold text-slate-500">Título *</label>
                <Input 
                  required
                  placeholder="ej. Reforma Local Comercial" 
                  value={obraTitulo}
                  onChange={e => setObraTitulo(e.target.value)}
                  className="col-span-3 text-xs h-9" 
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right font-semibold text-slate-500">Dirección</label>
                <Input 
                  placeholder="ej. Calle Fuencarral 34, Madrid" 
                  value={obraDireccion}
                  onChange={e => setObraDireccion(e.target.value)}
                  className="col-span-3 text-xs h-9" 
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right font-semibold text-slate-500">Tipo de Reforma</label>
                <select 
                  value={obraTipoReforma} 
                  onChange={e => setObraTipoReforma(e.target.value as any)}
                  className="col-span-3 text-xs rounded-lg border border-slate-200 bg-white p-2.5 outline-none focus:border-gray-700"
                >
                  <option value="Cocina">Cocina</option>
                  <option value="Baño">Baño</option>
                  <option value="Integral">Integral</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right font-semibold text-slate-500">Importe (€)</label>
                <Input 
                  type="number"
                  placeholder="65000" 
                  value={obraPresupuesto}
                  onChange={e => setObraPresupuesto(e.target.value)}
                  className="col-span-3 text-xs h-9" 
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right font-semibold text-slate-500">Fase Inicial</label>
                <select 
                  value={obraEstado} 
                  onChange={e => setObraEstado(e.target.value as any)}
                  className="col-span-3 text-xs rounded-lg border border-slate-200 bg-white p-2.5 outline-none focus:border-gray-700"
                >
                  <option value="Presupuesto">Presupuesto</option>
                  <option value="Aceptada">Aceptada</option>
                  <option value="En obra">En obra</option>
                  <option value="Entregada">Entregada</option>
                </select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right font-semibold text-slate-500">Fecha Inicio</label>
                <Input 
                  type="date"
                  value={obraFecha}
                  onChange={e => setObraFecha(e.target.value)}
                  className="col-span-3 text-xs h-9" 
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2 justify-end pt-2 border-t border-slate-100">
              <Button type="button" variant="ghost" onClick={() => setIsObraModalOpen(false)} className="text-xs h-8">
                Cancelar
              </Button>
              <Button type="submit" className="bg-gray-900 hover:bg-gray-800 text-white text-xs h-8 px-4">
                Crear Obra
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. Modal Crear Presupuesto */}
      <Dialog open={isPresupuestoModalOpen} onOpenChange={setIsPresupuestoModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreatePresupuestoSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900">Generar Presupuesto Comercial</DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Añade una propuesta de presupuesto para {client.nombre} {client.apellidos}.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4 text-xs">
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right font-semibold text-slate-500">Título *</label>
                <Input 
                  required
                  placeholder="ej. Suministro y colocación de tabiquería" 
                  value={presTitulo}
                  onChange={e => setPresTitulo(e.target.value)}
                  className="col-span-3 text-xs h-9" 
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right font-semibold text-slate-500">Importe (€) *</label>
                <Input 
                  required
                  type="number"
                  placeholder="25000" 
                  value={presImporte}
                  onChange={e => setPresImporte(e.target.value)}
                  className="col-span-3 text-xs h-9" 
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right font-semibold text-slate-500">Obra Vinculada</label>
                <select 
                  value={presObraId} 
                  onChange={e => setPresObraId(e.target.value)}
                  className="col-span-3 text-xs rounded-lg border border-slate-200 bg-white p-2.5 outline-none focus:border-gray-700"
                >
                  <option value="">General / Sin obra asignada</option>
                  {clientObras.map(o => (
                    <option key={o.id} value={o.id}>{o.codigo} - {o.titulo}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right font-semibold text-slate-500">Estado inicial</label>
                <select 
                  value={presEstado} 
                  onChange={e => setPresEstado(e.target.value as any)}
                  className="col-span-3 text-xs rounded-lg border border-slate-200 bg-white p-2.5 outline-none focus:border-gray-700"
                >
                  <option value="Borrador">Borrador</option>
                  <option value="Enviado">Enviado</option>
                  <option value="Aceptado">Aceptado (Genera factura automática)</option>
                  <option value="Rechazado">Rechazado</option>
                </select>
              </div>
            </div>

            <DialogFooter className="flex gap-2 justify-end pt-2 border-t border-slate-100">
              <Button type="button" variant="ghost" onClick={() => setIsPresupuestoModalOpen(false)} className="text-xs h-8">
                Cancelar
              </Button>
              <Button type="submit" className="bg-gray-900 hover:bg-gray-800 text-white text-xs h-8 px-4">
                Generar Presupuesto
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 3. Modal Subir Documento */}
      <Dialog open={isDocModalOpen} onOpenChange={setIsDocModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleAddDocumentoSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900">Subir Documento Comercial o Plano</DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Selecciona o nombra el archivo que deseas adjuntar a {client.nombre} {client.apellidos}.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4 text-xs">
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right font-semibold text-slate-500">Examinar</label>
                <input 
                  type="file" 
                  onChange={handleFileChange}
                  className="col-span-3 text-xs p-1"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right font-semibold text-slate-500">Nombre Archivo</label>
                <Input 
                  placeholder="ej. Plano_Instalacion_Electrica.pdf" 
                  value={docNombre}
                  onChange={e => setDocNombre(e.target.value)}
                  className="col-span-3 text-xs h-9" 
                />
              </div>
            </div>

            <DialogFooter className="flex gap-2 justify-end pt-2 border-t border-slate-100">
              <Button type="button" variant="ghost" onClick={() => setIsDocModalOpen(false)} className="text-xs h-8">
                Cancelar
              </Button>
              <Button type="submit" className="bg-gray-900 hover:bg-gray-800 text-white text-xs h-8 px-4">
                Adjuntar Archivo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
