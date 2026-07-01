import React, { useState, useMemo } from 'react';
import { Client, Obra } from '../../types/client';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableCell, 
  TableHead 
} from '@/src/components/ui/table';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Badge } from '@/src/components/ui/badge';
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
  Building,
  User,
  ArrowUpDown,
  AlertCircle
} from 'lucide-react';

interface ClientTableProps {
  clients: Client[];
  obras: Obra[];
  onSelectClient: (client: Client) => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
  onNewClient: () => void;
}

type SortField = 'codigo' | 'nombre' | 'empresa' | 'telefono' | 'email' | 'ciudad' | 'obrasCount' | 'estado';
type SortOrder = 'asc' | 'desc';

export default function ClientTable({
  clients,
  obras,
  onSelectClient,
  onEditClient,
  onDeleteClient,
  onNewClient
}: ClientTableProps) {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  
  // Sorting State
  const [sortField, setSortField] = useState<SortField>('codigo');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Calculate works count for each client
  const clientsWithObrasCount = useMemo(() => {
    return clients.map(client => {
      const count = obras.filter(o => o.clientId === client.id).length;
      return {
        ...client,
        obrasCount: count
      };
    });
  }, [clients, obras]);

  // Extract unique cities for filter dropdown
  const uniqueCities = useMemo(() => {
    const cities = clients.map(c => c.ciudad).filter(Boolean);
    return Array.from(new Set(cities));
  }, [clients]);

  // Handle Sort Change
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filtered and Sorted Clients
  const processedClients = useMemo(() => {
    let result = [...clientsWithObrasCount];

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(c => 
        c.codigo.toLowerCase().includes(query) ||
        c.nombre.toLowerCase().includes(query) ||
        c.apellidos.toLowerCase().includes(query) ||
        c.empresa.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.ciudad.toLowerCase().includes(query) ||
        c.telefono.includes(query) ||
        c.movil.includes(query)
      );
    }

    // Status Filter
    if (statusFilter !== 'all') {
      result = result.filter(c => c.estado === statusFilter);
    }

    // City Filter
    if (cityFilter !== 'all') {
      result = result.filter(c => c.ciudad === cityFilter);
    }

    // Sorting
    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      // Custom evaluation for complex / concatenated fields
      if (sortField === 'nombre') {
        valA = `${a.nombre} ${a.apellidos}`.toLowerCase();
        valB = `${b.nombre} ${b.apellidos}`.toLowerCase();
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [clientsWithObrasCount, searchQuery, statusFilter, cityFilter, sortField, sortOrder]);

  // Reset pagination if search or filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, cityFilter]);

  // Pagination bounds
  const totalItems = processedClients.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  
  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedClients.slice(startIndex, startIndex + itemsPerPage);
  }, [processedClients, currentPage]);

  const startRange = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endRange = Math.min(currentPage * itemsPerPage, totalItems);

  // Status badges mapping
  const renderStatusBadge = (estado: Client['estado']) => {
    switch (estado) {
      case 'Activo':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/10 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Activo
          </span>
        );
      case 'Inactivo':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-600/10 dark:bg-slate-500/10 dark:text-slate-400 dark:ring-slate-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Inactivo
          </span>
        );
      case 'Potencial':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-600/10 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Potencial
          </span>
        );
      default:
        return null;
    }
  };

  // Lead source badges mapping
  const renderLeadSourceBadge = (fuente: Client['fuenteLead']) => {
    const styles: Record<Client['fuenteLead'], string> = {
      Showroom: 'bg-purple-50 text-purple-700 ring-purple-600/10',
      Web: 'bg-blue-50 text-blue-700 ring-blue-600/10',
      WhatsApp: 'bg-green-50 text-green-700 ring-green-600/10',
      Telefono: 'bg-cyan-50 text-cyan-700 ring-cyan-600/10',
      Instagram: 'bg-pink-50 text-pink-700 ring-pink-600/10',
      Referido: 'bg-gray-100 text-gray-800 ring-gray-900/10',
      Otro: 'bg-slate-50 text-slate-700 ring-slate-600/10',
    };

    const labelMap: Record<Client['fuenteLead'], string> = {
      Showroom: 'Showroom',
      Web: 'Web',
      WhatsApp: 'WhatsApp',
      Telefono: 'Teléfono',
      Instagram: 'Instagram',
      Referido: 'Referido',
      Otro: 'Otro',
    };

    const currentStyle = styles[fuente] || styles.Otro;
    const currentLabel = labelMap[fuente] || labelMap.Otro;

    return (
      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${currentStyle}`}>
        {currentLabel}
      </span>
    );
  };

  // Sort Icon Renderer
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-slate-400" />;
    return sortOrder === 'asc' 
      ? <ChevronUp className="ml-1 h-4 w-4 text-gray-900 font-bold" />
      : <ChevronDown className="ml-1 h-4 w-4 text-gray-900 font-bold" />;
  };

  return (
    <div className="space-y-4">
      {/* Search and Action Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar por código, nombre, empresa, email, ciudad..."
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
            {(statusFilter !== 'all' || cityFilter !== 'all') && (
              <span className="h-2 w-2 rounded-full bg-gray-900 animate-pulse ml-0.5" />
            )}
          </Button>

          {/* New Client Button */}
          <Button
            onClick={onNewClient}
            className="h-9 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-lg shadow-sm shadow-gray-900/10 transition-all gap-1.5 px-3.5"
          >
            <Plus className="h-4 w-4" />
            Nuevo Cliente
          </Button>
        </div>
      </div>

      {/* Advanced Filter Panel */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Estado del Cliente</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs h-9 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700/20"
            >
              <option value="all">Todos los estados</option>
              <option value="Activo">Activos</option>
              <option value="Potencial">Potenciales</option>
              <option value="Inactivo">Inactivos</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Ciudad</label>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full text-xs h-9 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700/20"
            >
              <option value="all">Todas las ciudades</option>
              {uniqueCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatusFilter('all');
                setCityFilter('all');
              }}
              disabled={statusFilter === 'all' && cityFilter === 'all'}
              className="text-xs text-gray-900 hover:text-gray-900 font-medium h-9 hover:bg-gray-100 disabled:opacity-50"
            >
              Limpiar filtros
            </Button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {totalItems > 0 ? (
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="bg-slate-50/75 border-b border-slate-100">
                <TableRow>
                  <TableHead 
                    onClick={() => handleSort('codigo')}
                    className="cursor-pointer hover:bg-slate-100 transition-colors text-xs font-semibold text-slate-600 py-3.5 px-4 w-28 select-none"
                  >
                    <div className="flex items-center">
                      Código
                      {renderSortIcon('codigo')}
                    </div>
                  </TableHead>
                  <TableHead 
                    onClick={() => handleSort('nombre')}
                    className="cursor-pointer hover:bg-slate-100 transition-colors text-xs font-semibold text-slate-600 py-3.5 px-4 select-none"
                  >
                    <div className="flex items-center">
                      Nombre
                      {renderSortIcon('nombre')}
                    </div>
                  </TableHead>
                  <TableHead 
                    onClick={() => handleSort('empresa')}
                    className="cursor-pointer hover:bg-slate-100 transition-colors text-xs font-semibold text-slate-600 py-3.5 px-4 select-none"
                  >
                    <div className="flex items-center">
                      Empresa
                      {renderSortIcon('empresa')}
                    </div>
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 py-3.5 px-4">
                    Teléfono
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 py-3.5 px-4">
                    Email
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 py-3.5 px-4">
                    Origen Lead
                  </TableHead>
                  <TableHead 
                    onClick={() => handleSort('ciudad')}
                    className="cursor-pointer hover:bg-slate-100 transition-colors text-xs font-semibold text-slate-600 py-3.5 px-4 select-none"
                  >
                    <div className="flex items-center">
                      Ciudad
                      {renderSortIcon('ciudad')}
                    </div>
                  </TableHead>
                  <TableHead 
                    onClick={() => handleSort('obrasCount')}
                    className="cursor-pointer hover:bg-slate-100 transition-colors text-xs font-semibold text-slate-600 py-3.5 px-4 text-center select-none"
                  >
                    <div className="flex items-center justify-center">
                      Nº Obras
                      {renderSortIcon('obrasCount')}
                    </div>
                  </TableHead>
                  <TableHead 
                    onClick={() => handleSort('estado')}
                    className="cursor-pointer hover:bg-slate-100 transition-colors text-xs font-semibold text-slate-600 py-3.5 px-4 select-none"
                  >
                    <div className="flex items-center">
                      Estado
                      {renderSortIcon('estado')}
                    </div>
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 py-3.5 px-4 text-right w-28">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedClients.map((client) => (
                  <TableRow 
                    key={client.id}
                    onClick={() => onSelectClient(client)}
                    className="group border-b border-slate-100/70 hover:bg-slate-50/50 cursor-pointer transition-colors duration-150"
                  >
                    {/* Código */}
                    <TableCell className="px-4 py-3 font-mono text-xs font-semibold text-slate-900 group-hover:text-gray-900 transition-colors">
                      {client.codigo}
                    </TableCell>

                    {/* Nombre */}
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200">
                          {client.nombre.charAt(0)}{client.apellidos.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-slate-900 group-hover:text-slate-900 leading-tight">
                            {client.nombre} {client.apellidos}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Empresa */}
                    <TableCell className="px-4 py-3 text-xs text-slate-700">
                      <span className="inline-flex items-center gap-1">
                        <Building className="h-3 w-3 text-slate-400" />
                        {client.empresa}
                      </span>
                    </TableCell>

                    {/* Teléfono */}
                    <TableCell className="px-4 py-3 text-xs text-slate-500 font-mono">
                      {client.telefono || client.movil || '-'}
                    </TableCell>

                    {/* Email */}
                    <TableCell className="px-4 py-3 text-xs text-slate-500 font-sans">
                      {client.email || '-'}
                    </TableCell>

                    {/* Origen Lead */}
                    <TableCell className="px-4 py-3 text-xs">
                      {renderLeadSourceBadge(client.fuenteLead)}
                    </TableCell>

                    {/* Ciudad */}
                    <TableCell className="px-4 py-3 text-xs text-slate-700">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        {client.ciudad || '-'}
                      </span>
                    </TableCell>

                    {/* Número de obras */}
                    <TableCell className="px-4 py-3 text-xs text-center font-semibold">
                      <span className={`inline-flex items-center justify-center h-5 px-2 rounded-full font-mono ${client.obrasCount > 0 ? 'bg-gray-100 text-gray-800' : 'bg-slate-100 text-slate-400'}`}>
                        {client.obrasCount}
                      </span>
                    </TableCell>

                    {/* Estado */}
                    <TableCell className="px-4 py-3">
                      {renderStatusBadge(client.estado)}
                    </TableCell>

                    {/* Acciones */}
                    <TableCell className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => onSelectClient(client)}
                          title="Ver ficha"
                          className="h-7 w-7 text-slate-400 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => onEditClient(client)}
                          title="Editar"
                          className="h-7 w-7 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => {
                            if (window.confirm(`¿Está seguro de que desea eliminar al cliente ${client.nombre} ${client.apellidos}? Esta acción es irreversible.`)) {
                              onDeleteClient(client.id);
                            }
                          }}
                          title="Eliminar"
                          className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 border border-slate-200 text-slate-400 mb-3 animate-pulse">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">No se encontraron clientes</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              Prueba a cambiar los términos de búsqueda o filtros, o añade un nuevo cliente al sistema.
            </p>
            <Button
              onClick={onNewClient}
              className="mt-4 h-8 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-lg shadow-sm gap-1.5 px-3"
            >
              <Plus className="h-3.5 w-3.5" />
              Añadir Cliente
            </Button>
          </div>
        )}

        {/* Pagination bar */}
        {totalItems > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
            <div className="hidden sm:flex flex-1 items-center justify-between">
              <span className="text-xs text-slate-500">
                Mostrando <span className="font-semibold text-slate-700">{startRange}</span> a <span className="font-semibold text-slate-700">{endRange}</span> de <span className="font-semibold text-slate-700">{totalItems}</span> clientes
              </span>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 sm:hidden">
                Pág. {currentPage} de {totalPages}
              </span>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-8 text-xs font-medium border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg"
                >
                  Anterior
                </Button>
                
                <div className="hidden md:flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="xs"
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 w-8 text-xs font-medium rounded-lg ${currentPage === page ? 'bg-gray-900 text-white hover:bg-gray-800' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'}`}
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="h-8 text-xs font-medium border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg"
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
