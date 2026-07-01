import React, { useState, useEffect } from 'react';
import { Evento } from '../../types/evento';
import { useClients } from '../../hooks/useClients';
import { useObras } from '../../hooks/useObras';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { 
  X, 
  Trash2, 
  Save, 
  Calendar, 
  Clock, 
  User, 
  Briefcase, 
  FileText, 
  CheckSquare, 
  Square 
} from 'lucide-react';

interface EventoFormProps {
  evento?: Evento | null; // If null/undefined, we are creating a new one
  initialDate?: Date | null;
  onClose: () => void;
  onSave: (eventoData: Omit<Evento, 'id'> & { id?: string }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export default function EventoForm({ 
  evento, 
  initialDate, 
  onClose, 
  onSave, 
  onDelete 
}: EventoFormProps) {
  const { clients } = useClients();
  const { obras } = useObras();

  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState<Evento['tipo']>('Visita');
  const [todoElDia, setTodoElDia] = useState(false);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [clienteId, setClienteId] = useState<string>('');
  const [obraId, setObraId] = useState<string>('');
  const [notas, setNotas] = useState('');
  const [completado, setCompletado] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Helper: convert date to input string (YYYY-MM-DD or YYYY-MM-DDTHH:MM)
  const formatForInput = (date: Date, allDay: boolean): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    if (allDay) {
      return `${y}-${m}-${d}`;
    } else {
      const h = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      return `${y}-${m}-${d}T${h}:${min}`;
    }
  };

  useEffect(() => {
    if (evento) {
      setTitulo(evento.titulo);
      setTipo(evento.tipo);
      setTodoElDia(evento.todoElDia);
      setClienteId(evento.clienteId || '');
      setObraId(evento.obraId || '');
      setNotas(evento.notas);
      setCompletado(evento.completado);

      const start = new Date(evento.fechaInicio);
      if (!isNaN(start.getTime())) {
        setFechaInicio(formatForInput(start, evento.todoElDia));
      }

      if (evento.fechaFin) {
        const end = new Date(evento.fechaFin);
        if (!isNaN(end.getTime())) {
          setFechaFin(formatForInput(end, evento.todoElDia));
        }
      } else {
        setFechaFin('');
      }
    } else {
      // Form default for new event
      setTitulo('');
      setTipo('Visita');
      setTodoElDia(false);
      setClienteId('');
      setObraId('');
      setNotas('');
      setCompletado(false);

      // Start date fallback
      const baseDate = initialDate ? new Date(initialDate) : new Date();
      if (initialDate) {
        // preserve the exact calendar date but set a reasonable time if not all day
        baseDate.setHours(9, 0, 0, 0);
      } else {
        // near future hour
        baseDate.setHours(baseDate.getHours() + 1, 0, 0, 0);
      }
      
      setFechaInicio(formatForInput(baseDate, false));
      
      const endDefault = new Date(baseDate);
      endDefault.setHours(endDefault.getHours() + 1);
      setFechaFin(formatForInput(endDefault, false));
    }
  }, [evento, initialDate]);

  // When "todoElDia" is toggled, transform dates into appropriate formats
  const handleTodoElDiaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setTodoElDia(isChecked);

    if (fechaInicio) {
      const d = new Date(fechaInicio);
      if (!isNaN(d.getTime())) {
        setFechaInicio(formatForInput(d, isChecked));
      }
    }
    if (fechaFin) {
      const d = new Date(fechaFin);
      if (!isNaN(d.getTime())) {
        setFechaFin(formatForInput(d, isChecked));
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setErrorMessage('El título del evento es obligatorio.');
      return;
    }
    if (!fechaInicio) {
      setErrorMessage('La fecha de inicio es obligatoria.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // parse date strings back to ISO strings safely
      let parsedInicio = '';
      if (todoElDia) {
        const [y, m, d] = fechaInicio.split('-');
        const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d), 0, 0, 0);
        parsedInicio = dateObj.toISOString();
      } else {
        const dateObj = new Date(fechaInicio);
        parsedInicio = dateObj.toISOString();
      }

      let parsedFin: string | null = null;
      if (fechaFin) {
        if (todoElDia) {
          const [y, m, d] = fechaFin.split('-');
          const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d), 23, 59, 59);
          parsedFin = dateObj.toISOString();
        } else {
          const dateObj = new Date(fechaFin);
          parsedFin = dateObj.toISOString();
        }
      }

      const payload: Omit<Evento, 'id'> & { id?: string } = {
        titulo: titulo.trim(),
        tipo,
        fechaInicio: parsedInicio,
        fechaFin: parsedFin,
        todoElDia,
        clienteId: clienteId || null,
        obraId: obraId || null,
        notas: notas.trim(),
        completado
      };

