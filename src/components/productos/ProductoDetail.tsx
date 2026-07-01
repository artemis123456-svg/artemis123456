import React, { useState, useMemo } from 'react';
import { Producto, TarifaProducto, ImagenProducto } from '../../types/producto';
import { Proveedor } from '../../types/proveedor';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  FileText,
  Clock,
  MapPin,
  Sparkles,
  Layers,
  Wrench,
  User,
  Plus,
  Trash2,
  Upload,
  StickyNote,
  CheckCircle2,
  Edit2,
  Phone,
  Mail,
  Landmark,
  ShieldCheck,
  Check,
  CreditCard,
  Truck,
  Briefcase,
  Package,
  TrendingUp,
  Tag,
  AlertTriangle,
  Store,
  ExternalLink,
  ChevronRight,
  ImageIcon
} from 'lucide-react';

interface ProductoDetailProps {
  producto: Producto;
  tarifas: TarifaProducto[];
  imagenes: ImagenProducto[];
  proveedores: Proveedor[];
  onBack: () => void;
  onEdit: (prod: Producto) => void;
  onDelete: (id: string) => void;
  onAddTarifa: (tarifaData: Omit<TarifaProducto, 'id'>) => void;
  onDeleteTarifa: (id: string) => void;
  onAddImagenProducto: (imgData: Omit<ImagenProducto, 'id'>) => void;
  onDeleteImagenProducto: (id: string) => void;
}

type TabType = 'generales' | 'tarifas' | 'proveedor' | 'imagenes';

