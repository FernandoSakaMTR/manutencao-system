/**
 * Formulário para criar nova requisição
 * Usa React Hook Form para validações
 */
import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { requisicoesAPI } from '../services/api';
import type { RequisicaoFormData } from '../types';

interface Props {
  onSuccess?: () => void;
}

export default function RequisicaoForm({ onSuccess }: Props) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<RequisicaoFormData>();
  
  const mutation = useMutation({
    mutationFn: requisicoesAPI.criar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisicoes'] });
      reset();
      onSuccess?.();
    },
  });
  
  const onSubmit = (data: RequisicaoFormData) => {
    mutation.mutate(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-800">Nova Requisição de Manutenção</h2>
      
      {/* Título */}
      <div>
        <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">
          Título *
        </label>
        <input
          {...register('titulo', { 
            required: 'Título é obrigatório',
            minLength: { value: 5, message: 'Título deve ter pelo menos 5 caracteres' }
          })}
          type="text"
          id="titulo"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-2 border"
          placeholder="Ex: Vazamento no banheiro"
        />
        {errors.titulo && <p className="mt-1 text-sm text-red-600">{errors.titulo.message}</p>}
      </div>
      
      {/* Descrição */}
      <div>
        <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">
          Descrição *
        </label>
        <textarea
          {...register('descricao', { 
            required: 'Descrição é obrigatória',
            minLength: { value: 10, message: 'Descrição deve ter pelo menos 10 caracteres' }
          })}
          id="descricao"
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-2 border"
          placeholder="Descreva detalhadamente o problema..."
        />
        {errors.descricao && <p className="mt-1 text-sm text-red-600">{errors.descricao.message}</p>}
      </div>
      
      {/* Prioridade */}
      <div>
        <label htmlFor="prioridade" className="block text-sm font-medium text-gray-700">
          Prioridade *
        </label>
        <select
          {...register('prioridade', { required: 'Prioridade é obrigatória' })}
          id="prioridade"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-2 border"
        >
          <option value="baixa">Baixa</option>
          <option value="media">Média</option>
          <option value="alta">Alta</option>
        </select>
        {errors.prioridade && <p className="mt-1 text-sm text-red-600">{errors.prioridade.message}</p>}
      </div>
      
      {/* Localização */}
      <div>
        <label htmlFor="localizacao" className="block text-sm font-medium text-gray-700">
          Localização
        </label>
        <input
          {...register('localizacao')}
          type="text"
          id="localizacao"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-2 border"
          placeholder="Ex: Sala 205, 2º andar"
        />
      </div>
      
      {/* Botões */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => reset()}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Limpar
        </button>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
        >
          {mutation.isPending ? 'Enviando...' : 'Criar Requisição'}
        </button>
      </div>
      
      {mutation.isError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">Erro ao criar requisição. Tente novamente.</p>
        </div>
      )}
      
      {mutation.isSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600">Requisição criada com sucesso!</p>
        </div>
      )}
    </form>
  );
}