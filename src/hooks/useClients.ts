import { useState, useEffect } from 'react';
import { Client, Obra, Presupuesto, Factura, Documento, Nota, HistorialEntry } from '../types/client';

// Initial Mock Data
const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli_1',
    codigo: 'VER-000124',
    nombre: 'Alejandro',
    apellidos: 'Sanz Torres',
    empresa: 'Construcciones Levantinas S.L.',
    nifCif: 'B98765432',
    telefono: '963456789',
    movil: '600123456',
    email: 'a.sanz@construccioneslevantinas.com',
    direccion: 'Avenida del Puerto 45, Planta 3',
    codigoPostal: '46021',
    ciudad: 'Valencia',
    provincia: 'Valencia',
    iban: 'ES2100491500051234567890',
    observaciones: 'Cliente preferente de cuentas corporativas. Requiere facturación agrupada por obra.',
    estado: 'Activo',
    fuenteLead: 'Showroom',
    consentimientoRGPD: true,
    fechaConsentimiento: '2026-01-15T09:30:00.000Z',
    createdAt: '2026-01-15T09:30:00.000Z'
  },
  {
    id: 'cli_2',
    codigo: 'VER-000125',
    nombre: 'Sofía',
    apellidos: 'Gómez Ruiz',
    empresa: 'Inmobiliaria Madrileña S.A.',
    nifCif: 'A87654321',
    telefono: '915678901',
    movil: '622987654',
    email: 'sofia.gomez@inmomadrid.es',
    direccion: 'Paseo de la Castellana 112',
    codigoPostal: '28046',
    ciudad: 'Madrid',
    provincia: 'Madrid',
    iban: 'ES9800811000089876543210',
    observaciones: 'Interesados en reformas de locales de retail para su posterior alquiler.',
    estado: 'Activo',
    fuenteLead: 'Web',
    consentimientoRGPD: true,
    fechaConsentimiento: '2026-02-20T11:15:00.000Z',
    createdAt: '2026-02-20T11:15:00.000Z'
  },
  {
    id: 'cli_3',
    codigo: 'VER-000126',
    nombre: 'Manuel',
    apellidos: 'Benítez Ramos',
    empresa: 'Restaurantes del Sur S.L.',
    nifCif: 'B41098765',
    telefono: '954123456',
    movil: '655345678',
    email: 'mbenitez@restaurantesdelsur.com',
    direccion: 'Calle Betis 14',
    codigoPostal: '41010',
    ciudad: 'Sevilla',
    provincia: 'Sevilla',
    iban: 'ES4500730100021122334455',
    observaciones: 'Nueva franquicia en expansión. Pendiente de aprobación de presupuesto para tercer local.',
    estado: 'Potencial',
    fuenteLead: 'Instagram',
    consentimientoRGPD: false,
    fechaConsentimiento: null,
    createdAt: '2026-05-10T14:45:00.000Z'
  },
  {
    id: 'cli_4',
    codigo: 'VER-000127',
    nombre: 'María',
    apellidos: 'López Fernández',
    empresa: 'Particular',
    nifCif: '12345678Z',
    telefono: '932112233',
    movil: '611445566',
    email: 'maria.lopez@gmail.com',
    direccion: 'Carrer de Mallorca 234, 2º 1ª',
    codigoPostal: '08008',
    ciudad: 'Barcelona',
    provincia: 'Barcelona',
    iban: 'ES3300811500078899001122',
    observaciones: 'Reforma integral de cocina finalizada con éxito. Muy satisfecha con los plazos.',
    estado: 'Inactivo',
    fuenteLead: 'Referido',
    consentimientoRGPD: true,
    fechaConsentimiento: '2026-03-05T17:20:00.000Z',
    createdAt: '2026-03-05T17:20:00.000Z'
  }
];

