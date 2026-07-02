import React, { useState, useMemo } from 'react';
import { useFacturas, calculateFacturaTotals } from '../hooks/useFacturas';
import { useFacturasProveedor, calculateFacturaProveedorTotals } from '../hooks/useFacturasProveedor';
import { useClients } from '../hooks/useClients';
import { useProveedores } from '../hooks/useProveedores';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  Receipt, 
  Landmark, 
  Percent,
  ArrowRightLeft,
  Info,
  Building2,
  Check,
  X,
  FileText,
  HelpCircle,
  Eye,
  Printer
} from 'lucide-react';

type PeriodType = 'T1' | 'T2' | 'T3' | 'T4' | 'ALL' | string;

export default function Impuestos() {
  const { clients } = useClients();
  const { proveedores } = useProveedores();
  
  const { 
    facturas, 
    loading: loadingFacturas, 
    error: errorFacturas,
    toggleEntregadoGestoria: toggleGestoriaCliente
  } = useFacturas();
  
  const { 
    facturasProveedor, 
    loading: loadingProveedor, 
    error: errorProveedor,
    toggleEntregadoGestoria: toggleGestoriaProveedor
  } = useFacturasProveedor();

  // Period state
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [viewType, setViewType] = useState<'Mensual' | 'Trimestral' | 'Anual'>('Trimestral');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('T2'); 

  // UI state
  const [activeTab, setActiveTab] = useState<'clientes' | 'proveedores'>('clientes');
  const [onlyPendingGestoria, setOnlyPendingGestoria] = useState(false);

  // Helper arrays
  const years = [2025, 2026, 2027];
  
  const quarters = [
    { value: 'T1', label: '1º Trimestre (T1)', months: 'Enero - Marzo' },
    { value: 'T2', label: '2º Trimestre (T2)', months: 'Abril - Junio' },
    { value: 'T3', label: '3º Trimestre (T3)', months: 'Julio - Septiembre' },
    { value: 'T4', label: '4º Trimestre (T4)', months: 'Octubre - Diciembre' }
  ];

  const monthsList = [
    { value: '1', label: 'Enero' },
    { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' },
    { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' }
  ];

  const handleViewTypeChange = (type: 'Mensual' | 'Trimestral' | 'Anual') => {
    setViewType(type);
    if (type === 'Mensual') {
      setSelectedPeriod('4'); // Default to April (mid-year / T2 starting)
    } else if (type === 'Trimestral') {
      setSelectedPeriod('T2');
    } else {
      setSelectedPeriod('ALL');
    }
  };

  // Helper date matching function
  const matchPeriod = (dateStr: string, year: number, currentView: 'Mensual' | 'Trimestral' | 'Anual', periodVal: string) => {
    if (!dateStr) return false;
    const parts = dateStr.split('-');
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    
    if (y !== year) return false;
    
    if (currentView === 'Anual') {
      return true;
    } else if (currentView === 'Trimestral') {
      switch (periodVal) {
        case 'T1': return m >= 1 && m <= 3;
        case 'T2': return m >= 4 && m <= 6;
        case 'T3': return m >= 7 && m <= 9;
        case 'T4': return m >= 10 && m <= 12;
        default: return false;
      }
    } else { // Mensual
      const monthIdx = parseInt(periodVal, 10);
      return m === monthIdx;
    }
  };

  // Tax computation engine
  const taxData = useMemo(() => {
    // 1. Filter and process Client Invoices (excluding Drafts)
    const filteredClients = facturas.filter(f => {
      const isCorrectPeriod = matchPeriod(f.fechaEmision, selectedYear, viewType, selectedPeriod);
      const isNotBorrador = f.estado !== 'Borrador';
      return isCorrectPeriod && isNotBorrador;
    });

    const clientDetails = filteredClients.map(f => {
      const totals = calculateFacturaTotals(f.lineas);
      const clientName = clients.find(c => c.id === f.clientId)?.nombre || 'Cliente Desconocido';
      return {
        ...f,
        clientName,
        totals
      };
    });

    // 2. Filter and process Supplier Invoices
    const filteredSuppliers = facturasProveedor.filter(fp => {
      return matchPeriod(fp.fechaEmision, selectedYear, viewType, selectedPeriod);
    });

    const supplierDetails = filteredSuppliers.map(fp => {
      const totals = calculateFacturaProveedorTotals(fp.lineas, fp.retencionIrpf);
      const supplierName = proveedores.find(p => p.id === fp.proveedorId)?.nombre || 'Proveedor Desconocido';
      return {
        ...fp,
        supplierName,
        totals
      };
    });

    // Compute Bases & IVAs
    let baseRepercutidoTotal = 0;
    let ivaRepercutidoTotal = 0;
    let ivaRepercutido21Base = 0;
    let ivaRepercutido21Cuota = 0;
    let ivaRepercutido10Base = 0;
    let ivaRepercutido10Cuota = 0;
    let ivaRepercutido4Base = 0;
    let ivaRepercutido4Cuota = 0;
    let ivaRepercutido0Base = 0;
    let ivaRepercutido0Cuota = 0;
    let retencionesClientesTotal = 0;

    clientDetails.forEach(f => {
      baseRepercutidoTotal += f.totals.baseImponible;
      ivaRepercutidoTotal += f.totals.totalIva;
      
      const clientRetencionPct = (f as any).retencionIrpf || 0;
      retencionesClientesTotal += f.totals.baseImponible * (clientRetencionPct / 100);

      f.lineas.forEach(linea => {
        const subtotal = linea.cantidad * linea.precioUnitario;
        const pct = linea.ivaPorcentaje as number;
        if (pct === 21) {
          ivaRepercutido21Base += subtotal;
          ivaRepercutido21Cuota += subtotal * 0.21;
        } else if (pct === 10) {
          ivaRepercutido10Base += subtotal;
          ivaRepercutido10Cuota += subtotal * 0.10;
        } else if (pct === 4) {
          ivaRepercutido4Base += subtotal;
          ivaRepercutido4Cuota += subtotal * 0.04;
        } else if (pct === 0) {
          ivaRepercutido0Base += subtotal;
        }
      });
    });

    let baseSoportadoTotal = 0;
    let ivaSoportadoTotal = 0;
    let retencionesProveedoresTotal = 0;
    let ivaSoportado21Base = 0;
    let ivaSoportado21Cuota = 0;
    let ivaSoportado10Base = 0;
    let ivaSoportado10Cuota = 0;
    let ivaSoportado4Base = 0;
    let ivaSoportado4Cuota = 0;
    let ivaSoportado0Base = 0;
    let ivaSoportado0Cuota = 0;

    supplierDetails.forEach(fp => {
      baseSoportadoTotal += fp.totals.baseImponible;
      ivaSoportadoTotal += fp.totals.totalIva;
      retencionesProveedoresTotal += fp.totals.importeRetencion;

      fp.lineas.forEach(linea => {
        const subtotal = (linea.cantidad || 0) * (linea.precioUnitario || 0);
        const pct = linea.ivaPorcentaje as number;
        if (pct === 21) {
          ivaSoportado21Base += subtotal;
          ivaSoportado21Cuota += subtotal * 0.21;
        } else if (pct === 10) {
          ivaSoportado10Base += subtotal;
          ivaSoportado10Cuota += subtotal * 0.10;
        } else if (pct === 4) {
          ivaSoportado4Base += subtotal;
          ivaSoportado4Cuota += subtotal * 0.04;
        } else if (pct === 0) {
          ivaSoportado0Base += subtotal;
        }
      });
    });

    // IVA resultado
    const resultadoIva = ivaRepercutidoTotal - ivaSoportadoTotal;

    // IS Estimado (25%)
    const baseIsNeta = baseRepercutidoTotal - baseSoportadoTotal;
    const isEstimado = baseIsNeta > 0 ? baseIsNeta * 0.25 : 0;

    // Resultado Neto Estimado
    const resultadoNetoEstimado = baseIsNeta - isEstimado;

    // Saldo IRPF (Proveedores a pagar - Clientes ingresados)
    const saldoIrpf = retencionesProveedoresTotal - retencionesClientesTotal;

    return {
      clientDetails,
      supplierDetails,
      baseRepercutidoTotal,
      ivaRepercutidoTotal,
      ivaRepercutido21Base,
      ivaRepercutido21Cuota,
      ivaRepercutido10Base,
      ivaRepercutido10Cuota,
      ivaRepercutido4Base,
      ivaRepercutido4Cuota,
      ivaRepercutido0Base,
      ivaRepercutido0Cuota,
      retencionesClientesTotal,
      baseSoportadoTotal,
      ivaSoportadoTotal,
      ivaSoportado21Base,
      ivaSoportado21Cuota,
      ivaSoportado10Base,
      ivaSoportado10Cuota,
      ivaSoportado4Base,
      ivaSoportado4Cuota,
      ivaSoportado0Base,
      ivaSoportado0Cuota,
      retencionesProveedoresTotal,
      resultadoIva,
      baseIsNeta,
      isEstimado,
      resultadoNetoEstimado,
      saldoIrpf
    };
  }, [facturas, facturasProveedor, clients, proveedores, selectedYear, viewType, selectedPeriod]);

  // List filtering reactively
  const clientListFiltered = useMemo(() => {
    if (onlyPendingGestoria) {
      return taxData.clientDetails.filter(f => !f.entregadoGestoria);
    }
    return taxData.clientDetails;
  }, [taxData.clientDetails, onlyPendingGestoria]);

  const supplierListFiltered = useMemo(() => {
    if (onlyPendingGestoria) {
      return taxData.supplierDetails.filter(fp => !fp.entregadoGestoria);
    }
    return taxData.supplierDetails;
  }, [taxData.supplierDetails, onlyPendingGestoria]);

  const handleToggleClienteGestoria = async (id: string) => {
    try {
      await toggleGestoriaCliente(id);
    } catch (err) {
      console.error('Error toggling client gestoría state', err);
    }
  };

  const handleToggleProveedorGestoria = async (id: string) => {
    try {
      await toggleGestoriaProveedor(id);
    } catch (err) {
      console.error('Error toggling provider gestoría state', err);
    }
  };

  const formatEuro = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const isLoading = loadingFacturas || loadingProveedor;
  const isError = errorFacturas || errorProveedor;

  if (isLoading) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <div className="text-center space-y-2 animate-pulse">
          <Landmark className="h-10 w-10 text-slate-400 mx-auto animate-bounce" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Generando modelo de impuestos...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[450px] items-center justify-center p-6">
        <div className="text-center space-y-3 max-w-md bg-red-50 border border-red-150 p-6 rounded-2xl">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto" />
          <h3 className="font-extrabold text-red-950 uppercase tracking-wide text-sm">Error al cargar datos contables</h3>
          <p className="text-xs text-red-600 leading-relaxed">
            {errorFacturas || errorProveedor || 'No se han podido conectar los registros de facturas emitidas y recibidas.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-1 sm:p-2">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-150 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-verini-black flex items-center justify-center text-white">
              <Landmark className="h-5.5 w-5.5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                Centro de Gestión Fiscal
                <span className="text-[9px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase">Oficial</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">Liquidaciones e informes contables de IVA, IRPF e Impuesto de Sociedades para Verini.</p>
            </div>
          </div>
        </div>

        {/* PERIOD SELECTORS BAR */}
        <div className="flex flex-wrap items-center gap-2.5 bg-slate-50 p-2 rounded-xl border border-slate-200">
          
          {/* AÑO */}
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-slate-400 ml-1" />
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-lg py-1 px-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-verini-black cursor-pointer"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-slate-200"></div>

          {/* TIPO VISTA */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Vista:</span>
            <div className="flex bg-white rounded-lg p-0.5 border border-slate-200">
              {(['Mensual', 'Trimestral', 'Anual'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => handleViewTypeChange(type)}
                  className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${viewType === type ? 'bg-verini-black text-white' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* PERIODO DINÁMICO */}
          {viewType !== 'Anual' && (
            <>
              <div className="h-4 w-px bg-slate-200"></div>
              <select
                value={selectedPeriod}
                onChange={e => setSelectedPeriod(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg py-1 px-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-verini-black cursor-pointer"
              >
                {viewType === 'Trimestral' ? (
                  quarters.map(q => (
                    <option key={q.value} value={q.value}>{q.label} ({q.months})</option>
                  ))
                ) : (
                  monthsList.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))
                )}
              </select>
            </>
          )}

          <div className="h-4 w-px bg-slate-200 print:hidden"></div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="h-7 px-2.5 text-[11px] font-bold bg-white text-slate-700 hover:text-slate-900 border-slate-200 cursor-pointer flex items-center gap-1.5 print:hidden"
          >
            <Printer className="h-3.5 w-3.5" />
            Imprimir Informe
          </Button>

        </div>
      </div>

      {/* DISCLOSURE CARD */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
        <Info className="h-4.5 w-4.5 text-slate-500 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 leading-normal">
          <span className="font-extrabold text-slate-800 block uppercase tracking-wide text-[9px] mb-0.5">Normas del Criterio Contable</span>
          <p>
            Para asegurar un cálculo tributario exacto, las facturas a <span className="font-semibold text-slate-900">Clientes</span> omiten los borradores no emitidos. Las facturas de <span className="font-semibold text-slate-900">Proveedores</span> se computan íntegramente por su fecha de emisión de albarán. Toda modificación interactiva sobre el estado "Gestoría" se guarda en Supabase al instante.
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* PANEL DE RESUMEN: TARJETAS KPI (4 CARDS) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* TARJETA 1: IVA A LIQUIDAR */}
        <Card className="border-slate-200 shadow-xs bg-white hover:border-slate-300 transition-colors rounded-2xl">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">IVA a Liquidar (Mod. 303)</span>
              <div className="h-7 w-7 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-500">
                <ArrowRightLeft className="h-4 w-4" />
              </div>
            </div>
            <div>
              <h3 className={`text-xl font-black font-mono tracking-tight ${taxData.resultadoIva >= 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                {formatEuro(taxData.resultadoIva)}
              </h3>
              <p className="text-[10px] text-slate-400 font-medium mt-1">
                {taxData.resultadoIva >= 0 ? 'A ingresar (Pagar IVA)' : 'A compensar / devolver'}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Repercutido: <strong className="text-slate-700">{formatEuro(taxData.ivaRepercutidoTotal)}</strong></span>
              <span className="text-slate-400">Soportado: <strong className="text-slate-700">{formatEuro(taxData.ivaSoportadoTotal)}</strong></span>
            </div>
          </CardContent>
        </Card>

        {/* TARJETA 2: IRPF A DECLARAR */}
        <Card className="border-slate-200 shadow-xs bg-white hover:border-slate-300 transition-colors rounded-2xl">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">IRPF a Declarar (Mod. 111)</span>
              <div className="h-7 w-7 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-500">
                <Percent className="h-4 w-4" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-black font-mono tracking-tight text-slate-900">
                {formatEuro(taxData.retencionesProveedoresTotal)}
              </h3>
              <p className="text-[10px] text-slate-400 font-medium mt-1">
                Retenciones practicadas a colaboradores
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">En facturas emitidas: <strong className="text-slate-700">{formatEuro(taxData.retencionesClientesTotal)}</strong></span>
              <span className="text-slate-400">Saldo: <strong className="text-slate-700">{formatEuro(taxData.saldoIrpf)}</strong></span>
            </div>
          </CardContent>
        </Card>

        {/* TARJETA 3: IMPUESTO DE SOCIEDADES */}
        <Card className="border-slate-200 shadow-xs bg-white hover:border-slate-300 transition-colors rounded-2xl">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Impuesto de Sociedades Est.</span>
              <div className="h-7 w-7 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-500">
                <Building2 className="h-4 w-4" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-black font-mono tracking-tight text-slate-900">
                {formatEuro(taxData.isEstimado)}
              </h3>
              <p className="text-[10px] text-slate-400 font-medium mt-1">
                Cuota estimada al 25% estándar
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Base Imponible neta: <strong className={`font-bold ${taxData.baseIsNeta >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{formatEuro(taxData.baseIsNeta)}</strong></span>
            </div>
          </CardContent>
        </Card>

        {/* TARJETA 4: RESULTADO NETO */}
        <Card className="border-slate-200 shadow-xs bg-white hover:border-slate-300 transition-colors rounded-2xl">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Resultado Neto Estimado</span>
              <div className="h-7 w-7 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-500">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div>
              <h3 className={`text-xl font-black font-mono tracking-tight ${taxData.resultadoNetoEstimado >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                {formatEuro(taxData.resultadoNetoEstimado)}
              </h3>
              <p className="text-[10px] text-slate-400 font-medium mt-1">
                Bases de Ingresos - Gastos - Impuesto
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Rendimiento: <strong className="text-slate-700">{taxData.baseIsNeta > 0 ? 'Rentable' : 'Pérdidas'}</strong></span>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* ============================================================ */}
      {/* SECCIONES DETALLADAS DE IMPUESTOS */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* SECCIÓN DETALLADA DE IVA */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-150 p-5 space-y-5 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Landmark className="h-4.5 w-4.5 text-slate-800" />
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Desglose Detallado de IVA</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* REPERCUTIDO */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-150">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">IVA Repercutido (Clientes)</span>
                  <span className="text-[9px] font-extrabold text-white bg-slate-800 px-1.5 py-0.5 rounded uppercase">Ingresos</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-500">Tipo General (21%)</span>
                    <div className="text-right">
                      <p className="font-bold text-slate-800">{formatEuro(taxData.ivaRepercutido21Cuota)}</p>
                      <p className="text-[9px] text-slate-400 font-medium">Base: {formatEuro(taxData.ivaRepercutido21Base)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between font-medium border-t border-dashed border-slate-200 pt-2">
                    <span className="text-slate-500">Tipo Reducido (10%)</span>
                    <div className="text-right">
                      <p className="font-bold text-slate-800">{formatEuro(taxData.ivaRepercutido10Cuota)}</p>
                      <p className="text-[9px] text-slate-400 font-medium">Base: {formatEuro(taxData.ivaRepercutido10Base)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between font-medium border-t border-dashed border-slate-200 pt-2">
                    <span className="text-slate-500">Súper Reducido (4%)</span>
                    <div className="text-right">
                      <p className="font-bold text-slate-800">{formatEuro(taxData.ivaRepercutido4Cuota)}</p>
                      <p className="text-[9px] text-slate-400 font-medium">Base: {formatEuro(taxData.ivaRepercutido4Base)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between font-medium border-t border-dashed border-slate-200 pt-2">
                    <span className="text-slate-500">Exento (0%)</span>
                    <div className="text-right">
                      <p className="font-bold text-slate-800">{formatEuro(taxData.ivaRepercutido0Cuota)}</p>
                      <p className="text-[9px] text-slate-400 font-medium">Base: {formatEuro(taxData.ivaRepercutido0Base)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center font-bold text-slate-900 border-t border-slate-200 pt-3">
                    <span className="uppercase text-[9px] tracking-wider">Total Repercutido</span>
                    <span className="font-mono text-sm">{formatEuro(taxData.ivaRepercutidoTotal)}</span>
                  </div>
                </div>
              </div>

              {/* SOPORTADO */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-150">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">IVA Soportado (Proveedores)</span>
                  <span className="text-[9px] font-extrabold text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded uppercase">Gastos</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-500">Tipo General (21%)</span>
                    <div className="text-right">
                      <p className="font-bold text-slate-800">{formatEuro(taxData.ivaSoportado21Cuota)}</p>
                      <p className="text-[9px] text-slate-400 font-medium">Base: {formatEuro(taxData.ivaSoportado21Base)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between font-medium border-t border-dashed border-slate-200 pt-2">
                    <span className="text-slate-500">Tipo Reducido (10%)</span>
                    <div className="text-right">
                      <p className="font-bold text-slate-800">{formatEuro(taxData.ivaSoportado10Cuota)}</p>
                      <p className="text-[9px] text-slate-400 font-medium">Base: {formatEuro(taxData.ivaSoportado10Base)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between font-medium border-t border-dashed border-slate-200 pt-2">
                    <span className="text-slate-500">Súper Reducido (4%)</span>
                    <div className="text-right">
                      <p className="font-bold text-slate-800">{formatEuro(taxData.ivaSoportado4Cuota)}</p>
                      <p className="text-[9px] text-slate-400 font-medium">Base: {formatEuro(taxData.ivaSoportado4Base)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between font-medium border-t border-dashed border-slate-200 pt-2">
                    <span className="text-slate-500">Exento (0%)</span>
                    <div className="text-right">
                      <p className="font-bold text-slate-800">{formatEuro(taxData.ivaSoportado0Cuota)}</p>
                      <p className="text-[9px] text-slate-400 font-medium">Base: {formatEuro(taxData.ivaSoportado0Base)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center font-bold text-slate-900 border-t border-slate-200 pt-3">
                    <span className="uppercase text-[9px] tracking-wider">Total Soportado</span>
                    <span className="font-mono text-sm">{formatEuro(taxData.ivaSoportadoTotal)}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* IVA LIQUIDATION BOX */}
            <div className={`p-4 rounded-xl border ${taxData.resultadoIva >= 0 ? 'bg-red-50/50 border-red-200' : 'bg-emerald-50/50 border-emerald-200'} text-xs flex flex-col md:flex-row items-center justify-between gap-4`}>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Resultado final de IVA</span>
                <p className="text-slate-600 font-medium leading-relaxed">
                  {taxData.resultadoIva >= 0 
                    ? 'El IVA devengado supera al soportado. El importe indicado debe ingresarse a favor de la Agencia Tributaria Española mediante el Modelo 303.' 
                    : 'Las cuotas soportadas superan a las repercutidas. Este saldo puede acumularse para compensar autoliquidaciones positivas en los siguientes periodos o solicitar su devolución final.'
                  }
                </p>
              </div>
              <div className="shrink-0 text-center md:text-right">
                <span className={`text-xl font-mono font-black ${taxData.resultadoIva >= 0 ? 'text-red-700' : 'text-emerald-700'} block`}>
                  {formatEuro(taxData.resultadoIva)}
                </span>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase mt-1.5 ${taxData.resultadoIva >= 0 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {taxData.resultadoIva >= 0 ? 'A pagar' : 'A compensar'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: IRPF E IMPUESTO SOCIEDADES */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* DETALLE IRPF */}
          <Card className="border-slate-200 shadow-xs bg-white rounded-2xl overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Liquidación IRPF</span>
              <Percent className="h-4 w-4 text-slate-400" />
            </div>
            <CardContent className="p-5 space-y-4 text-xs">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Retenciones Proveedores (Mod. 111)</span>
                  <span className="font-mono font-bold text-slate-900">{formatEuro(taxData.retencionesProveedoresTotal)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-dashed border-slate-200 pt-2.5">
                  <span className="text-slate-500 font-medium">Retenciones Clientes</span>
                  <span className="font-mono font-bold text-slate-900">{formatEuro(taxData.retencionesClientesTotal)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 pt-3">
                  <span className="font-bold text-slate-900 uppercase tracking-wide text-[9px]">Saldo Neto IRPF</span>
                  <span className="font-mono font-black text-sm text-slate-900">{formatEuro(taxData.saldoIrpf)}</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed pt-2 border-t border-slate-100">
                Corresponde al saldo que debe declararse o compensarse en Hacienda por las retenciones realizadas y sufridas en el periodo contable actual.
              </p>
            </CardContent>
          </Card>

          {/* DETALLE IMPUESTO DE SOCIEDADES */}
          <Card className="border-slate-200 shadow-xs bg-white rounded-2xl overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Impuesto de Sociedades</span>
              <Building2 className="h-4 w-4 text-slate-400" />
            </div>
            <CardContent className="p-5 space-y-4 text-xs">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Bases de Ingresos Brutos</span>
                  <span className="font-mono font-bold text-slate-900">{formatEuro(taxData.baseRepercutidoTotal)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-dashed border-slate-200 pt-2.5">
                  <span className="text-slate-500 font-medium">Bases de Gastos Brutos</span>
                  <span className="font-mono font-bold text-slate-900">{formatEuro(taxData.baseSoportadoTotal)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-dashed border-slate-200 pt-2.5">
                  <span className="text-slate-500 font-bold">Rendimiento Neto (Ingreso - Gasto)</span>
                  <span className={`font-mono font-black ${taxData.baseIsNeta >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{formatEuro(taxData.baseIsNeta)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-dashed border-slate-200 pt-2.5 text-[11px]">
                  <span className="text-slate-400 font-medium">Tipo impositivo aplicable</span>
                  <span className="font-bold text-slate-600">25.0 %</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 pt-3">
                  <span className="font-black text-slate-950 uppercase tracking-wide text-[9px]">Cuota Estimada</span>
                  <span className="font-mono font-black text-sm text-slate-900">{formatEuro(taxData.isEstimado)}</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed pt-2 border-t border-slate-100">
                La cuota se calcula únicamente si la diferencia entre ingresos y gastos del periodo resulta positiva, aplicando el tipo del 25% para PYMES en España.
              </p>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* ============================================================ */}
      {/* DETALLES DE LIBROS DE FACTURAS CON FILTRO DE GESTORÍA */}
      {/* ============================================================ */}
      <div className="bg-white border border-slate-150 rounded-2xl p-4 sm:p-6 shadow-sm space-y-6">
        
        {/* TAB CONTROLLERS & GESTORIA SWITCH */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between border-b border-slate-150 pb-4 gap-4">
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Libros de Registro Detallados</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Controla y filtra los listados fiscales para el periodo de facturación actual.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            
            {/* GESTORIA SWITCH */}
            <label className="flex items-center gap-2 cursor-pointer select-none bg-slate-50 hover:bg-slate-100 border border-slate-200/80 px-3 py-1.5 rounded-xl transition-all">
              <input
                type="checkbox"
                checked={onlyPendingGestoria}
                onChange={(e) => setOnlyPendingGestoria(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-verini-black focus:ring-slate-900 cursor-pointer"
              />
              <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">Ver sólo pendientes de gestoría</span>
            </label>

            {/* TABS */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setActiveTab('clientes')}
                className={`text-[10px] font-bold px-3 py-1.5 rounded transition-all cursor-pointer ${
                  activeTab === 'clientes' ? 'bg-white text-slate-900 shadow-xs font-black' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Emitidas (Clientes) ({clientListFiltered.length})
              </button>
              <button
                onClick={() => setActiveTab('proveedores')}
                className={`text-[10px] font-bold px-3 py-1.5 rounded transition-all cursor-pointer ${
                  activeTab === 'proveedores' ? 'bg-white text-slate-900 shadow-xs font-black' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Recibidas (Proveedores) ({supplierListFiltered.length})
              </button>
            </div>

          </div>
        </div>

        {/* TAB 1: CLIENTES DETALLES */}
        {activeTab === 'clientes' && (
          <div className="space-y-4">
            {clientListFiltered.length > 0 ? (
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-150">
                      <th className="px-4 py-3">Nº Factura</th>
                      <th className="px-4 py-3">Fecha Emisión</th>
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3 text-center">Gestoría</th>
                      <th className="px-4 py-3 w-32 text-right">Base Imponible</th>
                      <th className="px-4 py-3 w-32 text-right">Cuota IVA</th>
                      <th className="px-4 py-3 w-32 text-right">Total Factura</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientListFiltered.map(f => (
                      <tr key={f.id} className="border-b border-slate-100 text-xs hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-slate-900 font-extrabold">{f.numero}</td>
                        <td className="px-4 py-3 font-mono text-slate-500 font-bold">
                          {new Date(f.fechaEmision).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-4 py-3 text-slate-700 font-semibold">{f.clientName}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                            f.estado === 'Cobrada' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            f.estado === 'Emitida' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {f.estado}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="checkbox"
                              checked={f.entregadoGestoria || false}
                              onChange={() => handleToggleClienteGestoria(f.id)}
                              className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                            {f.entregadoGestoria ? (
                              <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
                                Entregado
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-md bg-slate-50 px-1.5 py-0.5 text-[9px] font-semibold text-slate-400 ring-1 ring-slate-200">
                                Pendiente
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600">
                          {formatEuro(f.totals.baseImponible)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600">
                          {formatEuro(f.totals.totalIva)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-black text-slate-900">
                          {formatEuro(f.totals.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-slate-400 italic border border-dashed border-slate-200 bg-slate-50/40 rounded-xl space-y-2">
                <Receipt className="h-6 w-6 text-slate-300 mx-auto" />
                <p>No se encontraron facturas emitidas{onlyPendingGestoria ? ' pendientes de entregar a gestoría' : ''} para el periodo seleccionado.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PROVEEDORES DETALLES */}
        {activeTab === 'proveedores' && (
          <div className="space-y-4">
            {supplierListFiltered.length > 0 ? (
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-150">
                      <th className="px-4 py-3">Nº Factura</th>
                      <th className="px-4 py-3">Fecha Emisión</th>
                      <th className="px-4 py-3">Proveedor</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3 text-center">Gestoría</th>
                      <th className="px-4 py-3">Retención IRPF</th>
                      <th className="px-4 py-3 w-32 text-right">Base Imponible</th>
                      <th className="px-4 py-3 w-32 text-right">Cuota IVA</th>
                      <th className="px-4 py-3 w-32 text-right">Retención (€)</th>
                      <th className="px-4 py-3 w-32 text-right">Total Factura</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplierListFiltered.map(fp => (
                      <tr key={fp.id} className="border-b border-slate-100 text-xs hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-slate-900 font-extrabold">{fp.numero}</td>
                        <td className="px-4 py-3 font-mono text-slate-500 font-bold">
                          {new Date(fp.fechaEmision).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-4 py-3 text-slate-700 font-semibold">{fp.supplierName}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                            fp.estado === 'Pagada' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            fp.estado === 'Pendiente' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-red-50 text-red-700 border border-red-200 animate-pulse'
                          }`}>
                            {fp.estado}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="checkbox"
                              checked={fp.entregadoGestoria || false}
                              onChange={() => handleToggleProveedorGestoria(fp.id)}
                              className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                            {fp.entregadoGestoria ? (
                              <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
                                Entregado
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-md bg-slate-50 px-1.5 py-0.5 text-[9px] font-semibold text-slate-400 ring-1 ring-slate-200">
                                Pendiente
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-500 font-bold">
                          {fp.retencionIrpf > 0 ? `${fp.retencionIrpf}%` : '—'}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600">
                          {formatEuro(fp.totals.baseImponible)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600">
                          {formatEuro(fp.totals.totalIva)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-red-600">
                          {fp.totals.importeRetencion > 0 ? `-${formatEuro(fp.totals.importeRetencion)}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-black text-slate-900">
                          {formatEuro(fp.totals.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-slate-400 italic border border-dashed border-slate-200 bg-slate-50/40 rounded-xl space-y-2">
                <Receipt className="h-6 w-6 text-slate-300 mx-auto" />
                <p>No se encontraron facturas recibidas{onlyPendingGestoria ? ' pendientes de entregar a gestoría' : ''} para el periodo seleccionado.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
