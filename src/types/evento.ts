export interface Evento {
  id: string;
  titulo: string;
  tipo: 'Visita' | 'Reunión' | 'Llamada' | 'Inicio obra' | 'Otro';
  fechaInicio: string;      // ISO string
  fechaFin: string | null;  // ISO string
  todoElDia: boolean;
  clienteId: string | null;
  obraId: string | null;
  notas: string;
  completado: boolean;
  created_at?: string;
}

export interface EventoVirtual extends Evento {
  esAutomatico?: boolean;
}
