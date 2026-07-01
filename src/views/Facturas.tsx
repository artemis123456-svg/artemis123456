import React, { useState, useMemo } from 'react';
import { useFacturas, calculateFacturaTotals } from '../hooks/useFacturas';
import { useClients } from '../hooks/useClients';
import { useObras } from '../hooks/useObras';
import { useProductos } from '../hooks/useProductos';
import FacturaTable from '../components/facturas/FacturaTable';
import FacturaDetail from '../components/facturas/FacturaDetail';
import FacturaForm from '../components/facturas/FacturaForm';
import { Factura } from '../types/factura';
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
  Layers
} from 'lucide-react';

export default function Facturas() {
  const { clients } = useClients();
  const { obras } = useObras();
  const { productos } = useProductos();
  const {
    facturas,
    addFactura,
    updateFactura,
    deleteFactura,
    changeFacturaEstado,
    generateNextNumero
  } = useFacturas();

  // Navigation workflow state: 'list' | 'detail' | 'create' | 'edit'
  const [viewState, setViewState] = useState<'list' | 'detail' | 'create' | 'edit'>('list');
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);

  // Financial KPIs Calculations (Memoized)
  const stats = useMemo(() => {
    let facturadoTotal = 0;
    let cobradoTotal = 0;
    let pendienteTotal = 0;
    let vencidoTotal = 0;
    let totalBorradores = 0;

    facturas.forEach(f => {
      const totals = calculateFacturaTotals(f.lineas);
      const invoiceTotal = totals.total;

      switch (f.estado) {
        case 'Cobrada':
          cobradoTotal += invoiceTotal;
          facturadoTotal += invoiceTotal; // official issued total
          break;
        case 'Emitida':
          pendienteTotal += invoiceTotal;
          facturadoTotal += invoiceTotal; // official issued total
          break;
        case 'Vencida':
          vencidoTotal += invoiceTotal;
          facturadoTotal += invoiceTotal; // official issued total
          break;
        case 'Borrador':
          totalBorradores += invoiceTotal;
          break;
      }
    });

    return {
      facturadoTotal,
      cobradoTotal,
      pendienteTotal,
      vencidoTotal,
      totalBorradores
    };
  }, [facturas]);

  // Form submit handler
  const handleFormSubmit = (formData: Omit<Factura, 'id' | 'numero'>) => {
    if (viewState === 'create') {
      addFactura(formData);
    } else if (viewState === 'edit' && selectedFactura) {
      updateFactura(selectedFactura.id, formData);
    }
    setViewState('list');
    setSelectedFactura(null);
  };

  // Status transition handler
  const handleChangeEstado = (id: string, nuevoEstado: Factura['estado']) => {
    changeFacturaEstado(id, nuevoEstado);
    // Sync active detailed view if open
    if (selectedFactura && selectedFactura.id === id) {
      setSelectedFactura(prev => prev ? { ...prev, estado: nuevoEstado } : null);
    }
  };

  // Format currency helper
  const formatEuro = (val: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-1 sm:p-2">
      
      {/* HEADER SECTION (Renders when not in print layout) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-verini-black flex items-center justify-center text-white shadow-xs">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                Módulo de Facturas
                <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full uppercase">Ciclo Comercial</span>
              </h1>
              <p className="text-xs text-slate-500">Gestión de facturación oficial, obras certificadas, líneas de catálogo e impuestos.</p>
            </div>
          </div>
        </div>
      </div>

      {/* STATS KPIs DASHBOARD GRID (Hidden during print or detail/forms view for visual cleanliness) */}
      {viewState === 'list' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
          
          {/* Card 1: Total Issued Facturado */}
          <Card className="border-slate-200/80 shadow-xs bg-white hover:border-slate-350 transition-colors">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Facturado Emitido</p>
                <h4 className="text-xl font-black text-slate-900 tracking-tight">{formatEuro(stats.facturadoTotal)}</h4>
                <p className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  Suma oficial emitida
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-850">
                <DollarSign className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Total Collected Cobrado */}
          <Card className="border-slate-200/80 shadow-xs bg-white hover:border-emerald-200/60 transition-colors">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cobrado Efectivo</p>
                <h4 className="text-xl font-black text-emerald-700 tracking-tight">{formatEuro(stats.cobradoTotal)}</h4>
                <p className="text-[10px] font-medium text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Ingresado en banco
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Total Pending Emitido */}
          <Card className="border-slate-200/80 shadow-xs bg-white hover:border-blue-200/60 transition-colors">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pendiente de Cobro</p>
                <h4 className="text-xl font-black text-blue-700 tracking-tight">{formatEuro(stats.pendienteTotal)}</h4>
                <p className="text-[10px] font-medium text-blue-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Facturas no vencidas
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Clock className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Total Overdue Vencido */}
          <Card className="border-slate-200/80 shadow-xs bg-white hover:border-rose-200/60 transition-colors">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deuda Vencida</p>
                <h4 className={`text-xl font-black tracking-tight ${stats.vencidoTotal > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-900'}`}>{formatEuro(stats.vencidoTotal)}</h4>
                <p className="text-[10px] font-medium text-rose-500 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 shrink-0" />
                  Plazo de pago superado
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

        </div>
      )}

      {/* VIEWPORT AREA: Router switcher */}
      <div className="space-y-4">
        {viewState === 'list' && (
          <FacturaTable
            facturas={facturas}
            clients={clients}
            obras={obras}
            onSelectFactura={(f) => {
              setSelectedFactura(f);
              setViewState('detail');
            }}
            onEditFactura={(f) => {
              setSelectedFactura(f);
              setViewState('edit');
            }}
            onDeleteFactura={(id) => {
              deleteFactura(id);
            }}
            onNewFactura={() => {
              setSelectedFactura(null);
              setViewState('create');
            }}
          />
        )}

        {viewState === 'detail' && selectedFactura && (
          <FacturaDetail
            factura={selectedFactura}
            clients={clients}
            obras={obras}
            onBack={() => {
              setSelectedFactura(null);
              setViewState('list');
            }}
            onEdit={(f) => {
              setSelectedFactura(f);
              setViewState('edit');
            }}
            onChangeEstado={handleChangeEstado}
          />
        )}

        {(viewState === 'create' || viewState === 'edit') && (
          <FacturaForm
            factura={selectedFactura || undefined}
            clients={clients}
            obras={obras}
            productos={productos}
            nextNumero={generateNextNumero()}
            onSubmit={handleFormSubmit}
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
