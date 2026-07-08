import { useState, useEffect, useCallback } from 'react';
import { Proveedor, CompraProveedor, DocumentoProveedor, NotaProveedor } from '../types/proveedor';
import { supabase } from '../lib/supabaseClient';

function provFromRow(row: any): Proveedor {
  let contactosList: any[] = [];
  let displayPersona = row.persona_contacto || '';
  if (row.persona_contacto && (row.persona_contacto.startsWith('[') || row.persona_contacto.startsWith('{'))) {
    try {
      const parsed = JSON.parse(row.persona_contacto);
      if (Array.isArray(parsed)) {
        contactosList = parsed;
        if (contactosList.length > 0) {
          displayPersona = contactosList[0].nombre || '';
        }
      }
    } catch (e) {
      contactosList = [];
    }
  }
  
  if (contactosList.length === 0 && row.persona_contacto) {
    contactosList = [{
      id: 'contact_default',
      nombre: row.persona_contacto,
      telefono: row.movil || row.telefono || '',
      email: row.email || '',
      puesto: 'Comercial'
    }];
  }

  return {
    id: row.id,
    codigo: row.codigo,
    nombre: row.nombre,
    tipo: row.tipo,
    categoria: row.categoria,
    nifCif: row.nif_cif,
    personaContacto: displayPersona,
    contactos: contactosList,
    telefono: row.telefono,
    movil: row.movil,
    email: row.email,
    direccion: row.direccion,
    codigoPostal: row.codigo_postal,
    ciudad: row.ciudad,
    provincia: row.provincia,
    iban: row.iban,
    observaciones: row.observaciones,
    activo: !!row.activo
  };
}

function provToRow(prov: Partial<Proveedor>): any {
  const row: any = {};
  if (prov.id !== undefined) row.id = prov.id;
  if (prov.codigo !== undefined) row.codigo = prov.codigo;
  if (prov.nombre !== undefined) row.nombre = prov.nombre;
  if (prov.tipo !== undefined) row.tipo = prov.tipo;
  if (prov.categoria !== undefined) row.categoria = prov.categoria;
  if (prov.nifCif !== undefined) row.nif_cif = prov.nifCif;
  
  if (prov.contactos !== undefined) {
    row.persona_contacto = JSON.stringify(prov.contactos);
  } else if (prov.personaContacto !== undefined) {
    row.persona_contacto = prov.personaContacto;
  }
  
  if (prov.telefono !== undefined) row.telefono = prov.telefono;
  if (prov.movil !== undefined) row.movil = prov.movil;
  if (prov.email !== undefined) row.email = prov.email;
  if (prov.direccion !== undefined) row.direccion = prov.direccion;
  if (prov.codigoPostal !== undefined) row.codigo_postal = prov.codigoPostal;
  if (prov.ciudad !== undefined) row.ciudad = prov.ciudad;
  if (prov.provincia !== undefined) row.provincia = prov.provincia;
  if (prov.iban !== undefined) row.iban = prov.iban;
  if (prov.observaciones !== undefined) row.observaciones = prov.observaciones;
  if (prov.activo !== undefined) row.activo = prov.activo;
  return row;
}

function compraFromRow(row: any): CompraProveedor {
  return {
    id: row.id,
    proveedorId: row.proveedor_id,
    codigo: row.codigo,
    concepto: row.concepto,
    importe: Number(row.importe),
    fecha: row.fecha,
    estado: row.estado
  };
}

function compraToRow(compra: Partial<CompraProveedor>): any {
  const row: any = {};
  if (compra.id !== undefined) row.id = compra.id;
  if (compra.proveedorId !== undefined) row.proveedor_id = compra.proveedorId;
  if (compra.codigo !== undefined) row.codigo = compra.codigo;
  if (compra.concepto !== undefined) row.concepto = compra.concepto;
  if (compra.importe !== undefined) row.importe = compra.importe;
  if (compra.fecha !== undefined) row.fecha = compra.fecha;
  if (compra.estado !== undefined) row.estado = compra.estado;
  return row;
}

