import { Request, Response, NextFunction } from 'express';

function paramString(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

function paramId(value: string | string[]): number {
  return parseInt(Array.isArray(value) ? value[0] : value, 10);
}
import { categoriaService, configService } from '../services/categoria.service.js';

export class CategoriaController {
  async findAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categorias = await categoriaService.findAll();
      res.json(categorias);
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { nome } = req.body;
      const categorias = await categoriaService.create(nome);
      res.status(201).json(categorias);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { nome } = req.body;
      const categorias = await categoriaService.update(paramString(req.params.nome), nome);
      res.json(categorias);
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categorias = await categoriaService.delete(paramString(req.params.nome));
      res.json(categorias);
    } catch (err) {
      next(err);
    }
  }
}

export class ConfigController {
  async get(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const config = await configService.get();
      res.json({
        tituloLista: config.tituloLista,
        nomeBebe: config.nomeBebe,
      });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tituloLista, nomeBebe, senhaAtual, senhaNova } = req.body;
      const config = await configService.update(
        { tituloLista, nomeBebe },
        req.user?.userId,
        senhaAtual,
        senhaNova
      );
      res.json({
        tituloLista: config.tituloLista,
        nomeBebe: config.nomeBebe,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const categoriaController = new CategoriaController();
export const configController = new ConfigController();
