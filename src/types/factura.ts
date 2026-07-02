export interface LineaFactura {
  id: string;
  tipo: 'producto' | 'libre';
  productoId: string | null;   // si tipo='producto', referencia al catálogo
  concepto: string;            // descripción de la línea
  cantidad: number;
  precioUnitario: number;
  ivaPorcentaje: 21 | 10 | 0;  // IVA configurable por línea
}

export interface Factura {
  id: string;
  numero: string;              // automático, patrón FAC-2026-0001
  clientId: string;            // cliente (MISMO id que módulo Clientes)
  obraId: string;              // obra (MISMO id que módulo Obras)
  fechaEmision: string;
  fechaVencimiento: string;
  lineas: LineaFactura[];
  estado: 'Borrador' | 'Emitida' | 'Cobrada' | 'Vencida';
  observaciones: string;
  entregadoGestoria?: boolean;
}
