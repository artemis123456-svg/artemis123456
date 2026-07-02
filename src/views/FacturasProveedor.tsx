import React, { useState, useMemo } from 'react';
import { useFacturasProveedor, calculateFacturaProveedorTotals } from '../hooks/useFacturasProveedor';
import { useProveedores } from '../hooks/useProveedores';
import { useObras } from '../hooks/useObras';
import { useProductos } from '../hooks/useProductos';
import FacturaProveedorTable from '../components/facturasProveedor/FacturaProveedorTable';
import FacturaProveedorDetail from '../components/facturasProveedor/FacturaProveedorDetail';
import FacturaProveedorForm from '../components/facturasProveedor/FacturaProveedorForm';
import { FacturaProveedor } from '../types/facturaProveedor';
import { Card, CardContent } from '../components/ui/card';
import { 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Receipt,
  Sparkles,
  TrendingUp,
  FileSpreadsheet,
  TrendingDown,
  Layers,
  Inbox
} from 'lucide-react';

export default function FacturasProveedor() {
  const { proveedores } = useProveedores();
  const { obras } = useObras();
  const { productos } = useProductos();
  const {
    facturasProveedor,
    loading,
    error,
    addFacturaProveedor,
    updateFacturaProveedor,
    deleteFacturaProveedor,
    changeFacturaProveedorEstado,
    toggleEntregadoGestoria
  } = useFacturasProveedor();

  // Navigation workflow state: 'list' | 'detail' | 'create' | 'edit'
  const [viewState, setViewState] = useState<'list' | 'detail' | 'create' | 'edit'>('list');
  const [selectedFactura, setSelectedFactura] = useState<FacturaProveedor | null>(null);

  // Financial KPIs Calculations (Memoized)
  const stats = useMemo(() => {
    let totalFacturado = 0;
    let totalPagado = 0;
    let totalPendiente = 0;
    let totalVencido = 0;

    facturasProveedor.forEach(f => {
      const totals = calculateFacturaProveedorTotals(f.lineas, f.retencionIrpf);
      const invoiceTotal = totals.total;

      totalFacturado += invoiceTotal;
      if (f.estado === 'Pagada') {
        totalPagado += invoiceTotal;
      } else if (f.estado === 'Pendiente') {
        totalPendiente += invoiceTotal;
      } else if (f.estado === 'Vencida') {
        totalVencido += invoiceTotal;
      }
    });

    return {
      totalFacturado,
      totalPagado,
      totalPendiente,
      totalVencido
    };
  }, [facturasProveedor]);

  // Form submit handler
  const handleFormSubmit = async (formData: Omit<FacturaProveedor, 'id'>) => {
    try {
      if (viewState === 'create') {
        await addFacturaProveedor(formData);
      } else if (viewState === 'edit' && selectedFactura) {
        await updateFacturaProveedor(selectedFactura.id, formData);
      }
      setViewState('list');
      setSelectedFactura(null);
    } catch (err) {
      alert('Error al guardar la factura de proveedor.');
    }
  };

  // Status transition handler
  const handleChangeEstado = async (id: string, nuevoEstado: FacturaProveedor['estado']) => {
    try {
      await changeFacturaProveedorEstado(id, nuevoEstado);
      // Sync active detailed view if open
      if (selectedFactura && selectedFactura.id === id) {
        setSelectedFactura(prev => prev ? { ...prev, estado: nuevoEstado } : null);
      }
    } catch (err) {
      alert('Error al actualizar el estado de la factura.');
    }
  };

  const handleToggleGestoria = async (id: string) => {
    try {
      await toggleEntregadoGestoria(id);
      if (selectedFactura && selectedFactura.id === id) {
        setSelectedFactura(prev => prev ? { ...prev, entregadoGestoria: !prev.entregadoGestoria } : null);
      }
    } catch (err) {
      alert('Error al cambiar el estado de gestoría.');
    }
  };

  // Delete handler
  const handleDeleteFactura = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar por completo esta factura de proveedor y todas sus líneas asociadas? Esta acción es irreversible.')) return;
    try {
      await deleteFacturaProveedor(id);
      if (selectedFactura && selectedFactura.id === id) {
        setSelectedFactura(null);
        setViewState('list');
      }
    } catch (err) {
      alert('Error al eliminar la factura de proveedor.');
    }
  };

  // Format currency helper
  const formatEuro = (val: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);
  };

  if (loading) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <div className="text-center space-y-2 animate-pulse">
          <Receipt className="h-10 w-10 text-slate-400 mx-auto animate-bounce" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Cargando facturas de proveedor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-1 sm:p-2">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-verini-black flex items-center justify-center text-white">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                Facturas de Proveedor
                <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full uppercase">Materiales e Imputaciones</span>
              </h1>
              <p className="text-xs text-slate-500">Imputación directa de gastos de materiales, albaranes de proveedores y control fiscal de compras.</p>
            </div>
          </div>
        </div>
      </div>

      {/* STATS KPIs DASHBOARD GRID */}
      {viewState === 'list' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* KPI 1: Total Facturado por Proveedores */}
          <Card className="border-slate-200/80 shadow-xs bg-white hover:border-slate-300 transition-colors">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Compras Totales</p>
                <h4 className="text-xl font-black text-slate-900 tracking-tight">{formatEuro(stats.totalFacturado)}</h4>
                <p className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  Gasto acumulado
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                <Layers className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          {/* KPI 2: Total Pagado */}
          <Card className="border-slate-200/80 shadow-xs bg-white hover:border-slate-300 transition-colors">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Pagado</p>
                <h4 className="text-xl font-black text-emerald-600 tracking-tight">{formatEuro(stats.totalPagado)}</h4>
                <p className="text-[10px] font-medium text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Liquidado con éxito
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          {/* KPI 3: Total Pendiente */}
          <Card className="border-slate-200/80 shadow-xs bg-white hover:border-slate-300 transition-colors">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pendiente de Pago</p>
                <h4 className="text-xl font-black text-amber-600 tracking-tight">{formatEuro(stats.totalPendiente)}</h4>
                <p className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-amber-500" />
                  Próximos vencimientos
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shrink-0">
                <Clock className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          {/* KPI 4: Total Vencido */}
          <Card className="border-slate-200/80 shadow-xs bg-white hover:border-slate-300 transition-colors">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deuda Vencida</p>
                <h4 className="text-xl font-black text-red-600 tracking-tight">{formatEuro(stats.totalVencido)}</h4>
                <p className="text-[10px] font-medium text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 animate-pulse" />
                  Acción requerida
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-500 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

        </div>
      )}

      {/* WORKFLOW VIEW DISPATCHER */}
      <div className="bg-white border border-slate-150 rounded-2xl p-4 sm:p-6 shadow-sm">
        {viewState === 'list' && (
          <FacturaProveedorTable
            facturas={facturasProveedor}
            proveedores={proveedores}
            onSelectFactura={(f) => {
              setSelectedFactura(f);
              setViewState('detail');
            }}
            onEditFactura={(f) => {
              setSelectedFactura(f);
              setViewState('edit');
            }}
            onDeleteFactura={handleDeleteFactura}
            onNewFactura={() => {
              setSelectedFactura(null);
              setViewState('create');
            }}
            onToggleGestoria={handleToggleGestoria}
          />
        )}

        {viewState === 'detail' && selectedFactura && (
          <FacturaProveedorDetail
            factura={selectedFactura}
            proveedores={proveedores}
            obras={obras}
            onBack={() => {
              setSelectedFactura(null);
              setViewState('list');
            }}
            onUpdateStatus={handleChangeEstado}
            onToggleGestoria={handleToggleGestoria}
          />
        )}

        {(viewState === 'create' || viewState === 'edit') && (
          <FacturaProveedorForm
            factura={selectedFactura || undefined}
            proveedores={proveedores}
            obras={obras}
            productos={productos}
            onSave={handleFormSubmit}
            onCancel={() => {
              setSelectedFactura(null);
              setViewState('list');
            }}
          />
        )}
      </div>

    </div>
  );
}