const INITIAL_OBRAS: Obra[] = [
  {
    id: 'obr_1',
    clientId: 'cli_1',
    codigo: 'OBR-2026-001',
    titulo: 'Reforma Oficinas Centrales',
    direccion: 'Polígono Industrial Fuente del Jarro, Calle 4, Paterna',
    importe: 125000,
    estado: 'En obra',
    tipoReforma: 'Integral',
    metrosCuadrados: 120,
    fechaInicioPrevista: '2026-02-01',
    fechaInicioReal: '2026-02-01',
    fechaFinPrevista: null,
    fechaFinReal: null
  },
  {
    id: 'obr_2',
    clientId: 'cli_1',
    codigo: 'OBR-2026-002',
    titulo: 'Habilitación de Almacén logístico',
    direccion: 'Sector 3, Parcela 12, Loriguilla',
    importe: 45000,
    estado: 'Presupuesto',
    tipoReforma: 'Otro',
    metrosCuadrados: 350,
    fechaInicioPrevista: '2026-07-15',
    fechaInicioReal: null,
    fechaFinPrevista: null,
    fechaFinReal: null
  },
  {
    id: 'obr_3',
    clientId: 'cli_2',
    codigo: 'OBR-2026-003',
    titulo: 'Adecuación Local Comercial de Modas',
    direccion: 'Calle Fuencarral 34, Madrid',
    importe: 68000,
    estado: 'Entregada',
    tipoReforma: 'Integral',
    metrosCuadrados: 85,
    fechaInicioPrevista: '2026-03-10',
    fechaInicioReal: '2026-03-10',
    fechaFinPrevista: null,
    fechaFinReal: null
  }
];

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

const INITIAL_DOCUMENTOS: Documento[] = [
  {
    id: 'doc_1',
    clientId: 'cli_1',
    nombre: 'Planos_Distribucion_Oficinas_V2.pdf',
    tipo: 'PDF',
    tamano: '3.4 MB',
    fechaSubida: '2026-01-18'
  },
  {
    id: 'doc_2',
    clientId: 'cli_1',
    nombre: 'Presupuesto_Firmado_Sello.pdf',
    tipo: 'PDF',
    tamano: '1.2 MB',
    fechaSubida: '2026-02-02'
  },
  {
    id: 'doc_3',
    clientId: 'cli_2',
    nombre: 'Fotografias_Estado_Previo_Fuencarral.zip',
    tipo: 'ZIP',
    tamano: '24.5 MB',
    fechaSubida: '2026-03-08'
  }
];

const INITIAL_NOTAS: Nota[] = [
  {
    id: 'not_1',
    clientId: 'cli_1',
    contenido: 'Reunión inicial con Alejandro. Tienen prisa por empezar la demolición para cumplir los plazos de traslado corporativo de su plantilla.',
    fechaCreacion: '2026-01-16T10:00:00.000Z',
    autor: 'Laura Domenech (Gestor de Proyectos)'
  },
  {
    id: 'not_2',
    clientId: 'cli_1',
    contenido: 'Solicitan incluir luminarias LED de bajo consumo y regulación de intensidad domótica en la sala de juntas principal.',
    fechaCreacion: '2026-01-22T16:45:00.000Z',
    autor: 'Laura Domenech (Gestor de Proyectos)'
  },
  {
    id: 'not_3',
    clientId: 'cli_3',
    contenido: 'Se ha enviado el proyecto técnico por email. Manuel comenta que lo revisará con su socio financiero antes del fin de semana.',
    fechaCreacion: '2026-05-19T09:12:00.000Z',
    autor: 'Carlos Ibáñez (Técnico)'
  }
];

