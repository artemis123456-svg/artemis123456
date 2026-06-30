import React, { useState, useEffect } from 'react';
import { Producto } from '../../types/producto';
import { useProveedores } from '../../hooks/useProveedores';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { 
  ArrowLeft, 
  Save, 
  Package, 
  Tag, 
  Store, 
  DollarSign, 
  Boxes, 
  Image as ImageIcon, 
  FileText,
  HelpCircle
} from 'lucide-react';

interface ProductoFormProps {
  productoToEdit?: Producto | null;
  onSave: (productoData: any) => void;
  onCancel: () => void;
}

export default function ProductoForm({ productoToEdit, onSave, onCancel }: ProductoFormProps) {
  // Load list of providers to show in dropdown selector
  const { proveedores } = useProveedores();

  // State variables for product fields
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [proveedorId, setProveedorId] = useState('');
  const [precioCompra, setPrecioCompra] = useState('');
  const [precioVenta, setPrecioVenta] = useState('');
  const [unidad, setUnidad] = useState<Producto['unidad']>('ud');
  const [stock, setStock] = useState('');
  const [stockMinimo, setStockMinimo] = useState('');
  const [activo, setActivo] = useState(true);
  const [imagenUrl, setImagenUrl] = useState('');

  // Suggested categories for auto-complete datalist
  const suggestedCategories = [
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
      setNombre(productoToEdit.nombre || '');
      setCategoria(productoToEdit.categoria || '');
      setDescripcion(productoToEdit.descripcion || '');
      setProveedorId(productoToEdit.proveedorId || '');
      setPrecioCompra(String(productoToEdit.precioCompra ?? ''));
      setPrecioVenta(String(productoToEdit.precioVenta ?? ''));
      setUnidad(productoToEdit.unidad || 'ud');
      setStock(String(productoToEdit.stock ?? ''));
      setStockMinimo(String(productoToEdit.stockMinimo ?? ''));
      setActivo(productoToEdit.activo !== undefined ? productoToEdit.activo : true);
      setImagenUrl(productoToEdit.imagenUrl || '');
    } else {
      // Clear form for New Product Mode
      setNombre('');
      setCategoria('Azulejos');
      setDescripcion('');
      setProveedorId(proveedores.length > 0 ? proveedores[0].id : '');
      setPrecioCompra('');
      setPrecioVenta('');
      setUnidad('ud');
      setStock('0');
      setStockMinimo('5');
      setActivo(true);
      setImagenUrl('');
    }
  }, [productoToEdit, proveedores]);

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      alert('El Nombre del Producto es obligatorio.');
      return;
    }
    if (!categoria.trim()) {
      alert('La Categoría es obligatoria.');
      return;
    }
    if (!proveedorId) {
      alert('Debe seleccionar un Proveedor Suministrador.');
      return;
    }

    const compPrice = Number(precioCompra) || 0;
    const ventPrice = Number(precioVenta) || 0;

    if (ventPrice < compPrice) {
      if (!confirm('Atención: El precio de venta (PVP) es menor que el precio de compra. ¿Desea guardar de todos modos?')) {
        return;
      }
    }

    const prodData = {
      nombre: nombre.trim(),
      categoria: categoria.trim(),
      descripcion: descripcion.trim(),
      proveedorId,
      precioCompra: compPrice,
      precioVenta: ventPrice,
      unidad,
      stock: Number(stock) || 0,
      stockMinimo: Number(stockMinimo) || 0,
      activo,
      imagenUrl: imagenUrl.trim() || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80'
    };

    onSave(prodData);
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

      <form onSubmit={handleSubmit}>
        <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
            <CardTitle className="text-base font-bold text-slate-950 flex items-center gap-2">
              <Package className="h-5 w-5 text-indigo-600" />
              {productoToEdit ? `Modificar Producto: ${productoToEdit.codigo}` : 'Agregar Producto al Catálogo'}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Sección 1: Datos Identificativos */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                <Tag className="h-4 w-4 text-indigo-500" />
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
                    {suggestedCategories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Proveedor Suministrador <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={proveedorId}
                    onChange={(e) => setProveedorId(e.target.value)}
                    className="w-full text-xs h-9.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                  >
                    <option value="" disabled>Seleccione un proveedor...</option>
                    {proveedores.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} ({p.tipo})
                      </option>
                    ))}
                  </select>
                  {proveedores.length === 0 && (
                    <p className="text-[10px] text-red-500 mt-1">¡No hay proveedores guardados! Regístrelos primero.</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Unidad de Medida
                  </label>
                  <select
                    value={unidad}
                    onChange={(e) => setUnidad(e.target.value as any)}
                    className="w-full text-xs h-9.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 outline-none focus:border-indigo-500"
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
                    className="w-full text-xs h-9.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 outline-none focus:border-indigo-500"
                  >
                    <option value="true">Activo / Visible</option>
                    <option value="false">Inactivo / Oculto</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sección 2: Precios e Impuestos */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                <DollarSign className="h-4 w-4 text-indigo-500" />
                Precios y Rendimiento Económico
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Precio Compra Coste (€)</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={precioCompra}
                    onChange={(e) => setPrecioCompra(e.target.value)}
                    className="text-xs h-9.5 bg-slate-50/20 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Precio Venta PVP (€)</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={precioVenta}
                    onChange={(e) => setPrecioVenta(e.target.value)}
                    className="text-xs h-9.5 bg-slate-50/20 font-mono font-bold text-indigo-700"
                  />
                </div>

                {/* Derived live margin feedback */}
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Margen Bruto Estimado</span>
                  {Number(precioVenta) && Number(precioCompra) ? (
                    <div className="mt-1">
                      <p className="text-sm font-bold text-slate-900 font-mono">
                        {(Number(precioVenta) - Number(precioCompra)).toFixed(2)} €
                      </p>
                      <p className="text-[10px] text-emerald-600 font-bold">
                        +{(((Number(precioVenta) - Number(precioCompra)) / Number(precioCompra)) * 100).toFixed(1)}% (Markup)
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs italic text-slate-400 mt-1">Introduzca precios para calcular</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sección 3: Control de Stock */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                <Boxes className="h-4 w-4 text-indigo-500" />
                Control de Stock e Inventario
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Stock Actual</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="text-xs h-9.5 bg-slate-50/20 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Stock de Seguridad Mínimo</label>
                  <Input
                    type="number"
                    placeholder="5"
                    value={stockMinimo}
                    onChange={(e) => setStockMinimo(e.target.value)}
                    className="text-xs h-9.5 bg-slate-50/20 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Sección 4: Imagen e Ilustraciones */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                <ImageIcon className="h-4 w-4 text-indigo-500" />
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
                          ${imagenUrl === preset.url ? 'border-indigo-600 text-indigo-600 font-bold bg-indigo-50/50' : 'border-slate-200 text-slate-600'}`}
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
                <FileText className="h-4 w-4 text-indigo-500" />
                Descripción Técnica e Información Adicional
              </h3>

              <div className="space-y-1">
                <textarea
                  rows={4}
                  placeholder="Detalla dimensiones, grosores, acabados, tolerancias de montaje, normativas de homologación o cualquier dato de utilidad para los jefes de obra."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50/10 p-3 text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-9.5 px-4 gap-1.5 rounded-lg shadow-xs"
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
