import { useState, useEffect, useCallback } from 'react';
import { PresupuestoNew, LineaPresupuesto, calculatePresupuestoTotals } from '../types/presupuesto';
import { supabase } from '../lib/supabaseClient';

const LOCAL_STORAGE_KEY = 'verini_presupuestos_fallback';

export function usePresupuestos() {
  const [presupuestos, setPresupuestos] = useState<PresupuestoNew[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false);

  const fetchPresupuestos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try fetching from Supabase
      const [presRes, lineasRes] = await Promise.all([
        supabase.from('presupuestos').select('*').order('created_at', { ascending: false }),
        supabase.from('lineas_presupuesto').select('*').order('created_at', { ascending: true })
      ]);

      if (presRes.error || lineasRes.error) {
        // If there's an error (e.g. table doesn't exist), trigger the fallback to localStorage
        console.warn('Supabase budgets table not found or error. Using localStorage fallback.', presRes.error || lineasRes.error);
        setIsUsingFallback(true);
        loadFromLocalStorage();
        return;
      }

      const dbPres = presRes.data || [];
      const dbLineas = lineasRes.data || [];

      const lineasMap: { [key: string]: LineaPresupuesto[] } = {};
      dbLineas.forEach((row: any) => {
        const pid = row.presupuesto_id;
        if (!lineasMap[pid]) lineasMap[pid] = [];
        lineasMap[pid].push({
          id: row.id,
          descripcion: row.descripcion,
          cantidad: Number(row.cantidad),
          precioUnitario: Number(row.precio_unitario),
          ivaPorcentaje: row.iva_porcentaje !== undefined ? Number(row.iva_porcentaje) as 21 | 10 | 0 : 21,
          tipo: row.tipo || 'libre',
          productoId: row.producto_id || undefined,
          referenciaProducto: row.referencia_producto || undefined,
          fotoUrl: row.foto_url || undefined,
          unidad: row.unidad || 'Ud'
        });
      });

      const mapped = dbPres.map((pRow: any) => ({
        id: pRow.id,
        clientId: pRow.cliente_id,
        obraId: pRow.obra_id || null,
        numero: pRow.numero,
        fechaCreacion: pRow.fecha_creacion ? pRow.fecha_creacion.split('T')[0] : new Date().toISOString().split('T')[0],
        fechaValidez: pRow.fecha_validez || null,
        descripcion: pRow.descripcion || '',
        importeTotal: Number(pRow.importe_total || 0),
        estado: pRow.estado as 'Borrador' | 'Enviado' | 'Aprobado' | 'Aceptado' | 'Rechazado',
        lineas: lineasMap[pRow.id] || []
      }));

      setPresupuestos(mapped);
      setIsUsingFallback(false);
    } catch (err: any) {
      console.error('Error loading budgets, falling back to localStorage:', err);
      setIsUsingFallback(true);
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        setPresupuestos(JSON.parse(saved));
      } else {
        // Initial Mock Budgets
        const initial: PresupuestoNew[] = [
          {
            id: 'pre_init_1',
            clientId: 'cli_1',
            obraId: 'obr_1',
            numero: 'PRE-2026-0001',
            fechaCreacion: '2026-05-10',
            fechaValidez: '2026-06-10',
            descripcion: 'Presupuesto inicial reforma oficinas',
            importeTotal: 35000,
            estado: 'Aprobado',
            lineas: [
              { id: 'l1', descripcion: 'Demolición y tabiquería', cantidad: 1, precioUnitario: 15000 },
              { id: 'l2', descripcion: 'Falsos techos e iluminación', cantidad: 1, precioUnitario: 20000 }
            ]
          },
          {
            id: 'pre_init_2',
            clientId: 'cli_2',
            obraId: null,
            numero: 'PRE-2026-0002',
            fechaCreacion: '2026-06-01',
            fechaValidez: '2026-07-01',
            descripcion: 'Reforma cocina calle Alcalá',
            importeTotal: 18500,
            estado: 'Borrador',
            lineas: [
              { id: 'l3', descripcion: 'Mobiliario de cocina Verini', cantidad: 1, precioUnitario: 12000 },
              { id: 'l4', descripcion: 'Electrodomésticos e instalación', cantidad: 1, precioUnitario: 6500 }
            ]
          }
        ];
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
        setPresupuestos(initial);
      }
    } catch (e) {
      console.error('Error loading fallback:', e);
    }
  };

  useEffect(() => {
    fetchPresupuestos();
  }, [fetchPresupuestos]);

  const generateNextNumero = (): string => {
    const year = 2026;
    const prefix = `PRE-${year}-`;
    
    const numbers = presupuestos
      .filter(p => p.numero.startsWith(prefix))
      .map(p => {
        const parts = p.numero.split('-');
        const numPart = parts[parts.length - 1];
        return parseInt(numPart, 10);
      })
      .filter(num => !isNaN(num));

    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
    const nextNum = maxNum + 1;
    return `${prefix}${String(nextNum).padStart(4, '0')}`;
  };

  const addPresupuesto = async (budgetData: Omit<PresupuestoNew, 'id' | 'importeTotal'>) => {
    const newId = `pre_${Date.now()}`;
    const totals = calculatePresupuestoTotals(budgetData.lineas);
    
    const newPres: PresupuestoNew = {
      ...budgetData,
      id: newId,
      importeTotal: totals.total
    };

    if (isUsingFallback) {
      const isDuplicate = presupuestos.some(p => p.numero.trim().toLowerCase() === budgetData.numero.trim().toLowerCase());
      if (isDuplicate) {
        throw new Error(`Ya existe un presupuesto con número: ${budgetData.numero}`);
      }
      const updated = [newPres, ...presupuestos];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      setPresupuestos(updated);
      return newPres;
    }

    try {
      // Verificar duplicados en Supabase
      const { data: existing } = await supabase
        .from('presupuestos')
        .select('id')
        .eq('numero', budgetData.numero);
      
      if (existing && existing.length > 0) {
        throw new Error(`Ya existe un presupuesto con número: ${budgetData.numero}`);
      }

      // 1. Insert parent
      const { error: err } = await supabase
        .from('presupuestos')
        .insert([{
          id: newId,
          cliente_id: newPres.clientId,
          obra_id: newPres.obraId,
          numero: newPres.numero,
          fecha_creacion: new Date(newPres.fechaCreacion).toISOString(),
          fecha_validez: newPres.fechaValidez,
          descripcion: newPres.descripcion,
          importe_total: totals.total,
          estado: newPres.estado
        }]);

      if (err) throw err;

      // 2. Insert lines
      if (newPres.lineas && newPres.lineas.length > 0) {
        const linesToInsert = newPres.lineas.map(l => ({
          id: l.id.startsWith('lin_temp_') || !l.id ? `lin_${Math.random().toString(36).substr(2, 9)}` : l.id,
          presupuesto_id: newId,
          descripcion: l.descripcion,
          cantidad: l.cantidad,
          precio_unitario: l.precioUnitario,
          iva_porcentaje: l.ivaPorcentaje ?? 21,
          tipo: l.tipo || 'libre',
          producto_id: l.productoId || null,
          referencia_producto: l.referenciaProducto || null,
          foto_url: l.fotoUrl || null,
          unidad: l.unidad || 'Ud'
        }));

        const { error: linesErr } = await supabase
          .from('lineas_presupuesto')
          .insert(linesToInsert);

        if (linesErr) throw linesErr;
      }

      await fetchPresupuestos();
      return newPres;
    } catch (err: any) {
      console.error('Error inserting budget to Supabase, writing to localStorage:', err);
      // Fallback
      const updated = [newPres, ...presupuestos];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      setPresupuestos(updated);
      setIsUsingFallback(true);
      return newPres;
    }
  };

  const updatePresupuesto = async (id: string, updatedFields: Partial<PresupuestoNew>) => {
    const orig = presupuestos.find(p => p.id === id);
    if (!orig) return;

    let mergedLines = updatedFields.lineas !== undefined ? updatedFields.lineas : orig.lineas;
    const totals = calculatePresupuestoTotals(mergedLines);

    const merged: PresupuestoNew = {
      ...orig,
      ...updatedFields,
      importeTotal: totals.total
    };

    if (isUsingFallback) {
      const updated = presupuestos.map(p => p.id === id ? merged : p);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      setPresupuestos(updated);
      return;
    }

    try {
      // Update parent
      const { error: parentErr } = await supabase
        .from('presupuestos')
        .update({
          cliente_id: merged.clientId,
          obra_id: merged.obraId,
          fecha_validez: merged.fechaValidez,
          descripcion: merged.descripcion,
          importe_total: totals.total,
          estado: merged.estado
        })
        .eq('id', id);

      if (parentErr) throw parentErr;

      // If lines updated, delete and re-insert
      if (updatedFields.lineas !== undefined) {
        const { error: delErr } = await supabase
          .from('lineas_presupuesto')
          .delete()
          .eq('presupuesto_id', id);

        if (delErr) throw delErr;

        if (mergedLines.length > 0) {
          const linesToInsert = mergedLines.map(l => ({
            id: l.id.startsWith('lin_') ? l.id : `lin_${Math.random().toString(36).substr(2, 9)}`,
            presupuesto_id: id,
            descripcion: l.descripcion,
            cantidad: l.cantidad,
            precio_unitario: l.precioUnitario,
            iva_porcentaje: l.ivaPorcentaje ?? 21,
            tipo: l.tipo || 'libre',
            producto_id: l.productoId || null,
            referencia_producto: l.referenciaProducto || null,
            foto_url: l.fotoUrl || null,
            unidad: l.unidad || 'Ud'
          }));

          const { error: insErr } = await supabase
            .from('lineas_presupuesto')
            .insert(linesToInsert);

          if (insErr) throw insErr;
        }
      }

      await fetchPresupuestos();
    } catch (err: any) {
      console.error('Error updating budget, falling back to localStorage:', err);
      const updated = presupuestos.map(p => p.id === id ? merged : p);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      setPresupuestos(updated);
      setIsUsingFallback(true);
    }
  };

  const deletePresupuesto = async (id: string) => {
    if (isUsingFallback) {
      const updated = presupuestos.filter(p => p.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      setPresupuestos(updated);
      return;
    }

    try {
      // Delete lines
      await supabase
        .from('lineas_presupuesto')
        .delete()
        .eq('presupuesto_id', id);

      // Delete parent
      const { error: err } = await supabase
        .from('presupuestos')
        .delete()
        .eq('id', id);

      if (err) throw err;

      await fetchPresupuestos();
    } catch (err: any) {
      console.error('Error deleting budget, falling back to localStorage:', err);
      const updated = presupuestos.filter(p => p.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      setPresupuestos(updated);
      setIsUsingFallback(true);
    }
  };

  return {
    presupuestos,
    loading,
    error,
    isUsingFallback,
    generateNextNumero,
    addPresupuesto,
    updatePresupuesto,
    deletePresupuesto,
    refetch: fetchPresupuestos
  };
}
