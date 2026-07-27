import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@asta-rental/shared';

export function roleGuard(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: No authenticated user found' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Forbidden: Insufficient privileges for this action'
      });
      return;
    }

    next();
  };
}
