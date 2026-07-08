export interface ContactoProveedor {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  puesto: 'Comercial' | 'Administración' | 'Logística' | 'Otro' | string;
}

export interface Proveedor {
  id: string;
  codigo: string;            // automático, patrón PRV-000001
  nombre: string;            // nombre comercial / razón social
  tipo: 'Materiales' | 'Subcontrata';
  categoria: string;         // ej: "Azulejos", "Fontanería", "Iluminación", "Electricidad"
  nifCif: string;
  personaContacto: string;
  contactos?: ContactoProveedor[];
  telefono: string;
  movil: string;
  email: string;
  direccion: string;
  codigoPostal: string;
  ciudad: string;
  provincia: string;
  iban: string;
  observaciones: string;
  activo: boolean;           // proveedor activo / inactivo
}

export interface CompraProveedor {
  id: string;
  proveedorId: string;
  codigo: string;            // ej: COM-2026-0001
  concepto: string;
  importe: number;
  fecha: string;
  estado: 'Pendiente' | 'Recibido' | 'Pagado';
}

export interface DocumentoProveedor {
  id: string;
  proveedorId: string;
  nombre: string;
  tipo: string;              // PDF, JPEG, PNG, etc.
  fechaSubida: string;
  tamano?: string;
}

export interface NotaProveedor {
  id: string;
  proveedorId: string;
  contenido: string;
  autor: string;
  fecha: string;
}
