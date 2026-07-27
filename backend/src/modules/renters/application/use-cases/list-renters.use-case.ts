import { RenterRepositoryPort } from '../../domain/ports/renter-repository.port.js';
import { RenterEntity } from '../../domain/renter.entity.js';

export class ListRentersUseCase {
  constructor(private readonly renterRepo: RenterRepositoryPort) {}

  async execute(organizationId: string): Promise<RenterEntity[]> {
    return this.renterRepo.findAll(organizationId);
  }
}
