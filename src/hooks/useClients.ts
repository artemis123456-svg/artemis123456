import { useState, useEffect, useCallback } from 'react';
import { Client, Obra, Presupuesto, Factura, Documento, Nota, HistorialEntry } from '../types/client';
import { supabase } from '../lib/supabaseClient';

// Initial Mock Data fallbacks if localStorage is empty
const INITIAL_PRESUPUESTOS: Presupuesto[] = [
  {
    id: 'pre_1',
    clientId: 'cli_1',
    codigo: 'PRE-2026-001',
    obraId: 'obr_1',
    titulo: 'Fase I: Demolición y Tabiquería Oficinas',
    importe: 35000,
    estado: 'Aceptado',
    fechaEmision: '2026-01-20'
  },
  {
    id: 'pre_2',
    clientId: 'cli_1',
    codigo: 'PRE-2026-002',
    obraId: 'obr_1',
    titulo: 'Fase II: Electricidad, Climatización y Acabados',
    importe: 90000,
    estado: 'Aceptado',
    fechaEmision: '2026-01-28'
  },
  {
    id: 'pre_3',
    clientId: 'cli_1',
    codigo: 'PRE-2026-003',
    obraId: 'obr_2',
    titulo: 'Estructuras Metálicas e Iluminación Almacén',
    importe: 45000,
    estado: 'Borrador',
    fechaEmision: '2026-06-15'
  },
  {
    id: 'pre_4',
    clientId: 'cli_2',
    codigo: 'PRE-2026-004',
    obraId: 'obr_3',
    titulo: 'Reforma Completa Fuencarral',
    importe: 68000,
    estado: 'Aceptado',
    fechaEmision: '2026-03-02'
  },
  {
    id: 'pre_5',
    clientId: 'cli_3',
    codigo: 'PRE-2026-005',
    titulo: 'Estudio de Viabilidad y Proyecto Climatización',
    importe: 8400,
    estado: 'Enviado',
    fechaEmision: '2026-05-18'
  }
];

const INITIAL_FACTURAS: Factura[] = [
  {
    id: 'fac_1',
    clientId: 'cli_1',
    codigo: 'FAC-2026-012',
    titulo: 'Certificación Obra Nº 1 - Reforma Oficinas',
    baseImponible: 35000,
    iva: 21,
    total: 42350,
    estado: 'Cobrada',
    fechaEmision: '2026-02-15',
    fechaVencimiento: '2026-03-15'
  },
  {
    id: 'fac_2',
    clientId: 'cli_1',
    codigo: 'FAC-2026-028',
    titulo: 'Provisión Materiales Climatización',
    baseImponible: 30000,
    iva: 21,
    total: 36300,
    estado: 'Emitida',
    fechaEmision: '2026-06-20',
    fechaVencimiento: '2026-07-20'
  },
  {
    id: 'fac_3',
    clientId: 'cli_2',
    codigo: 'FAC-2026-018',
    titulo: 'Factura Única - Adecuación Local Fuencarral',
    baseImponible: 68000,
    iva: 21,
    total: 82280,
    estado: 'Cobrada',
    fechaEmision: '2026-04-12',
    fechaVencimiento: '2026-05-12'
  }
];

// Mappings between frontend types and Supabase snake_case tables
function clientFromRow(row: any): Client {
  return {
    id: row.id,
    codigo: row.codigo,
    nombre: row.nombre,
    apellidos: row.apellidos || '',
    empresa: row.empresa || '',
    nifCif: row.nif_cif || '',
    telefono: row.telefono || '',
    movil: row.movil || '',
    email: row.email || '',
    direccion: row.direccion || '',
    codigoPostal: row.codigo_postal || '',
    ciudad: row.ciudad || '',
    provincia: row.provincia || '',
    iban: row.iban || '',
    observaciones: row.observaciones || '',
    estado: row.estado || 'Activo',
    fuenteLead: row.fuente_lead || 'Otro',
    consentimientoRGPD: !!row.consentimiento_rgpd,
    fechaConsentimiento: row.fecha_consentimiento || null,
    createdAt: row.created_at || new Date().toISOString()
  };
}

