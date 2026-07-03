export interface LineaPresupuesto {
  id: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
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
  estado: 'Borrador' | 'Enviado' | 'Aprobado' | 'Rechazado';
  lineas: LineaPresupuesto[];
}

export interface PresupuestoTotals {
  baseImponible: number;
  totalIva: number;
  total: number;
}

export function calculatePresupuestoTotals(lineas: LineaPresupuesto[]): PresupuestoTotals {
  let baseImponible = 0;
  lineas.forEach(l => {
    baseImponible += l.cantidad * l.precioUnitario;
  });
  // Presupuestos standard assume 21% IVA
  const totalIva = baseImponible * 0.21;
  const total = baseImponible + totalIva;

  return {
    baseImponible: Number(baseImponible.toFixed(2)),
    totalIva: Number(totalIva.toFixed(2)),
    total: Number(total.toFixed(2))
  };
}
