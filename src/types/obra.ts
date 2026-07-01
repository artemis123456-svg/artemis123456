export interface Obra {
  id: string;
  codigo: string;            // automático, patrón OBR-000045
  titulo: string;            // título/descripción de la obra
  clientId: string;          // vínculo al cliente (MISMO id que usa el módulo Clientes)
  tipoReforma: 'Cocina' | 'Baño' | 'Integral' | 'Otro';
  metrosCuadrados: number;
  direccion: string;         // dirección de la obra (independiente de la del cliente)
  fechaInicioPrevista: string | null;
  fechaInicioReal: string | null;
  fechaFinPrevista: string | null;
  fechaFinReal: string | null;
  estado: 'Presupuesto' | 'Aceptada' | 'En obra' | 'Entregada';  // fase del kanban
  importe: number;
}

export interface HoraObra {
  id: string;
  obraId: string;
  fecha: string;
  trabajador: string;
  horas: number;
  tarea: string;
}

