import React, { useState, useMemo } from 'react';
import { PresupuestoNew, calculatePresupuestoTotals } from '../../types/presupuesto';
import { Client } from '../../types/client';
import { Obra } from '../../types/obra';
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
import { Card, CardContent } from '../ui/card';
import { 
  Search, 
  Plus, 
  SlidersHorizontal, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  Pencil, 
  Trash2, 
  Copy,
  Calendar,
  AlertCircle,
  FileCheck2,
  DollarSign
} from 'lucide-react';

interface PresupuestoTableProps {
  presupuestos: PresupuestoNew[];
  clients: Client[];
  obras: Obra[];
  onSelect: (presupuesto: PresupuestoNew) => void;
  onEdit: (presupuesto: PresupuestoNew) => void;
  onDelete: (id: string) => void;
  onDuplicate: (presupuesto: PresupuestoNew) => void;
  onNew: () => void;
}

type SortField = 'numero' | 'clientName' | 'obraTitle' | 'fechaCreacion' | 'importeTotal' | 'estado';
type SortOrder = 'asc' | 'desc';

export default function PresupuestoTable({
  presupuestos,
  clients,
  obras,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onNew
}: PresupuestoTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [estadoFilter, setEstadoFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  
  const [sortField, setSortField] = useState<SortField>('numero');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const enrichedPresupuestos = useMemo(() => {
    return presupuestos.map(p => {
      const client = clients.find(c => c.id === p.clientId);
      const obra = p.obraId ? obras.find(o => o.id === p.obraId) : null;
      return {
        ...p,
        clientName: client ? `${client.nombre} ${client.apellidos}` : 'Cliente Desconocido',
        obraTitle: obra ? obra.titulo : 'Sin obra asociada'
      };
    });
  }, [presupuestos, clients, obras]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const processedPresupuestos = useMemo(() => {
    let result = [...enrichedPresupuestos];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        p.numero.toLowerCase().includes(query) ||
        p.clientName.toLowerCase().includes(query) ||
        p.obraTitle.toLowerCase().includes(query) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(query))
      );
    }

    if (estadoFilter !== 'all') {
      result = result.filter(p => p.estado === estadoFilter);
    }

    if (clientFilter !== 'all') {
      result = result.filter(p => p.clientId === clientFilter);
    }

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
  }, [enrichedPresupuestos, searchQuery, estadoFilter, clientFilter, sortField, sortOrder]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, estadoFilter, clientFilter]);

  const totalItems = processedPresupuestos.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  
  const paginatedPresupuestos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedPresupuestos.slice(startIndex, startIndex + itemsPerPage);
  }, [processedPresupuestos, currentPage]);

  const startRange = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endRange = Math.min(currentPage * itemsPerPage, totalItems);

  const renderStatusBadge = (estado: PresupuestoNew['estado']) => {
    switch (estado) {
      case 'Borrador':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
            Borrador
          </span>
        );
      case 'Enviado':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            Enviado
          </span>
        );
      case 'Aprobado':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            Aprobado
          </span>
        );
      case 'Rechazado':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
            Rechazado
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-200/55">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por código, cliente, obra o descripción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9.5 text-xs bg-white border-slate-200 h-9.5 focus-visible:ring-gray-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`h-9.5 px-3 text-xs font-semibold cursor-pointer border-slate-200 flex items-center gap-1.5 transition-colors
              ${showFilters ? 'bg-slate-150 text-slate-900 border-slate-300' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filtros
          </Button>
          <Button
            size="sm"
            onClick={onNew}
            className="h-9.5 px-4 text-xs font-bold bg-gray-900 hover:bg-gray-800 text-white rounded-lg cursor-pointer flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Nuevo Presupuesto
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="border-slate-200/80 bg-slate-50/20 shadow-none rounded-xl">
          <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Filter by Estado */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-500 uppercase tracking-wide text-[9px]">Filtrar por Estado</label>
              <select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                className="w-full h-9 bg-white border border-slate-200 rounded-lg px-2 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 font-semibold"
              >
                <option value="all">Todos los estados</option>
                <option value="Borrador">Borrador</option>
                <option value="Enviado">Enviado</option>
                <option value="Aprobado">Aprobado</option>
                <option value="Rechazado">Rechazado</option>
              </select>
            </div>

            {/* Filter by Client */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-500 uppercase tracking-wide text-[9px]">Filtrar por Cliente</label>
              <select
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="w-full h-9 bg-white border border-slate-200 rounded-lg px-2 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 font-semibold"
              >
                <option value="all">Todos los clientes</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre} {c.apellidos}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table Section */}
      <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-xs">
        <Table>
          <TableHeader className="bg-slate-50/75">
            <TableRow className="hover:bg-transparent border-b border-slate-200/80">
              <TableHead onClick={() => handleSort('numero')} className="cursor-pointer select-none font-bold text-slate-600 text-xs py-3">
                <div className="flex items-center gap-1">
                  Código
                  {sortField === 'numero' && (sortOrder === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />)}
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort('clientName')} className="cursor-pointer select-none font-bold text-slate-600 text-xs py-3">
                <div className="flex items-center gap-1">
                  Cliente
                  {sortField === 'clientName' && (sortOrder === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />)}
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort('obraTitle')} className="cursor-pointer select-none font-bold text-slate-600 text-xs py-3">
                <div className="flex items-center gap-1">
                  Obra / Proyecto
                  {sortField === 'obraTitle' && (sortOrder === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />)}
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort('fechaCreacion')} className="cursor-pointer select-none font-bold text-slate-600 text-xs py-3">
                <div className="flex items-center gap-1">
                  Fecha
                  {sortField === 'fechaCreacion' && (sortOrder === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />)}
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort('importeTotal')} className="text-right cursor-pointer select-none font-bold text-slate-600 text-xs py-3">
                <div className="flex items-center justify-end gap-1">
                  Importe Total (+IVA)
                  {sortField === 'importeTotal' && (sortOrder === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />)}
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort('estado')} className="text-center cursor-pointer select-none font-bold text-slate-600 text-xs py-3">
                <div className="flex items-center justify-center gap-1">
                  Estado
                  {sortField === 'estado' && (sortOrder === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />)}
                </div>
              </TableHead>
              <TableHead className="text-right font-bold text-slate-600 text-xs py-3">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPresupuestos.length > 0 ? (
              paginatedPresupuestos.map((p) => (
                <TableRow key={p.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100">
                  <TableCell className="font-bold font-mono text-slate-900 text-xs py-3.5">
                    {p.numero}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-700 text-xs py-3.5">
                    {p.clientName}
                  </TableCell>
                  <TableCell className="text-slate-500 font-medium text-xs py-3.5 max-w-[200px] truncate" title={p.obraTitle}>
                    {p.obraTitle}
                  </TableCell>
                  <TableCell className="text-slate-500 font-medium text-xs py-3.5">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-450" />
                      {new Date(p.fechaCreacion).toLocaleDateString('es-ES')}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold font-mono text-slate-900 text-xs py-3.5">
                    {p.importeTotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </TableCell>
                  <TableCell className="text-center py-3.5">
                    {renderStatusBadge(p.estado)}
                  </TableCell>
                  <TableCell className="text-right py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onSelect(p)}
                        className="h-8 w-8 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 cursor-pointer"
                        title="Ver detalle"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(p)}
                        className="h-8 w-8 text-slate-500 hover:text-blue-700 rounded-md hover:bg-blue-50 cursor-pointer"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDuplicate(p)}
                        className="h-8 w-8 text-slate-500 hover:text-amber-700 rounded-md hover:bg-amber-50 cursor-pointer"
                        title="Duplicar"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm('¿Está seguro de que desea eliminar este presupuesto?')) {
                            onDelete(p.id);
                          }
                        }}
                        className="h-8 w-8 text-slate-450 hover:text-red-600 rounded-md hover:bg-red-50 cursor-pointer"
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
                <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileCheck2 className="h-10 w-10 text-slate-300" />
                    <span className="text-xs font-semibold">No se encontraron presupuestos</span>
                    <span className="text-[10px] text-slate-400">Prueba cambiando los filtros o crea uno nuevo</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1 text-xs">
          <p className="text-slate-500 font-medium">
            Mostrando <span className="font-bold text-slate-800">{startRange}</span> a <span className="font-bold text-slate-800">{endRange}</span> de <span className="font-bold text-slate-800">{totalItems}</span> presupuestos
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="h-8 px-2.5 text-[11px] font-bold cursor-pointer disabled:opacity-40"
            >
              Anterior
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className={`h-8 w-8 text-[11px] font-bold cursor-pointer
                  ${currentPage === page ? 'bg-gray-900 text-white' : 'hover:bg-slate-50 text-slate-600'}`}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="h-8 px-2.5 text-[11px] font-bold cursor-pointer disabled:opacity-40"
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
