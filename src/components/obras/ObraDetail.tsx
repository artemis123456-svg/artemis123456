import React, { useState, useMemo } from 'react';
import { Obra, HoraObra } from '../../types/obra';
import { Client } from '../../types/client';
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
  Package,
  ReceiptText,
  AlertCircle
} from 'lucide-react';
import { useProveedores } from '../../hooks/useProveedores';
import { useFacturasProveedor } from '../../hooks/useFacturasProveedor';

interface ObraDetailProps {
  obra: Obra;
  client: Client | null;
  onBack: () => void;
  onEdit: (obra: Obra) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: Obra['estado']) => void;
  fetchHorasObra: (obraId: string) => Promise<HoraObra[]>;
  addHoraObra: (horaData: Omit<HoraObra, 'id'>) => Promise<HoraObra>;
  deleteHoraObra: (id: string) => Promise<void>;
}

type TabType = 'generales' | 'presupuestos' | 'facturas' | 'documentos' | 'notas' | 'horas' | 'materiales';

interface MockDocument {
  id: string;
  nombre: string;
  tipo: string;
  tamano: string;
  fechaSubida: string;
}

interface MockNote {
  id: string;
  contenido: string;
  fechaCreacion: string;
  autor: string;
}

export default function ObraDetail({
  obra,
  client,
  onBack,
  onEdit,
  onDelete,
  onUpdateStatus,
  fetchHorasObra,
  addHoraObra,
  deleteHoraObra
}: ObraDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>('generales');

  const { proveedores } = useProveedores();
  const { getMaterialLinesByObraId } = useFacturasProveedor();
  const [materialLines, setMaterialLines] = useState<any[]>([]);
  const [materialLinesLoading, setMaterialLinesLoading] = useState(false);

  // Local state for interactive note and document additions within this session
  const [localNotes, setLocalNotes] = useState<MockNote[]>([
    {
      id: 'n_1',
      contenido: 'Reunión con el cliente para validar materiales. Aprueba el microcemento para el suelo y los azulejos de formato grande.',
      fechaCreacion: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      autor: 'Laura Domenech (Gestora de Proyectos)'
    },
    {
      id: 'n_2',
      contenido: 'La carpintería metálica de las ventanas se retrasará 4 días por falta de perfilería del proveedor habitual.',
      fechaCreacion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      autor: 'Carlos Ibáñez (Técnico)'
    }
  ]);

  const [localDocs, setLocalDocs] = useState<MockDocument[]>([
    {
      id: 'd_1',
      nombre: `Planos_Instalaciones_${obra.codigo}.pdf`,
      tipo: 'PDF',
      tamano: '2.8 MB',
      fechaSubida: obra.fechaInicioPrevista || '2026-05-15'
    },
    {
      id: 'd_2',
      nombre: `Contrato_Obra_Firmado_${obra.codigo}.pdf`,
      tipo: 'PDF',
      tamano: '3.1 MB',
      fechaSubida: obra.fechaInicioPrevista || '2026-05-18'
    }
  ]);

  const [newNote, setNewNote] = useState('');
  const [newDocName, setNewDocName] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Hours tracking state
  const [horasObraList, setHorasObraList] = useState<HoraObra[]>([]);
  const [horasLoading, setHorasLoading] = useState(false);

  // New hora form state
  const [horaDate, setHoraDate] = useState(new Date().toISOString().split('T')[0]);
  const [horaTrabajador, setHoraTrabajador] = useState('');
  const [horaCantidad, setHoraCantidad] = useState('');
  const [horaTarea, setHoraTarea] = useState('');

  const loadHoras = React.useCallback(async () => {
    try {
      setHorasLoading(true);
      const data = await fetchHorasObra(obra.id);
      setHorasObraList(data);
    } catch (e) {
      console.error(e);
    } finally {
      setHorasLoading(false);
    }
  }, [obra.id, fetchHorasObra]);

  React.useEffect(() => {
    if (activeTab === 'horas') {
      loadHoras();
    }
  }, [activeTab, loadHoras]);

  const loadMaterialLines = React.useCallback(async () => {
    try {
      setMaterialLinesLoading(true);
      const data = await getMaterialLinesByObraId(obra.id);
      setMaterialLines(data);
    } catch (e) {
      console.error(e);
    } finally {
      setMaterialLinesLoading(false);
    }
  }, [obra.id, getMaterialLinesByObraId]);

  React.useEffect(() => {
    if (activeTab === 'materiales') {
      loadMaterialLines();
    }
  }, [activeTab, loadMaterialLines]);

  const handleAddHoraSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!horaTrabajador.trim() || !horaCantidad || !horaTarea.trim()) {
      alert('Por favor complete los campos obligatorios.');
      return;
    }
    try {
      await addHoraObra({
        obraId: obra.id,
        fecha: horaDate,
        trabajador: horaTrabajador.trim(),
        horas: Number(horaCantidad) || 0,
        tarea: horaTarea.trim()
      });
      setHoraTrabajador('');
      setHoraCantidad('');
      setHoraTarea('');
      loadHoras();
    } catch (err) {
      alert('Error al registrar las horas');
    }
  };

  const handleDeleteHoraClick = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este registro de horas?')) return;
    try {
      await deleteHoraObra(id);
      loadHoras();
    } catch (err) {
      alert('Error al eliminar el registro de horas');
    }
  };

  // Generate mock budget list based on the project cost
  const mockPresupuestos = useMemo(() => {
    const importFase1 = Math.round(obra.importe * 0.35);
    const importFase2 = obra.importe - importFase1;
    return [
      {
        id: `m_pre_1`,
        codigo: `PRE-2026-${obra.codigo.replace('OBR-', '')}-1`,
        titulo: 'Fase I: Proyecto Técnico, Licencia y Derribos',
        importe: importFase1,
        estado: 'Aceptado' as const,
        fechaEmision: obra.fechaInicioPrevista || '2026-04-10'
      },
      {
        id: `m_pre_2`,
        codigo: `PRE-2026-${obra.codigo.replace('OBR-', '')}-2`,
        titulo: 'Fase II: Albañilería, Instalaciones y Acabados de obra',
        importe: importFase2,
        estado: obra.estado === 'Presupuesto' ? ('Enviado' as const) : ('Aceptado' as const),
        fechaEmision: obra.fechaInicioPrevista || '2026-04-15'
      }
    ];
  }, [obra]);

  // Generate mock invoices based on budgets and current state
  const mockFacturas = useMemo(() => {
    const list = [];
    const importFase1 = Math.round(obra.importe * 0.35);
    const totalF1 = Math.round(importFase1 * 1.21);

    if (obra.estado !== 'Presupuesto') {
      list.push({
        id: 'm_fac_1',
        codigo: `FAC-2026-${obra.codigo.replace('OBR-', '')}-1`,
        titulo: 'Certificación Obra Nº 1 - Acopio e Inicio',
        baseImponible: importFase1,
        iva: 21,
        total: totalF1,
        estado: 'Cobrada' as const,
        fechaEmision: obra.fechaInicioReal || obra.fechaInicioPrevista || '2026-05-01',
        fechaVencimiento: '2026-06-01'
      });
    }

    if (obra.estado === 'Entregada') {
      const importFase2 = obra.importe - importFase1;
      const totalF2 = Math.round(importFase2 * 1.21);
      list.push({
        id: 'm_fac_2',
        codigo: `FAC-2026-${obra.codigo.replace('OBR-', '')}-2`,
        titulo: 'Certificación de Entrega y Acabados Finales',
        baseImponible: importFase2,
        iva: 21,
        total: totalF2,
        estado: 'Emitida' as const,
        fechaEmision: obra.fechaFinReal || new Date().toISOString().split('T')[0],
        fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }

    return list;
  }, [obra]);

  // Derived financial stats
  const stats = useMemo(() => {
    const totalB = mockPresupuestos.reduce((sum, p) => sum + p.importe, 0);
    const acceptedB = mockPresupuestos.filter(p => p.estado === 'Aceptado').reduce((sum, p) => sum + p.importe, 0);
    const invoiced = mockFacturas.reduce((sum, f) => sum + f.total, 0);
    const collected = mockFacturas.filter(f => f.estado === 'Cobrada').reduce((sum, f) => sum + f.total, 0);

    return {
      totalB,
      acceptedB,
      invoiced,
      collected
    };
  }, [mockPresupuestos, mockFacturas]);

  // Handlers for interactive actions
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const added: MockNote = {
      id: `n_added_${Date.now()}`,
      contenido: newNote.trim(),
      fechaCreacion: new Date().toISOString(),
      autor: 'Usuario de Verini (Tú)'
    };

    setLocalNotes([added, ...localNotes]);
    setNewNote('');
  };

  const handleAddDoc = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = newDocName.trim() || 'Ficha_Tecnica_Material.pdf';

    const added: MockDocument = {
      id: `d_added_${Date.now()}`,
      nombre: finalName.endsWith('.pdf') ? finalName : `${finalName}.pdf`,
      tipo: 'PDF',
      tamano: '1.4 MB',
      fechaSubida: new Date().toISOString().split('T')[0]
    };

    setLocalDocs([added, ...localDocs]);
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
      const added: MockDocument = {
        id: `d_drop_${Date.now()}`,
        nombre: file.name,
        tipo: file.name.split('.').pop()?.toUpperCase() || 'DOCUMENTO',
        tamano: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        fechaSubida: new Date().toISOString().split('T')[0]
      };
      setLocalDocs([added, ...localDocs]);
    }
  };

  // Color mapping for Kanban states
  const badgeStyles: Record<Obra['estado'], string> = {
    Presupuesto: 'bg-slate-100 text-slate-800 ring-slate-600/10 border-slate-200',
    Aceptada: 'bg-verini-blue/10 text-verini-blue ring-verini-blue/20 border-verini-blue/10',
    'En obra': 'bg-verini-yellow/10 text-verini-yellow ring-verini-yellow/20 border-verini-yellow/10',
    Entregada: 'bg-verini-teal/10 text-verini-teal ring-verini-teal/20 border-verini-teal/10',
  };

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation */}
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
                {obra.codigo}
              </span>
              <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold leading-none ${badgeStyles[obra.estado]}`}>
                {obra.estado}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-950 mt-1 tracking-tight">
              {obra.titulo}
            </h2>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(obra)}
            className="border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 gap-1.5 rounded-lg h-9 text-xs font-semibold px-3"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Editar Obra
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('¿Estás seguro de que deseas eliminar esta obra permanentemente?')) {
                onDelete(obra.id);
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
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Importe Obra</span>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-xl font-bold text-slate-950 font-mono">
            {obra.importe.toLocaleString('es-ES')} €
          </p>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Base Imponible contratada</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Metraje</span>
            <Layers className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-xl font-bold text-slate-950 font-mono">
            {obra.metrosCuadrados || '-'} m²
          </p>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
            {obra.metrosCuadrados > 0 ? `${Math.round(obra.importe / obra.metrosCuadrados).toLocaleString('es-ES')} € / m²` : 'Sin metros declarados'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Facturado</span>
            <FileText className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-xl font-bold text-verini-black font-mono">
            {stats.invoiced.toLocaleString('es-ES')} €
          </p>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">Cobrado: {stats.collected.toLocaleString('es-ES')} €</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tipo de Reforma</span>
            <Wrench className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-lg font-bold text-slate-900">
            {obra.tipoReforma}
          </p>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Código de categoría de obra</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-100 overflow-x-auto bg-slate-50/50">
          {(
            [
              { id: 'generales', label: 'Datos Generales', icon: Sparkles },
              { id: 'presupuestos', label: `Presupuestos (${mockPresupuestos.length})`, icon: DollarSign },
              { id: 'facturas', label: `Facturas (${mockFacturas.length})`, icon: FileText },
              { id: 'horas', label: `Control de Horas (${horasObraList.length})`, icon: Clock },
              { id: 'materiales', label: `Gastos de Materiales (${materialLines.length})`, icon: Package },
              { id: 'documentos', label: `Documentación (${localDocs.length})`, icon: Upload },
              { id: 'notas', label: `Notas de Bitácora (${localNotes.length})`, icon: StickyNote }
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-all outline-none cursor-pointer
                  ${isActive 
                    ? 'border-verini-black text-verini-black bg-white font-bold' 
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/40'}`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-verini-black' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* TAB 1: GENERALES */}
          {activeTab === 'generales' && (
            <div className="space-y-6">
              {/* Client & Core metadata card */}
              {client && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-verini-black shadow-2xs">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cliente Promotor</span>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {client.nombre} {client.apellidos}
                      </h4>
                      <p className="text-[10px] text-slate-500">{client.empresa !== 'Particular' ? client.empresa : 'Particular'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col text-left sm:text-right text-[11px] text-slate-500 font-medium">
                    <span>Email: {client.email || '-'}</span>
                    <span>Móvil: {client.movil || client.telefono || '-'}</span>
                  </div>
                </div>
              )}

              {/* General Technical Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Technical properties */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-1">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    Ficha Técnica
                  </h4>
                  <ul className="space-y-3 text-xs">
                    <li className="flex justify-between items-center py-0.5">
                      <span className="font-semibold text-slate-400">Tipo de Reforma:</span>
                      <span className="font-bold text-slate-800">{obra.tipoReforma}</span>
                    </li>
                    <li className="flex justify-between items-center py-0.5">
                      <span className="font-semibold text-slate-400">Metros Cuadrados:</span>
                      <span className="font-bold font-mono text-slate-800">{obra.metrosCuadrados || '-'} m²</span>
                    </li>
                    <li className="flex justify-between items-start py-0.5">
                      <span className="font-semibold text-slate-400">Dirección Obra:</span>
                      <span className="font-medium text-slate-700 text-right max-w-xs">{obra.direccion}</span>
                    </li>
                    <li className="flex justify-between items-center py-0.5 border-t border-dashed border-slate-100 pt-3">
                      <span className="font-semibold text-slate-400">Presupuesto Cerrado:</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {obra.importe.toLocaleString('es-ES')} €
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Calendar timelines comparison */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    Planificación Temporal e Hitos
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Inicio Previsto</span>
                        <span className="font-semibold font-mono text-slate-700">
                          {obra.fechaInicioPrevista ? new Date(obra.fechaInicioPrevista).toLocaleDateString('es-ES') : 'No asignado'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Inicio Real</span>
                        <span className={`font-semibold font-mono ${obra.fechaInicioReal ? 'text-emerald-600' : 'text-slate-400 italic'}`}>
                          {obra.fechaInicioReal ? new Date(obra.fechaInicioReal).toLocaleDateString('es-ES') : 'Pendiente'}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Entrega Prevista</span>
                        <span className="font-semibold font-mono text-slate-700">
                          {obra.fechaFinPrevista ? new Date(obra.fechaFinPrevista).toLocaleDateString('es-ES') : 'No asignado'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Entrega Real</span>
                        <span className={`font-semibold font-mono ${obra.fechaFinReal ? 'text-emerald-600' : 'text-slate-400 italic'}`}>
                          {obra.fechaFinReal ? new Date(obra.fechaFinReal).toLocaleDateString('es-ES') : 'En curso'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status workflow selection bar */}
              <div className="border-t border-slate-100 pt-6">
                <span className="text-xs font-semibold text-slate-500 block mb-3">
                  Transicionar Estado de la Obra en el Kanban:
                </span>
                <div className="flex flex-wrap gap-2">
                  {(['Presupuesto', 'Aceptada', 'En obra', 'Entregada'] as Obra['estado'][]).map((st) => (
                    <button
                      key={st}
                      disabled={obra.estado === st}
                      onClick={() => onUpdateStatus(obra.id, st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer
                        ${obra.estado === st 
                          ? 'bg-verini-black text-white border-verini-black font-bold shadow-xs' 
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRESUPUESTOS */}
          {activeTab === 'presupuestos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Expedientes de Presupuesto</h3>
                <span className="text-xs text-slate-500 font-semibold">Valor Total: {stats.totalB.toLocaleString('es-ES')} €</span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] font-semibold text-slate-600 border-b border-slate-200">
                      <th className="px-4 py-2.5">Código</th>
                      <th className="px-4 py-2.5">Descripción de Partida</th>
                      <th className="px-4 py-2.5">Fecha</th>
                      <th className="px-4 py-2.5">Importe</th>
                      <th className="px-4 py-2.5">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockPresupuestos.map(p => (
                      <tr key={p.id} className="border-b border-slate-100 text-xs hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-mono font-semibold text-slate-900">{p.codigo}</td>
                        <td className="px-4 py-3 font-medium text-slate-850">{p.titulo}</td>
                        <td className="px-4 py-3 font-mono text-slate-500">{new Date(p.fechaEmision).toLocaleDateString('es-ES')}</td>
                        <td className="px-4 py-3 font-mono font-semibold text-slate-900">{p.importe.toLocaleString('es-ES')} €</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold leading-none bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10`}>
                            {p.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: FACTURAS */}
          {activeTab === 'facturas' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Facturación Generada</h3>
                <span className="text-xs text-slate-500 font-semibold">Emitido: {stats.invoiced.toLocaleString('es-ES')} € (con IVA)</span>
              </div>

              {mockFacturas.length > 0 ? (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[11px] font-semibold text-slate-600 border-b border-slate-200">
                        <th className="px-4 py-2.5">Código</th>
                        <th className="px-4 py-2.5">Concepto</th>
                        <th className="px-4 py-2.5">Fecha Emisión</th>
                        <th className="px-4 py-2.5">Vencimiento</th>
                        <th className="px-4 py-2.5">Base Imponible</th>
                        <th className="px-4 py-2.5">Total (IVA inc)</th>
                        <th className="px-4 py-2.5">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockFacturas.map(f => (
                        <tr key={f.id} className="border-b border-slate-100 text-xs hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-mono font-semibold text-slate-900">{f.codigo}</td>
                          <td className="px-4 py-3 font-medium text-slate-850">{f.titulo}</td>
                          <td className="px-4 py-3 font-mono text-slate-500">{new Date(f.fechaEmision).toLocaleDateString('es-ES')}</td>
                          <td className="px-4 py-3 font-mono text-slate-500">{new Date(f.fechaVencimiento).toLocaleDateString('es-ES')}</td>
                          <td className="px-4 py-3 font-mono text-slate-500">{f.baseImponible.toLocaleString('es-ES')} €</td>
                          <td className="px-4 py-3 font-mono font-bold text-slate-950">{f.total.toLocaleString('es-ES')} €</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold leading-none
                              ${f.estado === 'Cobrada' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10' : 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/10'}`}>
                              {f.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <FileText className="h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-xs font-semibold text-slate-600 mb-1">Sin facturas emitidas</p>
                  <p className="text-[11px] text-slate-400 max-w-sm">
                    Las facturas se emitirán de forma automática una vez la obra salga de la fase inicial de Presupuesto.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DOCUMENTOS */}
          {activeTab === 'documentos' && (
            <div className="space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Expedientes de Obra</h3>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center py-8 px-4 text-center rounded-xl border-2 border-dashed transition-all duration-150 cursor-pointer
                  ${isDragging
                    ? 'border-verini-yellow bg-verini-yellow/5'
                    : 'border-slate-250 bg-slate-50 hover:bg-slate-100/50'}`}
              >
                <Upload className={`h-8 w-8 mb-2 ${isDragging ? 'text-verini-yellow animate-bounce' : 'text-slate-400'}`} />
                <p className="text-xs font-bold text-slate-700">Arrastra planos o fichas técnicas aquí</p>
                <p className="text-[10px] text-slate-400 mt-1">O escribe el nombre del archivo abajo para añadirlo manualmente</p>
              </div>

              {/* Manual submittor */}
              <form onSubmit={handleAddDoc} className="flex gap-2">
                <Input
                  placeholder="ej. Memoria_De_Calidades_Cocina.pdf"
                  value={newDocName}
                  onChange={e => setNewDocName(e.target.value)}
                  className="text-xs h-9 bg-white"
                />
                <Button type="submit" className="bg-verini-black hover:bg-black/90 text-white text-xs h-9 px-4 gap-1 rounded-lg cursor-pointer">
                  <Plus className="h-4 w-4" />
                  Añadir
                </Button>
              </form>

              {/* Document rows */}
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {localDocs.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-white text-xs hover:bg-slate-50">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded bg-slate-100 text-slate-800 font-bold font-mono text-[10px]">
                        {doc.tipo}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 leading-tight">{doc.nombre}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Tamaño: {doc.tamano} • Subido: {new Date(doc.fechaSubida).toLocaleDateString('es-ES')}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setLocalDocs(localDocs.filter(d => d.id !== doc.id))}
                      className="h-8 w-8 text-slate-400 hover:text-red-600 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: NOTAS */}
          {activeTab === 'notas' && (
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Bitácora de Seguimiento de la Obra</h3>

              {/* Add comment form */}
              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  rows={3}
                  required
                  placeholder="Escribe una actualización o nota sobre el estado de la obra..."
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 bg-white p-3 text-slate-700 outline-none focus:border-verini-black focus:ring-1 focus:ring-verini-black/25"
                />
                <div className="flex justify-end">
                  <Button type="submit" className="bg-verini-black hover:bg-black/90 text-white text-xs h-9 px-4 gap-1 rounded-lg cursor-pointer">
                    <CheckCircle2 className="h-4 w-4" />
                    Añadir Nota de Avance
                  </Button>
                </div>
              </form>

              {/* Comment thread */}
              <div className="space-y-4">
                {localNotes.length > 0 ? (
                  localNotes.map(note => (
                    <div key={note.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-bold text-slate-800">{note.autor}</span>
                        <span className="font-mono bg-white border border-slate-100 px-2 py-0.5 rounded text-[10px]">
                          {new Date(note.fechaCreacion).toLocaleString('es-ES')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{note.contenido}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-slate-400 italic">
                    No hay notas en la bitácora de seguimiento.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: CONTROL DE HORAS */}
          {activeTab === 'horas' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Control de Horas de la Obra</h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Registra y lleva un control de la mano de obra invertida en este proyecto.
                  </p>
                </div>

                <div className="flex gap-4">
                  <div className="bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-2 text-center shrink-0">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Total Horas</span>
                    <span className="text-sm font-extrabold font-mono text-slate-800">
                      {horasObraList.reduce((sum, h) => sum + h.horas, 0)} h
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-2 text-center shrink-0">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Coste Mano de Obra</span>
                    <span className="text-sm font-extrabold font-mono text-emerald-600">
                      {(horasObraList.reduce((sum, h) => sum + h.horas, 0) * 20).toLocaleString('es-ES')} €
                    </span>
                  </div>
                </div>
              </div>

              {/* Form to log hours */}
              <form onSubmit={handleAddHoraSubmit} className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Registrar Nueva Jornada de Trabajo</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Fecha <span className="text-red-500">*</span></label>
                    <Input
                      required
                      type="date"
                      value={horaDate}
                      onChange={e => setHoraDate(e.target.value)}
                      className="text-xs h-9 bg-white"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Trabajador <span className="text-red-500">*</span></label>
                    <Input
                      required
                      placeholder="ej. Carlos Ibáñez"
                      value={horaTrabajador}
                      onChange={e => setHoraTrabajador(e.target.value)}
                      className="text-xs h-9 bg-white font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Horas Invertidas <span className="text-red-500">*</span></label>
                    <Input
                      required
                      type="number"
                      step="0.1"
                      placeholder="ej. 8.5"
                      value={horaCantidad}
                      onChange={e => setHoraCantidad(e.target.value)}
                      className="text-xs h-9 bg-white font-mono font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Tarea / Descripción de los trabajos <span className="text-red-500">*</span></label>
                  <Input
                    required
                    placeholder="ej. Alicatado del baño secundario y colocación de sanitarios"
                    value={horaTarea}
                    onChange={e => setHoraTarea(e.target.value)}
                    className="text-xs h-9 bg-white text-slate-900"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" className="bg-verini-black hover:bg-black/95 text-white text-xs h-9 px-4 gap-1 rounded-lg font-semibold cursor-pointer">
                    <Plus className="h-4 w-4" />
                    Registrar Horas
                  </Button>
                </div>
              </form>

              {/* Hours Log History */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Historial de Partes de Trabajo</h4>
                
                {horasLoading ? (
                  <div className="text-center py-6 text-xs text-slate-400 animate-pulse">
                    Cargando partes de horas...
                  </div>
                ) : horasObraList.length > 0 ? (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-[11px] font-semibold text-slate-600 border-b border-slate-200">
                          <th className="px-4 py-2.5 w-28">Fecha</th>
                          <th className="px-4 py-2.5 w-48">Trabajador</th>
                          <th className="px-4 py-2.5">Tarea / Trabajo Realizado</th>
                          <th className="px-4 py-2.5 w-24 text-right">Horas</th>
                          <th className="px-4 py-2.5 w-28 text-right">Coste (20€/h)</th>
                          <th className="px-4 py-2.5 w-16 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {horasObraList.map(h => (
                          <tr key={h.id} className="border-b border-slate-100 text-xs hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-mono text-slate-500">
                              {new Date(h.fecha).toLocaleDateString('es-ES')}
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-800">
                              {h.trabajador}
                            </td>
                            <td className="px-4 py-3 text-slate-600 leading-normal">
                              {h.tarea}
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-slate-800">
                              {h.horas} h
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600">
                              {(h.horas * 20).toLocaleString('es-ES')} €
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteHoraClick(h.id)}
                                className="h-7 w-7 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-slate-400 italic border border-dashed border-slate-200 bg-slate-50/40 rounded-xl">
                    No se han registrado partes de horas para esta obra. Utiliza el formulario superior para añadir el primero.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: GASTOS DE MATERIALES */}
          {activeTab === 'materiales' && (
            <div className="space-y-6">
              {/* Header metadata and overall summary */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50 border border-slate-150 p-5 rounded-2xl">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Imputación de Materiales de Proveedores</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Gastos reales extraídos de facturas de proveedores vinculadas a esta obra.</p>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Total Acumulado Materiales</span>
                  <span className="text-xl font-mono font-black text-slate-900">
                    {materialLines.reduce((sum, l) => sum + (l.cantidad * l.precioUnitario), 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                  </span>
                </div>
              </div>

              {/* Materials Log List */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Conceptos de Compra Imputados</h4>
                
                {materialLinesLoading ? (
                  <div className="text-center py-8 text-xs text-slate-400 animate-pulse">
                    Cargando materiales imputados...
                  </div>
                ) : materialLines.length > 0 ? (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                          <th className="px-4 py-3">Concepto / Descripción</th>
                          <th className="px-4 py-3 w-32 text-right">Cantidad</th>
                          <th className="px-4 py-3 w-32 text-right">Precio Unitario</th>
                          <th className="px-4 py-3 w-32 text-right">Importe Total</th>
                          <th className="px-4 py-3 w-36">Factura Origen</th>
                          <th className="px-4 py-3 w-48">Proveedor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {materialLines.map((line, idx) => {
                          const subtotal = line.cantidad * line.precioUnitario;
                          const provName = proveedores.find(p => p.id === line.proveedorId)?.nombre || '—';
                          return (
                            <tr key={line.id || idx} className="border-b border-slate-100 text-xs hover:bg-slate-50/50">
                              <td className="px-4 py-3.5 font-semibold text-slate-800">
                                {line.concepto}
                                {line.tipo === 'producto' && (
                                  <span className="ml-2 inline-flex items-center rounded bg-slate-100 px-1.5 py-0.2 text-[8px] font-medium text-slate-600 uppercase">Ficha</span>
                                )}
                              </td>
                              <td className="px-4 py-3.5 text-right font-mono text-slate-600">{line.cantidad}</td>
                              <td className="px-4 py-3.5 text-right font-mono text-slate-600">{line.precioUnitario.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</td>
                              <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">{subtotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</td>
                              <td className="px-4 py-3.5 font-mono text-slate-500 font-bold">{line.facturaNumero}</td>
                              <td className="px-4 py-3.5 text-slate-700 font-semibold truncate max-w-[180px]" title={provName}>{provName}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-10 text-xs text-slate-400 italic border border-dashed border-slate-200 bg-slate-50/40 rounded-xl space-y-2">
                    <AlertCircle className="h-6 w-6 text-slate-300 mx-auto" />
                    <p>No hay gastos de materiales imputados a esta obra actualmente.</p>
                    <p className="text-[10px] text-slate-400 font-normal">Crea una Factura de Proveedor y vincula sus líneas a este proyecto para verlas aquí.</p>
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
