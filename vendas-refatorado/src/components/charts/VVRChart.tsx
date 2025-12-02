/**
 * Componente VVRChart - Gráfico de Valor Vendido Realizado (barras)
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
import { COLORS } from '@/config/app.config';
import { formatCurrency } from '@/utils/formatacao';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DataPoint {
  label: string;
  realizado: number;
  meta: number;
}

interface VVRChartProps {
  data: DataPoint[];
  title?: string;
}

export default function VVRChart({ data, title = 'Valor Vendido Realizado' }: VVRChartProps) {
  const chartData = useMemo(() => ({
    labels: data.map(d => d.label),
    datasets: [
      {
        label: 'Realizado',
        data: data.map(d => d.realizado),
        backgroundColor: COLORS.PRIMARY,
        borderColor: COLORS.PRIMARY,
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.6,
      },
      {
        label: 'Meta',
        data: data.map(d => d.meta),
        backgroundColor: 'rgba(108, 117, 125, 0.6)',
        borderColor: '#6c757d',
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.6,
      },
    ],
  }), [data]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: COLORS.TEXT,
          font: { size: 12 },
        },
      },
      title: {
        display: !!title,
        text: title,
        color: COLORS.TEXT,
        font: { size: 16, weight: 'bold' as const },
      },
      tooltip: {
        backgroundColor: COLORS.DARK_SECONDARY,
        titleColor: COLORS.TEXT,
        bodyColor: COLORS.TEXT,
        borderColor: COLORS.PRIMARY,
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: COLORS.TEXT_MUTED },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
      y: {
        ticks: {
          color: COLORS.TEXT_MUTED,
          callback: function(value: any) {
            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
            if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
            return value;
          },
        },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
    },
  }), [title]);

  return (
    <div className="w-full h-80">
      <Bar data={chartData} options={options} />
    </div>
  );
}
