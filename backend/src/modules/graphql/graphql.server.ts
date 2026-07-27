import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs } from './typeDefs.js';
import { resolvers, GraphQLContext } from './resolvers.js';
import { verifyAccessToken } from '../../utils/jwt.js';
import { redisClient } from '../../utils/redis.js';
import { Express } from 'express';

export async function setupGraphQL(app: Express): Promise<void> {
  const server = new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers
  });

  await server.start();

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return {};
        }

        const token = authHeader.split(' ')[1];
        try {
          const decoded = verifyAccessToken(token);
          if (redisClient.isOpen) {
            const isBlacklisted = await redisClient.get(`blacklist:${decoded.jti}`);
            if (isBlacklisted) return {};
          }
          return {
            user: {
              userId: decoded.sub,
              organizationId: decoded.org,
              role: decoded.role
            }
          };
        } catch {
          return {};
        }
      }
    })
  );
}
