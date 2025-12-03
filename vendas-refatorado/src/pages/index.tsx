/**
 * Página Principal - Dashboard de Vendas
 * Replica exatamente a primeira página do dashboard original
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Header, Sidebar, Loading, KPICard, IndicadoresOperacionais, Card, FunilHorizontal } from '@/components';
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
  FunnelBarChart,
  CaptacaoStackedBar,
  CORES_FASES_FUNIL,
  CORES_FASES_PERDAS,
  getCorFase,
} from '@/components/charts';
import { DataTable, CaptacoesTable, DadosDetalhadosTable, IndicadoresOperacionaisTable } from '@/components/tables';
import { MotivosPerdaDescarteTable } from '@/components/MotivosPerdaDescarteTable';
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
  
  // Função para obter página da URL
  const getPaginaFromPath = (path: string): PaginaAtiva => {
    if (path.includes('/indicadores')) return 'indicadores';
    if (path.includes('/funil')) return 'funil';
    return 'metas';
  };
  
  // Estados - inicializa com base no router.asPath (funciona no SSR)
  const [paginaAtiva, setPaginaAtiva] = useState<PaginaAtiva>(() => getPaginaFromPath(router.asPath));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosState>(INITIAL_FILTERS);
  const [tipoGraficoVVR, setTipoGraficoVVR] = useState<'total' | 'vendas' | 'posvendas'>('total');
  const [tipoTabelaDados, setTipoTabelaDados] = useState<'total' | 'vendas' | 'posvendas'>('total');

  // Sincronizar página com URL na montagem (para garantir após hidratação)
  useEffect(() => {
    const paginaCorreta = getPaginaFromPath(router.asPath);
    if (paginaAtiva !== paginaCorreta) {
      setPaginaAtiva(paginaCorreta);
    }
    if (router.asPath === '/') {
      router.replace('/metas', undefined, { shallow: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Label do período para a tabela
  const periodoLabelTabela = useMemo(() => {
    if (!periodo) return '';
    const formatMes = (date: Date) => {
      const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
      return `${meses[date.getMonth()]}/${String(date.getFullYear()).slice(2)}`;
    };
    return `${formatMes(periodo.startDate)} - ${formatMes(periodo.endDate)}`;
  }, [periodo]);

  // Dados para ranking de unidades (por tipo: total, vendas, posvendas)
  const rankingUnidades = useMemo(() => {
    if (dadosFiltrados.length === 0) return [];

    const normalizeText = (text: string | undefined | null) => 
      (text || '').trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const porUnidade: Record<string, { valorRealizado: number; valorMeta: number }> = {};
    
    dadosFiltrados.forEach((item) => {
      const unidade = item.nm_unidade || 'Não informado';
      const tipoVenda = normalizeText(item.venda_posvenda);
      
      // Filtrar por tipo selecionado
      if (tipoTabelaDados === 'vendas' && tipoVenda !== 'VENDA') return;
      if (tipoTabelaDados === 'posvendas' && tipoVenda !== 'POS VENDA') return;
      
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
          // Usar meta específica por tipo
          let metaValor = 0;
          if (tipoTabelaDados === 'vendas') {
            metaValor = meta.meta_vvr_vendas || 0;
          } else if (tipoTabelaDados === 'posvendas') {
            metaValor = meta.meta_vvr_posvendas || 0;
          } else {
            metaValor = meta.meta_vvr_total || 0;
          }
          porUnidade[unidade].valorMeta = metaValor * multiplicador;
        }
      });
    }

    return Object.entries(porUnidade)
      .map(([nome, dados]) => ({
        nome,
        periodo: periodoLabelTabela,
        valorRealizado: dados.valorRealizado,
        valorMeta: dados.valorMeta,
        percentual: dados.valorMeta > 0 ? dados.valorRealizado / dados.valorMeta : 0,
      }))
      .sort((a, b) => b.percentual - a.percentual)
      .map((item, index) => ({ ...item, posicao: index + 1 }));
  }, [dadosFiltrados, metasData, filtros.isMetaInterna, periodo, tipoTabelaDados, periodoLabelTabela]);

  // Dados para tabela de Atingimento Indicadores Operacionais (por unidade)
  const indicadoresOperacionaisPorUnidade = useMemo(() => {
    if (!periodo) return [];

    const multiplicador = filtros.isMetaInterna ? META_CONFIG.META_INTERNA_MULTIPLICADOR : 1;
    const startDate = periodo.startDate;
    const endDate = new Date(periodo.endDate);
    endDate.setDate(endDate.getDate() + 1); // Incluir o último dia

    // Obter lista de unidades dos dados filtrados
    const unidadesSet = new Set<string>();
    dadosFiltrados.forEach(d => {
      if (d.nm_unidade) unidadesSet.add(d.nm_unidade);
    });
    
    // Adicionar unidades do funil
    if (funilData) {
      funilData.forEach(d => {
        if (d.nm_unidade) unidadesSet.add(d.nm_unidade);
      });
    }

    const unidades = Array.from(unidadesSet).sort();

    return unidades.map(unidade => {
      // LEADS: contar do funil para essa unidade no período
      const leadsResultado = (funilData || []).filter(d => {
        if (d.nm_unidade !== unidade) return false;
        const criado = d.criado_em;
        if (!criado) return false;
        // Parse date from criado_em (DD/MM/YYYY format)
        const parts = String(criado).match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (!parts) return false;
        const dateObj = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]));
        return dateObj >= startDate && dateObj < endDate;
      }).length;

      // Buscar meta de leads para essa unidade no período
      let leadsMeta = 0;
      if (metasData) {
        metasData.forEach((metaInfo, chave) => {
          const [u, ano, mes] = chave.split('-');
          if (u !== unidade) return;
          if (ano && mes) {
            const metaDate = new Date(Number(ano), Number(mes) - 1, 1);
            const metaRangeStart = new Date(metaDate.getFullYear(), metaDate.getMonth(), 1);
            const metaRangeEnd = new Date(metaDate.getFullYear(), metaDate.getMonth() + 1, 1);
            if (metaRangeStart < endDate && metaRangeEnd > startDate) {
              leadsMeta += (metaInfo.meta_leads || 0) * multiplicador;
            }
          }
        });
      }

      // REUNIÕES: contar do funil com diagnostico_realizado preenchido
      const reunioesResultado = (funilData || []).filter(d => {
        if (d.nm_unidade !== unidade) return false;
        // Verificar se passou da fase de qualificação (diagnostico_realizado preenchido)
        if (!d.diagnostico_realizado || d.diagnostico_realizado.trim() === '') return false;
        const criado = d.criado_em;
        if (!criado) return false;
        const parts = String(criado).match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (!parts) return false;
        const dateObj = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]));
        return dateObj >= startDate && dateObj < endDate;
      }).length;

      let reunioesMeta = 0;
      if (metasData) {
        metasData.forEach((metaInfo, chave) => {
          const [u, ano, mes] = chave.split('-');
          if (u !== unidade) return;
          if (ano && mes) {
            const metaDate = new Date(Number(ano), Number(mes) - 1, 1);
            const metaRangeStart = new Date(metaDate.getFullYear(), metaDate.getMonth(), 1);
            const metaRangeEnd = new Date(metaDate.getFullYear(), metaDate.getMonth() + 1, 1);
            if (metaRangeStart < endDate && metaRangeEnd > startDate) {
              reunioesMeta += (metaInfo.meta_reunioes || 0) * multiplicador;
            }
          }
        });
      }

      // CONTRATOS: contar do salesData para essa unidade no período
      const contratosResultado = dadosFiltrados.filter(d => d.nm_unidade === unidade).length;

      let contratosMeta = 0;
      if (metasData) {
        metasData.forEach((metaInfo, chave) => {
          const [u, ano, mes] = chave.split('-');
          if (u !== unidade) return;
          if (ano && mes) {
            const metaDate = new Date(Number(ano), Number(mes) - 1, 1);
            const metaRangeStart = new Date(metaDate.getFullYear(), metaDate.getMonth(), 1);
            const metaRangeEnd = new Date(metaDate.getFullYear(), metaDate.getMonth() + 1, 1);
            if (metaRangeStart < endDate && metaRangeEnd > startDate) {
              contratosMeta += (metaInfo.meta_contratos || 0) * multiplicador;
            }
          }
        });
      }

      // ADESÕES: contar código de integrante único
      const adesoesResultado = dadosFiltrados.filter(d => 
        d.nm_unidade === unidade && 
        d.codigo_integrante && 
        String(d.codigo_integrante).trim() !== ''
      ).length;

      let adesoesMeta = 0;
      if (metasData) {
        metasData.forEach((metaInfo, chave) => {
          const [u, ano, mes] = chave.split('-');
          if (u !== unidade) return;
          if (ano && mes) {
            const metaDate = new Date(Number(ano), Number(mes) - 1, 1);
            const metaRangeStart = new Date(metaDate.getFullYear(), metaDate.getMonth(), 1);
            const metaRangeEnd = new Date(metaDate.getFullYear(), metaDate.getMonth() + 1, 1);
            if (metaRangeStart < endDate && metaRangeEnd > startDate) {
              adesoesMeta += (metaInfo.meta_adesoes || 0) * multiplicador;
            }
          }
        });
      }

      return {
        unidade,
        leadsPercent: leadsMeta > 0 ? leadsResultado / leadsMeta : 0,
        reunioesPercent: reunioesMeta > 0 ? reunioesResultado / reunioesMeta : 0,
        contratosPercent: contratosMeta > 0 ? contratosResultado / contratosMeta : 0,
        adesoesPercent: adesoesMeta > 0 ? adesoesResultado / adesoesMeta : 0,
      };
    });
  }, [dadosFiltrados, funilData, metasData, periodo, filtros.isMetaInterna]);

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

  // ========== DADOS DO FUNIL ==========
  
  // Função para converter data DD/MM/YYYY para objeto Date
  const parseDataFunil = useCallback((dateString: string): Date | null => {
    if (!dateString || typeof dateString !== 'string') return null;
    
    // Tenta primeiro o formato DD/MM/YYYY
    const parts = dateString.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (parts) {
      return new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]));
    }
    
    // Fallback: tenta outros formatos
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  }, []);

  // Filtrar dados do funil por unidade e período
  const dadosFunilFiltrados = useMemo(() => {
    if (!funilData || funilData.length === 0) return [];

    const unidadesAtivas = filtros.unidades.length > 0 ? filtros.unidades : opcoesFiltros.unidades;
    
    let dados = funilData;

    // Filtrar por unidade
    if (unidadesAtivas.length > 0) {
      dados = dados.filter(d => unidadesAtivas.includes(d.nm_unidade));
    }

    // Filtrar por período de data (usando campo criado_em)
    if (periodo?.startDate && periodo?.endDate) {
      const startDate = periodo.startDate;
      // Adicionar 1 dia ao endDate para incluir o dia final completo
      const endDate = new Date(periodo.endDate);
      endDate.setDate(endDate.getDate() + 1);

      dados = dados.filter(item => {
        if (!item.criado_em) return false;
        
        const dataItem = parseDataFunil(item.criado_em);
        if (!dataItem) return false;
        
        return dataItem >= startDate && dataItem < endDate;
      });
    }

    return dados;
  }, [funilData, filtros.unidades, opcoesFiltros.unidades, periodo, parseDataFunil]);

  // Dados de negociações por fase (para gráfico do funil)
  const dadosNegociacoesPorFase = useMemo(() => {
    if (!dadosFunilFiltrados || dadosFunilFiltrados.length === 0) return [];

    // Contar quantidade por fase
    const faseContador: Record<string, number> = {};
    
    dadosFunilFiltrados.forEach(item => {
      if (item.titulo && item.titulo.trim() !== '') {
        const fase = item.fase_perdido || 'Não informado';
        faseContador[fase] = (faseContador[fase] || 0) + 1;
      }
    });

    // Mapear para formato do gráfico com cores
    return CORES_FASES_FUNIL.map(faseConfig => ({
      fase: faseConfig.nome,
      quantidade: faseContador[faseConfig.nome] || 0,
      cor: faseConfig.cor,
    })).filter(f => f.quantidade > 0 || CORES_FASES_FUNIL.some(c => c.nome === f.fase));
  }, [dadosFunilFiltrados]);

  // Dados de perdas por fase
  const dadosPerdasPorFase = useMemo(() => {
    if (!dadosFunilFiltrados || dadosFunilFiltrados.length === 0) return [];

    const perdasContador: Record<string, number> = {
      '1.1 Qualificação do Lead': 0,
      '1.2 Qualificação Comissão': 0,
      '1.3 Reunião Agendada': 0,
      '2.1 Diagnóstico Realizado': 0,
      '2.2 Apresentação Proposta': 0,
      '3.1 Proposta Enviada': 0,
      '3.2 Apresentação Turma': 0,
      '3.3 Gerar Contrato': 0,
      '4.1 Fechamento Comissão': 0,
      '5.1 Captação de Adesões': 0,
    };

    dadosFunilFiltrados.forEach(item => {
      if (item.titulo && item.titulo.trim() !== '') {
        if (item.perda_11?.toLowerCase() === 'sim') perdasContador['1.1 Qualificação do Lead']++;
        if (item.perda_12?.toLowerCase() === 'sim') perdasContador['1.2 Qualificação Comissão']++;
        if (item.perda_13?.toLowerCase() === 'sim') perdasContador['1.3 Reunião Agendada']++;
        if (item.perda_21?.toLowerCase() === 'sim') perdasContador['2.1 Diagnóstico Realizado']++;
        if (item.perda_22?.toLowerCase() === 'sim') perdasContador['2.2 Apresentação Proposta']++;
        if (item.perda_31?.toLowerCase() === 'sim') perdasContador['3.1 Proposta Enviada']++;
        if (item.perda_32?.toLowerCase() === 'sim') perdasContador['3.2 Apresentação Turma']++;
        if (item.perda_33?.toLowerCase() === 'sim') perdasContador['3.3 Gerar Contrato']++;
        if (item.perda_41?.toLowerCase() === 'sim') perdasContador['4.1 Fechamento Comissão']++;
        if (item.perda_51?.toLowerCase() === 'sim') perdasContador['5.1 Captação de Adesões']++;
      }
    });

    // Mapear para formato do gráfico com cores
    return CORES_FASES_PERDAS.map(faseConfig => ({
      fase: faseConfig.nome,
      quantidade: perdasContador[faseConfig.nome] || 0,
      cor: faseConfig.cor,
    }));
  }, [dadosFunilFiltrados]);

  // Função para classificar tipo de captação
  const getTipoCaptacao = useCallback((origemLead: string): string => {
    if (!origemLead || origemLead.trim() === '') return 'Captação Ativa';
    
    const origem = origemLead.trim();
    
    const captacoesPassivasExclusivasViva = [
      'Digital - Redes Sociais - VIVA Brasil',
      'Digital - Site VIVA Brasil',
      'Digital - Card Google',
    ];
    
    const captacoesPassivas = [
      'Presencial - Ligação/WPP Telefone Consultor (a)',
      'Digital - Redes Sociais - Instagram Local',
      'Indicação - Via Atlética/DA/CA',
      'Indicação - Via outra Franquia/Consultor VIVA',
      'Digital - Redes Sociais - Instagram Consultor (a)',
      'Presencial - Ligação Telefone Franquia',
      'Indicação - Via Integrante de Turma',
      'Presencial - Visita Sede Franquia',
      'Digital - Campanha paga - Instagram Local',
    ];

    if (captacoesPassivasExclusivasViva.includes(origem)) {
      return 'Captação Passiva - Exclusiva Viva BR';
    }
    
    if (captacoesPassivas.includes(origem)) {
      return 'Captação Passiva';
    }
    
    return 'Captação Ativa';
  }, []);

  // Dados de captações agrupados
  const dadosCaptacoes = useMemo(() => {
    if (!dadosFunilFiltrados || dadosFunilFiltrados.length === 0) return { porOrigem: [], porTipo: [] };

    // Filtrar apenas leads válidos
    const leadsValidos = dadosFunilFiltrados.filter(item => 
      item.titulo && item.titulo.trim() !== ''
    );

    const totalLeads = leadsValidos.length;
    if (totalLeads === 0) return { porOrigem: [], porTipo: [] };

    // Agrupar por origem
    const origemContador: Record<string, number> = {};
    const tipoContador: Record<string, number> = {};

    leadsValidos.forEach(item => {
      const origem = item.origem_lead || 'Não informado';
      const tipo = getTipoCaptacao(origem);

      origemContador[origem] = (origemContador[origem] || 0) + 1;
      tipoContador[tipo] = (tipoContador[tipo] || 0) + 1;
    });

    // Criar dados por origem
    const porOrigem = Object.entries(origemContador)
      .map(([origem, total]) => ({
        origem,
        tipo: getTipoCaptacao(origem),
        percentual: (total / totalLeads) * 100,
        total,
      }))
      .sort((a, b) => b.total - a.total);

    // Criar dados por tipo
    const porTipo = Object.entries(tipoContador)
      .map(([tipo, total]) => ({
        tipo,
        total,
        percentual: (total / totalLeads) * 100,
      }))
      .sort((a, b) => b.total - a.total);

    return { porOrigem, porTipo };
  }, [dadosFunilFiltrados, getTipoCaptacao]);

  // Indicadores operacionais do funil horizontal
  const indicadoresFunilHorizontal = useMemo(() => {
    if (!dadosFunilFiltrados || dadosFunilFiltrados.length === 0) {
      return {
        indicadores: [
          { titulo: 'TOTAL DE LEADS CRIADOS', valor: 0 },
          { titulo: 'QUALIFICAÇÃO COMISSÃO', valor: 0 },
          { titulo: 'REUNIÃO REALIZADA', valor: 0 },
          { titulo: 'PROPOSTAS ENVIADAS', valor: 0 },
          { titulo: 'CONTRATOS FECHADOS', valor: 0 },
        ],
        leadsPerdidos: 0,
        leadsDescartados: 0,
      };
    }

    // Contar leads válidos
    const leadsValidos = dadosFunilFiltrados.filter(item => 
      item.titulo && item.titulo.trim() !== ''
    );

    // Total de leads criados
    const totalLeads = leadsValidos.length;

    // Qualificação Comissão
    const qualificacaoComissao = leadsValidos.filter(item => 
      item.qualificacao_comissao && item.qualificacao_comissao.trim() !== ''
    ).length;

    // Reunião Realizada (diagnóstico realizado)
    const reuniaoRealizada = leadsValidos.filter(item => 
      item.diagnostico_realizado && item.diagnostico_realizado.trim() !== ''
    ).length;

    // Propostas Enviadas
    const propostasEnviadas = leadsValidos.filter(item => 
      item.proposta_enviada && item.proposta_enviada.trim() !== ''
    ).length;

    // Contratos Fechados
    const contratosFechados = leadsValidos.filter(item => 
      item.fechamento_comissao && item.fechamento_comissao.trim() !== ''
    ).length;

    // Leads Perdidos (fase = "7.2 Perdido")
    const leadsPerdidos = leadsValidos.filter(item => 
      item.fase_perdido === '7.2 Perdido'
    ).length;

    // Leads Descartados (motivo de perda começa com "Descarte")
    const leadsDescartados = leadsValidos.filter(item => {
      const motivo = item.concat_motivo_perda || '';
      return motivo.toLowerCase().startsWith('descarte');
    }).length;

    return {
      indicadores: [
        { titulo: 'TOTAL DE LEADS CRIADOS', valor: totalLeads },
        { titulo: 'QUALIFICAÇÃO COMISSÃO', valor: qualificacaoComissao },
        { titulo: 'REUNIÃO REALIZADA', valor: reuniaoRealizada },
        { titulo: 'PROPOSTAS ENVIADAS', valor: propostasEnviadas },
        { titulo: 'CONTRATOS FECHADOS', valor: contratosFechados },
      ],
      leadsPerdidos,
      leadsDescartados,
    };
  }, [dadosFunilFiltrados]);

  // Função auxiliar para processar motivo de perda (mesma lógica do original)
  const getCampoAuxiliar = (concatMotivoPerda: string): string => {
    if (!concatMotivoPerda || concatMotivoPerda.trim() === '') return '';
    
    const motivo = concatMotivoPerda.trim();
    
    switch (motivo) {
      case "Outro Motivo (especifique no campo de texto)":
        return "Outro Motivo (especifique no campo de texto)";
      case "Fechou com o Concorrente":
        return "Fechou com o Concorrente";
      case "Desistiu de Fazer o Fundo de Formatura":
        return "Desistiu de Fazer o Fundo de Formatura";
      case "Lead Duplicado (já existe outra pessoa da turma negociando - especifique o nome)":
        return "Descarte - Lead Duplicado (já existe outra pessoa da turma negociando - especifique o nome)";
      case "Falta de Contato no Grupo (durante negociação)":
        return "Falta de Contato no Grupo (durante negociação)";
      case "Falta de Contato Inicial (não responde)":
        return "Falta de Contato Inicial (não responde)";
      case "Território Inviável (não atendido por franquia VIVA)":
        return "Descarte - Território Inviável (não atendido por franquia VIVA)";
      case "Falta de Contato Inicial (telefone errado)":
        return "Descarte - Falta de Contato Inicial (telefone errado)";
      case "Pediu para retomar contato no próximo semestre":
        return "Descarte - Pediu para retomar contato no próximo semestre";
      case "Tipo de Ensino/Curso não atendido":
        return "Descarte - Tipo de Ensino/Curso não atendido";
      case "Adesão individual":
        return "Descarte - Adesão Individual";
      case "Adesão individual:":
        return "Descarte - Adesão Individual";
      case "Tipo de Ensino/Curso não atendido:":
        return "Descarte - Tipo de Ensino/Curso não atendido";
      default:
        return motivo;
    }
  };

  // Calcular motivos de perda e descarte
  const motivosPerdaDescarte = useMemo(() => {
    if (!dadosFunilFiltrados || dadosFunilFiltrados.length === 0) {
      return { motivosPerda: [], motivosDescarte: [] };
    }

    // Leads válidos com título
    const leadsValidos = dadosFunilFiltrados.filter(item => 
      item.titulo && item.titulo.trim() !== ''
    );

    // Leads perdidos (excluindo descartes)
    const leadsComFasePerdido = leadsValidos.filter(item => {
      // 1. Verificar se está na fase 7.2 Perdido
      const estaNaFasePerdido = item.fase_perdido && 
        item.fase_perdido.trim() !== '' && 
        (item.fase_perdido.includes("7.2") || 
         item.fase_perdido.toLowerCase().includes("perdido"));

      if (!estaNaFasePerdido) return false;

      // 2. Deve ter motivo de perda preenchido
      if (!item.concat_motivo_perda || item.concat_motivo_perda.trim() === '') return false;

      // 3. Verificar se NÃO começa com "Descarte"
      const campoAuxiliar = getCampoAuxiliar(item.concat_motivo_perda);
      return !campoAuxiliar.startsWith("Descarte");
    });

    // Leads descartados
    const leadsComDescarte = leadsValidos.filter(item => {
      const estaNaFasePerdido = item.fase_perdido && 
        item.fase_perdido.trim() !== '' && 
        (item.fase_perdido.includes("7.2") || 
         item.fase_perdido.toLowerCase().includes("perdido"));

      if (!estaNaFasePerdido) return false;

      if (!item.concat_motivo_perda || item.concat_motivo_perda.trim() === '') return false;

      const campoAuxiliar = getCampoAuxiliar(item.concat_motivo_perda);
      return campoAuxiliar.startsWith("Descarte");
    });

    // Contar motivos de perda
    const motivoPerdaContador: Record<string, number> = {};
    let totalPerdidos = 0;
    leadsComFasePerdido.forEach(item => {
      const campoAuxiliar = getCampoAuxiliar(item.concat_motivo_perda);
      const motivoFinal = campoAuxiliar || item.concat_motivo_perda.trim();
      if (motivoFinal) {
        motivoPerdaContador[motivoFinal] = (motivoPerdaContador[motivoFinal] || 0) + 1;
        totalPerdidos++;
      }
    });

    // Contar motivos de descarte
    const motivoDescarteContador: Record<string, number> = {};
    let totalDescartados = 0;
    leadsComDescarte.forEach(item => {
      const campoAuxiliar = getCampoAuxiliar(item.concat_motivo_perda);
      const motivoFinal = campoAuxiliar || item.concat_motivo_perda.trim();
      if (motivoFinal) {
        motivoDescarteContador[motivoFinal] = (motivoDescarteContador[motivoFinal] || 0) + 1;
        totalDescartados++;
      }
    });

    // Converter para arrays ordenados
    const motivosPerda = Object.entries(motivoPerdaContador)
      .map(([motivo, total]) => ({
        motivo,
        total,
        percentual: totalPerdidos > 0 ? (total / totalPerdidos) * 100 : 0
      }))
      .sort((a, b) => b.total - a.total);

    const motivosDescarte = Object.entries(motivoDescarteContador)
      .map(([motivo, total]) => ({
        motivo,
        total,
        percentual: totalDescartados > 0 ? (total / totalDescartados) * 100 : 0
      }))
      .sort((a, b) => b.total - a.total);

    // Calcular concorrentes (leads perdidos que fecharam com concorrente)
    const leadsPerdidosComConcorrente = leadsValidos.filter(item => {
      const titulo = (item.titulo || '').trim();
      if (!titulo) return false;
      
      const fase = (item.fase_perdido || '').toLowerCase();
      const estaPerdido = fase.includes('7.2') || fase.includes('perdido');
      if (!estaPerdido) return false;
      
      const motivo = (item.concat_motivo_perda || '').toLowerCase();
      if (!motivo) return false;
      
      // Aceitar variações que mencionem concorrente
      return motivo.includes('concorrente') || 
             motivo.includes('concorr') || 
             motivo.includes('fechou com o concorrente') || 
             motivo.includes('fechou com concorrente');
    });

    // Agregar por nome do concorrente
    const concorrenteContador: Record<string, number> = {};
    let totalConcorrentes = 0;
    leadsPerdidosComConcorrente.forEach(item => {
      let conc = (item.concat_concorrente || '').trim();
      if (!conc) conc = 'Concorrente não informado';
      concorrenteContador[conc] = (concorrenteContador[conc] || 0) + 1;
      totalConcorrentes++;
    });

    const concorrentes = Object.entries(concorrenteContador)
      .map(([concorrente, total]) => ({
        concorrente,
        total,
        percentual: totalConcorrentes > 0 ? (total / totalConcorrentes) * 100 : 0
      }))
      .sort((a, b) => b.total - a.total);

    return { motivosPerda, motivosDescarte, concorrentes };
  }, [dadosFunilFiltrados]);

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
          <h2 className="section-title">
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
            <h2 className="section-title">
              VVR NO PERÍODO SELECIONADO{' '}
              <span className="section-title-highlight">{indicadorMeta}</span>
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
            <h2 className="section-title">
              VVR NO MESMO PERÍODO SELECIONADO NO ANO ANTERIOR{' '}
              <span className="section-title-highlight">{indicadorMeta}</span>
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
          <DadosDetalhadosTable 
            data={rankingUnidades}
            title={`DADOS DETALHADOS POR MÊS/UNIDADE (PERÍODO SELECIONADO) ${indicadorMeta}`}
            tipoSelecionado={tipoTabelaDados}
            onTipoChange={setTipoTabelaDados}
            periodoLabel={periodoLabelTabela}
          />
        </Card>

        {/* Seção 7: Tabela de Atingimento Indicadores Operacionais */}
        <Card>
          <IndicadoresOperacionaisTable 
            data={indicadoresOperacionaisPorUnidade}
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
          {/* Seção 1: Funil Horizontal com Indicadores Operacionais */}
          <div className="bg-dark-secondary rounded-xl p-5">
            <FunilHorizontal
              indicadores={indicadoresFunilHorizontal.indicadores}
              leadsPerdidos={indicadoresFunilHorizontal.leadsPerdidos}
              leadsDescartados={indicadoresFunilHorizontal.leadsDescartados}
            />
          </div>

          {/* Seção 2: Captações */}
          <div className="bg-dark-secondary rounded-xl p-5">
            <h2 className="section-title">
              CAPTAÇÕES
            </h2>
            
            {/* Tabela de captações */}
            <div className="mb-6">
              {dadosCaptacoes.porOrigem.length > 0 ? (
                <CaptacoesTable dados={dadosCaptacoes.porOrigem} />
              ) : (
                <div className="text-center text-text-muted py-10">
                  Sem dados de captação disponíveis
                </div>
              )}
            </div>

            {/* Barra de tipos de captação */}
            <div className="mt-4">
              <h3 className="text-text-primary text-sm font-medium mb-3">
                TIPOS DE CAPTAÇÃO TOTAL
              </h3>
              {dadosCaptacoes.porTipo.length > 0 ? (
                <CaptacaoStackedBar
                  dados={dadosCaptacoes.porTipo}
                  height={60}
                />
              ) : (
                <div className="text-center text-text-muted py-4">
                  Sem dados disponíveis
                </div>
              )}
            </div>
          </div>

          {/* Seção 3: Negociações e Perdas por Fase */}
          <div className="bg-dark-secondary rounded-xl p-5">
            <h2 className="section-title">
              NEGOCIAÇÕES E PERDAS POR FASE
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Negociações */}
              <div>
                <h3 className="text-text-primary text-sm font-medium mb-3">
                  QUANTIDADE DE TURMAS NEGOCIADAS POR FASE DO CRM
                </h3>
                {dadosNegociacoesPorFase.length > 0 ? (
                  <FunnelBarChart
                    dados={dadosNegociacoesPorFase}
                    height={400}
                  />
                ) : (
                  <div className="text-center text-text-muted py-10">
                    {funilData && funilData.length > 0 
                      ? 'Nenhuma negociação encontrada'
                      : 'Sem dados disponíveis'
                    }
                  </div>
                )}
              </div>

              {/* Gráfico de Perdas */}
              <div>
                <h3 className="text-text-primary text-sm font-medium mb-3">
                  QUANTIDADE DE PERDAS POR FASE
                </h3>
                {dadosPerdasPorFase.some(d => d.quantidade > 0) ? (
                  <FunnelBarChart
                    dados={dadosPerdasPorFase}
                    height={400}
                  />
                ) : (
                  <div className="text-center text-text-muted py-10">
                    Nenhuma perda registrada
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Seção 4: Leads Perdidos, Descartes e Concorrentes */}
          <div className="bg-dark-secondary rounded-xl p-5">
            <h2 className="section-title">
              LEADS PERDIDOS, DESCARTES E CONCORRENTES
            </h2>
            
            <MotivosPerdaDescarteTable
              motivosPerda={motivosPerdaDescarte.motivosPerda}
              motivosDescarte={motivosPerdaDescarte.motivosDescarte}
              concorrentes={motivosPerdaDescarte.concorrentes || []}
            />
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
            className="flex-1 p-6 transition-all duration-300 overflow-x-hidden"
            style={{ 
              marginLeft: sidebarCollapsed ? '0' : '300px',
              width: sidebarCollapsed ? '100%' : 'calc(100vw - 300px)',
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
