import { ContractRepositoryPort } from '../../domain/ports/contract-repository.port.js';
import { ContractEntity } from '../../domain/contract.entity.js';

export class GetContractByIdUseCase {
  constructor(private readonly contractRepo: ContractRepositoryPort) {}

  async execute(organizationId: string, id: string): Promise<ContractEntity> {
    const contract = await this.contractRepo.findById(organizationId, id);
    if (!contract) {
      throw new Error('CONTRACT_NOT_FOUND');
    }
    return contract;
  }
}
