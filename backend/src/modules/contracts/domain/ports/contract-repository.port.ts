import { ContractEntity } from '../contract.entity.js';
import { CreateContractInput } from '@asta-rental/shared';

export interface ContractRepositoryPort {
  createContractWithPayments(
    organizationId: string,
    input: CreateContractInput,
    paymentDueDates: string[]
  ): Promise<ContractEntity>;
  findById(organizationId: string, id: string): Promise<ContractEntity | null>;
  terminateContract(organizationId: string, contractId: string, propertyId: string): Promise<ContractEntity>;
}
