/**
 * Página Principal - Dashboard de Vendas
 */

import React, { useState, useMemo, useCallback } from 'react';
import Head from 'next/head';
import { Header, Sidebar, Loading, KPICard, IndicadorCard, SectionTitle, Card } from '@/components';
import { FilterPanel } from '@/components/filters';
import { VVRChart, CumulativeChart, PieChart, ComparisonChart } from '@/components/charts';
import { RankingTable } from '@/components/tables';
import { useSalesData } from '@/hooks/useSalesData';
import { useMetasData } from '@/hooks/useMetasData';
import { useFundosData } from '@/hooks/useFundosData';
import { useFunilData } from '@/hooks/useFunilData';
import { extrairUnidades, filtrarDados } from '@/utils/calculos';
import { getPeriodoDatas, identificarPeriodo } from '@/utils/periodo';
import { META_CONFIG, PAGES } from '@/config/app.config';
import type { FiltrosState, FiltrosOpcoes, PaginaAtiva } from '@/types/filtros.types';

// Estado inicial dos filtros
const INITIAL_FILTERS: FiltrosState = {
  periodoSelecionado: 'estemes',
  dataInicio: '',
  dataFim: '',
  isMetaInterna: false,
  unidades: [],
  regionais: [],
  ufs: [],
  cidades: [],
  consultores: [],
  supervisores: [],
  formasPagamento: [],
  cursos: [],
  fundos: [],
  origemLead: [],
  segmentacaoLead: [],
  etiquetas: [],
  tipoAdesao: [],
  tipoServico: [],
  tipoCliente: [],
  consultorComercial: [],
  indicacaoAdesao: [],
  instituicao: [],
};

