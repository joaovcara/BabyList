export interface Usuario {
  id: number;
  usuario: string;
  senha: string;
}

export interface Produto {
  id: number;
  nome: string;
  categoria: string;
  necessario: number;
  possui: number;
}

export interface Reserva {
  id: number;
  produtoId: number;
  nome: string;
  quantidade: number;
  mensagem: string;
  data: string;
}

export interface Configuracoes {
  tituloLista: string;
  nomeBebe: string;
  categorias: string[];
}

export interface Database {
  usuarios: Usuario[];
  produtos: Produto[];
  reservas: Reserva[];
  configuracoes: Configuracoes;
}

export type ProdutoStatus = 'completo' | 'falta_pouco' | 'falta_bastante';

export interface ProdutoComDetalhes extends Produto {
  faltam: number;
  reservado: number;
  disponivel: number;
  status: ProdutoStatus;
}

export interface DashboardData {
  totalProdutos: number;
  totalCategorias: number;
  itensCompletos: number;
  itensPendentes: number;
  progressoGeral: number;
  produtosFaltando: ProdutoComDetalhes[];
}

export interface JwtPayload {
  userId: number;
  usuario: string;
}
