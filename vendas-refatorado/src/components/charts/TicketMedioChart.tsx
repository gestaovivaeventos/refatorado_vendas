/**
 * Componente TicketMedioChart - Gráfico de Ticket Médio (barras horizontais)
 * Usado para: Ticket Médio Anual e Ticket Médio Mensal
 */

import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { COLORS } from '@/config/app.config';
import { formatCurrency } from '@/utils/formatacao';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface TicketDataPoint {
  label: string;
  ticketMedio: number;
}

interface TicketMedioChartProps {
  data: TicketDataPoint[];
  title?: string;
  horizontal?: boolean;
  onBarClick?: (label: string) => void;
}

export default function TicketMedioChart({ 
  data, 
  title, 
  horizontal = true,
  onBarClick 
}: TicketMedioChartProps) {
  const chartData = useMemo(() => ({
    labels: data.map(d => d.label),
    datasets: [
      {
        label: 'Ticket Médio',
        data: data.map(d => d.ticketMedio),
        backgroundColor: COLORS.PRIMARY,
        borderRadius: 4,
        barPercentage: 0.6,
      },
    ],
  }), [data]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? 'y' as const : 'x' as const,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      datalabels: {
        anchor: 'end' as const,
        align: 'end' as const,
        color: COLORS.TEXT,
        font: { weight: 'bold' as const, size: 13, family: 'Poppins, sans-serif' },
        formatter: function(value: number) {
          if (!value || value === 0) return '';
          if (value >= 1000) return `${(value / 1000).toFixed(1).replace('.0', '')}k`;
          return value.toLocaleString('pt-BR');
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.85)',
        titleColor: COLORS.TEXT,
        bodyColor: COLORS.TEXT,
        bodyFont: { size: 14, family: 'Poppins, sans-serif', weight: 'bold' as const },
        titleFont: { size: 12, family: 'Poppins, sans-serif' },
        padding: 12,
        cornerRadius: 6,
        callbacks: {
          label: function(context: any) {
            return `Ticket Médio: ${formatCurrency(context.raw)}`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        afterDataLimits: (scale: any) => { scale.max *= 1.2; },
        ticks: {
          color: COLORS.TEXT_MUTED,
          font: { size: 12, family: 'Poppins, sans-serif' },
          callback: function(this: any, value: any) {
            if (horizontal) {
              const num = Number(value);
              if (Math.abs(num) >= 1000000) return `${(num / 1000000).toFixed(1).replace('.0', '')}mi`;
              if (Math.abs(num) >= 1000) return `${(num / 1000).toFixed(0)}k`;
              return num;
            }
            // Para gráficos verticais, retorna o label do eixo X (meses)
            return this.getLabelForValue(value);
          },
        },
        grid: { color: 'rgba(255,255,255,0.04)' },
      },
      y: {
        ticks: {
          color: COLORS.TEXT_MUTED,
          font: { size: 12, family: 'Poppins, sans-serif' },
          callback: function(this: any, value: any) {
            if (!horizontal) {
              const num = Number(value);
              if (Math.abs(num) >= 1000000) return `${(num / 1000000).toFixed(1).replace('.0', '')}mi`;
              if (Math.abs(num) >= 1000) return `${(num / 1000).toFixed(0)}k`;
              return num;
            }
            // Para gráficos horizontais, retorna o label do eixo Y (anos/meses)
            return this.getLabelForValue(value);
          },
        },
        grid: { color: 'rgba(255,255,255,0.04)' },
      },
    },
    onClick: (event: any, elements: any[]) => {
      if (elements.length > 0 && onBarClick) {
        const label = data[elements[0].index].label;
        onBarClick(label);
      }
    },
  }), [data, horizontal, onBarClick]);

  if (data.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center text-text-muted">
        Sem dados disponíveis
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <Bar data={chartData} options={options} />
    </div>
  );
}
