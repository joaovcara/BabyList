import { Produto, ProdutoComDetalhes, ProdutoStatus, Reserva } from '../types/index.js';

export function calcularReservado(produtoId: number, reservas: Reserva[]): number {
  return reservas
    .filter((r) => r.produtoId === produtoId)
    .reduce((sum, r) => sum + r.quantidade, 0);
}

export function calcularDisponivel(
  produto: Produto,
  reservas: Reserva[]
): number {
  const reservado = calcularReservado(produto.id, reservas);
  return Math.max(0, produto.necessario - produto.possui - reservado);
}

export function calcularStatus(produto: Produto): ProdutoStatus {
  if (produto.possui >= produto.necessario) {
    return 'completo';
  }

  const faltam = produto.necessario - produto.possui;
  const percentualFalta = produto.necessario > 0 ? faltam / produto.necessario : 1;

  if (produto.possui > 0 && percentualFalta <= 0.3) {
    return 'falta_pouco';
  }

  return 'falta_bastante';
}

export function enriquecerProduto(
  produto: Produto,
  reservas: Reserva[]
): ProdutoComDetalhes {
  const reservado = calcularReservado(produto.id, reservas);
  const faltam = Math.max(0, produto.necessario - produto.possui);
  const disponivel = Math.max(0, produto.necessario - produto.possui - reservado);

  return {
    ...produto,
    faltam,
    reservado,
    disponivel,
    status: calcularStatus(produto),
  };
}

export function nextId<T extends { id: number }>(items: T[]): number {
  if (items.length === 0) return 1;
  return Math.max(...items.map((i) => i.id)) + 1;
}

export function calcularProgressoGeral(produtos: Produto[]): number {
  const totalNecessario = produtos.reduce((sum, p) => sum + p.necessario, 0);
  if (totalNecessario === 0) return 0;
  const totalPossui = produtos.reduce((sum, p) => sum + p.possui, 0);
  return Math.round((totalPossui / totalNecessario) * 100);
}
