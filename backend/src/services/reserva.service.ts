import { AppError } from '../errors/AppError.js';
import { databaseRepository } from '../repositories/database.repository.js';
import { calcularDisponivel, nextId } from '../utils/calculations.js';
import { Reserva } from '../types/index.js';

export interface ReservaComProduto extends Reserva {
  produtoNome: string;
}

export class ReservaService {
  async findAll(): Promise<ReservaComProduto[]> {
    const db = await databaseRepository.read();
    return db.reservas.map((r) => {
      const produto = db.produtos.find((p) => p.id === r.produtoId);
      return {
        ...r,
        produtoNome: produto?.nome ?? 'Produto removido',
      };
    });
  }

  async create(data: {
    produtoId: number;
    nome: string;
    quantidade: number;
    mensagem?: string;
  }): Promise<ReservaComProduto> {
    if (!data.nome?.trim()) {
      throw new AppError('Nome é obrigatório');
    }
    if (!Number.isInteger(data.quantidade) || data.quantidade <= 0) {
      throw new AppError('Quantidade deve ser um número inteiro positivo');
    }

    let created: Reserva | undefined;

    await databaseRepository.write((db) => {
      const produto = db.produtos.find((p) => p.id === data.produtoId);
      if (!produto) {
        throw new AppError('Produto não encontrado', 404);
      }

      const disponivel = calcularDisponivel(produto, db.reservas);
      if (data.quantidade > disponivel) {
        throw new AppError(
          `Quantidade indisponível. Máximo: ${disponivel}`,
          400,
          'UNAVAILABLE'
        );
      }

      created = {
        id: nextId(db.reservas),
        produtoId: data.produtoId,
        nome: data.nome.trim(),
        quantidade: data.quantidade,
        mensagem: data.mensagem?.trim() || '',
        data: new Date().toISOString(),
      };
      db.reservas.push(created);
    });

    const reservas = await this.findAll();
    return reservas.find((r) => r.id === created!.id)!;
  }

  async delete(id: number): Promise<void> {
    await databaseRepository.write((db) => {
      const index = db.reservas.findIndex((r) => r.id === id);
      if (index === -1) {
        throw new AppError('Reserva não encontrada', 404);
      }
      db.reservas.splice(index, 1);
    });
  }
}

export const reservaService = new ReservaService();
