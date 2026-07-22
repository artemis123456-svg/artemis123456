import React, { useState, useEffect, useMemo } from 'react';
import { FacturaProveedor, LineaFacturaProveedor } from '../../types/facturaProveedor';
import { Proveedor } from '../../types/proveedor';
import { Obra } from '../../types/obra';
import { Producto } from '../../types/producto';
import { calculateFacturaProveedorTotals } from '../../hooks/useFacturasProveedor';
import { useProductos } from '../../hooks/useProductos';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { DecimalInput } from '../ui/DecimalInput';
import { 
  Plus, 
  Trash2, 
  Save, 
  X, 
  Calendar, 
  Briefcase, 
  Layers, 
  FileText,
  Percent,
  Search,
  ShoppingCart,
  CreditCard
} from 'lucide-react';

interface FacturaProveedorFormProps {
  factura?: FacturaProveedor; // If provided, we are editing
  proveedores: Proveedor[];
  obras: Obra[];
  productos: Producto[];
  onSave: (facturaData: Omit<FacturaProveedor, 'id'>) => Promise<void>;
  onCancel: () => void;
}

export default function FacturaProveedorForm({
  factura,
  proveedores,
  obras,
  productos,
  onSave,
  onCancel
}: FacturaProveedorFormProps) {
  const isEdit = !!factura;
  const { productosProveedores } = useProductos();

  // Header state
  const [numero, setNumero] = useState('');
  const [proveedorId, setProveedorId] = useState('');
  const [fechaEmision, setFechaEmision] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [estado, setEstado] = useState<'Pendiente' | 'Pagada' | 'Vencida'>('Pendiente');
  const [retencionIrpf, setRetencionIrpf] = useState<number>(0);
  const [observaciones, setObservaciones] = useState('');

  // Payment Options state
  const [metodoPago, setMetodoPago] = useState<'Transferencia' | 'Tarjeta' | 'Efectivo' | 'Giro Bancario'>('Transferencia');
  const [plazosDias, setPlazosDias] = useState<number>(0);
  const [referenciaBancaria, setReferenciaBancaria] = useState('');

  // Product search code state per line
  const [searchCodes, setSearchCodes] = useState<Record<string, string>>({});

  // Autocomplete state for Proveedor
  const [provSearchQuery, setProvSearchQuery] = useState('');
  const [showProvDropdown, setShowProvDropdown] = useState(false);

  // Filtered providers for autocomplete
  const filteredProveedores = useMemo(() => {
    const query = provSearchQuery.trim().toLowerCase();
    if (!query) return proveedores;
    return proveedores.filter(p => 
      p.nombre.toLowerCase().includes(query) ||
      (p.codigo && p.codigo.toLowerCase().includes(query)) ||
      (p.nifCif && p.nifCif.toLowerCase().includes(query))
    );
  }, [proveedores, provSearchQuery]);

  // Synchronize search query when editing or supplier selected
  useEffect(() => {
    if (proveedorId) {
      const selected = proveedores.find(p => p.id === proveedorId);
      if (selected) {
        setProvSearchQuery(selected.nombre);
      }
    } else {
      setProvSearchQuery('');
    }
  }, [proveedorId, proveedores]);

  // Lines state
  const [lineas, setLineas] = useState<LineaFacturaProveedor[]>([]);

  // Initialize form with existing data if editing, or default values if creating
  useEffect(() => {
    if (isEdit && factura) {
      setNumero(factura.numero);
      setProveedorId(factura.proveedorId);
      setFechaEmision(factura.fechaEmision);
      setFechaVencimiento(factura.fechaVencimiento);
      setEstado(factura.estado);
      setRetencionIrpf(factura.retencionIrpf || 0);
      setObservaciones(factura.observaciones || '');
      setLineas(factura.lineas.map(l => ({ ...l })));
      setMetodoPago(factura.metodoPago || 'Transferencia');
      setPlazosDias(factura.plazosDias || 0);
      setReferenciaBancaria(factura.referenciaBancaria || '');

      // Pre-populate searchCodes for existing lines
      const codes: Record<string, string> = {};
      factura.lineas.forEach(l => {
        if (l.productoId) {
          const p = productos.find(prod => prod.id === l.productoId);
          if (p) {
            codes[l.id] = p.codigo;
          }
        } else if (l.tipo === 'libre') {
          codes[l.id] = '.';
        }
      });
      setSearchCodes(codes);
    } else {
      const today = new Date().toISOString().split('T')[0];
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const vencimiento = nextMonth.toISOString().split('T')[0];

      setNumero('');
      setProveedorId('');
      setProvSearchQuery('');
      setFechaEmision(today);
      setFechaVencimiento(vencimiento);
      setEstado('Pendiente');
      setRetencionIrpf(0);
      setObservaciones('');
      setMetodoPago('Transferencia');
      setPlazosDias(0);
      setReferenciaBancaria('');
      
      // Start with 1 empty product line
      setLineas([
        {
          id: `temp_${Date.now()}_0`,
          facturaProveedorId: '',
          tipo: 'producto',
          productoId: null,
          concepto: '',
          cantidad: 1,
          precioUnitario: 0,
          ivaPorcentaje: 21,
          obraId: null,
          orden: 0
        }
      ]);
    }
  }, [factura, isEdit, proveedores]);

  // Search product by code and autofill line
  const handleCodeSearch = (index: number, code: string) => {
    const updated = [...lineas];
    const targetLine = { ...updated[index] };
    const trimmedCode = code.trim();

    if (trimmedCode === '.') {
      // Free text mode
      targetLine.tipo = 'libre';
      targetLine.productoId = null;
    } else if (!trimmedCode) {
      // Empty code
      targetLine.productoId = null;
      targetLine.tipo = 'libre';
    } else {
      // Search for product by code
      const found = productos.find(p => p.codigo.trim().toLowerCase() === trimmedCode.toLowerCase());
      if (found) {
        targetLine.tipo = 'producto';
        targetLine.productoId = found.id;
        targetLine.concepto = found.nombre;

        const pps = productosProveedores[found.id] || [];
        const matchingPP = pps.find(pp => pp.proveedorId === proveedorId);

        if (matchingPP) {
          targetLine.precioUnitario = matchingPP.precioCompra;
        } else if (pps.length > 0) {
          // Fallback to first associated supplier if selected supplier doesn't match
          targetLine.precioUnitario = pps[0].precioCompra;
        } else {
          targetLine.precioUnitario = 0;
        }
      } else {
        // No matching product found, becomes editable free text line
        targetLine.productoId = null;
        targetLine.tipo = 'libre';
      }
    }

    updated[index] = targetLine;
    setLineas(updated);
  };

  // Handle adding a new empty line
  const handleAddLine = () => {
    const newLine: LineaFacturaProveedor = {
      id: `temp_${Date.now()}_${lineas.length}`,
      facturaProveedorId: '',
      tipo: 'producto',
      productoId: null,
      concepto: '',
      cantidad: 1,
      precioUnitario: 0,
      ivaPorcentaje: 21,
      obraId: null,
      orden: lineas.length
    };
    setLineas([...lineas, newLine]);
  };

  // Handle removing a line
  const handleRemoveLine = (index: number) => {
    if (lineas.length === 1) {
      alert('La factura debe tener al menos una línea de material.');
      return;
    }
    const updated = lineas.filter((_, idx) => idx !== index);
    // Re-index order
    const reindexed = updated.map((l, idx) => ({ ...l, orden: idx }));
    setLineas(reindexed);
  };

  // Handle line property updates
  const handleLineChange = (index: number, field: keyof LineaFacturaProveedor, value: any) => {
    const updated = [...lineas];
    const targetLine = { ...updated[index] };

    (targetLine as any)[field] = value;

    updated[index] = targetLine;
    setLineas(updated);
  };

  // Calculate live totals
  const liveTotals = useMemo(() => {
    return calculateFacturaProveedorTotals(lineas, retencionIrpf);
  }, [lineas, retencionIrpf]);

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!numero.trim()) {
      alert('Por favor introduzca el número de la factura.');
      return;
    }
    if (!proveedorId) {
      alert('Por favor seleccione un proveedor.');
      return;
    }

    // Validate lines
    for (let i = 0; i < lineas.length; i++) {
      const l = lineas[i];
      if (!l.concepto.trim()) {
        alert(`La línea #${i + 1} debe tener una descripción/concepto.`);
        return;
      }
      if (l.cantidad === 0) {
        alert(`La cantidad en la línea #${i + 1} debe ser diferente de cero.`);
        return;
      }
    }

    const payload: Omit<FacturaProveedor, 'id'> = {
      numero: numero.trim(),
      proveedorId,
      fechaEmision,
      fechaVencimiento,
      estado,
      retencionIrpf: Number(retencionIrpf) || 0,
      observaciones: observaciones.trim(),
      metodoPago,
      plazosDias: Number(plazosDias),
      referenciaBancaria: referenciaBancaria.trim(),
      lineas: lineas.map((l, index) => ({
        ...l,
        orden: index
      }))
    };

    try {
      await onSave(payload);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Form Title */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-950 uppercase tracking-wide">
            {isEdit ? `Editar Factura de Proveedor: ${factura?.numero}` : 'Nueva Factura de Proveedor'}
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Introduce los datos de cabecera y añade las líneas de material imputadas a las obras correspondientes.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="h-8 w-8 text-slate-400 hover:text-slate-700 cursor-pointer p-0"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Grid: Cabecera */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-5 border border-slate-150 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Número de Factura <span className="text-red-500">*</span></label>
          <Input
            required
            placeholder="ej. EXP-2026/89B"
            value={numero}
            onChange={e => setNumero(e.target.value)}
            className="text-xs h-9 font-semibold text-slate-800 border-slate-200 focus-visible:ring-verini-black"
          />
        </div>

        <div className="space-y-1 relative">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Proveedor <span className="text-red-500">*</span></label>
          <div className="relative">
            <Input
              required
              placeholder="Busca proveedor por nombre, código o CIF/NIF..."
              value={provSearchQuery}
              onChange={e => {
                setProvSearchQuery(e.target.value);
                setShowProvDropdown(true);
                const exactMatch = proveedores.find(p => p.nombre.toLowerCase() === e.target.value.trim().toLowerCase());
                if (exactMatch) {
                  setProveedorId(exactMatch.id);
                } else {
                  setProveedorId('');
                }
              }}
              onFocus={() => setShowProvDropdown(true)}
              onBlur={() => {
                setTimeout(() => setShowProvDropdown(false), 150);
              }}
              className="text-xs h-9 font-semibold text-slate-800 pr-8 border-slate-200 focus-visible:ring-verini-black"
            />
            <button
              type="button"
              onClick={() => setShowProvDropdown(!showProvDropdown)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
          </div>

          {showProvDropdown && filteredProveedores.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
              {filteredProveedores.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setProveedorId(p.id);
                    setProvSearchQuery(p.nombre);
                    setShowProvDropdown(false);
                  }}
                  className={`px-3 py-2 hover:bg-slate-100 cursor-pointer text-xs font-semibold transition-colors flex items-center justify-between ${
                    p.id === proveedorId ? 'bg-slate-50 text-verini-black font-bold' : 'text-slate-700'
                  }`}
                >
                  <span>{p.nombre} {p.nifCif ? `(${p.nifCif})` : ''}</span>
                  {p.codigo && <span className="text-[10px] font-mono text-slate-400">({p.codigo})</span>}
                </div>
              ))}
            </div>
          )}

          {showProvDropdown && provSearchQuery.trim() && filteredProveedores.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 px-3 py-2">
              <p className="text-xs text-slate-400">No hay proveedores que coincidan con "{provSearchQuery}"</p>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fecha Emisión <span className="text-red-500">*</span></label>
          <Input
            required
            type="date"
            value={fechaEmision}
            onChange={e => setFechaEmision(e.target.value)}
            className="text-xs h-9 border-slate-200 focus-visible:ring-verini-black font-medium"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fecha Vencimiento <span className="text-red-500">*</span></label>
          <Input
            required
            type="date"
            value={fechaVencimiento}
            onChange={e => setFechaVencimiento(e.target.value)}
            className="text-xs h-9 border-slate-200 focus-visible:ring-verini-black font-medium"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estado de la Factura</label>
          <select
            value={estado}
            onChange={e => setEstado(e.target.value as any)}
            className="w-full h-9 bg-white border border-slate-200 rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-verini-black font-semibold"
          >
            <option value="Pendiente">Pendiente</option>
            <option value="Pagada">Pagada</option>
            <option value="Vencida">Vencida</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Retención IRPF (%)</label>
          <div className="relative">
            <DecimalInput
              value={retencionIrpf}
              onChange={val => setRetencionIrpf(val)}
              className="text-xs h-9 border-slate-200 focus-visible:ring-verini-black pr-8 font-semibold text-slate-800"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold pointer-events-none">%</span>
          </div>
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Observaciones generales</label>
          <Input
            placeholder="Comentarios o notas internas sobre la factura de compra..."
            value={observaciones}
            onChange={e => setObservaciones(e.target.value)}
            className="text-xs h-9 border-slate-200 focus-visible:ring-verini-black"
          />
        </div>
      </div>

      {/* Sección Método de Pago */}
      <div className="bg-slate-50/40 border border-slate-150 p-5 rounded-2xl space-y-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <CreditCard className="h-4 w-4 text-slate-500" />
          Condiciones y Método de Pago
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Método de Pago</label>
            <select
              value={metodoPago}
              onChange={e => setMetodoPago(e.target.value as any)}
              className="w-full h-9 bg-white border border-slate-200 rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-verini-black font-semibold text-slate-800"
            >
              <option value="Transferencia">Transferencia</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Giro Bancario">Giro Bancario</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Plazo de Pago (Días)</label>
            <select
              value={plazosDias}
              onChange={e => setPlazosDias(Number(e.target.value))}
              className="w-full h-9 bg-white border border-slate-200 rounded-lg px-3 text-xs focus:outline-none focus:ring-1 focus:ring-verini-black font-semibold text-slate-800"
            >
              <option value="0">Al contado (0 días)</option>
              <option value="30">30 días</option>
              <option value="60">60 días</option>
              <option value="90">90 días</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Referencia de Pago / IBAN</label>
            <Input
              placeholder="ES00 0000 0000 0000 0000 0000"
              value={referenciaBancaria}
              onChange={e => setReferenciaBancaria(e.target.value)}
              className="text-xs h-9 bg-white border-slate-200 focus-visible:ring-verini-black text-slate-800 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Editor Dinámico de Líneas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Conceptos e Imputaciones a Obras</h3>
          <Button
            type="button"
            variant="outline"
            onClick={handleAddLine}
            className="text-xs h-8 px-3 gap-1.5 border-dashed border-slate-300 text-slate-600 hover:text-slate-900 hover:border-slate-400 rounded-lg cursor-pointer font-bold"
          >
            <Plus className="h-4 w-4" />
            Añadir Línea
          </Button>
        </div>

        {/* Lines layout */}
        <div className="space-y-4">
          {lineas.map((linea, index) => {
            const subtotal = linea.cantidad * linea.precioUnitario;
            const searchCodeVal = searchCodes[linea.id] || '';
            const matchingProduct = productos.find(p => p.id === linea.productoId);
            
            return (
              <div 
                key={linea.id || index} 
                className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-50/50 p-4 border border-slate-200/60 rounded-2xl relative"
              >
                {/* Header/Counter of line */}
                <div className="absolute -top-2.5 -left-2.5 h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-600 border border-white">
                  {index + 1}
                </div>

                {/* Referencia / Código */}
                <div className="md:col-span-3 space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Search className="h-3 w-3 text-slate-450" />
                    Referencia / Código
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="ej. PRD-001 o . para libre"
                      value={searchCodeVal}
                      onChange={e => {
                        const val = e.target.value;
                        setSearchCodes(prev => ({ ...prev, [linea.id]: val }));
                        handleCodeSearch(index, val);
                      }}
                      className="text-xs h-9 bg-white border-slate-200 focus-visible:ring-verini-black pr-7 font-mono font-semibold"
                    />
                    {linea.productoId && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-emerald-600 font-bold" title="Producto Encontrado">
                        ✓
                      </span>
                    )}
                  </div>
                </div>

                {/* Material / Descripción */}
                <div className="md:col-span-3 space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                    Material / Descripción
                  </label>
                  <Input
                    required
                    placeholder="ej. Azulejo Porcelánico Crema, Mano de obra..."
                    value={linea.concepto}
                    onChange={e => handleLineChange(index, 'concepto', e.target.value)}
                    readOnly={!!linea.productoId}
                    disabled={!!linea.productoId}
                    className={`text-xs h-9 font-semibold border-slate-200 focus-visible:ring-verini-black ${
                      linea.productoId ? 'bg-slate-100 text-slate-500 cursor-not-allowed font-medium' : 'bg-white text-slate-800'
                    }`}
                  />
                </div>

                {/* Imputación de Obra (Opcional) */}
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Briefcase className="h-3 w-3 text-slate-400" />
                    Obra
                  </label>
                  <select
                    value={linea.obraId || ''}
                    onChange={e => handleLineChange(index, 'obraId', e.target.value ? e.target.value : null)}
                    className="w-full h-9 bg-white border border-slate-200 rounded-lg px-2 text-xs focus:outline-none focus:ring-1 focus:ring-verini-black font-semibold text-slate-800"
                  >
                    <option value="">No imputar</option>
                    {obras.map(o => (
                      <option key={o.id} value={o.id}>{o.titulo}</option>
                    ))}
                  </select>
                </div>

                {/* Cantidad */}
                <div className="md:col-span-1 space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Cant.</label>
                  <DecimalInput
                    value={linea.cantidad}
                    onChange={val => handleLineChange(index, 'cantidad', val)}
                    className="text-xs h-9 bg-white text-center font-mono font-bold border-slate-200 focus-visible:ring-verini-black"
                  />
                </div>

                {/* Precio Unitario */}
                <div className="md:col-span-1 space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Precio</label>
                  <div className="relative">
                    <DecimalInput
                      value={linea.precioUnitario}
                      onChange={val => handleLineChange(index, 'precioUnitario', val)}
                      className="text-xs h-9 bg-white pr-4 font-mono font-bold border-slate-200 focus-visible:ring-verini-black"
                    />
                    <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[8px] text-slate-400 font-bold">€</span>
                  </div>
                </div>

                {/* IVA Porcentaje */}
                <div className="md:col-span-1 space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">IVA</label>
                  <select
                    value={linea.ivaPorcentaje}
                    onChange={e => handleLineChange(index, 'ivaPorcentaje', Number(e.target.value))}
                    className="w-full h-9 bg-white border border-slate-200 rounded-lg px-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-verini-black font-mono font-semibold"
                  >
                    <option value="21">21%</option>
                    <option value="10">10%</option>
                    <option value="0">0%</option>
                  </select>
                </div>

                {/* Eliminar Acción */}
                <div className="md:col-span-1 flex items-end justify-end pt-2 md:pt-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveLine(index)}
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
      </div>

      {/* Grid: Footers & Totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
        <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-start gap-3">
          <Layers className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-500 leading-normal space-y-1">
            <span className="font-bold text-slate-700 block uppercase tracking-wide text-[10px]">Asignación a Proyectos</span>
            <p>
              Recuerda vincular cada concepto al proyecto correspondiente seleccionando su obra en el desplegable. Esto cargará el coste directamente a la ficha analítica de la obra para cuadrar los gastos de materiales en tiempo real.
            </p>
          </div>
        </div>

        {/* Real-time calculated totals sheet */}
        <div className="bg-slate-50/50 border border-slate-150 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Base Imponible</span>
            <span className={`font-mono font-bold ${liveTotals.baseImponible < 0 ? 'text-red-600' : 'text-slate-800'}`}>{liveTotals.baseImponible.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
          </div>

          <div className="flex justify-between items-center text-xs border-t border-slate-200/50 pt-2">
            <span className="text-slate-500 font-medium">Impuestos (IVA)</span>
            <span className={`font-mono font-bold ${liveTotals.totalIva < 0 ? 'text-red-600' : 'text-slate-800'}`}>{liveTotals.totalIva.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
          </div>

          {retencionIrpf > 0 && (
            <div className="flex justify-between items-center text-xs text-red-600">
              <span className="font-medium">Retención IRPF (-{retencionIrpf}%)</span>
              <span className="font-mono font-bold">-{liveTotals.importeRetencion.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
            </div>
          )}

          <div className="flex justify-between items-center text-sm font-black border-t border-slate-200 pt-3">
            <span className="text-slate-900 uppercase tracking-wide">TOTAL ESTIMADO</span>
            <span className={`font-mono text-base font-black ${liveTotals.total < 0 ? 'text-red-600' : 'text-slate-950'}`}>{liveTotals.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
          </div>
        </div>
      </div>

      {/* Bottom Save & Cancel Bar */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="text-xs h-10 border-slate-200 text-slate-600 px-4 rounded-lg cursor-pointer hover:bg-slate-50"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="bg-verini-black hover:bg-black/95 text-white text-xs h-10 px-5 gap-2 rounded-lg font-bold cursor-pointer"
        >
          <Save className="h-4.5 w-4.5" />
          {isEdit ? 'Guardar Cambios' : 'Registrar Factura'}
        </Button>
      </div>
    </form>
  );
}
