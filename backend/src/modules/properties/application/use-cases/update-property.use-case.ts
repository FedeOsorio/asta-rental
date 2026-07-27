import { PropertyRepositoryPort } from '../../domain/ports/property-repository.port.js';
import { PropertyEntity } from '../../domain/property.entity.js';
import { UpdatePropertyInput } from '@asta-rental/shared';

export class UpdatePropertyUseCase {
  constructor(private readonly propertyRepo: PropertyRepositoryPort) {}

  async execute(organizationId: string, id: string, input: UpdatePropertyInput): Promise<PropertyEntity> {
    const updated = await this.propertyRepo.update(organizationId, id, input);
    if (!updated) {
      throw new Error('PROPERTY_NOT_FOUND');
    }
    return updated;
  }
}
