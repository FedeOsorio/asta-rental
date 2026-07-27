import { PropertyEntity } from '../property.entity.js';
import { CreatePropertyInput, UpdatePropertyInput, PropertyStatus } from '@asta-rental/shared';

export interface PropertyRepositoryPort {
  create(organizationId: string, input: CreatePropertyInput): Promise<PropertyEntity>;
  findAll(organizationId: string, statusFilter?: PropertyStatus): Promise<PropertyEntity[]>;
  findById(organizationId: string, id: string): Promise<PropertyEntity | null>;
  update(organizationId: string, id: string, input: UpdatePropertyInput): Promise<PropertyEntity | null>;
  softDelete(organizationId: string, id: string): Promise<boolean>;
}
