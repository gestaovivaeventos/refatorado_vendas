/**
 * Componente DateRangePicker - Seletor de intervalo de datas
 * Estilo baseado no PEX (Sidebar.tsx)
 */

import React from 'react';
import { PERIODO_OPTIONS } from '@/config/app.config';

// Estilo para options do select
const selectOptionStyle = `
  select option {
    background-color: #2a2f36 !important;
    color: white !important;
    padding: 8px 12px !important;
  }
  select option:checked {
    background-color: #FF6600 !important;
    color: white !important;
  }
`;

// Estilos inline no padrão PEX
const labelStyle: React.CSSProperties = {
  display: 'block',
  color: '#aaa',
  fontSize: '0.75rem',
  fontWeight: 500,
  marginBottom: '8px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  fontFamily: 'Poppins, sans-serif',
};

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  background: 'linear-gradient(to bottom, #5a6573 0%, #4a5563 50%, #3a4553 100%)',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '0.9rem',
  fontWeight: 600,
  fontFamily: 'Poppins, sans-serif',
  cursor: 'pointer',
  transition: 'all 0.2s',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)',
  WebkitAppearance: 'none',
  appearance: 'none',
  paddingRight: '40px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  backgroundColor: '#1f2329',
  color: 'white',
  border: '1px solid #3a3f46',
  borderRadius: '6px',
  fontSize: '0.85rem',
  fontFamily: 'Poppins, sans-serif',
  outline: 'none',
};

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

  const handleSelectHover = (e: React.MouseEvent<HTMLSelectElement>, isHover: boolean) => {
    if (isHover) {
      e.currentTarget.style.transform = 'translateY(-1px)';
      e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.3)';
    } else {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)';
    }
  };

  return (
    <>
      <style>{selectOptionStyle}</style>
      <div style={{ marginBottom: '25px' }}>
        <label style={labelStyle}>📅 Período</label>
        
        {/* Dropdown de períodos pré-definidos */}
        <div style={{ position: 'relative' }}>
          <select
            value={periodoSelecionado}
            onChange={(e) => onPeriodoChange(e.target.value)}
            style={selectStyle}
            onMouseEnter={(e) => handleSelectHover(e, true)}
            onMouseLeave={(e) => handleSelectHover(e, false)}
          >
            {PERIODO_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span style={{ 
            position: 'absolute', 
            right: '16px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            pointerEvents: 'none', 
            fontSize: '0.7rem', 
            color: 'white' 
          }}>▼</span>
        </div>
        
        {/* Campos de data customizada */}
        {isCustom && (
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ ...labelStyle, marginBottom: '4px', fontSize: '0.7rem' }}>Data Início</label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => onDataInicioChange(e.target.value)}
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6600'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#3a3f46'; }}
              />
            </div>
            <div>
              <label style={{ ...labelStyle, marginBottom: '4px', fontSize: '0.7rem' }}>Data Fim</label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => onDataFimChange(e.target.value)}
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6600'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#3a3f46'; }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
