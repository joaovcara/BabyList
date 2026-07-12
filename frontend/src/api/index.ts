import axios from 'axios';
import api from './client';
import type {
  AuthResponse,
  Configuracoes,
  DashboardData,
  Produto,
  Reserva,
  SetupStatus,
} from '../types';

export const authApi = {
  setupStatus: () => api.get<SetupStatus>('/setup/status'),
  setup: (usuario: string, senha: string) =>
    api.post<AuthResponse>('/setup', { usuario, senha }),
  login: (usuario: string, senha: string) =>
    api.post<AuthResponse>('/login', { usuario, senha }),
};

export const produtoApi = {
  getAll: () => api.get<Produto[]>('/produtos'),
  getById: (id: number) => api.get<Produto>(`/produtos/${id}`),
  create: (data: Omit<Produto, 'id' | 'faltam' | 'reservado' | 'disponivel' | 'status'>) =>
    api.post<Produto>('/produtos', data),
  update: (id: number, data: Partial<Produto>) => api.put<Produto>(`/produtos/${id}`, data),
  delete: (id: number) => api.delete(`/produtos/${id}`),
  receber: (id: number, quantidade: number) =>
    api.patch<Produto>(`/produtos/${id}/receber`, { quantidade }),
};

export const reservaApi = {
  getAll: () => api.get<Reserva[]>('/reservas'),
  create: (data: {
    produtoId: number;
    nome: string;
    quantidade: number;
    mensagem?: string;
  }) => api.post<Reserva>('/reservas', data),
  delete: (id: number) => api.delete(`/reservas/${id}`),
};

export const categoriaApi = {
  getAll: () => api.get<string[]>('/categorias'),
  create: (nome: string) => api.post<string[]>('/categorias', { nome }),
  update: (nomeAntigo: string, nome: string) =>
    api.put<string[]>(`/categorias/${encodeURIComponent(nomeAntigo)}`, { nome }),
  delete: (nome: string) =>
    api.delete<string[]>(`/categorias/${encodeURIComponent(nome)}`),
};

export const dashboardApi = {
  get: () => api.get<DashboardData>('/dashboard'),
};

export const configApi = {
  get: () => api.get<Configuracoes>('/configuracoes'),
  update: (data: {
    tituloLista?: string;
    nomeBebe?: string;
    senhaAtual?: string;
    senhaNova?: string;
  }) => api.put<Configuracoes>('/configuracoes', data),
};

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.data?.error) {
    return error.response.data.error;
  }
  return 'Ocorreu um erro inesperado';
}
