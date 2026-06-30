export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'Lead' | 'Contact' | 'Customer' | 'Churned';
  value: number;
  avatar?: string;
  lastContacted: string;
}

export interface Deal {
  id: string;
  title: string;
  contactName: string;
  company: string;
  value: number;
  stage: 'Prospect' | 'Qualification' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  probability: number;
  expectedCloseDate: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: 'Email' | 'Social' | 'Search' | 'Webinar';
  status: 'Draft' | 'Scheduled' | 'Active' | 'Completed';
  spent: number;
  revenue: number;
  leadsGenerated: number;
}

export interface Activity {
  id: string;
  type: 'Call' | 'Email' | 'Meeting' | 'Task';
  description: string;
  contactName: string;
  date: string;
  status: 'Pending' | 'Completed';
}
