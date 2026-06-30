import { useState, useEffect } from 'react';
import { Proveedor, CompraProveedor, DocumentoProveedor, NotaProveedor } from '../types/proveedor';

const MOCK_PROVEEDORES: Proveedor[] = [
  {
    id: 'prv_1',
    codigo: 'PRV-000001',
    nombre: 'Porcelánicos Cerámica Levantina S.A.',
    tipo: 'Materiales',
    categoria: 'Azulejos y Pavimentos',
    nifCif: 'A46123456',
    personaContacto: 'Manuel Ortiz',
    telefono: '963456789',
    movil: '600111222',
    email: 'comercial@levantinaporcelanicos.com',
    direccion: 'Avenida del Mediterráneo 145',
    codigoPostal: '46025',
    ciudad: 'Valencia',
    provincia: 'Valencia',
    iban: 'ES2100491500021234567890',
    observaciones: 'Proveedor preferente para baldosas porcelánicas de gran formato. Ofrece descuento del 15% por volumen.',
    activo: true,
  },
  {
    id: 'prv_2',
    codigo: 'PRV-000002',
    nombre: 'Saneamientos y Griferías del Turia',
    tipo: 'Materiales',
    categoria: 'Sanitarios y Grifería',
    nifCif: 'B96987654',
    personaContacto: 'Sofía Jiménez',
    telefono: '961234567',
    movil: '611222333',
    email: 'info@saneamientosturia.es',
    direccion: 'Calle de los Metalúrgicos 42',
    codigoPostal: '46019',
    ciudad: 'Paterna',
    provincia: 'Valencia',
    iban: 'ES8900811234567890123456',
    observaciones: 'Plazos de entrega muy rápidos (24-48 horas si está en stock). Calidad media-alta.',
    activo: true,
  },
  {
    id: 'prv_3',
    codigo: 'PRV-000003',
    nombre: 'Sanz Instalaciones Eléctricas S.L.',
    tipo: 'Subcontrata',
    categoria: 'Electricidad',
    nifCif: 'B46555666',
    personaContacto: 'Javier Sanz',
    telefono: '962334455',
    movil: '622333444',
    email: 'instalaciones_sanz@hotmail.com',
    direccion: 'Calle Colón 15, Entresuelo',
    codigoPostal: '46002',
    ciudad: 'Valencia',
    provincia: 'Valencia',
    iban: 'ES4521000854321098765432',
    observaciones: 'Subcontrata habitual de confianza para boletines eléctricos y obras integrales complejas.',
    activo: true,
  },
  {
    id: 'prv_4',
    codigo: 'PRV-000004',
    nombre: 'Climatizaciones y Fontanería Domenech',
    tipo: 'Subcontrata',
    categoria: 'Fontanería y Climatización',
    nifCif: 'B97888777',
    personaContacto: 'Roberto Domenech',
    telefono: '964889900',
    movil: '633444555',
    email: 'contacto@domenechclima.com',
    direccion: 'Avenida Real de Madrid 88',
    codigoPostal: '46017',
    ciudad: 'Valencia',
    provincia: 'Valencia',
    iban: 'ES6230050012345678901234',
    observaciones: 'Especialistas en aerotermia, suelo radiante y conducciones de aire acondicionado.',
    activo: true,
  },
  {
    id: 'prv_5',
    codigo: 'PRV-000005',
    nombre: 'Maderas y Tableros Alboraya S.L.',
    tipo: 'Materiales',
    categoria: 'Carpintería de Madera',
    nifCif: 'A46999000',
    personaContacto: 'Andrés Albelda',
    telefono: '961556677',
    movil: '644555666',
    email: 'ventas@maderas-alboraya.com',
    direccion: 'Carretera de Tavernes Blanques s/n',
    codigoPostal: '46120',
    ciudad: 'Alboraya',
    provincia: 'Valencia',
    iban: 'ES1200750432109876543210',
    observaciones: 'Suministro de puertas de paso lacadas, rodapiés, tableros y parquet laminado de alta resistencia.',
    activo: true,
  },
  {
    id: 'prv_6',
    codigo: 'PRV-000006',
    nombre: 'Pinturas y Decoraciones Ruzafa',
    tipo: 'Subcontrata',
    categoria: 'Pintura y Revestimientos',
    nifCif: 'B46777111',
    personaContacto: 'Vicente Mestre',
    telefono: '963223344',
    movil: '655666777',
    email: 'v.mestre@pinturasruzafa.com',
    direccion: 'Calle Cuba 12',
    codigoPostal: '46006',
    ciudad: 'Valencia',
    provincia: 'Valencia',
    iban: 'ES3100305555444433332222',
    observaciones: 'Especialistas en papel pintado, alisado de gotelé y microcemento decorativo.',
    activo: false,
  }
];

