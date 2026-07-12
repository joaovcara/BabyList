import { Request, Response, NextFunction } from 'express';

function paramId(value: string | string[]): number {
  return parseInt(Array.isArray(value) ? value[0] : value, 10);
}

function paramString(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}
import { produtoService, dashboardService } from '../services/produto.service.js';

export class ProdutoController {
  async findAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const produtos = await produtoService.findAll();
      res.json(produtos);
    } catch (err) {
      next(err);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = paramId(req.params.id);
      const produto = await produtoService.findById(id);
      res.json(produto);
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { nome, categoria, necessario, possui } = req.body;
      const produto = await produtoService.create({
        nome,
        categoria,
        necessario: necessario ?? 0,
        possui: possui ?? 0,
      });
      res.status(201).json(produto);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = paramId(req.params.id);
      const produto = await produtoService.update(id, req.body);
      res.json(produto);
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = paramId(req.params.id);
      await produtoService.delete(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async receber(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = paramId(req.params.id);
      const { quantidade } = req.body;
      const produto = await produtoService.receber(id, quantidade);
      res.json(produto);
    } catch (err) {
      next(err);
    }
  }
}

export class DashboardController {
  async get(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await dashboardService.getDashboard();
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
}

export const produtoController = new ProdutoController();
export const dashboardController = new DashboardController();