function docFromRow(row: any): DocumentoProveedor {
  return {
    id: row.id,
    proveedorId: row.proveedor_id,
    nombre: row.nombre,
    tipo: row.tipo,
    fechaSubida: row.fecha_subida,
    tamano: row.tamano
  };
}

function docToRow(doc: Partial<DocumentoProveedor>): any {
  const row: any = {};
  if (doc.id !== undefined) row.id = doc.id;
  if (doc.proveedorId !== undefined) row.proveedor_id = doc.proveedorId;
  if (doc.nombre !== undefined) row.nombre = doc.nombre;
  if (doc.tipo !== undefined) row.tipo = doc.tipo;
  if (doc.fechaSubida !== undefined) row.fecha_subida = doc.fechaSubida;
  if (doc.tamano !== undefined) row.tamano = doc.tamano;
  return row;
}

function notaFromRow(row: any): NotaProveedor {
  return {
    id: row.id,
    proveedorId: row.proveedor_id,
    contenido: row.contenido,
    autor: row.autor,
    fecha: row.fecha
  };
}

function notaToRow(nota: Partial<NotaProveedor>): any {
  const row: any = {};
  if (nota.id !== undefined) row.id = nota.id;
  if (nota.proveedorId !== undefined) row.proveedor_id = nota.proveedorId;
  if (nota.contenido !== undefined) row.contenido = nota.contenido;
  if (nota.autor !== undefined) row.autor = nota.autor;
  if (nota.fecha !== undefined) row.fecha = nota.fecha;
  return row;
}

