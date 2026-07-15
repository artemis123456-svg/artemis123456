import React, { useState, useEffect } from 'react';
import { Obra } from '../../types/obra';
import { Client } from '../../types/client';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { DecimalInput } from '../ui/DecimalInput';
import { ArrowLeft, Sparkles, Building2, Calendar, Map, CheckCircle2 } from 'lucide-react';

interface ObraFormProps {
  obraToEdit?: Obra | null;
  clients: Client[];
  onSave: (obraData: Omit<Obra, 'id' | 'codigo'> & { id?: string; codigo?: string }) => void;
  onCancel: () => void;
}

export default function ObraForm({ obraToEdit, clients, onSave, onCancel }: ObraFormProps) {
  const [titulo, setTitulo] = useState('');
  const [clientId, setClientId] = useState('');
  const [tipoReforma, setTipoReforma] = useState<Obra['tipoReforma']>('Integral');
  const [metrosCuadrados, setMetrosCuadrados] = useState(0);
  const [direccion, setDireccion] = useState('');
  const [fechaInicioPrevista, setFechaInicioPrevista] = useState('');
  const [fechaInicioReal, setFechaInicioReal] = useState('');
  const [fechaFinPrevista, setFechaFinPrevista] = useState('');
  const [fechaFinReal, setFechaFinReal] = useState('');
  const [estado, setEstado] = useState<Obra['estado']>('Presupuesto');
  const [importe, setImporte] = useState(0);

  // Load obra values if editing
  useEffect(() => {
    if (obraToEdit) {
      setTitulo(obraToEdit.titulo || '');
      setClientId(obraToEdit.clientId || '');
      setTipoReforma(obraToEdit.tipoReforma || 'Integral');
      setMetrosCuadrados(obraToEdit.metrosCuadrados || 0);
      setDireccion(obraToEdit.direccion || '');
      setFechaInicioPrevista(obraToEdit.fechaInicioPrevista || '');
      setFechaInicioReal(obraToEdit.fechaInicioReal || '');
      setFechaFinPrevista(obraToEdit.fechaFinPrevista || '');
      setFechaFinReal(obraToEdit.fechaFinReal || '');
      setEstado(obraToEdit.estado || 'Presupuesto');
      setImporte(obraToEdit.importe || 0);
    } else {
      // Default reset
      setTitulo('');
      setClientId(clients[0]?.id || '');
      setTipoReforma('Integral');
      setMetrosCuadrados(0);
      setDireccion('');
      setFechaInicioPrevista(new Date().toISOString().split('T')[0]);
      setFechaInicioReal('');
      setFechaFinPrevista('');
      setFechaFinReal('');
      setEstado('Presupuesto');
      setImporte(0);
    }
  }, [obraToEdit, clients]);

  // Handle client selection and autofill address from client if address is empty
  const handleClientChange = (selectedId: string) => {
    setClientId(selectedId);
    if (!direccion) {
      const selectedClient = clients.find(c => c.id === selectedId);
      if (selectedClient && selectedClient.direccion) {
        setDireccion(selectedClient.direccion);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !clientId) return;

    const payload = {
      titulo: titulo.trim(),
      clientId,
      tipoReforma,
      metrosCuadrados: Number(metrosCuadrados) || 0,
      direccion: direccion.trim(),
      fechaInicioPrevista: fechaInicioPrevista || null,
      fechaInicioReal: fechaInicioReal || null,
      fechaFinPrevista: fechaFinPrevista || null,
      fechaFinReal: fechaFinReal || null,
      estado,
      importe: Number(importe) || 0,
      // Pass along the existing id/codigo if we are editing
      ...(obraToEdit ? { id: obraToEdit.id, codigo: obraToEdit.codigo } : {})
    };

    onSave(payload);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-9 w-9 rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            <ArrowLeft className="h-5 w-5 text-slate-500" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="h-5 w-5 text-verini-black" />
              {obraToEdit ? `Editar Obra: ${obraToEdit.codigo}` : 'Registrar Nueva Obra'}
            </h2>
            <p className="text-xs text-slate-500">
              {obraToEdit ? 'Modifica los campos del proyecto de reforma.' : 'Crea un nuevo expediente de obra para un cliente.'}
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Section 1: Datos de la Obra */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <Sparkles className="h-4 w-4 text-verini-grey" />
              Datos Identificativos
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Título */}
              <div className="space-y-1.5 col-span-1 md:col-span-2">
                <label className="text-xs font-semibold text-slate-600">Título del proyecto *</label>
                <Input
                  required
                  placeholder="ej. Reforma Integral de Piso 120m²"
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              {/* Cliente Vinculado */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Cliente *</label>
                <select
                  required
                  value={clientId}
                  onChange={e => handleClientChange(e.target.value)}
                  className="w-full text-xs h-9 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 outline-none focus:border-verini-black focus:ring-1 focus:ring-verini-black/20"
                >
                  <option value="" disabled>Selecciona un cliente...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} {c.apellidos} {c.empresa ? `(${c.empresa})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo de Reforma */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Tipo de reforma *</label>
                <select
                  required
                  value={tipoReforma}
                  onChange={e => setTipoReforma(e.target.value as any)}
                  className="w-full text-xs h-9 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 outline-none focus:border-verini-black focus:ring-1 focus:ring-verini-black/20"
                >
                  <option value="Cocina">Cocina</option>
                  <option value="Baño">Baño</option>
                  <option value="Integral">Integral</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              {/* Metros Cuadrados */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Metros Cuadrados (m²)</label>
                <Input
                  type="number"
                  placeholder="80"
                  min="0"
                  value={metrosCuadrados || ''}
                  onChange={e => setMetrosCuadrados(Number(e.target.value) || 0)}
                  className="text-xs h-9"
                />
              </div>

              {/* Importe Obra */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Importe de la Obra (€) *</label>
                <DecimalInput
                  value={importe}
                  onChange={setImporte}
                  placeholder="Importe total presupuestado"
                  className="text-xs h-9 bg-white border-slate-200 focus-visible:ring-verini-black"
                />
              </div>

              {/* Dirección de la Obra */}
              <div className="space-y-1.5 col-span-1 md:col-span-2">
                <label className="text-xs font-semibold text-slate-600">Dirección de la obra *</label>
                <Input
                  required
                  placeholder="ej. Avenida de la Constitución 12, Planta 2, Sevilla"
                  value={direccion}
                  onChange={e => setDireccion(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              {/* Estado / Fase */}
              <div className="space-y-1.5 col-span-1 md:col-span-2">
                <label className="text-xs font-semibold text-slate-600">Fase del Kanban *</label>
                <select
                  required
                  value={estado}
                  onChange={e => setEstado(e.target.value as any)}
                  className="w-full text-xs h-9 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 outline-none focus:border-verini-black focus:ring-1 focus:ring-verini-black/20"
                >
                  <option value="Presupuesto">Presupuesto</option>
                  <option value="Aceptada">Aceptada</option>
                  <option value="En obra">En obra</option>
                  <option value="Entregada">Entregada</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Planificación de Fechas */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <Calendar className="h-4 w-4 text-gray-700" />
              Planificación e Hitos de Fechas
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fecha Inicio Prevista */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Fecha Inicio Prevista</label>
                <Input
                  type="date"
                  value={fechaInicioPrevista}
                  onChange={e => setFechaInicioPrevista(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              {/* Fecha Fin Prevista */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Fecha Fin Prevista</label>
                <Input
                  type="date"
                  value={fechaFinPrevista}
                  onChange={e => setFechaFinPrevista(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              {/* Fecha Inicio Real */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Fecha Inicio Real</label>
                <Input
                  type="date"
                  value={fechaInicioReal}
                  onChange={e => setFechaInicioReal(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              {/* Fecha Fin Real */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Fecha Fin Real</label>
                <Input
                  type="date"
                  value={fechaFinReal}
                  onChange={e => setFechaFinReal(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col-reverse sm:flex-row justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="text-xs h-9 w-full sm:w-auto"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            className="bg-verini-black hover:bg-black/90 text-white text-xs h-9 gap-1.5 w-full sm:w-auto px-5 rounded-lg cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            {obraToEdit ? 'Guardar Cambios' : 'Registrar Obra'}
          </Button>
        </div>
      </form>
    </div>
  );
}
