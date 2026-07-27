import { PaymentRepositoryPort } from '../../domain/ports/payment-repository.port.js';

export class RunOverdueMaintenanceUseCase {
  constructor(private readonly paymentRepo: PaymentRepositoryPort) {}

  async execute(organizationId: string): Promise<{ updatedCount: number }> {
    const updatedCount = await this.paymentRepo.runOverdueMaintenance(organizationId);
    return { updatedCount };
  }
}
