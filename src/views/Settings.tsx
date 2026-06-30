import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Building2, 
  Shield, 
  Bell, 
  Database, 
  Sparkles,
  HelpCircle,
  Save,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function Settings() {
  const [successMsg, setSuccessMsg] = useState('');
  
  // Local toggles
  const [modules, setModules] = useState({
    deals: true,
    marketing: true,
    aiAdvisor: false,
    emailAutomation: true,
    webhooks: false
  });

  const handleToggleModule = (key: keyof typeof modules) => {
    setModules(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('Ajustes del sistema guardados con éxito.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Reset local storage database to pristine state
  const handleResetDatabase = () => {
    if (confirm('¿Estás seguro de que deseas restablecer la base de datos local? Se perderán los registros que hayas creado de forma interactiva.')) {
      localStorage.removeItem('verini_contacts');
      localStorage.removeItem('verini_deals');
      localStorage.removeItem('verini_campaigns');
      localStorage.removeItem('verini_activities');
      setSuccessMsg('Base de datos restablecida. Recargando aplicación...');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900">Ajustes Generales</h1>
        <p className="text-sm text-slate-500">Configura la información de tu organización, administra tus módulos y gestiona tu base de datos local.</p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-xl animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Profile Card */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="flex flex-row items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-lg font-heading shadow-xs">
              U
            </div>
            <div className="flex-1">
              <CardTitle className="text-base font-bold text-slate-900">Perfil de Administrador</CardTitle>
              <CardDescription className="text-xs text-slate-500">Información personal e identificador único de cuenta SaaS.</CardDescription>
            </div>
            <Badge className="bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold">Pro Account</Badge>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">Nombre de Usuario</label>
              <Input defaultValue="Usuario Verini" className="text-xs bg-slate-50/50 border-slate-200" disabled />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">Dirección de Correo</label>
              <Input defaultValue="artemis123456@gmail.com" className="text-xs bg-slate-50/50 border-slate-200" disabled />
            </div>
          </CardContent>
        </Card>

        {/* Business Settings */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-indigo-600" />
              <CardTitle className="text-base font-bold text-slate-900">Ficha de Organización</CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500">Datos fiscales y domicilio social para facturación.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Razón Social</label>
                <Input defaultValue="Verini Global S.L." className="text-xs border-slate-200 focus-visible:ring-indigo-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Identificador Fiscal (NIF)</label>
                <Input defaultValue="B-87654321" className="text-xs border-slate-200 focus-visible:ring-indigo-500" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Domicilio Social</label>
              <Input defaultValue="Paseo de la Castellana 95, Madrid, España" className="text-xs border-slate-200 focus-visible:ring-indigo-500" />
            </div>
          </CardContent>
        </Card>

        {/* Modular CRM Activation Matrix */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-indigo-600" />
              <CardTitle className="text-base font-bold text-slate-900">Matriz de Módulos SaaS</CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500">Enciende o apaga dinámicamente los submódulos funcionales del CRM.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 divide-y divide-slate-100">
            {/* Row 1: Sales pipeline */}
            <div className="flex items-center justify-between pt-1 first:pt-0">
              <div className="flex flex-col pr-4">
                <span className="text-xs font-bold text-slate-800">Módulo de Embudo de Ventas (Pipeline)</span>
                <span className="text-[11px] text-slate-500">Habilita tableros Kanban, proyecciones comerciales y probabilidades comerciales.</span>
              </div>
              <button 
                type="button"
                onClick={() => handleToggleModule('deals')}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                  ${modules.deals ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out
                  ${modules.deals ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Row 2: Marketing campaigns */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex flex-col pr-4">
                <span className="text-xs font-bold text-slate-800">Módulo de Campañas de Marketing</span>
                <span className="text-[11px] text-slate-500">Seguimiento de ROI de anuncios, email masivo y generación de leads directos.</span>
              </div>
              <button 
                type="button"
                onClick={() => handleToggleModule('marketing')}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                  ${modules.marketing ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out
                  ${modules.marketing ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Row 3: Automated Email sequence */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex flex-col pr-4">
                <span className="text-xs font-bold text-slate-800">Automatizaciones de Email (Triggers)</span>
                <span className="text-[11px] text-slate-500">Envío automático de correos de bienvenida al avanzar un lead a cualificación.</span>
              </div>
              <button 
                type="button"
                onClick={() => handleToggleModule('emailAutomation')}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                  ${modules.emailAutomation ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out
                  ${modules.emailAutomation ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Row 4: AI Sales Copilot */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex flex-col pr-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">Asesor de Ventas Inteligente (IA Copilot)</span>
                  <span className="rounded-full bg-amber-100 text-amber-800 font-bold px-2 py-0.2 text-[9px] border border-amber-200">Próximamente</span>
                </div>
                <span className="text-[11px] text-slate-500">Integración con Gemini para redactar propuestas y aconsejar estrategias de cierre.</span>
              </div>
              <button 
                type="button"
                onClick={() => handleToggleModule('aiAdvisor')}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                  ${modules.aiAdvisor ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out
                  ${modules.aiAdvisor ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Action Controls */}
        <div className="flex justify-end gap-2">
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg gap-1.5 px-4 h-9 shadow-sm shadow-indigo-600/15">
            <Save className="h-4 w-4" />
            Guardar Ajustes
          </Button>
        </div>
      </form>

      {/* Database Operations Center */}
      <Card className="border-rose-100 bg-rose-50/10 shadow-xs mt-8">
        <CardHeader>
          <div className="flex items-center gap-2 text-rose-700">
            <Database className="h-4 w-4 text-rose-600" />
            <CardTitle className="text-base font-bold text-rose-950">Mantenimiento de Datos</CardTitle>
          </div>
          <CardDescription className="text-xs text-rose-700/70">Utilidades de desarrollo para restablecer la demostración.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-rose-600/80 leading-relaxed max-w-md">
            Si has creado contactos, leads, tratos o campañas de prueba y deseas restablecer la demostración del CRM Verini a su estado original de fábrica, haz clic en el botón de restablecer.
          </p>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleResetDatabase}
            className="gap-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shrink-0 h-9"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Restablecer Demo
          </Button>
        </CardContent>
      </Card>

    </div>
  );
}
