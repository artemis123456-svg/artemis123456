export interface LineaFacturaProveedor {
  id: string;
  facturaProveedorId: string;
  tipo: 'producto' | 'libre';
  productoId: string | null;
  concepto: string;
  cantidad: number;
  precioUnitario: number;
  ivaPorcentaje: 21 | 10 | 0;
  obraId: string | null;      // obra a la que se imputa esta línea (puede ser null)
  orden: number;
}

export interface FacturaProveedor {
  id: string;
  numero: string;             // número real de la factura del proveedor (manual)
  proveedorId: string;
  fechaEmision: string;
  fechaVencimiento: string;
  estado: 'Pendiente' | 'Pagada' | 'Vencida';
  retencionIrpf: number;      // % IRPF (ej. 15)
  observaciones: string;
  entregadoGestoria?: boolean;
  lineas: LineaFacturaProveedor[];
}
