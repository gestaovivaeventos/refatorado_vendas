/**
 * Componente DateRangePicker - Seletor de intervalo de datas
 * Dropdown no padrão MultiSelect com filtros rápidos + período personalizado
 */

import React, { useState, useRef, useEffect } from 'react';

// Opções de período pré-definido
const QUICK_PERIODS = [
  { value: 'hoje', label: 'Hoje' },
  { value: 'ontem', label: 'Ontem' },
  { value: 'ultimos7dias', label: 'Últimos 7 dias' },
  { value: 'ultimos30dias', label: 'Últimos 30 dias' },
  { value: 'estemes', label: 'Este mês' },
  { value: 'mespassado', label: 'Mês passado' },
  { value: 'esteano', label: 'Este ano' },
  { value: 'anopassado', label: 'Ano passado' },
];

// Estilos inline no padrão PEX/MultiSelect
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

const triggerStyle: React.CSSProperties = {
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
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)',
};

const dropdownStyle: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  marginTop: '4px',
  backgroundColor: '#2a2f36',
  border: '2px solid #FF6600',
  borderRadius: '8px',
  zIndex: 1000,
  maxHeight: '400px',
  overflow: 'hidden',
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.5)',
};

interface DateRangePickerProps {
  periodoSelecionado: string;
  dataInicio: string;
  dataFim: string;
  onPeriodoChange: (periodo: string) => void;
  onDataInicioChange: (data: string) => void;
  onDataFimChange: (data: string) => void;
}

// Função para calcular datas dos períodos pré-definidos
function getPredefinedPeriod(period: string): { start: Date; end: Date } | null {
  const hoje = new Date();
  const year = hoje.getFullYear();
  const month = hoje.getMonth();
  const day = hoje.getDate();

  switch (period) {
    case 'hoje':
      return { start: new Date(year, month, day), end: new Date(year, month, day) };
    case 'ontem':
      const ontem = new Date(hoje);
      ontem.setDate(day - 1);
      return { start: ontem, end: new Date(ontem) };
    case 'ultimos7dias':
      const sete = new Date(hoje);
      sete.setDate(day - 6);
      return { start: sete, end: hoje };
    case 'ultimos30dias':
      const trinta = new Date(hoje);
      trinta.setDate(day - 29);
      return { start: trinta, end: hoje };
    case 'estemes':
      return { start: new Date(year, month, 1), end: new Date(year, month + 1, 0) };
    case 'mespassado':
      return { start: new Date(year, month - 1, 1), end: new Date(year, month, 0) };
    case 'esteano':
      return { start: new Date(year, 0, 1), end: new Date(year, 11, 31) };
    case 'anopassado':
      return { start: new Date(year - 1, 0, 1), end: new Date(year - 1, 11, 31) };
    default:
      return null;
  }
}

// Função para formatar para input date
function formatDateForInput(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

export default function DateRangePicker({
  periodoSelecionado,
  dataInicio,
  dataFim,
  onPeriodoChange,
  onDataInicioChange,
  onDataFimChange,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Handler para selecionar período rápido
  const handleQuickPeriod = (period: string) => {
    const dates = getPredefinedPeriod(period);
    if (dates) {
      onPeriodoChange(period);
      onDataInicioChange(formatDateForInput(dates.start));
      onDataFimChange(formatDateForInput(dates.end));
    }
    setIsOpen(false);
  };

  // Obter texto de exibição
  const getDisplayText = (): string => {
    const found = QUICK_PERIODS.find((p) => p.value === periodoSelecionado);
    if (found) return found.label;
    if (periodoSelecionado === 'personalizado') return 'Período personalizado';
    return 'Selecione o período';
  };

  return (
    <div style={{ marginBottom: '25px', position: 'relative' }} ref={containerRef}>
      <label style={labelStyle}>
        <span style={{ marginRight: '4px' }}>📅</span>
        Período
      </label>

      {/* Trigger Button - igual ao MultiSelect */}
      <div style={{ position: 'relative' }}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={triggerStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.3)';
          }}
        >
          <span style={{ 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap',
            flex: 1 
          }}>
            {getDisplayText()}
          </span>
          <span style={{ fontSize: '0.7rem', marginLeft: '8px' }}>▼</span>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div style={dropdownStyle}>
            {/* Seção: Período Personalizado */}
            <div style={{ padding: '12px', borderBottom: '1px solid #3a3f46' }}>
              <div style={{ 
                color: '#888', 
                fontSize: '0.7rem', 
                fontWeight: 600, 
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '10px',
                fontFamily: 'Poppins, sans-serif',
              }}>
                ⚙️ Período Personalizado
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#888', fontSize: '0.7rem', width: '30px' }}>De:</span>
                  <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => {
                      onDataInicioChange(e.target.value);
                      onPeriodoChange('personalizado');
                    }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      backgroundColor: '#1f2329',
                      color: 'white',
                      border: '1px solid #3a3f46',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontFamily: 'Poppins, sans-serif',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6600'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#3a3f46'; }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#888', fontSize: '0.7rem', width: '30px' }}>Até:</span>
                  <input
                    type="date"
                    value={dataFim}
                    onChange={(e) => {
                      onDataFimChange(e.target.value);
                      onPeriodoChange('personalizado');
                    }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      backgroundColor: '#1f2329',
                      color: 'white',
                      border: '1px solid #3a3f46',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontFamily: 'Poppins, sans-serif',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6600'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#3a3f46'; }}
                  />
                </div>
              </div>
            </div>

            {/* Seção: Atalhos Rápidos */}
            <div style={{ padding: '8px 12px 4px' }}>
              <div style={{ 
                color: '#888', 
                fontSize: '0.7rem', 
                fontWeight: 600, 
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '6px',
                fontFamily: 'Poppins, sans-serif',
              }}>
                ⚡ Atalhos Rápidos
              </div>
            </div>

            {/* Lista de opções rápidas */}
            <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
              {QUICK_PERIODS.map((option) => {
                const isSelected = periodoSelecionado === option.value;
                return (
                  <div
                    key={option.value}
                    onClick={() => handleQuickPeriod(option.value)}
                    style={{
                      padding: '10px 12px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontFamily: 'Poppins, sans-serif',
                      color: isSelected ? '#FF6600' : '#ccc',
                      fontWeight: isSelected ? 600 : 400,
                      backgroundColor: isSelected ? '#1f2329' : 'transparent',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#1f2329';
                      e.currentTarget.style.color = '#FF6600';
                    }}
                    onMouseLeave={(e) => {
                      if (isSelected) {
                        e.currentTarget.style.backgroundColor = '#1f2329';
                        e.currentTarget.style.color = '#FF6600';
                      } else {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#ccc';
                      }
                    }}
                  >
                    {/* Radio visual */}
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      border: isSelected ? '2px solid #FF6600' : '2px solid #555',
                      backgroundColor: 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {isSelected && (
                        <div style={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          backgroundColor: '#FF6600' 
                        }} />
                      )}
                    </div>
                    <span>{option.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
