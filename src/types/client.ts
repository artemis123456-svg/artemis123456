export interface Client {
  id: string;
  codigo: string;
  nombre: string;
  apellidos: string;
  empresa: string;
  nifCif: string;
  telefono: string;
  movil: string;
  email: string;
  direccion: string;
  codigoPostal: string;
  ciudad: string;
  provincia: string;
  iban: string;
  observaciones: string;
  estado: 'Activo' | 'Inactivo' | 'Potencial';
  createdAt: string;
}

export interface Obra {
  id: string;
  clientId: string;
  codigo: string;
  titulo: string;
  direccion: string;
  presupuestoEstimado: number;
  estado: 'Planificación' | 'En curso' | 'Finalizada' | 'Pausada';
  fechaInicio: string;
}

export interface Presupuesto {
  id: string;
  clientId: string;
  codigo: string;
  obraId?: string;
  titulo: string;
  importe: number;
  estado: 'Borrador' | 'Enviado' | 'Aceptado' | 'Rechazado';
  fechaEmision: string;
}

export interface Factura {
  id: string;
  clientId: string;
  codigo: string;
  titulo: string;
  baseImponible: number;
  iva: number; // e.g. 21 for 21%
  total: number;
  estado: 'Borrador' | 'Emitida' | 'Cobrada' | 'Vencida';
  fechaEmision: string;
  fechaVencimiento: string;
}

export interface Documento {
  id: string;
  clientId: string;
  nombre: string;
  tipo: string;
  tamano: string;
  fechaSubida: string;
}

export interface Nota {
  id: string;
  clientId: string;
  contenido: string;
  fechaCreacion: string;
  autor: string;
}

export interface HistorialEntry {
  id: string;
  clientId: string;
  accion: string;
  detalle: string;
  fecha: string;
  usuario: string;
}
