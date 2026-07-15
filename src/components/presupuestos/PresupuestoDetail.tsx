import React, { useMemo } from 'react';
import { PresupuestoNew, calculatePresupuestoTotals } from '../../types/presupuesto';
import { Client } from '../../types/client';
import { Obra } from '../../types/obra';
import { useDatosEmpresa } from '../../hooks/useDatosEmpresa';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { 
  ArrowLeft, 
  Printer, 
  Pencil, 
  Check, 
  Send, 
  Clock, 
  FileCheck2, 
  Briefcase, 
  User, 
  Building,
  MapPin,
  Mail,
  Phone,
  Download,
  AlertTriangle,
  X
} from 'lucide-react';

interface PresupuestoDetailProps {
  presupuesto: PresupuestoNew;
  clients: Client[];
  obras: Obra[];
  onBack: () => void;
  onEdit: (presupuesto: PresupuestoNew) => void;
  onChangeEstado: (id: string, estado: PresupuestoNew['estado']) => void;
}

export default function PresupuestoDetail({
  presupuesto,
  clients,
  obras,
  onBack,
  onEdit,
  onChangeEstado
}: PresupuestoDetailProps) {
  const { datos: datosEmpresa } = useDatosEmpresa();

  const client = useMemo(() => clients.find(c => c.id === presupuesto.clientId), [clients, presupuesto.clientId]);
  const obra = useMemo(() => presupuesto.obraId ? obras.find(o => o.id === presupuesto.obraId) : null, [obras, presupuesto.obraId]);

  const totals = useMemo(() => calculatePresupuestoTotals(presupuesto.lineas), [presupuesto.lineas]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    try {
      const headers = ['Concepto', 'Cantidad', 'Precio Unitario', 'Importe Línea'];
      const rows = presupuesto.lineas.map(l => [
        `"${l.descripcion.replace(/"/g, '""')}"`,
        l.cantidad,
        l.precioUnitario,
        (l.cantidad * l.precioUnitario).toFixed(2)
      ]);
      
      // Totals metadata
      rows.push([]);
      rows.push(['', '', 'Base Imponible:', totals.baseImponible.toFixed(2)]);
      rows.push(['', '', 'Suma IVA (21%):', totals.totalIva.toFixed(2)]);
      rows.push(['', '', 'Importe Total:', totals.total.toFixed(2)]);

      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
        + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `presupuesto_${presupuesto.numero}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Error exporting CSV:', e);
    }
  };

  const getStatusConfig = (status: PresupuestoNew['estado']) => {
    switch (status) {
      case 'Aprobado':
        return {
          bg: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
          dot: 'bg-emerald-600',
          text: 'Aprobado'
        };
      case 'Enviado':
        return {
          bg: 'bg-blue-50 text-blue-700 ring-blue-600/20',
          dot: 'bg-blue-600',
          text: 'Enviado'
        };
      case 'Borrador':
        return {
          bg: 'bg-slate-100 text-slate-700 ring-slate-600/10',
          dot: 'bg-slate-500',
          text: 'Borrador'
        };
      case 'Rechazado':
        return {
          bg: 'bg-rose-50 text-rose-700 ring-rose-600/20',
          dot: 'bg-rose-600',
          text: 'Rechazado'
        };
    }
  };

  const statusConfig = getStatusConfig(presupuesto.estado);

  return (
    <div className="space-y-6">
      {/* Action panel (hidden during printing) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden bg-white p-4 rounded-xl border border-slate-150 shadow-xs">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-9 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer flex items-center gap-1.5 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al listado
          </Button>
          
          {/* Quick status dots */}
          <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusConfig.bg}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
            {statusConfig.text}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Change state flows */}
          {presupuesto.estado === 'Borrador' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChangeEstado(presupuesto.id, 'Enviado')}
              className="h-9 text-xs font-semibold border-blue-200 text-blue-700 hover:bg-blue-50 cursor-pointer flex items-center gap-1"
            >
              <Send className="h-3.5 w-3.5" />
              Marcar como Enviado
            </Button>
          )}
          {presupuesto.estado === 'Enviado' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChangeEstado(presupuesto.id, 'Aprobado')}
                className="h-9 text-xs font-semibold border-emerald-200 text-emerald-700 hover:bg-emerald-50 cursor-pointer flex items-center gap-1"
              >
                <Check className="h-3.5 w-3.5" />
                Aprobar Presupuesto
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChangeEstado(presupuesto.id, 'Rechazado')}
                className="h-9 text-xs font-semibold border-rose-200 text-rose-700 hover:bg-rose-50 cursor-pointer flex items-center gap-1"
              >
                <X className="h-3.5 w-3.5 text-rose-600" />
                Marcar Rechazado
              </Button>
            </>
          )}

          {/* Edit */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(presupuesto)}
            className="h-9 text-xs font-semibold hover:bg-slate-50 border-slate-200 cursor-pointer text-slate-700 flex items-center gap-1"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Button>

          {/* Export to CSV */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-9 text-xs font-semibold hover:bg-slate-50 border-slate-200 cursor-pointer text-slate-700 flex items-center gap-1"
            title="Exportar a CSV"
          >
            <Download className="h-3.5 w-3.5" />
            CSV
          </Button>

          {/* Print */}
          <Button
            variant="default"
            size="sm"
            onClick={handlePrint}
            className="h-9 text-xs font-bold bg-gray-900 hover:bg-gray-800 text-white cursor-pointer flex items-center gap-1 shadow-xs"
          >
            <Printer className="h-3.5 w-3.5" />
            Imprimir PDF
          </Button>
        </div>
      </div>

      {/* Main Budget Sheet */}
      <Card className="border border-slate-200 shadow-xs bg-white rounded-2xl overflow-hidden print:border-none print:shadow-none">
        <CardContent className="p-8 sm:p-12 space-y-8">
          
          {/* Print Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-slate-100 pb-8">
            <div className="space-y-3">
              {/* Brand identifier */}
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5 h-6 shrink-0">
                  <div className="w-0.5 h-full bg-[#F5B301]"></div>
                  <div className="w-0.5 h-full bg-[#E84A8A]"></div>
                  <div className="w-0.5 h-full bg-[#3B82C4]"></div>
                  <div className="w-0.5 h-full bg-[#2FA69A]"></div>
                </div>
                <span className="font-sans font-black tracking-widest text-slate-900 text-lg leading-none">
                  VERINI ESPAI CREATIU
                </span>
              </div>
              
              {/* Emisor Info */}
              <div className="text-xs text-slate-500 font-medium space-y-1">
                <p className="font-bold text-slate-800">{datosEmpresa?.nombreComercial || 'Verini Espai Creatiu S.L.'}</p>
                <p>NIF: {datosEmpresa?.nif || 'B-12345678'}</p>
                <p>Dirección: {datosEmpresa?.direccion || 'Carrer Major, 45'}, {datosEmpresa?.codigoPostal || '08001'} {datosEmpresa?.ciudad || 'Barcelona'}</p>
                <p>Tel: {datosEmpresa?.telefono || '931 234 567'} | Email: {datosEmpresa?.email || 'contacto@verini.es'}</p>
              </div>
            </div>

            <div className="text-left md:text-right space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-md">
                Presupuesto
              </span>
              <h1 className="text-xl font-bold font-mono text-slate-950 mt-1">{presupuesto.numero}</h1>
              
              <div className="text-xs text-slate-500 space-y-1 pt-1">
                <p><span className="font-semibold text-slate-700">Fecha Emisión:</span> {new Date(presupuesto.fechaCreacion).toLocaleDateString('es-ES')}</p>
                {presupuesto.fechaValidez && (
                  <p><span className="font-semibold text-slate-700">Válido Hasta:</span> {new Date(presupuesto.fechaValidez).toLocaleDateString('es-ES')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Client & Project metadata blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-slate-100 pb-8">
            {/* Destinatario Card */}
            <div className="space-y-3 p-4 bg-slate-50/70 border border-slate-150 rounded-xl">
              <div className="flex items-center gap-1.5 text-slate-500">
                <User className="h-4 w-4" />
                <h3 className="text-[10px] font-bold uppercase tracking-wider">Cliente / Destinatario</h3>
              </div>
              
              {client ? (
                <div className="text-xs text-slate-600 space-y-1">
                  <p className="font-black text-slate-900 text-sm">{client.nombre} {client.apellidos}</p>
                  {client.empresa && <p className="font-semibold text-slate-700">{client.empresa}</p>}
                  <p>NIF/CIF: {client.nifCif}</p>
                  <p className="flex items-center gap-1 mt-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400" /> {client.direccion}, {client.codigoPostal} {client.ciudad}</p>
                  <p className="flex items-center gap-1"><Mail className="h-3.5 w-3.5 text-slate-400" /> {client.email}</p>
                  <p className="flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-slate-400" /> {client.movil || client.telefono}</p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Cliente no disponible o eliminado</p>
              )}
            </div>

            {/* Obra / Concepto Card */}
            <div className="space-y-3 p-4 bg-slate-50/70 border border-slate-150 rounded-xl">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Briefcase className="h-4 w-4" />
                <h3 className="text-[10px] font-bold uppercase tracking-wider">Detalles de Obra / Proyecto</h3>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                {obra ? (
                  <>
                    <p className="font-bold text-slate-900">{obra.titulo}</p>
                    <p><span className="text-slate-450">Código Obra:</span> <span className="font-mono font-bold">{obra.codigo}</span></p>
                    <p><span className="text-slate-450">Dirección:</span> {obra.direccion}</p>
                    <p><span className="text-slate-450">Tipo Reforma:</span> {obra.tipoReforma}</p>
                  </>
                ) : (
                  <p className="text-slate-500 font-medium italic">Presupuesto directo de servicios (sin obra asignada)</p>
                )}

                {presupuesto.descripcion && (
                  <div className="pt-2 border-t border-slate-200 mt-2">
                    <p className="font-semibold text-slate-450">Notas / Descripción:</p>
                    <p className="text-slate-700 italic mt-0.5 line-clamp-3">{presupuesto.descripcion}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Line items Table */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Desglose de Conceptos</h3>
            <div className="border border-slate-200/60 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/60 font-bold text-slate-500">
                    <th className="py-3 px-4 w-[60%]">Descripción Concepto</th>
                    <th className="py-3 px-4 text-center w-[12%]">Cantidad</th>
                    <th className="py-3 px-4 text-right w-[14%]">Precio Unitario</th>
                    <th className="py-3 px-4 text-right w-[14%]">Importe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {presupuesto.lineas.map((linea, index) => {
                    const subtotal = linea.cantidad * linea.precioUnitario;
                    return (
                      <tr key={linea.id || index} className="hover:bg-slate-50/20 font-medium">
                        <td className="py-3 px-4 text-slate-800 font-semibold leading-normal">
                          {linea.descripcion}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-slate-750 font-mono">
                          {linea.cantidad} {linea.unidad || 'Ud'}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-slate-650 font-mono">
                          {formatCurrency(linea.precioUnitario)}
                        </td>
                        <td className="py-3 px-4 text-right font-black text-slate-900 font-mono">
                          {formatCurrency(subtotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Summary block */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pt-4">
            {/* Payment / Acceptance policy notes */}
            <div className="max-w-md space-y-2 p-4 border border-slate-150/60 rounded-xl bg-slate-50/40 text-[11px] text-slate-500 font-medium">
              <p className="font-bold text-slate-700 flex items-center gap-1">
                <FileCheck2 className="h-3.5 w-3.5 text-amber-600" />
                Condiciones de Aceptación:
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Precios válidos durante un período de 30 días naturales desde la fecha de emisión.</li>
                <li>Este presupuesto no tiene carácter contractual hasta ser firmado y aprobado por el cliente.</li>
                <li>Los plazos de ejecución de la obra se acordarán formalmente tras la firma del presente documento.</li>
              </ul>
            </div>

            {/* Financial Summaries */}
            <div className="w-full md:w-80 space-y-2.5 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex justify-between items-center text-xs text-slate-600 font-medium">
                <span>Base Imponible:</span>
                <span className="font-mono text-slate-900 font-bold">{formatCurrency(totals.baseImponible)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-600 font-medium pb-2 border-b border-slate-200/60">
                <span>IVA (21%):</span>
                <span className="font-mono text-slate-900 font-bold">{formatCurrency(totals.totalIva)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-900 font-black pt-1">
                <span className="uppercase tracking-wider">Importe Total:</span>
                <span className="font-mono text-lg text-slate-950">{formatCurrency(totals.total)}</span>
              </div>
            </div>
          </div>

          {/* Signature Block for printing */}
          <div className="hidden print:grid grid-cols-2 gap-16 pt-16 border-t border-slate-100">
            <div className="text-center space-y-12">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aceptado por el Cliente</p>
              <div className="h-0.5 bg-slate-200 w-48 mx-auto" />
              <p className="text-[10px] text-slate-400">Fecha y Firma</p>
            </div>
            <div className="text-center space-y-12">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Por Verini Espai Creatiu</p>
              <div className="h-0.5 bg-slate-200 w-48 mx-auto" />
              <p className="text-[10px] text-slate-400">Fecha y Sello</p>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
