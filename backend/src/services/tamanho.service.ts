import { AppError } from '../errors/AppError.js';
import { databaseRepository } from '../repositories/database.repository.js';

export class TamanhoService {
  async findAll(): Promise<string[]> {
    const db = await databaseRepository.read();
    return [...(db.configuracoes.tamanhos ?? [])];
  }

  async create(nome: string): Promise<string[]> {
    if (!nome?.trim()) {
      throw new AppError('Nome do tamanho é obrigatório');
    }

    await databaseRepository.write((db) => {
      if (!db.configuracoes.tamanhos) {
        db.configuracoes.tamanhos = [];
      }

      const exists = db.configuracoes.tamanhos.some(
        (t) => t.toLowerCase() === nome.trim().toLowerCase()
      );
      if (exists) {
        throw new AppError('Tamanho já existe', 409, 'DUPLICATE');
      }
      db.configuracoes.tamanhos.push(nome.trim());
    });

    return this.findAll();
  }

  async update(nomeAntigo: string, nomeNovo: string): Promise<string[]> {
    if (!nomeNovo?.trim()) {
      throw new AppError('Nome do tamanho é obrigatório');
    }

    await databaseRepository.write((db) => {
      const tamanhos = db.configuracoes.tamanhos ?? [];
      const index = tamanhos.findIndex(
        (t) => t.toLowerCase() === decodeURIComponent(nomeAntigo).toLowerCase()
      );
      if (index === -1) {
        throw new AppError('Tamanho não encontrado', 404);
      }

      const exists = tamanhos.some(
        (t, i) => i !== index && t.toLowerCase() === nomeNovo.trim().toLowerCase()
      );
      if (exists) {
        throw new AppError('Tamanho já existe', 409, 'DUPLICATE');
      }

      const oldName = tamanhos[index];
      tamanhos[index] = nomeNovo.trim();

      db.produtos.forEach((p) => {
        if (p.tamanho === oldName) {
          p.tamanho = nomeNovo.trim();
        }
      });
    });

    return this.findAll();
  }

  async delete(nome: string): Promise<string[]> {
    await databaseRepository.write((db) => {
      const decodedNome = decodeURIComponent(nome);
      const tamanhos = db.configuracoes.tamanhos ?? [];
      const index = tamanhos.findIndex(
        (t) => t.toLowerCase() === decodedNome.toLowerCase()
      );
      if (index === -1) {
        throw new AppError('Tamanho não encontrado', 404);
      }

      const inUse = db.produtos.some(
        (p) => (p.tamanho ?? '').toLowerCase() === decodedNome.toLowerCase()
      );
      if (inUse) {
        throw new AppError(
          'Não é possível excluir tamanho em uso por produtos',
          409,
          'IN_USE'
        );
      }

      tamanhos.splice(index, 1);
      db.configuracoes.tamanhos = tamanhos;
    });

    return this.findAll();
  }
}

export const tamanhoService = new TamanhoService();
