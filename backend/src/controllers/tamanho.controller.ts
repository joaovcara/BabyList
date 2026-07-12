import { Request, Response, NextFunction } from 'express';
import { tamanhoService } from '../services/tamanho.service.js';

function paramString(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export class TamanhoController {
  async findAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tamanhos = await tamanhoService.findAll();
      res.json(tamanhos);
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { nome } = req.body;
      const tamanhos = await tamanhoService.create(nome);
      res.status(201).json(tamanhos);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { nome } = req.body;
      const tamanhos = await tamanhoService.update(paramString(req.params.nome), nome);
      res.json(tamanhos);
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tamanhos = await tamanhoService.delete(paramString(req.params.nome));
      res.json(tamanhos);
    } catch (err) {
      next(err);
    }
  }
}

export const tamanhoController = new TamanhoController();
