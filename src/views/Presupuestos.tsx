import React, { useState, useMemo } from 'react';
import { usePresupuestos } from '../hooks/usePresupuestos';
import { useClients } from '../hooks/useClients';
import { useObras } from '../hooks/useObras';
import PresupuestoTable from '../components/presupuestos/PresupuestoTable';
import PresupuestoDetail from '../components/presupuestos/PresupuestoDetail';
import PresupuestoForm from '../components/presupuestos/PresupuestoForm';
import { PresupuestoNew, LineaPresupuesto } from '../types/presupuesto';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Sparkles,
  Calculator,
  Download,
  Percent
} from 'lucide-react';

export default function Presupuestos() {
  const { clients } = useClients();
  const { obras } = useObras();
  const {
    presupuestos,
    loading,
    error,
    isUsingFallback,
    addPresupuesto,
    updatePresupuesto,
    deletePresupuesto,
    generateNextNumero
  } = usePresupuestos();

  const [viewState, setViewState] = useState<'list' | 'detail' | 'create' | 'edit'>('list');
  const [selectedPresupuesto, setSelectedPresupuesto] = useState<PresupuestoNew | null>(null);
  const [duplicateSource, setDuplicateSource] = useState<PresupuestoNew | null>(null);

  // Financial KPIs Calculations (Memoized)
  const stats = useMemo(() => {
    let totalPresupuestado = 0;
    let totalAprobado = 0;
    let totalPendiente = 0; // Enviado
    let totalRechazado = 0;
    let totalBorrador = 0;

    presupuestos.forEach(p => {
      const value = p.importeTotal;
      totalPresupuestado += value;

      switch (p.estado) {
        case 'Aprobado':
          totalAprobado += value;
          break;
        case 'Enviado':
          totalPendiente += value;
          break;
        case 'Rechazado':
          totalRechazado += value;
          break;
        case 'Borrador':
          totalBorrador += value;
          break;
      }
    });

    const conversionRate = totalPresupuestado > 0 ? (totalAprobado / totalPresupuestado) * 100 : 0;

    return {
      totalPresupuestado,
      totalAprobado,
      totalPendiente,
      totalRechazado,
      totalBorrador,
      conversionRate
    };
  }, [presupuestos]);

  const handleSelectPresupuesto = (p: PresupuestoNew) => {
    setSelectedPresupuesto(p);
    setViewState('detail');
  };

  const handleEditPresupuesto = (p: PresupuestoNew) => {
    setSelectedPresupuesto(p);
    setDuplicateSource(null);
    setViewState('edit');
  };

  const handleDuplicatePresupuesto = (p: PresupuestoNew) => {
    setDuplicateSource(p);
    setSelectedPresupuesto(null);
    setViewState('create');
  };

  const handleCreateNew = () => {
    setSelectedPresupuesto(null);
    setDuplicateSource(null);
    setViewState('create');
  };

  const handleFormSubmit = async (formData: Omit<PresupuestoNew, 'id' | 'importeTotal'>) => {
    try {
      if (viewState === 'create') {
        await addPresupuesto(formData);
      } else if (viewState === 'edit' && selectedPresupuesto) {
        await updatePresupuesto(selectedPresupuesto.id, formData);
      }
      setViewState('list');
      setSelectedPresupuesto(null);
      setDuplicateSource(null);
    } catch (err) {
      console.error('Error submitting presupuesto form:', err);
    }
  };

  const handleStatusChange = async (id: string, newEstado: PresupuestoNew['estado']) => {
    try {
      await updatePresupuesto(id, { estado: newEstado });
      // Update selected budget reference to reflect changes on screen immediately
      if (selectedPresupuesto && selectedPresupuesto.id === id) {
        setSelectedPresupuesto(prev => prev ? { ...prev, estado: newEstado } : null);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleExportAllCSV = () => {
    try {
      const headers = ['Código', 'Cliente', 'Obra', 'Fecha Creación', 'Importe Total', 'Estado'];
      const rows = presupuestos.map(p => {
        const client = clients.find(c => c.id === p.clientId);
        const obra = p.obraId ? obras.find(o => o.id === p.obraId) : null;
        const clientName = client ? `${client.nombre} ${client.apellidos}` : 'Desconocido';
        const obraTitle = obra ? obra.titulo : 'Sin obra';
        return [
          p.numero,
          `"${clientName.replace(/"/g, '""')}"`,
          `"${obraTitle.replace(/"/g, '""')}"`,
          p.fechaCreacion,
          p.importeTotal.toFixed(2),
          p.estado
        ];
      });

      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
        + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `listado_presupuestos.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Error exporting list CSV:', e);
    }
  };

  if (loading && presupuestos.length === 0) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Cargando módulo de presupuestos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-1 sm:p-2">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gray-900 flex items-center justify-center text-white">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
                Presupuestos de Clientes
                <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full uppercase">Estudios de Viabilidad</span>
              </h1>
              <p className="text-xs text-slate-500">Gestión de presupuestos comerciales, estudios de viabilidad, ofertas y cotizaciones para obras.</p>
            </div>
          </div>
        </div>

        {viewState === 'list' && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportAllCSV}
            className="h-9 px-3 text-xs font-semibold hover:bg-slate-50 border-slate-250 cursor-pointer text-slate-700 flex items-center gap-1 self-start md:self-auto shadow-xs"
          >
            <Download className="h-4 w-4" />
            Exportar Listado
          </Button>
        )}
      </div>

      {/* KPI STATS CARDS */}
      {viewState === 'list' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
          {/* KPI 1: Total Presupuestado */}
          <Card className="border-slate-200/80 shadow-xs bg-white hover:border-slate-300 transition-colors">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-150 flex items-center justify-center shrink-0">
                <Calculator className="h-5 w-5 text-slate-700" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Presupuestado</span>
                <span className="text-lg font-mono font-black text-slate-900 block truncate">
                  {stats.totalPresupuestado.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </span>
                <div className="text-[9.5px] font-bold text-slate-400">Suma total de todas las cotizaciones</div>
              </div>
            </CardContent>
          </Card>

          {/* KPI 2: Total Aprobado */}
          <Card className="border-slate-200/80 shadow-xs bg-white hover:border-slate-300 transition-colors">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Aceptado</span>
                <span className="text-lg font-mono font-black text-emerald-700 block truncate">
                  {stats.totalAprobado.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </span>
                <div className="text-[9.5px] font-bold text-emerald-600">Proyectos aprobados para ejecución</div>
              </div>
            </CardContent>
          </Card>

          {/* KPI 3: Total Enviado / Pendiente */}
          <Card className="border-slate-200/80 shadow-xs bg-white hover:border-slate-300 transition-colors">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pendiente / Enviado</span>
                <span className="text-lg font-mono font-black text-blue-700 block truncate">
                  {stats.totalPendiente.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </span>
                <div className="text-[9.5px] font-bold text-blue-600">Ofertas pendientes de confirmación</div>
              </div>
            </CardContent>
          </Card>

          {/* KPI 4: Tasa de Conversión */}
          <Card className="border-slate-200/80 shadow-xs bg-white hover:border-slate-300 transition-colors">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                <Percent className="h-5 w-5 text-amber-700" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tasa de Conversión</span>
                <span className="text-lg font-mono font-black text-amber-700 block truncate">
                  {stats.conversionRate.toFixed(1)} %
                </span>
                <div className="text-[9.5px] font-bold text-amber-600">Porcentaje de importe aceptado</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MAIN VIEW CONTROLLER */}
      <div className="bg-white border border-slate-150 rounded-2xl p-4 sm:p-6 shadow-sm print:border-none print:p-0 print:shadow-none">
        {viewState === 'list' && (
          <PresupuestoTable
            presupuestos={presupuestos}
            clients={clients}
            obras={obras}
            onSelect={handleSelectPresupuesto}
            onEdit={handleEditPresupuesto}
            onDelete={deletePresupuesto}
            onDuplicate={handleDuplicatePresupuesto}
            onNew={handleCreateNew}
          />
        )}

        {viewState === 'detail' && selectedPresupuesto && (
          <PresupuestoDetail
            presupuesto={selectedPresupuesto}
            clients={clients}
            obras={obras}
            onBack={() => {
              setViewState('list');
              setSelectedPresupuesto(null);
            }}
            onEdit={handleEditPresupuesto}
            onChangeEstado={handleStatusChange}
          />
        )}

        {viewState === 'create' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              {duplicateSource ? `Duplicar Presupuesto ${duplicateSource.numero}` : 'Crear Nuevo Presupuesto'}
            </h2>
            <PresupuestoForm
              presupuesto={duplicateSource ? {
                ...duplicateSource,
                estado: 'Borrador',
                lineas: duplicateSource.lineas.map((l, idx) => ({
                  id: `lin_dup_${Date.now()}_${idx}`,
                  descripcion: l.descripcion,
                  cantidad: l.cantidad,
                  precioUnitario: l.precioUnitario,
                  ivaPorcentaje: l.ivaPorcentaje ?? 21,
                  tipo: l.tipo || 'libre',
                  productoId: l.productoId,
                  referenciaProducto: l.referenciaProducto,
                  fotoUrl: l.fotoUrl
                }))
              } : undefined}
              clients={clients}
              obras={obras}
              nextNumero={generateNextNumero()}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setViewState('list');
                setDuplicateSource(null);
              }}
            />
          </div>
        )}

        {viewState === 'edit' && selectedPresupuesto && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Editar Presupuesto {selectedPresupuesto.numero}
            </h2>
            <PresupuestoForm
              presupuesto={selectedPresupuesto}
              clients={clients}
              obras={obras}
              nextNumero={selectedPresupuesto.numero}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setViewState('detail');
              }}
            />
          </div>
        )}
      </div>

      {isUsingFallback && (
        <div className="print:hidden p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-4 text-xs font-bold text-slate-600">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Módulo cargado en Modo Resiliente con Persistencia Local (LocalStorage).</span>
          </div>
          <span className="text-[9px] font-black uppercase text-slate-400">Totalmente Funcional</span>
        </div>
      )}
    </div>
  );
}
