import React, { useState, useMemo } from 'react';
import { Factura } from '../../types/factura';
import { Client } from '../../types/client';
import { Obra } from '../../types/obra';
import { calculateFacturaTotals } from '../../hooks/useFacturas';
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
  FileText,
  Calendar,
  DollarSign,
  ArrowUpDown,
  AlertCircle
} from 'lucide-react';

interface FacturaTableProps {
  facturas: Factura[];
  clients: Client[];
  obras: Obra[];
  onSelectFactura: (factura: Factura) => void;
  onEditFactura: (factura: Factura) => void;
  onDeleteFactura: (id: string) => void;
  onNewFactura: () => void;
}

type SortField = 'numero' | 'clientName' | 'obraTitle' | 'fechaEmision' | 'total' | 'estado';
type SortOrder = 'asc' | 'desc';

export default function FacturaTable({
  facturas,
  clients,
  obras,
  onSelectFactura,
  onEditFactura,
  onDeleteFactura,
  onNewFactura
}: FacturaTableProps) {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [estadoFilter, setEstadoFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  
  // Sorting State
  const [sortField, setSortField] = useState<SortField>('numero');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Enrich invoices with client details, obra details, and totals for efficient search and sort
  const enrichedFacturas = useMemo(() => {
    return facturas.map(f => {
      const totals = calculateFacturaTotals(f.lineas);
      const client = clients.find(c => c.id === f.clientId);
      const obra = obras.find(o => o.id === f.obraId);
      return {
        ...f,
        clientName: client ? `${client.nombre} ${client.apellidos}` : 'Cliente Desconocido',
        obraTitle: obra ? obra.titulo : 'Obra Desconocida',
        baseImponible: totals.baseImponible,
        total: totals.total,
        totalIva: totals.totalIva
      };
    });
  }, [facturas, clients, obras]);

  // Handle Sort Change
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filtered and Sorted Invoices
  const processedFacturas = useMemo(() => {
    let result = [...enrichedFacturas];

    // Search query (number, client name, obra title, observations)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(f => 
        f.numero.toLowerCase().includes(query) ||
        f.clientName.toLowerCase().includes(query) ||
        f.obraTitle.toLowerCase().includes(query) ||
        (f.observaciones && f.observaciones.toLowerCase().includes(query))
      );
    }

    // Estado Filter
    if (estadoFilter !== 'all') {
      result = result.filter(f => f.estado === estadoFilter);
    }

    // Client Filter
    if (clientFilter !== 'all') {
      result = result.filter(f => f.clientId === clientFilter);
    }

    // Sorting
    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [enrichedFacturas, searchQuery, estadoFilter, clientFilter, sortField, sortOrder]);

  // Reset pagination if search or filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, estadoFilter, clientFilter]);

  // Pagination bounds
  const totalItems = processedFacturas.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  
  const paginatedFacturas = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedFacturas.slice(startIndex, startIndex + itemsPerPage);
  }, [processedFacturas, currentPage]);

  const startRange = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endRange = Math.min(currentPage * itemsPerPage, totalItems);

  // Status badge mapping
  const renderStatusBadge = (estado: Factura['estado']) => {
    switch (estado) {
      case 'Cobrada':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-verini-teal/10 px-2 py-1 text-xs font-semibold text-verini-teal ring-1 ring-verini-teal/20">
            <span className="h-1.5 w-1.5 rounded-full bg-verini-teal" />
            Cobrada
          </span>
        );
      case 'Emitida':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-verini-blue/10 px-2 py-1 text-xs font-semibold text-verini-blue ring-1 ring-verini-blue/20">
            <span className="h-1.5 w-1.5 rounded-full bg-verini-blue" />
            Emitida
          </span>
        );
      case 'Borrador':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
            <span className="h-1.5 w-1.5 rounded-full bg-verini-grey" />
            Borrador
          </span>
        );
      case 'Vencida':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-verini-pink/10 px-2 py-1 text-xs font-semibold text-verini-pink ring-1 ring-verini-pink/20 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-verini-pink" />
            Vencida
          </span>
        );
      default:
        return null;
    }
  };

  // Sort Icon Renderer
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-slate-400 inline-block" />;
    return sortOrder === 'asc' 
      ? <ChevronUp className="ml-1 h-4 w-4 text-slate-900 font-bold inline-block" />
      : <ChevronDown className="ml-1 h-4 w-4 text-slate-900 font-bold inline-block" />;
  };

  // Format currency helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);
  };

  return (
    <div className="space-y-4">
      {/* Search and Action Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar por nº de factura, cliente, obra..."
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
            className={`h-9 text-xs font-medium border-slate-200 rounded-lg transition-colors gap-1.5 cursor-pointer ${showFilters ? 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200 hover:text-slate-950' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filtros
            {(estadoFilter !== 'all' || clientFilter !== 'all') && (
              <span className="h-2 w-2 rounded-full bg-verini-black animate-pulse ml-0.5" />
            )}
          </Button>

          {/* New Invoice Button */}
          <Button
            onClick={onNewFactura}
            className="h-9 bg-verini-black hover:bg-black/90 text-white text-xs font-semibold rounded-lg shadow-xs transition-all gap-1.5 px-3.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Nueva Factura
          </Button>
        </div>
      </div>

      {/* Advanced Filter Panel */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Estado de Factura</label>
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="w-full text-xs h-9 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 outline-none focus:border-verini-black focus:ring-1 focus:ring-verini-black/20"
            >
              <option value="all">Todos los estados</option>
              <option value="Borrador">Borrador</option>
              <option value="Emitida">Emitida</option>
              <option value="Cobrada">Cobrada</option>
              <option value="Vencida">Vencida</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Cliente</label>
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="w-full text-xs h-9 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 outline-none focus:border-verini-black focus:ring-1 focus:ring-verini-black/20"
            >
              <option value="all">Todos los clientes</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.nombre} {c.apellidos}</option>
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
                <TableHead onClick={() => handleSort('numero')} className="cursor-pointer hover:bg-slate-100 transition-colors py-3 px-4 font-semibold text-xs text-slate-500 select-none">
                  Nº Factura {renderSortIcon('numero')}
                </TableHead>
                <TableHead onClick={() => handleSort('clientName')} className="cursor-pointer hover:bg-slate-100 transition-colors py-3 px-4 font-semibold text-xs text-slate-500 select-none">
                  Cliente {renderSortIcon('clientName')}
                </TableHead>
                <TableHead onClick={() => handleSort('obraTitle')} className="cursor-pointer hover:bg-slate-100 transition-colors py-3 px-4 font-semibold text-xs text-slate-500 select-none">
                  Obra / Proyecto {renderSortIcon('obraTitle')}
                </TableHead>
                <TableHead onClick={() => handleSort('fechaEmision')} className="cursor-pointer hover:bg-slate-100 transition-colors py-3 px-4 font-semibold text-xs text-slate-500 select-none">
                  Emisión / Vencimiento {renderSortIcon('fechaEmision')}
                </TableHead>
                <TableHead className="py-3 px-4 text-right font-semibold text-xs text-slate-500 select-none">
                  Base Imponible
                </TableHead>
                <TableHead className="py-3 px-4 text-right font-semibold text-xs text-slate-500 select-none">
                  Cuota IVA
                </TableHead>
                <TableHead onClick={() => handleSort('total')} className="cursor-pointer hover:bg-slate-100 transition-colors py-3 text-right px-4 font-semibold text-xs text-slate-500 select-none">
                  Total Factura {renderSortIcon('total')}
                </TableHead>
                <TableHead onClick={() => handleSort('estado')} className="cursor-pointer hover:bg-slate-100 transition-colors py-3 px-4 font-semibold text-xs text-slate-500 select-none">
                  Estado {renderSortIcon('estado')}
                </TableHead>
                <TableHead className="py-3 px-4 text-right font-semibold text-xs text-slate-500 select-none w-28">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedFacturas.length > 0 ? (
                paginatedFacturas.map((fac) => (
                  <TableRow 
                    key={fac.id} 
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                    onClick={() => onSelectFactura(fac)}
                  >
                    <TableCell className="py-3 px-4 font-mono font-bold text-xs text-slate-900">
                      <span className="flex items-center gap-1.5 text-slate-900">
                        <FileText className="h-3.5 w-3.5 text-slate-400" />
                        {fac.numero}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-xs font-bold text-slate-800">
                      {fac.clientName}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-xs font-medium text-slate-600 max-w-[200px] truncate">
                      {fac.obraTitle}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-xs text-slate-500">
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          {fac.fechaEmision}
                        </span>
                        <span className="text-[10px] text-slate-400">Vence: {fac.fechaVencimiento}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-xs text-right font-medium text-slate-600">
                      {formatCurrency(fac.baseImponible)}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-xs text-right font-medium text-slate-500">
                      {formatCurrency(fac.totalIva)}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-xs text-right font-bold text-slate-900">
                      {formatCurrency(fac.total)}
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      {renderStatusBadge(fac.estado)}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onSelectFactura(fac)}
                          title="Ver Detalle / Factura PDF"
                          className="h-8 w-8 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={fac.estado === 'Cobrada'}
                          onClick={() => onEditFactura(fac)}
                          title={fac.estado === 'Cobrada' ? "No se puede editar una factura cobrada" : "Editar"}
                          className="h-8 w-8 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:hover:text-slate-400 disabled:hover:bg-transparent cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (window.confirm(`¿Estás seguro de que deseas eliminar la factura "${fac.numero}"?`)) {
                              onDeleteFactura(fac.id);
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
                      <p className="text-sm font-semibold text-slate-600 mb-0.5">No se encontraron facturas</p>
                      <p className="text-xs text-slate-400">Prueba a cambiar tu búsqueda o filtros, o crea una nueva factura.</p>
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
                <span className="font-semibold">{totalItems}</span> facturas
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
                    className={`h-8 w-8 p-0 text-xs cursor-pointer ${currentPage === page ? 'bg-verini-black text-white' : 'border-slate-200 text-slate-600'}`}
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
