import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { DatosEmpresa } from '../types/datosEmpresa';

function datosEmpresaFromRow(row: any): DatosEmpresa {
  return {
    nombreFiscal: row?.nombre_fiscal || '',
    nif: row?.nif || '',
    direccion: row?.direccion || '',
    codigoPostal: row?.codigo_postal || '',
    ciudad: row?.ciudad || '',
    provincia: row?.provincia || '',
    telefono: row?.telefono || '',
    email: row?.email || '',
    iban: row?.iban || '',
  };
}

function datosEmpresaToRow(d: DatosEmpresa): any {
  return {
    id: 'empresa',
    nombre_fiscal: d.nombreFiscal,
    nif: d.nif,
    direccion: d.direccion,
    codigo_postal: d.codigoPostal,
    ciudad: d.ciudad,
    provincia: d.provincia,
    telefono: d.telefono,
    email: d.email,
    iban: d.iban,
    updated_at: new Date().toISOString()
  };
}

export function useDatosEmpresa() {
  const [datos, setDatos] = useState<DatosEmpresa>({
    nombreFiscal: '',
    nif: '',
    direccion: '',
    codigoPostal: '',
    ciudad: '',
    provincia: '',
    telefono: '',
    email: '',
    iban: '',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDatos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('datos_empresa')
        .select('*')
        .eq('id', 'empresa');

      if (err) {
        throw err;
      }

      if (data && data.length > 0) {
        setDatos(datosEmpresaFromRow(data[0]));
      }
    } catch (err: any) {
      console.error('Error fetching company data:', err);
      setError(err.message || 'Error al cargar los datos de la empresa');
    } finally {
      setLoading(false);
    }
  }, []);

  const guardarDatosEmpresa = async (nuevosDatos: DatosEmpresa) => {
    try {
      setLoading(true);
      setError(null);
      
      const row = datosEmpresaToRow(nuevosDatos);
      
      const { error: err } = await supabase
        .from('datos_empresa')
        .upsert(row);

      if (err) throw err;

      setDatos(nuevosDatos);
      return true;
    } catch (err: any) {
      console.error('Error saving company data:', err);
      setError(err.message || 'Error al guardar los datos de la empresa');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, [fetchDatos]);

  return {
    datos,
    loading,
    error,
    guardarDatosEmpresa,
    refetch: fetchDatos
  };
}
