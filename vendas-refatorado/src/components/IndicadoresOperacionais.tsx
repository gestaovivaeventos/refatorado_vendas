/**
 * Componente IndicadoresOperacionais - Seção de indicadores operacionais
 * Estilo idêntico aos cards de VVR para consistência visual
 */

import React from 'react';
import { formatPercent } from '@/utils/formatacao';
import { getSolidColorForPercentage } from '@/utils/calculos';
import { COLORS } from '@/config/app.config';

interface IndicadorData {
  valor: number;
  meta: number;
}

interface IndicadoresOperacionaisProps {
  leads: IndicadorData;
  reunioes: IndicadorData;
  contratos: IndicadorData;
  adesao: IndicadorData;
}

interface IndicadorCardProps {
  label: string;
  valor: number;
  meta: number;
}

function IndicadorOperacionalCard({ label, valor, meta }: IndicadorCardProps) {
  const percent = meta > 0 ? valor / meta : 0;
  const progressWidth = Math.min(percent * 100, 100);
  const percentColor = getSolidColorForPercentage(percent);
  
  // Cor da barra de progresso baseada no percentual
  const progressBarColor = percent >= 1 
    ? COLORS.SUCCESS 
    : percent >= 0.5 
      ? COLORS.PRIMARY 
      : COLORS.DANGER;

  return (
    <div 
      className="rounded-lg p-5 flex flex-col gap-2"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.03))',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      }}
    >
      {/* Label */}
      <span style={{ fontSize: '0.9em', fontWeight: 'bold', color: '#ADB5BD' }}>
        {label}
      </span>
      
      {/* Valor */}
      <span style={{ fontSize: '1.7em', fontWeight: 'bold', color: '#F8F9FA' }}>
        {valor.toLocaleString('pt-BR')}
      </span>
      
      {/* Percentual + Meta */}
      <span style={{ fontSize: '0.75rem', color: '#ADB5BD' }}>
        <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: percentColor }}>
          {formatPercent(percent)}
        </span>
        {' de '}
        <span style={{ fontWeight: '600', fontSize: '1.05rem', color: '#ADB5BD' }}>
          {meta.toLocaleString('pt-BR')}
        </span>
        {' META'}
      </span>
      
      {/* Barra de Progresso */}
      <div className="w-full h-1.5 bg-dark-tertiary rounded-full overflow-hidden mt-1">
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ 
            width: `${progressWidth}%`,
            backgroundColor: progressBarColor,
          }}
        />
      </div>
    </div>
  );
}

export default function IndicadoresOperacionais({
  leads,
  reunioes,
  contratos,
  adesao,
}: IndicadoresOperacionaisProps) {
  return (
    <div className="bg-dark-secondary rounded-xl p-1">
      {/* Título */}
      <div className="px-5 pt-4 pb-2">
        <h2 className="section-title">
          INDICADORES OPERACIONAIS
        </h2>
      </div>

      {/* Grid de 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        <IndicadorOperacionalCard
          label="LEADS"
          valor={leads.valor}
          meta={leads.meta}
        />
        <IndicadorOperacionalCard
          label="REUNIÕES"
          valor={reunioes.valor}
          meta={reunioes.meta}
        />
        <IndicadorOperacionalCard
          label="CONTRATOS (MV)"
          valor={contratos.valor}
          meta={contratos.meta}
        />
        <IndicadorOperacionalCard
          label="ADESÃO TOTAL"
          valor={adesao.valor}
          meta={adesao.meta}
        />
      </div>
    </div>
  );
}
