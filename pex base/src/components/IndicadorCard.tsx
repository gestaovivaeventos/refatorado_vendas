/**
 * Card de Indicador - Exibe a pontuação do indicador
 * e compara com as melhores pontuações da rede e cluster
 */

import React from 'react';

interface IndicadorCardProps {
  titulo: string;
  notaGeral: string;
  pontuacao: number;
  melhorPontuacaoRede: number;
  melhorPontuacaoCluster: number;
  unidadeMelhorRede?: string;
  unidadeMelhorCluster?: string;
}

export default function IndicadorCard({
  titulo,
  notaGeral,
  pontuacao,
  melhorPontuacaoRede,
  melhorPontuacaoCluster,
  unidadeMelhorRede,
  unidadeMelhorCluster
}: IndicadorCardProps) {
  return (
    <div 
      className="p-4 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
      style={{ backgroundColor: '#343A40' }}
    >
      {/* Título do Indicador */}
      <h3 
        className="text-sm font-bold mb-2 uppercase tracking-wide"
        style={{ color: '#F8F9FA', fontSize: '1rem' }}
      >
        {titulo}
      </h3>

      {/* Nota Geral (subtítulo) */}
      <p 
        className="text-xs mb-3"
        style={{ color: '#adb5bd', fontSize: '0.9rem' }}
      >
        {notaGeral}
      </p>

      {/* Pontuação da Unidade */}
      <div className="mb-3">
        <div className="flex items-baseline gap-2">
          <span 
            className="text-3xl font-bold"
            style={{ color: '#FF6600' }}
          >
            {pontuacao.toFixed(1)}
          </span>
          <span 
            className="text-xs"
            style={{ color: '#6c757d' }}
          >
            pontos
          </span>
        </div>
      </div>

      {/* Melhor Pontuação - Rede */}
      <div className="mb-2 pb-2" style={{ borderBottom: '1px solid #495057' }}>
        <div className="flex justify-between items-center">
          <span 
            className="text-xs uppercase tracking-wide"
            style={{ color: '#F8F9FA', fontSize: '0.8rem' }}
          >
            Melhor Pontuação - Rede
          </span>
          <span 
            className="text-sm font-semibold"
            style={{ color: '#F8F9FA' }}
          >
            {melhorPontuacaoRede.toFixed(1)}
          </span>
        </div>
        {unidadeMelhorRede && (
          <p 
            className="text-xs mt-1"
            style={{ color: '#F8F9FA' }}
          >
            {unidadeMelhorRede}
          </p>
        )}
      </div>

      {/* Melhor Pontuação - Cluster */}
      <div>
        <div className="flex justify-between items-center">
          <span 
            className="text-xs uppercase tracking-wide"
            style={{ color: '#F8F9FA', fontSize: '0.8rem' }}
          >
            Melhor Pontuação - Cluster
          </span>
          <span 
            className="text-sm font-semibold"
            style={{ color: '#F8F9FA' }}
          >
            {melhorPontuacaoCluster.toFixed(1)}
          </span>
        </div>
        {unidadeMelhorCluster && (
          <p 
            className="text-xs mt-1"
            style={{ color: '#F8F9FA' }}
          >
            {unidadeMelhorCluster}
          </p>
        )}
      </div>
    </div>
  );
}
