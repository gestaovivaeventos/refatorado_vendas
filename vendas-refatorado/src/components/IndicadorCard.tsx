/**
 * Componente IndicadorCard - Card de indicador operacional
 */

import React from 'react';
import { formatPercent } from '@/utils/formatacao';
import { getColorForPercentage, getSolidColorForPercentage } from '@/utils/calculos';

interface IndicadorCardProps {
  label: string;
  valor: number;
  meta: number;
}

export default function IndicadorCard({ label, valor, meta }: IndicadorCardProps) {
  const percent = meta > 0 ? valor / meta : 0;
  const progressWidth = Math.min(percent * 100, 100);
  const progressColor = getColorForPercentage(percent);
  const percentColor = getSolidColorForPercentage(percent);

  return (
    <div className="indicator-card">
      {/* Label */}
      <div className="indicator-label">{label}</div>
      
      {/* Valor */}
      <div className="indicator-value">{valor.toLocaleString('pt-BR')}</div>
      
      {/* Meta e Percentual */}
      <div className="indicator-meta">
        <span className="font-bold text-base" style={{ color: percentColor }}>
          {formatPercent(percent)}
        </span>
        {' de '}
        <span className="font-semibold">{meta.toLocaleString('pt-BR')}</span>
        {' META'}
      </div>
      
      {/* Barra de Progresso */}
      <div className="progress-bar-bg mt-2">
        <div 
          className="progress-bar-fg" 
          style={{ 
            width: `${progressWidth}%`,
            background: progressColor,
          }}
        />
      </div>
    </div>
  );
}
