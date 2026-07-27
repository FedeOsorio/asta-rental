import { DrizzlePropertyRepository } from '../properties/infrastructure/persistence/drizzle-property.repository.js';
import { DrizzleRenterRepository } from '../renters/infrastructure/persistence/drizzle-renter.repository.js';
import { DrizzleContractRepository } from '../contracts/infrastructure/persistence/drizzle-contract.repository.js';
import { DrizzlePaymentRepository } from '../payments/infrastructure/persistence/drizzle-payment.repository.js';
import { RedisDashboardCacheAdapter } from '../payments/infrastructure/cache/redis-dashboard-cache.adapter.js';
import { GetCollectionDashboardUseCase } from '../dashboard/application/use-cases/get-collection-dashboard.use-case.js';
import { UserRole } from '@asta-rental/shared';

const propertyRepo = new DrizzlePropertyRepository();
const renterRepo = new DrizzleRenterRepository();
const contractRepo = new DrizzleContractRepository();
const paymentRepo = new DrizzlePaymentRepository();
const paymentCache = new RedisDashboardCacheAdapter();

const getCollectionDashboardUseCase = new GetCollectionDashboardUseCase(paymentRepo, paymentCache);

export interface GraphQLContext {
  user?: {
    userId: string;
    organizationId: string;
    role: UserRole;
  };
}

export const resolvers = {
  Query: {
    properties: async (_parent: unknown, args: { status?: any }, context: GraphQLContext) => {
      if (!context.user) throw new Error('Unauthorized');
      return propertyRepo.findAll(context.user.organizationId, args.status);
    },
    property: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      if (!context.user) throw new Error('Unauthorized');
      return propertyRepo.findById(context.user.organizationId, args.id);
    },
    renters: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      if (!context.user) throw new Error('Unauthorized');
      return renterRepo.findAll(context.user.organizationId);
    },
    contract: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      if (!context.user) throw new Error('Unauthorized');
      return contractRepo.findById(context.user.organizationId, args.id);
    },
    payments: async (_parent: unknown, args: { status?: any }, context: GraphQLContext) => {
      if (!context.user) throw new Error('Unauthorized');
      return paymentRepo.findAll(context.user.organizationId, args.status);
    },
    collectionDashboard: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      if (!context.user) throw new Error('Unauthorized');
      return getCollectionDashboardUseCase.execute(context.user.organizationId);
    }
  },
  Contract: {
    property: async (parent: { organizationId: string; propertyId: string }) => {
      return propertyRepo.findById(parent.organizationId, parent.propertyId);
    },
    renter: async (parent: { organizationId: string; renterId: string }) => {
      return renterRepo.findById(parent.organizationId, parent.renterId);
    },
    payments: async (parent: { organizationId: string; id: string }) => {
      const allPayments = await paymentRepo.findAll(parent.organizationId);
      return allPayments.filter((p) => p.contractId === parent.id);
    }
  }
};
