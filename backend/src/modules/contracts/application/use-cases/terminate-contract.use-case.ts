import { ContractRepositoryPort } from '../../domain/ports/contract-repository.port.js';
import { ContractEntity } from '../../domain/contract.entity.js';

export class TerminateContractUseCase {
  constructor(private readonly contractRepo: ContractRepositoryPort) {}

  async execute(organizationId: string, id: string): Promise<ContractEntity> {
    const contract = await this.contractRepo.findById(organizationId, id);
    if (!contract) {
      throw new Error('CONTRACT_NOT_FOUND');
    }
    if (!contract.isActive()) {
      throw new Error('CONTRACT_ALREADY_TERMINATED');
    }

    return this.contractRepo.terminateContract(organizationId, contract.id, contract.propertyId);
  }
}
