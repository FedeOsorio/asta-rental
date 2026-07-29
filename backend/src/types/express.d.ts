import { UserRole } from '@asta-rental/shared';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        organizationId: string;
        role: UserRole;
        email: string;
        jti: string;
        rawToken: string;
      };
    }
  }
}
