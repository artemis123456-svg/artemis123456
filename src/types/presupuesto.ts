export interface LineaPresupuesto {
  id: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  ivaPorcentaje?: 21 | 10 | 0;  // Added for task 2
  tipo?: 'producto' | 'libre';  // Added for task 4
  productoId?: string;          // Added for task 4
  referenciaProducto?: string;  // Added for task 4
  fotoUrl?: string;             // Added for task 4
  unidad?: 'PA' | 'Ud' | 'M2' | 'ML';
}

export interface PresupuestoNew {
  id: string;
  clientId: string;
  obraId: string | null;
  numero: string;
  fechaCreacion: string;
  fechaValidez: string | null;
  descripcion: string;
  importeTotal: number;
  estado: 'Borrador' | 'Enviado' | 'Aprobado' | 'Aceptado' | 'Rechazado'; // Added 'Aceptado'
  lineas: LineaPresupuesto[];
}

export interface PresupuestoTotals {
  baseImponible: number;
  totalIva: number;
  total: number;
  desgloseIva: {
    21: { base: number; cuota: number };
    10: { base: number; cuota: number };
    0: { base: number; cuota: number };
  };
}

export function calculatePresupuestoTotals(lineas: LineaPresupuesto[]): PresupuestoTotals {
  const desgloseIva = {
    21: { base: 0, cuota: 0 },
    10: { base: 0, cuota: 0 },
    0: { base: 0, cuota: 0 },
  };
  
  let baseImponible = 0;
  
  lineas.forEach(linea => {
    const subtotal = linea.cantidad * linea.precioUnitario;
    baseImponible += subtotal;
    
    const pct = linea.ivaPorcentaje ?? 21;
    if (pct === 21 || pct === 10 || pct === 0) {
      desgloseIva[pct].base += subtotal;
      desgloseIva[pct].cuota += subtotal * (pct / 100);
    }
  });
  
  const totalIva = desgloseIva[21].cuota + desgloseIva[10].cuota + desgloseIva[0].cuota;
  const total = baseImponible + totalIva;
  
  return {
    baseImponible: Number(baseImponible.toFixed(2)),
    totalIva: Number(totalIva.toFixed(2)),
    total: Number(total.toFixed(2)),
    desgloseIva: {
      21: { base: Number(desgloseIva[21].base.toFixed(2)), cuota: Number(desgloseIva[21].cuota.toFixed(2)) },
      10: { base: Number(desgloseIva[10].base.toFixed(2)), cuota: Number(desgloseIva[10].cuota.toFixed(2)) },
      0: { base: Number(desgloseIva[0].base.toFixed(2)), cuota: Number(desgloseIva[0].cuota.toFixed(2)) },
    }
  };
}
