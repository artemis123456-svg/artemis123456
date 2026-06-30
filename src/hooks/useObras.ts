import { useState, useEffect } from 'react';
import { Obra } from '../types/obra';

const INITIAL_OBRAS: Obra[] = [
  {
    id: 'obr_1',
    codigo: 'OBR-000001',
    titulo: 'Reforma Cocina y Baños',
    clientId: 'cli_1',
    tipoReforma: 'Integral',
    metrosCuadrados: 85,
    direccion: 'Avenida de Aragón 14, Valencia',
    fechaInicioPrevista: '2026-02-15',
    fechaInicioReal: '2026-02-18',
    fechaFinPrevista: '2026-04-15',
    fechaFinReal: '2026-04-20',
    estado: 'En obra',
    importe: 38500
  },
  {
    id: 'obr_2',
    codigo: 'OBR-000002',
    titulo: 'Reforma Baño Principal',
    clientId: 'cli_2',
    tipoReforma: 'Baño',
    metrosCuadrados: 12,
    direccion: 'Calle Serrano 56, Madrid',
    fechaInicioPrevista: '2026-05-10',
    fechaInicioReal: '2026-05-12',
    fechaFinPrevista: '2026-05-30',
    fechaFinReal: '2026-05-28',
    estado: 'Entregada',
    importe: 9200
  },
  {
    id: 'obr_3',
    codigo: 'OBR-000003',
    titulo: 'Reforma Local Comercial',
    clientId: 'cli_3',
    tipoReforma: 'Integral',
    metrosCuadrados: 150,
    direccion: 'Avenida de la Constitución 12, Sevilla',
    fechaInicioPrevista: '2026-07-01',
    fechaInicioReal: null,
    fechaFinPrevista: '2026-09-15',
    fechaFinReal: null,
    estado: 'Presupuesto',
    importe: 75000
  },
  {
    id: 'obr_4',
    codigo: 'OBR-000004',
    titulo: 'Reforma Cocina Diseño',
    clientId: 'cli_4',
    tipoReforma: 'Cocina',
    metrosCuadrados: 25,
    direccion: 'Calle Balmes 45, Barcelona',
    fechaInicioPrevista: '2026-06-01',
    fechaInicioReal: '2026-06-03',
    fechaFinPrevista: '2026-06-25',
    fechaFinReal: null,
    estado: 'En obra',
    importe: 18000
  },
  {
    id: 'obr_5',
    codigo: 'OBR-000005',
    titulo: 'Interiorismo Salón y Dormitorio',
    clientId: 'cli_1',
    tipoReforma: 'Otro',
    metrosCuadrados: 45,
    direccion: 'Paseo de la Alameda 8, Valencia',
    fechaInicioPrevista: '2026-04-01',
    fechaInicioReal: '2026-04-02',
    fechaFinPrevista: '2026-04-20',
    fechaFinReal: '2026-04-18',
    estado: 'Aceptada',
    importe: 12500
  }
];

export function useObras() {
  const [obras, setObras] = useState<Obra[]>([]);

  useEffect(() => {
    const storedObras = localStorage.getItem('verini_obras_v2');
    if (storedObras) {
      try {
        setObras(JSON.parse(storedObras));
      } catch (e) {
        setObras(INITIAL_OBRAS);
      }
    } else {
      // Check if there was old Obras from the original app and migrate them or use our INITIAL_OBRAS
      const oldObras = localStorage.getItem('verini_obras');
      if (oldObras) {
        try {
          const parsed = JSON.parse(oldObras);
          // If they match the old type, we map them, otherwise we just use INITIAL_OBRAS
          if (parsed.length > 0 && parsed[0].presupuestoEstimado !== undefined) {
            const migrated: Obra[] = parsed.map((o: any, idx: number) => ({
              id: o.id || `obr_${Date.now()}_${idx}`,
              codigo: `OBR-${String(idx + 1).padStart(6, '0')}`,
              titulo: o.titulo || 'Obra Sin Título',
              clientId: o.clientId || 'cli_1',
              tipoReforma: 'Integral',
              metrosCuadrados: 90,
              direccion: o.direccion || 'Dirección de obra',
              fechaInicioPrevista: o.fechaInicio || '2026-01-01',
              fechaInicioReal: o.fechaInicio || '2026-01-01',
              fechaFinPrevista: null,
              fechaFinReal: null,
              estado: o.estado === 'En curso' ? 'En obra' : 'Presupuesto',
              importe: o.presupuestoEstimado || 0,
            }));
            localStorage.setItem('verini_obras_v2', JSON.stringify(migrated));
            setObras(migrated);
            return;
          }
        } catch (err) {
          // ignore error
        }
      }
      
      localStorage.setItem('verini_obras_v2', JSON.stringify(INITIAL_OBRAS));
      setObras(INITIAL_OBRAS);
    }
  }, []);

  const saveToStorage = (updatedObras: Obra[]) => {
    setObras(updatedObras);
    localStorage.setItem('verini_obras_v2', JSON.stringify(updatedObras));
    // Also save a fallback for any other files reading the old key
    localStorage.setItem('verini_obras', JSON.stringify(updatedObras.map(o => ({
      id: o.id,
      clientId: o.clientId,
      codigo: o.codigo,
      titulo: o.titulo,
      direccion: o.direccion,
      presupuestoEstimado: o.importe,
      estado: o.estado === 'En obra' ? 'En curso' : o.estado === 'Presupuesto' ? 'Planificación' : 'Finalizada',
      fechaInicio: o.fechaInicioPrevista || ''
    }))));
  };

  // Generate next OBR-XXXXXX code
  const generateObraCode = (currentObras: Obra[]): string => {
    const numbers = currentObras.map(o => {
      const match = o.codigo.match(/OBR-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
    const nextNumber = maxNumber + 1;
    return `OBR-${nextNumber.toString().padStart(6, '0')}`;
  };

  // Create an Obra
  const addObra = (obraFields: Omit<Obra, 'id' | 'codigo'>) => {
    const code = generateObraCode(obras);
    const newObra: Obra = {
      ...obraFields,
      id: `obr_${Date.now()}`,
      codigo: code
    };

    const updated = [...obras, newObra];
    saveToStorage(updated);
    return newObra;
  };

  // Edit an Obra
  const updateObra = (id: string, updatedFields: Partial<Obra>) => {
    const updated = obras.map(o => {
      if (o.id === id) {
        return { ...o, ...updatedFields };
      }
      return o;
    });
    saveToStorage(updated);
  };

  // Change Obra Kanban Phase
  const updateObraStatus = (id: string, estado: Obra['estado']) => {
    const updated = obras.map(o => {
      if (o.id === id) {
        let actualDates = {};
        if (estado === 'En obra' && !o.fechaInicioReal) {
          actualDates = { fechaInicioReal: new Date().toISOString().split('T')[0] };
        }
        if (estado === 'Entregada' && !o.fechaFinReal) {
          actualDates = { fechaFinReal: new Date().toISOString().split('T')[0] };
        }
        return { ...o, estado, ...actualDates };
      }
      return o;
    });
    saveToStorage(updated);
  };

  // Delete an Obra
  const deleteObra = (id: string) => {
    const updated = obras.filter(o => o.id !== id);
    saveToStorage(updated);
  };

  return {
    obras,
    addObra,
    updateObra,
    updateObraStatus,
    deleteObra,
    generateObraCode: () => generateObraCode(obras)
  };
}
