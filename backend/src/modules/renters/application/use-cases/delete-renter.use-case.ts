import { RenterRepositoryPort } from '../../domain/ports/renter-repository.port.js';

export class DeleteRenterUseCase {
  constructor(private readonly renterRepo: RenterRepositoryPort) {}

  async execute(organizationId: string, id: string): Promise<void> {
    const success = await this.renterRepo.delete(organizationId, id);
    if (!success) {
      throw new Error('RENTER_NOT_FOUND');
    }
  }
}
