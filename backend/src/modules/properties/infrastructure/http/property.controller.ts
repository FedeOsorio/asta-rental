import { Request, Response, NextFunction } from 'express';
import { createPropertySchema, updatePropertySchema, PropertyStatus } from '@asta-rental/shared';
import { DrizzlePropertyRepository } from '../persistence/drizzle-property.repository.js';
import { CreatePropertyUseCase } from '../../application/use-cases/create-property.use-case.js';
import { ListPropertiesUseCase } from '../../application/use-cases/list-properties.use-case.js';
import { GetPropertyByIdUseCase } from '../../application/use-cases/get-property-by-id.use-case.js';
import { UpdatePropertyUseCase } from '../../application/use-cases/update-property.use-case.js';
import { DeletePropertyUseCase } from '../../application/use-cases/delete-property.use-case.js';

const propertyRepo = new DrizzlePropertyRepository();

const createPropertyUseCase = new CreatePropertyUseCase(propertyRepo);
const listPropertiesUseCase = new ListPropertiesUseCase(propertyRepo);
const getPropertyByIdUseCase = new GetPropertyByIdUseCase(propertyRepo);
const updatePropertyUseCase = new UpdatePropertyUseCase(propertyRepo);
const deletePropertyUseCase = new DeletePropertyUseCase(propertyRepo);

export class PropertyController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = createPropertySchema.parse(req.body);
      const property = await createPropertyUseCase.execute(req.user!.organizationId, validatedInput);
      res.status(201).json(property);
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const statusFilter = req.query.status as PropertyStatus | undefined;
      const properties = await listPropertiesUseCase.execute(req.user!.organizationId, statusFilter);
      res.status(200).json(properties);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const property = await getPropertyByIdUseCase.execute(req.user!.organizationId, req.params.id);
      res.status(200).json(property);
    } catch (error: any) {
      if (error.message === 'PROPERTY_NOT_FOUND') {
        res.status(404).json({ error: 'Property not found' });
        return;
      }
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = updatePropertySchema.parse(req.body);
      const updated = await updatePropertyUseCase.execute(
        req.user!.organizationId,
        req.params.id,
        validatedInput
      );
      res.status(200).json(updated);
    } catch (error: any) {
      if (error.message === 'PROPERTY_NOT_FOUND') {
        res.status(404).json({ error: 'Property not found' });
        return;
      }
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await deletePropertyUseCase.execute(req.user!.organizationId, req.params.id);
      res.status(200).json({ message: 'Property deleted successfully' });
    } catch (error: any) {
      if (error.message === 'PROPERTY_NOT_FOUND') {
        res.status(404).json({ error: 'Property not found' });
        return;
      }
      next(error);
    }
  }
}
