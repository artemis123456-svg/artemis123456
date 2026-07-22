import React, { useState, useEffect, useMemo } from 'react';
import { Proveedor } from '../../types/proveedor';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { User, Phone, Mail, MapPin, Landmark, FileText, ArrowLeft, Save, Truck, Briefcase, Plus, Trash2, Globe } from 'lucide-react';
import { getProvinceByPostalCode } from '../../lib/spainCodes';

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

  // Contacts state
  const [contactos, setContactos] = useState<any[]>([]);

  // Individual contact fields for the "add contact" subform
  const [nuevoContactoNombre, setNuevoContactoNombre] = useState('');
  const [nuevoContactoTelefono, setNuevoContactoTelefono] = useState('');
  const [nuevoContactoEmail, setNuevoContactoEmail] = useState('');
  const [nuevoContactoPuesto, setNuevoContactoPuesto] = useState('Comercial');

  // Predefined categories requested by user
  const defaultCategories = [
    'Alquileres',
    'Suministros',
    'Telefonía',
    'Ofimática',
    'Griferías',
    'Muebles',
    'Pavimentos',
    'Parket',
    'Arquitecto',
    'Diseño',
    'Pintor'
  ];

  // State for categories list, initialized with default plus persistent local ones
  const [availableCategories, setAvailableCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('verini_custom_proveedor_categories');
    const custom = saved ? JSON.parse(saved) : [];
    return Array.from(new Set([...defaultCategories, ...custom]));
  });

  const [newCategoryText, setNewCategoryText] = useState('');

  const selectedCategories = useMemo(() => {
    if (!categoria) return [];
    return categoria.split(',').map(c => c.trim()).filter(Boolean);
  }, [categoria]);

  const handleToggleCategory = (cat: string) => {
    let updated: string[];
    if (selectedCategories.includes(cat)) {
      updated = selectedCategories.filter(c => c !== cat);
    } else {
      updated = [...selectedCategories, cat];
    }
    setCategoria(updated.join(', '));
  };

  const handleAddCustomCategory = (e: React.MouseEvent) => {
    e.preventDefault();
    const clean = newCategoryText.trim();
    if (!clean) return;
    if (!availableCategories.includes(clean)) {
      const updated = [...availableCategories, clean];
      setAvailableCategories(updated);
      
      const custom = updated.filter(c => !defaultCategories.includes(c));
      localStorage.setItem('verini_custom_proveedor_categories', JSON.stringify(custom));
    }
    handleToggleCategory(clean);
    setNewCategoryText('');
  };

  const handleCPChange = async (val: string) => {
    setCodigoPostal(val);
    const cleanCP = val.trim();
    if (cleanCP.length >= 2) {
      const prov = getProvinceByPostalCode(cleanCP);
      if (prov) {
        setProvincia(prov);
      }
    }
    if (cleanCP.length === 5) {
      try {
        const res = await fetch(`https://api.zippopotam.us/es/${cleanCP}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.places && data.places.length > 0) {
            const place = data.places[0];
            if (place['place name']) {
              setCiudad(place['place name']);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching Spanish zip code:", err);
      }
    }
  };

  const handleAddContacto = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!nuevoContactoNombre.trim()) {
      alert('Por favor introduzca al menos el nombre del contacto.');
      return;
    }
    const newContactObj = {
      id: `contact_${Date.now()}`,
      nombre: nuevoContactoNombre.trim(),
      telefono: nuevoContactoTelefono.trim(),
      email: nuevoContactoEmail.trim().toLowerCase(),
      puesto: nuevoContactoPuesto
    };
    setContactos(prev => [...prev, newContactObj]);
    
    // Clear fields
    setNuevoContactoNombre('');
    setNuevoContactoTelefono('');
    setNuevoContactoEmail('');
    setNuevoContactoPuesto('Comercial');
  };

  const handleRemoveContacto = (id: string) => {
    setContactos(prev => prev.filter(c => c.id !== id));
  };

  // Load provider data if editing
  useEffect(() => {
    if (proveedorToEdit) {
      setNombre(proveedorToEdit.nombre || '');
      setTipo(proveedorToEdit.tipo || 'Materiales');
      setCategoria(proveedorToEdit.categoria || '');
      setNifCif(proveedorToEdit.nifCif || '');
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
      setContactos(proveedorToEdit.contactos || []);
    } else {
      // Reset form
      setNombre('');
      setTipo('Materiales');
      setCategoria('');
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
      setActivo(true);
      setContactos([]);
    }
  }, [proveedorToEdit]);

  // Adjust default category if blank when tipo changes
  const handleTipoChange = (newTipo: 'Materiales' | 'Subcontrata') => {
    setTipo(newTipo);
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

    const firstContact = contactos[0] || null;

    const provData = {
      nombre: nombre.trim(),
      tipo,
      categoria: categoria.trim(),
      nifCif: nifCif.trim().toUpperCase(),
      personaContacto: firstContact ? firstContact.nombre : '',
      contactos,
      telefono: telefono.trim(),
      movil: movil.trim() || (firstContact ? firstContact.telefono : ''),
      email: email.trim().toLowerCase() || (firstContact ? firstContact.email : ''),
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
                <Truck className="h-5 w-5 text-gray-900" />
              ) : (
                <Briefcase className="h-5 w-5 text-gray-900" />
              )}
              {proveedorToEdit ? `Editar Proveedor: ${proveedorToEdit.codigo}` : 'Registrar Nuevo Proveedor'}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Sección 1: Datos Identificativos */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                <User className="h-4 w-4 text-gray-700" />
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
                    className="w-full text-xs h-9.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700/20"
                  >
                    <option value="Materiales">Materiales (Suministros)</option>
                    <option value="Subcontrata">Subcontrata (Gremio / Instalador)</option>
                  </select>
                </div>

                 <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
                    Categorías / Especialidades <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[10px] text-slate-400 mb-1.5">Selecciona una o más especialidades para este proveedor, o añade una propia:</p>
                  <div className="flex flex-wrap gap-1.5 p-3.5 bg-slate-50 border border-slate-200/65 rounded-xl max-h-40 overflow-y-auto">
                    {availableCategories.map((cat) => {
                      const isSelected = selectedCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => handleToggleCategory(cat)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer select-none
                            ${isSelected 
                              ? 'bg-gray-900 text-white border-gray-900 shadow-xs' 
                              : 'bg-white text-slate-650 border-slate-200 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="flex gap-2 mt-2 max-w-md">
                    <Input
                      placeholder="Nueva categoría propia (ej. Ofimática, Parket)"
                      value={newCategoryText}
                      onChange={(e) => setNewCategoryText(e.target.value)}
                      className="text-xs h-8.5 bg-white"
                    />
                    <Button
                      type="button"
                      onClick={handleAddCustomCategory}
                      className="bg-slate-800 hover:bg-slate-700 text-white text-xs h-8.5 px-3 rounded-lg flex items-center gap-1 shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Añadir
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Estado</label>
                  <select
                    value={activo ? 'true' : 'false'}
                    onChange={(e) => setActivo(e.target.value === 'true')}
                    className="w-full text-xs h-9.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700/20"
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sección 2: Datos de Contacto de la Empresa */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                <Phone className="h-4 w-4 text-gray-700" />
                Información de Contacto de la Empresa
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
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Teléfono Móvil General</label>
                  <Input
                    placeholder="ej. 600123456"
                    value={movil}
                    onChange={(e) => setMovil(e.target.value)}
                    className="text-xs h-9.5 bg-slate-50/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Correo Electrónico General</label>
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

            {/* Sección Nueva: Múltiples Contactos por Proveedor */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                <User className="h-4 w-4 text-gray-700" />
                Múltiples Contactos por Proveedor
              </h3>

              {/* List of existing contacts */}
              <div className="space-y-2.5">
                {contactos.length > 0 ? (
                  <div className="border border-slate-150 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white shadow-3xs">
                    {contactos.map((c) => (
                      <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50/20 text-xs gap-2 hover:bg-slate-50/50 transition-colors">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 flex-1">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Función / Puesto</span>
                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-800 ring-1 ring-inset ring-slate-600/10">
                              {c.puesto}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Nombre</span>
                            <span className="font-bold text-slate-900">{c.nombre}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Teléfono</span>
                            <span className="font-mono text-slate-750">{c.telefono || '-'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Email</span>
                            <span className="font-mono text-slate-750">{c.email || '-'}</span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveContacto(c.id)}
                          className="h-8 w-8 text-slate-400 hover:text-red-600 rounded-lg shrink-0 self-end sm:self-center"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5 text-xs text-slate-400 italic bg-slate-50/40 border border-slate-200/50 rounded-xl">
                    No se han añadido contactos específicos para este proveedor. Añade uno abajo.
                  </div>
                )}
              </div>

              {/* Subform to add a new contact */}
              <div className="p-4 bg-slate-50/50 border border-slate-200 rounded-xl space-y-4">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">Nuevo Contacto</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Nombre Completo</label>
                    <Input
                      placeholder="ej. Juan Pérez"
                      value={nuevoContactoNombre}
                      onChange={(e) => setNuevoContactoNombre(e.target.value)}
                      className="text-xs h-9 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Teléfono</label>
                    <Input
                      placeholder="ej. 600123456"
                      value={nuevoContactoTelefono}
                      onChange={(e) => setNuevoContactoTelefono(e.target.value)}
                      className="text-xs h-9 bg-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Correo Electrónico</label>
                    <Input
                      type="email"
                      placeholder="ej. comercial@proveedor.com"
                      value={nuevoContactoEmail}
                      onChange={(e) => setNuevoContactoEmail(e.target.value)}
                      className="text-xs h-9 bg-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Puesto / Función</label>
                    <select
                      value={nuevoContactoPuesto}
                      onChange={(e) => setNuevoContactoPuesto(e.target.value)}
                      className="w-full text-xs h-9 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-750 outline-none focus:border-gray-700"
                    >
                      <option value="Comercial">Comercial</option>
                      <option value="Administración">Administración</option>
                      <option value="Logística">Logística</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    type="button"
                    onClick={handleAddContacto}
                    className="bg-slate-900 hover:bg-slate-850 text-white text-xs h-8.5 px-3.5 gap-1.5 rounded-lg font-semibold"
                  >
                    <Plus className="h-4 w-4" />
                    Añadir Contacto
                  </Button>
                </div>
              </div>
            </div>

            {/* Sección 3: Datos de Dirección */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                <MapPin className="h-4 w-4 text-gray-700" />
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
                    onChange={(e) => handleCPChange(e.target.value)}
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
                <Landmark className="h-4 w-4 text-gray-700" />
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
                <FileText className="h-4 w-4 text-gray-700" />
                Observaciones y Notas Internas
              </h3>

              <div className="space-y-1">
                <textarea
                  rows={4}
                  placeholder="Detalles sobre acuerdos, condiciones comerciales, tarifas de entrega, plazos habituales..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50/10 p-3 text-slate-700 outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700/20"
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
              className="bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs h-9.5 px-4 gap-1.5 rounded-lg shadow-xs"
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
