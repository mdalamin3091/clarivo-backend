import { Request, Response, NextFunction } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../lib/auth';

export interface AuthenticatedRequest extends Request {
  user: { id: string; name: string; email: string; image?: string | null };
  session: {
    id: string;
    userId: string;
    token: string;
    activeOrganizationId?: string | null;
    expiresAt: Date;
  };
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const sessionData = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!sessionData) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  (req as AuthenticatedRequest).user = sessionData.user;
  (req as AuthenticatedRequest).session = sessionData.session;
  next();
};

export const requireOrg = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authReq = req as AuthenticatedRequest;

  if (!authReq.session?.activeOrganizationId) {
    res.status(403).json({ success: false, message: 'No active organization' });
    return;
  }

  next();
};
