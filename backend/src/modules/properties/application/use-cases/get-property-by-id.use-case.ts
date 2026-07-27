import { PropertyRepositoryPort } from '../../domain/ports/property-repository.port.js';
import { PropertyEntity } from '../../domain/property.entity.js';

export class GetPropertyByIdUseCase {
  constructor(private readonly propertyRepo: PropertyRepositoryPort) {}

  async execute(organizationId: string, id: string): Promise<PropertyEntity> {
    const property = await this.propertyRepo.findById(organizationId, id);
    if (!property || property.isDeleted()) {
      throw new Error('PROPERTY_NOT_FOUND');
    }
    return property;
  }
}
