import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreatePropertyUseCase } from '../../src/modules/properties/application/use-cases/create-property.use-case.js';
import { PropertyRepositoryPort } from '../../src/modules/properties/domain/ports/property-repository.port.js';
import { PropertyEntity } from '../../src/modules/properties/domain/property.entity.js';

describe('CreatePropertyUseCase (Hexagonal Unit Test)', () => {
  let mockPropertyRepo: PropertyRepositoryPort;
  let useCase: CreatePropertyUseCase;

  const mockProperty = new PropertyEntity(
    'prop-uuid-1',
    'org-uuid-1',
    '123 Main St',
    'apartment',
    1200,
    'available',
    null,
    new Date()
  );

  beforeEach(() => {
    mockPropertyRepo = {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      softDelete: vi.fn()
    };

    useCase = new CreatePropertyUseCase(mockPropertyRepo);
  });

  it('should create property through repository port', async () => {
    vi.mocked(mockPropertyRepo.create).mockResolvedValue(mockProperty);

    const result = await useCase.execute('org-uuid-1', {
      address: '123 Main St',
      type: 'apartment',
      monthlyRent: 1200
    });

    expect(result.id).toBe('prop-uuid-1');
    expect(result.address).toBe('123 Main St');
    expect(mockPropertyRepo.create).toHaveBeenCalledWith('org-uuid-1', {
      address: '123 Main St',
      type: 'apartment',
      monthlyRent: 1200
    });
  });
});
