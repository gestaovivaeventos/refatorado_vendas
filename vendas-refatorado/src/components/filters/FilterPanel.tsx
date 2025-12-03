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
      {/* Toggle de Tipo de Meta - Simples */}
      {showMetaToggle && (
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              color: '#aaa',
              fontSize: '0.75rem',
              fontWeight: 500,
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
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
              padding: '8px 12px',
              backgroundColor: '#2a2f36',
              borderRadius: '8px',
            }}
          >
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: filtros.isMetaInterna ? 400 : 600,
                color: filtros.isMetaInterna ? '#adb5bd' : '#ff6600',
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
                backgroundColor: filtros.isMetaInterna ? '#ff6600' : '#495057',
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
                fontSize: '0.85rem',
                fontWeight: filtros.isMetaInterna ? 600 : 400,
                color: filtros.isMetaInterna ? '#ff6600' : '#adb5bd',
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
          icon="🏢"
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
          icon="🗺️"
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
          icon="📍"
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
          icon="🏙️"
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
          icon="👤"
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
          icon="👔"
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
          icon="💳"
          options={opcoes.formasPagamento}
          selectedValues={filtros.formasPagamento}
          onChange={(formasPagamento) => onFiltrosChange({ formasPagamento })}
          placeholder="Todas as formas"
        />
      )}
    </div>
  );
}
