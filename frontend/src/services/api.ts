/**
 * Configuração do Axios e funções de API
 * Centraliza todas as chamadas HTTP (DRY principle)
 */
import axios, { AxiosError } from 'axios';
import type { 
  LoginCredentials, 
  AuthTokens, 
  Requisicao, 
  RequisicaoFormData 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Configuração do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para refresh token automático
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    // Se erro 401 e não é retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');
        
        const response = await axios.post(`${API_BASE_URL.replace('/api', '')}/api/token/refresh/`, {
          refresh: refreshToken,
        });
        
        const { access } = response.data;
        localStorage.setItem('access_token', access);
        
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh falhou, fazer logout
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// ======================
// Authentication API
// ======================

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthTokens> => {
    const response = await axios.post(`${API_BASE_URL.replace('/api', '')}/api/token/`, credentials);
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
  
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('access_token');
  },
};

// ======================
// Requisições API
// ======================

export const requisicoesAPI = {
  // Lista todas as requisições (com filtros opcionais)
  listar: async (params?: { 
    status?: string; 
    prioridade?: string;
    search?: string;
  }): Promise<Requisicao[]> => {
    const response = await api.get('/requisicoes/', { params });
    return response.data.results || response.data;
  },
  
  // Busca requisição por ID
  buscarPorId: async (id: number): Promise<Requisicao> => {
    const response = await api.get(`/requisicoes/${id}/`);
    return response.data;
  },
  
  // Cria nova requisição
  criar: async (data: RequisicaoFormData): Promise<Requisicao> => {
    const formData = new FormData();
    formData.append('titulo', data.titulo);
    formData.append('descricao', data.descricao);
    formData.append('prioridade', data.prioridade);
    if (data.localizacao) formData.append('localizacao', data.localizacao);
    if (data.anexo) formData.append('anexo', data.anexo);
    
    const response = await api.post('/requisicoes/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  // Atualiza requisição
  atualizar: async (id: number, data: Partial<RequisicaoFormData>): Promise<Requisicao> => {
    const response = await api.patch(`/requisicoes/${id}/`, data);
    return response.data;
  },
  
  // Atualiza status (endpoint customizado)
  atualizarStatus: async (id: number, status: string, observacao?: string): Promise<Requisicao> => {
    const response = await api.post(`/requisicoes/${id}/atualizar_status/`, {
      status,
      observacao,
    });
    return response.data;
  },
  
  // Deleta requisição
  deletar: async (id: number): Promise<void> => {
    await api.delete(`/requisicoes/${id}/`);
  },
  
  // Minhas requisições
  minhasRequisicoes: async (): Promise<Requisicao[]> => {
    const response = await api.get('/requisicoes/minhas_requisicoes/');
    return response.data;
  },
  
  // Requisições pendentes
  pendentes: async (): Promise<Requisicao[]> => {
    const response = await api.get('/requisicoes/pendentes/');
    return response.data;
  },
};

export default api;