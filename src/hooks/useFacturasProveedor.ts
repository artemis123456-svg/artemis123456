import { useState, useEffect, useCallback } from 'react';
import { FacturaProveedor, LineaFacturaProveedor } from '../types/facturaProveedor';
import { supabase } from '../lib/supabaseClient';

export interface FacturaProveedorTotals {
  baseImponible: number;
  totalIva: number;
  importeRetencion: number;
  total: number;
  desgloseIva: {
    21: { base: number; cuota: number };
    10: { base: number; cuota: number };
    0: { base: number; cuota: number };
  };
}

export function calculateFacturaProveedorTotals(lineas: LineaFacturaProveedor[], retencionIrpf: number = 0): FacturaProveedorTotals {
  const desgloseIva = {
    21: { base: 0, cuota: 0 },
    10: { base: 0, cuota: 0 },
    0: { base: 0, cuota: 0 },
  };

  let baseImponible = 0;

  lineas.forEach(linea => {
    const subtotal = (linea.cantidad || 0) * (linea.precioUnitario || 0);
    baseImponible += subtotal;

    const pct = linea.ivaPorcentaje;
    if (pct === 21 || pct === 10 || pct === 0) {
      desgloseIva[pct].base += subtotal;
      desgloseIva[pct].cuota += subtotal * (pct / 100);
    }
  });

  const totalIva = desgloseIva[21].cuota + desgloseIva[10].cuota + desgloseIva[0].cuota;
  const importeRetencion = baseImponible * (retencionIrpf / 100);
  const total = baseImponible + totalIva - importeRetencion;

  return {
    baseImponible: Number(baseImponible.toFixed(2)),
    totalIva: Number(totalIva.toFixed(2)),
    importeRetencion: Number(importeRetencion.toFixed(2)),
    total: Number(total.toFixed(2)),
    desgloseIva: {
      21: { base: Number(desgloseIva[21].base.toFixed(2)), cuota: Number(desgloseIva[21].cuota.toFixed(2)) },
      10: { base: Number(desgloseIva[10].base.toFixed(2)), cuota: Number(desgloseIva[10].cuota.toFixed(2)) },
      0: { base: Number(desgloseIva[0].base.toFixed(2)), cuota: Number(desgloseIva[0].cuota.toFixed(2)) },
    }
  };
}

function facturaProveedorFromRow(row: any, lineas: LineaFacturaProveedor[]): FacturaProveedor {
  return {
    id: row.id,
    numero: row.numero,
    proveedorId: row.proveedor_id,
    fechaEmision: row.fecha_emision,
    fechaVencimiento: row.fecha_vencimiento,
    estado: row.estado,
    retencionIrpf: Number(row.retencion_irpf || 0),
    observaciones: row.observaciones || '',
    entregadoGestoria: !!row.entregado_gestoria,
    lineas: lineas,
    metodoPago: row.metodo_pago,
    plazosDias: Number(row.plazos_dias || 0),
    referenciaBancaria: row.referencia_bancaria || ''
  };
}

function facturaProveedorToRow(fac: Partial<FacturaProveedor>): any {
  const row: any = {};
  if (fac.id !== undefined) row.id = fac.id;
  if (fac.numero !== undefined) row.numero = fac.numero;
  if (fac.proveedorId !== undefined) row.proveedor_id = fac.proveedorId;
  if (fac.fechaEmision !== undefined) row.fecha_emision = fac.fechaEmision;
  if (fac.fechaVencimiento !== undefined) row.fecha_vencimiento = fac.fechaVencimiento;
  if (fac.estado !== undefined) row.estado = fac.estado;
  if (fac.retencionIrpf !== undefined) row.retencion_irpf = Number(fac.retencionIrpf);
  if (fac.observaciones !== undefined) row.observaciones = fac.observaciones;
  if (fac.entregadoGestoria !== undefined) row.entregado_gestoria = fac.entregadoGestoria;
  if (fac.metodoPago !== undefined) row.metodo_pago = fac.metodoPago;
  if (fac.plazosDias !== undefined) row.plazos_dias = Number(fac.plazosDias);
  if (fac.referenciaBancaria !== undefined) row.referencia_bancaria = fac.referenciaBancaria;
  return row;
}

