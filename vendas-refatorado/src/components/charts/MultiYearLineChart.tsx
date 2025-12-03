import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels
);

interface MultiYearLineChartProps {
  data: {
    year: number;
    monthlyData: number[];
  }[];
  activeYears: number[];
  onYearToggle: (year: number) => void;
  formatValue?: (value: number) => string;
}

// Paleta de cores degradê cinza -> amarelo -> laranja (igual ao original)
const generatePalette = (count: number): { rgb: string; hex: string }[] => {
  if (count <= 1) return [{ rgb: 'rgb(255,102,0)', hex: '#FF6600' }];
  
  const colors: { rgb: string; hex: string }[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    let r: number, g: number, b: number;
    
    if (t <= 0.5) {
      // Cinza para amarelo
      const localT = t / 0.5;
      r = Math.round(108 + (255 - 108) * localT);
      g = Math.round(117 + (179 - 117) * localT);
      b = Math.round(125 + (0 - 125) * localT);
    } else {
      // Amarelo para laranja
      const localT = (t - 0.5) / 0.5;
      r = Math.round(255 + (255 - 255) * localT);
      g = Math.round(179 + (102 - 179) * localT);
      b = Math.round(0 + (0 - 0) * localT);
    }
    
    colors.push({
      rgb: `rgb(${r},${g},${b})`,
      hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
    });
  }
  return colors;
};

const formatNumber = (value: number): string => {
  if (Math.abs(value) >= 1000000) {
    return (value / 1000000).toFixed(1).replace('.0', '') + ' mi';
  }
  if (Math.abs(value) >= 1000) {
    return (value / 1000).toFixed(1).replace('.0', '') + 'k';
  }
  return value.toLocaleString('pt-BR');
};

export const MultiYearLineChart: React.FC<MultiYearLineChartProps> = ({
  data,
  activeYears,
  onYearToggle,
  formatValue = formatNumber,
}) => {
  const monthLabels = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  
  const allYears = useMemo(() => data.map(d => d.year).sort(), [data]);
  const palette = useMemo(() => generatePalette(allYears.length), [allYears.length]);

  const chartData = useMemo(() => ({
    labels: monthLabels,
    datasets: data.map((yearData, index) => {
      const isActive = activeYears.includes(yearData.year);
      const colorObj = palette[index];
      const color = colorObj.hex;
      
      return {
        label: String(yearData.year),
        data: yearData.monthlyData,
        borderColor: color,
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return 'transparent';
          
          // Gradiente vertical: cor da linha no topo -> transparente na base
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, color + '40'); // 25% opacidade no topo
          gradient.addColorStop(0.5, color + '15'); // 8% no meio
          gradient.addColorStop(1, 'transparent'); // transparente na base
          return gradient;
        },
        fill: true,
        tension: 0.3, // Curva mais suave
        borderWidth: isActive ? 2 : 1.5, // Linha fina
        pointRadius: isActive ? 3 : 0,
        pointHoverRadius: 5,
        pointBackgroundColor: color,
        pointBorderColor: color,
        pointBorderWidth: 1,
        hidden: !isActive,
      };
    }),
  }), [data, activeYears, palette]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: '#F8F9FA',
          font: { size: 14, family: 'Poppins, Arial, sans-serif', weight: 'bold' as const },
          usePointStyle: true,
          pointStyle: 'rect',
          boxWidth: 20,
          boxHeight: 10,
          padding: 15,
        },
      },
      tooltip: {
        padding: 12,
        backgroundColor: 'rgba(33,37,41,0.95)',
        titleFont: { size: 14, family: 'Poppins, Arial, sans-serif', weight: 'bold' as const },
        bodyFont: { size: 14, family: 'Poppins, Arial, sans-serif', weight: 'bold' as const },
        footerFont: { size: 12, family: 'Poppins, Arial, sans-serif', weight: 'bold' as const },
        cornerRadius: 6,
        displayColors: true,
        boxWidth: 12,
        boxHeight: 12,
        usePointStyle: true,
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y || 0;
            return ` ${label}: R$ ${formatValue(value)}`;
          },
          footer: (tooltipItems: any[]) => {
            const sum = tooltipItems.reduce((acc, item) => acc + item.parsed.y, 0);
            return `Total: R$ ${formatValue(sum)}`;
          },
        },
      },
      datalabels: {
        display: (context: any) => {
          // Só mostra labels para linhas ativas e com valor
          return !context.dataset.hidden && context.parsed?.y > 0;
        },
        color: (context: any) => context.dataset.borderColor,
        font: { size: 11, weight: 'bold' as const, family: 'Poppins, Arial, sans-serif' },
        anchor: 'end' as const,
        align: 'top' as const,
        offset: 4,
        formatter: (value: number) => {
          if (!value || value === 0) return '';
          return formatValue(value);
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#ADB5BD',
          font: { size: 14, family: 'Poppins, Arial, sans-serif' },
        },
        grid: { color: 'rgba(255,255,255,0.04)' },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#ADB5BD',
          font: { size: 14, family: 'Poppins, Arial, sans-serif' },
          callback: (value: any) => formatValue(Number(value)),
        },
        grid: { color: 'rgba(255,255,255,0.04)' },
      },
    },
  }), [formatValue]);

  return (
    <div className="flex flex-col h-full">
      {/* Seletor de anos */}
      <div className="flex flex-wrap gap-2 mb-4">
        {allYears.map((year) => (
          <button
            key={year}
            onClick={() => onYearToggle(year)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${activeYears.includes(year)
                ? 'bg-orange-500/10 border border-orange-500 text-orange-500'
                : 'text-gray-400 border border-transparent bg-dark-tertiary hover:bg-white/5'
              }
            `}
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            {year}
          </button>
        ))}
      </div>

      {/* Gráfico */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};
