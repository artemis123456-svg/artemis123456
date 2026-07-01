import React, { useState, useEffect, useMemo } from 'react';
import { Factura, LineaFactura } from '../../types/factura';
import { Client } from '../../types/client';
import { Obra } from '../../types/obra';
import { Producto } from '../../types/producto';
import { calculateFacturaTotals } from '../../hooks/useFacturas';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { 
  Plus, 
  Trash2, 
  Save, 
  X, 
  Calculator, 
  FileText, 
  ShoppingBag, 
  Layers, 
  AlertCircle,
  Clock,
  Euro,
  FileSpreadsheet
} from 'lucide-react';

interface FacturaFormProps {
  factura?: Factura;
  clients: Client[];
  obras: Obra[];
  productos: Producto[];
  onSubmit: (data: Omit<Factura, 'id' | 'numero'>) => void;
  onCancel: () => void;
  nextNumero: string;
}

export default function FacturaForm({
  factura,
  clients,
  obras,
  productos,
  onSubmit,
  onCancel,
  nextNumero
}: FacturaFormProps) {
  // Main form states
  const [clientId, setClientId] = useState(factura?.clientId || '');
  const [obraId, setObraId] = useState(factura?.obraId || '');
  
  // Format dates correctly: YYYY-MM-DD
  const [fechaEmision, setFechaEmision] = useState(() => {
    if (factura?.fechaEmision) return factura.fechaEmision;
    return new Date().toISOString().split('T')[0];
  });
  
  const [fechaVencimiento, setFechaVencimiento] = useState(() => {
    if (factura?.fechaVencimiento) return factura.fechaVencimiento;
    const date = new Date();
    date.setDate(date.getDate() + 30); // 30 days due date by default
    return date.toISOString().split('T')[0];
  });
  
  const [estado, setEstado] = useState<Factura['estado']>(factura?.estado || 'Borrador');
  const [observaciones, setObservaciones] = useState(factura?.observaciones || '');
  
  // Line items state
  const [lineas, setLineas] = useState<LineaFactura[]>(() => {
    if (factura?.lineas) return factura.lineas;
    // Start with 1 default empty line for visual guidance
    return [
      {
        id: `lin_init_1`,
        tipo: 'libre',
        productoId: null,
        concepto: '',
        cantidad: 1,
        precioUnitario: 0,
        ivaPorcentaje: 21
      }
    ];
  });

  const [formError, setFormError] = useState<string | null>(null);

  // Filter obras based on selected client
  const clientObras = useMemo(() => {
    if (!clientId) return [];
    return obras.filter(o => o.clientId === clientId);
  }, [clientId, obras]);

  // When client changes, clear selected obra if it doesn't belong to the new client
  useEffect(() => {
    if (clientId) {
      const belongs = clientObras.some(o => o.id === obraId);
      if (!belongs) {
        setObraId(''); // Clear or set the first one
        if (clientObras.length === 1) {
          setObraId(clientObras[0].id);
        }
      }
    } else {
      setObraId('');
    }
  }, [clientId, clientObras, obraId]);

  // Handle adding line item
  const handleAddLine = () => {
    const newLine: LineaFactura = {
      id: `lin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tipo: 'libre',
      productoId: null,
      concepto: '',
      cantidad: 1,
      precioUnitario: 0,
      ivaPorcentaje: 21
    };
    setLineas(prev => [...prev, newLine]);
  };

  // Handle removing line item
  const handleRemoveLine = (id: string) => {
    // If it's the last line, don't remove, just reset it to avoid empty states
    if (lineas.length === 1) {
      setLineas([
        {
          id: `lin_${Date.now()}`,
          tipo: 'libre',
          productoId: null,
          concepto: '',
          cantidad: 1,
          precioUnitario: 0,
          ivaPorcentaje: 21
        }
      ]);
      return;
    }
    setLineas(prev => prev.filter(l => l.id !== id));
  };

  // Handle line item update
  const handleUpdateLine = (id: string, field: keyof LineaFactura, value: any) => {
    setLineas(prev =>
      prev.map(l => {
        if (l.id === id) {
          const updated = { ...l, [field]: value } as LineaFactura;

          // Type changes between product and custom
          if (field === 'tipo') {
            if (value === 'libre') {
              updated.productoId = null;
              updated.concepto = '';
              updated.precioUnitario = 0;
            } else if (value === 'producto') {
              // Prepopulate with first active product if any exist
              const activeProducts = productos.filter(p => p.activo);
              const p = activeProducts.length > 0 ? activeProducts[0] : null;
              if (p) {
                updated.productoId = p.id;
                updated.concepto = p.nombre;
                updated.precioUnitario = p.precioVenta;
              }
            }
          }

          // Specific catalog product is selected
          if (field === 'productoId') {
            const p = productos.find(prod => prod.id === value);
            if (p) {
              updated.concepto = p.nombre;
              updated.precioUnitario = p.precioVenta;
            }
          }

          return updated;
        }
        return l;
      })
    );
  };

  // Calculate totals on-the-fly for reactive display
  const totals = useMemo(() => {
    return calculateFacturaTotals(lineas);
  }, [lineas]);

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validations
    if (!clientId) {
      setFormError('Por favor, selecciona un cliente.');
      return;
    }
    if (!obraId) {
      setFormError('Por favor, asocia esta factura a una obra/proyecto.');
      return;
    }
    if (lineas.length === 0) {
      setFormError('La factura debe tener al menos una línea de concepto.');
      return;
    }

    // Check empty line concepts or negative quantities/prices
    const hasInvalidLine = lineas.some(l => !l.concepto.trim() || l.cantidad <= 0 || l.precioUnitario < 0);
    if (hasInvalidLine) {
      setFormError('Revisa las líneas. Todos los conceptos deben tener descripción, cantidad mayor a 0 y precio positivo.');
      return;
    }

    // Cleaned payload matches types
    const cleanLines = lineas.map(l => ({
      id: l.id.startsWith('lin_init_') ? `lin_${Date.now()}_${Math.floor(Math.random() * 1000)}` : l.id,
      tipo: l.tipo,
      productoId: l.productoId,
      concepto: l.concepto.trim(),
      cantidad: Number(l.cantidad),
      precioUnitario: Number(l.precioUnitario),
      ivaPorcentaje: Number(l.ivaPorcentaje) as 21 | 10 | 0
    }));

    onSubmit({
      clientId,
      obraId,
      fechaEmision,
      fechaVencimiento,
      lineas: cleanLines,
      estado,
      observaciones: observaciones.trim()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top sticky actions panel */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            {factura ? `Editar Factura ${factura.numero}` : 'Crear Nueva Factura de Venta'}
          </h2>
          <p className="text-[11px] text-slate-400">Rellena los datos fiscales, selecciona el cliente y añade las líneas.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="h-9 text-xs font-semibold hover:bg-slate-100 text-slate-500 rounded-lg transition-colors px-3.5"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="h-9 bg-verini-black hover:bg-black/90 text-white text-xs font-semibold gap-1.5 rounded-lg shadow-xs transition-all px-4 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            {factura ? 'Guardar Cambios' : 'Emitir / Guardar Factura'}
          </Button>
        </div>
      </div>

      {formError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center gap-2 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Fiscal data and header parameters (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-xs bg-white">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2">1. Datos de Facturación e Identificación</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Invoice Number (Read only for display) */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-slate-400" />
                    Número de Factura
                  </label>
                  <Input
                    type="text"
                    value={factura ? factura.numero : `${nextNumero} (Borrador)`}
                    disabled
                    className="h-9 text-xs bg-slate-50 border-slate-200 font-mono font-bold text-slate-800"
                  />
                </div>

                {/* Status Selector */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Estado Comercial</label>
                  <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value as Factura['estado'])}
                    className="w-full text-xs h-9 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 outline-none focus:border-verini-black focus:ring-1 focus:ring-verini-black/20"
                  >
                    <option value="Borrador">Borrador</option>
                    <option value="Emitida">Emitida</option>
                    <option value="Cobrada">Cobrada</option>
                    <option value="Vencida">Vencida</option>
                  </select>
                </div>

                {/* Client Selector */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cliente (Receptor)</label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    disabled={!!factura} // Don't allow client modification on edit to maintain ledger consistency
                    className="w-full text-xs h-9 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 outline-none focus:border-verini-black focus:ring-1 focus:ring-verini-black/20 disabled:bg-slate-50 disabled:text-slate-500"
                  >
                    <option value="">-- Selecciona un cliente --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} {c.apellidos} {c.empresa ? `(${c.empresa})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Project / Obra Selector */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Obra / Proyecto Relacionado</label>
                  <select
                    value={obraId}
                    onChange={(e) => setObraId(e.target.value)}
                    disabled={!clientId || !!factura}
                    className="w-full text-xs h-9 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 outline-none focus:border-verini-black focus:ring-1 focus:ring-verini-black/20 disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="">
                      {!clientId ? 'Selecciona un cliente primero' : clientObras.length === 0 ? 'Sin obras registradas para este cliente' : '-- Selecciona una obra --'}
                    </option>
                    {clientObras.map(o => (
                      <option key={o.id} value={o.id}>{o.codigo} - {o.titulo}</option>
                    ))}
                  </select>
                </div>

                {/* Dates picker */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Fecha de Emisión</label>
                  <Input
                    type="date"
                    value={fechaEmision}
                    onChange={(e) => setFechaEmision(e.target.value)}
                    className="h-9 text-xs border-slate-200 focus:ring-2 focus:ring-verini-black/20 focus:border-verini-black"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Fecha de Vencimiento</label>
                  <Input
                    type="date"
                    value={fechaVencimiento}
                    onChange={(e) => setFechaVencimiento(e.target.value)}
                    className="h-9 text-xs border-slate-200 focus:ring-2 focus:ring-verini-black/20 focus:border-verini-black"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lines Detailed Editor Card */}
          <Card className="border-slate-200 shadow-xs bg-white">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-900 text-xs">2. Líneas de Concepto (Artículos o Servicios)</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddLine}
                  className="h-8 border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100/50 gap-1 text-[11px] cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Añadir Línea
                </Button>
              </div>

              {/* Dynamic Table Input List */}
              <div className="space-y-4">
                {lineas.map((linea, index) => {
                  const subtotal = linea.cantidad * linea.precioUnitario;
                  const activeProducts = productos.filter(p => p.activo);

                  return (
                    <div 
                      key={linea.id} 
                      className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/40 relative group animate-in fade-in-40 duration-150"
                    >
                      {/* Left: Row Index or Remove */}
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(linea.id)}
                        className="absolute -top-1.5 -right-1.5 md:static h-6 w-6 rounded-full md:rounded-lg bg-red-50 text-red-500 border border-red-100 md:border-0 hover:bg-red-100 flex items-center justify-center md:col-span-1 shrink-0 self-center md:mt-5 transition-all text-xs"
                        title="Eliminar línea"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                      {/* Select between product catalog / free custom text */}
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest md:hidden">Tipo</label>
                        {index === 0 && <label className="hidden md:block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tipo</label>}
                        <select
                          value={linea.tipo}
                          onChange={(e) => handleUpdateLine(linea.id, 'tipo', e.target.value as 'producto' | 'libre')}
                          className="w-full text-xs h-9 rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-700 outline-none"
                        >
                          <option value="libre">Concepto libre</option>
                          <option value="producto">Del Catálogo</option>
                        </select>
                      </div>

                      {/* Concept detail / Product Selector */}
                      <div className="md:col-span-4 space-y-1">
                        {linea.tipo === 'producto' ? (
                          <>
                            {index === 0 && <label className="hidden md:block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Producto Catálogo</label>}
                            <select
                              value={linea.productoId || ''}
                              onChange={(e) => handleUpdateLine(linea.id, 'productoId', e.target.value)}
                              className="w-full text-xs h-9 rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-700 outline-none"
                            >
                              <option value="">-- Elige un producto --</option>
                              {activeProducts.map(p => (
                                <option key={p.id} value={p.id}>{p.nombre} ({p.codigo})</option>
                              ))}
                            </select>
                          </>
                        ) : (
                          <>
                            {index === 0 && <label className="hidden md:block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Descripción Concepto</label>}
                            <Input
                              type="text"
                              value={linea.concepto}
                              onChange={(e) => handleUpdateLine(linea.id, 'concepto', e.target.value)}
                              placeholder="Ej: Mano de obra pintura..."
                              className="h-9 text-xs border-slate-200"
                            />
                          </>
                        )}
                      </div>

                      {/* Quantity */}
                      <div className="md:col-span-1.5 space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest md:hidden">Cant</label>
                        {index === 0 && <label className="hidden md:block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cant</label>}
                        <Input
                          type="number"
                          min="0.01"
                          step="any"
                          value={linea.cantidad}
                          onChange={(e) => handleUpdateLine(linea.id, 'cantidad', parseFloat(e.target.value) || 0)}
                          className="h-9 text-xs border-slate-200"
                        />
                      </div>

                      {/* Unit Price */}
                      <div className="md:col-span-1.5 space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest md:hidden">Precio</label>
                        {index === 0 && <label className="hidden md:block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Precio</label>}
                        <div className="relative">
                          <Input
                            type="number"
                            min="0"
                            step="any"
                            value={linea.precioUnitario}
                            onChange={(e) => handleUpdateLine(linea.id, 'precioUnitario', parseFloat(e.target.value) || 0)}
                            className="h-9 text-xs border-slate-200 pr-5"
                          />
                          <span className="absolute top-2 right-1.5 text-[10px] text-slate-400">€</span>
                        </div>
                      </div>

                      {/* IVA rate % */}
                      <div className="md:col-span-1 space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest md:hidden">% IVA</label>
                        {index === 0 && <label className="hidden md:block text-[10px] font-bold text-slate-400 uppercase tracking-widest">% IVA</label>}
                        <select
                          value={linea.ivaPorcentaje}
                          onChange={(e) => handleUpdateLine(linea.id, 'ivaPorcentaje', parseInt(e.target.value, 10))}
                          className="w-full text-xs h-9 rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-slate-700 outline-none"
                        >
                          <option value="21">21%</option>
                          <option value="10">10%</option>
                          <option value="0">0%</option>
                        </select>
                      </div>

                      {/* Total line (Read only) */}
                      <div className="md:col-span-1 space-y-1">
                        {index === 0 && <label className="hidden md:block text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Subtotal</label>}
                        <div className="h-9 flex items-center justify-end font-bold text-xs text-slate-900 pr-1 select-none">
                          {subtotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Quick Add Bottom Button */}
              <Button
                type="button"
                variant="ghost"
                onClick={handleAddLine}
                className="w-full h-9 border border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs text-slate-800 font-semibold rounded-xl flex items-center justify-center gap-1 mt-2 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Añadir otro concepto o línea de artículo
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Side Sticky Panel: Real-time calculations and annotations */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-xs bg-white lg:sticky lg:top-6">
            <CardContent className="p-6 space-y-6">
              <h3 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Calculator className="h-4 w-4 text-slate-400" />
                Resumen Económico (Real-time)
              </h3>

              {/* Numeric blocks */}
              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="font-medium text-slate-500">Base Imponible:</span>
                  <span className="font-bold text-slate-800">
                    {totals.baseImponible.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>

                {/* Subtax items */}
                {totals.desgloseIva[21].base > 0 && (
                  <div className="flex justify-between text-[11px] text-slate-500 pl-2">
                    <span>IVA 21% (s/{totals.desgloseIva[21].base.toFixed(2)}):</span>
                    <span>+{totals.desgloseIva[21].cuota.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                  </div>
                )}
                {totals.desgloseIva[10].base > 0 && (
                  <div className="flex justify-between text-[11px] text-slate-500 pl-2">
                    <span>IVA 10% (s/{totals.desgloseIva[10].base.toFixed(2)}):</span>
                    <span>+{totals.desgloseIva[10].cuota.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                  </div>
                )}
                {totals.desgloseIva[0].base > 0 && (
                  <div className="flex justify-between text-[11px] text-slate-500 pl-2">
                    <span>Exento 0% (s/{totals.desgloseIva[0].base.toFixed(2)}):</span>
                    <span>+0,00 €</span>
                  </div>
                )}

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="font-medium text-slate-500">Impuestos (IVA):</span>
                  <span className="font-bold text-slate-800">
                    {totals.totalIva.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>

                <div className="flex justify-between py-3.5 bg-slate-50 px-4 rounded-xl border border-slate-200 text-slate-900">
                  <span className="font-extrabold text-xs">Total Neto Facturado:</span>
                  <span className="font-black text-sm text-slate-950">
                    {totals.total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
              </div>

              {/* Form text block for observaciones */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <FileSpreadsheet className="h-3.5 w-3.5 text-slate-400" />
                  Observaciones Internas / Notas de pago
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Instrucciones especiales para el cobro o notas técnicas..."
                  rows={4}
                  className="w-full text-xs rounded-lg border border-slate-200 bg-white p-2.5 text-slate-700 outline-none focus:border-verini-black focus:ring-1 focus:ring-verini-black/20"
                />
              </div>

              {/* Dynamic Warning Indicator if Vencida state chosen */}
              {estado === 'Vencida' && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg flex items-start gap-2 text-[11px]">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <strong className="block font-bold">Aviso de vencimiento:</strong>
                    El estado marcará la factura como retrasada, alertando en los paneles generales para su reclamación activa.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </form>
  );
}
