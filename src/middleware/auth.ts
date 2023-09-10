import { Response, Request, NextFunction } from 'express';

import User, { IUserModel } from '../models/user';

const auth = (req: Request, res: Response, next: NextFunction) => {
  let token = req.headers?.authorization || req.cookies?.auth;

  if (!token) {
    return res.status(401).json({
      error: 'Access Denied',
    });
  }

  (User as any).findByToken(token, (err: Error, user: IUserModel) => {
    if (err) throw err;
    if (!user)
      return res.status(401).json({
        error: 'Access Denied',
      });
    if (!user.verifiedEmail)
      return res.status(401).json({
        error: 'Your email address has not been verified',
      });
    if (!user.active)
      return res.status(403).json({
        error: 'This user has been removed and cannot be used',
      });
    (req as any).token = token;
    (req as any).user = user;
    next();
  });
};

export { auth };
