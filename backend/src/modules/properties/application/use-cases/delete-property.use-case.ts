import { PropertyRepositoryPort } from '../../domain/ports/property-repository.port.js';

export class DeletePropertyUseCase {
  constructor(private readonly propertyRepo: PropertyRepositoryPort) {}

  async execute(organizationId: string, id: string): Promise<void> {
    const success = await this.propertyRepo.softDelete(organizationId, id);
    if (!success) {
      throw new Error('PROPERTY_NOT_FOUND');
    }
  }
}
