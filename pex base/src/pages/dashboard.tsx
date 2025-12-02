/**
 * Página Principal do Dashboard PEX
 * Exibe visão geral, gráficos e ranking das franquias
 */

import React from 'react';
import { withAuth } from '@/utils/auth';
import { useSheetsData } from '@/hooks/useSheetsData';
import Header from '@/components/Header';
import Card from '@/components/Card';
import TabelaRanking from '@/components/TabelaRanking';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// Cores para o gráfico de pizza
const COLORS = {
  CALOURO_INICIANTE: '#3b82f6', // Azul
  CALOURO: '#22c55e',           // Verde
  GRADUADO: '#eab308',          // Amarelo
  POS_GRADUADO: '#a855f7',      // Roxo
};

function DashboardContent() {
  const { dados, loading, error, refetch } = useSheetsData();

  // Estado de Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Carregando dados...</p>
        </div>
      </div>
    );
  }

  // Estado de Erro
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Erro ao carregar dados</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={refetch}
              className="btn-primary"
            >
              Tentar Novamente
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // Calcular distribuição por cluster
  const distribuicaoClusters = calcularDistribuicaoClusters(dados);

  // Dados mockados para o ranking (temporário)
  const rankingMock = [
    {
      posicao: 1,
      franquiaNome: 'Franquia Alpha',
      cluster: 'POS_GRADUADO' as const,
      pontuacaoFinal: 95.8,
    },
    {
      posicao: 2,
      franquiaNome: 'Franquia Beta',
      cluster: 'GRADUADO' as const,
      pontuacaoFinal: 92.3,
    },
    {
      posicao: 3,
      franquiaNome: 'Franquia Gamma',
      cluster: 'GRADUADO' as const,
      pontuacaoFinal: 88.7,
    },
    {
      posicao: 4,
      franquiaNome: 'Franquia Delta',
      cluster: 'CALOURO' as const,
      pontuacaoFinal: 85.2,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-8">
        {/* Seção de Visão Geral */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Visão Geral</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card - Total de Franquias */}
            <Card>
              <div className="text-center">
                <p className="text-gray-600 text-sm uppercase tracking-wide mb-2">
                  Total de Unidades
                </p>
                <p className="text-4xl font-bold text-primary-600">
                  {dados.length}
                </p>
              </div>
            </Card>

            {/* Card - Clusters */}
            <Card>
              <div className="text-center">
                <p className="text-gray-600 text-sm uppercase tracking-wide mb-2">
                  Clusters Ativos
                </p>
                <p className="text-4xl font-bold text-green-600">
                  {distribuicaoClusters.length}
                </p>
              </div>
            </Card>

            {/* Card - Última Atualização */}
            <Card>
              <div className="text-center">
                <p className="text-gray-600 text-sm uppercase tracking-wide mb-2">
                  Última Atualização
                </p>
                <p className="text-lg font-semibold text-purple-600">
                  {new Date().toLocaleDateString('pt-BR')}
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* Seção de Gráfico - Distribuição por Cluster */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Análise por Cluster</h2>
          
          <Card titulo="Distribuição por Cluster">
            {distribuicaoClusters.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={distribuicaoClusters}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="total"
                  >
                    {distribuicaoClusters.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[entry.cluster as keyof typeof COLORS] || '#999'} 
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhum dado disponível para exibir
              </div>
            )}
          </Card>
        </section>

        {/* Seção de Ranking */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Performance</h2>
          
          <Card titulo="Ranking (Mock)">
            <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Dados de Demonstração:</strong> Este ranking utiliza dados mockados. 
                Os cálculos reais serão implementados nas próximas etapas.
              </p>
            </div>
            
            <TabelaRanking dados={rankingMock} />
          </Card>
        </section>

        {/* Botão de Atualização */}
        <div className="flex justify-center mt-8">
          <button
            onClick={refetch}
            className="btn-primary flex items-center gap-2"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
            Atualizar Dados
          </button>
        </div>
      </main>
    </div>
  );
}

/**
 * Calcula a distribuição de franquias por cluster
 */
function calcularDistribuicaoClusters(dados: any[]) {
  // Objeto para contar franquias por cluster
  const contagem: Record<string, number> = {};

  dados.forEach(item => {
    const cluster = item.cluster || 'NÃO_DEFINIDO';
    contagem[cluster] = (contagem[cluster] || 0) + 1;
  });

  // Converter para array para o gráfico
  return Object.entries(contagem).map(([cluster, total]) => ({
    cluster,
    name: formatarNomeCluster(cluster),
    total,
  }));
}

/**
 * Formata o nome do cluster para exibição
 */
function formatarNomeCluster(cluster: string): string {
  const nomes: Record<string, string> = {
    CALOURO_INICIANTE: 'Calouro Iniciante',
    CALOURO: 'Calouro',
    GRADUADO: 'Graduado',
    POS_GRADUADO: 'Pós Graduado',
  };

  return nomes[cluster] || cluster.replace(/_/g, ' ');
}

/**
 * Renderiza labels customizados no gráfico de pizza
 */
function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="font-bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default withAuth(DashboardContent);
