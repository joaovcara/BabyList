import { AppError } from '../errors/AppError.js';
import { databaseRepository } from '../repositories/database.repository.js';
import {
  enriquecerProduto,
  calcularProgressoGeral,
  isReservaAtiva,
  nextId,
} from '../utils/calculations.js';
import { normalizeTamanho } from '../utils/produto.js';
import { DashboardData, Produto, ProdutoComDetalhes } from '../types/index.js';

export class ProdutoService {
  async findAll(): Promise<ProdutoComDetalhes[]> {
    const db = await databaseRepository.read();
    return db.produtos.map((p) => enriquecerProduto(p, db.reservas));
  }

  async findById(id: number): Promise<ProdutoComDetalhes> {
    const db = await databaseRepository.read();
    const produto = db.produtos.find((p) => p.id === id);
    if (!produto) {
      throw new AppError('Produto não encontrado', 404);
    }
    return enriquecerProduto(produto, db.reservas);
  }

  async create(data: Omit<Produto, 'id'>): Promise<ProdutoComDetalhes> {
    const tamanho = normalizeTamanho(data.tamanho);
    this.validateQuantidades(data.necessario, data.possui, { capPossui: true });
    await this.validateCategoria(data.categoria);

    let created: Produto | undefined;

    await databaseRepository.write((db) => {
      if (!db.configuracoes.categorias.some(
        (c) => c.toLowerCase() === data.categoria.trim().toLowerCase()
      )) {
        throw new AppError('Categoria inválida');
      }

      this.validateTamanhoInDb(db, tamanho);
      this.validateUnicidadeInDb(db, data.nome.trim(), data.categoria.trim(), tamanho);

      created = {
        id: nextId(db.produtos),
        nome: data.nome.trim(),
        categoria: data.categoria.trim(),
        necessario: data.necessario,
        possui: data.possui,
      };
      if (tamanho) {
        created.tamanho = tamanho;
      }
      db.produtos.push(created);
    });

    return this.findById(created!.id);
  }

  async update(id: number, data: Partial<Omit<Produto, 'id'>>): Promise<ProdutoComDetalhes> {
    await databaseRepository.write((db) => {
      const produto = db.produtos.find((p) => p.id === id);
      if (!produto) {
        throw new AppError('Produto não encontrado', 404);
      }

      if (data.nome !== undefined) produto.nome = data.nome.trim();
      if (data.categoria !== undefined) {
        if (!db.configuracoes.categorias.some(
          (c) => c.toLowerCase() === data.categoria!.trim().toLowerCase()
        )) {
          throw new AppError('Categoria inválida');
        }
        produto.categoria = data.categoria.trim();
      }

      if (data.tamanho !== undefined) {
        const tamanho = normalizeTamanho(data.tamanho);
        this.validateTamanhoInDb(db, tamanho);
        if (tamanho) {
          produto.tamanho = tamanho;
        } else {
          delete produto.tamanho;
        }
      }

      const nome = produto.nome;
      const categoria = produto.categoria;
      const tamanho = normalizeTamanho(produto.tamanho);
      this.validateUnicidadeInDb(db, nome, categoria, tamanho, id);

      const necessario = data.necessario ?? produto.necessario;
      const possui = data.possui ?? produto.possui;
      this.validateQuantidades(necessario, possui, { capPossui: false });

      const reservado = db.reservas
        .filter((r) => r.produtoId === id && isReservaAtiva(r))
        .reduce((sum, r) => sum + r.quantidade, 0);

      if (necessario < reservado) {
        throw new AppError(
          'Quantidade necessária não pode ser menor que a quantidade reservada',
          400,
          'INVALID_QUANTITY'
        );
      }

      produto.necessario = necessario;
      produto.possui = possui;
    });

    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await databaseRepository.write((db) => {
      const produto = db.produtos.find((p) => p.id === id);
      if (!produto) {
        throw new AppError('Produto não encontrado', 404);
      }

      const hasReservas = db.reservas.some((r) => r.produtoId === id && isReservaAtiva(r));
      if (hasReservas) {
        throw new AppError(
          'Não é possível excluir produto com reservas ativas',
          409,
          'HAS_RESERVAS'
        );
      }

      db.produtos = db.produtos.filter((p) => p.id !== id);
    });
  }

  async receber(id: number, quantidade: number): Promise<ProdutoComDetalhes> {
    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      throw new AppError('Quantidade recebida deve ser um número positivo');
    }

    await databaseRepository.write((db) => {
      const produto = db.produtos.find((p) => p.id === id);
      if (!produto) {
        throw new AppError('Produto não encontrado', 404);
      }

      produto.possui = produto.possui + quantidade;
    });

    return this.findById(id);
  }

  private validateQuantidades(
    necessario: number,
    possui: number,
    options: { capPossui: boolean } = { capPossui: true }
  ): void {
    if (!Number.isInteger(necessario) || necessario < 0) {
      throw new AppError('Quantidade necessária deve ser um número inteiro >= 0');
    }
    if (!Number.isInteger(possui) || possui < 0) {
      throw new AppError('Quantidade possuída deve ser um número inteiro >= 0');
    }
    if (options.capPossui && possui > necessario) {
      throw new AppError('Quantidade possuída não pode ser maior que a necessária');
    }
  }

  private async validateCategoria(categoria: string): Promise<void> {
    if (!categoria?.trim()) {
      throw new AppError('Categoria é obrigatória');
    }
  }

  private validateTamanhoInDb(
    db: Awaited<ReturnType<typeof databaseRepository.read>>,
    tamanho: string
  ): void {
    if (!tamanho) return;

    const tamanhos = db.configuracoes.tamanhos ?? [];
    if (!tamanhos.some((t) => t.toLowerCase() === tamanho.toLowerCase())) {
      throw new AppError('Tamanho inválido');
    }
  }

  private validateUnicidadeInDb(
    db: Awaited<ReturnType<typeof databaseRepository.read>>,
    nome: string,
    categoria: string,
    tamanho: string,
    excludeId?: number
  ): void {
    const duplicate = db.produtos.some((p) => {
      if (excludeId !== undefined && p.id === excludeId) return false;
      return (
        p.nome.toLowerCase() === nome.toLowerCase() &&
        p.categoria.toLowerCase() === categoria.toLowerCase() &&
        normalizeTamanho(p.tamanho) === tamanho
      );
    });

    if (duplicate) {
      throw new AppError(
        'Já existe um produto com este nome, categoria e tamanho',
        409,
        'DUPLICATE'
      );
    }
  }
}

export class DashboardService {
  async getDashboard(): Promise<DashboardData> {
    const db = await databaseRepository.read();
    const produtos = db.produtos.map((p) => enriquecerProduto(p, db.reservas));

    const itensCompletos = produtos.filter((p) => p.status === 'completo').length;
    const itensPendentes = produtos.length - itensCompletos;

    const produtosFaltando = produtos
      .filter((p) => p.faltam > 0)
      .sort((a, b) => b.faltam - a.faltam);

    return {
      totalProdutos: produtos.length,
      totalCategorias: db.configuracoes.categorias.length,
      itensCompletos,
      itensPendentes,
      progressoGeral: calcularProgressoGeral(db.produtos),
      produtosFaltando,
    };
  }
}

export const produtoService = new ProdutoService();
export const dashboardService = new DashboardService();
