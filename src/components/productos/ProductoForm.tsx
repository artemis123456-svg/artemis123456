import React, { useState, useEffect } from 'react';
import { Producto, ProductoProveedor } from '../../types/producto';
import { Proveedor } from '../../types/proveedor';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { DecimalInput } from '../ui/DecimalInput';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { supabase } from '../../lib/supabaseClient';
import { 
  ArrowLeft, 
  Save, 
  Package, 
  Tag, 
  Image as ImageIcon, 
  FileText,
  Plus,
  Trash2,
  DollarSign
} from 'lucide-react';

interface ProductoFormProps {
  productoToEdit?: Producto | null;
  proveedores: Proveedor[];
  productosProveedores?: Record<string, ProductoProveedor[]>;
  onSave: (productoData: Omit<Producto, 'id'>) => void;
  onAddProveedor?: (
    productoId: string,
    proveedorId: string,
    precioCompra: number,
    precioVenta: number,
    referenciaProveedor?: string
  ) => Promise<void>;
  onDeleteProveedor?: (ppId: string) => Promise<void>;
  onCancel: () => void;
}

const DEFAULT_CATEGORIES = [
  'Azulejos', 
  'Mamparas', 
  'Iluminación', 
  'Sanitarios', 
  'Grifería', 
  'Carpintería',
  'Pintura',
  'Climatización',
  'Electrodomésticos',
  'Mármoles'
];

