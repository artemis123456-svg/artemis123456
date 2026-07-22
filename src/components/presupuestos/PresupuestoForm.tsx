import React, { useState, useEffect, useMemo } from 'react';
import { PresupuestoNew, LineaPresupuesto, calculatePresupuestoTotals } from '../../types/presupuesto';
import { Client } from '../../types/client';
import { Obra } from '../../types/obra';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { DecimalInput } from '../ui/DecimalInput';
import { useProductos } from '../../hooks/useProductos';
import { 
  Plus, 
  Trash2, 
  Save, 
  X, 
  Calculator, 
  FileCheck2,
  Calendar,
  AlertCircle,
  Users
} from 'lucide-react';

interface PresupuestoFormProps {
  presupuesto?: PresupuestoNew;
  clients: Client[];
  obras: Obra[];
  onSubmit: (data: Omit<PresupuestoNew, 'id' | 'importeTotal'>) => void;
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
  const { productos, productosProveedores } = useProductos();
  const [activeSearchLineId, setActiveSearchLineId] = useState<string | null>(null);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [numeroManual, setNumeroManual] = useState(presupuesto?.numero || nextNumero || '');
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
        precioUnitario: 0,
        unidad: 'Ud'
      }
    ];
  });

  const [formError, setFormError] = useState<string | null>(null);

  // Autocomplete cliente
  const [clienteSearchQuery, setClienteSearchQuery] = useState('');
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);

  // Sincronizar search query cuando se selecciona cliente
  useEffect(() => {
    if (clientId) {
      const selected = clients.find(c => c.id === clientId);
      if (selected) {
        setClienteSearchQuery(`${selected.nombre} ${selected.apellidos || ''}`.trim());
      }
    } else {
      setClienteSearchQuery('');
    }
  }, [clientId, clients]);

  // Filtrar clientes basado en búsqueda
  const filteredClientes = useMemo(() => {
    const query = clienteSearchQuery.trim().toLowerCase();
    if (!query) return clients;
    
    return clients.filter(c => 
      c.nombre.toLowerCase().includes(query) ||
      (c.apellidos && c.apellidos.toLowerCase().includes(query)) ||
      (c.codigo && c.codigo.toLowerCase().includes(query)) ||
      (c.empresa && c.empresa.toLowerCase().includes(query))
    );
  }, [clients, clienteSearchQuery]);

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
      precioUnitario: 0,
      ivaPorcentaje: 21,
      tipo: 'libre',
      unidad: 'Ud'
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
          precioUnitario: 0,
          ivaPorcentaje: 21,
          tipo: 'libre',
          unidad: 'Ud'
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
          const updated = { ...l, [field]: value } as LineaPresupuesto;
          if (field === 'tipo') {
            if (value === 'libre') {
              updated.productoId = undefined;
              updated.referenciaProducto = undefined;
              updated.fotoUrl = undefined;
              updated.descripcion = '';
            } else if (value === 'producto') {
              updated.productoId = undefined;
              updated.referenciaProducto = undefined;
              updated.fotoUrl = undefined;
              updated.descripcion = '';
            }
          }
          return updated;
        }
        return l;
      })
    );
  };

  const totals = useMemo(() => {
    return calculatePresupuestoTotals(lineas);
  }, [lineas]);

  const handleSelectProductForLine = (lineId: string, p: any) => {
    const pps = productosProveedores[p.id] || [];
    const sellingPrice = p.precioVenta && p.precioVenta > 0 ? p.precioVenta : (pps.length > 0 ? pps[0].precioVenta : 0);
    
    setLineas(prev => prev.map(l => {
      if (l.id === lineId) {
        return {
          ...l,
          tipo: 'producto',
          productoId: p.id,
          referenciaProducto: p.codigo,
          descripcion: p.nombre,
          precioUnitario: sellingPrice,
          ivaPorcentaje: p.ivaPorDefecto !== undefined ? p.ivaPorDefecto : (l.ivaPorcentaje || 21),
          fotoUrl: p.imagenUrl || ''
        };
      }
      return l;
    }));
    setActiveSearchLineId(null);
    setProductSearchQuery('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!clientId) {
      setFormError('Por favor, selecciona un cliente');
      return;
    }

    if (!numeroManual.trim()) {
      setFormError('Por favor, introduce un número de presupuesto');
      return;
    }

    const hasEmptyDescription = lineas.some(l => !l.descripcion.trim());
    if (hasEmptyDescription) {
      setFormError('Todas las líneas de presupuesto deben tener una descripción');
      return;
    }

    // Valores negativos permitidos para descuentos a cuenta y devoluciones
    const hasInvalidNumbers = lineas.some(l => l.cantidad === 0);
    if (hasInvalidNumbers) {
      setFormError('Las cantidades deben ser diferentes de 0');
      return;
    }

    if (obraId && estado !== 'Aceptado') {
      setFormError('Solo puedes asignar a obra cuando el presupuesto está "Aceptado"');
      return;
    }

    onSubmit({
      clientId,
      obraId: obraId || null,
      fechaCreacion,
      fechaValidez: fechaValidez || null,
      descripcion,
      estado,
      numero: numeroManual,
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
              <div className="relative space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                  Cliente <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Busca cliente por nombre o código..."
                  value={clienteSearchQuery}
                  onChange={(e) => setClienteSearchQuery(e.target.value)}
                  onFocus={() => setShowClienteDropdown(true)}
                  onBlur={() => {
                    setTimeout(() => setShowClienteDropdown(false), 150);
                  }}
                  className="text-xs h-9.5 bg-white border-slate-200 focus-visible:ring-gray-900 font-semibold"
                />
                
                {showClienteDropdown && filteredClientes.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {filteredClientes.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setClientId(c.id);
                          setClienteSearchQuery(`${c.nombre} ${c.apellidos || ''}`.trim());
                          setShowClienteDropdown(false);
                        }}
                        className="px-3 py-2 hover:bg-slate-100 cursor-pointer text-xs font-semibold transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span>{c.nombre} {c.apellidos || ''} {c.empresa ? `(${c.empresa})` : ''}</span>
                          {c.codigo && <span className="text-[10px] text-slate-400">({c.codigo})</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {showClienteDropdown && clienteSearchQuery.trim() && filteredClientes.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 px-3 py-2">
                    <p className="text-xs text-slate-400">No hay clientes que coincidan con "{clienteSearchQuery}"</p>
                  </div>
                )}
              </div>

              {/* Asignar a Obra */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Asignar a Obra
                </label>
                
                {estado !== 'Aceptado' ? (
                  <div className="h-9.5 flex items-center px-3 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-500 italic">
                    ⚠️ Acepta el presupuesto para asignar a una obra
                  </div>
                ) : (
                  <select
                    value={obraId || ''}
                    onChange={(e) => setObraId(e.target.value || null)}
                    className="w-full h-9.5 bg-slate-50/20 border border-slate-200 rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 font-semibold text-slate-800"
                  >
                    <option value="">-- Selecciona una obra --</option>
                    {clientObras.map(obra => (
                      <option key={obra.id} value={obra.id}>
                        {obra.titulo}
                      </option>
                    ))}
                  </select>
                )}
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
            
            {/* Código de Presupuesto (Manual) */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Número de Presupuesto
              </label>
              <Input
                type="text"
                placeholder={`Ej: ${nextNumero}`}
                value={numeroManual}
                onChange={(e) => setNumeroManual(e.target.value)}
                className="h-9.5 text-xs border-slate-200 font-semibold focus-visible:ring-gray-900 bg-white"
                required
              />
            </div>

            {/* Estado del Presupuesto */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Estado del Presupuesto
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as PresupuestoNew['estado'])}
                className="w-full h-9.5 bg-slate-50/20 border border-slate-200 rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 font-bold text-slate-800"
              >
                <option value="Borrador">Borrador</option>
                <option value="Enviado">Enviado</option>
                <option value="Aprobado">Aprobado</option>
                <option value="Aceptado">Aceptado (cliente)</option>
                <option value="Rechazado">Rechazado</option>
              </select>
            </div>

            {/* Total Indicator Box */}
            <div className="p-4 bg-gray-50 border border-gray-150 rounded-xl space-y-2 mt-4">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Total Estimado (+IVA)</span>
                <span className="text-gray-900">IVA Variable</span>
              </div>
              <div className={`text-2xl font-mono font-black text-right ${totals.total < 0 ? 'text-red-600' : 'text-slate-900'}`}>
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
              const isProducto = linea.tipo === 'producto';

              return (
                <div 
                  key={linea.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 bg-slate-50/40 hover:bg-slate-50/75 border border-slate-150 rounded-xl transition-colors items-end relative"
                >
                  {/* Selector de Tipo */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Tipo</label>
                    <select
                      value={linea.tipo || 'libre'}
                      onChange={(e) => handleUpdateLine(linea.id, 'tipo', e.target.value as 'producto' | 'libre')}
                      className="w-full text-xs h-9 rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-700 outline-none focus:border-gray-900 font-semibold"
                    >
                      <option value="libre">Concepto libre</option>
                      <option value="producto">Del Catálogo</option>
                    </select>
                  </div>

                  {/* Concepto / Descripción o Selector */}
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                      Concepto / Descripción <span className="text-red-500">*</span>
                    </label>
                    {isProducto ? (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setActiveSearchLineId(linea.id);
                            setProductSearchQuery('');
                          }}
                          className="h-9 text-xs flex items-center gap-1.5 px-2.5 border-slate-200 hover:bg-slate-50 shrink-0 font-bold"
                        >
                          🔍 Buscar
                        </Button>
                        <Input
                          required
                          placeholder="Ningún producto seleccionado"
                          value={linea.descripcion}
                          onChange={e => handleUpdateLine(linea.id, 'descripcion', e.target.value)}
                          className="text-xs h-9 bg-white border-slate-200 focus-visible:ring-gray-900 flex-1 font-semibold"
                        />
                      </div>
                    ) : (
                      <Input
                        required
                        placeholder="ej. Suministro e instalación de plato de ducha..."
                        value={linea.descripcion}
                        onChange={e => handleUpdateLine(linea.id, 'descripcion', e.target.value)}
                        className="text-xs h-9 bg-white border-slate-200 focus-visible:ring-gray-900 font-semibold"
                      />
                    )}
                  </div>

                  {/* Cantidad */}
                  <div className="md:col-span-1 space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Cant.</label>
                    <DecimalInput
                      value={linea.cantidad}
                      onChange={(val) => handleUpdateLine(linea.id, 'cantidad', val)}
                      className="text-xs h-9 bg-white border-slate-200 focus-visible:ring-gray-900 font-semibold"
                    />
                  </div>

                  {/* Unidad de Medida */}
                  <div className="md:col-span-1 space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                      Unidad
                    </label>
                    <select
                      value={linea.unidad || 'Ud'}
                      onChange={(e) => handleUpdateLine(linea.id, 'unidad', e.target.value as any)}
                      className="w-full h-9 bg-white border border-slate-200 rounded-lg px-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 font-semibold text-slate-800"
                    >
                      <option value="PA">PA</option>
                      <option value="Ud">Ud</option>
                      <option value="M2">M²</option>
                      <option value="ML">ML</option>
                    </select>
                  </div>

                  {/* Precio Unitario */}
                  <div className="md:col-span-1.5 space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Precio Unitario</label>
                    <div className="relative">
                      <DecimalInput
                        value={linea.precioUnitario}
                        onChange={(val) => handleUpdateLine(linea.id, 'precioUnitario', val)}
                        className="text-xs h-9 bg-white pr-5 font-mono font-bold border-slate-200 focus-visible:ring-gray-900"
                      />
                      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-bold">€</span>
                    </div>
                  </div>

                  {/* IVA Percentage */}
                  <div className="md:col-span-1 space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">IVA %</label>
                    <select
                      value={linea.ivaPorcentaje || 21}
                      onChange={(e) => handleUpdateLine(linea.id, 'ivaPorcentaje', parseInt(e.target.value) as 21 | 10 | 0)}
                      className="w-full h-9 text-xs rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-slate-700 outline-none focus:border-gray-900 font-semibold"
                    >
                      <option value="21">21%</option>
                      <option value="10">10%</option>
                      <option value="0">0%</option>
                    </select>
                  </div>

                  {/* Total de Línea (Calculado Automáticamente) */}
                  <div className="md:col-span-1.5 space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Subtotal</label>
                    <div className={`h-9 flex items-center justify-end px-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono font-bold ${subtotal < 0 ? 'text-red-600' : 'text-slate-800'}`}>
                      {subtotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </div>
                  </div>

                  {/* Eliminar Línea / Miniatura */}
                  <div className="md:col-span-1 flex items-center justify-between gap-1.5 self-center">
                    {/* Si hay fotoUrl, mostrar miniatura */}
                    {linea.fotoUrl ? (
                      <div className="relative shrink-0">
                        <img 
                          src={linea.fotoUrl} 
                          alt={linea.referenciaProducto || 'foto'} 
                          className="w-8 h-8 object-cover rounded-md border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 flex items-center justify-center border border-dashed border-slate-200 rounded-md text-[8px] text-slate-300 uppercase shrink-0 select-none">
                        s/f
                      </div>
                    )}
                    
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleRemoveLine(linea.id)}
                      className="h-8 w-8 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer shrink-0 flex items-center justify-center p-0"
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
              * El IVA del presupuesto se puede seleccionar individualmente por línea (21%, 10% o 0%).
            </p>

            <div className="w-full md:w-80 space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200/50">
              <div className="flex justify-between items-center text-xs text-slate-600 font-medium">
                <span>Base Imponible:</span>
                <span className={`font-mono font-bold ${totals.baseImponible < 0 ? 'text-red-600' : 'text-slate-900'}`}>{totals.baseImponible.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
              </div>
              
              {/* Dynamic breakdown */}
              {totals.desgloseIva[21].base > 0 && (
                <div className="space-y-1 pl-2 border-l-2 border-slate-200">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Base (21%):</span>
                    <span>{totals.desgloseIva[21].base.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Cuota IVA (21%):</span>
                    <span>{totals.desgloseIva[21].cuota.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
                  </div>
                </div>
              )}
              {totals.desgloseIva[10].base > 0 && (
                <div className="space-y-1 pl-2 border-l-2 border-slate-200">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Base (10%):</span>
                    <span>{totals.desgloseIva[10].base.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Cuota IVA (10%):</span>
                    <span>{totals.desgloseIva[10].cuota.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
                  </div>
                </div>
              )}
              {totals.desgloseIva[0].base > 0 && (
                <div className="space-y-1 pl-2 border-l-2 border-slate-200">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Base (0% - Exento):</span>
                    <span>{totals.desgloseIva[0].base.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center text-xs text-slate-600 font-medium pb-2 border-b border-slate-200/60 pt-1">
                <span>Total IVA:</span>
                <span className={`font-mono font-bold ${totals.totalIva < 0 ? 'text-red-600' : 'text-slate-900'}`}>{totals.totalIva.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
              </div>
              
              <div className="flex justify-between items-center text-xs font-black text-slate-900 pt-1">
                <span className="uppercase tracking-wider">Importe Total:</span>
                <span className={`font-mono text-lg ${totals.total < 0 ? 'text-red-600' : ''}`}>{totals.total.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
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

      {/* Product Selection Modal Overlay */}
      {activeSearchLineId !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Buscar Producto Catálogo</h3>
              <button
                type="button"
                onClick={() => {
                  setActiveSearchLineId(null);
                  setProductSearchQuery('');
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 border-b border-slate-100">
              <Input
                type="text"
                placeholder="Escribe para buscar por nombre o código de producto..."
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                className="text-xs h-9.5"
                autoFocus
              />
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {(() => {
                const query = productSearchQuery.trim().toLowerCase();
                const filtered = productos.filter(p => 
                  p.activo && (
                    p.nombre.toLowerCase().includes(query) ||
                    p.codigo.toLowerCase().includes(query) ||
                    (p.descripcion && p.descripcion.toLowerCase().includes(query))
                  )
                );
                
                if (filtered.length === 0) {
                  return (
                    <div className="p-8 text-center text-xs text-slate-400 italic">
                      No se encontraron productos que coincidan.
                    </div>
                  );
                }
                
                return filtered.map(p => {
                  const pps = productosProveedores[p.id] || [];
                  const sellingPrice = pps.length > 0 ? pps[0].precioVenta : 0;
                  
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectProductForLine(activeSearchLineId, p)}
                      className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg text-left transition-colors border-b border-slate-50"
                    >
                      {p.imagenUrl ? (
                        <img
                          src={p.imagenUrl}
                          alt={p.nombre}
                          className="w-10 h-10 object-cover rounded-md border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-slate-100 rounded-md border border-slate-200 flex items-center justify-center text-[10px] text-slate-400">
                          Sin foto
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-800 truncate">{p.nombre}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Cód: {p.codigo}</div>
                      </div>
                      <div className="text-xs font-bold text-slate-900 shrink-0 font-mono">
                        {sellingPrice.toFixed(2)} €
                      </div>
                    </button>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
