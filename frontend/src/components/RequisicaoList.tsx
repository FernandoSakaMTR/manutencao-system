/**
 * Lista de requisições com filtros e paginação
 * Usa React Query para cache e sincronização
 */
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { requisicoesAPI } from '../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { Requisicao } from '../types';

export default function RequisicaoList() {
  const navigate = useNavigate();
  const [filtros, setFiltros] = useState({
    status: '',
    prioridade: '',
  });
  
  const { data: requisicoes, isLoading, error } = useQuery({
    queryKey: ['requisicoes', filtros],
    queryFn: () => requisicoesAPI.listar(filtros),
  });
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'em_andamento':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'concluido':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'cancelado':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };
  
  const getPrioridadeBadge = (prioridade: string) => {
    const classes = {
      alta: 'bg-red-100 text-red-800',
      media: 'bg-yellow-100 text-yellow-800',
      baixa: 'bg-green-100 text-green-800',
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded ${classes[prioridade as keyof typeof classes]}`}>
        {prioridade.toUpperCase()}
      </span>
    );
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">Erro ao carregar requisições</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filtros.status}
            onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-3 py-2 border"
          >
            <option value="">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="concluido">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
          <select
            value={filtros.prioridade}
            onChange={(e) => setFiltros({ ...filtros, prioridade: e.target.value })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-3 py-2 border"
          >
            <option value="">Todas</option>
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>
        </div>
      </div>
      
      {/* Lista */}
      <div className="space-y-3">
        {requisicoes && requisicoes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">Nenhuma requisição encontrada</p>
          </div>
        ) : (
          requisicoes?.map((req: Requisicao) => (
            <div
              key={req.id}
              onClick={() => navigate(`/requisicoes/${req.id}`)}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(req.status)}
                    <h3 className="font-semibold text-lg text-gray-800">{req.titulo}</h3>
                    {getPrioridadeBadge(req.prioridade)}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{req.descricao}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Solicitante: {req.solicitante_nome}</span>
                    <span>•</span>
                    <span>{format(new Date(req.criado_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                    {req.localizacao && (
                      <>
                        <span>•</span>
                        <span>{req.localizacao}</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="ml-4">
                  <span className="text-2xl font-bold text-gray-400">#{req.id}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}