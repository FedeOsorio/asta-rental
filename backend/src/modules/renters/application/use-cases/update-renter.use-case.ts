import { RenterRepositoryPort } from '../../domain/ports/renter-repository.port.js';
import { RenterEntity } from '../../domain/renter.entity.js';
import { UpdateRenterInput } from '@asta-rental/shared';

export class UpdateRenterUseCase {
  constructor(private readonly renterRepo: RenterRepositoryPort) {}

  async execute(organizationId: string, id: string, input: UpdateRenterInput): Promise<RenterEntity> {
    const updated = await this.renterRepo.update(organizationId, id, input);
    if (!updated) {
      throw new Error('RENTER_NOT_FOUND');
    }
    return updated;
  }
}
