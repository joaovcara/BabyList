import { Request, Response, NextFunction } from 'express';

function paramId(value: string | string[]): number {
  return parseInt(Array.isArray(value) ? value[0] : value, 10);
}
import { reservaService } from '../services/reserva.service.js';

export class ReservaController {
  async findAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reservas = await reservaService.findAll();
      res.json(reservas);
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { produtoId, nome, quantidade, mensagem } = req.body;
      const reserva = await reservaService.create({
        produtoId,
        nome,
        quantidade,
        mensagem,
      });
      res.status(201).json(reserva);
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = paramId(req.params.id);
      await reservaService.delete(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

export const reservaController = new ReservaController();
