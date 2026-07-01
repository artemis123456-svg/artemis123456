import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Evento, EventoVirtual } from '../types/evento';
import { useObras } from './useObras';
import { useFacturas } from './useFacturas';

function fromRow(row: any): Evento {
  return {
    id: row.id,
    titulo: row.titulo,
    tipo: row.tipo,
    fechaInicio: row.fecha_inicio,
    fechaFin: row.fecha_fin,
    todoElDia: !!row.todo_el_dia,
    clienteId: row.cliente_id,
    obraId: row.obra_id,
    notas: row.notas || '',
    completado: !!row.completado,
    created_at: row.created_at
  };
}

function toRow(ev: Partial<Evento>): any {
  const row: any = {};
  if (ev.id !== undefined) row.id = ev.id;
  if (ev.titulo !== undefined) row.titulo = ev.titulo;
  if (ev.tipo !== undefined) row.tipo = ev.tipo;
  if (ev.fechaInicio !== undefined) row.fecha_inicio = ev.fechaInicio;
  if (ev.fechaFin !== undefined) row.fecha_fin = ev.fechaFin;
  if (ev.todoElDia !== undefined) row.todo_el_dia = ev.todoElDia;
  if (ev.clienteId !== undefined) row.cliente_id = ev.clienteId;
  if (ev.obraId !== undefined) row.obra_id = ev.obraId;
  if (ev.notas !== undefined) row.notas = ev.notas;
  if (ev.completado !== undefined) row.completado = ev.completado;
  return row;
}

export function useEventos() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { obras } = useObras();
  const { facturas } = useFacturas();

  const fetchEventos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('eventos')
        .select('*')
        .order('fecha_inicio', { ascending: true });

      if (err) throw err;

      if (data) {
        setEventos(data.map(fromRow));
      }
    } catch (err: any) {
      console.error('Error fetching eventos:', err);
      setError(err.message || 'Error al cargar los eventos');
    } finally {
      setLoading(false);
    }
  }, []);

  const addEvento = async (fields: Omit<Evento, 'id'>) => {
    try {
      setError(null);
      const newId = `ev_${Date.now()}`;
      const newEvento: Evento = {
        ...fields,
        id: newId
      };

      const { error: err } = await supabase
        .from('eventos')
        .insert([toRow(newEvento)]);

      if (err) throw err;

      setEventos(prev => [...prev, newEvento].sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime()));
      return newEvento;
    } catch (err: any) {
      console.error('Error adding evento:', err);
      setError(err.message || 'Error al guardar el evento');
      throw err;
    }
  };

  const updateEvento = async (id: string, fields: Partial<Evento>) => {
    try {
      setError(null);
      const { error: err } = await supabase
        .from('eventos')
        .update(toRow(fields))
        .eq('id', id);

      if (err) throw err;

      setEventos(prev => 
        prev.map(e => e.id === id ? { ...e, ...fields } : e)
            .sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime())
      );
    } catch (err: any) {
      console.error('Error updating evento:', err);
      setError(err.message || 'Error al actualizar el evento');
      throw err;
    }
  };

  const deleteEvento = async (id: string) => {
    try {
      setError(null);
      const { error: err } = await supabase
        .from('eventos')
        .delete()
        .eq('id', id);

      if (err) throw err;

      setEventos(prev => prev.filter(e => e.id !== id));
    } catch (err: any) {
      console.error('Error deleting evento:', err);
      setError(err.message || 'Error al eliminar el evento');
      throw err;
    }
  };

  const toggleCompletado = async (id: string, completado: boolean) => {
    return updateEvento(id, { completado });
  };

  // Virtual automatic events (NOT saved in database)
  const getEventosAutomaticos = useCallback((): EventoVirtual[] => {
    const virtualEvents: EventoVirtual[] = [];

    // 1. Obras with planned start dates
    obras.forEach(obra => {
      if (obra.fechaInicioPrevista) {
        virtualEvents.push({
          id: `virtual_obra_${obra.id}`,
          titulo: `Inicio: ${obra.titulo}`,
          tipo: 'Inicio obra',
          fechaInicio: `${obra.fechaInicioPrevista}T09:00:00`,
          fechaFin: `${obra.fechaInicioPrevista}T18:00:00`,
          todoElDia: true,
          clienteId: obra.clientId || null,
          obraId: obra.id,
          notas: `Inicio de obra planificado.\nDirección: ${obra.direccion || 'No especificada'}`,
          completado: obra.estado === 'En obra' || obra.estado === 'Entregada',
          esAutomatico: true
        });
      }
    });

    // 2. Client invoices with vencimiento and status !== 'Cobrada'
    facturas.forEach(factura => {
      if (factura.fechaVencimiento && factura.estado !== 'Cobrada') {
        virtualEvents.push({
          id: `virtual_factura_${factura.id}`,
          titulo: `Vence factura ${factura.numero}`,
          tipo: 'Otro',
          fechaInicio: `${factura.fechaVencimiento}T09:00:00`,
          fechaFin: `${factura.fechaVencimiento}T10:00:00`,
          todoElDia: true,
          clienteId: factura.clientId || null,
          obraId: factura.obraId || null,
          notas: `Vencimiento de la factura emitida Nº ${factura.numero || factura.id}.`,
          completado: false,
          esAutomatico: true
        });
      }
    });

    return virtualEvents;
  }, [obras, facturas]);

  // Combined and filtered proximate events (today + N days)
  const getEventosProximos = useCallback((dias: number = 7): EventoVirtual[] => {
    const manuales = eventos;
    const automaticos = getEventosAutomaticos();
    const todos: EventoVirtual[] = [...manuales, ...automaticos];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endLimit = new Date(startOfToday.getTime() + (dias * 24 * 60 * 60 * 1000) + (24 * 60 * 60 * 1000 - 1));

    return todos
      .filter(ev => {
        const evDate = new Date(ev.fechaInicio);
        return evDate.getTime() >= startOfToday.getTime() && evDate.getTime() <= endLimit.getTime();
      })
      .sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime());
  }, [eventos, getEventosAutomaticos]);

  useEffect(() => {
    fetchEventos();
  }, [fetchEventos]);

  return {
    eventos,
    loading,
    error,
    addEvento,
    updateEvento,
    deleteEvento,
    toggleCompletado,
    getEventosAutomaticos,
    getEventosProximos,
    refetch: fetchEventos
  };
}
