/**
 * Página Principal - Dashboard de Vendas
 * Replica exatamente a primeira página do dashboard original
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Header, Sidebar, Loading, KPICard, IndicadoresOperacionais, Card } from '@/components';
import { FilterPanel } from '@/components/filters';
import { 
  VVRVsMetaChart, 
  CumulativeYearChart, 
  PieChart, 
  ComparisonChart, 
  StackedBarChart, 
  TicketMedioChart,
  MultiYearLineChart,
  SimpleBarChart,
  MultiYearBarChart,
} from '@/components/charts';
import { RankingTable, DataTable } from '@/components/tables';
import { DataTable as GenericDataTable } from '@/components/DataTable';
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

// Nomes dos meses abreviados
const MESES_NOMES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export default function Dashboard() {
  const router = useRouter();
  
  // Estados
  const [paginaAtiva, setPaginaAtiva] = useState<PaginaAtiva>('metas');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosState>(INITIAL_FILTERS);
  const [tipoGraficoVVR, setTipoGraficoVVR] = useState<'total' | 'vendas' | 'posvendas'>('total');

  // Sincronizar página com URL
  useEffect(() => {
    const path = router.asPath;
    if (path.includes('/indicadores')) {
      setPaginaAtiva('indicadores');
    } else if (path.includes('/funil')) {
      setPaginaAtiva('funil');
    } else if (path === '/' || path.includes('/metas')) {
      setPaginaAtiva('metas');
      // Redirecionar / para /metas
      if (path === '/') {
        router.replace('/metas', undefined, { shallow: true });
      }
    }
  }, [router.asPath]);

  // Handler para mudança de página com atualização de URL
  const handlePaginaChange = useCallback((novaPagina: string) => {
    const pagina = novaPagina as PaginaAtiva;
    setPaginaAtiva(pagina);
    router.push(`/${pagina}`, undefined, { shallow: true });
  }, [router]);

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

  // Ano vigente baseado no período
  const anoVigente = useMemo(() => {
    return periodo?.startDate?.getFullYear() || new Date().getFullYear();
  }, [periodo]);

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
    
    // Separar vendas e pós-vendas
    const vendas = dadosFiltrados.filter(d => 
      (d.venda_posvenda || '').toUpperCase().includes('VENDA') && 
      !(d.venda_posvenda || '').toUpperCase().includes('POS')
    );
    const posVendas = dadosFiltrados.filter(d => 
      (d.venda_posvenda || '').toUpperCase().includes('POS')
    );
    
    // Calcular VVR (Valor Vendido Realizado)
    const vvrTotal = dadosFiltrados.reduce((sum, d) => sum + (d.vl_plano || 0), 0);
    const vvrVendas = vendas.reduce((sum, d) => sum + (d.vl_plano || 0), 0);
    const vvrPosVendas = posVendas.reduce((sum, d) => sum + (d.vl_plano || 0), 0);
    
    // Calcular QAV (Quantidade de Vendas)
    const qav = dadosFiltrados.length;
    
    // Calcular TK (Ticket Médio)
    const tk = qav > 0 ? vvrTotal / qav : 0;
    
    // Buscar metas
    let metaVVRTotal = 0;
    let metaVVRVendas = 0;
    let metaVVRPosVendas = 0;
    let metaQAV = 0;
    
    if (metasData && periodo?.startDate) {
      const mes = periodo.startDate.getMonth() + 1;
      const ano = periodo.startDate.getFullYear();
      const unidadesAtivas = filtros.unidades.length > 0 ? filtros.unidades : opcoesFiltros.unidades;
      
      unidadesAtivas.forEach((unidade: string) => {
        const key = `${unidade}-${ano}-${String(mes).padStart(2, '0')}`;
        const meta = metasData.get(key);
        if (meta) {
          metaVVRVendas += meta.meta_vvr_vendas || 0;
          metaVVRPosVendas += meta.meta_vvr_posvendas || 0;
          metaVVRTotal += meta.meta_vvr_total || 0;
          metaQAV += meta.meta_adesoes || 0;
        }
      });
    }
    
    return {
      vvrTotal,
      vvrVendas,
      vvrPosVendas,
      qav,
      tk,
      metaVVRTotal: metaVVRTotal * multiplicador,
      metaVVRVendas: metaVVRVendas * multiplicador,
      metaVVRPosVendas: metaVVRPosVendas * multiplicador,
      metaQAV: metaQAV * multiplicador,
      metaTK: tk * 1.1 * multiplicador,
    };
  }, [dadosFiltrados, metasData, filtros.isMetaInterna, filtros.unidades, opcoesFiltros.unidades, periodo]);

  // KPIs do ano anterior (mesmo período)
  const kpisAnoAnterior = useMemo(() => {
    if (!salesData || salesData.length === 0 || !periodo?.startDate) {
      return { vvrTotal: 0, vvrVendas: 0, vvrPosVendas: 0, metaVVRTotal: 0, metaVVRVendas: 0, metaVVRPosVendas: 0 };
    }

    const multiplicador = filtros.isMetaInterna ? META_CONFIG.META_INTERNA_MULTIPLICADOR : 1;
    
    // Período do ano anterior
    const startDateAnoAnterior = new Date(
      periodo.startDate.getFullYear() - 1,
      periodo.startDate.getMonth(),
      periodo.startDate.getDate()
    );
    const endDateAnoAnterior = new Date(
      periodo.endDate.getFullYear() - 1,
      periodo.endDate.getMonth(),
      periodo.endDate.getDate()
    );

    // Filtrar dados do ano anterior
    const dadosAnoAnterior = filtrarDados(salesData, {
      dataInicio: startDateAnoAnterior,
      dataFim: endDateAnoAnterior,
      unidades: filtros.unidades,
    });

    // Separar vendas e pós-vendas
    const vendas = dadosAnoAnterior.filter(d => 
      (d.venda_posvenda || '').toUpperCase().includes('VENDA') && 
      !(d.venda_posvenda || '').toUpperCase().includes('POS')
    );
    const posVendas = dadosAnoAnterior.filter(d => 
      (d.venda_posvenda || '').toUpperCase().includes('POS')
    );

    const vvrTotal = dadosAnoAnterior.reduce((sum, d) => sum + (d.vl_plano || 0), 0);
    const vvrVendas = vendas.reduce((sum, d) => sum + (d.vl_plano || 0), 0);
    const vvrPosVendas = posVendas.reduce((sum, d) => sum + (d.vl_plano || 0), 0);

    // Buscar metas do ano anterior
    let metaVVRTotal = 0;
    let metaVVRVendas = 0;
    let metaVVRPosVendas = 0;

    if (metasData) {
      const mes = startDateAnoAnterior.getMonth() + 1;
      const ano = startDateAnoAnterior.getFullYear();
      const unidadesAtivas = filtros.unidades.length > 0 ? filtros.unidades : opcoesFiltros.unidades;

      unidadesAtivas.forEach((unidade: string) => {
        const key = `${unidade}-${ano}-${String(mes).padStart(2, '0')}`;
        const meta = metasData.get(key);
        if (meta) {
          metaVVRVendas += meta.meta_vvr_vendas || 0;
          metaVVRPosVendas += meta.meta_vvr_posvendas || 0;
          metaVVRTotal += meta.meta_vvr_total || 0;
        }
      });
    }

    return {
      vvrTotal,
      vvrVendas,
      vvrPosVendas,
      metaVVRTotal: metaVVRTotal * multiplicador,
      metaVVRVendas: metaVVRVendas * multiplicador,
      metaVVRPosVendas: metaVVRPosVendas * multiplicador,
    };
  }, [salesData, periodo, filtros.unidades, filtros.isMetaInterna, metasData, opcoesFiltros.unidades]);

  // Indicadores Operacionais (Leads, Reuniões, Contratos, Adesão)
  const indicadoresOperacionais = useMemo(() => {
    const multiplicador = filtros.isMetaInterna ? META_CONFIG.META_INTERNA_MULTIPLICADOR : 1;
    
    // Leads: dados do funil
    const leads = funilData?.length || 0;
    const metaLeads = 100 * multiplicador;

    // Reuniões: placeholder
    const reunioes = 0;
    const metaReunioes = 50 * multiplicador;

    // Contratos (MV): contratos de múltiplas vendas
    const contratos = dadosFiltrados.filter(d => 
      (d.tp_servico || '').toUpperCase().includes('MV')
    ).length;
    const metaContratos = 30 * multiplicador;

    // Adesão Total: total de vendas
    const adesao = dadosFiltrados.length;
    const metaAdesao = kpis.metaQAV;

    return {
      leads: { valor: leads, meta: metaLeads },
      reunioes: { valor: reunioes, meta: metaReunioes },
      contratos: { valor: contratos, meta: metaContratos },
      adesao: { valor: adesao, meta: metaAdesao },
    };
  }, [dadosFiltrados, funilData, filtros.isMetaInterna, kpis.metaQAV]);

  // Dados para gráfico VVR vs Meta por Mês
  const dadosGraficoVVRMes = useMemo(() => {
    if (!salesData || salesData.length === 0) return [];

    const multiplicador = filtros.isMetaInterna ? META_CONFIG.META_INTERNA_MULTIPLICADOR : 1;
    
    // Criar mapa para todos os 12 meses do ano vigente
    const chartDataMap = new Map<string, {
      realizado_vendas: number;
      realizado_posvendas: number;
      meta_vendas: number;
      meta_posvendas: number;
      meta_total: number;
    }>();

    // Inicializar todos os meses
    for (let i = 1; i <= 12; i++) {
      const periodo = `${anoVigente}-${String(i).padStart(2, '0')}`;
      chartDataMap.set(periodo, {
        realizado_vendas: 0,
        realizado_posvendas: 0,
        meta_vendas: 0,
        meta_posvendas: 0,
        meta_total: 0,
      });
    }

    // Filtrar dados do ano vigente
    const dadosAnoVigente = salesData.filter(d => {
      const dt = d.dt_cadastro_integrante;
      if (!(dt instanceof Date)) return false;
      return dt.getFullYear() === anoVigente;
    });

    // Preencher dados de realizado
    const normalizeText = (text: string | undefined | null) => 
      (text || '').trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const unidadesAtivas = filtros.unidades.length > 0 ? filtros.unidades : opcoesFiltros.unidades;
    
    dadosAnoVigente.forEach(d => {
      // Filtrar por unidades se necessário
      if (unidadesAtivas.length > 0 && !unidadesAtivas.includes(d.nm_unidade)) return;

      const dt = d.dt_cadastro_integrante;
      if (!(dt instanceof Date)) return;
      
      const month = String(dt.getMonth() + 1).padStart(2, '0');
      const periodoKey = `${anoVigente}-${month}`;
      
      if (chartDataMap.has(periodoKey)) {
        const entry = chartDataMap.get(periodoKey)!;
        const venda = normalizeText(d.venda_posvenda);
        
        if (venda === 'VENDA') {
          entry.realizado_vendas += d.vl_plano || 0;
        } else if (venda === 'POS VENDA') {
          entry.realizado_posvendas += d.vl_plano || 0;
        }
      }
    });

    // Preencher metas
    if (metasData) {
      metasData.forEach((metaInfo, key) => {
        const [unidade, ano, mes] = key.split('-');
        const periodoKey = `${ano}-${mes}`;
        
        if (String(ano) === String(anoVigente) && chartDataMap.has(periodoKey)) {
          if (unidadesAtivas.length === 0 || unidadesAtivas.includes(unidade)) {
            const entry = chartDataMap.get(periodoKey)!;
            entry.meta_vendas += metaInfo.meta_vvr_vendas || 0;
            entry.meta_posvendas += metaInfo.meta_vvr_posvendas || 0;
            entry.meta_total += metaInfo.meta_vvr_total || 0;
          }
        }
      });
    }

    // Converter para array de dados
    const result: { mes: string; realizado: number; meta: number }[] = [];
    
    for (let i = 1; i <= 12; i++) {
      const periodoKey = `${anoVigente}-${String(i).padStart(2, '0')}`;
      const data = chartDataMap.get(periodoKey)!;
      
      let realizado: number;
      let meta: number;
      
      if (tipoGraficoVVR === 'vendas') {
        realizado = data.realizado_vendas;
        meta = data.meta_vendas * multiplicador;
      } else if (tipoGraficoVVR === 'posvendas') {
        realizado = data.realizado_posvendas;
        meta = data.meta_posvendas * multiplicador;
      } else {
        realizado = data.realizado_vendas + data.realizado_posvendas;
        meta = data.meta_total * multiplicador;
      }
      
      result.push({
        mes: MESES_NOMES[i - 1],
        realizado,
        meta,
      });
    }
    
    return result;
  }, [salesData, metasData, anoVigente, tipoGraficoVVR, filtros.isMetaInterna, filtros.unidades, opcoesFiltros.unidades]);

  // Dados para gráfico VVR Acumulado Anual
  const dadosGraficoAcumulado = useMemo(() => {
    if (!salesData || salesData.length === 0) return [];

    const unidadesAtivas = filtros.unidades.length > 0 ? filtros.unidades : opcoesFiltros.unidades;
    
    // Filtrar por unidades
    const dadosFiltradosUnidades = unidadesAtivas.length > 0
      ? salesData.filter(d => unidadesAtivas.includes(d.nm_unidade))
      : salesData;

    // Agrupar por ano e mês
    const salesByYearMonth: Record<number, number[]> = {};
    const uniqueYears = [...new Set(dadosFiltradosUnidades.map(d => {
      const dt = d.dt_cadastro_integrante;
      return dt instanceof Date ? dt.getFullYear() : null;
    }).filter(Boolean))] as number[];

    // Inicializar anos
    uniqueYears.forEach(year => {
      salesByYearMonth[year] = Array(12).fill(0);
    });

    // Preencher dados
    dadosFiltradosUnidades.forEach(d => {
      const dt = d.dt_cadastro_integrante;
      if (!(dt instanceof Date)) return;
      
      const year = dt.getFullYear();
      const month = dt.getMonth();
      
      if (salesByYearMonth[year]) {
        salesByYearMonth[year][month] += d.vl_plano || 0;
      }
    });

    // Calcular valores acumulados
    const result: { ano: number; valores: number[] }[] = [];
    
    uniqueYears.sort((a, b) => a - b).forEach(year => {
      const valores = salesByYearMonth[year];
      const acumulado: number[] = [];
      let soma = 0;
      
      for (let i = 0; i < 12; i++) {
        soma += valores[i];
        acumulado.push(soma);
      }
      
      result.push({ ano: year, valores: acumulado });
    });

    return result;
  }, [salesData, filtros.unidades, opcoesFiltros.unidades]);

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

  // ========== DADOS PARA INDICADORES SECUNDÁRIOS ==========
  
  // Estado para ano selecionado nos gráficos
  const [anoSelecionadoVVR, setAnoSelecionadoVVR] = useState<number | null>(null);
  const [anoSelecionadoTicket, setAnoSelecionadoTicket] = useState<number | null>(null);

  // Dados para gráfico VVR Total Anual (barras empilhadas horizontais)
  const dadosVVRAnual = useMemo(() => {
    if (!salesData || salesData.length === 0) return [];

    const unidadesAtivas = filtros.unidades.length > 0 ? filtros.unidades : opcoesFiltros.unidades;
    
    // Filtrar por unidades
    const dadosFiltradosUnidades = unidadesAtivas.length > 0
      ? salesData.filter(d => unidadesAtivas.includes(d.nm_unidade))
      : salesData;

    // Agrupar por ano
    const salesByYear: Record<string, { vendas: number; posVendas: number }> = {};
    
    const normalizeText = (text: string | undefined | null) => 
      (text || '').trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    dadosFiltradosUnidades.forEach(d => {
      const dt = d.dt_cadastro_integrante;
      if (!(dt instanceof Date)) return;
      
      const year = String(dt.getFullYear());
      if (!salesByYear[year]) {
        salesByYear[year] = { vendas: 0, posVendas: 0 };
      }
      
      const tipo = normalizeText(d.venda_posvenda);
      if (tipo === 'VENDA') {
        salesByYear[year].vendas += d.vl_plano || 0;
      } else if (tipo === 'POS VENDA') {
        salesByYear[year].posVendas += d.vl_plano || 0;
      }
    });

    const years = Object.keys(salesByYear).sort((a, b) => Number(a) - Number(b));
    
    return years.map(year => ({
      label: year,
      vendas: salesByYear[year].vendas,
      posVendas: salesByYear[year].posVendas,
    }));
  }, [salesData, filtros.unidades, opcoesFiltros.unidades]);

  // Dados para gráfico VVR Total Mensal (barras empilhadas verticais)
  const dadosVVRMensal = useMemo(() => {
    if (!salesData || salesData.length === 0) return [];

    const unidadesAtivas = filtros.unidades.length > 0 ? filtros.unidades : opcoesFiltros.unidades;
    const anoParaExibir = anoSelecionadoVVR || anoVigente;
    
    // Filtrar por unidades e ano
    const dadosFiltradosUnidades = salesData.filter(d => {
      const dt = d.dt_cadastro_integrante;
      if (!(dt instanceof Date)) return false;
      if (dt.getFullYear() !== anoParaExibir) return false;
      if (unidadesAtivas.length > 0 && !unidadesAtivas.includes(d.nm_unidade)) return false;
      return true;
    });

    // Inicializar 12 meses
    const salesByMonth: { vendas: number; posVendas: number }[] = Array(12).fill(null).map(() => ({ vendas: 0, posVendas: 0 }));
    
    const normalizeText = (text: string | undefined | null) => 
      (text || '').trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    dadosFiltradosUnidades.forEach(d => {
      const dt = d.dt_cadastro_integrante;
      if (!(dt instanceof Date)) return;
      
      const month = dt.getMonth();
      const tipo = normalizeText(d.venda_posvenda);
      
      if (tipo === 'VENDA') {
        salesByMonth[month].vendas += d.vl_plano || 0;
      } else if (tipo === 'POS VENDA') {
        salesByMonth[month].posVendas += d.vl_plano || 0;
      }
    });

    return MESES_NOMES.map((mes, index) => ({
      label: mes,
      vendas: salesByMonth[index].vendas,
      posVendas: salesByMonth[index].posVendas,
    }));
  }, [salesData, filtros.unidades, opcoesFiltros.unidades, anoSelecionadoVVR, anoVigente]);

  // Dados para gráfico Ticket Médio Anual (barras horizontais)
  const dadosTicketAnual = useMemo(() => {
    if (!salesData || salesData.length === 0) return [];

    const unidadesAtivas = filtros.unidades.length > 0 ? filtros.unidades : opcoesFiltros.unidades;
    
    // Filtrar por unidades
    const dadosFiltradosUnidades = unidadesAtivas.length > 0
      ? salesData.filter(d => unidadesAtivas.includes(d.nm_unidade))
      : salesData;

    // Agrupar por ano
    const ticketByYear: Record<string, { totalValor: number; totalAdesoes: number }> = {};

    dadosFiltradosUnidades.forEach(d => {
      const dt = d.dt_cadastro_integrante;
      if (!(dt instanceof Date)) return;
      
      const year = String(dt.getFullYear());
      if (!ticketByYear[year]) {
        ticketByYear[year] = { totalValor: 0, totalAdesoes: 0 };
      }
      
      ticketByYear[year].totalValor += d.vl_plano || 0;
      ticketByYear[year].totalAdesoes += 1;
    });

    const years = Object.keys(ticketByYear).sort((a, b) => Number(a) - Number(b));
    
    return years.map(year => ({
      label: year,
      ticketMedio: ticketByYear[year].totalAdesoes > 0 
        ? ticketByYear[year].totalValor / ticketByYear[year].totalAdesoes 
        : 0,
    }));
  }, [salesData, filtros.unidades, opcoesFiltros.unidades]);

  // Dados para gráfico Ticket Médio Mensal (barras verticais)
  const dadosTicketMensal = useMemo(() => {
    if (!salesData || salesData.length === 0) return [];

    const unidadesAtivas = filtros.unidades.length > 0 ? filtros.unidades : opcoesFiltros.unidades;
    const anoParaExibir = anoSelecionadoTicket || anoVigente;
    
    // Filtrar por unidades e ano
    const dadosFiltradosUnidades = salesData.filter(d => {
      const dt = d.dt_cadastro_integrante;
      if (!(dt instanceof Date)) return false;
      if (dt.getFullYear() !== anoParaExibir) return false;
      if (unidadesAtivas.length > 0 && !unidadesAtivas.includes(d.nm_unidade)) return false;
      return true;
    });

    // Inicializar 12 meses
    const ticketByMonth: { totalValor: number; totalAdesoes: number }[] = Array(12).fill(null).map(() => ({ totalValor: 0, totalAdesoes: 0 }));

    dadosFiltradosUnidades.forEach(d => {
      const dt = d.dt_cadastro_integrante;
      if (!(dt instanceof Date)) return;
      
      const month = dt.getMonth();
      ticketByMonth[month].totalValor += d.vl_plano || 0;
      ticketByMonth[month].totalAdesoes += 1;
    });

    return MESES_NOMES.map((mes, index) => ({
      label: mes,
      ticketMedio: ticketByMonth[index].totalAdesoes > 0 
        ? ticketByMonth[index].totalValor / ticketByMonth[index].totalAdesoes 
        : 0,
    }));
  }, [salesData, filtros.unidades, opcoesFiltros.unidades, anoSelecionadoTicket, anoVigente]);

  // Estado para anos ativos nos gráficos de comparativo
  const [anosAtivosVVR, setAnosAtivosVVR] = useState<number[]>([]);
  const [anosAtivosAdesoes, setAnosAtivosAdesoes] = useState<number[]>([]);

  // Toggle de anos para gráficos de comparativo
  const toggleAnoVVR = useCallback((ano: number) => {
    setAnosAtivosVVR(prev => 
      prev.includes(ano) ? prev.filter(a => a !== ano) : [...prev, ano]
    );
  }, []);

  const toggleAnoAdesoes = useCallback((ano: number) => {
    setAnosAtivosAdesoes(prev => 
      prev.includes(ano) ? prev.filter(a => a !== ano) : [...prev, ano]
    );
  }, []);

  // Dados para gráfico Comparativo de VVR Mensal (linhas por ano)
  const dadosComparativoVVR = useMemo(() => {
    if (!salesData || salesData.length === 0) return [];

    const unidadesAtivas = filtros.unidades.length > 0 ? filtros.unidades : opcoesFiltros.unidades;
    
    const dadosFiltradosUnidades = unidadesAtivas.length > 0
      ? salesData.filter(d => unidadesAtivas.includes(d.nm_unidade))
      : salesData;

    // Agrupar por ano e mês
    const salesByYearMonth: Record<number, number[]> = {};

    dadosFiltradosUnidades.forEach(d => {
      const dt = d.dt_cadastro_integrante;
      if (!(dt instanceof Date)) return;
      
      const year = dt.getFullYear();
      const month = dt.getMonth();
      
      if (!salesByYearMonth[year]) {
        salesByYearMonth[year] = Array(12).fill(0);
      }
      salesByYearMonth[year][month] += d.vl_plano || 0;
    });

    const years = Object.keys(salesByYearMonth).map(Number).sort();
    
    // Inicializar anos ativos se vazio (últimos 2 anos)
    if (anosAtivosVVR.length === 0 && years.length > 0) {
      const ultimosAnos = years.slice(-2);
      setAnosAtivosVVR(ultimosAnos);
    }

    return years.map(year => ({
      year,
      monthlyData: salesByYearMonth[year],
    }));
  }, [salesData, filtros.unidades, opcoesFiltros.unidades, anosAtivosVVR.length]);

  // Anos ativos calculados
  const anosAtivosVVRComputed = useMemo(() => {
    if (anosAtivosVVR.length > 0) return anosAtivosVVR;
    const years = dadosComparativoVVR.map(d => d.year);
    return years.slice(-2);
  }, [anosAtivosVVR, dadosComparativoVVR]);

  // Dados para gráfico Contratos Realizados Anual (barras horizontais)
  const dadosContratosAnual = useMemo(() => {
    if (!fundosData || fundosData.length === 0) return { labels: [], values: [] };

    const unidadesAtivas = filtros.unidades.length > 0 ? filtros.unidades : opcoesFiltros.unidades;
    
    const dadosFiltrados = unidadesAtivas.length > 0
      ? fundosData.filter(d => unidadesAtivas.includes(d.nm_unidade))
      : fundosData;

    // Agrupar contratos por ano
    const contractsByYear: Record<string, number> = {};

    dadosFiltrados.forEach(d => {
      const dt = d.dt_contrato;
      if (!(dt instanceof Date)) return;
      
      const year = String(dt.getFullYear());
      if (!contractsByYear[year]) {
        contractsByYear[year] = 0;
      }
      contractsByYear[year] += 1;
    });

    const years = Object.keys(contractsByYear).sort().filter(y => parseInt(y) >= 2019);
    
    return {
      labels: years,
      values: years.map(y => contractsByYear[y] || 0),
    };
  }, [fundosData, filtros.unidades, opcoesFiltros.unidades]);

  // Estado para ano selecionado nos contratos
  const [anoSelecionadoContratos, setAnoSelecionadoContratos] = useState<number | null>(null);

  // Dados para gráfico Contratos Realizados Mensal (barras verticais)
  const dadosContratosMensal = useMemo(() => {
    if (!fundosData || fundosData.length === 0) return { labels: [], values: [] };

    const unidadesAtivas = filtros.unidades.length > 0 ? filtros.unidades : opcoesFiltros.unidades;
    const anoParaExibir = anoSelecionadoContratos || anoVigente;
    
    const dadosFiltrados = fundosData.filter(d => {
      const dt = d.dt_contrato;
      if (!(dt instanceof Date)) return false;
      if (dt.getFullYear() !== anoParaExibir) return false;
      if (unidadesAtivas.length > 0 && !unidadesAtivas.includes(d.nm_unidade)) return false;
      return true;
    });

    // Contar contratos por mês
    const contractsByMonth = Array(12).fill(0);

    dadosFiltrados.forEach(d => {
      const dt = d.dt_contrato;
      if (!(dt instanceof Date)) return;
      const month = dt.getMonth();
      contractsByMonth[month] += 1;
    });

    return {
      labels: MESES_NOMES,
      values: contractsByMonth,
    };
  }, [fundosData, filtros.unidades, opcoesFiltros.unidades, anoSelecionadoContratos, anoVigente]);

  // Dados para gráfico Comparativo Mensal de Adesões (barras agrupadas)
  const dadosComparativoAdesoes = useMemo(() => {
    if (!salesData || salesData.length === 0) return [];

    const unidadesAtivas = filtros.unidades.length > 0 ? filtros.unidades : opcoesFiltros.unidades;
    
    const dadosFiltradosUnidades = unidadesAtivas.length > 0
      ? salesData.filter(d => unidadesAtivas.includes(d.nm_unidade))
      : salesData;

    // Agrupar adesões por ano e mês
    const adesoesByYearMonth: Record<number, number[]> = {};

    dadosFiltradosUnidades.forEach(d => {
      const dt = d.dt_cadastro_integrante;
      if (!(dt instanceof Date)) return;
      
      const year = dt.getFullYear();
      const month = dt.getMonth();
      
      if (!adesoesByYearMonth[year]) {
        adesoesByYearMonth[year] = Array(12).fill(0);
      }
      adesoesByYearMonth[year][month] += 1;
    });

    const years = Object.keys(adesoesByYearMonth).map(Number).sort();
    
    // Inicializar anos ativos se vazio (últimos 2 anos)
    if (anosAtivosAdesoes.length === 0 && years.length > 0) {
      const ultimosAnos = years.slice(-2);
      setAnosAtivosAdesoes(ultimosAnos);
    }

    return years.map(year => ({
      year,
      monthlyData: adesoesByYearMonth[year],
    }));
  }, [salesData, filtros.unidades, opcoesFiltros.unidades, anosAtivosAdesoes.length]);

  // Anos ativos calculados para adesões
  const anosAtivosAdesoesComputed = useMemo(() => {
    if (anosAtivosAdesoes.length > 0) return anosAtivosAdesoes;
    const years = dadosComparativoAdesoes.map(d => d.year);
    return years.slice(-2);
  }, [anosAtivosAdesoes, dadosComparativoAdesoes]);

  // Dados para gráfico Adesões por Tipo Anual (barras empilhadas horizontais)
  const dadosAdesoesTipoAnual = useMemo(() => {
    if (!salesData || salesData.length === 0) return [];

    const unidadesAtivas = filtros.unidades.length > 0 ? filtros.unidades : opcoesFiltros.unidades;
    
    const dadosFiltradosUnidades = unidadesAtivas.length > 0
      ? salesData.filter(d => unidadesAtivas.includes(d.nm_unidade))
      : salesData;

    // Agrupar por ano e tipo (contagem)
    const adesoesByYear: Record<string, { vendas: number; posVendas: number }> = {};
    
    const normalizeText = (text: string | undefined | null) => 
      (text || '').trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    dadosFiltradosUnidades.forEach(d => {
      const dt = d.dt_cadastro_integrante;
      if (!(dt instanceof Date)) return;
      
      const year = String(dt.getFullYear());
      const tipo = normalizeText(d.venda_posvenda);
      
      if (!adesoesByYear[year]) {
        adesoesByYear[year] = { vendas: 0, posVendas: 0 };
      }
      
      if (tipo === 'VENDA') {
        adesoesByYear[year].vendas += 1;
      } else if (tipo === 'POS VENDA') {
        adesoesByYear[year].posVendas += 1;
      }
    });

    const years = Object.keys(adesoesByYear).sort((a, b) => Number(a) - Number(b));
    
    return years.map(year => ({
      label: year,
      vendas: adesoesByYear[year].vendas,
      posVendas: adesoesByYear[year].posVendas,
    }));
  }, [salesData, filtros.unidades, opcoesFiltros.unidades]);

  // Estado para ano selecionado nas adesões por tipo
  const [anoSelecionadoAdesoesTipo, setAnoSelecionadoAdesoesTipo] = useState<number | null>(null);

  // Dados para gráfico Adesões por Tipo Mensal (barras empilhadas verticais)
  const dadosAdesoesTipoMensal = useMemo(() => {
    if (!salesData || salesData.length === 0) return [];

    const unidadesAtivas = filtros.unidades.length > 0 ? filtros.unidades : opcoesFiltros.unidades;
    const anoParaExibir = anoSelecionadoAdesoesTipo || anoVigente;
    
    const dadosFiltrados = salesData.filter(d => {
      const dt = d.dt_cadastro_integrante;
      if (!(dt instanceof Date)) return false;
      if (dt.getFullYear() !== anoParaExibir) return false;
      if (unidadesAtivas.length > 0 && !unidadesAtivas.includes(d.nm_unidade)) return false;
      return true;
    });

    // Inicializar 12 meses
    const adesoesByMonth: { vendas: number; posVendas: number }[] = Array(12).fill(null).map(() => ({ vendas: 0, posVendas: 0 }));
    
    const normalizeText = (text: string | undefined | null) => 
      (text || '').trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    dadosFiltrados.forEach(d => {
      const dt = d.dt_cadastro_integrante;
      if (!(dt instanceof Date)) return;
      
      const month = dt.getMonth();
      const tipo = normalizeText(d.venda_posvenda);
      
      if (tipo === 'VENDA') {
        adesoesByMonth[month].vendas += 1;
      } else if (tipo === 'POS VENDA') {
        adesoesByMonth[month].posVendas += 1;
      }
    });

    return MESES_NOMES.map((mes, index) => ({
      label: mes,
      vendas: adesoesByMonth[index].vendas,
      posVendas: adesoesByMonth[index].posVendas,
    }));
  }, [salesData, filtros.unidades, opcoesFiltros.unidades, anoSelecionadoAdesoesTipo, anoVigente]);

  // Dados para tabela de Desempenho por Consultor Comercial
  const dadosConsultorComercial = useMemo(() => {
    if (!salesData || salesData.length === 0) return [];

    const unidadesAtivas = filtros.unidades.length > 0 ? filtros.unidades : opcoesFiltros.unidades;
    
    const dadosFiltradosUnidades = unidadesAtivas.length > 0
      ? salesData.filter(d => unidadesAtivas.includes(d.nm_unidade))
      : salesData;

    // Agrupar por consultor
    const consultorMap: Record<string, { unidade: string; vvrTotal: number; totalAdesoes: number }> = {};

    dadosFiltradosUnidades.forEach(d => {
      const consultor = d.consultor_comercial || 'N/A';
      const unidade = d.nm_unidade || 'N/A';
      
      if (!consultorMap[consultor]) {
        consultorMap[consultor] = { unidade, vvrTotal: 0, totalAdesoes: 0 };
      }
      
      consultorMap[consultor].vvrTotal += d.vl_plano || 0;
      consultorMap[consultor].totalAdesoes += 1;
    });

    return Object.entries(consultorMap).map(([consultor, dados]) => ({
      unidade: dados.unidade,
      consultorComercial: consultor,
      vvrTotal: dados.vvrTotal,
      totalAdesoes: dados.totalAdesoes,
    })).sort((a, b) => b.vvrTotal - a.vvrTotal);
  }, [salesData, filtros.unidades, opcoesFiltros.unidades]);

  // Dados para tabela de Adesões Detalhadas
  const dadosAdesoesDetalhadas = useMemo(() => {
    if (!salesData || salesData.length === 0) return [];

    const unidadesAtivas = filtros.unidades.length > 0 ? filtros.unidades : opcoesFiltros.unidades;
    
    const dadosFiltradosUnidades = unidadesAtivas.length > 0
      ? salesData.filter(d => unidadesAtivas.includes(d.nm_unidade))
      : salesData;

    return dadosFiltradosUnidades.map(d => ({
      unidade: d.nm_unidade || 'N/A',
      codIntegrante: d.codigo_integrante || '',
      integrante: d.nm_integrante || 'N/A',
      dataCadastro: d.dt_cadastro_integrante instanceof Date 
        ? d.dt_cadastro_integrante.toLocaleDateString('pt-BR') 
        : '',
      codFundo: d.id_fundo || '',
      tipo: d.venda_posvenda || '',
      consultor: d.consultor_comercial || 'N/A',
      vvr: d.vl_plano || 0,
    }));
  }, [salesData, filtros.unidades, opcoesFiltros.unidades]);

  // Dados para tabela de Fundos Detalhados
  const dadosFundosDetalhados = useMemo(() => {
    if (!fundosData || fundosData.length === 0) return [];

    const unidadesAtivas = filtros.unidades.length > 0 ? filtros.unidades : opcoesFiltros.unidades;
    
    const dadosFiltrados = unidadesAtivas.length > 0
      ? fundosData.filter(d => unidadesAtivas.includes(d.nm_unidade))
      : fundosData;

    return dadosFiltrados.map(d => ({
      unidade: d.nm_unidade || 'N/A',
      idFundo: d.id_fundo || '',
      fundo: d.nm_fundo || 'N/A',
      dtContrato: d.dt_contrato instanceof Date 
        ? d.dt_contrato.toLocaleDateString('pt-BR') 
        : '',
      dtCadastro: d.dt_cadastro instanceof Date 
        ? d.dt_cadastro.toLocaleDateString('pt-BR') 
        : '',
      tipoServico: d.tipo_servico || '',
      instituicao: d.instituicao || 'N/A',
      dtBaile: d.dt_baile instanceof Date 
        ? d.dt_baile.toLocaleDateString('pt-BR') 
        : '',
    }));
  }, [fundosData, filtros.unidades, opcoesFiltros.unidades]);

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

  // Página de Metas e Resultados (Primeira página original)
  const renderMetasPage = () => {
    const indicadorMeta = filtros.isMetaInterna ? '(Meta Interna)' : '(Super Meta)';
    
    return (
      <div className="space-y-6">
        {/* Toggle de Meta */}
        <div className="bg-dark-secondary rounded-xl p-4">
          <h2 className="text-text-primary text-sm font-bold uppercase tracking-wide mb-3">
            CONFIGURAÇÃO DE METAS
          </h2>
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm ${!filtros.isMetaInterna ? 'text-primary-500 font-bold' : 'text-text-muted'}`}>
              🚀 Super Meta
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filtros.isMetaInterna}
                onChange={(e) => handleFiltrosChange({ isMetaInterna: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-dark-tertiary peer-focus:ring-2 peer-focus:ring-primary-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
            <span className={`text-sm ${filtros.isMetaInterna ? 'text-primary-500 font-bold' : 'text-text-muted'}`}>
              🎯 Meta Interna
            </span>
          </div>
          <p className="text-center text-xs text-text-muted mt-2">
            {filtros.isMetaInterna 
              ? 'Meta Interna (85%) - Metas ajustadas para controle interno'
              : 'Super Meta (100%) - Metas originais das bases de dados'
            }
          </p>
        </div>

        {/* Seção 1: VVR NO PERÍODO SELECIONADO */}
        <div className="bg-dark-secondary rounded-xl p-1">
          <div className="px-5 pt-4 pb-2">
            <h2 className="text-text-primary text-sm font-bold uppercase tracking-wide">
              VVR NO PERÍODO SELECIONADO{' '}
              <span className="text-primary-500">{indicadorMeta}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            <KPICard
              titulo="REALIZADO TOTAL"
              valorRealizado={kpis.vvrTotal}
              valorMeta={kpis.metaVVRTotal}
              formatarComoMoeda={true}
              labelMeta="META TOTAL"
            />
            <KPICard
              titulo="REALIZADO VENDAS"
              valorRealizado={kpis.vvrVendas}
              valorMeta={kpis.metaVVRVendas}
              formatarComoMoeda={true}
              labelMeta="META VENDAS"
            />
            <KPICard
              titulo="REALIZADO PÓS VENDAS"
              valorRealizado={kpis.vvrPosVendas}
              valorMeta={kpis.metaVVRPosVendas}
              formatarComoMoeda={true}
              labelMeta="META PÓS VENDAS"
            />
          </div>
        </div>

        {/* Seção 2: VVR NO MESMO PERÍODO DO ANO ANTERIOR */}
        <div className="bg-dark-secondary rounded-xl p-1">
          <div className="px-5 pt-4 pb-2">
            <h2 className="text-text-primary text-sm font-bold uppercase tracking-wide">
              VVR NO MESMO PERÍODO SELECIONADO NO ANO ANTERIOR{' '}
              <span className="text-primary-500">{indicadorMeta}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            <KPICard
              titulo="REALIZADO TOTAL"
              valorRealizado={kpisAnoAnterior.vvrTotal}
              valorMeta={kpisAnoAnterior.metaVVRTotal}
              formatarComoMoeda={true}
              labelMeta="META TOTAL"
            />
            <KPICard
              titulo="REALIZADO VENDAS"
              valorRealizado={kpisAnoAnterior.vvrVendas}
              valorMeta={kpisAnoAnterior.metaVVRVendas}
              formatarComoMoeda={true}
              labelMeta="META VENDAS"
            />
            <KPICard
              titulo="REALIZADO PÓS VENDAS"
              valorRealizado={kpisAnoAnterior.vvrPosVendas}
              valorMeta={kpisAnoAnterior.metaVVRPosVendas}
              formatarComoMoeda={true}
              labelMeta="META PÓS VENDAS"
            />
          </div>
        </div>

        {/* Seção 3: Indicadores Operacionais */}
        <IndicadoresOperacionais
          leads={indicadoresOperacionais.leads}
          reunioes={indicadoresOperacionais.reunioes}
          contratos={indicadoresOperacionais.contratos}
          adesao={indicadoresOperacionais.adesao}
        />

        {/* Seção 4: Gráfico VVR Realizado vs Meta por Mês */}
        <VVRVsMetaChart
          data={dadosGraficoVVRMes}
          titulo="VVR REALIZADO VS. META POR MÊS"
          tipoSelecionado={tipoGraficoVVR}
          onTipoChange={setTipoGraficoVVR}
          anoVigente={anoVigente}
          indicadorMeta={indicadorMeta}
        />

        {/* Seção 5: Gráfico VVR Acumulado Anual */}
        <CumulativeYearChart
          data={dadosGraficoAcumulado}
          titulo="VVR Acumulado Anual (Comparativo)"
        />

        {/* Seção 6: Tabela de Dados Detalhados */}
        <Card>
          <RankingTable 
            data={rankingUnidades}
            title={`DADOS DETALHADOS POR MÊS/UNIDADE (PERÍODO SELECIONADO) ${indicadorMeta}`}
            tipo="unidade"
          />
        </Card>
      </div>
    );
  };

  // Página de Indicadores Secundários
  const renderIndicadoresPage = () => {
    const formatCurrency = (value: number) => {
      if (Math.abs(value) >= 1000000) {
        return (value / 1000000).toFixed(1).replace('.0', '') + ' mi';
      }
      if (Math.abs(value) >= 1000) {
        return (value / 1000).toFixed(1).replace('.0', '') + 'k';
      }
      return value.toLocaleString('pt-BR');
    };

    const formatCurrencyFull = (value: number) => {
      return 'R$ ' + value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
      <div className="space-y-6">
        {/* Comparativo de VVR Mensal */}
        <Card titulo="COMPARATIVO DE VVR MENSAL">
          <div style={{ height: '400px' }}>
            <MultiYearLineChart
              data={dadosComparativoVVR}
              activeYears={anosAtivosVVRComputed}
              onYearToggle={toggleAnoVVR}
              formatValue={formatCurrency}
            />
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico VVR Anual - Barras Horizontais Empilhadas */}
          <Card titulo="VENDA REALIZADA TOTAL ANUAL">
            <div className="h-80">
              <StackedBarChart
                data={dadosVVRAnual}
                horizontal={true}
                onBarClick={(label) => {
                  const ano = parseInt(label);
                  if (!isNaN(ano)) setAnoSelecionadoVVR(ano);
                }}
              />
            </div>
          </Card>

          {/* Gráfico VVR Mensal - Barras Verticais Empilhadas */}
          <Card titulo={`VENDA REALIZADA TOTAL MENSAL (${anoSelecionadoVVR || anoVigente})`}>
            <div className="h-80">
              <StackedBarChart
                data={dadosVVRMensal}
                horizontal={false}
              />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico Ticket Médio Anual */}
          <Card titulo="TICKET MÉDIO ANUAL">
            <div className="h-80">
              <TicketMedioChart
                data={dadosTicketAnual}
                onBarClick={(label) => {
                  const ano = parseInt(label);
                  if (!isNaN(ano)) setAnoSelecionadoTicket(ano);
                }}
              />
            </div>
          </Card>

          {/* Gráfico Ticket Médio Mensal */}
          <Card titulo={`TICKET MÉDIO MENSAL (${anoSelecionadoTicket || anoVigente})`}>
            <div className="h-80">
              <TicketMedioChart
                data={dadosTicketMensal}
                horizontal={false}
              />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contratos Realizados Anual */}
          <Card titulo="CONTRATOS REALIZADOS TOTAL ANUAL">
            <div className="h-80">
              <SimpleBarChart
                data={dadosContratosAnual}
                horizontal={true}
                onBarClick={(label) => {
                  const ano = parseInt(label);
                  if (!isNaN(ano)) setAnoSelecionadoContratos(ano);
                }}
              />
            </div>
          </Card>

          {/* Contratos Realizados Mensal */}
          <Card titulo={`CONTRATOS REALIZADOS TOTAL MENSAL (${anoSelecionadoContratos || anoVigente})`}>
            <div className="h-80">
              <SimpleBarChart
                data={dadosContratosMensal}
                horizontal={false}
              />
            </div>
          </Card>
        </div>

        {/* Comparativo Mensal de Adesões */}
        <Card titulo="COMPARATIVO MENSAL DE ADESÕES">
          <div style={{ height: '400px' }}>
            <MultiYearBarChart
              data={dadosComparativoAdesoes}
              activeYears={anosAtivosAdesoesComputed}
              onYearToggle={toggleAnoAdesoes}
            />
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Adesões por Tipo Anual */}
          <Card titulo="ADESÕES POR TIPO ANUAL">
            <div className="h-80">
              <StackedBarChart
                data={dadosAdesoesTipoAnual}
                horizontal={true}
                onBarClick={(label) => {
                  const ano = parseInt(label);
                  if (!isNaN(ano)) setAnoSelecionadoAdesoesTipo(ano);
                }}
              />
            </div>
          </Card>

          {/* Adesões por Tipo Mensal */}
          <Card titulo={`ADESÕES POR TIPO MENSAL (${anoSelecionadoAdesoesTipo || anoVigente})`}>
            <div className="h-80">
              <StackedBarChart
                data={dadosAdesoesTipoMensal}
                horizontal={false}
              />
            </div>
          </Card>
        </div>

        {/* Tabela Desempenho por Consultor Comercial */}
        <Card titulo="DESEMPENHO POR CONSULTOR COMERCIAL">
          <GenericDataTable
            columns={[
              { key: 'unidade', title: 'Unidade', sortable: true },
              { key: 'consultorComercial', title: 'Consultor Comercial', sortable: true },
              { key: 'vvrTotal', title: 'VVR Total', align: 'right', sortable: true, format: formatCurrencyFull },
              { key: 'totalAdesoes', title: 'Total de Adesões', align: 'right', sortable: true },
            ]}
            data={dadosConsultorComercial}
            pageSize={10}
          />
        </Card>

        {/* Tabela Adesões Detalhadas */}
        <Card titulo="ADESÕES DETALHADAS NO PERÍODO">
          <GenericDataTable
            columns={[
              { key: 'unidade', title: 'Unidade', sortable: true },
              { key: 'codIntegrante', title: 'Cód. Integrante', sortable: true },
              { key: 'integrante', title: 'Integrante', sortable: true },
              { key: 'dataCadastro', title: 'Data Cadastro', sortable: true },
              { key: 'codFundo', title: 'Cód. Fundo', sortable: true },
              { key: 'tipo', title: 'Tipo', sortable: true },
              { key: 'consultor', title: 'Consultor', sortable: true },
              { key: 'vvr', title: 'VVR', align: 'right', sortable: true, format: formatCurrencyFull },
            ]}
            data={dadosAdesoesDetalhadas}
            pageSize={10}
          />
        </Card>

        {/* Tabela Fundos Detalhados */}
        <Card titulo="FUNDOS DETALHADOS NO PERÍODO">
          <GenericDataTable
            columns={[
              { key: 'unidade', title: 'Unidade', sortable: true },
              { key: 'idFundo', title: 'ID Fundo', sortable: true },
              { key: 'fundo', title: 'Fundo', sortable: true },
              { key: 'dtContrato', title: 'DT Contrato', sortable: true },
              { key: 'dtCadastro', title: 'DT Cadastro', sortable: true },
              { key: 'tipoServico', title: 'Tipo de Serviço', sortable: true },
              { key: 'instituicao', title: 'Instituição', sortable: true },
              { key: 'dtBaile', title: 'DT Baile', sortable: true },
            ]}
            data={dadosFundosDetalhados}
            pageSize={10}
          />
        </Card>
      </div>
    );
  };

  // Página de Funil de Vendas
  const renderFunilPage = () => (
    <div className="space-y-6">
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
            onPaginaChange={handlePaginaChange}
            isCollapsed={sidebarCollapsed}
            onCollapseChange={setSidebarCollapsed}
          >
            <FilterPanel
              filtros={filtros}
              opcoes={opcoesFiltros}
              onFiltrosChange={handleFiltrosChange}
              showMetaToggle={false}
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
            {/* Conteúdo */}
            {renderContent()}
          </main>
        </div>
      </div>
    </>
  );
}
