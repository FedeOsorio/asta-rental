import { RenterRepositoryPort } from '../../domain/ports/renter-repository.port.js';
import { RenterEntity } from '../../domain/renter.entity.js';

export class GetRenterByIdUseCase {
  constructor(private readonly renterRepo: RenterRepositoryPort) {}

  async execute(organizationId: string, id: string): Promise<RenterEntity> {
    const renter = await this.renterRepo.findById(organizationId, id);
    if (!renter) {
      throw new Error('RENTER_NOT_FOUND');
    }
    return renter;
  }
}
