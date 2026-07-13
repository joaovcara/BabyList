export interface Usuario {
  id: number;
  usuario: string;
  senha: string;
}

export interface Produto {
  id: number;
  nome: string;
  categoria: string;
  tamanho?: string;
  necessario: number;
  possui: number;
}

export type ReservaStatus = 'ativa' | 'concluida' | 'cancelada';

export interface Reserva {
  id: number;
  produtoId: number;
  nome: string;
  quantidade: number;
  quantidadeReservada: number;
  quantidadeEntregueParcial: number;
  quantidadeEntregue?: number;
  mensagem: string;
  data: string;
  status: ReservaStatus;
  dataEntrega?: string;
  dataCancelamento?: string;
}

export interface Configuracoes {
  tituloLista: string;
  nomeBebe: string;
  categorias: string[];
  tamanhos: string[];
  chavePix?: string;
  mensagemContribuicao?: string;
  qrCodePix?: string;
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