export function useProveedores() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [compras, setCompras] = useState<CompraProveedor[]>([]);
  const [documentos, setDocumentos] = useState<DocumentoProveedor[]>([]);
  const [notas, setNotas] = useState<NotaProveedor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [provRes, compRes, docRes, notaRes] = await Promise.all([
        supabase.from('proveedores').select('*').order('created_at', { ascending: false }),
        supabase.from('compras_proveedor').select('*').order('fecha', { ascending: false }),
        supabase.from('documentos_proveedor').select('*').order('fecha_subida', { ascending: false }),
        supabase.from('notas_proveedor').select('*').order('fecha', { ascending: false })
      ]);

      if (provRes.error) throw provRes.error;
      if (compRes.error) throw compRes.error;
      if (docRes.error) throw docRes.error;
      if (notaRes.error) throw notaRes.error;

      if (provRes.data) setProveedores(provRes.data.map(provFromRow));
      if (compRes.data) setCompras(compRes.data.map(compraFromRow));
      if (docRes.data) setDocumentos(docRes.data.map(docFromRow));
      if (notaRes.data) setNotas(notaRes.data.map(notaFromRow));
    } catch (err: any) {
      console.error('Error fetching suppliers data:', err);
      setError(err.message || 'Error al cargar los datos de proveedores');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Generar código automático PRV-XXXXXX
  const generateNextCodigo = (): string => {
    if (proveedores.length === 0) return 'PRV-000001';
    
    const codigos = proveedores
      .map(p => {
        const match = p.codigo.match(/PRV-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(num => !isNaN(num));

    const maxNum = codigos.length > 0 ? Math.max(...codigos) : 0;
    const nextNum = maxNum + 1;
    return `PRV-${String(nextNum).padStart(6, '0')}`;
  };

  const addProveedor = async (prov: Omit<Proveedor, 'id' | 'codigo'>) => {
    try {
      const nextCode = generateNextCodigo();
      const newId = `prv_${Date.now()}`;
      const newProv: Proveedor = {
        ...prov,
        id: newId,
        codigo: nextCode
      };

      const { error: err } = await supabase
        .from('proveedores')
        .insert([provToRow(newProv)]);
      if (err) throw err;

      await fetchAllData();
      return newProv;
    } catch (err: any) {
      console.error('Error adding supplier:', err);
      setError(err.message || 'Error al añadir el proveedor');
      throw err;
    }
  };

  const updateProveedor = async (id: string, updatedFields: Partial<Proveedor>) => {
    try {
      const { error: err } = await supabase
        .from('proveedores')
        .update(provToRow(updatedFields))
        .eq('id', id);
      if (err) throw err;

      await fetchAllData();
    } catch (err: any) {
      console.error('Error updating supplier:', err);
      setError(err.message || 'Error al actualizar el proveedor');
      throw err;
    }
  };

  const deleteProveedor = async (id: string) => {
    try {
      // Delete cascade relations manually to prevent foreign key errors if no cascade is on DB
      await Promise.all([
        supabase.from('compras_proveedor').delete().eq('proveedor_id', id),
        supabase.from('documentos_proveedor').delete().eq('proveedor_id', id),
        supabase.from('notas_proveedor').delete().eq('proveedor_id', id)
      ]);

      const { error: err } = await supabase
        .from('proveedores')
        .delete()
        .eq('id', id);
      if (err) throw err;

      await fetchAllData();
    } catch (err: any) {
      console.error('Error deleting supplier:', err);
      setError(err.message || 'Error al eliminar el proveedor');
      throw err;
    }
  };

  const addCompra = async (compraData: Omit<CompraProveedor, 'id' | 'codigo'>) => {
    try {
      const nextNum = compras.length + 1;
      const codigo = `COM-2026-${String(nextNum).padStart(4, '0')}`;
      const newId = `cmp_${Date.now()}`;
      const newCompra: CompraProveedor = {
        ...compraData,
        id: newId,
        codigo
      };

      const { error: err } = await supabase
        .from('compras_proveedor')
        .insert([compraToRow(newCompra)]);
      if (err) throw err;

      await fetchAllData();
      return newCompra;
    } catch (err: any) {
      console.error('Error adding purchase:', err);
      setError(err.message || 'Error al añadir la compra');
      throw err;
    }
  };

  const addDocumento = async (docData: Omit<DocumentoProveedor, 'id'>) => {
    try {
      const newId = `doc_${Date.now()}`;
      const newDoc: DocumentoProveedor = {
        ...docData,
        id: newId
      };

      const { error: err } = await supabase
        .from('documentos_proveedor')
        .insert([docToRow(newDoc)]);
      if (err) throw err;

      await fetchAllData();
      return newDoc;
    } catch (err: any) {
      console.error('Error adding document:', err);
      setError(err.message || 'Error al añadir el documento');
      throw err;
    }
  };

  const deleteDocumento = async (id: string) => {
    try {
      const { error: err } = await supabase
        .from('documentos_proveedor')
        .delete()
        .eq('id', id);
      if (err) throw err;

      await fetchAllData();
    } catch (err: any) {
      console.error('Error deleting document:', err);
      setError(err.message || 'Error al eliminar el documento');
      throw err;
    }
  };

  const addNota = async (notaData: Omit<NotaProveedor, 'id'>) => {
    try {
      const newId = `not_${Date.now()}`;
      const newNota: NotaProveedor = {
        ...notaData,
        id: newId
      };

      const { error: err } = await supabase
        .from('notas_proveedor')
        .insert([notaToRow(newNota)]);
      if (err) throw err;

      await fetchAllData();
      return newNota;
    } catch (err: any) {
      console.error('Error adding note:', err);
      setError(err.message || 'Error al añadir la nota');
      throw err;
    }
  };

  const deleteNota = async (id: string) => {
    try {
      const { error: err } = await supabase
        .from('notas_proveedor')
        .delete()
        .eq('id', id);
      if (err) throw err;

      await fetchAllData();
    } catch (err: any) {
      console.error('Error deleting note:', err);
      setError(err.message || 'Error al eliminar la nota');
      throw err;
    }
  };

  const updateCompraStatus = async (id: string, estado: CompraProveedor['estado']) => {
    try {
      const { error: err } = await supabase
        .from('compras_proveedor')
        .update({ estado })
        .eq('id', id);
      if (err) throw err;

      await fetchAllData();
    } catch (err: any) {
      console.error('Error updating purchase status:', err);
      setError(err.message || 'Error al actualizar el estado de la compra');
      throw err;
    }
  };

  return {
    proveedores,
    compras,
    documentos,
    notas,
    loading,
    error,
    addProveedor,
    updateProveedor,
    deleteProveedor,
    addCompra,
    addDocumento,
    deleteDocumento,
    addNota,
    deleteNota,
    updateCompraStatus
  };
}
