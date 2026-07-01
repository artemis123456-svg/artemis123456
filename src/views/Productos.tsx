import React, { useState, useMemo } from 'react';
import { useProductos } from '../hooks/useProductos';
import { useProveedores } from '../hooks/useProveedores';
import ProductoTable from '../components/productos/ProductoTable';
import ProductoForm from '../components/productos/ProductoForm';
import ProductoDetail from '../components/productos/ProductoDetail';
import { Producto, TarifaProducto, ImagenProducto } from '../types/producto';
import { Card, CardContent } from '../components/ui/card';
import { 
  Package, 
  AlertTriangle, 
  Tags, 
  TrendingUp, 
  Store, 
  ArrowUpRight 
} from 'lucide-react';

type ViewState = 'list' | 'create' | 'edit' | 'detail';

export default function Productos() {
  const {
    productos,
    tarifas,
    imagenes,
    addProducto,
    updateProducto,
    deleteProducto,
    addTarifa,
    deleteTarifa,
    addImagenProducto,
    deleteImagenProducto,
    getMargin
  } = useProductos();

  const { proveedores } = useProveedores();

  // Navigation / View State
  const [viewMode, setViewMode] = useState<ViewState>('list');
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);

  // Stats Derived State
  const stats = useMemo(() => {
    const total = productos.length;
    
    // Products with registered restos count
    const restosCount = productos.filter(p => p.restos && p.restos.trim().length > 0).length;
    
    // Unique categories count
    const categories = new Set(productos.map(p => p.categoria).filter(Boolean));
    const uniqueCatsCount = categories.size;

    // Average Margin percentage (markup)
    const productsWithPrices = productos.filter(p => p.precioCompra > 0);
    const avgMarginPct = productsWithPrices.length > 0
      ? productsWithPrices.reduce((sum, p) => sum + getMargin(p).markupPct, 0) / productsWithPrices.length
      : 0;

    return {
      total,
      restosCount,
      uniqueCatsCount,
      avgMarginPct
    };
  }, [productos, getMargin]);

  // Handlers
  const handleSelectProducto = (prod: Producto) => {
    setSelectedProducto(prod);
    setViewMode('detail');
  };

  const handleEditProducto = (prod: Producto) => {
    setSelectedProducto(prod);
    setViewMode('edit');
  };

  const handleCreateProducto = () => {
    setSelectedProducto(null);
    setViewMode('create');
  };

  const handleSaveForm = (prodData: any) => {
    if (viewMode === 'edit' && selectedProducto) {
      updateProducto(selectedProducto.id, prodData);
      
      // Update selected product state so detail view has latest info
      const latest = { ...selectedProducto, ...prodData };
      setSelectedProducto(latest);
      setViewMode('detail');
    } else {
      const created = addProducto(prodData);
      setSelectedProducto(created);
      setViewMode('detail');
    }
  };

  const handleDeleteProducto = (id: string) => {
    deleteProducto(id);
    setSelectedProducto(null);
    setViewMode('list');
  };

  const handleBackToList = () => {
    setSelectedProducto(null);
    setViewMode('list');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Welcome Brand Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Decorative subtle ambient gradient glows */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-slate-800/20 blur-3xl -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-slate-800/20 blur-2xl -ml-20 -mb-20" />

        <div className="relative space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-300">Verini Espai Creatiu</span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Catálogo de Productos</h1>
          <p className="text-slate-400 text-xs max-w-xl">
            Gestión centralizada de mamparas de ducha, iluminación LED, azulejos, porcelánicos y sanitarios de gama alta. Sincronizado directamente con la base de subcontratas y proveedores.
          </p>
        </div>

        {/* Quick totals badge */}
        <div className="relative bg-white/5 border border-white/10 rounded-xl px-4 py-3 shrink-0 backdrop-blur-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center text-white">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Productos Registrados</p>
            <p className="text-lg font-bold font-mono text-white">{stats.total} referencias</p>
          </div>
        </div>
      </div>

      {/* Dashboard KPI Stats Widgets (Only on list view for clean spacing) */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total catalog items */}
          <Card className="border border-slate-200/80 shadow-xs rounded-xl bg-white">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                <Package className="h-5.5 w-5.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Catálogo Activo</span>
                <p className="text-lg font-extrabold text-slate-900 leading-none mt-1 font-mono">{stats.total}</p>
                <p className="text-[10px] text-slate-400 mt-1 truncate">Referencias en CRM</p>
              </div>
            </CardContent>
          </Card>

          {/* Material Sobrante / Restos card */}
          <Card className={`border shadow-xs rounded-xl bg-white ${stats.restosCount > 0 ? 'border-emerald-200 ring-2 ring-emerald-500/5' : 'border-slate-200/80'}`}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border
                ${stats.restosCount > 0 
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                  : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                <AlertTriangle className="h-5.5 w-5.5 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Material Sobrante</span>
                <p className={`text-lg font-extrabold leading-none mt-1 font-mono ${stats.restosCount > 0 ? 'text-emerald-700' : 'text-slate-900'}`}>{stats.restosCount}</p>
                <p className="text-[10px] text-slate-400 mt-1 truncate">
                  {stats.restosCount > 0 ? 'Artículos con restos/sobrantes' : 'Sin restos anotados'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Total unique categories */}
          <Card className="border border-slate-200/80 shadow-xs rounded-xl bg-white">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                <Tags className="h-5.5 w-5.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Categorías</span>
                <p className="text-lg font-extrabold text-slate-900 leading-none mt-1 font-mono">{stats.uniqueCatsCount}</p>
                <p className="text-[10px] text-slate-400 mt-1 truncate">Familias de productos</p>
              </div>
            </CardContent>
          </Card>

          {/* Average profitability / markup margin */}
          <Card className="border border-slate-200/80 shadow-xs rounded-xl bg-white">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <TrendingUp className="h-5.5 w-5.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recargo Medio</span>
                <p className="text-lg font-extrabold text-emerald-700 leading-none mt-1 font-mono">
                  +{stats.avgMarginPct.toFixed(1)}%
                </p>
                <p className="text-[10px] text-slate-400 mt-1 truncate">Margen medio s/ coste</p>
              </div>
            </CardContent>
          </Card>

        </div>
      )}

      {/* Main workspace area */}
      <div className="mt-6 animate-in fade-in duration-200">
        {viewMode === 'list' && (
          <ProductoTable
            productos={productos}
            proveedores={proveedores}
            onSelectProducto={handleSelectProducto}
            onEditProducto={handleEditProducto}
            onDeleteProducto={handleDeleteProducto}
            onNewProducto={handleCreateProducto}
          />
        )}

        {viewMode === 'detail' && selectedProducto && (
          <ProductoDetail
            producto={selectedProducto}
            tarifas={tarifas}
            imagenes={imagenes}
            proveedores={proveedores}
            onBack={handleBackToList}
            onEdit={handleEditProducto}
            onDelete={handleDeleteProducto}
            onAddTarifa={addTarifa}
            onDeleteTarifa={deleteTarifa}
            onAddImagenProducto={addImagenProducto}
            onDeleteImagenProducto={deleteImagenProducto}
          />
        )}

        {(viewMode === 'create' || viewMode === 'edit') && (
          <ProductoForm
            productoToEdit={selectedProducto}
            onSave={handleSaveForm}
            onCancel={viewMode === 'edit' ? () => setViewMode('detail') : handleBackToList}
          />
        )}
      </div>
    </div>
  );
}
