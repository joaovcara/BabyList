import { AppError } from '../errors/AppError.js';
import { databaseRepository } from '../repositories/database.repository.js';
import { Configuracoes } from '../types/index.js';

export class CategoriaService {
  async findAll(): Promise<string[]> {
    const db = await databaseRepository.read();
    return [...db.configuracoes.categorias];
  }

  async create(nome: string): Promise<string[]> {
    if (!nome?.trim()) {
      throw new AppError('Nome da categoria é obrigatório');
    }

    await databaseRepository.write((db) => {
      const exists = db.configuracoes.categorias.some(
        (c) => c.toLowerCase() === nome.trim().toLowerCase()
      );
      if (exists) {
        throw new AppError('Categoria já existe', 409, 'DUPLICATE');
      }
      db.configuracoes.categorias.push(nome.trim());
    });

    return this.findAll();
  }

  async update(nomeAntigo: string, nomeNovo: string): Promise<string[]> {
    if (!nomeNovo?.trim()) {
      throw new AppError('Nome da categoria é obrigatório');
    }

    await databaseRepository.write((db) => {
      const index = db.configuracoes.categorias.findIndex(
        (c) => c.toLowerCase() === decodeURIComponent(nomeAntigo).toLowerCase()
      );
      if (index === -1) {
        throw new AppError('Categoria não encontrada', 404);
      }

      const exists = db.configuracoes.categorias.some(
        (c, i) => i !== index && c.toLowerCase() === nomeNovo.trim().toLowerCase()
      );
      if (exists) {
        throw new AppError('Categoria já existe', 409, 'DUPLICATE');
      }

      const oldName = db.configuracoes.categorias[index];
      db.configuracoes.categorias[index] = nomeNovo.trim();

      db.produtos.forEach((p) => {
        if (p.categoria === oldName) {
          p.categoria = nomeNovo.trim();
        }
      });
    });

    return this.findAll();
  }

  async delete(nome: string): Promise<string[]> {
    await databaseRepository.write((db) => {
      const decodedNome = decodeURIComponent(nome);
      const index = db.configuracoes.categorias.findIndex(
        (c) => c.toLowerCase() === decodedNome.toLowerCase()
      );
      if (index === -1) {
        throw new AppError('Categoria não encontrada', 404);
      }

      const inUse = db.produtos.some(
        (p) => p.categoria.toLowerCase() === decodedNome.toLowerCase()
      );
      if (inUse) {
        throw new AppError(
          'Não é possível excluir categoria em uso por produtos',
          409,
          'IN_USE'
        );
      }

      db.configuracoes.categorias.splice(index, 1);
    });

    return this.findAll();
  }
}

export class ConfigService {
  async get(): Promise<Configuracoes> {
    const db = await databaseRepository.read();
    return { ...db.configuracoes, categorias: [...db.configuracoes.categorias] };
  }

  async update(
    data: Partial<Pick<Configuracoes, 'tituloLista' | 'nomeBebe'>>,
    userId?: number,
    senhaAtual?: string,
    senhaNova?: string
  ): Promise<Configuracoes> {
    await databaseRepository.write((db) => {
      if (data.tituloLista !== undefined) {
        db.configuracoes.tituloLista = data.tituloLista.trim();
      }
      if (data.nomeBebe !== undefined) {
        db.configuracoes.nomeBebe = data.nomeBebe.trim();
      }
    });

    if (senhaNova && userId) {
      const { authService } = await import('./auth.service.js');
      await authService.changePassword(userId, senhaAtual || '', senhaNova);
    }

    return this.get();
  }
}

export const categoriaService = new CategoriaService();
export const configService = new ConfigService();
