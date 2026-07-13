export interface Usuario {
  id: number;
  usuario: string;
}

export interface Produto {
  id: number;
  nome: string;
  categoria: string;
  tamanho?: string;
  necessario: number;
  possui: number;
  faltam: number;
  reservado: number;
  disponivel: number;
  status: 'completo' | 'falta_pouco' | 'falta_bastante';
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
  produtoNome: string;
}

export interface Configuracoes {
  tituloLista: string;
  nomeBebe: string;
  chavePix?: string;
  mensagemContribuicao?: string;
  qrCodePix?: string;
}

export interface DashboardData {
  totalProdutos: number;
  totalCategorias: number;
  itensCompletos: number;
  itensPendentes: number;
  progressoGeral: number;
  produtosFaltando: Produto[];
}

export interface AuthResponse {
  token: string;
  usuario: string;
}

export interface SetupStatus {
  needsSetup: boolean;
}

export interface ApiError {
  error: string;
  code?: string;
}
