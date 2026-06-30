import { Contact, Deal, Campaign, Activity } from './types';

export const initialContacts: Contact[] = [
  {
    id: 'c1',
    name: 'Alejandro Sanz',
    email: 'alejandro@acme.com',
    phone: '+34 612 345 678',
    company: 'Acme Corporación',
    status: 'Customer',
    value: 12500,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    lastContacted: '2026-06-28',
  },
  {
    id: 'c2',
    name: 'Sofía Vergara',
    email: 'sofia@colombia.co',
    phone: '+34 623 456 789',
    company: 'Media Global',
    status: 'Lead',
    value: 8200,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    lastContacted: '2026-06-29',
  },
  {
    id: 'c3',
    name: 'Mateo Kovacic',
    email: 'm.kovacic@techsolutions.com',
    phone: '+44 7911 123456',
    company: 'TechSolutions Ltd',
    status: 'Contact',
    value: 4500,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    lastContacted: '2026-06-25',
  },
  {
    id: 'c4',
    name: 'Lucía Lapuerta',
    email: 'lucia@lapuerta-asoc.es',
    phone: '+34 688 123 456',
    company: 'Lapuerta & Asociados',
    status: 'Customer',
    value: 24000,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80',
    lastContacted: '2026-06-27',
  },
  {
    id: 'c5',
    name: 'Carlos Alcaraz',
    email: 'carlos@murciatennis.es',
    phone: '+34 655 987 654',
    company: 'Vanguard Brands',
    status: 'Lead',
    value: 15000,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
    lastContacted: '2026-06-30',
  },
  {
    id: 'c6',
    name: 'Elena Furiase',
    email: 'elena@furiasedigital.com',
    phone: '+34 677 555 444',
    company: 'Furiase Digital',
    status: 'Churned',
    value: 0,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    lastContacted: '2026-05-15',
  }
];

export const initialDeals: Deal[] = [
  {
    id: 'd1',
    title: 'Migración Cloud Empresarial',
    contactName: 'Alejandro Sanz',
    company: 'Acme Corporación',
    value: 12500,
    stage: 'Closed Won',
    probability: 100,
    expectedCloseDate: '2026-06-28',
  },
  {
    id: 'd2',
    title: 'Licenciamiento Anual Verini Plus',
    contactName: 'Sofía Vergara',
    company: 'Media Global',
    value: 8200,
    stage: 'Proposal',
    probability: 60,
    expectedCloseDate: '2026-07-15',
  },
  {
    id: 'd3',
    title: 'Consultoría e Integración Hub',
    contactName: 'Mateo Kovacic',
    company: 'TechSolutions Ltd',
    value: 4500,
    stage: 'Qualification',
    probability: 30,
    expectedCloseDate: '2026-08-01',
  },
  {
    id: 'd4',
    title: 'Soporte y Auditoría de Ciberseguridad',
    contactName: 'Lucía Lapuerta',
    company: 'Lapuerta & Asociados',
    value: 24000,
    stage: 'Negotiation',
    probability: 85,
    expectedCloseDate: '2026-07-10',
  },
  {
    id: 'd5',
    title: 'Campaña de Marketing Digital Integral',
    contactName: 'Carlos Alcaraz',
    company: 'Vanguard Brands',
    value: 15000,
    stage: 'Prospect',
    probability: 10,
    expectedCloseDate: '2026-09-30',
  }
];

export const initialCampaigns: Campaign[] = [
  {
    id: 'cam1',
    name: 'Campaña Email Black Friday 2026',
    type: 'Email',
    status: 'Completed',
    spent: 1200,
    revenue: 15400,
    leadsGenerated: 245,
  },
  {
    id: 'cam2',
    name: 'Anuncios LinkedIn Lead Gen Q2',
    type: 'Social',
    status: 'Active',
    spent: 3500,
    revenue: 18900,
    leadsGenerated: 182,
  },
  {
    id: 'cam3',
    name: 'Google Ads Búsqueda Clave - CRM',
    type: 'Search',
    status: 'Active',
    spent: 4000,
    revenue: 9500,
    leadsGenerated: 94,
  },
  {
    id: 'cam4',
    name: 'Webinar: Automatización de Ventas con IA',
    type: 'Webinar',
    status: 'Scheduled',
    spent: 500,
    revenue: 0,
    leadsGenerated: 320,
  }
];

export const initialActivities: Activity[] = [
  {
    id: 'a1',
    type: 'Call',
    description: 'Llamada de seguimiento para negociar términos del contrato',
    contactName: 'Lucía Lapuerta',
    date: '2026-06-30T10:00:00Z',
    status: 'Completed',
  },
  {
    id: 'a2',
    type: 'Email',
    description: 'Envío de propuesta económica adaptada',
    contactName: 'Sofía Vergara',
    date: '2026-06-29T15:30:00Z',
    status: 'Completed',
  },
  {
    id: 'a3',
    type: 'Meeting',
    description: 'Reunión de demostración técnica del sistema Verini',
    contactName: 'Carlos Alcaraz',
    date: '2026-07-02T11:00:00Z',
    status: 'Pending',
  },
  {
    id: 'a4',
    type: 'Task',
    description: 'Preparar informe de rentabilidad y retorno de inversión',
    contactName: 'Mateo Kovacic',
    date: '2026-07-01T09:00:00Z',
    status: 'Pending',
  }
];

// Helper to initialize local storage data once
export function initializeLocalStorage() {
  if (typeof window !== 'undefined') {
    if (!localStorage.getItem('verini_contacts')) {
      localStorage.setItem('verini_contacts', JSON.stringify(initialContacts));
    }
    if (!localStorage.getItem('verini_deals')) {
      localStorage.setItem('verini_deals', JSON.stringify(initialDeals));
    }
    if (!localStorage.getItem('verini_campaigns')) {
      localStorage.setItem('verini_campaigns', JSON.stringify(initialCampaigns));
    }
    if (!localStorage.getItem('verini_activities')) {
      localStorage.setItem('verini_activities', JSON.stringify(initialActivities));
    }
  }
}

// Data loaders and savers
export function getStoredContacts(): Contact[] {
  initializeLocalStorage();
  const data = localStorage.getItem('verini_contacts');
  return data ? JSON.parse(data) : initialContacts;
}

export function saveStoredContacts(contacts: Contact[]) {
  localStorage.setItem('verini_contacts', JSON.stringify(contacts));
}

export function getStoredDeals(): Deal[] {
  initializeLocalStorage();
  const data = localStorage.getItem('verini_deals');
  return data ? JSON.parse(data) : initialDeals;
}

export function saveStoredDeals(deals: Deal[]) {
  localStorage.setItem('verini_deals', JSON.stringify(deals));
}

export function getStoredCampaigns(): Campaign[] {
  initializeLocalStorage();
  const data = localStorage.getItem('verini_campaigns');
  return data ? JSON.parse(data) : initialCampaigns;
}

export function saveStoredCampaigns(campaigns: Campaign[]) {
  localStorage.setItem('verini_campaigns', JSON.stringify(campaigns));
}

export function getStoredActivities(): Activity[] {
  initializeLocalStorage();
  const data = localStorage.getItem('verini_activities');
  return data ? JSON.parse(data) : initialActivities;
}

export function saveStoredActivities(activities: Activity[]) {
  localStorage.setItem('verini_activities', JSON.stringify(activities));
}
