import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  Trash2, 
  Edit3, 
  Eye, 
  Mail, 
  Phone, 
  Building, 
  Briefcase,
  ExternalLink,
  PlusCircle,
  MoreVertical,
  Check,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { getStoredContacts, saveStoredContacts, getStoredActivities, saveStoredActivities } from '@/src/mockData';
import { Contact, Activity } from '@/src/types';

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Lead' | 'Contact' | 'Customer' | 'Churned'>('All');
  
  // Sheet state: view/edit details
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Dialog state: create contact from this view
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [value, setValue] = useState('5000');
  const [status, setStatus] = useState<'Lead' | 'Contact' | 'Customer'>('Lead');

  const loadData = () => {
    setContacts(getStoredContacts());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  // Filter contacts by query & tab
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'All') return matchesSearch;
    return matchesSearch && contact.status === activeTab;
  });

  // Handle Create
  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !company) return;

    const newContact: Contact = {
      id: `c_${Date.now()}`,
      name,
      email,
      phone: phone || '+34 600 000 000',
      company,
      status,
      value: Number(value) || 0,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 500000)}?w=100&auto=format&fit=crop&q=80`,
      lastContacted: new Date().toISOString().split('T')[0],
    };

    const updated = [newContact, ...contacts];
    setContacts(updated);
    saveStoredContacts(updated);

    // Activity log
    const activity: Activity = {
      id: `a_${Date.now()}`,
      type: 'Task',
      description: `Contacto registrado: ${newContact.name}`,
      contactName: newContact.name,
      date: new Date().toISOString(),
      status: 'Completed',
    };
    saveStoredActivities([activity, ...getStoredActivities()]);

    // Reset Form
    setName('');
    setEmail('');
    setCompany('');
    setPhone('');
    setValue('5000');
    setStatus('Lead');
    setIsAddDialogOpen(false);
    window.dispatchEvent(new Event('storage'));
  };

  // Handle Delete
  const handleDeleteContact = (id: string) => {
    const updated = contacts.filter(c => c.id !== id);
    setContacts(updated);
    saveStoredContacts(updated);
    setIsDetailsOpen(false);
    window.dispatchEvent(new Event('storage'));
  };

  // Handle Edit Status directly in detail Sheet
  const handleUpdateStatus = (newStatus: 'Lead' | 'Contact' | 'Customer' | 'Churned') => {
    if (!selectedContact) return;
    
    const updatedContacts = contacts.map(c => {
      if (c.id === selectedContact.id) {
        return { ...c, status: newStatus };
      }
      return c;
    });

    setContacts(updatedContacts);
    saveStoredContacts(updatedContacts);
    setSelectedContact({ ...selectedContact, status: newStatus });

    // Activity log
    const activity: Activity = {
      id: `a_${Date.now()}`,
      type: 'Task',
      description: `Cambio de estado a ${newStatus}`,
      contactName: selectedContact.name,
      date: new Date().toISOString(),
      status: 'Completed',
    };
    saveStoredActivities([activity, ...getStoredActivities()]);

    window.dispatchEvent(new Event('storage'));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Lead':
        return <Badge className="bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-50">Lead</Badge>;
      case 'Contact':
        return <Badge className="bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-50">Contacto</Badge>;
      case 'Customer':
        return <Badge className="bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-50">Cliente</Badge>;
      default:
        return <Badge className="bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-50">Inactivo</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900">Contactos y Prospectos</h1>
          <p className="text-sm text-slate-500">Gestión de cuentas corporativas, llamadas de cualificación y leads de Verini CRM.</p>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-medium text-xs rounded-lg"
        >
          <Plus className="h-4 w-4" />
          Nuevo Contacto
        </Button>
      </div>

      {/* Main Database Table Card */}
      <Card className="border-slate-200 shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Nav Tabs filters */}
            <div className="flex flex-wrap gap-1 bg-slate-100/80 p-1 rounded-lg border border-slate-200/50 self-start">
              {(['All', 'Lead', 'Contact', 'Customer', 'Churned'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150
                    ${activeTab === tab 
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/30' 
                      : 'text-slate-500 hover:text-slate-900'}`}
                >
                  {tab === 'All' ? 'Todos' : tab === 'Lead' ? 'Leads' : tab === 'Contact' ? 'Contactos' : tab === 'Customer' ? 'Clientes' : 'Inactivos'}
                </button>
              ))}
            </div>

            {/* Local Filter Search Bar */}
            <div className="relative max-w-xs w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Buscar por nombre, empresa..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-9 w-full bg-white border-slate-200 focus-visible:ring-indigo-500 text-xs rounded-lg"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="w-[280px] text-xs font-semibold text-slate-500">Nombre / Contacto</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500">Empresa o Entidad</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500">Estado</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500">Valor Estimado</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500">Último Contacto</TableHead>
                  <TableHead className="w-[100px] text-right text-xs font-semibold text-slate-500">Ficha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.length > 0 ? (
                  filteredContacts.map((contact) => (
                    <TableRow 
                      key={contact.id} 
                      className="hover:bg-slate-50/50 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedContact(contact);
                        setIsDetailsOpen(true);
                      }}
                    >
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={contact.avatar} 
                            alt={contact.name} 
                            referrerPolicy="no-referrer"
                            className="h-9 w-9 rounded-xl object-cover border border-slate-100 bg-slate-100 shrink-0" 
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-slate-800 truncate">{contact.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium truncate">{contact.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-xs text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Building className="h-3.5 w-3.5 text-slate-400" />
                          <span>{contact.company}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        {getStatusBadge(contact.status)}
                      </TableCell>
                      <TableCell className="py-3 text-xs font-bold text-slate-800">
                        {contact.value > 0 ? (
                          new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(contact.value)
                        ) : (
                          <span className="text-slate-400 font-normal">-</span>
                        )}
                      </TableCell>
                      <TableCell className="py-3 text-xs text-slate-500 font-medium">
                        {new Date(contact.lastContacted).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </TableCell>
                      <TableCell className="py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-400 hover:text-slate-900 rounded-lg"
                          onClick={() => {
                            setSelectedContact(contact);
                            setIsDetailsOpen(true);
                          }}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-xs text-slate-400">
                      No se encontraron contactos que coincidan con la búsqueda.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Slide-over Sheet: Contact Details View */}
      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          {selectedContact && (
            <div className="space-y-6 pt-4">
              <SheetHeader className="text-left">
                <div className="flex items-center gap-4">
                  <img 
                    src={selectedContact.avatar} 
                    alt={selectedContact.name} 
                    referrerPolicy="no-referrer"
                    className="h-14 w-14 rounded-2xl object-cover border border-slate-200 shadow-xs" 
                  />
                  <div className="flex flex-col min-w-0">
                    <SheetTitle className="text-lg font-heading font-bold text-slate-900">{selectedContact.name}</SheetTitle>
                    <span className="text-xs text-slate-500 font-semibold">{selectedContact.company}</span>
                  </div>
                </div>
              </SheetHeader>

              {/* Status Update Actions */}
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Cambiar Estado CRM</span>
                <div className="flex flex-wrap gap-1.5">
                  {(['Lead', 'Contact', 'Customer', 'Churned'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(st)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-all
                        ${selectedContact.status === st 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      {st === 'Lead' ? 'Lead' : st === 'Contact' ? 'Contacto' : st === 'Customer' ? 'Cliente' : 'Inactivo'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Properties */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-950 uppercase tracking-wide border-b border-slate-100 pb-1.5 block">Información Comercial</span>
                
                <div className="grid grid-cols-3 text-xs gap-y-3">
                  <span className="text-slate-400 font-semibold">Correo</span>
                  <span className="col-span-2 text-slate-800 font-medium flex items-center gap-1.5 truncate">
                    <Mail className="h-3.5 w-3.5 text-indigo-500" />
                    {selectedContact.email}
                  </span>

                  <span className="text-slate-400 font-semibold">Teléfono</span>
                  <span className="col-span-2 text-slate-800 font-medium flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-emerald-500" />
                    {selectedContact.phone}
                  </span>

                  <span className="text-slate-400 font-semibold">Empresa</span>
                  <span className="col-span-2 text-slate-800 font-medium flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-slate-400" />
                    {selectedContact.company}
                  </span>

                  <span className="text-slate-400 font-semibold">Valor Estimado</span>
                  <span className="col-span-2 text-slate-900 font-bold">
                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(selectedContact.value)}
                  </span>

                  <span className="text-slate-400 font-semibold">Último Contacto</span>
                  <span className="col-span-2 text-slate-600 font-medium">
                    {new Date(selectedContact.lastContacted).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Notes / History simulation */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-950 uppercase tracking-wide border-b border-slate-100 pb-1.5 block">Notas y Bitácora</span>
                <div className="rounded-xl border border-slate-100 bg-amber-50/50 p-3 text-xs text-amber-900 leading-relaxed space-y-1.5">
                  <p className="font-semibold text-amber-950">Nota de Seguimiento:</p>
                  <p>Interesado en la automatización de procesos internos. El cliente reporta que su volumen de contactos ha crecido un 30% y su herramienta actual es inestable. Coordinando demo de Verini Enterprise.</p>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="border-t border-slate-100 pt-5 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block">Zona de Peligro</span>
                <Button 
                  variant="destructive" 
                  className="w-full gap-2 text-xs"
                  onClick={() => handleDeleteContact(selectedContact.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar este Contacto definitivamente
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Dialog: Create Contact (from internal triggers) */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateContact}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold font-heading text-slate-900">Añadir Nuevo Contacto</DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Registra un contacto o lead potencial en el sistema Verini CRM.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-xs font-semibold text-slate-500">Nombre *</label>
                <Input 
                  required
                  placeholder="ej. Juan Pérez" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="col-span-3 text-xs" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-xs font-semibold text-slate-500">Email *</label>
                <Input 
                  required
                  type="email"
                  placeholder="juan@empresa.com" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="col-span-3 text-xs" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-xs font-semibold text-slate-500">Empresa *</label>
                <Input 
                  required
                  placeholder="ej. Iberia Tech" 
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  className="col-span-3 text-xs" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-xs font-semibold text-slate-500">Teléfono</label>
                <Input 
                  placeholder="+34 600 000 000" 
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="col-span-3 text-xs" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-xs font-semibold text-slate-500">Tipo</label>
                <select 
                  value={status} 
                  onChange={e => setStatus(e.target.value as any)}
                  className="col-span-3 text-xs rounded-md border border-slate-200 bg-white p-2.5 outline-none focus:border-indigo-500"
                >
                  <option value="Lead">Lead Cualificado</option>
                  <option value="Contact">Contacto Simple</option>
                  <option value="Customer">Cliente Activo</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-xs font-semibold text-slate-500">Valor Est.</label>
                <Input 
                  type="number"
                  placeholder="5000" 
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  className="col-span-3 text-xs" 
                />
              </div>
            </div>
            <DialogFooter className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={() => setIsAddDialogOpen(false)} className="text-xs">
                Cancelar
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
                Guardar Contacto
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
