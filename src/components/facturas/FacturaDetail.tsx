import React, { useMemo } from 'react';
import { Factura } from '../../types/factura';
import { Client } from '../../types/client';
import { Obra } from '../../types/obra';
import { calculateFacturaTotals } from '../../hooks/useFacturas';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { 
  ArrowLeft, 
  Printer, 
  Pencil, 
  Check, 
  Send, 
  Clock, 
  FileText, 
  Briefcase, 
  User, 
  Building,
  MapPin,
  Mail,
  Phone,
  CreditCard,
  AlertTriangle
} from 'lucide-react';

interface FacturaDetailProps {
  factura: Factura;
  clients: Client[];
  obras: Obra[];
  onBack: () => void;
  onEdit: (factura: Factura) => void;
  onChangeEstado: (id: string, estado: Factura['estado']) => void;
}

export default function FacturaDetail({
  factura,
  clients,
  obras,
  onBack,
  onEdit,
  onChangeEstado
}: FacturaDetailProps) {
  // Find associated client and project
  const client = useMemo(() => clients.find(c => c.id === factura.clientId), [clients, factura.clientId]);
  const obra = useMemo(() => obras.find(o => o.id === factura.obraId), [obras, factura.obraId]);

  // Calculate financial totals and tax breakdowns
  const totals = useMemo(() => calculateFacturaTotals(factura.lineas), [factura.lineas]);

  // Format currency helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Status styling maps
  const getStatusBadgeConfig = (status: Factura['estado']) => {
    switch (status) {
      case 'Cobrada':
        return {
          bg: 'bg-verini-teal/10 text-verini-teal ring-verini-teal/20',
          dot: 'bg-verini-teal',
          text: 'Cobrada / Pagada'
        };
      case 'Emitida':
        return {
          bg: 'bg-verini-blue/10 text-verini-blue ring-verini-blue/20',
          dot: 'bg-verini-blue',
          text: 'Emitida / Pendiente'
        };
      case 'Borrador':
        return {
          bg: 'bg-slate-100 text-slate-600 ring-slate-200',
          dot: 'bg-verini-grey',
          text: 'Borrador'
        };
      case 'Vencida':
        return {
          bg: 'bg-verini-pink/10 text-verini-pink ring-verini-pink/20',
          dot: 'bg-verini-pink',
          text: 'Vencida / Reclamar'
        };
    }
  };

  const statusConfig = getStatusBadgeConfig(factura.estado);

  return (
    <div className="space-y-6">
      {/* Action panel (hidden during printing) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-slate-600 hover:text-slate-900 self-start gap-1 text-xs"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al listado
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick status actions */}
          <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-1 bg-slate-50 mr-2 text-xs">
            <span className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cambiar estado:</span>
            <Button
              variant={factura.estado === 'Borrador' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onChangeEstado(factura.id, 'Borrador')}
              className={`h-7 px-2 text-[11px] font-semibold rounded-md ${factura.estado === 'Borrador' ? 'bg-white text-slate-800 shadow-xs hover:bg-white' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Borrador
            </Button>
            <Button
              variant={factura.estado === 'Emitida' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onChangeEstado(factura.id, 'Emitida')}
              className={`h-7 px-2 text-[11px] font-semibold rounded-md cursor-pointer ${factura.estado === 'Emitida' ? 'bg-verini-blue text-white shadow-xs hover:bg-verini-blue/90' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Emitir
            </Button>
            <Button
              variant={factura.estado === 'Cobrada' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onChangeEstado(factura.id, 'Cobrada')}
              className={`h-7 px-2 text-[11px] font-semibold rounded-md cursor-pointer ${factura.estado === 'Cobrada' ? 'bg-verini-teal text-white shadow-xs hover:bg-verini-teal/90' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Cobrada
            </Button>
            <Button
              variant={factura.estado === 'Vencida' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onChangeEstado(factura.id, 'Vencida')}
              className={`h-7 px-2 text-[11px] font-semibold rounded-md cursor-pointer ${factura.estado === 'Vencida' ? 'bg-verini-pink text-white shadow-xs hover:bg-verini-pink/90 animate-pulse' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Vencida
            </Button>
          </div>

          {/* Edit Invoice Button */}
          <Button
            variant="outline"
            size="sm"
            disabled={factura.estado === 'Cobrada'}
            onClick={() => onEdit(factura)}
            className="h-9 border-slate-200 hover:bg-slate-50 text-xs text-slate-700 gap-1.5 rounded-lg font-medium"
            title={factura.estado === 'Cobrada' ? "No se puede editar una factura cobrada" : "Editar factura"}
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Button>

          {/* Print Invoice Button */}
          <Button
            onClick={handlePrint}
            className="h-9 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold gap-1.5 rounded-lg shadow-sm transition-all px-3.5"
          >
            <Printer className="h-4 w-4" />
            Imprimir Factura (PDF)
          </Button>
        </div>
      </div>

      {/* Invoice Document Card */}
      <Card className="border-slate-200 shadow-sm print:shadow-none print:border-none print:p-0 bg-white max-w-4xl mx-auto overflow-hidden">
        <CardContent className="p-8 sm:p-12 print:p-0 space-y-8">
          
          {/* TOP HEADER: Logo & Invoice details */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="h-7 w-7 rounded-lg bg-verini-black flex items-center justify-center text-white font-extrabold text-sm tracking-tighter">V</span>
                <span className="font-extrabold text-xl text-slate-900 tracking-tight">VERINI</span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reformas e Interiorismo</p>
              <p className="text-xs text-slate-500 mt-2">
                Verini Design S.L.<br />
                NIF: B-98765432<br />
                Paseo de la Alameda 8<br />
                46010 Valencia, España
              </p>
            </div>

            <div className="text-left md:text-right space-y-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-800 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-md">
                Documento Comercial
              </span>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">FACTURA</h1>
              <div className="font-mono font-bold text-sm text-slate-900 flex items-center md:justify-end gap-1.5">
                <FileText className="h-4 w-4" />
                {factura.numero}
              </div>
              <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${statusConfig.bg}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot} mr-1.5`} />
                {statusConfig.text}
              </div>
            </div>
          </div>

          {/* DATES & ADDRESSES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs bg-slate-50/50 p-6 rounded-xl border border-slate-100">
            <div className="space-y-3">
              <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Datos de Emisión</p>
              <div className="space-y-1 text-slate-600">
                <p><span className="font-semibold text-slate-800">Fecha Emisión:</span> {factura.fechaEmision}</p>
                <p><span className="font-semibold text-slate-800">Fecha Vencimiento:</span> {factura.fechaVencimiento}</p>
                <p><span className="font-semibold text-slate-800">Método de Pago:</span> Transferencia Bancaria</p>
                <p><span className="font-semibold text-slate-800">IBAN:</span> ES21 0049 1500 0512 3456 7890</p>
              </div>
            </div>

            <div className="space-y-3 border-l border-slate-200/50 pl-0 md:pl-6">
              <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Cliente (Receptor)</p>
              {client ? (
                <div className="space-y-1 text-slate-600">
                  <p className="font-bold text-slate-900 text-sm">{client.nombre} {client.apellidos}</p>
                  {client.empresa && <p className="font-medium text-slate-700 flex items-center gap-1"><Building className="h-3.5 w-3.5 text-slate-400" /> {client.empresa}</p>}
                  <p><span className="font-semibold text-slate-800">NIF/CIF:</span> {client.nifCif}</p>
                  <p className="flex items-start gap-1"><MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" /> <span>{client.direccion}, {client.codigoPostal} {client.ciudad} ({client.provincia})</span></p>
                  <p className="flex items-center gap-1"><Mail className="h-3.5 w-3.5 text-slate-400" /> {client.email}</p>
                </div>
              ) : (
                <p className="text-slate-400 italic">Cliente no encontrado en el sistema</p>
              )}
            </div>

            <div className="space-y-3 border-l border-slate-200/50 pl-0 md:pl-6">
              <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Obra / Proyecto Asociado</p>
              {obra ? (
                <div className="space-y-1 text-slate-600">
                  <p className="font-bold text-slate-900 text-xs flex items-center gap-1"><Briefcase className="h-3.5 w-3.5 text-slate-400" /> {obra.titulo}</p>
                  <p><span className="font-semibold text-slate-800">Código Obra:</span> {obra.codigo}</p>
                  <p><span className="font-semibold text-slate-800">Tipo de Obra:</span> Reforma {obra.tipoReforma}</p>
                  <p className="flex items-start gap-1"><MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" /> <span>{obra.direccion}</span></p>
                </div>
              ) : (
                <p className="text-slate-400 italic">Sin obra asignada o proyecto eliminado</p>
              )}
            </div>
          </div>

          {/* ITEM DETAILED TABLE */}
          <div className="space-y-2">
            <p className="font-bold text-slate-900 text-sm">Conceptos Facturados</p>
            <div className="overflow-x-auto border border-slate-100 rounded-lg">
              <table className="w-full text-left text-xs text-slate-600 border-collapse">
                <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Línea Concepto</th>
                    <th className="py-2.5 px-4 text-center w-20">Cantidad</th>
                    <th className="py-2.5 px-4 text-right w-28">P. Unitario</th>
                    <th className="py-2.5 px-4 text-center w-16">% IVA</th>
                    <th className="py-2.5 px-4 text-right w-28">Subtotal</th>
                    <th className="py-2.5 px-4 text-right w-24">IVA Cuota</th>
                    <th className="py-2.5 px-4 text-right w-32">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {factura.lineas.map((linea, index) => {
                    const subtotal = linea.cantidad * linea.precioUnitario;
                    const ivaCuota = subtotal * (linea.ivaPorcentaje / 100);
                    const totalLinea = subtotal + ivaCuota;
                    
                    return (
                      <tr key={linea.id || index} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900 text-xs">{linea.concepto}</p>
                          {linea.tipo === 'producto' && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] text-slate-700 font-bold bg-slate-100 px-1.5 py-0.5 rounded mt-1">
                              Catálogo: {linea.productoId}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-slate-800">
                          {linea.cantidad}
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {formatCurrency(linea.precioUnitario)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-1.5 py-0.5 text-[10px] font-bold rounded ${linea.ivaPorcentaje === 21 ? 'bg-amber-50 text-amber-700' : linea.ivaPorcentaje === 10 ? 'bg-slate-100 text-slate-800' : 'bg-slate-100 text-slate-600'}`}>
                            {linea.ivaPorcentaje}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-700">
                          {formatCurrency(subtotal)}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-500">
                          {formatCurrency(ivaCuota)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          {formatCurrency(totalLinea)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* FINANCIAL SUMMARY TOTALS */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 pt-4">
            
            {/* Tax Breakdown Desglose */}
            <div className="w-full md:w-1/2 space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-xs">
              <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Desglose e Impuestos por Tipo de IVA</p>
              <div className="space-y-2">
                {[21, 10, 0].map(pct => {
                  const data = totals.desgloseIva[pct as 21 | 10 | 0];
                  if (data.base === 0) return null;
                  return (
                    <div key={pct} className="flex justify-between items-center py-1 border-b border-slate-100 last:border-0 text-slate-600">
                      <span className="font-medium text-slate-700">IVA Tipo {pct}%:</span>
                      <div className="space-x-4">
                        <span>Base: <strong className="font-semibold text-slate-800">{formatCurrency(data.base)}</strong></span>
                        <span>Cuota: <strong className="font-semibold text-slate-800">{formatCurrency(data.cuota)}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total Block */}
            <div className="w-full md:w-1/3 space-y-2 text-xs text-slate-600 ml-auto">
              <div className="flex justify-between py-1">
                <span className="font-semibold text-slate-700">Suma Bases Imponibles:</span>
                <span className="font-bold text-slate-900">{formatCurrency(totals.baseImponible)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="font-semibold text-slate-700">Suma Cuotas IVA:</span>
                <span className="font-bold text-slate-900">{formatCurrency(totals.totalIva)}</span>
              </div>
              <div className="flex justify-between py-3 text-slate-900 bg-slate-50 px-4 rounded-lg border border-slate-200">
                <span className="text-sm font-black text-slate-900">Importe Total Neto:</span>
                <span className="text-sm font-black text-slate-950">{formatCurrency(totals.total)}</span>
              </div>
            </div>
          </div>

          {/* OBSERVATIONS AND REGULATORY NOTES */}
          <div className="grid grid-cols-1 gap-4 pt-6 border-t border-slate-100 text-[10px] text-slate-400 leading-relaxed">
            {factura.observaciones && (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <strong className="text-slate-500 block mb-1">Observaciones / Comentarios adicionales:</strong>
                <p className="text-slate-600 text-xs">{factura.observaciones}</p>
              </div>
            )}
            <div>
              <p className="font-bold uppercase tracking-wider mb-1 text-slate-500">Condiciones de pago e Información Legal</p>
              <p>
                Las facturas vencen en un plazo de 30 días naturales a partir de la fecha de emisión. Las transferencias bancarias deben realizarse indicando como concepto el número de la factura ({factura.numero}). Conforme a la legislación vigente de la Ley de Ordenación de la Edificación y de consumo, Verini ofrece garantías específicas para cada tipo de reforma realizada. Para cualquier aclaración, contactar con administracion@verini.es.
              </p>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
