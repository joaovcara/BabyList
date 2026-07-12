import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';

export class AuthController {
  async setupStatus(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const needsSetup = await authService.needsSetup();
      res.json({ needsSetup });
    } catch (err) {
      next(err);
    }
  }

  async setup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { usuario, senha } = req.body;
      const result = await authService.setup(usuario, senha);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { usuario, senha } = req.body;
      const result = await authService.login(usuario, senha);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
