/**
 * Componente FilterPanel - Painel completo de filtros
 * Estilo baseado no PEX (Sidebar.tsx)
 */

import React from 'react';
import DateRangePicker from './DateRangePicker';
import MultiSelect from './MultiSelect';
import { MetaToggle } from '@/components';
import type { FiltrosState, FiltrosOpcoes } from '@/types/filtros.types';

// Estilos para botões no padrão PEX
const buttonPrimaryStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  background: 'linear-gradient(to bottom, #FF7A33 0%, #FF6600 50%, #E55A00 100%)',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '0.9rem',
  fontWeight: 600,
  fontFamily: 'Poppins, sans-serif',
  cursor: 'pointer',
  transition: 'all 0.2s',
  boxShadow: '0 4px 12px rgba(255, 102, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
  marginTop: '16px',
};

const buttonSecondaryStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  background: 'linear-gradient(180deg, #3a3f44 0%, #2e3236 100%)',
  color: '#e9ecef',
  border: '1px solid rgba(0,0,0,0.45)',
  borderRadius: '8px',
  fontSize: '0.9rem',
  fontWeight: 600,
  fontFamily: 'Poppins, sans-serif',
  cursor: 'pointer',
  transition: 'all 0.2s',
  marginTop: '8px',
};

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
      {/* Toggle de Meta */}
      {showMetaToggle && (
        <div style={{ marginBottom: '25px' }}>
          <MetaToggle
            isMetaInterna={filtros.isMetaInterna}
            onChange={(isMetaInterna) => onFiltrosChange({ isMetaInterna })}
          />
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

      {/* Botão Aplicar Filtros */}
      <button
        onClick={() => {
          // Trigger uma atualização forçada
          onFiltrosChange({ ...filtros });
        }}
        style={buttonPrimaryStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 102, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 102, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
        }}
      >
        🔍 Aplicar Filtros
      </button>

      {/* Botão Limpar Filtros */}
      <button
        onClick={() => {
          onFiltrosChange({
            unidades: [],
            regionais: [],
            ufs: [],
            cidades: [],
            consultores: [],
            supervisores: [],
            formasPagamento: [],
          });
        }}
        style={buttonSecondaryStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.filter = 'brightness(1.15)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.filter = 'brightness(1)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        🗑️ Limpar Filtros
      </button>
    </div>
  );
}
