/**
 * Componente de Tabela de Ranking
 * Exibe o ranking das franquias
 */

import React from 'react';
import ClusterBadge from './ClusterBadge';
import { ClusterType } from '@/types/pex.types';
import { formatarNumero } from '@/utils/formatacao';

interface RankingItem {
  posicao: number;
  franquiaNome: string;
  cluster: ClusterType;
  pontuacaoFinal: number;
}

interface TabelaRankingProps {
  dados: RankingItem[];
}

export default function TabelaRanking({ dados }: TabelaRankingProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Posição
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Franquia
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cluster
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pontuação Final
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {dados.map((item) => (
            <tr key={item.posicao} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <span className={`
                    font-bold text-lg
                    ${item.posicao === 1 ? 'text-yellow-500' : ''}
                    ${item.posicao === 2 ? 'text-gray-400' : ''}
                    ${item.posicao === 3 ? 'text-orange-600' : ''}
                  `}>
                    {item.posicao}º
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {item.franquiaNome}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <ClusterBadge cluster={item.cluster} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-bold text-primary-600">
                  {formatarNumero(item.pontuacaoFinal, 2)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
