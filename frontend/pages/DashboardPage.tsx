/**
 * Dashboard principal com overview das requisições
 */
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { requisicoesAPI } from '../services/api';
import RequisicaoForm from '../components/RequisicaoForm';
import RequisicaoList from '../components/RequisicaoList';

export default function DashboardPage() {
  const [showForm, setShowForm] = useState(false);
  
  const { data: stats } = useQuery({
    queryKey: ['requisicoes-stats'],
    queryFn: async () => {
      const todas = await requisicoesAPI.listar();
      return {
        total: todas.length,
        pendentes: todas.filter(r => r.status === 'pendente').length,
        em_andamento: todas.filter(r => r.status === 'em_andamento').length,
        concluidas: todas.filter(r => r.status === 'concluido').length,
      };
    },
  });
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <Plus className="w-5 h-5" />
              Nova Requisição
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-600">Pendentes</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendentes}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-600">Em Andamento</p>
              <p className="text-3xl font-bold text-blue-600">{stats.em_andamento}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-600">Concluídas</p>
              <p className="text-3xl font-bold text-green-600">{stats.concluidas}</p>
            </div>
          </div>
        )}
        
        {/* Formulário (condicional) */}
        {showForm && (
          <div className="mb-8">
            <RequisicaoForm onSuccess={() => setShowForm(false)} />
          </div>
        )}
        
        {/* Lista */}
        <RequisicaoList />
      </main>
    </div>
  );
}