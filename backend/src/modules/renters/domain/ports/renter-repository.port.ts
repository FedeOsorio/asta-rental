import { RenterEntity } from '../renter.entity.js';
import { CreateRenterInput, UpdateRenterInput } from '@asta-rental/shared';

export interface RenterRepositoryPort {
  create(organizationId: string, input: CreateRenterInput): Promise<RenterEntity>;
  findAll(organizationId: string): Promise<RenterEntity[]>;
  findById(organizationId: string, id: string): Promise<RenterEntity | null>;
  update(organizationId: string, id: string, input: UpdateRenterInput): Promise<RenterEntity | null>;
  delete(organizationId: string, id: string): Promise<boolean>;
}
