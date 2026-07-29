import { Request, Response, NextFunction } from 'express';
import { createRenterSchema, updateRenterSchema } from '@asta-rental/shared';
import { DrizzleRenterRepository } from '../persistence/drizzle-renter.repository.js';
import { CreateRenterUseCase } from '../../application/use-cases/create-renter.use-case.js';
import { ListRentersUseCase } from '../../application/use-cases/list-renters.use-case.js';
import { GetRenterByIdUseCase } from '../../application/use-cases/get-renter-by-id.use-case.js';
import { UpdateRenterUseCase } from '../../application/use-cases/update-renter.use-case.js';

import { DeleteRenterUseCase } from '../../application/use-cases/delete-renter.use-case.js';

const renterRepo = new DrizzleRenterRepository();

const createRenterUseCase = new CreateRenterUseCase(renterRepo);
const listRentersUseCase = new ListRentersUseCase(renterRepo);
const getRenterByIdUseCase = new GetRenterByIdUseCase(renterRepo);
const updateRenterUseCase = new UpdateRenterUseCase(renterRepo);
const deleteRenterUseCase = new DeleteRenterUseCase(renterRepo);

export class RenterController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = createRenterSchema.parse(req.body);
      const renter = await createRenterUseCase.execute(req.user!.organizationId, validatedInput);
      res.status(201).json(renter);
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const renters = await listRentersUseCase.execute(req.user!.organizationId);
      res.status(200).json(renters);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const renter = await getRenterByIdUseCase.execute(req.user!.organizationId, req.params.id);
      res.status(200).json(renter);
    } catch (error: any) {
      if (error.message === 'RENTER_NOT_FOUND') {
        res.status(404).json({ error: 'Renter not found' });
        return;
      }
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = updateRenterSchema.parse(req.body);
      const updated = await updateRenterUseCase.execute(
        req.user!.organizationId,
        req.params.id,
        validatedInput
      );
      res.status(200).json(updated);
    } catch (error: any) {
      if (error.message === 'RENTER_NOT_FOUND') {
        res.status(404).json({ error: 'Renter not found' });
        return;
      }
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await deleteRenterUseCase.execute(req.user!.organizationId, req.params.id);
      res.status(200).json({ message: 'Renter deleted successfully' });
    } catch (error: any) {
      if (error.message === 'RENTER_NOT_FOUND') {
        res.status(404).json({ error: 'Renter not found' });
        return;
      }
      next(error);
    }
  }
}
