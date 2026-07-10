import { useState, useEffect, useCallback } from 'react';
import { MaterialEscogido } from '../types/materialEscogido';
import { supabase } from '../lib/supabaseClient';

const LOCAL_STORAGE_KEY = 'verini_materiales_escogidos';

export function useMaterialesEscogidos(obraId?: string) {
  const [materiales, setMateriales] = useState<MaterialEscogido[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false);

  // Load from localStorage fallback
  const loadFallback = useCallback(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      const allData: MaterialEscogido[] = saved ? JSON.parse(saved) : [];
      if (obraId) {
        setMateriales(allData.filter(m => m.obraId === obraId));
      } else {
        setMateriales(allData);
      }
      setIsUsingFallback(true);
    } catch (err) {
      console.error('Error loading localStorage fallback:', err);
    } finally {
      setLoading(false);
    }
  }, [obraId]);

  // Save to localStorage fallback
  const saveFallback = useCallback((updatedList: MaterialEscogido[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
    } catch (err) {
      console.error('Error saving to localStorage fallback:', err);
    }
  }, []);

  const fetchMateriales = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from('materiales_escogidos').select('*');
      if (obraId) {
        query = query.eq('obra_id', obraId);
      }

      const { data, error: dbError } = await query;
      if (dbError) throw dbError;

      if (data) {
        const mapped: MaterialEscogido[] = data.map((row: any) => ({
          id: row.id,
          obraId: row.obra_id,
          productoId: row.producto_id,
          cantidad: Number(row.cantidad),
          precioUnitario: Number(row.precio_unitario),
          pedidoRealizado: !!row.pedido_realizado,
          fechaPedido: row.fecha_pedido || null,
          recibido: !!row.recibido,
          fechaRecibido: row.fecha_recibido || null,
        }));
        setMateriales(mapped);
        setIsUsingFallback(false);
      }
    } catch (err: any) {
      console.warn('Falla conexión con Supabase o tabla materiales_escogidos inexistente. Usando fallback local:', err);
      loadFallback();
    } finally {
      setLoading(false);
    }
  }, [obraId, loadFallback]);

  useEffect(() => {
    fetchMateriales();
  }, [fetchMateriales]);

  const addMaterialEscogido = async (materialData: Omit<MaterialEscogido, 'id'>) => {
    const newId = `mat_esc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newMaterial: MaterialEscogido = {
      id: newId,
      ...materialData
    };

    if (isUsingFallback) {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      const allData: MaterialEscogido[] = saved ? JSON.parse(saved) : [];
      const updated = [...allData, newMaterial];
      saveFallback(updated);
      setMateriales(prev => [...prev, newMaterial]);
      return newMaterial;
    }

    try {
      const { error: dbError } = await supabase
        .from('materiales_escogidos')
        .insert({
          id: newMaterial.id,
          obra_id: newMaterial.obraId,
          producto_id: newMaterial.productoId,
          cantidad: newMaterial.cantidad,
          precio_unitario: newMaterial.precioUnitario,
          pedido_realizado: newMaterial.pedidoRealizado,
          fecha_pedido: newMaterial.fechaPedido,
          recibido: newMaterial.recibido,
          fecha_recibido: newMaterial.fechaRecibido
        });

      if (dbError) throw dbError;
      await fetchMateriales();
      return newMaterial;
    } catch (err) {
      console.warn('Insert falló en BD. Usando fallback local:', err);
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      const allData: MaterialEscogido[] = saved ? JSON.parse(saved) : [];
      const updated = [...allData, newMaterial];
      saveFallback(updated);
      setIsUsingFallback(true);
      setMateriales(prev => [...prev, newMaterial]);
      return newMaterial;
    }
  };

  const updateMaterialEscogido = async (id: string, materialData: Partial<MaterialEscogido>) => {
    if (isUsingFallback) {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      const allData: MaterialEscogido[] = saved ? JSON.parse(saved) : [];
      const updated = allData.map(m => m.id === id ? { ...m, ...materialData } : m);
      saveFallback(updated);
      setMateriales(prev => prev.map(m => m.id === id ? { ...m, ...materialData } : m));
      return;
    }

    try {
      const updatePayload: any = {};
      if (materialData.obraId !== undefined) updatePayload.obra_id = materialData.obraId;
      if (materialData.productoId !== undefined) updatePayload.producto_id = materialData.productoId;
      if (materialData.cantidad !== undefined) updatePayload.cantidad = materialData.cantidad;
      if (materialData.precioUnitario !== undefined) updatePayload.precio_unitario = materialData.precioUnitario;
      if (materialData.pedidoRealizado !== undefined) updatePayload.pedido_realizado = materialData.pedidoRealizado;
      if (materialData.fechaPedido !== undefined) updatePayload.fecha_pedido = materialData.fechaPedido;
      if (materialData.recibido !== undefined) updatePayload.recibido = materialData.recibido;
      if (materialData.fechaRecibido !== undefined) updatePayload.fecha_recibido = materialData.fechaRecibido;

      const { error: dbError } = await supabase
        .from('materiales_escogidos')
        .update(updatePayload)
        .eq('id', id);

      if (dbError) throw dbError;
      await fetchMateriales();
    } catch (err) {
      console.warn('Update falló en BD. Usando fallback local:', err);
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      const allData: MaterialEscogido[] = saved ? JSON.parse(saved) : [];
      const updated = allData.map(m => m.id === id ? { ...m, ...materialData } : m);
      saveFallback(updated);
      setIsUsingFallback(true);
      setMateriales(prev => prev.map(m => m.id === id ? { ...m, ...materialData } : m));
    }
  };

  const deleteMaterialEscogido = async (id: string) => {
    if (isUsingFallback) {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      const allData: MaterialEscogido[] = saved ? JSON.parse(saved) : [];
      const updated = allData.filter(m => m.id !== id);
      saveFallback(updated);
      setMateriales(prev => prev.filter(m => m.id !== id));
      return;
    }

    try {
      const { error: dbError } = await supabase
        .from('materiales_escogidos')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;
      await fetchMateriales();
    } catch (err) {
      console.warn('Delete falló en BD. Usando fallback local:', err);
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      const allData: MaterialEscogido[] = saved ? JSON.parse(saved) : [];
      const updated = allData.filter(m => m.id !== id);
      saveFallback(updated);
      setIsUsingFallback(true);
      setMateriales(prev => prev.filter(m => m.id !== id));
    }
  };

  return {
    materiales,
    loading,
    error,
    isUsingFallback,
    addMaterialEscogido,
    updateMaterialEscogido,
    deleteMaterialEscogido,
    refresh: fetchMateriales
  };
}
