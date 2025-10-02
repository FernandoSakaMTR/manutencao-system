/**
 * Página de login com validação
 */
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authAPI } from '../services/api';
import type { LoginCredentials } from '../types';

export default function LoginPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginCredentials>();
  
  const mutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      navigate('/dashboard');
    },
  });
  
  const onSubmit = (data: LoginCredentials) => {
    mutation.mutate(data);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Sistema de Manutenção
        </h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Usuário
            </label>
            <input
              {...register('username', { required: 'Usuário é obrigatório' })}
              type="text"
              id="username"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-2 border"
              placeholder="Digite seu usuário"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              {...register('password', { required: 'Senha é obrigatória' })}
              type="password"
              id="password"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-2 border"
              placeholder="Digite sua senha"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 font-medium"
          >
            {mutation.isPending ? 'Entrando...' : 'Entrar'}
          </button>
          
          {mutation.isError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">Usuário ou senha incorretos</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}