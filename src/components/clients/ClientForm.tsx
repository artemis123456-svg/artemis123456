import React, { useState, useEffect } from 'react';
import { Client } from '../../types/client';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/card';
import { User, Building, Phone, Mail, MapPin, Landmark, FileText, ArrowLeft, Save } from 'lucide-react';

interface ClientFormProps {
  clientToEdit?: Client | null;
  onSave: (clientData: any) => void;
  onCancel: () => void;
}

export default function ClientForm({ clientToEdit, onSave, onCancel }: ClientFormProps) {
  // State for form fields
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [nifCif, setNifCif] = useState('');
  const [telefono, setTelefono] = useState('');
  const [movil, setMovil] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [provincia, setProvincia] = useState('');
  const [iban, setIban] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [estado, setEstado] = useState<'Activo' | 'Inactivo' | 'Potencial'>('Activo');

  // Load client data if editing
  useEffect(() => {
    if (clientToEdit) {
      setNombre(clientToEdit.nombre || '');
      setApellidos(clientToEdit.apellidos || '');
      setEmpresa(clientToEdit.empresa || '');
      setNifCif(clientToEdit.nifCif || '');
      setTelefono(clientToEdit.telefono || '');
      setMovil(clientToEdit.movil || '');
      setEmail(clientToEdit.email || '');
      setDireccion(clientToEdit.direccion || '');
      setCodigoPostal(clientToEdit.codigoPostal || '');
      setCiudad(clientToEdit.ciudad || '');
      setProvincia(clientToEdit.provincia || '');
      setIban(clientToEdit.iban || '');
      setObservaciones(clientToEdit.observaciones || '');
      setEstado(clientToEdit.estado || 'Activo');
    } else {
      // Reset form
      setNombre('');
      setApellidos('');
      setEmpresa('');
      setNifCif('');
      setTelefono('');
      setMovil('');
      setEmail('');
      setDireccion('');
      setCodigoPostal('');
      setCiudad('');
      setProvincia('');
      setIban('');
      setObservaciones('');
      setEstado('Activo');
    }
  }, [clientToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !apellidos.trim()) {
      alert('Por favor, complete los campos obligatorios (Nombre y Apellidos).');
      return;
    }

    const clientData = {
      nombre: nombre.trim(),
      apellidos: apellidos.trim(),
      empresa: empresa.trim() || 'Particular',
      nifCif: nifCif.trim().toUpperCase(),
      telefono: telefono.trim(),
      movil: movil.trim(),
      email: email.trim().toLowerCase(),
      direccion: direccion.trim(),
      codigoPostal: codigoPostal.trim(),
      ciudad: ciudad.trim(),
      provincia: provincia.trim(),
      iban: iban.trim().toUpperCase().replace(/\s+/g, ''),
      observaciones: observaciones.trim(),
      estado
    };

    onSave(clientData);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Back Button */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-slate-500 hover:text-slate-900 gap-1.5 h-8 text-xs px-2.5 rounded-lg border border-slate-200 bg-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main Card */}
        <Card className="border border-slate-150 shadow-sm bg-white rounded-xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
            <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-indigo-600" />
              {clientToEdit 
                ? `Editar Ficha de Cliente - ${clientToEdit.codigo}` 
                : 'Formulario de Alta - Nuevo Cliente'}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {/* Section 1: Identificación */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 border-b border-slate-100 pb-1 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                Datos de Identificación
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    placeholder="ej. Alejandro"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">
                    Apellidos <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    placeholder="ej. Sanz Torres"
                    value={apellidos}
                    onChange={(e) => setApellidos(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">
                    Estado del Cliente
                  </label>
                  <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value as any)}
                    className="w-full text-xs h-9 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Potencial">Potencial</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">
                    Empresa (dejar vacío si es Particular)
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="ej. Construcciones Levantinas S.L."
                      value={empresa}
                      onChange={(e) => setEmpresa(e.target.value)}
                      className="pl-9 text-xs h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">
                    NIF / CIF / NIE
                  </label>
                  <Input
                    placeholder="ej. B98765432"
                    value={nifCif}
                    onChange={(e) => setNifCif(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Contacto */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 border-b border-slate-100 pb-1 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                Información de Contacto
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Teléfono Fijo</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="ej. 963456789"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      className="pl-9 text-xs h-9 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Móvil</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="ej. 600123456"
                      value={movil}
                      onChange={(e) => setMovil(e.target.value)}
                      className="pl-9 text-xs h-9 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      type="email"
                      placeholder="ej. contacto@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 text-xs h-9 font-sans"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Dirección y Datos Financieros */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 border-b border-slate-100 pb-1 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                Ubicación y Facturación
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Dirección Completa</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Calle, avenida, plaza, número, piso..."
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      className="pl-9 text-xs h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Código Postal</label>
                  <Input
                    placeholder="ej. 46021"
                    value={codigoPostal}
                    onChange={(e) => setCodigoPostal(e.target.value)}
                    className="text-xs h-9 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Ciudad</label>
                  <Input
                    placeholder="ej. Valencia"
                    value={ciudad}
                    onChange={(e) => setCiudad(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Provincia</label>
                  <Input
                    placeholder="ej. Valencia"
                    value={provincia}
                    onChange={(e) => setProvincia(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>

                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <Landmark className="h-3.5 w-3.5 text-slate-400" />
                    Cuenta Bancaria (IBAN)
                  </label>
                  <Input
                    placeholder="ej. ES21 0049 1500 0512 3456 7890"
                    value={iban}
                    onChange={(e) => setIban(e.target.value)}
                    className="text-xs h-9 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Observaciones */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 border-b border-slate-100 pb-1 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Observaciones Adicionales
              </h3>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Anotaciones internas o detalles comerciales</label>
                <textarea
                  placeholder="Detalles sobre facturación, horarios de atención, preferencias, etc..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={4}
                  className="w-full text-xs rounded-lg border border-slate-200 bg-white p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buttons Bar */}
        <div className="flex items-center justify-end gap-2.5 bg-slate-50 border border-slate-150 p-4 rounded-xl shadow-sm">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="text-xs font-medium text-slate-600 border border-slate-200 bg-white hover:bg-slate-100 rounded-lg h-9 px-4 transition-all"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-indigo-600/10 h-9 px-4 gap-1.5 transition-all"
          >
            <Save className="h-4 w-4" />
            Guardar Ficha
          </Button>
        </div>
      </form>
    </div>
  );
}