const MOCK_COMPRAS: CompraProveedor[] = [
  {
    id: 'cmp_1',
    proveedorId: 'prv_1',
    codigo: 'COM-2026-0001',
    concepto: 'Azulejo Porcelánico Marfil 60x120 - Obra OBR-2026-001',
    importe: 3250.75,
    fecha: '2026-05-10',
    estado: 'Pagado',
  },
  {
    id: 'cmp_2',
    proveedorId: 'prv_1',
    codigo: 'COM-2026-0002',
    concepto: 'Revestimiento cerámico baño - Obra OBR-2026-003',
    importe: 1450.20,
    fecha: '2026-05-24',
    estado: 'Recibido',
  },
  {
    id: 'cmp_3',
    proveedorId: 'prv_2',
    codigo: 'COM-2026-0003',
    concepto: 'Inodoros suspendidos y grifería empotrada - Obra OBR-2026-001',
    importe: 2180.00,
    fecha: '2026-05-15',
    estado: 'Pagado',
  },
  {
    id: 'cmp_4',
    proveedorId: 'prv_3',
    codigo: 'COM-2026-0004',
    concepto: 'Fase I Instalación Eléctrica Local - Obra OBR-2026-003',
    importe: 4200.00,
    fecha: '2026-05-18',
    estado: 'Pendiente',
  },
  {
    id: 'cmp_5',
    proveedorId: 'prv_4',
    codigo: 'COM-2026-0005',
    concepto: 'Suministro e instalación Aerotermia Daikin - Obra OBR-2026-001',
    importe: 8900.00,
    fecha: '2026-05-20',
    estado: 'Recibido',
  },
];

const MOCK_DOCUMENTOS: DocumentoProveedor[] = [
  {
    id: 'doc_1',
    proveedorId: 'prv_1',
    nombre: 'Tarifa_Precios_Oficial_2026.pdf',
    tipo: 'PDF',
    fechaSubida: '2026-01-10',
    tamano: '3.4 MB',
  },
  {
    id: 'doc_2',
    proveedorId: 'prv_1',
    nombre: 'Certificado_Calidad_ISO9001.pdf',
    tipo: 'PDF',
    fechaSubida: '2026-01-15',
    tamano: '1.2 MB',
  },
  {
    id: 'doc_3',
    proveedorId: 'prv_3',
    nombre: 'Certificado_REBT_Registro_Industrial.pdf',
    tipo: 'PDF',
    fechaSubida: '2026-02-05',
    tamano: '2.1 MB',
  },
  {
    id: 'doc_4',
    proveedorId: 'prv_4',
    nombre: 'Seguro_Responsabilidad_Civil_2026.pdf',
    tipo: 'PDF',
    fechaSubida: '2026-02-28',
    tamano: '1.8 MB',
  }
];

const MOCK_NOTAS: NotaProveedor[] = [
  {
    id: 'not_1',
    proveedorId: 'prv_1',
    contenido: 'Negociado descuento adicional del 5% en la gama Premium para el segundo semestre del año.',
    autor: 'Laura Domenech',
    fecha: '2026-05-12T10:30:00Z',
  },
  {
    id: 'not_2',
    proveedorId: 'prv_3',
    contenido: 'Trabajan muy bien, respetan los planos y plazos, pero hay que supervisar el remate de las canaletas.',
    autor: 'Carlos Ibáñez',
    fecha: '2026-04-20T17:15:00Z',
  },
];

