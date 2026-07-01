import React, { useState, useMemo } from 'react';
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
  Truck,
  Briefcase,
  User,
  ArrowUpDown,
  AlertCircle
} from 'lucide-react';

interface ProveedorTableProps {
  proveedores: Proveedor[];
  onSelectProveedor: (prov: Proveedor) => void;
  onEditProveedor: (prov: Proveedor) => void;
  onDeleteProveedor: (id: string) => void;
  onNewProveedor: () => void;
}

type SortField = 'codigo' | 'nombre' | 'tipo' | 'categoria' | 'telefono' | 'email' | 'ciudad' | 'activo';
type SortOrder = 'asc' | 'desc';

export default function ProveedorTable({
  proveedores,
  onSelectProveedor,
  onEditProveedor,
  onDeleteProveedor,
  onNewProveedor
}: ProveedorTableProps) {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  
  // Sorting State
  const [sortField, setSortField] = useState<SortField>('codigo');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Extract unique cities for filter dropdown
  const uniqueCities = useMemo(() => {
    const cities = proveedores.map(p => p.ciudad).filter(Boolean);
    return Array.from(new Set(cities));
  }, [proveedores]);

  // Handle Sort Change
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filtered and Sorted Providers
  const processedProviders = useMemo(() => {
    let result = [...proveedores];

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        p.codigo.toLowerCase().includes(query) ||
        p.nombre.toLowerCase().includes(query) ||
        p.categoria.toLowerCase().includes(query) ||
        p.ciudad.toLowerCase().includes(query) ||
        p.email.toLowerCase().includes(query) ||
        p.personaContacto.toLowerCase().includes(query) ||
        p.telefono.includes(query) ||
        p.movil.includes(query)
      );
    }

    // Tipo Filter
    if (tipoFilter !== 'all') {
      result = result.filter(p => p.tipo === tipoFilter);
    }

    // Status Filter (Activo / Inactivo)
    if (statusFilter !== 'all') {
      const activeValue = statusFilter === 'activo';
      result = result.filter(p => p.activo === activeValue);
    }

    // City Filter
    if (cityFilter !== 'all') {
      result = result.filter(p => p.ciudad === cityFilter);
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
  }, [proveedores, searchQuery, tipoFilter, statusFilter, cityFilter, sortField, sortOrder]);

  // Reset pagination if search or filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, tipoFilter, statusFilter, cityFilter]);

  // Pagination bounds
  const totalItems = processedProviders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  
  const paginatedProviders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedProviders.slice(startIndex, startIndex + itemsPerPage);
  }, [processedProviders, currentPage]);

  const startRange = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endRange = Math.min(currentPage * itemsPerPage, totalItems);

  // Status badge mapping
  const renderStatusBadge = (activo: boolean) => {
    if (activo) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/10">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Activo
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-600/10">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          Inactivo
        </span>
      );
    }
  };

  // Tipo badge mapping
  const renderTipoBadge = (tipo: Proveedor['tipo']) => {
    if (tipo === 'Materiales') {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 ring-1 ring-inset ring-amber-600/20">
          <Truck className="mr-1 h-3.5 w-3.5 text-amber-600" />
          Materiales
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-800 ring-1 ring-inset ring-slate-200">
          <Briefcase className="mr-1 h-3.5 w-3.5 text-slate-500" />
          Subcontrata
        </span>
      );
    }
  };

  // Sort Icon Renderer
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-slate-400 inline-block" />;
    return sortOrder === 'asc' 
      ? <ChevronUp className="ml-1 h-4 w-4 text-slate-850 font-bold inline-block" />
      : <ChevronDown className="ml-1 h-4 w-4 text-slate-850 font-bold inline-block" />;
  };

  return (
    <div className="space-y-4">
      {/* Search and Action Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre, categoría, ciudad, contacto, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-verini-black/20 focus:border-verini-black transition-all rounded-lg"
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
            className={`h-9 text-xs font-medium border-slate-200 rounded-lg transition-colors gap-1.5 ${showFilters ? 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200 hover:text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filtros
            {(tipoFilter !== 'all' || statusFilter !== 'all' || cityFilter !== 'all') && (
              <span className="h-2 w-2 rounded-full bg-verini-yellow animate-pulse ml-0.5" />
            )}
          </Button>

          {/* New Provider Button */}
          <Button
            onClick={onNewProveedor}
            className="h-9 bg-verini-black hover:bg-black/90 text-white text-xs font-semibold rounded-lg shadow-xs transition-all gap-1.5 px-3.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Nuevo Proveedor
          </Button>
        </div>
      </div>

      {/* Advanced Filter Panel */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tipo de Proveedor</label>
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="w-full text-xs h-9 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 outline-none focus:border-verini-black focus:ring-1 focus:ring-verini-black/20"
            >
              <option value="all">Todos los tipos</option>
              <option value="Materiales">Materiales</option>
              <option value="Subcontrata">Subcontrata / Gremios</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Estado</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs h-9 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 outline-none focus:border-verini-black focus:ring-1 focus:ring-verini-black/20"
            >
              <option value="all">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Ciudad</label>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full text-xs h-9 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 outline-none focus:border-verini-black focus:ring-1 focus:ring-verini-black/20"
            >
              <option value="all">Todas las ciudades</option>
              {uniqueCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
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
                <TableHead onClick={() => handleSort('codigo')} className="cursor-pointer hover:bg-slate-100 transition-colors py-3 px-4 font-semibold text-xs text-slate-500 select-none">
                  Código {renderSortIcon('codigo')}
                </TableHead>
                <TableHead onClick={() => handleSort('nombre')} className="cursor-pointer hover:bg-slate-100 transition-colors py-3 px-4 font-semibold text-xs text-slate-500 select-none">
                  Nombre Comercial / Razón Social {renderSortIcon('nombre')}
                </TableHead>
                <TableHead onClick={() => handleSort('tipo')} className="cursor-pointer hover:bg-slate-100 transition-colors py-3 px-4 font-semibold text-xs text-slate-500 select-none">
                  Tipo {renderSortIcon('tipo')}
                </TableHead>
                <TableHead onClick={() => handleSort('categoria')} className="cursor-pointer hover:bg-slate-100 transition-colors py-3 px-4 font-semibold text-xs text-slate-500 select-none">
                  Categoría {renderSortIcon('categoria')}
                </TableHead>
                <TableHead className="py-3 px-4 font-semibold text-xs text-slate-500 select-none">
                  Contacto / Teléfono
                </TableHead>
                <TableHead onClick={() => handleSort('email')} className="cursor-pointer hover:bg-slate-100 transition-colors py-3 px-4 font-semibold text-xs text-slate-500 select-none">
                  Email {renderSortIcon('email')}
                </TableHead>
                <TableHead onClick={() => handleSort('ciudad')} className="cursor-pointer hover:bg-slate-100 transition-colors py-3 px-4 font-semibold text-xs text-slate-500 select-none">
                  Ciudad {renderSortIcon('ciudad')}
                </TableHead>
                <TableHead onClick={() => handleSort('activo')} className="cursor-pointer hover:bg-slate-100 transition-colors py-3 px-4 font-semibold text-xs text-slate-500 select-none">
                  Estado {renderSortIcon('activo')}
                </TableHead>
                <TableHead className="py-3 px-4 text-right font-semibold text-xs text-slate-500 select-none w-28">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProviders.length > 0 ? (
                paginatedProviders.map((prov) => (
                  <TableRow 
                    key={prov.id} 
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                    onClick={() => onSelectProveedor(prov)}
                  >
                    <TableCell className="py-3 px-4 font-mono font-bold text-xs text-slate-900">
                      {prov.codigo}
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{prov.nombre}</p>
                        {prov.personaContacto && (
                          <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {prov.personaContacto}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      {renderTipoBadge(prov.tipo)}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-xs font-semibold text-slate-700">
                      {prov.categoria}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-xs font-medium text-slate-600">
                      <div>
                        <p>{prov.telefono}</p>
                        {prov.movil && <p className="text-[10px] text-slate-400">{prov.movil} (Móvil)</p>}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-xs font-mono text-slate-500 truncate max-w-[150px]">
                      {prov.email || '-'}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-xs">
                      <span className="inline-flex items-center gap-1 text-slate-600">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        {prov.ciudad || '-'}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      {renderStatusBadge(prov.activo)}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onSelectProveedor(prov)}
                          title="Ficha Proveedor"
                          className="h-8 w-8 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditProveedor(prov)}
                          title="Editar"
                          className="h-8 w-8 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (window.confirm(`¿Estás seguro de que deseas eliminar al proveedor "${prov.nombre}"?`)) {
                              onDeleteProveedor(prov.id);
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle className="h-8 w-8 text-slate-300 mb-2" />
                      <p className="text-sm font-semibold text-slate-600 mb-0.5">No se encontraron proveedores</p>
                      <p className="text-xs text-slate-400">Prueba a ajustar tu búsqueda o crea un nuevo proveedor en el sistema.</p>
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
                <span className="font-semibold">{totalItems}</span> proveedores
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
                    className={`h-8 w-8 p-0 text-xs ${currentPage === page ? 'bg-verini-black text-white hover:bg-black' : 'border-slate-200 text-slate-600'}`}
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
