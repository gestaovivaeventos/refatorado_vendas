/**
 * Componente StackedBarChart - Gráfico de barras empilhadas (Venda/Pós-Venda)
 * Usado para: Venda Realizada Total Anual e Venda Realizada Total Mensal
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

interface StackedDataPoint {
  label: string;
  vendas: number;
  posVendas: number;
}

interface StackedBarChartProps {
  data: StackedDataPoint[];
  title?: string;
  horizontal?: boolean;
  onBarClick?: (label: string) => void;
}

export default function StackedBarChart({ 
  data, 
  title, 
  horizontal = false,
  onBarClick 
}: StackedBarChartProps) {
  const chartData = useMemo(() => ({
    labels: data.map(d => d.label),
    datasets: [
      {
        label: 'Pós Venda',
        data: data.map(d => d.posVendas),
        backgroundColor: '#6c757d',
        borderRadius: 4,
        barPercentage: 0.7,
      },
      {
        label: 'Venda',
        data: data.map(d => d.vendas),
        backgroundColor: COLORS.PRIMARY,
        borderRadius: 4,
        barPercentage: 0.7,
      },
    ],
  }), [data]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? 'y' as const : 'x' as const,
    interaction: {
      mode: horizontal ? 'y' as const : 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: COLORS.TEXT,
          font: { size: 12, family: 'Poppins, sans-serif' },
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: false,
      },
      datalabels: {
        color: function(context: any) {
          return context.dataset.label === 'Pós Venda' ? '#212529' : '#FFFFFF';
        },
        font: { weight: 'bold' as const, size: 13, family: 'Poppins, sans-serif' },
        anchor: 'center' as const,
        align: 'center' as const,
        formatter: function(value: number) {
          if (!value || value === 0) return '';
          if (value >= 1000000) return `${(value / 1000000).toFixed(1).replace('.0', '')}mi`;
          if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
          return value.toString();
        },
        display: function(context: any) {
          return context.dataset.data[context.dataIndex] > 0;
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
            return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
          },
          footer: function(tooltipItems: any[]) {
            const sum = tooltipItems.reduce((acc, item) => acc + item.raw, 0);
            return `Total: ${formatCurrency(sum)}`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
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
            return this.getLabelForValue(value);
          },
        },
        grid: { color: 'rgba(255,255,255,0.04)' },
      },
      y: {
        stacked: true,
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
            // Para gráfico horizontal, retornar o label (ano)
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
