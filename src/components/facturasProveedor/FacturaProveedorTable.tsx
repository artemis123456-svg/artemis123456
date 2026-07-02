import React, { useState, useMemo } from 'react';
import { FacturaProveedor } from '../../types/facturaProveedor';
import { Proveedor } from '../../types/proveedor';
import { calculateFacturaProveedorTotals } from '../../hooks/useFacturasProveedor';
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

interface FacturaProveedorTableProps {
  facturas: FacturaProveedor[];
  proveedores: Proveedor[];
  onSelectFactura: (factura: FacturaProveedor) => void;
  onEditFactura: (factura: FacturaProveedor) => void;
  onDeleteFactura: (id: string) => void;
  onNewFactura: () => void;
  onToggleGestoria?: (id: string) => void;
}

type SortField = 'numero' | 'proveedorName' | 'fechaEmision' | 'total' | 'estado';
type SortOrder = 'asc' | 'desc';

export default function FacturaProveedorTable({
  facturas,
  proveedores,
  onSelectFactura,
  onEditFactura,
  onDeleteFactura,
  onNewFactura,
  onToggleGestoria
}: FacturaProveedorTableProps) {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [estadoFilter, setEstadoFilter] = useState<string>('all');
  const [proveedorFilter, setProveedorFilter] = useState<string>('all');
  
  // Sorting State
  const [sortField, setSortField] = useState<SortField>('numero');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Enrich invoices with provider details and totals
  const enrichedFacturas = useMemo(() => {
    return facturas.map(f => {
      const totals = calculateFacturaProveedorTotals(f.lineas, f.retencionIrpf);
      const prov = proveedores.find(p => p.id === f.proveedorId);
      return {
        ...f,
        proveedorName: prov ? prov.nombre : 'Proveedor Desconocido',
        baseImponible: totals.baseImponible,
        total: totals.total,
        totalIva: totals.totalIva
      };
    });
  }, [facturas, proveedores]);

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

    // Search query (number, provider name, observations)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(f => 
        f.numero.toLowerCase().includes(query) ||
        f.proveedorName.toLowerCase().includes(query) ||
        (f.observaciones && f.observaciones.toLowerCase().includes(query))
      );
    }

    // Estado Filter
    if (estadoFilter !== 'all') {
      result = result.filter(f => f.estado === estadoFilter);
    }

    // Proveedor Filter
    if (proveedorFilter !== 'all') {
      result = result.filter(f => f.proveedorId === proveedorFilter);
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
  }, [enrichedFacturas, searchQuery, estadoFilter, proveedorFilter, sortField, sortOrder]);

  // Reset pagination if search or filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, estadoFilter, proveedorFilter]);

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
  const renderStatusBadge = (estado: FacturaProveedor['estado']) => {
    switch (estado) {
      case 'Pagada':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Pagada
          </span>
        );
      case 'Pendiente':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-600/10">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
            Pendiente
          </span>
        );
      case 'Vencida':
        return (
          <span className="inline-flex items-center gap-1 rounded bg-red-50 px-2 py-0.5 text-xs font-bold text-red-700 ring-1 ring-inset ring-red-600/10">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 text-red-500 animate-pulse"></span>
            Vencida
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded bg-slate-50 px-2 py-0.5 text-xs font-bold text-slate-700 ring-1 ring-inset ring-slate-600/10">
            {estado}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Action Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 border border-slate-150 rounded-xl">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por número o proveedor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-xs h-10 border-slate-200 focus-visible:ring-verini-black"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex w-full md:w-auto items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`text-xs h-10 gap-1.5 border-slate-200 cursor-pointer ${showFilters ? 'bg-slate-50 font-bold border-slate-300' : ''}`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
            {(estadoFilter !== 'all' || proveedorFilter !== 'all') && (
              <span className="h-2 w-2 rounded-full bg-verini-black"></span>
            )}
          </Button>

          <Button
            onClick={onNewFactura}
            className="bg-verini-black hover:bg-black/95 text-white text-xs h-10 px-4 gap-1.5 rounded-lg font-bold cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            Nueva Factura de Proveedor
          </Button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 border border-slate-200/60 rounded-xl text-xs animate-in fade-in-50 slide-in-from-top-3 duration-200">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Filtrar por Estado</label>
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 focus:outline-none focus:ring-1 focus:ring-verini-black"
            >
              <option value="all">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Pagada">Pagada</option>
              <option value="Vencida">Vencida</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Filtrar por Proveedor</label>
            <select
              value={proveedorFilter}
              onChange={(e) => setProveedorFilter(e.target.value)}
              className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 focus:outline-none focus:ring-1 focus:ring-verini-black"
            >
              <option value="all">Todos los proveedores</option>
              {proveedores.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-white border border-slate-150 rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead onClick={() => handleSort('numero')} className="cursor-pointer select-none hover:bg-slate-100/50 w-32 font-bold text-slate-700">
                Número {renderSortIcon('numero')}
              </TableHead>
              <TableHead onClick={() => handleSort('proveedorName')} className="cursor-pointer select-none hover:bg-slate-100/50 font-bold text-slate-700">
                Proveedor {renderSortIcon('proveedorName')}
              </TableHead>
              <TableHead onClick={() => handleSort('fechaEmision')} className="cursor-pointer select-none hover:bg-slate-100/50 w-36 font-bold text-slate-700">
                Fecha Emisión {renderSortIcon('fechaEmision')}
              </TableHead>
              <TableHead className="w-36 font-bold text-slate-700">
                Fecha Vencimiento
              </TableHead>
              <TableHead onClick={() => handleSort('total')} className="cursor-pointer select-none hover:bg-slate-100/50 w-28 text-right font-bold text-slate-700">
                Base {renderSortIcon('total')}
              </TableHead>
              <TableHead className="w-32 text-right font-bold text-slate-700">
                Total
              </TableHead>
              <TableHead onClick={() => handleSort('estado')} className="cursor-pointer select-none hover:bg-slate-100/50 w-32 font-bold text-slate-700">
                Estado {renderSortIcon('estado')}
              </TableHead>
              <TableHead className="py-3 px-4 font-bold text-slate-700 select-none text-center">
                Gestoría
              </TableHead>
              <TableHead className="w-28 text-right font-bold text-slate-700">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedFacturas.length > 0 ? (
              paginatedFacturas.map((f) => (
                <TableRow 
                  key={f.id} 
                  className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                  onClick={() => onSelectFactura(f)}
                >
                  <TableCell className="font-mono text-xs font-semibold text-slate-800">
                    {f.numero}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-slate-800">
                    {f.proveedorName}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {new Date(f.fechaEmision).toLocaleDateString('es-ES')}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {new Date(f.fechaVencimiento).toLocaleDateString('es-ES')}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-xs text-slate-600">
                    {f.baseImponible.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-xs text-slate-900 group-hover:text-verini-black transition-colors">
                    {f.total.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </TableCell>
                  <TableCell className="text-xs">
                    {renderStatusBadge(f.estado)}
                  </TableCell>
                  <TableCell className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-2">
                      <input
                        type="checkbox"
                        checked={f.entregadoGestoria || false}
                        onChange={() => onToggleGestoria?.(f.id)}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      {f.entregadoGestoria ? (
                        <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
                          Entregado
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-md bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 ring-1 ring-slate-200">
                          Pendiente
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onSelectFactura(f)}
                        className="h-8 w-8 text-slate-400 hover:text-slate-800 rounded-md cursor-pointer"
                        title="Ver Ficha"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditFactura(f)}
                        className="h-8 w-8 text-slate-400 hover:text-slate-800 rounded-md cursor-pointer"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteFactura(f.id)}
                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="h-8 w-8 text-slate-300" />
                    <p className="text-slate-500 text-xs font-semibold">No se encontraron facturas de proveedor</p>
                    <p className="text-slate-400 text-[11px]">Intenta cambiando los filtros o introduce una nueva factura.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-150 bg-slate-50/50 px-4 py-3">
            <span className="text-[11px] text-slate-500 font-medium">
              Mostrando <span className="font-bold text-slate-800">{startRange}</span> a <span className="font-bold text-slate-800">{endRange}</span> de <span className="font-bold text-slate-800">{totalItems}</span> resultados
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="text-xs h-8 px-2.5 rounded-lg border-slate-200 cursor-pointer"
              >
                Anterior
              </Button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(i + 1)}
                  className={`text-xs h-8 w-8 p-0 rounded-lg cursor-pointer ${
                    currentPage === i + 1 ? 'bg-verini-black hover:bg-black/95 text-white' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="text-xs h-8 px-2.5 rounded-lg border-slate-200 cursor-pointer"
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  function renderSortIcon(field: SortField) {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-slate-400 inline-block" />;
    return sortOrder === 'asc' 
      ? <ChevronUp className="ml-1 h-3.5 w-3.5 text-slate-900 inline-block" /> 
      : <ChevronDown className="ml-1 h-3.5 w-3.5 text-slate-900 inline-block" />;
  }
}
