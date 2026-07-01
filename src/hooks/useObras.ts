import { useState, useEffect, useCallback } from 'react';
import { Obra, HoraObra } from '../types/obra';
import { supabase } from '../lib/supabaseClient';

function fromRow(row: any): Obra {
  return {
    id: row.id,
    codigo: row.codigo,
    titulo: row.titulo,
    clientId: row.cliente_id,
    tipoReforma: row.tipo_reforma,
    metrosCuadrados: Number(row.metros_cuadrados),
    direccion: row.direccion,
    fechaInicioPrevista: row.fecha_inicio_prevista,
    fechaInicioReal: row.fecha_inicio_real,
    fechaFinPrevista: row.fecha_fin_prevista,
    fechaFinReal: row.fecha_fin_real,
    estado: row.estado,
    importe: Number(row.importe),
  };
}

function toRow(obra: Partial<Obra>): any {
  const row: any = {};
  if (obra.id !== undefined) row.id = obra.id;
  if (obra.codigo !== undefined) row.codigo = obra.codigo;
  if (obra.titulo !== undefined) row.titulo = obra.titulo;
  if (obra.clientId !== undefined) row.cliente_id = obra.clientId;
  if (obra.tipoReforma !== undefined) row.tipo_reforma = obra.tipoReforma;
  if (obra.metrosCuadrados !== undefined) row.metros_cuadrados = obra.metrosCuadrados;
  if (obra.direccion !== undefined) row.direccion = obra.direccion;
  if (obra.fechaInicioPrevista !== undefined) row.fecha_inicio_prevista = obra.fechaInicioPrevista;
  if (obra.fechaInicioReal !== undefined) row.fecha_inicio_real = obra.fechaInicioReal;
  if (obra.fechaFinPrevista !== undefined) row.fecha_fin_prevista = obra.fechaFinPrevista;
  if (obra.fechaFinReal !== undefined) row.fecha_fin_real = obra.fechaFinReal;
  if (obra.estado !== undefined) row.estado = obra.estado;
  if (obra.importe !== undefined) row.importe = obra.importe;
  return row;
}

export function useObras() {
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchObras = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('obras')
        .select('*')
        .order('created_at', { ascending: false });
      if (err) throw err;
      if (data) {
        setObras(data.map(fromRow));
      }
    } catch (err: any) {
      console.error('Error fetching obras:', err);
      setError(err.message || 'Error al cargar las obras');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchObras();
  }, [fetchObras]);

  // Generate next OBR-XXXXXX code
  const generateObraCode = (): string => {
    const numbers = obras.map(o => {
      const match = o.codigo.match(/OBR-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
    const nextNumber = maxNumber + 1;
    return `OBR-${nextNumber.toString().padStart(6, '0')}`;
  };

  // Create an Obra
  const addObra = async (obraFields: Omit<Obra, 'id' | 'codigo'>) => {
    try {
      const code = generateObraCode();
      const newId = `obr_${Date.now()}`;
      const newObra: Obra = {
        ...obraFields,
        id: newId,
        codigo: code
      };

      const { error: err } = await supabase
        .from('obras')
        .insert([toRow(newObra)]);
      if (err) throw err;

      await fetchObras();
      return newObra;
    } catch (err: any) {
      console.error('Error adding obra:', err);
      setError(err.message || 'Error al añadir la obra');
      throw err;
    }
  };

  // Edit an Obra
  const updateObra = async (id: string, updatedFields: Partial<Obra>) => {
    try {
      const { error: err } = await supabase
        .from('obras')
        .update(toRow(updatedFields))
        .eq('id', id);
      if (err) throw err;

      await fetchObras();
    } catch (err: any) {
      console.error('Error updating obra:', err);
      setError(err.message || 'Error al actualizar la obra');
      throw err;
    }
  };

  // Change Obra Kanban Phase
  const updateObraStatus = async (id: string, estado: Obra['estado']) => {
    try {
      const current = obras.find(o => o.id === id);
      let actualDates: Partial<Obra> = {};
      if (estado === 'En obra' && current && !current.fechaInicioReal) {
        actualDates.fechaInicioReal = new Date().toISOString().split('T')[0];
      }
      if (estado === 'Entregada' && current && !current.fechaFinReal) {
        actualDates.fechaFinReal = new Date().toISOString().split('T')[0];
      }

      const { error: err } = await supabase
        .from('obras')
        .update(toRow({ estado, ...actualDates }))
        .eq('id', id);
      if (err) throw err;

      await fetchObras();
    } catch (err: any) {
      console.error('Error updating obra status:', err);
      setError(err.message || 'Error al cambiar estado de obra');
      throw err;
    }
  };

  // Delete an Obra
  const deleteObra = async (id: string) => {
    try {
      const { error: err } = await supabase
        .from('obras')
        .delete()
        .eq('id', id);
      if (err) throw err;

      await fetchObras();
    } catch (err: any) {
      console.error('Error deleting obra:', err);
      setError(err.message || 'Error al eliminar obra');
      throw err;
    }
  };

  // Fetch horas for a specific obraId
  const fetchHorasObra = useCallback(async (obraId: string): Promise<HoraObra[]> => {
    try {
      const { data, error: err } = await supabase
        .from('horas_obra')
        .select('*')
        .eq('obra_id', obraId)
        .order('fecha', { ascending: false });
      if (err) throw err;
      return (data || []).map(row => ({
        id: row.id,
        obraId: row.obra_id,
        fecha: row.fecha,
        trabajador: row.trabajador,
        horas: Number(row.horas),
        tarea: row.tarea
      }));
    } catch (err: any) {
      console.error('Error fetching horas_obra:', err);
      setError(err.message || 'Error al cargar las horas de la obra');
      throw err;
    }
  }, []);

  // Add a new log for horas_obra
  const addHoraObra = useCallback(async (horaData: Omit<HoraObra, 'id'>): Promise<HoraObra> => {
    try {
      const newId = `ho_${Date.now()}`;
      const row = {
        id: newId,
        obra_id: horaData.obraId,
        fecha: horaData.fecha,
        trabajador: horaData.trabajador,
        horas: Number(horaData.horas),
        tarea: horaData.tarea
      };
      const { error: err } = await supabase
        .from('horas_obra')
        .insert([row]);
      if (err) throw err;

      return {
        id: newId,
        ...horaData
      };
    } catch (err: any) {
      console.error('Error adding horas_obra:', err);
      setError(err.message || 'Error al guardar el registro de horas');
      throw err;
    }
  }, []);

  // Delete a log from horas_obra
  const deleteHoraObra = useCallback(async (id: string): Promise<void> => {
    try {
      const { error: err } = await supabase
        .from('horas_obra')
        .delete()
        .eq('id', id);
      if (err) throw err;
    } catch (err: any) {
      console.error('Error deleting horas_obra:', err);
      setError(err.message || 'Error al eliminar el registro de horas');
      throw err;
    }
  }, []);

  return {
    obras,
    loading,
    error,
    addObra,
    updateObra,
    updateObraStatus,
    deleteObra,
    generateObraCode,
    fetchHorasObra,
    addHoraObra,
    deleteHoraObra
  };
}