function lineaProveedorFromRow(row: any): LineaFacturaProveedor {
  return {
    id: row.id,
    facturaProveedorId: row.factura_provider_id || row.factura_proveedor_id,
    tipo: row.tipo,
    productoId: row.producto_id,
    concepto: row.concepto,
    cantidad: Number(row.cantidad || 0),
    precioUnitario: Number(row.precio_unitario || 0),
    ivaPorcentaje: Number(row.iva_porcentaje || 0) as 21 | 10 | 0,
    obraId: row.obra_id,
    orden: Number(row.orden || 0)
  };
}

function lineaProveedorToRow(lin: LineaFacturaProveedor, facturaProveedorId: string, orden: number): any {
  return {
    id: lin.id,
    factura_proveedor_id: facturaProveedorId,
    tipo: lin.tipo,
    producto_id: lin.productoId,
    concepto: lin.concepto,
    cantidad: Number(lin.cantidad),
    precio_unitario: Number(lin.precioUnitario),
    iva_porcentaje: Number(lin.ivaPorcentaje),
    obra_id: lin.obraId,
    orden: orden
  };
}

export function useFacturasProveedor() {
  const [facturasProveedor, setFacturasProveedor] = useState<FacturaProveedor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFacturasProveedor = useCallback(async () => {
    try {
      setLoading(true);
      const [facRes, lineasRes] = await Promise.all([
        supabase.from('facturas_proveedor').select('*').order('created_at', { ascending: false }),
        supabase.from('lineas_factura_proveedor').select('*').order('orden', { ascending: true })
      ]);

      if (facRes.error) throw facRes.error;
      if (lineasRes.error) throw lineasRes.error;

      const dbFacturas = facRes.data || [];
      const dbLineas = lineasRes.data || [];

      const lineasMap: { [key: string]: LineaFacturaProveedor[] } = {};
      dbLineas.forEach((row: any) => {
        const fid = row.factura_proveedor_id;
        if (!lineasMap[fid]) lineasMap[fid] = [];
        lineasMap[fid].push(lineaProveedorFromRow(row));
      });

      const mappedFacturas = dbFacturas.map((facRow: any) => {
        return facturaProveedorFromRow(facRow, lineasMap[facRow.id] || []);
      });

      setFacturasProveedor(mappedFacturas);
    } catch (err: any) {
      console.error('Error fetching facturas_proveedor:', err);
      setError(err.message || 'Error al cargar las facturas de proveedor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFacturasProveedor();
  }, [fetchFacturasProveedor]);

  const addFacturaProveedor = async (facturaData: Omit<FacturaProveedor, 'id'>) => {
    try {
      const newId = `fp_${Date.now()}`;
      const newFactura: FacturaProveedor = {
        ...facturaData,
        id: newId
      };

      // 1. Insert parent
      const { error: err } = await supabase
        .from('facturas_proveedor')
        .insert([facturaProveedorToRow(newFactura)]);
      if (err) throw err;

      // 2. Insert lines
      if (newFactura.lineas && newFactura.lineas.length > 0) {
        const rowsToInsert = newFactura.lineas.map((l, index) => {
          const lid = `lfp_${Date.now()}_${index}`;
          return lineaProveedorToRow({ ...l, id: lid }, newId, index);
        });
        const { error: lineasErr } = await supabase
          .from('lineas_factura_proveedor')
          .insert(rowsToInsert);
        if (lineasErr) throw lineasErr;
      }

      await fetchFacturasProveedor();
      return newFactura;
    } catch (err: any) {
      console.error('Error adding factura_proveedor:', err);
      setError(err.message || 'Error al añadir la factura de proveedor');
      throw err;
    }
  };

  const updateFacturaProveedor = async (id: string, updatedFields: Partial<FacturaProveedor>) => {
    try {
      const parentFields = { ...updatedFields };
      delete parentFields.lineas;

      if (Object.keys(parentFields).length > 0) {
        const { error: parentErr } = await supabase
          .from('facturas_proveedor')
          .update(facturaProveedorToRow(parentFields))
          .eq('id', id);
        if (parentErr) throw parentErr;
      }

      if (updatedFields.lineas) {
        // Delete old lines
        const { error: delErr } = await supabase
          .from('lineas_factura_proveedor')
          .delete()
          .eq('factura_proveedor_id', id);
        if (delErr) throw delErr;

        // Insert new lines
        if (updatedFields.lineas.length > 0) {
          const rowsToInsert = updatedFields.lineas.map((l, index) => {
            const lid = l.id && !l.id.startsWith('temp_') ? l.id : `lfp_${Date.now()}_${index}`;
            return lineaProveedorToRow({ ...l, id: lid }, id, index);
          });
          const { error: insErr } = await supabase
            .from('lineas_factura_proveedor')
            .insert(rowsToInsert);
          if (insErr) throw insErr;
        }
      }

      await fetchFacturasProveedor();
    } catch (err: any) {
      console.error('Error updating factura_proveedor:', err);
      setError(err.message || 'Error al actualizar la factura de proveedor');
      throw err;
    }
  };

  const deleteFacturaProveedor = async (id: string) => {
    try {
      // 1. Delete lines
      await supabase
        .from('lineas_factura_proveedor')
        .delete()
        .eq('factura_proveedor_id', id);

      // 2. Delete parent
      const { error: err } = await supabase
        .from('facturas_proveedor')
        .delete()
        .eq('id', id);
      if (err) throw err;

      await fetchFacturasProveedor();
    } catch (err: any) {
      console.error('Error deleting factura_proveedor:', err);
      setError(err.message || 'Error al eliminar la factura de proveedor');
      throw err;
    }
  };

  const changeFacturaProveedorEstado = async (id: string, estado: FacturaProveedor['estado']) => {
    try {
      const { error: err } = await supabase
        .from('facturas_proveedor')
        .update({ estado })
        .eq('id', id);
      if (err) throw err;

      await fetchFacturasProveedor();
    } catch (err: any) {
      console.error('Error changing factura_proveedor state:', err);
      setError(err.message || 'Error al cambiar el estado de la factura');
      throw err;
    }
  };

  // Function to return all material lines imputed to a specific obraId
  const getMaterialLinesByObraId = useCallback(async (obraId: string) => {
    try {
      const { data, error: err } = await supabase
        .from('lineas_factura_proveedor')
        .select('*')
        .eq('obra_id', obraId);

      if (err) throw err;

      const mappedLines = (data || []).map(lineaProveedorFromRow);

      const uniqueInvoiceIds = Array.from(new Set(mappedLines.map(l => l.facturaProveedorId).filter(Boolean)));
      
      let invoiceMap: { [key: string]: { numero: string; proveedorId: string } } = {};
      if (uniqueInvoiceIds.length > 0) {
        const { data: invData, error: invErr } = await supabase
          .from('facturas_proveedor')
          .select('id, numero, proveedor_id')
          .in('id', uniqueInvoiceIds);

        if (invErr) throw invErr;

        (invData || []).forEach((row: any) => {
          invoiceMap[row.id] = {
            numero: row.numero,
            proveedorId: row.proveedor_id
          };
        });
      }

      return mappedLines.map(l => ({
        ...l,
        facturaNumero: invoiceMap[l.facturaProveedorId]?.numero || '—',
        proveedorId: invoiceMap[l.facturaProveedorId]?.proveedorId || ''
      }));
    } catch (err: any) {
      console.error('Error fetching material lines by obra:', err);
      return [];
    }
  }, []);

  const toggleEntregadoGestoria = async (id: string) => {
    try {
      const current = facturasProveedor.find(f => f.id === id);
      if (!current) return;
      const newValue = !current.entregadoGestoria;
      const { error: err } = await supabase
        .from('facturas_proveedor')
        .update({ entregado_gestoria: newValue })
        .eq('id', id);
      if (err) throw err;

      await fetchFacturasProveedor();
    } catch (err: any) {
      console.error('Error toggling entregado_gestoria (proveedor):', err);
      setError(err.message || 'Error al cambiar el estado de gestoría');
      throw err;
    }
  };

  return {
    facturasProveedor,
    loading,
    error,
    addFacturaProveedor,
    updateFacturaProveedor,
    deleteFacturaProveedor,
    changeFacturaProveedorEstado,
    toggleEntregadoGestoria,
    getMaterialLinesByObraId,
    calculateTotals: calculateFacturaProveedorTotals
  };
}
