import { useState, useEffect, useCallback } from 'react';
import { Factura, LineaFactura } from '../types/factura';
import { supabase } from '../lib/supabaseClient';

export interface FacturaTotals {
  baseImponible: number;
  totalIva: number;
  total: number;
  desgloseIva: {
    21: { base: number; cuota: number };
    10: { base: number; cuota: number };
    0: { base: number; cuota: number };
  };
}

export function calculateFacturaTotals(lineas: LineaFactura[]): FacturaTotals {
  const desgloseIva = {
    21: { base: 0, cuota: 0 },
    10: { base: 0, cuota: 0 },
    0: { base: 0, cuota: 0 },
  };

  let baseImponible = 0;

  lineas.forEach(linea => {
    const subtotal = linea.cantidad * linea.precioUnitario;
    baseImponible += subtotal;

    const pct = linea.ivaPorcentaje;
    if (pct === 21 || pct === 10 || pct === 0) {
      desgloseIva[pct].base += subtotal;
      desgloseIva[pct].cuota += subtotal * (pct / 100);
    }
  });

  const totalIva = desgloseIva[21].cuota + desgloseIva[10].cuota + desgloseIva[0].cuota;
  const total = baseImponible + totalIva;

  return {
    baseImponible: Number(baseImponible.toFixed(2)),
    totalIva: Number(totalIva.toFixed(2)),
    total: Number(total.toFixed(2)),
    desgloseIva: {
      21: { base: Number(desgloseIva[21].base.toFixed(2)), cuota: Number(desgloseIva[21].cuota.toFixed(2)) },
      10: { base: Number(desgloseIva[10].base.toFixed(2)), cuota: Number(desgloseIva[10].cuota.toFixed(2)) },
      0: { base: Number(desgloseIva[0].base.toFixed(2)), cuota: Number(desgloseIva[0].cuota.toFixed(2)) },
    }
  };
}

function facturaFromRow(row: any, lineas: LineaFactura[]): Factura {
  return {
    id: row.id,
    numero: row.numero,
    clientId: row.cliente_id,
    obraId: row.obra_id,
    fechaEmision: row.fecha_emision,
    fechaVencimiento: row.fecha_vencimiento,
    estado: row.estado,
    observaciones: row.observaciones || '',
    entregadoGestoria: !!row.entregado_gestoria,
    lineas: lineas
  };
}

function facturaToRow(fac: Partial<Factura>): any {
  const row: any = {};
  if (fac.id !== undefined) row.id = fac.id;
  if (fac.numero !== undefined) row.numero = fac.numero;
  if (fac.clientId !== undefined) row.cliente_id = fac.clientId;
  if (fac.obraId !== undefined) row.obra_id = fac.obraId;
  if (fac.fechaEmision !== undefined) row.fecha_emision = fac.fechaEmision;
  if (fac.fechaVencimiento !== undefined) row.fecha_vencimiento = fac.fechaVencimiento;
  if (fac.estado !== undefined) row.estado = fac.estado;
  if (fac.observaciones !== undefined) row.observaciones = fac.observaciones;
  if (fac.entregadoGestoria !== undefined) row.entregado_gestoria = fac.entregadoGestoria;
  return row;
}

function lineaFromRow(row: any): LineaFactura {
  return {
    id: row.id,
    tipo: row.tipo,
    productoId: row.producto_id,
    concepto: row.concepto,
    cantidad: Number(row.cantidad),
    precioUnitario: Number(row.precio_unitario),
    ivaPorcentaje: Number(row.iva_porcentaje) as 21 | 10 | 0
  };
}

function lineaToRow(lin: LineaFactura, facturaId: string, orden: number): any {
  return {
    id: lin.id,
    factura_id: facturaId,
    tipo: lin.tipo,
    producto_id: lin.productoId,
    concepto: lin.concepto,
    cantidad: lin.cantidad,
    precio_unitario: lin.precioUnitario,
    iva_porcentaje: lin.ivaPorcentaje,
    orden: orden
  };
}

