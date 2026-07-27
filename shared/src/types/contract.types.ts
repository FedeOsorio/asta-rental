export type ContractStatus = 'active' | 'expired' | 'terminated';

export interface Contract {
  id: string;
  organizationId: string;
  propertyId: string;
  renterId: string;
  startDate: string; // ISO Date String YYYY-MM-DD
  endDate: string;   // ISO Date String YYYY-MM-DD
  monthlyRent: number;
  status: ContractStatus;
  createdAt: Date;
}
