import { PropertyRepositoryPort } from '../../domain/ports/property-repository.port.js';
import { PropertyEntity } from '../../domain/property.entity.js';
import { PropertyStatus } from '@asta-rental/shared';

export class ListPropertiesUseCase {
  constructor(private readonly propertyRepo: PropertyRepositoryPort) {}

  async execute(organizationId: string, statusFilter?: PropertyStatus): Promise<PropertyEntity[]> {
    return this.propertyRepo.findAll(organizationId, statusFilter);
  }
}
