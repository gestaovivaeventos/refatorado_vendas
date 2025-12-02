/**
 * Componente VVRVsMetaChart - Gráfico de barras VVR Realizado vs Meta por Mês
 * Replica exatamente o gráfico original: barras com gradiente laranja + linha branca para meta
 */

import React, { useMemo, useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { COLORS } from '@/config/app.config';
import { formatCurrency } from '@/utils/formatacao';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface DataPoint {
  mes: string;
  realizado: number;
  meta: number;
}

interface VVRVsMetaChartProps {
  data: DataPoint[];
  titulo?: string;
  tipoSelecionado?: 'total' | 'vendas' | 'posvendas';
  onTipoChange?: (tipo: 'total' | 'vendas' | 'posvendas') => void;
  anoVigente?: number;
  indicadorMeta?: string;
}

// Formatador de valores abreviados (1.5mi, 500k)
const formatValue = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '';
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)} mi`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
  return value.toFixed ? value.toFixed(0) : String(value);
};

export default function VVRVsMetaChart({
  data,
  titulo = 'VVR REALIZADO VS. META POR MÊS',
  tipoSelecionado = 'total',
  onTipoChange,
  anoVigente = new Date().getFullYear(),
  indicadorMeta = '(Super Meta)',
}: VVRVsMetaChartProps) {
  const chartRef = useRef<ChartJS>(null);

  const chartData = useMemo(() => ({
    labels: data.map(d => d.mes),
    datasets: [
      {
        type: 'bar' as const,
        label: 'VVR Realizado',
        data: data.map(d => d.realizado),
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return '#FF6600';
          
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, '#ff8a33');
          gradient.addColorStop(0.5, '#FF6600');
          gradient.addColorStop(1, '#e65500');
          return gradient;
        },
        borderRadius: 4,
        order: 1,
        datalabels: {
          anchor: 'end' as const,
          align: 'end' as const,
          display: true,
          backgroundColor: 'rgba(52, 58, 64, 0.7)',
          borderRadius: 4,
          color: 'white',
          font: { weight: 'bold' as const, size: 11, family: 'Poppins, Arial, sans-serif' },
          padding: 4,
          formatter: formatValue,
        },
      },
      {
        type: 'line' as const,
        label: 'Meta VVR',
        data: data.map(d => d.meta),
        borderColor: '#FFFFFF',
        borderWidth: 2,
        pointBackgroundColor: '#FFFFFF',
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.1,
        fill: false,
        order: 0,
        datalabels: {
          display: true,
          align: 'bottom' as const,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          borderRadius: 4,
          color: 'white',
          font: { size: 10 },
          padding: 3,
          formatter: formatValue,
        },
      },
    ],
  }), [data]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: COLORS.TEXT,
          font: { size: 14, family: 'Poppins, Arial, sans-serif' },
          usePointStyle: true,
        },
      },
      tooltip: {
        padding: 12,
        usePointStyle: true,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        titleColor: COLORS.TEXT,
        bodyColor: COLORS.TEXT,
        borderColor: COLORS.PRIMARY,
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#adb5bd',
          font: { size: 12 },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#adb5bd',
          font: { size: 12 },
          callback: function(value: any) {
            if (value >= 1000000) return (value / 1000000).toFixed(0) + ' mi';
            if (value >= 1000) return (value / 1000).toFixed(0) + ' K';
            return value;
          },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
      },
    },
  }), []);

  return (
    <div className="bg-dark-secondary rounded-xl p-4">
      {/* Título */}
      <h2 className="section-title text-center">
        {titulo} ({anoVigente}){' '}
        <span className="section-title-highlight">{indicadorMeta}</span>
      </h2>

      {/* Seletor de tipo */}
      {onTipoChange && (
        <div className="flex justify-center gap-2 mb-4">
          <button
            onClick={() => onTipoChange('total')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tipoSelecionado === 'total'
                ? 'bg-primary-500 text-white'
                : 'bg-dark-tertiary text-text-muted hover:bg-dark-tertiary/80'
            }`}
          >
            Total
          </button>
          <button
            onClick={() => onTipoChange('vendas')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tipoSelecionado === 'vendas'
                ? 'bg-primary-500 text-white'
                : 'bg-dark-tertiary text-text-muted hover:bg-dark-tertiary/80'
            }`}
          >
            Vendas
          </button>
          <button
            onClick={() => onTipoChange('posvendas')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tipoSelecionado === 'posvendas'
                ? 'bg-primary-500 text-white'
                : 'bg-dark-tertiary text-text-muted hover:bg-dark-tertiary/80'
            }`}
          >
            Pós Venda
          </button>
        </div>
      )}

      {/* Gráfico */}
      <div className="w-full h-80">
        <Chart ref={chartRef} type="bar" data={chartData} options={options} />
      </div>
    </div>
  );
}
