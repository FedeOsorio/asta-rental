import { Request, Response, NextFunction } from 'express';
import { createContractSchema } from '@asta-rental/shared';
import { DrizzleContractRepository } from '../persistence/drizzle-contract.repository.js';
import { DrizzlePropertyRepository } from '../../../properties/infrastructure/persistence/drizzle-property.repository.js';
import { CreateContractUseCase } from '../../application/use-cases/create-contract.use-case.js';
import { GetContractByIdUseCase } from '../../application/use-cases/get-contract-by-id.use-case.js';
import { TerminateContractUseCase } from '../../application/use-cases/terminate-contract.use-case.js';

const contractRepo = new DrizzleContractRepository();
const propertyRepo = new DrizzlePropertyRepository();

const createContractUseCase = new CreateContractUseCase(contractRepo, propertyRepo);
const getContractByIdUseCase = new GetContractByIdUseCase(contractRepo);
const terminateContractUseCase = new TerminateContractUseCase(contractRepo);

export class ContractController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = createContractSchema.parse(req.body);
      const contract = await createContractUseCase.execute(req.user!.organizationId, validatedInput);
      res.status(201).json(contract);
    } catch (error: any) {
      if (error.message === 'PROPERTY_NOT_AVAILABLE') {
        res.status(409).json({ error: 'Conflict: Property is not available for lease' });
        return;
      }
      if (error.message === 'PROPERTY_NOT_FOUND') {
        res.status(404).json({ error: 'Property not found' });
        return;
      }
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const contract = await getContractByIdUseCase.execute(req.user!.organizationId, req.params.id);
      res.status(200).json(contract);
    } catch (error: any) {
      if (error.message === 'CONTRACT_NOT_FOUND') {
        res.status(404).json({ error: 'Contract not found' });
        return;
      }
      next(error);
    }
  }

  static async terminate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const contract = await terminateContractUseCase.execute(req.user!.organizationId, req.params.id);
      res.status(200).json(contract);
    } catch (error: any) {
      if (error.message === 'CONTRACT_NOT_FOUND') {
        res.status(404).json({ error: 'Contract not found' });
        return;
      }
      if (error.message === 'CONTRACT_ALREADY_TERMINATED') {
        res.status(400).json({ error: 'Contract is already terminated' });
        return;
      }
      next(error);
    }
  }
}
