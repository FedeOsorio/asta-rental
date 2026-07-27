import { RenterRepositoryPort } from '../../domain/ports/renter-repository.port.js';
import { RenterEntity } from '../../domain/renter.entity.js';
import { CreateRenterInput } from '@asta-rental/shared';

export class CreateRenterUseCase {
  constructor(private readonly renterRepo: RenterRepositoryPort) {}

  async execute(organizationId: string, input: CreateRenterInput): Promise<RenterEntity> {
    return this.renterRepo.create(organizationId, input);
  }
}
