/**
 * Componente RankingTable - Tabela de ranking de unidades/consultores
 */

import React from 'react';
import { formatCurrency, formatPercent } from '@/utils/formatacao';
import { getColorForPercentage, getSolidColorForPercentage } from '@/utils/calculos';

interface RankingItem {
  posicao: number;
  nome: string;
  valorRealizado: number;
  valorMeta: number;
  percentual: number;
}

interface RankingTableProps {
  data: RankingItem[];
  title?: string;
  tipo?: 'unidade' | 'consultor';
}

export default function RankingTable({
  data,
  title = 'Ranking',
  tipo = 'unidade',
}: RankingTableProps) {
  const getMedalha = (posicao: number) => {
    switch (posicao) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return posicao.toString();
    }
  };

  return (
    <div className="w-full">
      {title && <h3 className="section-title mb-4">{title}</h3>}
      
      <div className="overflow-x-auto rounded-lg border border-dark-border">
        <table className="w-full">
          <thead>
            <tr className="bg-dark-tertiary">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary text-center w-16">
                #
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary text-left">
                {tipo === 'unidade' ? 'Unidade' : 'Consultor'}
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary text-right">
                Realizado
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary text-right">
                Meta
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary text-center w-32">
                % Atingido
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                  Nenhum dado encontrado
                </td>
              </tr>
            ) : (
              data.map((item) => {
                const progressColor = getColorForPercentage(item.percentual);
                const percentColor = getSolidColorForPercentage(item.percentual);
                const progressWidth = Math.min(item.percentual * 100, 100);

                return (
                  <tr 
                    key={`${item.posicao}-${item.nome}`}
                    className={`
                      border-t border-dark-border transition-colors
                      ${item.posicao <= 3 ? 'bg-primary-500/5' : 'hover:bg-white/5'}
                    `}
                  >
                    {/* Posição */}
                    <td className="px-4 py-3 text-center">
                      <span className={`text-lg ${item.posicao <= 3 ? 'font-bold' : ''}`}>
                        {getMedalha(item.posicao)}
                      </span>
                    </td>
                    
                    {/* Nome */}
                    <td className="px-4 py-3 text-sm text-text-primary font-medium">
                      {item.nome}
                    </td>
                    
                    {/* Realizado */}
                    <td className="px-4 py-3 text-sm text-text-primary text-right font-semibold">
                      {formatCurrency(item.valorRealizado)}
                    </td>
                    
                    {/* Meta */}
                    <td className="px-4 py-3 text-sm text-text-secondary text-right">
                      {formatCurrency(item.valorMeta)}
                    </td>
                    
                    {/* Percentual com barra de progresso */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-center gap-1">
                        <span 
                          className="text-sm font-bold"
                          style={{ color: percentColor }}
                        >
                          {formatPercent(item.percentual)}
                        </span>
                        <div className="w-full h-1.5 bg-dark-border rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-300"
                            style={{ 
                              width: `${progressWidth}%`,
                              background: progressColor,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