function clientToRow(c: Partial<Client>): any {
  const row: any = {};
  if (c.id !== undefined) row.id = c.id;
  if (c.codigo !== undefined) row.codigo = c.codigo;
  if (c.nombre !== undefined) row.nombre = c.nombre;
  if (c.apellidos !== undefined) row.apellidos = c.apellidos;
  if (c.empresa !== undefined) row.empresa = c.empresa;
  if (c.nifCif !== undefined) row.nif_cif = c.nifCif;
  if (c.telefono !== undefined) row.telefono = c.telefono;
  if (c.movil !== undefined) row.movil = c.movil;
  if (c.email !== undefined) row.email = c.email;
  if (c.direccion !== undefined) row.direccion = c.direccion;
  if (c.codigoPostal !== undefined) row.codigo_postal = c.codigoPostal;
  if (c.ciudad !== undefined) row.ciudad = c.ciudad;
  if (c.provincia !== undefined) row.provincia = c.provincia;
  if (c.iban !== undefined) row.iban = c.iban;
  if (c.observaciones !== undefined) row.observaciones = c.observaciones;
  if (c.estado !== undefined) row.estado = c.estado;
  if (c.fuenteLead !== undefined) row.fuente_lead = c.fuenteLead;
  if (c.consentimientoRGPD !== undefined) row.consentimiento_rgpd = c.consentimientoRGPD;
  if (c.fechaConsentimiento !== undefined) row.fecha_consentimiento = c.fechaConsentimiento;
  if (c.createdAt !== undefined) row.created_at = c.createdAt;
  return row;
}

function docFromRow(row: any): Documento {
  return {
    id: row.id,
    clientId: row.cliente_id,
    nombre: row.nombre,
    tipo: row.tipo,
    tamano: row.tamano || '',
    fechaSubida: row.fecha_subida
  };
}

function docToRow(d: Partial<Documento>): any {
  const row: any = {};
  if (d.id !== undefined) row.id = d.id;
  if (d.clientId !== undefined) row.cliente_id = d.clientId;
  if (d.nombre !== undefined) row.nombre = d.nombre;
  if (d.tipo !== undefined) row.tipo = d.tipo;
  if (d.tamano !== undefined) row.tamano = d.tamano;
  if (d.fechaSubida !== undefined) row.fecha_subida = d.fechaSubida;
  return row;
}

function notaFromRow(row: any): Nota {
  return {
    id: row.id,
    clientId: row.cliente_id,
    contenido: row.contenido,
    fechaCreacion: row.fecha_creacion,
    autor: row.autor
  };
}

function notaToRow(n: Partial<Nota>): any {
  const row: any = {};
  if (n.id !== undefined) row.id = n.id;
  if (n.clientId !== undefined) row.cliente_id = n.clientId;
  if (n.contenido !== undefined) row.contenido = n.contenido;
  if (n.fechaCreacion !== undefined) row.fecha_creacion = n.fechaCreacion;
  if (n.autor !== undefined) row.autor = n.autor;
  return row;
}

function histFromRow(row: any): HistorialEntry {
  return {
    id: row.id,
    clientId: row.cliente_id,
    accion: row.accion,
    detalle: row.detalle,
    fecha: row.fecha,
    usuario: row.usuario
  };
}

function histToRow(h: Partial<HistorialEntry>): any {
  const row: any = {};
  if (h.id !== undefined) row.id = h.id;
  if (h.clientId !== undefined) row.cliente_id = h.clientId;
  if (h.accion !== undefined) row.accion = h.accion;
  if (h.detalle !== undefined) row.detalle = h.detalle;
  if (h.fecha !== undefined) row.fecha = h.fecha;
  if (h.usuario !== undefined) row.usuario = h.usuario;
  return row;
}

