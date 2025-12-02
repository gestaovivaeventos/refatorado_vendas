/**
 * Componente DateRangePicker - Seletor de intervalo de datas
 */

import React from 'react';
import { PERIODO_OPTIONS } from '@/config/app.config';

interface DateRangePickerProps {
  periodoSelecionado: string;
  dataInicio: string;
  dataFim: string;
  onPeriodoChange: (periodo: string) => void;
  onDataInicioChange: (data: string) => void;
  onDataFimChange: (data: string) => void;
}

export default function DateRangePicker({
  periodoSelecionado,
  dataInicio,
  dataFim,
  onPeriodoChange,
  onDataInicioChange,
  onDataFimChange,
}: DateRangePickerProps) {
  const isCustom = periodoSelecionado === 'personalizado';

  return (
    <div className="filter-group">
      <label className="filter-label">📅 Período</label>
      
      {/* Dropdown de períodos pré-definidos */}
      <select
        value={periodoSelecionado}
        onChange={(e) => onPeriodoChange(e.target.value)}
        className="filter-select mb-3"
      >
        {PERIODO_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      
      {/* Campos de data customizada */}
      {isCustom && (
        <div className="space-y-2">
          <div>
            <label className="text-xs text-text-muted">Data Início</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => onDataInicioChange(e.target.value)}
              className="filter-input"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted">Data Fim</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => onDataFimChange(e.target.value)}
              className="filter-input"
            />
          </div>
        </div>
      )}
    </div>
  );
}
