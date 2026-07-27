import { PropertyRepositoryPort } from '../../domain/ports/property-repository.port.js';
import { PropertyEntity } from '../../domain/property.entity.js';
import { CreatePropertyInput } from '@asta-rental/shared';

export class CreatePropertyUseCase {
  constructor(private readonly propertyRepo: PropertyRepositoryPort) {}

  async execute(organizationId: string, input: CreatePropertyInput): Promise<PropertyEntity> {
    return this.propertyRepo.create(organizationId, input);
  }
}