export function useProveedores() {
  const [proveedores, setProveedores] = useState<Proveedor[]>(() => {
    const saved = localStorage.getItem('verini_proveedores');
    return saved ? JSON.parse(saved) : MOCK_PROVEEDORES;
  });

  const [compras, setCompras] = useState<CompraProveedor[]>(() => {
    const saved = localStorage.getItem('verini_proveedores_compras');
    return saved ? JSON.parse(saved) : MOCK_COMPRAS;
  });

  const [documentos, setDocumentos] = useState<DocumentoProveedor[]>(() => {
    const saved = localStorage.getItem('verini_proveedores_documentos');
    return saved ? JSON.parse(saved) : MOCK_DOCUMENTOS;
  });

  const [notas, setNotas] = useState<NotaProveedor[]>(() => {
    const saved = localStorage.getItem('verini_proveedores_notas');
    return saved ? JSON.parse(saved) : MOCK_NOTAS;
  });

  useEffect(() => {
    localStorage.setItem('verini_proveedores', JSON.stringify(proveedores));
  }, [proveedores]);

  useEffect(() => {
    localStorage.setItem('verini_proveedores_compras', JSON.stringify(compras));
  }, [compras]);

  useEffect(() => {
    localStorage.setItem('verini_proveedores_documentos', JSON.stringify(documentos));
  }, [documentos]);

  useEffect(() => {
    localStorage.setItem('verini_proveedores_notas', JSON.stringify(notas));
  }, [notas]);

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

  const addProveedor = (prov: Omit<Proveedor, 'id' | 'codigo'>) => {
    const newProv: Proveedor = {
      ...prov,
      id: `prv_${Date.now()}`,
      codigo: generateNextCodigo()
    };
    setProveedores(prev => [newProv, ...prev]);
    return newProv;
  };

  const updateProveedor = (id: string, updatedFields: Partial<Proveedor>) => {
    setProveedores(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updatedFields } : p))
    );
  };

  const deleteProveedor = (id: string) => {
    setProveedores(prev => prev.filter(p => p.id !== id));
    setCompras(prev => prev.filter(c => c.proveedorId !== id));
    setDocumentos(prev => prev.filter(d => d.proveedorId !== id));
    setNotas(prev => prev.filter(n => n.proveedorId !== id));
  };

  const addCompra = (compraData: Omit<CompraProveedor, 'id' | 'codigo'>) => {
    const nextNum = compras.length + 1;
    const codigo = `COM-2026-${String(nextNum).padStart(4, '0')}`;
    const newCompra: CompraProveedor = {
      ...compraData,
      id: `cmp_${Date.now()}`,
      codigo
    };
    setCompras(prev => [newCompra, ...prev]);
    return newCompra;
  };

  const addDocumento = (docData: Omit<DocumentoProveedor, 'id'>) => {
    const newDoc: DocumentoProveedor = {
      ...docData,
      id: `doc_${Date.now()}`
    };
    setDocumentos(prev => [newDoc, ...prev]);
    return newDoc;
  };

  const deleteDocumento = (id: string) => {
    setDocumentos(prev => prev.filter(d => d.id !== id));
  };

  const addNota = (notaData: Omit<NotaProveedor, 'id'>) => {
    const newNota: NotaProveedor = {
      ...notaData,
      id: `not_${Date.now()}`
    };
    setNotas(prev => [newNota, ...prev]);
    return newNota;
  };

  const deleteNota = (id: string) => {
    setNotas(prev => prev.filter(n => n.id !== id));
  };

  const updateCompraStatus = (id: string, estado: CompraProveedor['estado']) => {
    setCompras(prev =>
      prev.map(c => (c.id === id ? { ...c, estado } : c))
    );
  };

  return {
    proveedores,
    compras,
    documentos,
    notas,
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
