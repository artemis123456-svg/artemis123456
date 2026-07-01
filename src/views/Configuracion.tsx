import React, { useState, useEffect } from 'react';
import { useDatosEmpresa } from '../hooks/useDatosEmpresa';
import { DatosEmpresa } from '../types/datosEmpresa';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Settings, 
  Building2, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  CreditCard, 
  Phone, 
  Mail, 
  MapPin, 
  User,
  Loader2
} from 'lucide-react';

export default function Configuracion() {
  const { datos, loading, error, guardarDatosEmpresa } = useDatosEmpresa();
  const [formState, setFormState] = useState<DatosEmpresa>({
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
  
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Synchronize local state when Supabase completes loading
  useEffect(() => {
    if (datos) {
      setFormState(datos);
    }
  }, [datos]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    try {
      await guardarDatosEmpresa(formState);
      setSaveSuccess(true);
      // Automatically hide the success banner after 4 seconds
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setSaveError(err.message || 'Error al guardar los datos de la empresa');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && !isSaving) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <div className="text-center space-y-2 animate-pulse">
          <Loader2 className="h-8 w-8 text-slate-400 mx-auto animate-spin" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-1 sm:p-2">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-verini-black flex items-center justify-center text-white">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Configuración
              </h1>
              <p className="text-xs text-slate-500">Datos fiscales de la empresa emisora de las facturas.</p>
            </div>
          </div>
        </div>
      </div>

      {/* NOTA INFORMATIVA */}
      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-3">
        <Info className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 leading-normal">
          <span className="font-extrabold text-slate-800 block uppercase tracking-wide text-[10px]">Importante para la Facturación</span>
          <p>
            Los datos especificados en este formulario se guardarán en Supabase y se utilizarán de manera automática como los <span className="font-semibold text-slate-800">Datos del Emisor</span> en todas las fichas e impresiones de facturas emitidas a clientes.
          </p>
        </div>
      </div>

      {/* MAIN FORM CARD */}
      <Card className="border-slate-150 shadow-sm bg-white overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* GRUPO 1: DATOS FISCALES BÁSICOS */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Building2 className="h-4 w-4 text-slate-400" />
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Datos Fiscales Básicos</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label htmlFor="nombreFiscal" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Nombre Fiscal / Comercial
                  </label>
                  <input
                    type="text"
                    id="nombreFiscal"
                    name="nombreFiscal"
                    value={formState.nombreFiscal}
                    onChange={handleChange}
                    placeholder="Verini Espai Creatiu"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-verini-black focus:bg-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="nif" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    NIF / CIF
                  </label>
                  <input
                    type="text"
                    id="nif"
                    name="nif"
                    value={formState.nif}
                    onChange={handleChange}
                    placeholder="B12345678"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-verini-black focus:bg-white"
                    required
                  />
                </div>
              </div>
            </div>

            {/* GRUPO 2: DIRECCIÓN FISCAL */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <MapPin className="h-4 w-4 text-slate-400" />
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Dirección de Facturación</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-4 space-y-1">
                  <label htmlFor="direccion" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Dirección (Calle, Número, Piso)
                  </label>
                  <input
                    type="text"
                    id="direccion"
                    name="direccion"
                    value={formState.direccion}
                    onChange={handleChange}
                    placeholder="Calle Mayor 12, Bajo"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-verini-black focus:bg-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="codigoPostal" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Código Postal
                  </label>
                  <input
                    type="text"
                    id="codigoPostal"
                    name="codigoPostal"
                    value={formState.codigoPostal}
                    onChange={handleChange}
                    placeholder="46001"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-verini-black focus:bg-white"
                    required
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label htmlFor="ciudad" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Localidad / Ciudad
                  </label>
                  <input
                    type="text"
                    id="ciudad"
                    name="ciudad"
                    value={formState.ciudad}
                    onChange={handleChange}
                    placeholder="Valencia"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-verini-black focus:bg-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="provincia" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Provincia
                  </label>
                  <input
                    type="text"
                    id="provincia"
                    name="provincia"
                    value={formState.provincia}
                    onChange={handleChange}
                    placeholder="Valencia"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-verini-black focus:bg-white"
                    required
                  />
                </div>
              </div>
            </div>

            {/* GRUPO 3: INFORMACIÓN DE CONTACTO */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Mail className="h-4 w-4 text-slate-400" />
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Información de Contacto</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="telefono" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    id="telefono"
                    name="telefono"
                    value={formState.telefono}
                    onChange={handleChange}
                    placeholder="+34 600 000 000"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-verini-black focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="email" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formState.email}
                    onChange={handleChange}
                    placeholder="administracion@verini.es"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-verini-black focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* GRUPO 4: DATOS DE PAGO / TRANSFERENCIA */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <CreditCard className="h-4 w-4 text-slate-400" />
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Datos Bancarios (Para cobros de facturas)</h3>
              </div>
              
              <div className="space-y-1">
                <label htmlFor="iban" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Número de cuenta (IBAN completo)
                </label>
                <input
                  type="text"
                  id="iban"
                  name="iban"
                  value={formState.iban}
                  onChange={handleChange}
                  placeholder="ES21 0000 0000 0000 0000 0000"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-verini-black focus:bg-white font-mono"
                />
              </div>
            </div>

            {/* ERROR & SUCCESS FEEDBACK BANNERS */}
            {saveSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800 text-xs font-semibold">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Datos guardados correctamente</span>
              </div>
            )}

            {saveError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-red-800 text-xs font-semibold">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            {error && !saveError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-red-800 text-xs font-semibold">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* ACTION SUBMIT BUTTON */}
            <div className="flex items-center justify-end pt-4 border-t border-slate-100">
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-verini-black hover:bg-black/95 text-white font-bold text-xs h-10 px-5 rounded-lg flex items-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Guardar cambios</span>
                  </>
                )}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>

    </div>
  );
}
