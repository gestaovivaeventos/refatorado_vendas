/**
 * Componente MultiSelect - Seleção múltipla de opções
 * Estilo baseado no PEX (Sidebar.tsx) - dropdown com pesquisa integrada
 */

import React, { useState, useRef, useEffect } from 'react';

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
  maxHeight: '300px',
  overflow: 'hidden',
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.5)',
};

const searchInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  backgroundColor: '#1f2329',
  color: 'white',
  border: '1px solid #3a3f46',
  borderRadius: '6px',
  fontSize: '0.85rem',
  fontFamily: 'Poppins, sans-serif',
  outline: 'none',
};

interface MultiSelectProps {
  label: string;
  icon?: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export default function MultiSelect({
  label,
  icon,
  options,
  selectedValues,
  onChange,
  placeholder = 'Selecione...',
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggle = (option: string) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter((v) => v !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  const handleSelectAll = () => {
    if (selectedValues.length === options.length) {
      onChange([]);
    } else {
      onChange([...options]);
    }
  };

  const handleClearAll = () => {
    onChange([]);
    setIsOpen(false);
    setSearchTerm('');
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === options.length) return 'Todos selecionados';
    if (selectedValues.length === 1) return selectedValues[0];
    return `${selectedValues.length} selecionados`;
  };

  return (
    <div style={{ marginBottom: '25px', position: 'relative' }} ref={containerRef}>
      <label style={labelStyle}>
        {icon && <span style={{ marginRight: '4px' }}>{icon}</span>}
        {label}
      </label>

      {/* Trigger Button */}
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
            {/* Caixa de pesquisa dentro do dropdown */}
            <div style={{ padding: '8px', borderBottom: '1px solid #3a3f46' }}>
              <input
                type="text"
                placeholder="🔍 Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                style={searchInputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#FF6600'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#3a3f46'; }}
              />
            </div>

            {/* Ações - Selecionar Todos / Limpar */}
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              padding: '8px', 
              borderBottom: '1px solid #3a3f46' 
            }}>
              <button
                type="button"
                onClick={handleSelectAll}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  background: 'linear-gradient(180deg, #3a3f44 0%, #2e3236 100%)',
                  color: '#e9ecef',
                  border: '1px solid rgba(0,0,0,0.45)',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontFamily: 'Poppins, sans-serif',
                  cursor: 'pointer',
                }}
              >
                {selectedValues.length === options.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  background: 'linear-gradient(180deg, #3a3f44 0%, #2e3236 100%)',
                  color: '#e9ecef',
                  border: '1px solid rgba(0,0,0,0.45)',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontFamily: 'Poppins, sans-serif',
                  cursor: 'pointer',
                }}
              >
                Limpar
              </button>
            </div>

            {/* Lista de opções */}
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {filteredOptions.length === 0 ? (
                <div style={{
                  padding: '16px 12px',
                  textAlign: 'center',
                  color: '#aaa',
                  fontSize: '0.85rem',
                  fontStyle: 'italic',
                }}>
                  Nenhum resultado encontrado
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = selectedValues.includes(option);
                  return (
                    <div
                      key={option}
                      onClick={() => handleToggle(option)}
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
                      {/* Checkbox visual */}
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '3px',
                        border: isSelected ? '2px solid #FF6600' : '2px solid #555',
                        backgroundColor: isSelected ? '#FF6600' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {isSelected && (
                          <span style={{ color: 'white', fontSize: '10px', fontWeight: 'bold' }}>✓</span>
                        )}
                      </div>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {option}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