const INITIAL_HISTORIAL: HistorialEntry[] = [
  {
    id: 'his_1',
    clientId: 'cli_1',
    accion: 'Creación de Cliente',
    detalle: 'El cliente fue registrado con código VER-000124 en el sistema Verini CRM.',
    fecha: '2026-01-15T09:30:00.000Z',
    usuario: 'Laura Domenech'
  },
  {
    id: 'his_2',
    clientId: 'cli_1',
    accion: 'Presupuesto Aceptado',
    detalle: 'Aprobación del presupuesto PRE-2026-001 (Fase I: Demolición y Tabiquería) por importe de 35.000 €.',
    fecha: '2026-01-20T12:00:00.000Z',
    usuario: 'Laura Domenech'
  },
  {
    id: 'his_3',
    clientId: 'cli_1',
    accion: 'Obra Iniciada',
    detalle: 'Se cambia el estado de la obra "Reforma Oficinas Centrales" a "En curso".',
    fecha: '2026-02-01T08:00:00.000Z',
    usuario: 'Sistema'
  },
  {
    id: 'his_4',
    clientId: 'cli_1',
    accion: 'Factura Emitida',
    detalle: 'Emitida factura FAC-2026-012 por valor de 42.350 € (con IVA).',
    fecha: '2026-02-15T10:15:00.000Z',
    usuario: 'Administración'
  },
  {
    id: 'his_5',
    clientId: 'cli_1',
    accion: 'Factura Cobrada',
    detalle: 'Confirmado el ingreso bancario correspondiente a la factura FAC-2026-012.',
    fecha: '2026-02-18T14:22:00.000Z',
    usuario: 'Administración'
  }
];

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [historial, setHistorial] = useState<HistorialEntry[]>([]);

  // Load from LocalStorage or seed defaults
  useEffect(() => {
    const storedClients = localStorage.getItem('verini_clients');
    const storedObras = localStorage.getItem('verini_obras');
    const storedPresupuestos = localStorage.getItem('verini_presupuestos');
    const storedFacturas = localStorage.getItem('verini_facturas');
    const storedDocumentos = localStorage.getItem('verini_documentos');
    const storedNotas = localStorage.getItem('verini_notas');
    const storedHistorial = localStorage.getItem('verini_historial');

    if (storedClients) setClients(JSON.parse(storedClients));
    else {
      localStorage.setItem('verini_clients', JSON.stringify(INITIAL_CLIENTS));
      setClients(INITIAL_CLIENTS);
    }

    if (storedObras) setObras(JSON.parse(storedObras));
    else {
      localStorage.setItem('verini_obras', JSON.stringify(INITIAL_OBRAS));
      setObras(INITIAL_OBRAS);
    }

    if (storedPresupuestos) setPresupuestos(JSON.parse(storedPresupuestos));
    else {
      localStorage.setItem('verini_presupuestos', JSON.stringify(INITIAL_PRESUPUESTOS));
      setPresupuestos(INITIAL_PRESUPUESTOS);
    }

    if (storedFacturas) setFacturas(JSON.parse(storedFacturas));
    else {
      localStorage.setItem('verini_facturas', JSON.stringify(INITIAL_FACTURAS));
      setFacturas(INITIAL_FACTURAS);
    }

    if (storedDocumentos) setDocumentos(JSON.parse(storedDocumentos));
    else {
      localStorage.setItem('verini_documentos', JSON.stringify(INITIAL_DOCUMENTOS));
      setDocumentos(INITIAL_DOCUMENTOS);
    }

    if (storedNotas) setNotas(JSON.parse(storedNotas));
    else {
      localStorage.setItem('verini_notas', JSON.stringify(INITIAL_NOTAS));
      setNotas(INITIAL_NOTAS);
    }

    if (storedHistorial) setHistorial(JSON.parse(storedHistorial));
    else {
      localStorage.setItem('verini_historial', JSON.stringify(INITIAL_HISTORIAL));
      setHistorial(INITIAL_HISTORIAL);
    }
  }, []);

  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Helper to generate the next unique VER-XXXXXX client code
  const generateClientCode = (currentClients: Client[]) => {
    const codes = currentClients.map(c => {
      const match = c.codigo.match(/VER-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxCodeNum = codes.length > 0 ? Math.max(...codes) : 123; // Start from 123 if empty
    const nextCodeNum = maxCodeNum + 1;
    return `VER-${nextCodeNum.toString().padStart(6, '0')}`;
  };

  const addClient = (newClientFields: Omit<Client, 'id' | 'codigo' | 'createdAt'>) => {
    const nextCode = generateClientCode(clients);
    const newClient: Client = {
      ...newClientFields,
      id: `cli_${Date.now()}`,
      codigo: nextCode,
      createdAt: new Date().toISOString()
    };

    const updated = [newClient, ...clients];
    setClients(updated);
    saveToStorage('verini_clients', updated);

    // Automatically log into history
    addHistorialEntry(newClient.id, 'Creación de Cliente', `El cliente fue registrado con código ${newClient.codigo}.`, 'Administrador');

    return newClient;
  };

  const updateClient = (id: string, updatedFields: Partial<Client>) => {
    const updated = clients.map(c => {
      if (c.id === id) {
        // Log changes
        const changedFields: string[] = [];
        Object.keys(updatedFields).forEach(k => {
          const key = k as keyof Client;
          if (c[key] !== updatedFields[key]) {
            changedFields.push(k);
          }
        });
        if (changedFields.length > 0) {
          addHistorialEntry(id, 'Actualización de Cliente', `Campos actualizados: ${changedFields.join(', ')}.`, 'Administrador');
        }
        return { ...c, ...updatedFields };
      }
      return c;
    });

    setClients(updated);
    saveToStorage('verini_clients', updated);
  };

  const deleteClient = (id: string) => {
    const target = clients.find(c => c.id === id);
    const updatedClients = clients.filter(c => c.id !== id);
    setClients(updatedClients);
    saveToStorage('verini_clients', updatedClients);

    // Cascade delete linked entities (optional but good CRM behavior, or keep them)
    // For simplicity, let's also clean them up or keep them in storage.
    // Let's filter related entities to avoid phantom references
    const updatedObras = obras.filter(o => o.clientId !== id);
    setObras(updatedObras);
    saveToStorage('verini_obras', updatedObras);

    const updatedPresupuestos = presupuestos.filter(p => p.clientId !== id);
    setPresupuestos(updatedPresupuestos);
    saveToStorage('verini_presupuestos', updatedPresupuestos);

    const updatedFacturas = facturas.filter(f => f.clientId !== id);
    setFacturas(updatedFacturas);
    saveToStorage('verini_facturas', updatedFacturas);

    const updatedDocs = documentos.filter(d => d.clientId !== id);
    setDocumentos(updatedDocs);
    saveToStorage('verini_documentos', updatedDocs);

    const updatedNotes = notas.filter(n => n.clientId !== id);
    setNotas(updatedNotes);
    saveToStorage('verini_notas', updatedNotes);

    const updatedHist = historial.filter(h => h.clientId !== id);
    setHistorial(updatedHist);
    saveToStorage('verini_historial', updatedHist);
  };

  const addObra = (clientId: string, obraFields: Omit<Obra, 'id' | 'codigo' | 'clientId'>) => {
    const nextIndex = obras.length + 1;
    const code = `OBR-2026-${nextIndex.toString().padStart(3, '0')}`;
    const newObra: Obra = {
      ...obraFields,
      id: `obr_${Date.now()}`,
      clientId,
      codigo: code
    };

    const updated = [...obras, newObra];
    setObras(updated);
    saveToStorage('verini_obras', updated);

    addHistorialEntry(clientId, 'Nueva Obra Creada', `Se registró la obra "${newObra.titulo}" con código ${newObra.codigo}.`, 'Gestor de Obras');
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
    saveToStorage('verini_presupuestos', updated);

    addHistorialEntry(clientId, 'Presupuesto Creado', `Se generó el presupuesto ${newPresupuesto.codigo}: "${newPresupuesto.titulo}" por ${newPresupuesto.importe.toLocaleString('es-ES')} €.`, 'Administración');
    
    // Also simulate creating an automatic invoice when a budget is ACCEPTED, just for completeness if they test
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
    saveToStorage('verini_facturas', updatedFacturas);
    addHistorialEntry(clientId, 'Factura Emitida', `Emitida de forma automática factura ${newFactura.codigo} por aceptación de presupuesto.`, 'Facturación Automática');
  };

  const addDocumento = (clientId: string, docFields: Omit<Documento, 'id' | 'fechaSubida' | 'clientId'>) => {
    const newDoc: Documento = {
      ...docFields,
      id: `doc_${Date.now()}`,
      clientId,
      fechaSubida: new Date().toISOString().split('T')[0]
    };

    const updated = [newDoc, ...documentos];
    setDocumentos(updated);
    saveToStorage('verini_documentos', updated);

    addHistorialEntry(clientId, 'Documento Subido', `Se subió el archivo "${newDoc.nombre}" (${newDoc.tamano}).`, 'Usuario');
  };

  const addNota = (clientId: string, contenido: string, autor: string) => {
    const newNota: Nota = {
      id: `not_${Date.now()}`,
      clientId,
      contenido,
      fechaCreacion: new Date().toISOString(),
      autor
    };

    const updated = [newNota, ...notas];
    setNotas(updated);
    saveToStorage('verini_notas', updated);

    addHistorialEntry(clientId, 'Nota Añadida', `Añadida nueva anotación por ${autor}.`, autor);
  };

  const addHistorialEntry = (clientId: string, accion: string, detalle: string, usuario: string) => {
    const newEntry: HistorialEntry = {
      id: `his_${Date.now()}`,
      clientId,
      accion,
      detalle,
      fecha: new Date().toISOString(),
      usuario
    };

    // We need to fetch and set historial, but since setHistorial runs asynchronously, we must handle updates correctly.
    setHistorial(prev => {
      const updated = [newEntry, ...prev];
      saveToStorage('verini_historial', updated);
      return updated;
    });
  };

  const updateObraStatus = (id: string, estado: Obra['estado']) => {
    const updated = obras.map(o => {
      if (o.id === id) {
        addHistorialEntry(o.clientId, 'Estado de Obra Actualizado', `La obra ${o.codigo} cambió su estado a "${estado}".`, 'Gestor de Obras');
        return { ...o, estado };
      }
      return o;
    });
    setObras(updated);
    saveToStorage('verini_obras', updated);
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
      saveToStorage('verini_presupuestos', updatedList);
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
    saveToStorage('verini_facturas', updated);
  };

  return {
    clients,
    obras,
    presupuestos,
    facturas,
    documentos,
    notas,
    historial,
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