export function useFacturas() {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFacturas = useCallback(async () => {
    try {
      setLoading(true);
      const [facRes, lineasRes] = await Promise.all([
        supabase.from('facturas').select('*').order('created_at', { ascending: false }),
        supabase.from('lineas_factura').select('*').order('orden', { ascending: true })
      ]);

      if (facRes.error) throw facRes.error;
      if (lineasRes.error) throw lineasRes.error;

      const dbFacturas = facRes.data || [];
      const dbLineas = lineasRes.data || [];

      const lineasMap: { [key: string]: LineaFactura[] } = {};
      dbLineas.forEach((row: any) => {
        const fid = row.factura_id;
        if (!lineasMap[fid]) lineasMap[fid] = [];
        lineasMap[fid].push(lineaFromRow(row));
      });

      const mappedFacturas = dbFacturas.map((facRow: any) => {
        return facturaFromRow(facRow, lineasMap[facRow.id] || []);
      });

      setFacturas(mappedFacturas);
    } catch (err: any) {
      console.error('Error fetching facturas:', err);
      setError(err.message || 'Error al cargar las facturas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFacturas();
  }, [fetchFacturas]);

  // Generar código automático FAC-2026-XXXX
  const generateNextNumero = (): string => {
    const year = 2026;
    const prefix = `FAC-${year}-`;
    
    const numbers = facturas
      .filter(f => f.numero.startsWith(prefix))
      .map(f => {
        const parts = f.numero.split('-');
        const numPart = parts[parts.length - 1];
        return parseInt(numPart, 10);
      })
      .filter(num => !isNaN(num));

    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
    const nextNum = maxNum + 1;
    return `${prefix}${String(nextNum).padStart(4, '0')}`;
  };

  const addFactura = async (facturaData: Omit<Factura, 'id' | 'numero'>) => {
    try {
      const newId = `fac_${Date.now()}`;
      const nextNumero = generateNextNumero();
      const newFactura: Factura = {
        ...facturaData,
        id: newId,
        numero: nextNumero
      };

      // 1. Insert parent
      const { error: err } = await supabase
        .from('facturas')
        .insert([facturaToRow(newFactura)]);
      if (err) throw err;

      // 2. Insert lines
      if (newFactura.lineas && newFactura.lineas.length > 0) {
        const rowsToInsert = newFactura.lineas.map((l, index) => lineaToRow(l, newId, index));
        const { error: lineasErr } = await supabase
          .from('lineas_factura')
          .insert(rowsToInsert);
        if (lineasErr) throw lineasErr;
      }

      await fetchFacturas();
      return newFactura;
    } catch (err: any) {
      console.error('Error adding factura:', err);
      setError(err.message || 'Error al añadir la factura');
      throw err;
    }
  };

  const updateFactura = async (id: string, updatedFields: Partial<Factura>) => {
    try {
      const parentFields = { ...updatedFields };
      delete parentFields.lineas;

      if (Object.keys(parentFields).length > 0) {
        const { error: parentErr } = await supabase
          .from('facturas')
          .update(facturaToRow(parentFields))
          .eq('id', id);
        if (parentErr) throw parentErr;
      }

      if (updatedFields.lineas) {
        const { error: delErr } = await supabase
          .from('lineas_factura')
          .delete()
          .eq('factura_id', id);
        if (delErr) throw delErr;

        if (updatedFields.lineas.length > 0) {
          const rowsToInsert = updatedFields.lineas.map((l, index) => {
            const lid = l.id.startsWith('lin_init_') || !l.id ? `lin_${Date.now()}_${index}` : l.id;
            return lineaToRow({ ...l, id: lid }, id, index);
          });
          const { error: insErr } = await supabase
            .from('lineas_factura')
            .insert(rowsToInsert);
          if (insErr) throw insErr;
        }
      }

      await fetchFacturas();
    } catch (err: any) {
      console.error('Error updating factura:', err);
      setError(err.message || 'Error al actualizar la factura');
      throw err;
    }
  };

  const deleteFactura = async (id: string) => {
    try {
      await supabase
        .from('lineas_factura')
        .delete()
        .eq('factura_id', id);

      const { error: err } = await supabase
        .from('facturas')
        .delete()
        .eq('id', id);
      if (err) throw err;

      await fetchFacturas();
    } catch (err: any) {
      console.error('Error deleting factura:', err);
      setError(err.message || 'Error al eliminar la factura');
      throw err;
    }
  };

  const changeFacturaEstado = async (id: string, estado: Factura['estado']) => {
    try {
      const { error: err } = await supabase
        .from('facturas')
        .update({ estado })
        .eq('id', id);
      if (err) throw err;

      await fetchFacturas();
    } catch (err: any) {
      console.error('Error changing factura state:', err);
      setError(err.message || 'Error al cambiar el estado de la factura');
      throw err;
    }
  };

  const toggleEntregadoGestoria = async (id: string) => {
    try {
      const current = facturas.find(f => f.id === id);
      if (!current) return;
      const newValue = !current.entregadoGestoria;
      const { error: err } = await supabase
        .from('facturas')
        .update({ entregado_gestoria: newValue })
        .eq('id', id);
      if (err) throw err;

      await fetchFacturas();
    } catch (err: any) {
      console.error('Error toggling entregado_gestoria:', err);
      setError(err.message || 'Error al cambiar el estado de gestoría');
      throw err;
    }
  };

  return {
    facturas,
    loading,
    error,
    addFactura,
    updateFactura,
    deleteFactura,
    changeFacturaEstado,
    toggleEntregadoGestoria,
    generateNextNumero,
    calculateTotals: calculateFacturaTotals
  };
}
