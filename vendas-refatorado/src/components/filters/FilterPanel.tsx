/**
 * Componente FilterPanel - Painel completo de filtros
 */

import React from 'react';
import DateRangePicker from './DateRangePicker';
import MultiSelect from './MultiSelect';
import { MetaToggle } from '@/components';
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
    <div className="space-y-4">
      {/* Toggle de Meta */}
      {showMetaToggle && (
        <MetaToggle
          isMetaInterna={filtros.isMetaInterna}
          onChange={(isMetaInterna) => onFiltrosChange({ isMetaInterna })}
        />
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
        className="btn-primary w-full mt-4"
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
        className="btn-secondary w-full"
      >
        🗑️ Limpar Filtros
      </button>
    </div>
  );
}
