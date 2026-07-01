import React from 'react';
import { Obra } from '../../types/obra';
import { MapPin, Calendar, Wrench, User } from 'lucide-react';

interface ObraCardProps {
  key?: string;
  obra: Obra;
  clientName: string;
  onClick: (obra: Obra) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
}

export default function ObraCard({ obra, clientName, onClick, onDragStart }: ObraCardProps) {
  // Styles for reform type badges
  const typeStyles: Record<Obra['tipoReforma'], string> = {
    Cocina: 'bg-amber-50 text-amber-700 ring-amber-600/10',
    Baño: 'bg-sky-50 text-sky-700 ring-sky-600/10',
    Integral: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10',
    Otro: 'bg-slate-50 text-slate-700 ring-slate-600/10',
  };

  const handleDragStart = (e: React.DragEvent) => {
    onDragStart(e, obra.id);
  };

  return (
    <div
      id={`obra-card-${obra.id}`}
      draggable
      onDragStart={handleDragStart}
      onClick={() => onClick(obra)}
      className="group relative flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing select-none"
    >
      {/* Header with code and reform type */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {obra.codigo}
        </span>
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${typeStyles[obra.tipoReforma] || typeStyles.Otro}`}>
          {obra.tipoReforma}
        </span>
      </div>

      {/* Title */}
      <div className="space-y-1">
        <h4 className="text-xs font-bold text-slate-900 group-hover:text-slate-950 transition-colors line-clamp-2 leading-snug">
          {obra.titulo}
        </h4>
        
        {/* Client Name */}
        <div className="flex items-center gap-1.5 text-slate-500">
          <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="text-[11px] font-medium truncate">{clientName}</span>
        </div>
      </div>

      {/* Details (Address & Importe) */}
      <div className="space-y-1.5 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{obra.direccion}</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span>Inicio prev: {obra.fechaInicioPrevista ? new Date(obra.fechaInicioPrevista).toLocaleDateString('es-ES') : 'Sin fecha'}</span>
        </div>
      </div>

      {/* Price Tag */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Importe</span>
        <span className="font-mono text-xs font-bold text-slate-950">
          {obra.importe.toLocaleString('es-ES')} €
        </span>
      </div>
    </div>
  );
}
