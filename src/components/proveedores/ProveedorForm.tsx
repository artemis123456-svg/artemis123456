import React, { useState, useEffect } from 'react';
import { Proveedor } from '../../types/proveedor';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { User, Phone, Mail, MapPin, Landmark, FileText, ArrowLeft, Save, Truck, Briefcase } from 'lucide-react';

interface ProveedorFormProps {
  proveedorToEdit?: Proveedor | null;
  onSave: (proveedorData: any) => void;
  onCancel: () => void;
}

export default function ProveedorForm({ proveedorToEdit, onSave, onCancel }: ProveedorFormProps) {
  // State for form fields
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<'Materiales' | 'Subcontrata'>('Materiales');
  const [categoria, setCategoria] = useState('');
  const [nifCif, setNifCif] = useState('');
  const [personaContacto, setPersonaContacto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [movil, setMovil] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [provincia, setProvincia] = useState('');
  const [iban, setIban] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [activo, setActivo] = useState(true);

  // Suggested categories lists depending on type
  const materialCategories = ['Azulejos y Pavimentos', 'Sanitarios y Grifería', 'Iluminación y Electricidad', 'Carpintería de Madera', 'Pintura y Revestimientos', 'Mármoles y Encimeras', 'Electrodomésticos', 'Climatización y Ventilación', 'Perfilería y Vidrios'];
  const subcontrataCategories = ['Albañilería', 'Fontanería', 'Electricidad', 'Pintura', 'Carpintería de Aluminio/PVC', 'Carpintería de Madera (Montaje)', 'Pladur y Techos', 'Aire Acondicionado', 'Limpieza de Obra', 'Demoliciones'];

  // Load provider data if editing
  useEffect(() => {
    if (proveedorToEdit) {
      setNombre(proveedorToEdit.nombre || '');
      setTipo(proveedorToEdit.tipo || 'Materiales');
      setCategoria(proveedorToEdit.categoria || '');
      setNifCif(proveedorToEdit.nifCif || '');
      setPersonaContacto(proveedorToEdit.personaContacto || '');
      setTelefono(proveedorToEdit.telefono || '');
      setMovil(proveedorToEdit.movil || '');
      setEmail(proveedorToEdit.email || '');
      setDireccion(proveedorToEdit.direccion || '');
      setCodigoPostal(proveedorToEdit.codigoPostal || '');
      setCiudad(proveedorToEdit.ciudad || '');
      setProvincia(proveedorToEdit.provincia || '');
      setIban(proveedorToEdit.iban || '');
      setObservaciones(proveedorToEdit.observaciones || '');
      setActivo(proveedorToEdit.activo !== undefined ? proveedorToEdit.activo : true);
    } else {
      // Reset form
      setNombre('');
      setTipo('Materiales');
      setCategoria('');
      setNifCif('');
      setPersonaContacto('');
      setTelefono('');
      setMovil('');
      setEmail('');
      setDireccion('');
      setCodigoPostal('');
      setCiudad('');
      setProvincia('');
      setIban('');
      setObservaciones('');
      setActivo(true);
    }
  }, [proveedorToEdit]);

  // Adjust default category if blank when tipo changes
  const handleTipoChange = (newTipo: 'Materiales' | 'Subcontrata') => {
    setTipo(newTipo);
    // Suggest a default category if blank
    if (!categoria) {
      setCategoria(newTipo === 'Materiales' ? materialCategories[0] : subcontrataCategories[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      alert('Por favor, complete el campo obligatorio (Nombre Comercial / Razón Social).');
      return;
    }
    if (!categoria.trim()) {
      alert('Por favor, complete la categoría del proveedor.');
      return;
    }

    const provData = {
      nombre: nombre.trim(),
      tipo,
      categoria: categoria.trim(),
      nifCif: nifCif.trim().toUpperCase(),
      personaContacto: personaContacto.trim(),
      telefono: telefono.trim(),
      movil: movil.trim(),
      email: email.trim().toLowerCase(),
      direccion: direccion.trim(),
      codigoPostal: codigoPostal.trim(),
      ciudad: ciudad.trim(),
      provincia: provincia.trim(),
      iban: iban.trim().toUpperCase().replace(/\s+/g, ''),
      observaciones: observaciones.trim(),
      activo
    };

    onSave(provData);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Back Button */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-slate-500 hover:text-slate-900 gap-1.5 h-8 text-xs px-2.5 rounded-lg border border-slate-200 bg-white shadow-2xs"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al listado
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
            <CardTitle className="text-base font-bold text-slate-950 flex items-center gap-2">
              {tipo === 'Materiales' ? (
                <Truck className="h-5 w-5 text-indigo-600" />
              ) : (
                <Briefcase className="h-5 w-5 text-indigo-600" />
              )}
              {proveedorToEdit ? `Editar Proveedor: ${proveedorToEdit.codigo}` : 'Registrar Nuevo Proveedor'}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Sección 1: Datos Identificativos */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                <User className="h-4 w-4 text-indigo-500" />
                Identificación y Categoría
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Nombre Comercial / Razón Social <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    placeholder="ej. Pavimentos Levante S.A."
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="text-xs h-9.5 bg-slate-50/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">NIF / CIF</label>
                  <Input
                    placeholder="ej. A46123456"
                    value={nifCif}
                    onChange={(e) => setNifCif(e.target.value)}
                    className="text-xs h-9.5 bg-slate-50/20 uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Tipo de Proveedor
                  </label>
                  <select
                    value={tipo}
                    onChange={(e) => handleTipoChange(e.target.value as any)}
                    className="w-full text-xs h-9.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                  >
                    <option value="Materiales">Materiales (Suministros)</option>
                    <option value="Subcontrata">Subcontrata (Gremio / Instalador)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Categoría / Especialidad <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="ej. Fontanería, Sanitarios, Alisado..."
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    list="suggested-categories"
                    className="text-xs h-9.5 bg-slate-50/20"
                  />
                  <datalist id="suggested-categories">
                    {(tipo === 'Materiales' ? materialCategories : subcontrataCategories).map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Persona de Contacto</label>
                  <Input
                    placeholder="ej. Juan Martínez (Comercial)"
                    value={personaContacto}
                    onChange={(e) => setPersonaContacto(e.target.value)}
                    className="text-xs h-9.5 bg-slate-50/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Estado</label>
                  <select
                    value={activo ? 'true' : 'false'}
                    onChange={(e) => setActivo(e.target.value === 'true')}
                    className="w-full text-xs h-9.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sección 2: Datos de Contacto */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                <Phone className="h-4 w-4 text-indigo-500" />
                Información de Contacto
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Teléfono Fijo</label>
                  <Input
                    placeholder="ej. 963123456"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="text-xs h-9.5 bg-slate-50/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Teléfono Móvil</label>
                  <Input
                    placeholder="ej. 600123456"
                    value={movil}
                    onChange={(e) => setMovil(e.target.value)}
                    className="text-xs h-9.5 bg-slate-50/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Correo Electrónico</label>
                  <Input
                    type="email"
                    placeholder="ej. contacto@proveedor.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-xs h-9.5 bg-slate-50/20 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Sección 3: Datos de Dirección */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                <MapPin className="h-4 w-4 text-indigo-500" />
                Dirección / Ubicación
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Dirección Completa</label>
                  <Input
                    placeholder="ej. Polígono Fuente del Jarro, Calle de los Plateros 15"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    className="text-xs h-9.5 bg-slate-50/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Código Postal</label>
                  <Input
                    placeholder="ej. 46980"
                    value={codigoPostal}
                    onChange={(e) => setCodigoPostal(e.target.value)}
                    className="text-xs h-9.5 bg-slate-50/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Ciudad</label>
                  <Input
                    placeholder="ej. Paterna"
                    value={ciudad}
                    onChange={(e) => setCiudad(e.target.value)}
                    className="text-xs h-9.5 bg-slate-50/20"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Provincia</label>
                  <Input
                    placeholder="ej. Valencia"
                    value={provincia}
                    onChange={(e) => setProvincia(e.target.value)}
                    className="text-xs h-9.5 bg-slate-50/20"
                  />
                </div>
              </div>
            </div>

            {/* Sección 4: Datos de Facturación y Pago */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                <Landmark className="h-4 w-4 text-indigo-500" />
                Datos de Pago y Facturación
              </h3>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Número de Cuenta Bancaria (IBAN)</label>
                  <Input
                    placeholder="ej. ES2100491500021234567890"
                    value={iban}
                    onChange={(e) => setIban(e.target.value)}
                    className="text-xs h-9.5 bg-slate-50/20 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Sección 5: Observaciones */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                <FileText className="h-4 w-4 text-indigo-500" />
                Observaciones y Notas Internas
              </h3>

              <div className="space-y-1">
                <textarea
                  rows={4}
                  placeholder="Detalles sobre acuerdos, condiciones comerciales, tarifas de entrega, plazos habituales..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50/10 p-3 text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          </CardContent>

          {/* Form Actions footer */}
          <div className="bg-slate-50/60 border-t border-slate-100 p-4 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="text-slate-600 bg-white border-slate-200 hover:bg-slate-50 text-xs h-9.5 px-4 rounded-lg"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-9.5 px-4 gap-1.5 rounded-lg shadow-xs"
            >
              <Save className="h-4 w-4" />
              {proveedorToEdit ? 'Guardar Cambios' : 'Registrar Proveedor'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
