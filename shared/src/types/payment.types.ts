export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

export interface Payment {
  id: string;
  organizationId: string;
  contractId: string;
  dueDate: string;      // ISO Date String YYYY-MM-DD
  paidDate: string | null; // ISO Date String YYYY-MM-DD
  amount: number;
  status: PaymentStatus;
  createdAt: Date;
}

export interface CollectionDashboard {
  totalCollected: number;
  totalPending: number;
  totalOverdue: number;
  byProperty: Array<{
    propertyId: string;
    address: string;
    collected: number;
    pending: number;
    overdue: number;
  }>;
}
