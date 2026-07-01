import React, { useState, useMemo } from 'react';
import { Producto } from '../../types/producto';
import { Proveedor } from '../../types/proveedor';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableCell, 
  TableHead 
} from '../ui/table';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Search, 
  Plus, 
  SlidersHorizontal, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  Pencil, 
  Trash2, 
  X,
  MapPin,
  Tag,
  Boxes,
  ArrowUpDown,
  AlertCircle,
  Package,
  AlertTriangle,
  Layers,
  Store
} from 'lucide-react';

interface ProductoTableProps {
  productos: Producto[];
  proveedores: Proveedor[];
  onSelectProducto: (prod: Producto) => void;
  onEditProducto: (prod: Producto) => void;
  onDeleteProducto: (id: string) => void;
  onNewProducto: () => void;
}

type SortField = 'codigo' | 'nombre' | 'categoria' | 'precioVenta' | 'activo';
type SortOrder = 'asc' | 'desc';

export default function ProductoTable({
  productos,
  proveedores,
  onSelectProducto,
  onEditProducto,
  onDeleteProducto,
  onNewProducto
}: ProductoTableProps) {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [categoriaFilter, setCategoriaFilter] = useState<string>('all');
  const [proveedorFilter, setProveedorFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Sorting State
  const [sortField, setSortField] = useState<SortField>('codigo');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Resolve Provider map for quick lookup
  const providerMap = useMemo(() => {
    const map = new Map<string, string>();
    proveedores.forEach(p => {
      map.set(p.id, p.nombre);
    });
    return map;
  }, [proveedores]);

  // Extract unique categories for filter
  const uniqueCategories = useMemo(() => {
    const categories = productos.map(p => p.categoria).filter(Boolean);
    return Array.from(new Set(categories));
  }, [productos]);

  // Handle Sort Change
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filtered and Sorted Products
  const processedProducts = useMemo(() => {
    let result = [...productos];

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        p.codigo.toLowerCase().includes(query) ||
        p.nombre.toLowerCase().includes(query) ||
        p.categoria.toLowerCase().includes(query) ||
        p.descripcion.toLowerCase().includes(query)
      );
    }

    // Categoria Filter
    if (categoriaFilter !== 'all') {
      result = result.filter(p => p.categoria === categoriaFilter);
    }

    // Proveedor Filter
    if (proveedorFilter !== 'all') {
      result = result.filter(p => p.proveedorId === proveedorFilter);
    }

    // Status Filter (Activo / Inactivo)
    if (statusFilter !== 'all') {
      const activeValue = statusFilter === 'activo';
      result = result.filter(p => p.activo === activeValue);
    }

    // Sorting
    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      } else if (typeof valA === 'boolean') {
        valA = valA ? 1 : 0;
        valB = valB ? 1 : 0;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [productos, searchQuery, categoriaFilter, proveedorFilter, statusFilter, sortField, sortOrder]);

  // Reset pagination if search or filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoriaFilter, proveedorFilter, statusFilter]);

  // Pagination bounds
  const totalItems = processedProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [processedProducts, currentPage]);

  const startRange = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endRange = Math.min(currentPage * itemsPerPage, totalItems);

  // Status badge mapping
  const renderStatusBadge = (activo: boolean) => {
    if (activo) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-600/10">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Activo
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-600/10">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          Inactivo
        </span>
      );
    }
  };

  // Sort Icon Renderer
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-slate-400 inline-block" />;
    return sortOrder === 'asc' 
      ? <ChevronUp className="ml-1 h-4 w-4 text-gray-900 font-bold inline-block" />
      : <ChevronDown className="ml-1 h-4 w-4 text-gray-900 font-bold inline-block" />;
  };

  return (
    <div className="space-y-4">
      {/* Search and Action Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre, categoría o código..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-gray-700/20 focus:border-gray-700 transition-all rounded-lg"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute top-2.5 right-3 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Advanced filters toggle button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`h-9 text-xs font-medium border-slate-200 rounded-lg transition-colors gap-1.5 ${showFilters ? 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100 hover:text-gray-900' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filtros
            {(categoriaFilter !== 'all' || proveedorFilter !== 'all' || statusFilter !== 'all') && (
              <span className="h-2 w-2 rounded-full bg-gray-900 animate-pulse ml-0.5" />
            )}
          </Button>

          {/* New Product Button */}
          <Button
            onClick={onNewProducto}
            className="h-9 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-lg shadow-sm shadow-gray-900/10 transition-all gap-1.5 px-3.5"
          >
            <Plus className="h-4 w-4" />
            Nuevo Producto
          </Button>
        </div>
      </div>

      {/* Advanced Filter Panel */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Categoría</label>
            <select
              value={categoriaFilter}
              onChange={(e) => setCategoriaFilter(e.target.value)}
              className="w-full text-xs h-9 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700/20"
            >
              <option value="all">Todas las categorías</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Proveedor</label>
            <select
              value={proveedorFilter}
              onChange={(e) => setProveedorFilter(e.target.value)}
              className="w-full text-xs h-9 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700/20"
            >
              <option value="all">Todos los proveedores</option>
              {proveedores.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Estado</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs h-9 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700/20"
            >
              <option value="all">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        </div>
      )}

      {/* Table Element */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead onClick={() => handleSort('codigo')} className="cursor-pointer hover:bg-slate-100 transition-colors py-3 px-4 font-semibold text-xs text-slate-500 select-none w-28">
                  Código {renderSortIcon('codigo')}
                </TableHead>
                <TableHead className="py-3 px-4 font-semibold text-xs text-slate-500 select-none w-16 text-center">
                  Imagen
                </TableHead>
                <TableHead onClick={() => handleSort('nombre')} className="cursor-pointer hover:bg-slate-100 transition-colors py-3 px-4 font-semibold text-xs text-slate-500 select-none">
                  Descripción del Producto {renderSortIcon('nombre')}
                </TableHead>
                <TableHead onClick={() => handleSort('categoria')} className="cursor-pointer hover:bg-slate-100 transition-colors py-3 px-4 font-semibold text-xs text-slate-500 select-none w-36">
                  Categoría {renderSortIcon('categoria')}
                </TableHead>
                <TableHead className="py-3 px-4 font-semibold text-xs text-slate-500 select-none max-w-[180px]">
                  Proveedor Asociado
                </TableHead>
                <TableHead onClick={() => handleSort('precioVenta')} className="cursor-pointer hover:bg-slate-100 transition-colors py-3 px-4 font-semibold text-xs text-slate-500 select-none w-28 text-right">
                  PVP {renderSortIcon('precioVenta')}
                </TableHead>
                <TableHead className="py-3 px-4 font-semibold text-xs text-slate-500 select-none w-36">
                  Restos / Sobrantes
                </TableHead>
                <TableHead onClick={() => handleSort('activo')} className="cursor-pointer hover:bg-slate-100 transition-colors py-3 px-4 font-semibold text-xs text-slate-500 select-none w-24">
                  Estado {renderSortIcon('activo')}
                </TableHead>
                <TableHead className="py-3 px-4 text-right font-semibold text-xs text-slate-500 select-none w-28">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((prod) => {
                  const supplierName = providerMap.get(prod.proveedorId) || 'Desconocido';
                  return (
                    <TableRow 
                      key={prod.id} 
                      className="hover:bg-slate-50/50 transition-colors cursor-pointer animate-in fade-in-30"
                      onClick={() => onSelectProducto(prod)}
                    >
                      <TableCell className="py-3 px-4 font-mono font-bold text-xs text-slate-900">
                        {prod.codigo}
                      </TableCell>
                      <TableCell className="py-2 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-150 bg-slate-50 flex items-center justify-center mx-auto shadow-2xs">
                          {prod.imagenUrl ? (
                            <img 
                              src={prod.imagenUrl} 
                              alt={prod.nombre} 
                              className="h-full w-full object-cover transition-transform duration-200 hover:scale-115"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                // Fallback if image fails to load
                                (e.target as any).src = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=100&q=80";
                              }}
                            />
                          ) : (
                            <Package className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <div>
                          <p className="font-bold text-slate-900 text-xs leading-snug">{prod.nombre}</p>
                          {prod.descripcion && (
                            <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                              {prod.descripcion}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 rounded-md bg-gray-100/70 px-2 py-0.5 text-[10px] font-bold text-gray-800 ring-1 ring-inset ring-gray-900/10">
                          <Tag className="h-3 w-3 text-gray-500" />
                          {prod.categoria}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-xs font-semibold text-slate-700 max-w-[180px] truncate">
                        <span className="inline-flex items-center gap-1">
                          <Store className="h-3.5 w-3.5 text-slate-400" />
                          {supplierName}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-right font-mono font-bold text-slate-950 text-xs">
                        {prod.precioVenta.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                        <span className="text-[10px] text-slate-400 font-normal block">P.C: {prod.precioCompra.toLocaleString('es-ES')} €</span>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-xs font-semibold text-slate-700 max-w-[150px] truncate" title={prod.restos || 'Sin restos'}>
                        {prod.restos || <span className="text-slate-300 font-normal">-</span>}
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        {renderStatusBadge(prod.activo)}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onSelectProducto(prod)}
                            title="Ficha Producto"
                            className="h-8 w-8 text-slate-400 hover:text-gray-900 rounded-lg hover:bg-slate-100"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEditProducto(prod)}
                            title="Editar"
                            className="h-8 w-8 text-slate-400 hover:text-gray-900 rounded-lg hover:bg-slate-100"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (window.confirm(`¿Estás seguro de que deseas eliminar el producto "${prod.nombre}" del catálogo?`)) {
                                onDeleteProducto(prod.id);
                              }
                            }}
                            title="Eliminar"
                            className="h-8 w-8 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle className="h-8 w-8 text-slate-300 mb-2" />
                      <p className="text-sm font-semibold text-slate-600 mb-0.5">No se encontraron productos</p>
                      <p className="text-xs text-slate-400">Prueba a cambiar tus términos de búsqueda o filtros.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer with Pagination */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Anterior
            </Button>
            <Button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Siguiente
            </Button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-slate-700">
                Mostrando <span className="font-semibold">{startRange}</span> a{' '}
                <span className="font-semibold">{endRange}</span> de{' '}
                <span className="font-semibold">{totalItems}</span> productos
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-2xs" aria-label="Pagination">
                <Button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="rounded-l-lg h-8 w-8 p-0 border-slate-200"
                >
                  «
                </Button>
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="h-8 w-8 p-0 border-slate-200"
                >
                  ‹
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    variant={currentPage === page ? 'default' : 'outline'}
                    className={`h-8 w-8 p-0 text-xs ${currentPage === page ? 'bg-gray-900 text-white' : 'border-slate-200 text-slate-600'}`}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  className="h-8 w-8 p-0 border-slate-200"
                >
                  ›
                </Button>
                <Button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  className="rounded-r-lg h-8 w-8 p-0 border-slate-200"
                >
                  »
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
