/**
 * Type definitions para TypeScript
 * Mantém consistência com backend
 */

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'solicitante' | 'aprovador' | 'executor';
}

export interface Requisicao {
  id: number;
  titulo: string;
  descricao: string;
  prioridade: 'alta' | 'media' | 'baixa';
  status: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado';
  localizacao?: string;
  observacoes?: string;
  anexo?: string;
  solicitante: number;
  solicitante_nome: string;
  aprovador?: number;
  aprovador_nome?: string;
  executor?: number;
  executor_nome?: string;
  criado_em: string;
  atualizado_em: string;
  data_aprovacao?: string;
  data_conclusao?: string;
  historico?: Historico[];
}

export interface Historico {
  id: number;
  status_anterior: string;
  status_novo: string;
  observacao: string;
  usuario_nome: string;
  criado_em: string;
}

export interface RequisicaoFormData {
  titulo: string;
  descricao: string;
  prioridade: 'alta' | 'media' | 'baixa';
  localizacao?: string;
  anexo?: File;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}