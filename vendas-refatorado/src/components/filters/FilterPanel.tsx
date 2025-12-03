/**
 * Componente FilterPanel - Painel completo de filtros
 * Estilo baseado no PEX (Sidebar.tsx)
 */

import React from 'react';
import DateRangePicker from './DateRangePicker';
import MultiSelect from './MultiSelect';
import type { FiltrosState, FiltrosOpcoes } from '@/types/filtros.types';

interface FilterPanelProps {
  filtros: FiltrosState;
  opcoes: FiltrosOpcoes;
  onFiltrosChange: (filtros: Partial<FiltrosState>) => void;
  showMetaToggle?: boolean;
  showUnidades?: boolean;
  showRegionais?: boolean;
  showUFs?: boolean;
  showCidades?: boolean;
  showConsultores?: boolean;
  showSupervisores?: boolean;
  showFormasPagamento?: boolean;
}

export default function FilterPanel({
  filtros,
  opcoes,
  onFiltrosChange,
  showMetaToggle = true,
  showUnidades = true,
  showRegionais = true,
  showUFs = true,
  showCidades = true,
  showConsultores = false,
  showSupervisores = false,
  showFormasPagamento = false,
}: FilterPanelProps) {
  return (
    <div>
      {/* Toggle de Tipo de Meta */}
      {showMetaToggle && (
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              color: '#adb5bd',
              fontSize: '0.75rem',
              fontWeight: 600,
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            Tipo de Meta
          </label>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              backgroundColor: '#2a2f36',
              borderRadius: '8px',
              border: '1px solid #444',
            }}
          >
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: filtros.isMetaInterna ? 400 : 600,
                color: filtros.isMetaInterna ? '#6c757d' : '#FF6600',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              Super Meta
            </span>
            <button
              onClick={() => onFiltrosChange({ isMetaInterna: !filtros.isMetaInterna })}
              style={{
                position: 'relative',
                width: '44px',
                height: '24px',
                backgroundColor: filtros.isMetaInterna ? '#FF6600' : '#444',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                padding: 0,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  left: filtros.isMetaInterna ? '22px' : '2px',
                  width: '20px',
                  height: '20px',
                  backgroundColor: '#fff',
                  borderRadius: '50%',
                  transition: 'left 0.2s',
                }}
              />
            </button>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: filtros.isMetaInterna ? 600 : 400,
                color: filtros.isMetaInterna ? '#FF6600' : '#6c757d',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              Meta Interna
            </span>
          </div>
        </div>
      )}

      {/* Filtro de Período */}
      <DateRangePicker
        periodoSelecionado={filtros.periodoSelecionado}
        dataInicio={filtros.dataInicio}
        dataFim={filtros.dataFim}
        onPeriodoChange={(periodoSelecionado) => onFiltrosChange({ periodoSelecionado })}
        onDataInicioChange={(dataInicio) => onFiltrosChange({ dataInicio })}
        onDataFimChange={(dataFim) => onFiltrosChange({ dataFim })}
      />

      {/* Filtro de Unidades */}
      {showUnidades && opcoes.unidades.length > 0 && (
        <MultiSelect
          label="Unidades"
          options={opcoes.unidades}
          selectedValues={filtros.unidades}
          onChange={(unidades) => onFiltrosChange({ unidades })}
          placeholder="Todas as unidades"
        />
      )}

      {/* Filtro de Regionais */}
      {showRegionais && opcoes.regionais.length > 0 && (
        <MultiSelect
          label="Regionais"
          options={opcoes.regionais}
          selectedValues={filtros.regionais}
          onChange={(regionais) => onFiltrosChange({ regionais })}
          placeholder="Todas as regionais"
        />
      )}

      {/* Filtro de UFs */}
      {showUFs && opcoes.ufs.length > 0 && (
        <MultiSelect
          label="UFs"
          options={opcoes.ufs}
          selectedValues={filtros.ufs}
          onChange={(ufs) => onFiltrosChange({ ufs })}
          placeholder="Todos os estados"
        />
      )}

      {/* Filtro de Cidades */}
      {showCidades && opcoes.cidades.length > 0 && (
        <MultiSelect
          label="Cidades"
          options={opcoes.cidades}
          selectedValues={filtros.cidades}
          onChange={(cidades) => onFiltrosChange({ cidades })}
          placeholder="Todas as cidades"
        />
      )}

      {/* Filtro de Consultores */}
      {showConsultores && opcoes.consultores.length > 0 && (
        <MultiSelect
          label="Consultores"
          options={opcoes.consultores}
          selectedValues={filtros.consultores}
          onChange={(consultores) => onFiltrosChange({ consultores })}
          placeholder="Todos os consultores"
        />
      )}

      {/* Filtro de Supervisores */}
      {showSupervisores && opcoes.supervisores.length > 0 && (
        <MultiSelect
          label="Supervisores"
          options={opcoes.supervisores}
          selectedValues={filtros.supervisores}
          onChange={(supervisores) => onFiltrosChange({ supervisores })}
          placeholder="Todos os supervisores"
        />
      )}

      {/* Filtro de Formas de Pagamento */}
      {showFormasPagamento && opcoes.formasPagamento.length > 0 && (
        <MultiSelect
          label="Formas de Pagamento"
          options={opcoes.formasPagamento}
          selectedValues={filtros.formasPagamento}
          onChange={(formasPagamento) => onFiltrosChange({ formasPagamento })}
          placeholder="Todas as formas"
        />
      )}
    </div>
  );
}
