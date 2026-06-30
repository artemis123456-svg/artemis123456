import { useState, useEffect } from 'react';
import { Factura, LineaFactura } from '../types/factura';

const MOCK_FACTURAS: Factura[] = [
  {
    id: 'fac_1',
    numero: 'FAC-2026-0001',
    clientId: 'cli_1',
    obraId: 'obr_1',
    fechaEmision: '2026-03-10',
    fechaVencimiento: '2026-04-10',
    estado: 'Cobrada',
    observaciones: 'Pago recibido por transferencia bancaria.',
    lineas: [
      {
        id: 'lin_1_1',
        tipo: 'producto',
        productoId: 'prd_1',
        concepto: 'Azulejo Porcelánico Calacatta Gold 60x120 cm',
        cantidad: 20,
        precioUnitario: 39.90,
        ivaPorcentaje: 21
      },
      {
        id: 'lin_1_2',
        tipo: 'producto',
        productoId: 'prd_5',
        concepto: 'Grifo Monomando Lavabo Negro Mate Velvet',
        cantidad: 2,
        precioUnitario: 74.90,
        ivaPorcentaje: 21
      },
      {
        id: 'lin_1_3',
        tipo: 'libre',
        productoId: null,
        concepto: 'Mano de obra colocación de azulejos y fontanería',
        cantidad: 15,
        precioUnitario: 25.00,
        ivaPorcentaje: 10
      }
    ]
  },
  {
    id: 'fac_2',
    numero: 'FAC-2026-0002',
    clientId: 'cli_2',
    obraId: 'obr_2',
    fechaEmision: '2026-05-15',
    fechaVencimiento: '2026-06-15',
    estado: 'Cobrada',
    observaciones: 'Factura correspondiente a la reforma del baño principal.',
    lineas: [
      {
        id: 'lin_2_1',
        tipo: 'producto',
        productoId: 'prd_2',
        concepto: 'Mampara de Ducha Frontal Corredera Aura 120cm',
        cantidad: 1,
        precioUnitario: 295.00,
        ivaPorcentaje: 21
      },
      {
        id: 'lin_2_2',
        tipo: 'producto',
        productoId: 'prd_4',
        concepto: 'Inodoro Suspendido Rimless Compacto Veneto',
        cantidad: 1,
        precioUnitario: 189.00,
        ivaPorcentaje: 21
      },
      {
        id: 'lin_2_3',
        tipo: 'libre',
        productoId: null,
        concepto: 'Montaje de mampara e inodoro',
        cantidad: 1,
        precioUnitario: 150.00,
        ivaPorcentaje: 10
      }
    ]
  },
  {
    id: 'fac_3',
    numero: 'FAC-2026-0003',
    clientId: 'cli_1',
    obraId: 'obr_5',
    fechaEmision: '2026-04-05',
    fechaVencimiento: '2026-05-05',
    estado: 'Emitida',
    observaciones: 'Trabajos de iluminación en salón y dormitorio.',
    lineas: [
      {
        id: 'lin_3_1',
        tipo: 'producto',
        productoId: 'prd_3',
        concepto: 'Tira LED COB 24V Cálida 3000K (5 metros)',
        cantidad: 4,
        precioUnitario: 28.50,
        ivaPorcentaje: 21
      },
      {
        id: 'lin_3_2',
        tipo: 'libre',
        productoId: null,
        concepto: 'Instalación de perfiles de aluminio e integración de iluminación LED',
        cantidad: 8,
        precioUnitario: 30.00,
        ivaPorcentaje: 21
      }
    ]
  },
  {
    id: 'fac_4',
    numero: 'FAC-2026-0004',
    clientId: 'cli_4',
    obraId: 'obr_4',
    fechaEmision: '2026-06-10',
    fechaVencimiento: '2026-07-10',
    estado: 'Emitida',
    observaciones: 'Materiales carpintería cocina.',
    lineas: [
      {
        id: 'lin_4_1',
        tipo: 'producto',
        productoId: 'prd_6',
        concepto: 'Tarima Flotante Laminada Roble Nórdico AC5 (Caja)',
        cantidad: 15,
        precioUnitario: 24.95,
        ivaPorcentaje: 21
      },
      {
        id: 'lin_4_2',
        tipo: 'libre',
        productoId: null,
        concepto: 'Rodapié blanco a juego',
        cantidad: 12,
        precioUnitario: 4.50,
        ivaPorcentaje: 21
      }
    ]
  },
  {
    id: 'fac_5',
    numero: 'FAC-2026-0005',
    clientId: 'cli_3',
    obraId: 'obr_3',
    fechaEmision: '2026-06-25',
    fechaVencimiento: '2026-07-25',
    estado: 'Borrador',
    observaciones: 'Borrador inicial para revisión del cliente.',
    lineas: [
      {
        id: 'lin_5_1',
        tipo: 'libre',
        productoId: null,
        concepto: 'Proyecto de interiorismo y renders 3D de local comercial',
        cantidad: 1,
        precioUnitario: 1200.00,
        ivaPorcentaje: 21
      },
      {
        id: 'lin_5_2',
        tipo: 'libre',
        productoId: null,
        concepto: 'Asesoría de materiales en showroom',
        cantidad: 1,
        precioUnitario: 350.00,
        ivaPorcentaje: 0
      }
    ]
  },
  {
    id: 'fac_6',
    numero: 'FAC-2026-0006',
    clientId: 'cli_1',
    obraId: 'obr_1',
    fechaEmision: '2026-01-10',
    fechaVencimiento: '2026-02-10',
    estado: 'Vencida',
    observaciones: 'Factura reclamada por email.',
    lineas: [
      {
        id: 'lin_6_1',
        tipo: 'libre',
        productoId: null,
        concepto: 'Demolición y retirada de escombros de cocina y baños',
        cantidad: 1,
        precioUnitario: 1800.00,
        ivaPorcentaje: 10
      }
    ]
  }
];

