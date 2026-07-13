import { AppError } from '../errors/AppError.js';
import { databaseRepository } from '../repositories/database.repository.js';
import { calcularDisponivel, isReservaAtiva, nextId } from '../utils/calculations.js';
import { formatProdutoLabel } from '../utils/produto.js';
import { Reserva, ReservaStatus } from '../types/index.js';

export interface ReservaComProduto extends Reserva {
  produtoNome: string;
}

function normalizeReserva(reserva: Reserva): Reserva {
  const status: ReservaStatus = reserva.status ?? 'ativa';
  return {
    ...reserva,
    status,
    quantidadeReservada: reserva.quantidadeReservada ?? reserva.quantidade,
    quantidadeEntregueParcial: reserva.quantidadeEntregueParcial ?? 0,
  };
}

export class ReservaService {
  private toReservaComProduto(
    reserva: Reserva,
    produtos: Awaited<ReturnType<typeof databaseRepository.read>>['produtos']
  ): ReservaComProduto {
    const normalized = normalizeReserva(reserva);
    const produto = produtos.find((p) => p.id === normalized.produtoId);
    return {
      ...normalized,
      produtoNome: produto
        ? formatProdutoLabel(produto.nome, produto.tamanho)
        : 'Produto removido',
    };
  }

  async findAll(): Promise<ReservaComProduto[]> {
    const db = await databaseRepository.read();
    return db.reservas.map((r) => this.toReservaComProduto(r, db.produtos));
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
        quantidadeReservada: data.quantidade,
        quantidadeEntregueParcial: 0,
        mensagem: data.mensagem?.trim() || '',
        data: new Date().toISOString(),
        status: 'ativa',
      };
      db.reservas.push(created);
    });

    const reservas = await this.findAll();
    return reservas.find((r) => r.id === created!.id)!;
  }

  async confirmar(id: number, quantidadeRecebida: number): Promise<ReservaComProduto> {
    if (!Number.isInteger(quantidadeRecebida) || quantidadeRecebida <= 0) {
      throw new AppError('Quantidade recebida deve ser um número positivo');
    }

    await databaseRepository.write((db) => {
      const reserva = db.reservas.find((r) => r.id === id);
      if (!reserva) {
        throw new AppError('Reserva não encontrada', 404);
      }

      const normalized = normalizeReserva(reserva);
      Object.assign(reserva, normalized);

      if (!isReservaAtiva(reserva)) {
        throw new AppError('Apenas reservas ativas podem ser confirmadas', 400, 'INVALID_STATUS');
      }

      const produto = db.produtos.find((p) => p.id === reserva.produtoId);
      if (!produto) {
        throw new AppError('Produto não encontrado', 404);
      }

      produto.possui += quantidadeRecebida;
      reserva.quantidadeEntregueParcial += quantidadeRecebida;

      if (quantidadeRecebida < reserva.quantidade) {
        reserva.quantidade -= quantidadeRecebida;
        return;
      }

      reserva.status = 'concluida';
      reserva.quantidadeEntregue = reserva.quantidadeEntregueParcial;
      reserva.dataEntrega = new Date().toISOString();
      reserva.quantidade = 0;
    });

    const reservas = await this.findAll();
    return reservas.find((r) => r.id === id)!;
  }

  async delete(id: number): Promise<void> {
    await databaseRepository.write((db) => {
      const reserva = db.reservas.find((r) => r.id === id);
      if (!reserva) {
        throw new AppError('Reserva não encontrada', 404);
      }

      const normalized = normalizeReserva(reserva);
      Object.assign(reserva, normalized);

      if (!isReservaAtiva(reserva)) {
        throw new AppError('Apenas reservas ativas podem ser canceladas', 400, 'INVALID_STATUS');
      }

      reserva.status = 'cancelada';
      reserva.dataCancelamento = new Date().toISOString();
      reserva.quantidade = 0;
    });
  }
}

export const reservaService = new ReservaService();
