import { PaymentEntity } from '../payment.entity.js';
import { PaymentStatus, CollectionDashboard } from '@asta-rental/shared';

export interface PaymentRepositoryPort {
  findAll(organizationId: string, statusFilter?: PaymentStatus): Promise<PaymentEntity[]>;
  findById(organizationId: string, id: string): Promise<PaymentEntity | null>;
  markPaid(organizationId: string, id: string, paidDateStr?: string): Promise<PaymentEntity | null>;
  calculateDashboardMetrics(organizationId: string): Promise<CollectionDashboard>;
  runOverdueMaintenance(organizationId: string): Promise<number>;
}
