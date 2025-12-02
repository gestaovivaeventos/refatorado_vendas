/**
 * Componente KPICard - Card de indicador principal
 */

import React from 'react';
import { formatCurrency, formatPercent } from '@/utils/formatacao';
import { getColorForPercentage, getSolidColorForPercentage } from '@/utils/calculos';

interface KPICardProps {
  titulo: string;
  valorRealizado: number;
  valorMeta: number;
  formatarComoMoeda?: boolean;
}

export default function KPICard({
  titulo,
  valorRealizado,
  valorMeta,
  formatarComoMoeda = true,
}: KPICardProps) {
  const percent = valorMeta > 0 ? valorRealizado / valorMeta : 0;
  const progressWidth = Math.min(percent * 100, 100);
  const progressColor = getColorForPercentage(percent);
  const percentColor = getSolidColorForPercentage(percent);

  return (
    <div className="kpi-card">
      {/* Título */}
      <span className="kpi-card-title">{titulo}</span>
      
      {/* Valor Realizado */}
      <span className="kpi-card-value">
        {formatarComoMoeda ? formatCurrency(valorRealizado) : valorRealizado.toLocaleString('pt-BR')}
      </span>
      
      {/* Detalhes: Percentual e Meta */}
      <span className="kpi-card-details">
        <span className="font-bold" style={{ color: percentColor }}>
          {formatPercent(percent)}
        </span>
        {' de '}
        <span>
          {formatarComoMoeda ? formatCurrency(valorMeta) : valorMeta.toLocaleString('pt-BR')}
        </span>
        {' META'}
      </span>
      
      {/* Barra de Progresso */}
      <div className="progress-bar-bg">
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