export default function ProductoDetail({
  producto,
  tarifas,
  imagenes,
  proveedores,
  onBack,
  onEdit,
  onDelete,
  onAddTarifa,
  onDeleteTarifa,
  onAddImagenProducto,
  onDeleteImagenProducto
}: ProductoDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>('generales');

  // Resolve associated provider
  const associatedProvider = useMemo(() => {
    return proveedores.find(p => p.id === producto.proveedorId) || null;
  }, [proveedores, producto.proveedorId]);

  // Filter rates belonging to this product
  const productTarifas = useMemo(() => {
    return tarifas.filter(t => t.productoId === producto.id);
  }, [tarifas, producto.id]);

  // Filter images belonging to this product
  const productImagenes = useMemo(() => {
    return imagenes.filter(img => img.productoId === producto.id);
  }, [imagenes, producto.id]);

  // Margin Calculations
  const marginStats = useMemo(() => {
    const diff = producto.precioVenta - producto.precioCompra;
    const markupPct = producto.precioCompra > 0 ? (diff / producto.precioCompra) * 100 : 0;
    const profitMarginPct = producto.precioVenta > 0 ? (diff / producto.precioVenta) * 100 : 0;
    return {
      absolute: diff,
      markupPct,
      profitMarginPct
    };
  }, [producto.precioCompra, producto.precioVenta]);

  // State for new rate form
  const [isTarifaFormOpen, setIsTarifaFormOpen] = useState(false);
  const [tarifaName, setTarifaName] = useState('');
  const [tarifaPrice, setTarifaPrice] = useState('');
  const [tarifaDate, setTarifaDate] = useState(new Date().toISOString().split('T')[0]);

  // State for new image url
  const [newImgUrl, setNewImgUrl] = useState('');

  // Rate submission
  const handleAddTarifaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tarifaName.trim() || !tarifaPrice) {
      alert('Por favor complete los campos obligatorios.');
      return;
    }

    onAddTarifa({
      productoId: producto.id,
      nombre: tarifaName.trim(),
      precio: Number(tarifaPrice) || 0,
      fechaVigencia: tarifaDate || new Date().toISOString().split('T')[0]
    });

    setTarifaName('');
    setTarifaPrice('');
    setTarifaDate(new Date().toISOString().split('T')[0]);
    setIsTarifaFormOpen(false);
  };

  // Image submission
  const handleAddImageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImgUrl.trim()) return;

    onAddImagenProducto({
      productoId: producto.id,
      url: newImgUrl.trim(),
      esPrincipal: productImagenes.length === 0 // If no images, make it principal
    });

    setNewImgUrl('');
  };

  // Status badges
  const renderStatusBadge = (activo: boolean) => {
    if (activo) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/10 animate-in fade-in">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Activo / Catálogo
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-600/10 animate-in fade-in">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          Descatalogado / Oculto
        </span>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-9 w-9 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 shadow-xs"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* Product main thumbnail preview */}
          <div className="h-14 w-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 shadow-sm">
            {producto.imagenUrl ? (
              <img
                src={producto.imagenUrl}
                alt={producto.nombre}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Package className="h-6 w-6 text-slate-400" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 uppercase tracking-wide">
                {producto.codigo}
              </span>
              <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-2.5 py-0.5 text-[11px] font-bold text-gray-900 ring-1 ring-gray-900/10">
                <Tag className="h-3 w-3 text-gray-500" />
                {producto.categoria}
              </span>
              {renderStatusBadge(producto.activo)}
            </div>
            <h2 className="text-xl font-bold text-slate-950 mt-1 tracking-tight leading-snug">
              {producto.nombre}
            </h2>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(producto)}
            className="border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 gap-1.5 rounded-lg h-9 text-xs font-semibold px-3"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Modificar Datos
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('¿Estás seguro de que deseas retirar este producto permanentemente de Verini CRM?')) {
                onDelete(producto.id);
              }
            }}
            className="border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 gap-1.5 rounded-lg h-9 text-xs font-semibold px-3"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Eliminar del Catálogo
          </Button>
        </div>
      </div>

      {/* Hero Stats Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Precio Venta PVP</span>
            <DollarSign className="h-4 w-4 text-gray-700" />
          </div>
          <p className="mt-2 text-xl font-bold text-gray-800 font-mono">
            {producto.precioVenta.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
          </p>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Por {producto.unidad}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Precio de Coste</span>
            <Tag className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-xl font-bold text-slate-800 font-mono">
            {producto.precioCompra.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
          </p>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Coste del proveedor</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Margen Comercial</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-xl font-bold text-emerald-600 font-mono">
            {marginStats.absolute.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
          </p>
          <p className="text-[10px] text-emerald-400 font-medium mt-0.5">
            +{marginStats.markupPct.toFixed(1)}% Markup / +{marginStats.profitMarginPct.toFixed(1)}% margen comercial
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Stock en Tienda</span>
            <Layers className="h-4 w-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <p className={`text-xl font-bold font-mono ${producto.stock <= producto.stockMinimo ? 'text-amber-600' : 'text-slate-900'}`}>
              {producto.stock} {producto.unidad}
            </p>
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
            {producto.stock <= producto.stockMinimo 
              ? `¡Por debajo de seguridad! (Mín. ${producto.stockMinimo})` 
              : `Stock óptimo (Seguridad: ${producto.stockMinimo})`}
          </p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-100 overflow-x-auto bg-slate-50/50">
          {(
            [
              { id: 'generales', label: 'Datos Generales', icon: Sparkles },
              { id: 'tarifas', label: `Precios y Tarifas (${productTarifas.length})`, icon: DollarSign },
              { id: 'proveedor', label: 'Proveedor Suministrador', icon: Store },
              { id: 'imagenes', label: `Gallería de Imágenes (${productImagenes.length})`, icon: ImageIcon }
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-all outline-none
                  ${isActive 
                    ? 'border-gray-900 text-gray-800 bg-white font-bold' 
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/40'}`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-gray-900' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* TAB 1: DATOS GENERALES */}
          {activeTab === 'generales' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Technical data and margins */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                    <Wrench className="h-3.5 w-3.5 text-gray-700" />
                    Propiedades Técnicas y Tarifación
                  </h4>
                  <ul className="space-y-3 text-xs">
                    <li className="flex justify-between items-center py-0.5">
                      <span className="font-semibold text-slate-400">Categoría:</span>
                      <span className="font-bold text-slate-800 bg-slate-50 border border-slate-200/50 px-2 py-0.5 rounded">{producto.categoria}</span>
                    </li>
                    <li className="flex justify-between items-center py-0.5">
                      <span className="font-semibold text-slate-400">Unidad de Medida:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {producto.unidad === 'ud' ? 'Unidad (ud)' :
                         producto.unidad === 'm2' ? 'Metro Cuadrado (m²)' :
                         producto.unidad === 'ml' ? 'Metro Lineal (ml)' :
                         'Caja'}
                      </span>
                    </li>
                    <li className="flex justify-between items-center py-0.5">
                      <span className="font-semibold text-slate-400">Precio Compra Base (Excl. IVA):</span>
                      <span className="font-mono font-bold text-slate-800">{producto.precioCompra.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
                    </li>
                    <li className="flex justify-between items-center py-0.5">
                      <span className="font-semibold text-slate-400">Precio Venta Recomendado (PVP):</span>
                      <span className="font-mono font-bold text-gray-800 bg-gray-100/50 px-2 py-0.5 rounded border border-gray-200">{producto.precioVenta.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
                    </li>
                    <li className="flex justify-between items-center py-0.5 border-t border-dashed border-slate-100 mt-2 pt-2">
                      <span className="font-bold text-slate-500">Rendimiento Comercial Bruto:</span>
                      <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-150">
                        +{marginStats.absolute.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                      </span>
                    </li>
                    <li className="flex justify-between items-center py-0.5">
                      <span className="font-semibold text-slate-400">Estructura Markup (sobre Coste):</span>
                      <span className="font-mono font-bold text-emerald-600">+{marginStats.markupPct.toFixed(1)}%</span>
                    </li>
                  </ul>
                </div>

                {/* Stock details */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                    <Layers className="h-3.5 w-3.5 text-gray-700" />
                    Gestión de Inventario
                  </h4>
                  <ul className="space-y-3 text-xs">
                    <li className="flex justify-between items-center py-0.5">
                      <span className="font-semibold text-slate-400">Stock Actual en Tienda:</span>
                      <span className={`font-mono font-bold ${producto.stock <= producto.stockMinimo ? 'text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded font-bold' : 'text-slate-800'}`}>
                        {producto.stock} {producto.unidad}
                      </span>
                    </li>
                    <li className="flex justify-between items-center py-0.5">
                      <span className="font-semibold text-slate-400">Mínimo de Alerta:</span>
                      <span className="font-mono font-bold text-slate-800">{producto.stockMinimo} {producto.unidad}</span>
                    </li>
                    <li className="flex justify-between items-center py-0.5">
                      <span className="font-semibold text-slate-400">Proveedor Suministrador:</span>
                      <span className="font-bold text-gray-900 hover:underline cursor-pointer flex items-center gap-1" onClick={() => setActiveTab('proveedor')}>
                        {associatedProvider ? associatedProvider.nombre : 'Sin proveedor asignado'}
                        <ExternalLink className="h-3 w-3 inline-block" />
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Description block */}
              {producto.descripcion && (
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-1">
                  <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-slate-400" />
                    Ficha y Descripción Comercial del Producto
                  </h5>
                  <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                    {producto.descripcion}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRECIOS Y TARIFAS */}
          {activeTab === 'tarifas' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Estructura de Tarifas de Precios</h3>
                
                <Button
                  onClick={() => setIsTarifaFormOpen(!isTarifaFormOpen)}
                  className="bg-gray-900 hover:bg-gray-800 text-white text-xs h-8 px-3 gap-1 rounded-lg"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Agregar Tarifa Especial
                </Button>
              </div>

              {/* Rate Creation Form */}
              {isTarifaFormOpen && (
                <form onSubmit={handleAddTarifaSubmit} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-1">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Nueva Tarifa / Escala de Precios</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Nombre de la Tarifa <span className="text-red-500">*</span></label>
                      <Input
                        required
                        placeholder="ej. Tarifa Distribuidor / Obra (>50m2)"
                        value={tarifaName}
                        onChange={e => setTarifaName(e.target.value)}
                        className="text-xs h-9 bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Precio Tarifa Especial (€) <span className="text-red-500">*</span></label>
                      <Input
                        required
                        type="number"
                        step="0.01"
                        placeholder="ej. 34.50"
                        value={tarifaPrice}
                        onChange={e => setTarifaPrice(e.target.value)}
                        className="text-xs h-9 bg-white font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Vigente Desde</label>
                      <Input
                        type="date"
                        value={tarifaDate}
                        onChange={e => setTarifaDate(e.target.value)}
                        className="text-xs h-9 bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsTarifaFormOpen(false)}
                      className="text-xs h-8 px-3 border border-slate-200 rounded-lg bg-white"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gray-900 hover:bg-gray-800 text-white text-xs h-8 px-4 rounded-lg"
                    >
                      Añadir Escala
                    </Button>
                  </div>
                </form>
              )}

              {/* Rates list */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] font-semibold text-slate-600 border-b border-slate-200">
                      <th className="px-4 py-3">Nombre Escala / Colectivo</th>
                      <th className="px-4 py-3">Precio Unitario</th>
                      <th className="px-4 py-3">Descuento Equivalente</th>
                      <th className="px-4 py-3">Fecha de Entrada en Vigor</th>
                      <th className="px-4 py-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productTarifas.map(t => {
                      const discountPct = producto.precioVenta > 0 
                        ? ((producto.precioVenta - t.precio) / producto.precioVenta) * 100 
                        : 0;
                      return (
                        <tr key={t.id} className="border-b border-slate-100 text-xs hover:bg-slate-50/50">
                          <td className="px-4 py-3.5 font-bold text-slate-800">{t.nombre}</td>
                          <td className="px-4 py-3.5 font-mono font-bold text-gray-800">{t.precio.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</td>
                          <td className="px-4 py-3.5">
                            {discountPct > 0 ? (
                              <span className="inline-flex items-center rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/15">
                                -{discountPct.toFixed(1)}% descuento
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Precio base PVP</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-slate-500">{new Date(t.fechaVigencia).toLocaleDateString('es-ES')}</td>
                          <td className="px-4 py-3.5 text-right">
                            {t.nombre !== 'Tarifa General PVP' ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onDeleteTarifa(t.id)}
                                className="h-7 w-7 text-slate-400 hover:text-red-600 rounded-lg"
                                title="Eliminar tarifa"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            ) : (
                              <span className="text-[10px] text-slate-400 select-none mr-2">Fijo</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PROVEEDOR SUMINISTRADOR */}
          {activeTab === 'proveedor' && (
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Proveedor de Suministros Asociado</h3>

              {associatedProvider ? (
                <div className="bg-slate-50/70 p-5 rounded-xl border border-slate-200/80 space-y-4 animate-in fade-in">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <p className="text-[10px] font-mono font-bold text-gray-800 bg-gray-100 border border-gray-100 px-2 py-0.5 rounded inline-block">
                        {associatedProvider.codigo}
                      </p>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{associatedProvider.nombre}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Categoría: {associatedProvider.categoria} ({associatedProvider.tipo})</p>
                    </div>

                    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold
                      ${associatedProvider.activo ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10' : 'bg-slate-150 text-slate-700'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${associatedProvider.activo ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {associatedProvider.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  {/* Provider Quick Data fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-200">
                    <div className="space-y-2">
                      <p className="flex items-center gap-2 text-slate-600">
                        <User className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-500">Contacto:</span>
                        <span className="font-bold text-slate-800">{associatedProvider.personaContacto || 'No declarada'}</span>
                      </p>
                      <p className="flex items-center gap-2 text-slate-600">
                        <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-500">Teléfonos:</span>
                        <span className="font-mono text-slate-800">{associatedProvider.telefono} {associatedProvider.movil && ` / ${associatedProvider.movil}`}</span>
                      </p>
                      <p className="flex items-center gap-2 text-slate-600">
                        <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-500">Email:</span>
                        <span className="font-mono text-slate-800 text-gray-900 hover:underline">{associatedProvider.email || '-'}</span>
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="flex items-start gap-2 text-slate-600">
                        <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                        <span className="font-semibold text-slate-500">Dirección:</span>
                        <span className="font-medium text-slate-700 text-right">{associatedProvider.direccion}, {associatedProvider.ciudad} ({associatedProvider.provincia})</span>
                      </p>
                      <p className="flex items-center gap-2 text-slate-600">
                        <CreditCard className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-500">CIF / NIF:</span>
                        <span className="font-mono font-bold text-slate-800">{associatedProvider.nifCif}</span>
                      </p>
                    </div>
                  </div>

                  {associatedProvider.observaciones && (
                    <div className="p-3 bg-white border border-slate-150 rounded-lg text-xs text-slate-600 italic">
                      " {associatedProvider.observaciones} "
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-250 text-slate-400">
                  <Store className="h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">El proveedor vinculado (ID: {producto.proveedorId}) ya no existe o se ha eliminado.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: IMÁGENES / MULTIMEDIA */}
          {activeTab === 'imagenes' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Galería de Imágenes del Catálogo</h3>
              </div>

              {/* Add image form */}
              <form onSubmit={handleAddImageSubmit} className="flex gap-2">
                <Input
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={newImgUrl}
                  onChange={e => setNewImgUrl(e.target.value)}
                  className="text-xs h-9 bg-white font-mono"
                />
                <Button type="submit" className="bg-gray-900 hover:bg-gray-800 text-white text-xs h-9 px-4 gap-1 rounded-lg shrink-0">
                  <Upload className="h-4 w-4" />
                  Agregar Enlace Imagen
                </Button>
              </form>

              {/* Grid of images */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {productImagenes.map((img) => (
                  <div key={img.id} className="relative rounded-xl overflow-hidden border border-slate-200 group bg-slate-50 aspect-square shadow-2xs">
                    <img
                      src={img.url}
                      alt={producto.nombre}
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as any).src = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=300&q=80";
                      }}
                    />

                    {/* Principal marker overlay */}
                    {img.esPrincipal && (
                      <span className="absolute top-2 left-2 bg-gray-900 text-white font-bold text-[9px] uppercase px-2 py-0.5 rounded shadow-sm select-none">
                        Principal
                      </span>
                    )}

                    {/* Delete overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteImagenProducto(img.id)}
                        className="h-8 w-8 text-white hover:text-red-400 bg-black/40 hover:bg-black/60 rounded-full"
                        title="Eliminar imagen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {productImagenes.length === 0 && (
                  <div className="col-span-full py-12 text-center text-xs text-slate-400 italic">
                    No se han cargado imágenes adicionales para este artículo.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
