import React, { useState, useMemo } from 'react';
import { useFacturas, calculateFacturaTotals } from '../hooks/useFacturas';
import { useFacturasProveedor, calculateFacturaProveedorTotals } from '../hooks/useFacturasProveedor';
import { useClients } from '../hooks/useClients';
import { useProveedores } from '../hooks/useProveedores';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Receipt, 
  User, 
  Briefcase, 
  FileText, 
  Layers, 
  Landmark, 
  Percent,
  ArrowRightLeft,
  AlertCircle,
  HelpCircle,
  Info
} from 'lucide-react';

type PeriodType = 'T1' | 'T2' | 'T3' | 'T4' | 'ALL';

export default function Impuestos() {
  const { clients } = useClients();
  const { proveedores } = useProveedores();
  
  const { 
    facturas, 
    loading: loadingFacturas, 
    error: errorFacturas 
  } = useFacturas();
  
  const { 
    facturasProveedor, 
    loading: loadingProveedor, 
    error: errorProveedor 
  } = useFacturasProveedor();

  // Selected period state
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('T2'); // default to T2 (April-June) as it's mid-year of 2026

  // UI state
  const [activeTab, setActiveTab] = useState<'clientes' | 'proveedores'>('clientes');
  const [clientTableCollapsed, setClientTableCollapsed] = useState(false);
  const [supplierTableCollapsed, setSupplierTableCollapsed] = useState(false);

  // Helper arrays
  const years = [2025, 2026, 2027];
  const periods: { value: PeriodType; label: string; months: string }[] = [
    { value: 'T1', label: '1º Trimestre (T1)', months: 'Enero - Marzo' },
    { value: 'T2', label: '2º Trimestre (T2)', months: 'Abril - Junio' },
    { value: 'T3', label: '3º Trimestre (T3)', months: 'Julio - Septiembre' },
    { value: 'T4', label: '4º Trimestre (T4)', months: 'Octubre - Diciembre' },
    { value: 'ALL', label: 'Año completo', months: 'Enero - Diciembre' }
  ];

  // Helper date matching function
  const matchPeriod = (dateStr: string, year: number, period: PeriodType) => {
    if (!dateStr) return false;
    const parts = dateStr.split('-');
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    
    if (y !== year) return false;
    
    switch (period) {
      case 'T1': return m >= 1 && m <= 3;
      case 'T2': return m >= 4 && m <= 6;
      case 'T3': return m >= 7 && m <= 9;
      case 'T4': return m >= 10 && m <= 12;
      case 'ALL': return true;
      default: return false;
    }
  };

  // Tax computation engine
  const taxData = useMemo(() => {
    // 1. Filter and process Client Invoices (excluding Drafts / Borradores as they have no fiscal standing until issued)
    const filteredClients = facturas.filter(f => {
      const isCorrectPeriod = matchPeriod(f.fechaEmision, selectedYear, selectedPeriod);
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

    let ivaRepercutidoTotal = 0;
    let baseRepercutidoTotal = 0;
    let ivaRepercutido21Base = 0;
    let ivaRepercutido21Cuota = 0;
    let ivaRepercutido10Base = 0;
    let ivaRepercutido10Cuota = 0;
    let ivaRepercutido0Base = 0;
    let ivaRepercutido0Cuota = 0;

    clientDetails.forEach(f => {
      const { totals } = f;
      baseRepercutidoTotal += totals.baseImponible;
      ivaRepercutidoTotal += totals.totalIva;
      
      if (totals.desgloseIva[21]) {
        ivaRepercutido21Base += totals.desgloseIva[21].base;
        ivaRepercutido21Cuota += totals.desgloseIva[21].cuota;
      }
      if (totals.desgloseIva[10]) {
        ivaRepercutido10Base += totals.desgloseIva[10].base;
        ivaRepercutido10Cuota += totals.desgloseIva[10].cuota;
      }
      if (totals.desgloseIva[0]) {
        ivaRepercutido0Base += totals.desgloseIva[0].base;
        ivaRepercutido0Cuota += totals.desgloseIva[0].cuota;
      }
    });

    // 2. Filter and process Supplier Invoices (all are considered active)
    const filteredSuppliers = facturasProveedor.filter(fp => {
      return matchPeriod(fp.fechaEmision, selectedYear, selectedPeriod);
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

    let ivaSoportadoTotal = 0;
    let baseSoportadoTotal = 0;
    let retencionesIrpfTotal = 0;
    let ivaSoportado21Base = 0;
    let ivaSoportado21Cuota = 0;
    let ivaSoportado10Base = 0;
    let ivaSoportado10Cuota = 0;
    let ivaSoportado0Base = 0;
    let ivaSoportado0Cuota = 0;

    supplierDetails.forEach(fp => {
      const { totals } = fp;
      baseSoportadoTotal += totals.baseImponible;
      ivaSoportadoTotal += totals.totalIva;
      retencionesIrpfTotal += totals.importeRetencion;

      if (totals.desgloseIva[21]) {
        ivaSoportado21Base += totals.desgloseIva[21].base;
        ivaSoportado21Cuota += totals.desgloseIva[21].cuota;
      }
      if (totals.desgloseIva[10]) {
        ivaSoportado10Base += totals.desgloseIva[10].base;
        ivaSoportado10Cuota += totals.desgloseIva[10].cuota;
      }
      if (totals.desgloseIva[0]) {
        ivaSoportado0Base += totals.desgloseIva[0].base;
        ivaSoportado0Cuota += totals.desgloseIva[0].cuota;
      }
    });

    const resultadoIva = ivaRepercutidoTotal - ivaSoportadoTotal;

    return {
      clientDetails,
      supplierDetails,
      baseRepercutidoTotal,
      ivaRepercutidoTotal,
      ivaRepercutido21Base,
      ivaRepercutido21Cuota,
      ivaRepercutido10Base,
      ivaRepercutido10Cuota,
      ivaRepercutido0Base,
      ivaRepercutido0Cuota,
      baseSoportadoTotal,
      ivaSoportadoTotal,
      ivaSoportado21Base,
      ivaSoportado21Cuota,
      ivaSoportado10Base,
      ivaSoportado10Cuota,
      ivaSoportado0Base,
      ivaSoportado0Cuota,
      retencionesIrpfTotal,
      resultadoIva
    };
  }, [facturas, facturasProveedor, clients, proveedores, selectedYear, selectedPeriod]);

  // Currency helper
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-verini-black flex items-center justify-center text-white">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                Modelo de Impuestos
                <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full uppercase">Autónomos y PYMES España</span>
              </h1>
              <p className="text-xs text-slate-500">Resumen trimestral estimativo de IVA e IRPF basado en las facturas emitidas y recibidas registradas.</p>
            </div>
          </div>
        </div>

        {/* CONTROLS BAR: YEAR & PERIOD SELECTORS */}
        <div className="flex items-center gap-3 bg-slate-50/50 border border-slate-150 p-1.5 rounded-xl self-start md:self-center">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-slate-400 ml-1.5" />
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-lg py-1 px-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-verini-black cursor-pointer"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-slate-200"></div>

          <select
            value={selectedPeriod}
            onChange={e => setSelectedPeriod(e.target.value as PeriodType)}
            className="bg-white border border-slate-200 rounded-lg py-1 px-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-verini-black cursor-pointer"
          >
            {periods.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* DISCLOSURE CARD ABOUT FISCAL RULES */}
      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-3">
        <Info className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 leading-normal space-y-1">
          <span className="font-extrabold text-slate-800 block uppercase tracking-wide text-[10px]">Criterio Contable y Declaración Fiscal</span>
          <p>
            Para garantizar la validez fiscal, las facturas a <span className="font-semibold text-slate-800">Clientes</span> se filtran para omitir los estados <span className="font-bold text-slate-800 uppercase text-[10px] bg-slate-200/80 px-1.5 py-0.2 rounded">Borrador</span>, considerando únicamente las emitidas, cobradas o vencidas. Las facturas de <span className="font-semibold text-slate-800">Proveedor</span> se computan íntegramente de acuerdo con la fecha de emisión reflejada en su albarán de compra.
          </p>
        </div>
      </div>

      {/* RENDER DYNAMIC TAX ESTIMATION SHEETS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* SECTION IVA: CLIENT (REPERCUTIDO) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border-slate-150 shadow-sm bg-white overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                  <TrendingUp className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">IVA Repercutido</h3>
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Clientes (Emitido)</span>
            </div>
            
            <CardContent className="p-5 space-y-5">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cuota IVA Repercutido</span>
                <div className="text-2xl font-black text-slate-950 tracking-tight">
                  {formatEuro(taxData.ivaRepercutidoTotal)}
                </div>
                <span className="text-[10px] text-slate-400 block font-medium">
                  Suma Base de Ingresos: <span className="font-bold text-slate-600">{formatEuro(taxData.baseRepercutidoTotal)}</span>
                </span>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-3">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Desglose por Tipos Tributarios</span>
                
                {/* 21% Line */}
                <div className="flex items-center justify-between text-xs py-1">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-700">Tipo General (21%)</span>
                    <span className="text-[10px] text-slate-400 block">Base: {formatEuro(taxData.ivaRepercutido21Base)}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800">{formatEuro(taxData.ivaRepercutido21Cuota)}</span>
                </div>

                {/* 10% Line */}
                <div className="flex items-center justify-between text-xs py-1 border-t border-dashed border-slate-100">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-700">Tipo Reducido (10%)</span>
                    <span className="text-[10px] text-slate-400 block">Base: {formatEuro(taxData.ivaRepercutido10Base)}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800">{formatEuro(taxData.ivaRepercutido10Cuota)}</span>
                </div>

                {/* 0% Line */}
                {taxData.ivaRepercutido0Base > 0 && (
                  <div className="flex items-center justify-between text-xs py-1 border-t border-dashed border-slate-100">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-700">Tipo Exento (0%)</span>
                      <span className="text-[10px] text-slate-400 block">Base: {formatEuro(taxData.ivaRepercutido0Base)}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-400">{formatEuro(taxData.ivaRepercutido0Cuota)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SECTION IVA: PROVIDERS (SOPORTADO) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border-slate-150 shadow-sm bg-white overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                  <TrendingDown className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">IVA Soportado</h3>
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Proveedores (Gasto)</span>
            </div>
            
            <CardContent className="p-5 space-y-5">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cuota IVA Deducible</span>
                <div className="text-2xl font-black text-slate-950 tracking-tight">
                  {formatEuro(taxData.ivaSoportadoTotal)}
                </div>
                <span className="text-[10px] text-slate-400 block font-medium">
                  Suma Base de Compras: <span className="font-bold text-slate-600">{formatEuro(taxData.baseSoportadoTotal)}</span>
                </span>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-3">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Desglose por Tipos Tributarios</span>
                
                {/* 21% Line */}
                <div className="flex items-center justify-between text-xs py-1">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-700">Tipo General (21%)</span>
                    <span className="text-[10px] text-slate-400 block">Base: {formatEuro(taxData.ivaSoportado21Base)}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800">{formatEuro(taxData.ivaSoportado21Cuota)}</span>
                </div>

                {/* 10% Line */}
                <div className="flex items-center justify-between text-xs py-1 border-t border-dashed border-slate-100">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-700">Tipo Reducido (10%)</span>
                    <span className="text-[10px] text-slate-400 block">Base: {formatEuro(taxData.ivaSoportado10Base)}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800">{formatEuro(taxData.ivaSoportado10Cuota)}</span>
                </div>

                {/* 0% Line */}
                {taxData.ivaSoportado0Base > 0 && (
                  <div className="flex items-center justify-between text-xs py-1 border-t border-dashed border-slate-100">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-700">Tipo Exento (0%)</span>
                      <span className="text-[10px] text-slate-400 block">Base: {formatEuro(taxData.ivaSoportado0Base)}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-400">{formatEuro(taxData.ivaSoportado0Cuota)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SECTION IVA: RESULTADO IVA & RETENCIONES */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* LIQUIDACIÓN IVA SHEET */}
          <Card className={`border-slate-150 shadow-sm overflow-hidden text-white ${
            taxData.resultadoIva >= 0 ? 'bg-verini-black' : 'bg-slate-900'
          }`}>
            <div className="border-b border-white/10 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-white/10 flex items-center justify-center">
                  <ArrowRightLeft className="h-3.5 w-3.5 text-white" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-white">Liquidación IVA</h3>
              </div>
              <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider">Modelo 303 Est.</span>
            </div>
            
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider block">Resultado IVA</span>
                <div className="text-2xl font-black tracking-tight font-mono">
                  {formatEuro(taxData.resultadoIva)}
                </div>
                
                <div className="pt-2">
                  {taxData.resultadoIva >= 0 ? (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 px-3 py-1.5 text-[11px] font-bold text-amber-300">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Resultado: A INGRESAR (Pagar)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 text-[11px] font-bold text-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Resultado: A COMPENSAR / DEVOLVER
                    </span>
                  )}
                </div>
              </div>

              <p className="text-[10px] text-white/50 leading-relaxed pt-1.5 border-t border-white/10">
                La estimación calcula la resta de las cuotas de IVA devengado de tus clientes menos el IVA deducible de tus compras del periodo.
              </p>
            </CardContent>
          </Card>

          {/* IRPF RETENCIONS SHEET */}
          <Card className="border-slate-150 shadow-sm bg-white overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                  <Percent className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Retenciones IRPF</h3>
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Modelo 111 Est.</span>
            </div>

            <CardContent className="p-5">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Retenciones Soportadas</span>
                <div className="text-xl font-black text-slate-900 tracking-tight font-mono">
                  {formatEuro(taxData.retencionesIrpfTotal)}
                </div>
                <p className="text-[10px] text-slate-400 leading-normal pt-2 mt-2 border-t border-slate-100">
                  Importe retenido a cuenta del IRPF en las facturas de tus proveedores (por ejemplo, profesionales independientes, arquitectos o colaboradores externos).
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* DETAIL BREAKDOWN LOGS */}
      <div className="bg-white border border-slate-150 rounded-2xl p-4 sm:p-6 shadow-sm space-y-6">
        
        {/* TAB CONTROLLERS */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-150 pb-4 gap-4">
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Desglose de Libros de Facturas</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Listado pormenorizado de las facturas que intervienen en los cálculos fiscales del periodo actual.</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === 'clientes' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('clientes')}
              className={`text-xs h-9 px-4 font-bold rounded-lg cursor-pointer ${
                activeTab === 'clientes' ? 'bg-verini-black hover:bg-black/95 text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Emitidas (Clientes) ({taxData.clientDetails.length})
            </Button>
            <Button
              variant={activeTab === 'proveedores' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('proveedores')}
              className={`text-xs h-9 px-4 font-bold rounded-lg cursor-pointer ${
                activeTab === 'proveedores' ? 'bg-verini-black hover:bg-black/95 text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Recibidas (Proveedores) ({taxData.supplierDetails.length})
            </Button>
          </div>
        </div>

        {/* TAB 1: CLIENTES DETALLES */}
        {activeTab === 'clientes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Facturas Emitidas en el Periodo (Fiscamente Activas)</span>
            </div>

            {taxData.clientDetails.length > 0 ? (
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-150">
                      <th className="px-4 py-3">Nº Factura</th>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3 w-32 text-right">Base Imponible</th>
                      <th className="px-4 py-3 w-32 text-right">Cuota IVA</th>
                      <th className="px-4 py-3 w-32 text-right">Total Factura</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taxData.clientDetails.map(f => (
                      <tr key={f.id} className="border-b border-slate-100 text-xs hover:bg-slate-50/50">
                        <td className="px-4 py-3.5 font-mono text-slate-900 font-extrabold">{f.numero}</td>
                        <td className="px-4 py-3.5 font-mono text-slate-500 font-bold">
                          {new Date(f.fechaEmision).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-4 py-3.5 text-slate-700 font-semibold">{f.clientName}</td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                            f.estado === 'Cobrada' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            f.estado === 'Emitida' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                            'bg-red-50 text-red-700 border border-red-200 animate-pulse'
                          }`}>
                            {f.estado}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-slate-600">
                          {formatEuro(f.totals.baseImponible)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-slate-600">
                          {formatEuro(f.totals.totalIva)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-black text-slate-900">
                          {formatEuro(f.totals.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-slate-400 italic border border-dashed border-slate-200 bg-slate-50/40 rounded-xl space-y-2">
                <Receipt className="h-6 w-6 text-slate-300 mx-auto" />
                <p>No se encontraron facturas emitidas para el periodo y año seleccionados.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PROVEEDORES DETALLES */}
        {activeTab === 'proveedores' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Facturas Recibidas en el Periodo (Soportadas)</span>
            </div>

            {taxData.supplierDetails.length > 0 ? (
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-150">
                      <th className="px-4 py-3">Nº Factura</th>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Proveedor</th>
                      <th className="px-4 py-3">Retención IRPF</th>
                      <th className="px-4 py-3 w-32 text-right">Base Imponible</th>
                      <th className="px-4 py-3 w-32 text-right">Cuota IVA</th>
                      <th className="px-4 py-3 w-32 text-right">Retención (€)</th>
                      <th className="px-4 py-3 w-32 text-right">Total Factura</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taxData.supplierDetails.map(fp => (
                      <tr key={fp.id} className="border-b border-slate-100 text-xs hover:bg-slate-50/50">
                        <td className="px-4 py-3.5 font-mono text-slate-900 font-extrabold">{fp.numero}</td>
                        <td className="px-4 py-3.5 font-mono text-slate-500 font-bold">
                          {new Date(fp.fechaEmision).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-4 py-3.5 text-slate-700 font-semibold">{fp.supplierName}</td>
                        <td className="px-4 py-3.5 font-mono text-slate-500 font-bold">
                          {fp.retencionIrpf > 0 ? `${fp.retencionIrpf}%` : '—'}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-slate-600">
                          {formatEuro(fp.totals.baseImponible)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-slate-600">
                          {formatEuro(fp.totals.totalIva)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-red-600">
                          {fp.totals.importeRetencion > 0 ? `-${formatEuro(fp.totals.importeRetencion)}` : '—'}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-black text-slate-900">
                          {formatEuro(fp.totals.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-slate-400 italic border border-dashed border-slate-200 bg-slate-50/40 rounded-xl space-y-2">
                <Receipt className="h-6 w-6 text-slate-300 mx-auto" />
                <p>No se encontraron facturas de proveedores registradas para el periodo y año seleccionados.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