      if (evento?.id) {
        payload.id = evento.id;
      }

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Ocurrió un error al guardar el evento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!evento?.id || !onDelete) return;
    if (!window.confirm('¿Seguro que deseas eliminar este evento de tu agenda?')) return;
    
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await onDelete(evento.id);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al eliminar el evento.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-slate-700" />
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              {evento ? 'Editar Evento' : 'Nuevo Evento de Agenda'}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* FORM CONTENT */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* TITLE */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Título del Evento
            </label>
            <input
              type="text"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Ej. Visita replanteo, Reunión con arquitecto..."
              className="w-full bg-slate-50/50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-verini-black focus:bg-white"
              required
            />
          </div>

          {/* TYPE & TODO_EL_DIA ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Tipo de Actividad
              </label>
              <select
                value={tipo}
                onChange={e => setTipo(e.target.value as Evento['tipo'])}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg py-2 px-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-verini-black focus:bg-white cursor-pointer"
              >
                <option value="Visita">👁️ Visita</option>
                <option value="Reunión">🤝 Reunión</option>
                <option value="Llamada">📞 Llamada</option>
                <option value="Inicio obra">🏗️ Inicio de obra</option>
                <option value="Otro">✏️ Otro / Tarea</option>
              </select>
            </div>

            <div className="flex items-center h-full sm:pt-5">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={todoElDia}
                  onChange={handleTodoElDiaChange}
                  className="rounded border-slate-300 text-verini-black focus:ring-verini-black h-4 w-4"
                />
                <span className="text-xs font-bold text-slate-700">¿Todo el día? (Sin hora específica)</span>
              </label>
            </div>
          </div>

          {/* DATE RANGE CONTROLS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Fecha Inicio
              </label>
              <input
                type={todoElDia ? "date" : "datetime-local"}
                value={fechaInicio}
                onChange={e => setFechaInicio(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-verini-black focus:bg-white"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Fecha Fin <span className="text-slate-400 font-medium lowercase">(opcional)</span>
              </label>
              <input
                type={todoElDia ? "date" : "datetime-local"}
                value={fechaFin}
                onChange={e => setFechaFin(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-verini-black focus:bg-white"
              />
            </div>
          </div>

          {/* ASOCIAR CLIENTE (Opcional) */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
              <User className="h-3 w-3" />
              Asociar Cliente <span className="text-slate-400 font-medium lowercase">(opcional)</span>
            </label>
            <select
              value={clienteId}
              onChange={e => setClienteId(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200 rounded-lg py-2 px-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-verini-black focus:bg-white cursor-pointer"
            >
              <option value="">-- Ninguno --</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nombre} {c.apellidos} {c.empresa ? `(${c.empresa})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* ASOCIAR OBRA / PROYECTO (Opcional) */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              Asociar Obra / Proyecto <span className="text-slate-400 font-medium lowercase">(opcional)</span>
            </label>
            <select
              value={obraId}
              onChange={e => setObraId(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200 rounded-lg py-2 px-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-verini-black focus:bg-white cursor-pointer"
            >
              <option value="">-- Ninguna --</option>
              {obras.map(o => (
                <option key={o.id} value={o.id}>
                  [{o.codigo}] {o.titulo}
                </option>
              ))}
            </select>
          </div>

          {/* NOTES / NOTAS */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Notas y Detalles del Evento
            </label>
            <textarea
              value={notas}
              onChange={e => setNotas(e.target.value)}
              rows={3}
              placeholder="Dirección, personas implicadas, puntos a tratar..."
              className="w-full bg-slate-50/50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-verini-black focus:bg-white resize-none"
            />
          </div>

          {/* STATUS COMPLETADO (Checkbox) */}
          {evento && (
            <div className="flex items-center pt-2">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={completado}
                  onChange={e => setCompletado(e.target.checked)}
                  className="rounded border-slate-300 text-verini-black focus:ring-verini-black h-4 w-4"
                />
                <span className="text-xs font-bold text-slate-800">Marcar como Completado / Realizado</span>
              </label>
            </div>
          )}

          {/* LOCAL ERROR MESSAGE */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

        </form>

        {/* MODAL FOOTER */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            {evento && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 font-bold text-xs h-9 px-4 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                <span>Eliminar</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-slate-500 hover:text-slate-800 font-bold text-xs h-9 px-4 rounded-lg cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              className="bg-verini-black hover:bg-black/95 text-white font-bold text-xs h-9 px-4 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? 'Guardando...' : 'Guardar'}</span>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