export interface FacturaTotals {
  baseImponible: number;
  totalIva: number;
  total: number;
  desgloseIva: {
    21: { base: number; cuota: number };
    10: { base: number; cuota: number };
    0: { base: number; cuota: number };
  };
}

export function calculateFacturaTotals(lineas: LineaFactura[]): FacturaTotals {
  const desgloseIva = {
    21: { base: 0, cuota: 0 },
    10: { base: 0, cuota: 0 },
    0: { base: 0, cuota: 0 },
  };

  let baseImponible = 0;

  lineas.forEach(linea => {
    const subtotal = linea.cantidad * linea.precioUnitario;
    baseImponible += subtotal;

    const pct = linea.ivaPorcentaje;
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

export function useFacturas() {
  const [facturas, setFacturas] = useState<Factura[]>(() => {
    const saved = localStorage.getItem('verini_facturas_custom');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return MOCK_FACTURAS;
      }
    }
    return MOCK_FACTURAS;
  });

  useEffect(() => {
    localStorage.setItem('verini_facturas_custom', JSON.stringify(facturas));
  }, [facturas]);

  // Generar código automático FAC-2026-XXXX
  const generateNextNumero = (): string => {
    const year = 2026;
    const prefix = `FAC-${year}-`;
    
    const numbers = facturas
      .filter(f => f.numero.startsWith(prefix))
      .map(f => {
        const parts = f.numero.split('-');
        const numPart = parts[parts.length - 1];
        return parseInt(numPart, 10);
      })
      .filter(num => !isNaN(num));

    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
    const nextNum = maxNum + 1;
    return `${prefix}${String(nextNum).padStart(4, '0')}`;
  };

  const addFactura = (facturaData: Omit<Factura, 'id' | 'numero'>) => {
    const newId = `fac_${Date.now()}`;
    const newFactura: Factura = {
      ...facturaData,
      id: newId,
      numero: generateNextNumero()
    };
    setFacturas(prev => [newFactura, ...prev]);
    return newFactura;
  };

  const updateFactura = (id: string, updatedFields: Partial<Factura>) => {
    setFacturas(prev =>
      prev.map(f => (f.id === id ? { ...f, ...updatedFields } : f))
    );
  };

  const deleteFactura = (id: string) => {
    setFacturas(prev => prev.filter(f => f.id !== id));
  };

  const changeFacturaEstado = (id: string, estado: Factura['estado']) => {
    setFacturas(prev =>
      prev.map(f => (f.id === id ? { ...f, estado } : f))
    );
  };

  return {
    facturas,
    addFactura,
    updateFactura,
    deleteFactura,
    changeFacturaEstado,
    generateNextNumero,
    calculateTotals: calculateFacturaTotals
  };
}