function obraFromRow(row: any): Obra {
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

function obraToRow(obra: Partial<Obra>): any {
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

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [historial, setHistorial] = useState<HistorialEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all Supabase data
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [cliRes, obrasRes, docsRes, notasRes, histRes] = await Promise.all([
        supabase.from('clientes').select('*').order('created_at', { ascending: false }),
        supabase.from('obras').select('*').order('created_at', { ascending: false }),
        supabase.from('documentos_cliente').select('*').order('fecha_subida', { ascending: false }),
        supabase.from('notas_cliente').select('*').order('fecha_creacion', { ascending: false }),
        supabase.from('historial_cliente').select('*').order('fecha', { ascending: false })
      ]);

      if (cliRes.error) throw cliRes.error;
      if (obrasRes.error) throw obrasRes.error;
      if (docsRes.error) throw docsRes.error;
      if (notasRes.error) throw notasRes.error;
      if (histRes.error) throw histRes.error;

      if (cliRes.data) setClients(cliRes.data.map(clientFromRow));
      if (obrasRes.data) setObras(obrasRes.data.map(obraFromRow));
      if (docsRes.data) setDocumentos(docsRes.data.map(docFromRow));
      if (notasRes.data) setNotas(notasRes.data.map(notaFromRow));
      if (histRes.data) setHistorial(histRes.data.map(histFromRow));
    } catch (err: any) {
      console.error('Error fetching clients data from Supabase:', err);
      setError(err.message || 'Error al cargar los datos de clientes');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchAllData();

    // Budgets & Invoices local storage fallback (not in DB schema)
    const storedPresupuestos = localStorage.getItem('verini_presupuestos');
    const storedFacturas = localStorage.getItem('verini_facturas');

    if (storedPresupuestos) {
      setPresupuestos(JSON.parse(storedPresupuestos));
    } else {
      localStorage.setItem('verini_presupuestos', JSON.stringify(INITIAL_PRESUPUESTOS));
      setPresupuestos(INITIAL_PRESUPUESTOS);
    }

    if (storedFacturas) {
      setFacturas(JSON.parse(storedFacturas));
    } else {
      localStorage.setItem('verini_facturas', JSON.stringify(INITIAL_FACTURAS));
      setFacturas(INITIAL_FACTURAS);
    }
  }, [fetchAllData]);

  // Helper to generate unique VER-XXXXXX client code
  const generateClientCode = (): string => {
    const codes = clients.map(c => {
      const match = c.codigo.match(/VER-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxCodeNum = codes.length > 0 ? Math.max(...codes) : 123;
    const nextCodeNum = maxCodeNum + 1;
    return `VER-${nextCodeNum.toString().padStart(6, '0')}`;
  };

  // Log into history
  const addHistorialEntry = async (clientId: string, accion: string, detalle: string, usuario: string) => {
    try {
      const newEntry: HistorialEntry = {
        id: `his_${Date.now()}`,
        clientId,
        accion,
        detalle,
        fecha: new Date().toISOString(),
        usuario
      };

      const { error: err } = await supabase
        .from('historial_cliente')
        .insert([histToRow(newEntry)]);
      if (err) throw err;

      // Update local history array dynamically
      const { data, error: fetchErr } = await supabase
        .from('historial_cliente')
        .select('*')
        .order('fecha', { ascending: false });
      if (!fetchErr && data) {
        setHistorial(data.map(histFromRow));
      }
    } catch (err) {
      console.error('Error adding history entry:', err);
    }
  };

  const addClient = async (newClientFields: Omit<Client, 'id' | 'codigo' | 'createdAt'>) => {
    try {
      const nextCode = generateClientCode();
      const newId = `cli_${Date.now()}`;
      const newClient: Client = {
        ...newClientFields,
        id: newId,
        codigo: nextCode,
        createdAt: new Date().toISOString()
      };

      const { error: err } = await supabase
        .from('clientes')
        .insert([clientToRow(newClient)]);
      if (err) throw err;

      await addHistorialEntry(newId, 'Creación de Cliente', `El cliente fue registrado con código ${newClient.codigo}.`, 'Administrador');
      await fetchAllData();
      return newClient;
    } catch (err: any) {
      console.error('Error adding client:', err);
      setError(err.message || 'Error al añadir el cliente');
      throw err;
    }
  };

  const updateClient = async (id: string, updatedFields: Partial<Client>) => {
    try {
      const current = clients.find(c => c.id === id);
      if (current) {
        const changedFields: string[] = [];
        Object.keys(updatedFields).forEach(k => {
          const key = k as keyof Client;
          if (current[key] !== updatedFields[key]) {
            changedFields.push(k);
          }
        });
        if (changedFields.length > 0) {
          await addHistorialEntry(id, 'Actualización de Cliente', `Campos actualizados: ${changedFields.join(', ')}.`, 'Administrador');
        }
      }

      const { error: err } = await supabase
        .from('clientes')
        .update(clientToRow(updatedFields))
        .eq('id', id);
      if (err) throw err;

      await fetchAllData();
    } catch (err: any) {
      console.error('Error updating client:', err);
      setError(err.message || 'Error al actualizar el cliente');
      throw err;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      // Cascade delete client related items in database manually
      await Promise.all([
        supabase.from('documentos_cliente').delete().eq('cliente_id', id),
        supabase.from('notas_cliente').delete().eq('cliente_id', id),
        supabase.from('historial_cliente').delete().eq('cliente_id', id),
        supabase.from('obras').delete().eq('cliente_id', id)
      ]);

      const { error: err } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);
      if (err) throw err;

      // Clean up localStorage budgets and invoices
      const updatedPresupuestos = presupuestos.filter(p => p.clientId !== id);
      setPresupuestos(updatedPresupuestos);
      localStorage.setItem('verini_presupuestos', JSON.stringify(updatedPresupuestos));

      const updatedFacturas = facturas.filter(f => f.clientId !== id);
      setFacturas(updatedFacturas);
      localStorage.setItem('verini_facturas', JSON.stringify(updatedFacturas));

      await fetchAllData();
    } catch (err: any) {
      console.error('Error deleting client:', err);
      setError(err.message || 'Error al eliminar el cliente');
      throw err;
    }
  };

  const addObra = async (clientId: string, obraFields: Omit<Obra, 'id' | 'codigo' | 'clientId'>) => {
    try {
      const nextIndex = obras.length + 1;
      const code = `OBR-2026-${nextIndex.toString().padStart(3, '0')}`;
      const newId = `obr_${Date.now()}`;
      const newObra: Obra = {
        ...obraFields,
        id: newId,
        clientId,
        codigo: code
      };

      const { error: err } = await supabase
        .from('obras')
        .insert([obraToRow(newObra)]);
      if (err) throw err;

      await addHistorialEntry(clientId, 'Nueva Obra Creada', `Se registró la obra "${newObra.titulo}" con código ${newObra.codigo}.`, 'Gestor de Obras');
      await fetchAllData();
    } catch (err: any) {
      console.error('Error adding obra from clients:', err);
      setError(err.message || 'Error al añadir la obra');
      throw err;
    }
  };

  const addPresupuesto = (clientId: string, presFields: Omit<Presupuesto, 'id' | 'codigo' | 'clientId'>) => {
    const nextIndex = presupuestos.length + 1;
    const code = `PRE-2026-${nextIndex.toString().padStart(3, '0')}`;
    const newPresupuesto: Presupuesto = {
      ...presFields,
      id: `pre_${Date.now()}`,
      clientId,
      codigo: code
    };

    const updated = [...presupuestos, newPresupuesto];
    setPresupuestos(updated);
    localStorage.setItem('verini_presupuestos', JSON.stringify(updated));

    addHistorialEntry(clientId, 'Presupuesto Creado', `Se generó el presupuesto ${newPresupuesto.codigo}: "${newPresupuesto.titulo}" por ${newPresupuesto.importe.toLocaleString('es-ES')} €.`, 'Administración');
    
    if (newPresupuesto.estado === 'Aceptado') {
      createAutoInvoice(clientId, newPresupuesto);
    }
  };

  const createAutoInvoice = (clientId: string, p: Presupuesto) => {
    const nextIndex = facturas.length + 1;
    const code = `FAC-2026-${nextIndex.toString().padStart(3, '0')}`;
    const base = p.importe;
    const iva = 21;
    const total = Math.round(base * 1.21);
    
    const newFactura: Factura = {
      id: `fac_${Date.now()}`,
      clientId,
      codigo: code,
      titulo: `Certificación Obra - ${p.titulo}`,
      baseImponible: base,
      iva,
      total,
      estado: 'Emitida',
      fechaEmision: new Date().toISOString().split('T')[0],
      fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    const updatedFacturas = [...facturas, newFactura];
    setFacturas(updatedFacturas);
    localStorage.setItem('verini_facturas', JSON.stringify(updatedFacturas));
    addHistorialEntry(clientId, 'Factura Emitida', `Emitida de forma automática factura ${newFactura.codigo} por aceptación de presupuesto.`, 'Facturación Automática');
  };

  const addDocumento = async (clientId: string, docFields: Omit<Documento, 'id' | 'fechaSubida' | 'clientId'>) => {
    try {
      const newId = `doc_${Date.now()}`;
      const newDoc: Documento = {
        ...docFields,
        id: newId,
        clientId,
        fechaSubida: new Date().toISOString().split('T')[0]
      };

      const { error: err } = await supabase
        .from('documentos_cliente')
        .insert([docToRow(newDoc)]);
      if (err) throw err;

      await addHistorialEntry(clientId, 'Documento Subido', `Se subió el archivo "${newDoc.nombre}" (${newDoc.tamano}).`, 'Usuario');
      await fetchAllData();
    } catch (err: any) {
      console.error('Error adding client document:', err);
      setError(err.message || 'Error al añadir el documento');
      throw err;
    }
  };

  const addNota = async (clientId: string, contenido: string, autor: string) => {
    try {
      const newId = `not_${Date.now()}`;
      const newNota: Nota = {
        id: newId,
        clientId,
        contenido,
        fechaCreacion: new Date().toISOString(),
        autor
      };

      const { error: err } = await supabase
        .from('notas_cliente')
        .insert([notaToRow(newNota)]);
      if (err) throw err;

      await addHistorialEntry(clientId, 'Nota Añadida', `Añadida nueva anotación por ${autor}.`, autor);
      await fetchAllData();
    } catch (err: any) {
      console.error('Error adding client note:', err);
      setError(err.message || 'Error al añadir la nota');
      throw err;
    }
  };

  const updateObraStatus = async (id: string, estado: Obra['estado']) => {
    try {
      const current = obras.find(o => o.id === id);
      const { error: err } = await supabase
        .from('obras')
        .update({ estado })
        .eq('id', id);
      if (err) throw err;

      if (current) {
        await addHistorialEntry(current.clientId, 'Estado de Obra Actualizado', `La obra ${current.codigo} cambió su estado a "${estado}".`, 'Gestor de Obras');
      }
      await fetchAllData();
    } catch (err: any) {
      console.error('Error updating obra status:', err);
      setError(err.message || 'Error al actualizar el estado de la obra');
      throw err;
    }
  };

  const updatePresupuestoStatus = (id: string, estado: Presupuesto['estado']) => {
    const updated = budgets => budgets.map(p => {
      if (p.id === id) {
        addHistorialEntry(p.clientId, 'Estado de Presupuesto Actualizado', `El presupuesto ${p.codigo} cambió su estado a "${estado}".`, 'Administrador');
        if (estado === 'Aceptado') {
          createAutoInvoice(p.clientId, p);
        }
        return { ...p, estado };
      }
      return p;
    });
    setPresupuestos(prev => {
      const updatedList = updated(prev);
      localStorage.setItem('verini_presupuestos', JSON.stringify(updatedList));
      return updatedList;
    });
  };

  const updateFacturaStatus = (id: string, estado: Factura['estado']) => {
    const updated = facturas.map(f => {
      if (f.id === id) {
        addHistorialEntry(f.clientId, 'Estado de Factura Actualizado', `La factura ${f.codigo} cambió su estado a "${estado}".`, 'Administración');
        return { ...f, estado };
      }
      return f;
    });
    setFacturas(updated);
    localStorage.setItem('verini_facturas', JSON.stringify(updated));
  };

  return {
    clients,
    obras,
    presupuestos,
    facturas,
    documentos,
    notas,
    historial,
    loading,
    error,
    addClient,
    updateClient,
    deleteClient,
    addObra,
    addPresupuesto,
    addDocumento,
    addNota,
    updateObraStatus,
    updatePresupuestoStatus,
    updateFacturaStatus,
  };
}