export default function Dashboard() {
  // Estados
  const [paginaAtiva, setPaginaAtiva] = useState<PaginaAtiva>('metas');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosState>(INITIAL_FILTERS);

  // Hooks de dados
  const { data: salesData, loading: loadingSales, error: errorSales } = useSalesData();
  const { data: metasData, loading: loadingMetas, error: errorMetas } = useMetasData();
  const { data: fundosData, loading: loadingFundos, error: errorFundos } = useFundosData();
  const { data: funilData, loading: loadingFunil, error: errorFunil } = useFunilData();

  // Loading global
  const isLoading = loadingSales || loadingMetas || loadingFundos;
  const hasError = errorSales || errorMetas || errorFundos;

  // Extrair opções de filtro dos dados
  const opcoesFiltros = useMemo<FiltrosOpcoes>(() => {
    if (!salesData || salesData.length === 0) {
      return {
        unidades: [],
        regionais: [],
        ufs: [],
        cidades: [],
        consultores: [],
        supervisores: [],
        formasPagamento: [],
        cursos: [],
        fundos: [],
        origensLead: [],
        segmentacoesLead: [],
        etiquetas: [],
        tiposAdesao: [],
        tiposServico: [],
        tiposCliente: [],
        consultoresComerciais: [],
        indicacoesAdesao: [],
        instituicoes: [],
      };
    }

    return {
      unidades: extrairUnidades(salesData),
      regionais: [],
      ufs: [],
      cidades: [],
      consultores: [...new Set(salesData.map((d) => d.consultor_comercial).filter(Boolean))].sort(),
      supervisores: [],
      formasPagamento: [],
      cursos: [...new Set(salesData.map((d) => d.curso_fundo).filter(Boolean))].sort(),
      fundos: fundosData ? [...new Set(fundosData.map((d) => d.nm_fundo).filter(Boolean))].sort() : [],
      origensLead: [],
      segmentacoesLead: [],
      etiquetas: [],
      tiposAdesao: [],
      tiposServico: [...new Set(salesData.map((d) => d.tp_servico).filter(Boolean))].sort(),
      tiposCliente: [...new Set(salesData.map((d) => d.tipo_cliente).filter(Boolean))].sort(),
      consultoresComerciais: [],
      indicacoesAdesao: [],
      instituicoes: [...new Set(salesData.map((d) => d.nm_instituicao).filter(Boolean))].sort(),
    };
  }, [salesData, fundosData]);

  // Calcular período
  const periodo = useMemo(() => {
    if (filtros.periodoSelecionado === 'personalizado') {
      return {
        startDate: filtros.dataInicio ? new Date(filtros.dataInicio) : new Date(),
        endDate: filtros.dataFim ? new Date(filtros.dataFim) : new Date(),
      };
    }
    return getPeriodoDatas(filtros.periodoSelecionado as any);
  }, [filtros.periodoSelecionado, filtros.dataInicio, filtros.dataFim]);

  // Filtrar dados de vendas
  const dadosFiltrados = useMemo(() => {
    if (!salesData || salesData.length === 0 || !periodo?.startDate) return [];
    
    return filtrarDados(salesData, {
      dataInicio: periodo.startDate,
      dataFim: periodo.endDate,
      unidades: filtros.unidades,
    });
  }, [salesData, periodo, filtros.unidades]);

  // Calcular KPIs básicos
  const kpis = useMemo(() => {
    const multiplicador = filtros.isMetaInterna ? META_CONFIG.META_INTERNA_MULTIPLICADOR : 1;
    
    // Calcular VVR (Valor Vendido Realizado)
    const vvr = dadosFiltrados.reduce((sum, d) => sum + (d.vl_plano || 0), 0);
    
    // Calcular QAV (Quantidade de Vendas)
    const qav = dadosFiltrados.length;
    
    // Calcular TK (Ticket Médio)
    const tk = qav > 0 ? vvr / qav : 0;
    
    // Buscar metas
    let metaVVR = 0;
    let metaQAV = 0;
    
    if (metasData && periodo?.startDate) {
      const mes = periodo.startDate.getMonth() + 1;
      const ano = periodo.startDate.getFullYear();
      const unidadesAtivas = filtros.unidades.length > 0 ? filtros.unidades : opcoesFiltros.unidades;
      
      unidadesAtivas.forEach((unidade: string) => {
        const key = `${unidade}-${ano}-${String(mes).padStart(2, '0')}`;
        const meta = metasData.get(key);
        if (meta) {
          metaVVR += meta.meta_vvr_total || 0;
          metaQAV += meta.meta_adesoes || 0;
        }
      });
    }
    
    return {
      vvr,
      qav,
      tk,
      metaVVR: metaVVR * multiplicador,
      metaQAV: metaQAV * multiplicador,
      metaTK: tk * 1.1 * multiplicador,
    };
  }, [dadosFiltrados, metasData, filtros.isMetaInterna, filtros.unidades, opcoesFiltros.unidades, periodo]);

  // Dados para ranking de unidades
  const rankingUnidades = useMemo(() => {
    if (dadosFiltrados.length === 0) return [];

    const porUnidade: Record<string, { valorRealizado: number; valorMeta: number }> = {};
    
    dadosFiltrados.forEach((item) => {
      const unidade = item.nm_unidade || 'Não informado';
      if (!porUnidade[unidade]) {
        porUnidade[unidade] = { valorRealizado: 0, valorMeta: 0 };
      }
      porUnidade[unidade].valorRealizado += item.vl_plano || 0;
    });

    // Adicionar metas
    const multiplicador = filtros.isMetaInterna ? META_CONFIG.META_INTERNA_MULTIPLICADOR : 1;
    
    if (metasData && periodo?.startDate) {
      const mes = periodo.startDate.getMonth() + 1;
      const ano = periodo.startDate.getFullYear();
      
      Object.keys(porUnidade).forEach((unidade) => {
        const key = `${unidade}-${ano}-${String(mes).padStart(2, '0')}`;
        const meta = metasData.get(key);
        if (meta) {
          porUnidade[unidade].valorMeta = (meta.meta_vvr_total || 0) * multiplicador;
        }
      });
    }

    return Object.entries(porUnidade)
      .map(([nome, dados]) => ({
        nome,
        valorRealizado: dados.valorRealizado,
        valorMeta: dados.valorMeta,
        percentual: dados.valorMeta > 0 ? dados.valorRealizado / dados.valorMeta : 0,
      }))
      .sort((a, b) => b.percentual - a.percentual)
      .map((item, index) => ({ ...item, posicao: index + 1 }));
  }, [dadosFiltrados, metasData, filtros.isMetaInterna, periodo]);

  // Dados para gráfico de VVR por unidade
  const chartDataVVR = useMemo(() => {
    return rankingUnidades.slice(0, 10).map((item) => ({
      label: item.nome,
      realizado: item.valorRealizado,
      meta: item.valorMeta,
    }));
  }, [rankingUnidades]);

  // Handler para atualizar filtros
  const handleFiltrosChange = useCallback((novosFiltros: Partial<FiltrosState>) => {
    setFiltros((prev) => ({ ...prev, ...novosFiltros }));
  }, []);

  // Renderizar conteúdo baseado na página ativa
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <Loading mensagem="Carregando dados do dashboard..." />
        </div>
      );
    }

    if (hasError) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-danger text-lg mb-2">Erro ao carregar dados</p>
            <p className="text-text-muted">{errorSales || errorMetas || errorFundos}</p>
          </div>
        </div>
      );
    }

    switch (paginaAtiva) {
      case 'metas':
        return renderMetasPage();
      case 'indicadores':
        return renderIndicadoresPage();
      case 'funil':
        return renderFunilPage();
      default:
        return renderMetasPage();
    }
  };

  // Página de Metas e Resultados
  const renderMetasPage = () => (
    <div className="space-y-6">
      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard
          titulo="VVR - Valor Vendido Realizado"
          valorRealizado={kpis.vvr}
          valorMeta={kpis.metaVVR}
          formatarComoMoeda={true}
        />
        <KPICard
          titulo="QAV - Quantidade de Vendas"
          valorRealizado={kpis.qav}
          valorMeta={kpis.metaQAV}
          formatarComoMoeda={false}
        />
        <KPICard
          titulo="TK - Ticket Médio"
          valorRealizado={kpis.tk}
          valorMeta={kpis.metaTK}
          formatarComoMoeda={true}
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card titulo="VVR por Unidade">
          <VVRChart data={chartDataVVR} />
        </Card>
        <Card titulo="Evolução Acumulada">
          <CumulativeChart 
            data={[]}
            metaTotal={kpis.metaVVR}
          />
        </Card>
      </div>

      {/* Ranking */}
      <Card>
        <RankingTable 
          data={rankingUnidades}
          title="Ranking de Unidades"
          tipo="unidade"
        />
      </Card>
    </div>
  );

  // Página de Indicadores Secundários
  const renderIndicadoresPage = () => (
    <div className="space-y-6">
      <SectionTitle>Indicadores Operacionais</SectionTitle>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <IndicadorCard 
          label="Total Contratos"
          valor={fundosData?.length || 0}
          meta={100}
        />
        <IndicadorCard 
          label="Adesões no Período"
          valor={dadosFiltrados.length}
          meta={kpis.metaQAV}
        />
        <IndicadorCard 
          label="Ticket Médio"
          valor={Math.round(kpis.tk)}
          meta={Math.round(kpis.metaTK)}
        />
        <IndicadorCard 
          label="Conversão"
          valor={0}
          meta={100}
        />
      </div>

      {/* Gráficos de distribuição */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card titulo="Distribuição por Tipo de Serviço">
          <PieChart 
            data={[]} 
            title=""
          />
        </Card>
        <Card titulo="Comparativo Ano a Ano">
          <ComparisonChart 
            data={[]}
            title=""
          />
        </Card>
      </div>
    </div>
  );

  // Página de Funil de Vendas
  const renderFunilPage = () => (
    <div className="space-y-6">
      <SectionTitle>Funil de Vendas</SectionTitle>
      
      {loadingFunil ? (
        <Loading mensagem="Carregando dados do funil..." />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card titulo="Funil de Conversão">
              <div className="text-center text-text-muted py-10">
                {funilData && funilData.length > 0 
                  ? `${funilData.length} leads carregados`
                  : 'Sem dados do funil disponíveis'
                }
              </div>
            </Card>
            <Card titulo="Perdas por Fase">
              <div className="text-center text-text-muted py-10">
                Análise de perdas será exibida aqui
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      <Head>
        <title>Dashboard de Vendas | VIVA Eventos</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-dark-primary">
        {/* Header */}
        <Header />

        {/* Layout principal */}
        <div className="flex">
          {/* Sidebar */}
          <Sidebar
            paginaAtiva={paginaAtiva}
            onPaginaChange={(p) => setPaginaAtiva(p as PaginaAtiva)}
            isCollapsed={sidebarCollapsed}
            onCollapseChange={setSidebarCollapsed}
          >
            <FilterPanel
              filtros={filtros}
              opcoes={opcoesFiltros}
              onFiltrosChange={handleFiltrosChange}
              showMetaToggle={paginaAtiva === 'metas'}
              showUnidades={true}
              showRegionais={false}
              showUFs={false}
              showCidades={false}
              showConsultores={paginaAtiva !== 'funil'}
              showSupervisores={false}
            />
          </Sidebar>

          {/* Conteúdo principal */}
          <main 
            className="flex-1 p-6 transition-all duration-300"
            style={{ 
              marginLeft: sidebarCollapsed ? '0' : '280px',
            }}
          >
            {/* Título da página */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-text-primary">
                {PAGES.find(p => p.id === paginaAtiva)?.label || 'Dashboard'}
              </h1>
              <p className="text-text-muted text-sm mt-1">
                Período: {identificarPeriodo(filtros.periodoSelecionado)}
                {filtros.isMetaInterna && ' | Meta Interna (85%)'}
              </p>
            </div>

            {/* Conteúdo */}
            {renderContent()}
          </main>
        </div>
      </div>
    </>
  );
}
