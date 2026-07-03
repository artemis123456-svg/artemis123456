import React, { useState, useEffect, useMemo } from 'react';
import { PresupuestoNew, LineaPresupuesto, calculatePresupuestoTotals } from '../../types/presupuesto';
import { Client } from '../../types/client';
import { Obra } from '../../types/obra';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { 
  Plus, 
  Trash2, 
  Save, 
  X, 
  Calculator, 
  FileCheck2,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface PresupuestoFormProps {
  presupuesto?: PresupuestoNew;
  clients: Client[];
  obras: Obra[];
  onSubmit: (data: Omit<PresupuestoNew, 'id' | 'numero' | 'importeTotal'>) => void;
  onCancel: () => void;
  nextNumero: string;
}

export default function PresupuestoForm({
  presupuesto,
  clients,
  obras,
  onSubmit,
  onCancel,
  nextNumero
}: PresupuestoFormProps) {
  const [clientId, setClientId] = useState(presupuesto?.clientId || '');
  const [obraId, setObraId] = useState(presupuesto?.obraId || '');
  
  const [fechaCreacion, setFechaCreacion] = useState(() => {
    if (presupuesto?.fechaCreacion) return presupuesto.fechaCreacion;
    return new Date().toISOString().split('T')[0];
  });
  
  const [fechaValidez, setFechaValidez] = useState(() => {
    if (presupuesto?.fechaValidez) return presupuesto.fechaValidez;
    const date = new Date();
    date.setDate(date.getDate() + 30); // 30 days default validity
    return date.toISOString().split('T')[0];
  });
  
  const [estado, setEstado] = useState<PresupuestoNew['estado']>(presupuesto?.estado || 'Borrador');
  const [descripcion, setDescripcion] = useState(presupuesto?.descripcion || '');
  
  const [lineas, setLineas] = useState<LineaPresupuesto[]>(() => {
    if (presupuesto?.lineas && presupuesto.lineas.length > 0) return presupuesto.lineas;
    return [
      {
        id: `lin_init_1`,
        descripcion: '',
        cantidad: 1,
        precioUnitario: 0
      }
    ];
  });

  const [formError, setFormError] = useState<string | null>(null);

  const clientObras = useMemo(() => {
    if (!clientId) return [];
    return obras.filter(o => o.clientId === clientId);
  }, [clientId, obras]);

  useEffect(() => {
    if (clientId) {
      const belongs = clientObras.some(o => o.id === obraId);
      if (!belongs) {
        setObraId('');
        if (clientObras.length === 1) {
          setObraId(clientObras[0].id);
        }
      }
    } else {
      setObraId('');
    }
  }, [clientId, clientObras, obraId]);

  const handleAddLine = () => {
    const newLine: LineaPresupuesto = {
      id: `lin_temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      descripcion: '',
      cantidad: 1,
      precioUnitario: 0
    };
    setLineas(prev => [...prev, newLine]);
  };

  const handleRemoveLine = (id: string) => {
    if (lineas.length === 1) {
      setLineas([
        {
          id: `lin_init_reset_${Date.now()}`,
          descripcion: '',
          cantidad: 1,
          precioUnitario: 0
        }
      ]);
      return;
    }
    setLineas(prev => prev.filter(l => l.id !== id));
  };

  const handleUpdateLine = (id: string, field: keyof LineaPresupuesto, value: any) => {
    setLineas(prev =>
      prev.map(l => {
        if (l.id === id) {
          return { ...l, [field]: value } as LineaPresupuesto;
        }
        return l;
      })
    );
  };

  const totals = useMemo(() => {
    return calculatePresupuestoTotals(lineas);
  }, [lineas]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!clientId) {
      setFormError('Por favor, selecciona un cliente');
      return;
    }

    const hasEmptyDescription = lineas.some(l => !l.descripcion.trim());
    if (hasEmptyDescription) {
      setFormError('Todas las líneas de presupuesto deben tener una descripción');
      return;
    }

    const hasInvalidNumbers = lineas.some(l => l.cantidad <= 0 || l.precioUnitario < 0);
    if (hasInvalidNumbers) {
      setFormError('Las cantidades deben ser superiores a 0 y los precios no pueden ser negativos');
      return;
    }

    onSubmit({
      clientId,
      obraId: obraId || null,
      fechaCreacion,
      fechaValidez: fechaValidez || null,
      descripcion,
      estado,
      lineas
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-red-800 text-xs font-semibold">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Grid: Client & Info details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Info Card */}
        <Card className="lg:col-span-2 border-slate-200/80 shadow-xs bg-white rounded-xl">
          <CardContent className="p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Información de Cabecera</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Cliente */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  Cliente <span className="text-red-500">*</span>
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full h-9.5 bg-slate-50/20 border border-slate-200 rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 font-semibold"
                  required
                >
                  <option value="">Selecciona un cliente</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre} {c.apellidos} {c.empresa ? `(${c.empresa})` : ''}</option>
                  ))}
                </select>
              </div>

              {/* Obra / Proyecto */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  Obra / Proyecto Asociado
                </label>
                <select
                  value={obraId}
                  onChange={(e) => setObraId(e.target.value)}
                  className="w-full h-9.5 bg-slate-50/20 border border-slate-200 rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 font-semibold text-slate-800"
                  disabled={!clientId}
                >
                  <option value="">{clientId ? 'No asociar a ninguna obra' : 'Selecciona un cliente primero'}</option>
                  {clientObras.map(o => (
                    <option key={o.id} value={o.id}>{o.titulo}</option>
                  ))}
                </select>
              </div>

              {/* Fecha de Creación */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Fecha de Creación
                </label>
                <Input
                  type="date"
                  required
                  value={fechaCreacion}
                  onChange={(e) => setFechaCreacion(e.target.value)}
                  className="text-xs h-9.5 bg-slate-50/20 focus-visible:ring-gray-900"
                />
              </div>

              {/* Fecha de Validez */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Fecha de Validez
                </label>
                <Input
                  type="date"
                  value={fechaValidez || ''}
                  onChange={(e) => setFechaValidez(e.target.value)}
                  className="text-xs h-9.5 bg-slate-50/20 focus-visible:ring-gray-900"
                />
              </div>
            </div>

            {/* General Description / Memo */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                Descripción General / Notas del Presupuesto
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Indica un resumen o condiciones del presupuesto..."
                rows={2}
                className="w-full bg-slate-50/20 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 text-slate-800 font-medium"
              />
            </div>
          </CardContent>
        </Card>

        {/* Status & Auto-code Card */}
        <Card className="border-slate-200/80 shadow-xs bg-white rounded-xl">
          <CardContent className="p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Metadatos del Presupuesto</h3>
            
            {/* Budget Number (Automatic) */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Código Presupuesto</label>
              <div className="h-9.5 flex items-center px-3 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold font-mono text-slate-800 select-all">
                {presupuesto?.numero || nextNumero}
                <span className="ml-auto text-[8.5px] font-bold bg-slate-250 text-slate-600 px-1.5 py-0.5 rounded uppercase">Autogenerado</span>
              </div>
            </div>

            {/* Estado del Presupuesto */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Estado</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as PresupuestoNew['estado'])}
                className="w-full h-9.5 bg-slate-50/20 border border-slate-200 rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 font-bold text-slate-800"
              >
                <option value="Borrador">Borrador</option>
                <option value="Enviado">Enviado (a Cliente)</option>
                <option value="Aprobado">Aprobado / Aceptado</option>
                <option value="Rechazado">Rechazado</option>
              </select>
            </div>

            {/* Total Indicator Box */}
            <div className="p-4 bg-gray-50 border border-gray-150 rounded-xl space-y-2 mt-4">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Total Estimado (+IVA)</span>
                <span className="text-gray-900">21% IVA Incl.</span>
              </div>
              <div className="text-2xl font-mono font-black text-slate-900 text-right">
                {totals.total.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Line Items Section */}
      <Card className="border-slate-200/80 shadow-xs bg-white rounded-xl overflow-hidden">
        <div className="bg-slate-50/65 border-b border-slate-150 py-3.5 px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-slate-500" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Líneas del Presupuesto</h3>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddLine}
            className="h-8 px-2.5 text-[11px] font-bold text-gray-800 hover:bg-slate-150 border-slate-250 cursor-pointer flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5 text-gray-700" />
            Añadir Línea
          </Button>
        </div>

        <CardContent className="p-4 sm:p-5">
          <div className="space-y-4">
            {lineas.map((linea, index) => {
              const subtotal = linea.cantidad * linea.precioUnitario;
              return (
                <div 
                  key={linea.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 bg-slate-50/40 hover:bg-slate-50/75 border border-slate-150 rounded-xl transition-colors items-end relative"
                >
                  {/* Concepto / Descripción */}
                  <div className="md:col-span-6 space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Concepto / Descripción del servicio <span className="text-red-500">*</span></label>
                    <Input
                      required
                      placeholder="ej. Suministro e instalación de plato de ducha..."
                      value={linea.descripcion}
                      onChange={e => handleUpdateLine(linea.id, 'descripcion', e.target.value)}
                      className="text-xs h-9 bg-white border-slate-200 focus-visible:ring-gray-900"
                    />
                  </div>

                  {/* Cantidad */}
                  <div className="md:col-span-1.5 space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Cant.</label>
                    <Input
                      required
                      type="number"
                      min="0.01"
                      step="any"
                      value={linea.cantidad || ''}
                      onChange={e => handleUpdateLine(linea.id, 'cantidad', Math.max(0.01, Number(e.target.value) || 0))}
                      className="text-xs h-9 bg-white border-slate-200 focus-visible:ring-gray-900 font-semibold"
                    />
                  </div>

                  {/* Precio Unitario */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Precio Unitario</label>
                    <div className="relative">
                      <Input
                        required
                        type="number"
                        min="0"
                        step="any"
                        value={linea.precioUnitario || ''}
                        onChange={e => handleUpdateLine(linea.id, 'precioUnitario', Math.max(0, Number(e.target.value) || 0))}
                        className="text-xs h-9 bg-white pr-6 font-mono font-bold border-slate-200 focus-visible:ring-gray-900"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-bold">€</span>
                    </div>
                  </div>

                  {/* Total de Línea (Calculado Automáticamente) */}
                  <div className="md:col-span-1.5 space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Línea</label>
                    <div className="h-9 flex items-center justify-end px-3 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800">
                      {subtotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </div>
                  </div>

                  {/* Eliminar Línea */}
                  <div className="md:col-span-1 flex items-end justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleRemoveLine(linea.id)}
                      className="h-9 w-9 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer shrink-0 flex items-center justify-center"
                      title="Eliminar línea"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table Totals break down */}
          <div className="mt-6 border-t border-slate-100 pt-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
            <p className="text-[11px] font-semibold text-slate-400 max-w-sm">
              * El IVA de los presupuestos se calcula con el tipo general estándar del 21%. Se desglosará fiscalmente en las facturas de certificación correspondientes.
            </p>

            <div className="w-full md:w-80 space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200/50">
              <div className="flex justify-between items-center text-xs text-slate-600 font-medium">
                <span>Base Imponible:</span>
                <span className="font-mono text-slate-900 font-bold">{totals.baseImponible.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-600 font-medium pb-2 border-b border-slate-200/60">
                <span>Suma IVA (21%):</span>
                <span className="font-mono text-slate-900 font-bold">{totals.totalIva.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
              </div>
              <div className="flex justify-between items-center text-xs font-black text-slate-900 pt-1">
                <span className="uppercase tracking-wider">Importe Total:</span>
                <span className="font-mono text-lg">{totals.total.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3.5 pt-4 border-t border-slate-100">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="h-10 px-5 text-xs font-semibold hover:bg-slate-100 border-slate-200 cursor-pointer text-slate-700"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs h-10 px-5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
        >
          <Save className="h-4 w-4" />
          {presupuesto ? 'Guardar Cambios' : 'Generar Presupuesto'}
        </Button>
      </div>
    </form>
  );
}
