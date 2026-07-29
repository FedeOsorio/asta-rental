export interface CommunicationDraft {
  id: string;
  type: string;
  content: string;
  status: 'draft' | 'approved' | 'sent' | 'rejected';
  createdAt: string | Date;
  renterName: string;
}

export interface MaintenanceTicket {
  id: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  category: 'plumbing' | 'electrical' | 'gas' | 'structural' | 'other';
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string | Date;
  renterName: string | null;
}
