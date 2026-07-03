import React from 'react';
import { FacturaProveedor } from '../../types/facturaProveedor';
import { Proveedor } from '../../types/proveedor';
import { Obra } from '../../types/obra';
import { calculateFacturaProveedorTotals } from '../../hooks/useFacturasProveedor';
import { Button } from '../ui/button';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Receipt,
  User,
  Briefcase,
  AlertCircle,
  Printer
} from 'lucide-react';

interface FacturaProveedorDetailProps {
  factura: FacturaProveedor;
  proveedores: Proveedor[];
  obras: Obra[];
  onBack: () => void;
  onUpdateStatus: (id: string, status: FacturaProveedor['estado']) => void;
  onToggleGestoria?: (id: string) => void;
}

export default function FacturaProveedorDetail({
  factura,
  proveedores,
  obras,
  onBack,
  onUpdateStatus,
  onToggleGestoria
}: FacturaProveedorDetailProps) {
  const proveedor = proveedores.find(p => p.id === factura.proveedorId);
  const totals = calculateFacturaProveedorTotals(factura.lineas, factura.retencionIrpf);

  const getObraTitle = (obraId: string | null) => {
    if (!obraId) return '—';
    const obra = obras.find(o => o.id === obraId);
    return obra ? obra.titulo : 'Obra Desconocida';
  };

  const renderStatusBadge = (estado: FacturaProveedor['estado']) => {
    switch (estado) {
      case 'Pagada':
        return (
          <span className="inline-flex items-center gap-1.5 rounded bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            Pagada
          </span>
        );
      case 'Pendiente':
        return (
          <span className="inline-flex items-center gap-1.5 rounded bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-600/20">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            Pendiente
          </span>
        );
      case 'Vencida':
        return (
          <span className="inline-flex items-center gap-1.5 rounded bg-red-50 px-3 py-1 text-xs font-bold text-red-700 ring-1 ring-inset ring-red-600/20 animate-pulse">
            <span className="h-2 w-2 rounded-full bg-red-500"></span>
            Vencida
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Detail Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="text-xs h-9 gap-1.5 border-slate-200 text-slate-600 w-fit cursor-pointer hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al listado
        </Button>

        <div className="flex items-center gap-2">
          {/* Gestoría toggle */}
          <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg p-1 bg-slate-50 mr-2 text-xs h-9">
            <span className="px-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gestoría:</span>
            <button
              onClick={() => onToggleGestoria?.(factura.id)}
              className={`h-7 px-2.5 text-[11px] font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1 ${factura.entregadoGestoria ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}`}
            >
              {factura.entregadoGestoria ? 'Entregado' : 'Pendiente'}
            </button>
          </div>

          {factura.estado !== 'Pagada' && (
            <Button
              onClick={() => onUpdateStatus(factura.id, 'Pagada')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 px-4 gap-1.5 rounded-lg font-bold cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              Marcar como Pagada
            </Button>
          )}
          {factura.estado !== 'Pendiente' && (
            <Button
              onClick={() => onUpdateStatus(factura.id, 'Pendiente')}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-9 px-4 gap-1.5 rounded-lg font-bold cursor-pointer"
            >
              <Clock className="h-4 w-4" />
              Marcar como Pendiente
            </Button>
          )}
          {factura.estado !== 'Vencida' && (
            <Button
              onClick={() => onUpdateStatus(factura.id, 'Vencida')}
              className="bg-red-600 hover:bg-red-700 text-white text-xs h-9 px-4 gap-1.5 rounded-lg font-bold cursor-pointer"
            >
              <AlertTriangle className="h-4 w-4" />
              Marcar como Vencida
            </Button>
          )}

          {/* Print Invoice Button */}
          <Button
            onClick={() => window.print()}
            className="h-9 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold gap-1.5 rounded-lg shadow-sm transition-all px-3.5 print:hidden"
          >
            <Printer className="h-4 w-4" />
            Imprimir Factura
          </Button>
        </div>
      </div>

      {/* Main Invoice Card Sheet */}
      <div className="bg-white border border-slate-150 rounded-2xl p-6 sm:p-8 space-y-8 shadow-sm relative overflow-hidden">
        {/* Subtle decorative background swatch */}
        <div className="absolute top-0 right-0 h-2 w-full bg-verini-black"></div>

        {/* Emisor / Receptor Block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-slate-100 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="h-7 w-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 font-extrabold text-xs">P</span>
              <span className="font-extrabold text-lg text-slate-800 tracking-tight">DATOS DEL PROVEEDOR</span>
            </div>
            {proveedor ? (
              <div className="text-xs text-slate-500 space-y-1 mt-2">
                <p className="font-extrabold text-slate-900 text-sm">{proveedor.nombre}</p>
                <p>NIF/CIF: <span className="font-semibold text-slate-700">{proveedor.nifCif}</span></p>
                <p>Categoría: <span className="font-semibold text-slate-700">{proveedor.categoria}</span></p>
                <p>Dirección: <span className="font-semibold text-slate-700">{proveedor.direccion}, {proveedor.codigoPostal} {proveedor.ciudad}</span></p>
                <p>Email: <span className="font-semibold text-slate-700">{proveedor.email}</span></p>
              </div>
            ) : (
              <p className="text-xs text-amber-600 font-bold italic mt-2">Proveedor Desconocido ({factura.proveedorId})</p>
            )}
          </div>

          <div className="text-left md:text-right space-y-2">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Factura de Compra</span>
              <span className="text-xl font-mono font-black text-slate-950 block">{factura.numero}</span>
            </div>
            
            <div className="inline-block mt-2">
              {renderStatusBadge(factura.estado)}
            </div>

            <div className="flex md:justify-end gap-6 pt-4 text-xs text-slate-500">
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Gestoría</span>
                <span className={`inline-flex items-center rounded px-1.5 py-0.2 text-[10px] font-bold ${factura.entregadoGestoria ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10' : 'bg-slate-100 text-slate-600'}`}>
                  {factura.entregadoGestoria ? 'Sí, Entregado' : 'No, Pendiente'}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Fecha Emisión</span>
                <span className="font-mono text-slate-800 font-bold">{new Date(factura.fechaEmision).toLocaleDateString('es-ES')}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Vencimiento</span>
                <span className="font-mono text-slate-800 font-bold">{new Date(factura.fechaVencimiento).toLocaleDateString('es-ES')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Condiciones de Pago Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50/50 border border-slate-150/60 rounded-xl text-xs">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Método de Pago</span>
            <span className="font-semibold text-slate-800">{factura.metodoPago || 'Transferencia'}</span>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Vencimiento acordado</span>
            <span className="font-semibold text-slate-800">
              {factura.plazosDias === 0 || !factura.plazosDias ? 'Al contado' : `${factura.plazosDias} días`}
            </span>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Cuenta de Pago / Referencia</span>
            <span className="font-semibold text-slate-800 font-mono">{factura.referenciaBancaria || 'No especificada'}</span>
          </div>
        </div>

        {/* Lines / Materials Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Detalle de Materiales e Imputación</h3>
          
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-150">
                  <th className="px-4 py-3 w-12 text-center">#</th>
                  <th className="px-4 py-3">Concepto / Producto</th>
                  <th className="px-4 py-3">Obra Imputada</th>
                  <th className="px-4 py-3 w-24 text-right">Cantidad</th>
                  <th className="px-4 py-3 w-32 text-right">Precio Unitario</th>
                  <th className="px-4 py-3 w-20 text-center">IVA</th>
                  <th className="px-4 py-3 w-32 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {factura.lineas.map((linea, index) => {
                  const subtotal = linea.cantidad * linea.precioUnitario;
                  return (
                    <tr key={linea.id || index} className="border-b border-slate-100 text-xs hover:bg-slate-50/30">
                      <td className="px-4 py-3 font-mono text-slate-400 text-center">{index + 1}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {linea.concepto}
                        {linea.tipo === 'producto' && (
                          <span className="ml-2 inline-flex items-center rounded bg-slate-100 px-1.5 py-0.2 text-[9px] font-medium text-slate-600">Catálogo</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-medium">
                        {linea.obraId ? (
                          <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-50 border border-slate-200/50 px-2 py-0.5 rounded text-[11px] font-semibold">
                            <Briefcase className="h-3 w-3 text-slate-400" />
                            {getObraTitle(linea.obraId)}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">{linea.cantidad}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">{linea.precioUnitario.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</td>
                      <td className="px-4 py-3 text-center font-mono text-slate-500">{linea.ivaPorcentaje}%</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-800">{subtotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes & Totals Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {/* Notes Block */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Observaciones</span>
            <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl text-xs text-slate-600 min-h-[80px] leading-relaxed">
              {factura.observaciones ? factura.observaciones : <span className="italic text-slate-400">Sin observaciones registradas para esta factura.</span>}
            </div>
          </div>

          {/* Totals Breakdown Block */}
          <div className="bg-slate-50/50 border border-slate-150 rounded-2xl p-5 space-y-3.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Base Imponible</span>
              <span className="font-mono text-slate-800 font-bold">{totals.baseImponible.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
            </div>

            {/* IVA desglosado */}
            <div className="border-t border-dashed border-slate-200/80 pt-2 space-y-1">
              {Object.entries(totals.desgloseIva).map(([pct, val]) => {
                if (val.base === 0) return null;
                return (
                  <div key={pct} className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
                    <span className="pl-2">Suma Base {pct}% ({val.base.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €)</span>
                    <span className="font-mono font-semibold">{val.cuota.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center text-xs border-t border-slate-200/80 pt-2.5">
              <span className="text-slate-500 font-medium">Total IVA</span>
              <span className="font-mono text-slate-800 font-bold">{totals.totalIva.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
            </div>

            {factura.retencionIrpf > 0 && (
              <div className="flex justify-between items-center text-xs text-red-600">
                <span className="font-medium">Retención IRPF (-{factura.retencionIrpf}%)</span>
                <span className="font-mono font-bold">-{totals.importeRetencion.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm font-black border-t border-slate-200 pt-3">
              <span className="text-slate-900 uppercase tracking-wide">TOTAL FACTURA</span>
              <span className="font-mono text-base text-slate-950 font-black">{totals.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