export default function ProductoForm({ 
  productoToEdit, 
  proveedores,
  productosProveedores,
  onSave, 
  onAddProveedor,
  onDeleteProveedor,
  onCancel 
}: ProductoFormProps) {
  // State variables for product fields
  const [codigo, setCodigo] = useState('');
  const [codigoError, setCodigoError] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [unidad, setUnidad] = useState<Producto['unidad']>('ud');
  const [activo, setActivo] = useState(true);
  const [imagenUrl, setImagenUrl] = useState('');

  // Add Provider subform states
  const [mostrarProveedores, setMostrarProveedores] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState('');
  const [subPrecioCompra, setSubPrecioCompra] = useState<number>(0);
  const [subPrecioVenta, setSubPrecioVenta] = useState<number>(0);
  const [referenciaProveedor, setReferenciaProveedor] = useState('');

  // Load persistent custom product categories
  const [customCategories, setCustomCategories] = useState<string[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categorias_producto')
          .select('nombre')
          .order('nombre', { ascending: true });
        
        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          setCustomCategories(data.map(d => d.nombre));
        } else {
          // Seed defaults if database/table is empty
          const seeds = DEFAULT_CATEGORIES.map((cat, i) => ({
            id: `cat_${Date.now()}_${i}`,
            nombre: cat
          }));
          await supabase.from('categorias_producto').insert(seeds);
          setCustomCategories(DEFAULT_CATEGORIES);
        }
      } catch (err) {
        console.error('Error loading categories from Supabase, falling back to local defaults:', err);
        setCustomCategories(DEFAULT_CATEGORIES);
      }
    };

    loadCategories();
  }, []);

  // Quick preset Unsplash images depending on the selected category to help the user
  const quickImagePresets = [
    { name: 'Baño / Grifo', url: 'https://images.unsplash.com/photo-1585144860131-245d551c77f6?auto=format&fit=crop&w=600&q=80' },
    { name: 'Azulejo / Mármol', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80' },
    { name: 'Iluminación / LED', url: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=600&q=80' },
    { name: 'Cocina / Madera', url: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=600&q=80' }
  ];

  // Load product details if we are in Edit Mode
  useEffect(() => {
    if (productoToEdit) {
      setCodigo(productoToEdit.codigo || '');
      setCodigoError(null);
      setNombre(productoToEdit.nombre || '');
      setCategoria(productoToEdit.categoria || '');
      setDescripcion(productoToEdit.descripcion || '');
      setUnidad(productoToEdit.unidad || 'ud');
      setActivo(productoToEdit.activo !== undefined ? productoToEdit.activo : true);
      setImagenUrl(productoToEdit.imagenUrl || '');
    } else {
      // Clear form for New Product Mode
      setCodigo('');
      setCodigoError(null);
      setNombre('');
      setCategoria('Azulejos');
      setDescripcion('');
      setUnidad('ud');
      setActivo(true);
      setImagenUrl('');
    }
  }, [productoToEdit]);

  // Real-time duplicate verification
  const handleCodigoChange = async (value: string) => {
    setCodigo(value);
    
    if (value.trim().length === 0) {
      setCodigoError(null);
      return;
    }

    // Solo verificar si es código nuevo (no editando) o si ha cambiado el código original
    if (!productoToEdit || value.trim().toLowerCase() !== productoToEdit.codigo.trim().toLowerCase()) {
      try {
        const { data: existing } = await supabase
          .from('productos')
          .select('id')
          .eq('codigo', value.trim())
          .single();
        
        if (existing) {
          setCodigoError(`⚠️ Referencia duplicada (ID: ${existing.id})`);
        } else {
          setCodigoError(null);
        }
      } catch (err: any) {
        // No rows found = OK, sin duplicado
        if (err.code === 'PGRST116') {
          setCodigoError(null);
        }
      }
    } else {
      setCodigoError(null);
    }
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!codigo.trim()) {
      alert('El Código / Referencia es obligatorio.');
      return;
    }
    if (codigoError) {
      alert('La referencia introducida está duplicada en el sistema.');
      return;
    }
    if (!nombre.trim()) {
      alert('El Nombre del Producto es obligatorio.');
      return;
    }
    if (!categoria.trim()) {
      alert('La Categoría es obligatoria.');
      return;
    }

    // Persist new custom product category dynamically
    const trimmedCat = categoria.trim();
    const exists = customCategories.some(c => c.toLowerCase() === trimmedCat.toLowerCase());
    if (trimmedCat && !exists) {
      try {
        const catId = `cat_${Date.now()}`;
        const { error } = await supabase
          .from('categorias_producto')
          .insert([{ id: catId, nombre: trimmedCat }]);
        
        if (error) {
          console.error('Error inserting new category:', error);
        } else {
          setCustomCategories(prev => [...prev, trimmedCat].sort());
        }
      } catch (err) {
        console.error('Error persisting category:', err);
      }
    }

    const prodData = {
      codigo: codigo.trim(),
      nombre: nombre.trim(),
      categoria: trimmedCat,
      descripcion: descripcion.trim(),
      unidad,
      activo,
      imagenUrl: imagenUrl.trim() || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80'
    };

    onSave(prodData);
  };

  const productosProveedorActuales = productoToEdit
    ? productosProveedores?.[productoToEdit.id] || []
    : [];

  const handleAgregarProveedor = async () => {
    if (!productoToEdit || !proveedorSeleccionado || subPrecioCompra === 0) {
      alert('Completa los campos requeridos (Proveedor y Precio Compra)');
      return;
    }

    const compVal = subPrecioCompra;
    const ventVal = subPrecioVenta;

    if (compVal <= 0) {
      alert('El precio de compra debe ser un número positivo');
      return;
    }

    if (onAddProveedor) {
      await onAddProveedor(
        productoToEdit.id,
        proveedorSeleccionado,
        compVal,
        ventVal,
        referenciaProveedor.trim() || undefined
      );
    }

    // Reset subform
    setProveedorSeleccionado('');
    setSubPrecioCompra(0);
    setSubPrecioVenta(0);
    setReferenciaProveedor('');
    setMostrarProveedores(false);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Back Button */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-slate-500 hover:text-slate-900 gap-1.5 h-8 text-xs px-2.5 rounded-lg border border-slate-200 bg-white shadow-2xs"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al catálogo
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
            <CardTitle className="text-base font-bold text-slate-950 flex items-center gap-2">
              <Package className="h-5 w-5 text-gray-900" />
              {productoToEdit ? `Modificar Producto: ${productoToEdit.codigo}` : 'Agregar Producto al Catálogo'}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Sección 1: Datos Identificativos */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                <Tag className="h-4 w-4 text-gray-700" />
                Definición y Categoría
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Nombre del Producto <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    placeholder="ej. Inodoro Suspendido Rimless Compacto"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="text-xs h-9.5 bg-slate-50/20 font-medium text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Código / Referencia <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    placeholder="ej. MAMP-01, AZU-15"
                    value={codigo}
                    onChange={(e) => handleCodigoChange(e.target.value)}
                    className={`text-xs h-9.5 bg-slate-50/20 font-bold text-slate-900 font-mono ${codigoError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  {codigoError && (
                    <p className="text-[10px] text-red-600 font-semibold mt-1">{codigoError}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Categoría / Grupo <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    placeholder="ej. Sanitarios, Iluminación..."
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    list="suggested-product-categories"
                    className="text-xs h-9.5 bg-slate-50/20 font-semibold"
                  />
                  <datalist id="suggested-product-categories">
                    {customCategories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Unidad de Medida
                  </label>
                  <select
                    value={unidad}
                    onChange={(e) => setUnidad(e.target.value as any)}
                    className="w-full text-xs h-9.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 outline-none focus:border-gray-700"
                  >
                    <option value="ud">Unidad (ud)</option>
                    <option value="m2">Metro Cuadrado (m²)</option>
                    <option value="ml">Metro Lineal (ml)</option>
                    <option value="caja">Caja (caja)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Estado Catálogo</label>
                  <select
                    value={activo ? 'true' : 'false'}
                    onChange={(e) => setActivo(e.target.value === 'true')}
                    className="w-full text-xs h-9.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 outline-none focus:border-gray-700"
                  >
                    <option value="true">Activo / Visible</option>
                    <option value="false">Inactivo / Oculto</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sección 4: Imagen e Ilustraciones */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                <ImageIcon className="h-4 w-4 text-gray-700" />
                Multimedia e Imagen del Catálogo
              </h3>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Dirección URL de la Imagen</label>
                  <Input
                    placeholder="https://images.unsplash.com/photo-..."
                    value={imagenUrl}
                    onChange={(e) => setImagenUrl(e.target.value)}
                    className="text-xs h-9.5 bg-slate-50/20 font-mono"
                  />
                </div>

                {/* Quick Presets list */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Presets Rápidos de Imagen de Reforma:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickImagePresets.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setImagenUrl(preset.url)}
                        className={`text-[10px] font-semibold border px-2.5 py-1.5 rounded-lg transition-colors bg-white hover:bg-slate-50 flex items-center gap-1.5
                          ${imagenUrl === preset.url ? 'border-gray-900 text-gray-900 font-bold bg-gray-100/50' : 'border-slate-200 text-slate-600'}`}
                      >
                        <span className="h-2 w-2 rounded-full bg-slate-400" style={{ backgroundImage: `url(${preset.url})`, backgroundSize: 'cover' }} />
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Preview box */}
                <div className="flex items-center gap-4 p-4 bg-slate-50/60 border border-slate-150 rounded-xl">
                  <div className="h-20 w-20 rounded-lg overflow-hidden border border-slate-200 bg-white flex items-center justify-center shrink-0 shadow-2xs">
                    {imagenUrl ? (
                      <img
                        src={imagenUrl}
                        alt="Preview"
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as any).src = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=100&q=80";
                        }}
                      />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-slate-300" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Previsualización de Catálogo</p>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-md leading-normal">
                      Esta miniatura se mostrará en las búsquedas del equipo y en los presupuestos de reformas generados.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección 5: Ficha Técnica */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                <FileText className="h-4 w-4 text-gray-700" />
                Descripción Técnica e Información Adicional
              </h3>

              <div className="space-y-1">
                <textarea
                  rows={4}
                  placeholder="Detalla dimensiones, grosores, acabados, tolerancias de montaje, normativas de homologación o cualquier dato de utilidad para los jefes de obra."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50/10 p-3 text-slate-700 outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700/20"
                />
              </div>
            </div>
          </CardContent>

          {/* Form Actions Footer */}
          <div className="bg-slate-50/60 border-t border-slate-100 p-4 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="text-slate-600 bg-white border-slate-200 hover:bg-slate-50 text-xs h-9.5 px-4 rounded-lg"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!!codigoError}
              className={`bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs h-9.5 px-4 gap-1.5 rounded-lg shadow-xs ${codigoError ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Save className="h-4 w-4" />
              {productoToEdit ? 'Guardar Cambios' : 'Dar de Alta Producto'}
            </Button>
          </div>
        </Card>
      </form>

      {/* NUEVA SECCIÓN: Proveedores (sólo visible al editar un producto) */}
      {productoToEdit && (
        <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-xs">Proveedores de este Producto</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMostrarProveedores(!mostrarProveedores)}
                className="h-8 text-[11px] gap-1 px-3 border-slate-200 hover:bg-slate-50"
              >
                <Plus className="h-3.5 w-3.5 text-slate-500" />
                {mostrarProveedores ? 'Cerrar panel' : 'Asociar Proveedor'}
              </Button>
            </div>

            {/* Formulario agregar proveedor */}
            {mostrarProveedores && (
              <div className="bg-slate-50 p-4 rounded-lg space-y-3 border border-slate-200 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Proveedor *</label>
                    <select
                      value={proveedorSeleccionado}
                      onChange={(e) => setProveedorSeleccionado(e.target.value)}
                      className="w-full h-8.5 text-xs rounded-lg border border-slate-200 bg-white px-2 outline-none focus:border-slate-400"
                    >
                      <option value="">-- Selecciona Proveedor --</option>
                      {proveedores.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre} ({p.tipo})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Referencia Proveedor / SKU</label>
                    <Input
                      type="text"
                      placeholder="ej. SKU-5049"
                      value={referenciaProveedor}
                      onChange={(e) => setReferenciaProveedor(e.target.value)}
                      className="text-xs h-8.5 bg-white border-slate-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Precio Compra (€) *</label>
                    <DecimalInput
                      value={subPrecioCompra}
                      onChange={(val) => setSubPrecioCompra(val)}
                      className="text-xs h-8.5 bg-white border-slate-200 font-mono font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Precio Venta PVP Sugerido (€)</label>
                    <DecimalInput
                      value={subPrecioVenta}
                      onChange={(val) => setSubPrecioVenta(val)}
                      className="text-xs h-8.5 bg-white border-slate-200 font-mono"
                    />
                  </div>
                </div>

                {/* Subform actions */}
                <div className="flex gap-2 justify-end pt-2 border-t border-slate-200/60">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setMostrarProveedores(false)}
                    className="text-xs h-8.5"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="button"
                    onClick={handleAgregarProveedor}
                    className="text-xs h-8.5 bg-slate-900 text-white hover:bg-slate-800 font-semibold"
                  >
                    Guardar Asociación
                  </Button>
                </div>
              </div>
            )}

            {/* Tabla proveedores actuales */}
            {productosProveedorActuales.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {productosProveedorActuales.map((pp) => {
                  const prov = proveedores.find(p => p.id === pp.proveedorId);
                  const marginPct = pp.precioCompra > 0 
                    ? (((pp.precioVenta - pp.precioCompra) / pp.precioCompra) * 100).toFixed(1)
                    : '0.0';

                  return (
                    <div
                      key={pp.id}
                      className="flex items-center justify-between p-3.5 bg-slate-50/50 rounded-xl border border-slate-200/60 shadow-2xs hover:bg-slate-50 transition-colors"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {prov?.nombre || pp.proveedorId}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold text-slate-500">
                          <span className="font-mono text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                            Compra: {pp.precioCompra.toFixed(2)} €
                          </span>
                          {pp.precioVenta > 0 && (
                            <span className="font-mono text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                              PVP: {pp.precioVenta.toFixed(2)} € (+{marginPct}%)
                            </span>
                          )}
                        </div>
                        {pp.referenciaProveedor && (
                          <div className="text-[9px] text-slate-400 font-medium font-mono">
                            Ref Proveedor: {pp.referenciaProveedor}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => onDeleteProveedor?.(pp.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2"
                        title="Eliminar asociación de proveedor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-xs text-slate-400 italic py-6 border border-dashed border-slate-200 rounded-xl">
                No hay proveedores asociados a este producto aún.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
