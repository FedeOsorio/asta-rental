import { ContractRepositoryPort } from '../../domain/ports/contract-repository.port.js';
import { PropertyRepositoryPort } from '../../../properties/domain/ports/property-repository.port.js';
import { ContractEntity } from '../../domain/contract.entity.js';
import { generateMonthlyPaymentDates } from '../../domain/payment-date-generator.js';
import { CreateContractInput } from '@asta-rental/shared';

export class CreateContractUseCase {
  constructor(
    private readonly contractRepo: ContractRepositoryPort,
    private readonly propertyRepo: PropertyRepositoryPort
  ) {}

  async execute(organizationId: string, input: CreateContractInput): Promise<ContractEntity> {
    // 1. Verify property availability
    const property = await this.propertyRepo.findById(organizationId, input.propertyId);
    if (!property || property.isDeleted()) {
      throw new Error('PROPERTY_NOT_FOUND');
    }
    if (!property.isAvailable()) {
      throw new Error('PROPERTY_NOT_AVAILABLE');
    }

    // 2. Generate monthly payment dates schedule
    const dueDates = generateMonthlyPaymentDates(input.startDate, input.endDate);

    // 3. Execute transactional creation
    return this.contractRepo.createContractWithPayments(organizationId, input, dueDates);
  }
}
