import React, { useState, useEffect, useMemo } from 'react';
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
  DollarSign
} from 'lucide-react';

interface ProductoFormProps {
  productoToEdit?: Producto | null;
  proveedores?: Proveedor[];
  productosProveedores?: Record<string, ProductoProveedor[]>;
  onSave: (productoData: Omit<Producto, 'id'>) => Promise<any> | void;
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
  onSave, 
  onCancel 
}: ProductoFormProps) {
  // State variables for product fields
  const [codigo, setCodigo] = useState('');
  const [codigoError, setCodigoError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [unidad, setUnidad] = useState<Producto['unidad']>('ud');
  const [activo, setActivo] = useState(true);
  const [imagenUrl, setImagenUrl] = useState('');

  // New fields: Price, Tax, Discount
  const [precioCoste, setPrecioCoste] = useState<number>(0);
  const [descuento, setDescuento] = useState<number>(0);
  const [precioVenta, setPrecioVenta] = useState<number>(0);
  const [ivaPorDefecto, setIvaPorDefecto] = useState<number>(21);

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
      setIvaPorDefecto(productoToEdit.ivaPorDefecto !== undefined ? productoToEdit.ivaPorDefecto : 21);
      setPrecioCoste(productoToEdit.precioCoste || 0);
      setDescuento(productoToEdit.descuento || 0);
      setPrecioVenta(productoToEdit.precioVenta || 0);
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
      setIvaPorDefecto(21);
      setPrecioCoste(0);
      setDescuento(0);
      setPrecioVenta(0);
    }
  }, [productoToEdit]);

  // Real-time calculated margin
  const margenCalculado = useMemo(() => {
    if (!precioCoste || precioCoste <= 0) return 0;
    return ((precioVenta - precioCoste) / precioCoste) * 100;
  }, [precioCoste, precioVenta]);

  // Real-time duplicate verification
  const handleCodigoChange = async (value: string) => {
    setCodigo(value);
    
    if (value.trim().length === 0) {
      setCodigoError(null);
      return;
    }

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
        const { error: catErr } = await supabase
          .from('categorias_producto')
          .insert([{ id: catId, nombre: trimmedCat }]);
        
        if (catErr) {
          console.error('Error inserting new category:', catErr);
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
      imagenUrl: imagenUrl.trim() || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80',
      ivaPorDefecto,
      precioCoste,
      descuento,
      precioVenta
    };

    try {
      await onSave(prodData);
    } catch (err: any) {
      setError(err.message || 'Error al guardar el producto');
    }
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
            {error && (
              <div className="p-3 bg-red-50 border border-red-150 text-red-700 text-xs rounded-lg font-semibold">
                {error}
              </div>
            )}

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

            {/* Sección 2: Precios, Descuento y Fiscalidad */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                <DollarSign className="h-4 w-4 text-gray-700" />
                Precios, Descuento y Margen
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Precio Coste (€)
                  </label>
                  <DecimalInput
                    value={precioCoste}
                    onChange={(val) => setPrecioCoste(val)}
                    className="text-xs h-9.5 bg-slate-50/20 font-mono font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Descuento (%)
                  </label>
                  <DecimalInput
                    value={descuento}
                    onChange={(val) => setDescuento(val)}
                    className="text-xs h-9.5 bg-slate-50/20 font-mono font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Precio Venta (€)
                  </label>
                  <DecimalInput
                    value={precioVenta}
                    onChange={(val) => setPrecioVenta(val)}
                    className="text-xs h-9.5 bg-slate-50/20 font-mono font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    IVA por Defecto
                  </label>
                  <select
                    value={ivaPorDefecto}
                    onChange={(e) => setIvaPorDefecto(Number(e.target.value))}
                    className="w-full text-xs h-9.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 outline-none focus:border-gray-700 font-medium"
                  >
                    <option value={21}>21% (General)</option>
                    <option value={10}>10% (Reducido)</option>
                    <option value={0}>0% (Exento)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Margen Calculado
                  </label>
                  <div className={`h-9.5 flex items-center px-3 rounded-lg border font-mono font-bold text-xs ${
                    margenCalculado > 0 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                      : margenCalculado < 0 
                      ? 'bg-red-50 border-red-200 text-red-700' 
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    {margenCalculado.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Sección 3: Imagen e Ilustraciones */}
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

            {/* Sección 4: Ficha Técnica */}
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
    </div>
  );
}
