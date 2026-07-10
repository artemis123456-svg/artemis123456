export interface MaterialEscogido {
  id: string;
  obraId: string;
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  pedidoRealizado: boolean;
  fechaPedido: string | null;
  recibido: boolean;
  fechaRecibido: string | null;
}
