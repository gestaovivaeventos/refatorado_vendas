/**
 * Página de Resultados - Dashboard PEX com Filtros
 * Exibe gráfico de pontuação por Quarter e Unidade
 */

import React, { useState, useMemo } from 'react';
import { withAuth, usePermissions } from '@/utils/auth';
import Head from 'next/head';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';
import { useSheetsData } from '@/hooks/useSheetsData';
import Card from '@/components/Card';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import IndicadorCard from '@/components/IndicadorCard';
import TabelaResumo from '@/components/TabelaResumo';
import Footer from '@/components/Footer';
import GraficoEvolucao from '@/components/GraficoEvolucao';
import { filterDataByPermission, getAvailableUnits } from '@/utils/permissoes';

function ResultadosContent() {
  // Buscar dados do Google Sheets
  const { dados: dadosBrutos, loading, error } = useSheetsData();

  // Buscar permissões do usuário
  const permissions = usePermissions();

  // Estados para os filtros
  const [filtroQuarter, setFiltroQuarter] = useState<string>('');
  const [filtroUnidade, setFiltroUnidade] = useState<string>('');
  const [filtroCluster, setFiltroCluster] = useState<string>('');
  const [filtroConsultor, setFiltroConsultor] = useState<string>('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Nome dinâmico da coluna do consultor
  const [nomeColunaConsultor, setNomeColunaConsultor] = useState<string>('Consultor');

  // Estado para armazenar pesos dos indicadores por quarter
  const [pesos, setPesos] = useState<Map<string, Map<string, string>>>(new Map());

  // Estado para dados históricos
  const [dadosHistorico, setDadosHistorico] = useState<any[]>([]);

  // Lógica de Filtros usando useMemo para performance
  const listaQuarters = useMemo(() => {
    if (!dadosBrutos || dadosBrutos.length === 0 || !permissions) return [];
    
    // Filtrar por permissões primeiro
    const dadosFiltrados = filterDataByPermission(dadosBrutos, permissions.user);
    
    // Extrair valores únicos da coluna 'QUARTER' (Coluna V)
    const quarters = dadosFiltrados
      .map(item => item.QUARTER)
      .filter((value, index, self) => value && self.indexOf(value) === index)
      .sort();
    
    return quarters;
  }, [dadosBrutos, permissions]);

  const listaClusters = useMemo(() => {
    if (!dadosBrutos || dadosBrutos.length === 0 || !permissions) return [];
    
    // Filtrar por permissões primeiro
    const dadosFiltrados = filterDataByPermission(dadosBrutos, permissions.user);
    
    const clusters = dadosFiltrados
      .map(item => item.cluster)
      .filter((value, index, self) => value && self.indexOf(value) === index)
      .sort();
    
    return clusters;
  }, [dadosBrutos, permissions]);

  const listaConsultores = useMemo(() => {
    if (!dadosBrutos || dadosBrutos.length === 0 || !permissions) return [];
    
    // Filtrar por permissões primeiro
    const dadosFiltrados = filterDataByPermission(dadosBrutos, permissions.user);
    
    // Tentar encontrar a coluna correta para consultor
    const possiveisNomesConsultor = ['Consultor', 'CONSULTOR', 'consultor', 'CONSULTOR RESPONSAVEL', 'Consultor Responsável', 'Consultor Responsavel'];
    let nomeColuna = possiveisNomesConsultor.find(nome => dadosFiltrados[0]?.hasOwnProperty(nome));
    
    if (!nomeColuna) {
      return [];
    }
    
    const consultores = dadosFiltrados
      .map(item => item[nomeColuna])
      .filter((value, index, self) => value && self.indexOf(value) === index)
      .sort();
    
    return consultores;
  }, [dadosBrutos, permissions]);
  
  // Detectar o nome da coluna do consultor
  React.useEffect(() => {
    if (dadosBrutos && dadosBrutos.length > 0) {
      const possiveisNomesConsultor = ['Consultor', 'CONSULTOR', 'consultor', 'CONSULTOR RESPONSAVEL', 'Consultor Responsável', 'Consultor Responsavel'];
      const nomeColuna = possiveisNomesConsultor.find(nome => dadosBrutos[0].hasOwnProperty(nome));
      if (nomeColuna) {
        setNomeColunaConsultor(nomeColuna);
      }
    }
  }, [dadosBrutos]);

  // Carregar pesos dos indicadores
  React.useEffect(() => {
    const carregarPesos = async () => {
      try {
        const response = await fetch('/api/pesos');
        if (response.ok) {
          const dados = await response.json();
          // Processar dados dos pesos
          // Primeira linha são headers: Indicador, Quarter 1, Quarter 2, Quarter 3, Quarter 4
          const pesosMap = new Map<string, Map<string, string>>();
          
          if (dados.length > 1) {
            // Pular header (primeira linha)
            for (let i = 1; i < dados.length; i++) {
              const row = dados[i];
              const indicador = row[0]?.trim() || '';
              const indicadorMap = new Map<string, string>();
              
              // Colunas: 0=Indicador, 1=Q1, 2=Q2, 3=Q3, 4=Q4
              indicadorMap.set('1', row[1] || '');
              indicadorMap.set('2', row[2] || '');
              indicadorMap.set('3', row[3] || '');
              indicadorMap.set('4', row[4] || '');
              
              pesosMap.set(indicador, indicadorMap);
              
              // Também adicionar variações comuns do nome
              pesosMap.set(indicador.toLowerCase(), indicadorMap);
              pesosMap.set(indicador.toUpperCase(), indicadorMap);
            }
          }
          
          setPesos(pesosMap);
        }
      } catch (error) {
        // Silenciosamente ignorar erro se não conseguir carregar pesos
      }
    };

    carregarPesos();
  }, []);

  // Carregar dados históricos
  React.useEffect(() => {
    const carregarHistorico = async () => {
      try {
        const response = await fetch('/api/historico');
        if (response.ok) {
          const dados = await response.json();
          // logs de carregamento removidos
          setDadosHistorico(dados);
        } else {
          // Erro ao carregar histórico
        }
      } catch (error) {
        // Erro ao carregar histórico
      }
    };

    carregarHistorico();
  }, []);

  const listaUnidadesFiltradas = useMemo(() => {
    if (!dadosBrutos || dadosBrutos.length === 0 || !permissions) return [];

    // Primeiro, filtrar por permissões (se franqueado, só sua unidade)
    let dadosFiltrados = filterDataByPermission(dadosBrutos, permissions.user);
    
    // Depois aplicar todos os filtros
    if (filtroQuarter) {
      dadosFiltrados = dadosFiltrados.filter(item => item.QUARTER === filtroQuarter);
    }
    
    if (filtroCluster) {
      dadosFiltrados = dadosFiltrados.filter(item => item.cluster === filtroCluster);
    }
    
    if (filtroConsultor) {
      dadosFiltrados = dadosFiltrados.filter(item => item[nomeColunaConsultor] === filtroConsultor);
    }
    
    const unidades = dadosFiltrados
      .map(item => item.nm_unidade)
      .filter((value, index, self) => value && self.indexOf(value) === index)
      .sort();

    return unidades;
  }, [dadosBrutos, filtroQuarter, filtroCluster, filtroConsultor, permissions]);

  const itemSelecionado = useMemo(() => {
    if (!dadosBrutos || !filtroQuarter || !filtroUnidade || !permissions) return null;

    // Filtrar por permissões primeiro
    const dadosFiltrados = filterDataByPermission(dadosBrutos, permissions.user);

    // Encontrar o item que corresponde aos dois filtros
    return dadosFiltrados.find(
      item =>
        item.QUARTER === filtroQuarter &&
        item.nm_unidade === filtroUnidade
    );
  }, [dadosBrutos, filtroQuarter, filtroUnidade, permissions]);

  // Extrair pontuação (média de todos os quarters da unidade)
  const pontuacao = useMemo(() => {
    if (!filtroUnidade || !dadosBrutos || !permissions) return 0;
    
    // Filtrar por permissões primeiro
    const dadosFiltrados = filterDataByPermission(dadosBrutos, permissions.user);
    
    // Buscar todos os quarters da unidade selecionada
    const todosQuartersDaUnidade = dadosFiltrados.filter(
      item => item.nm_unidade === filtroUnidade
    );

    if (todosQuartersDaUnidade.length === 0) return 0;

    // Calcular a soma das pontuações
    const somaPontuacoes = todosQuartersDaUnidade.reduce((acc, item) => {
      const valor = item['Pontuação com bonus'] || 
                    item['Pontuação com Bonus'] ||
                    item['Pontuação com Bônus'] ||
                    '0';
      
      return acc + (parseFloat(valor.toString().replace(',', '.')) || 0);
    }, 0);

    // Retornar a média
    return somaPontuacoes / todosQuartersDaUnidade.length;
  }, [filtroUnidade, dadosBrutos, permissions]);

  // Calcular ranking na rede (posição geral baseada na média de todos os quarters)
  const rankingRedePorMedia = useMemo(() => {
    if (!dadosBrutos || !filtroUnidade || !permissions) return { posicao: 0, total: 0 };

    // Usar dados completos para cálculo real
    // Agrupar por unidade e calcular média de todos os quarters
    const unidadesComMedia = new Map<string, { soma: number; count: number; cluster?: string }>();

    dadosBrutos.forEach(item => {
      const unidade = item.nm_unidade;
      const pontos = parseFloat((item['Pontuação com bonus'] || item['Pontuação com Bonus'] || '0').toString().replace(',', '.')) || 0;
      
      if (!unidadesComMedia.has(unidade)) {
        unidadesComMedia.set(unidade, { soma: 0, count: 0, cluster: item.cluster });
      }
      
      const dados = unidadesComMedia.get(unidade)!;
      dados.soma += pontos;
      dados.count += 1;
    });

    // Criar ranking com médias
    const ranking = Array.from(unidadesComMedia.entries())
      .map(([unidade, dados]) => ({
        unidade,
        media: dados.soma / dados.count,
        cluster: dados.cluster
      }))
      .sort((a, b) => b.media - a.media);

    // Encontrar posição da unidade selecionada
    const posicao = ranking.findIndex(item => item.unidade === filtroUnidade) + 1;

    return { posicao, total: ranking.length };
  }, [dadosBrutos, filtroUnidade, permissions]);

  // Calcular ranking no cluster (posição dentro do cluster baseada na média)
  const rankingClusterPorMedia = useMemo(() => {
    if (!dadosBrutos || !filtroUnidade || !itemSelecionado?.cluster || !permissions) {
      return { posicao: 0, total: 0 };
    }

    const clusterSelecionado = itemSelecionado.cluster;

    // Usar dados completos para cálculo real
    // Agrupar por unidade e calcular média de todos os quarters
    const unidadesComMedia = new Map<string, { soma: number; count: number; cluster?: string }>();

    dadosBrutos.forEach(item => {
      const unidade = item.nm_unidade;
      const pontos = parseFloat((item['Pontuação com bonus'] || item['Pontuação com Bonus'] || '0').toString().replace(',', '.')) || 0;
      
      if (!unidadesComMedia.has(unidade)) {
        unidadesComMedia.set(unidade, { soma: 0, count: 0, cluster: item.cluster });
      }
      
      const dados = unidadesComMedia.get(unidade)!;
      dados.soma += pontos;
      dados.count += 1;
    });

    // Filtrar apenas unidades do mesmo cluster e criar ranking
    const ranking = Array.from(unidadesComMedia.entries())
      .filter(([_, dados]) => dados.cluster === clusterSelecionado)
      .map(([unidade, dados]) => ({
        unidade,
        media: dados.soma / dados.count
      }))
      .sort((a, b) => b.media - a.media);

    // Encontrar posição da unidade selecionada
    const posicao = ranking.findIndex(item => item.unidade === filtroUnidade) + 1;

    return { posicao, total: ranking.length };
  }, [dadosBrutos, filtroUnidade, itemSelecionado, permissions]);

  // Calcular ranking na rede (posição geral no quarter)
  const rankingRede = useMemo(() => {
    if (!dadosBrutos || !filtroQuarter || !itemSelecionado || !permissions) return { posicao: 0, total: 0 };

    // Usar dados completos para cálculo real
    // Filtrar apenas unidades do quarter selecionada
    const unidadesDoQuarter = dadosBrutos.filter(item => item.QUARTER === filtroQuarter);
    
    // Ordenar por pontuação (decrescente)
    const ranking = unidadesDoQuarter
      .map(item => ({
        unidade: item.nm_unidade,
        pontuacao: parseFloat((item['Pontuação com bonus'] || item['Pontuação com Bonus'] || '0').toString().replace(',', '.')) || 0
      }))
      .sort((a, b) => b.pontuacao - a.pontuacao);

    // Encontrar posição da unidade selecionada
    const posicao = ranking.findIndex(item => item.unidade === filtroUnidade) + 1;

    return { posicao, total: ranking.length };
  }, [dadosBrutos, filtroQuarter, filtroUnidade, itemSelecionado, permissions]);

  // Calcular ranking no cluster (posição dentro do cluster no quarter)
  const rankingCluster = useMemo(() => {
    if (!dadosBrutos || !filtroQuarter || !itemSelecionado || !itemSelecionado.cluster || !permissions) {
      return { posicao: 0, total: 0 };
    }

    // Usar dados completos para cálculo real
    // Filtrar unidades do mesmo quarter E mesmo cluster
    const unidadesDoCluster = dadosBrutos.filter(
      item => item.QUARTER === filtroQuarter && item.cluster === itemSelecionado.cluster
    );

    // Ordenar por pontuação (decrescente)
    const ranking = unidadesDoCluster
      .map(item => ({
        unidade: item.nm_unidade,
        pontuacao: parseFloat((item['Pontuação com bonus'] || item['Pontuação com Bonus'] || '0').toString().replace(',', '.')) || 0
      }))
      .sort((a, b) => b.pontuacao - a.pontuacao);

    // Encontrar posição da unidade selecionada
    const posicao = ranking.findIndex(item => item.unidade === filtroUnidade) + 1;

    return { posicao, total: ranking.length };
  }, [dadosBrutos, filtroQuarter, filtroUnidade, itemSelecionado, permissions]);

  // Dados para o gráfico de rosca (Gauge)
  const dadosGrafico = [
    { name: 'score', value: pontuacao },
    { name: 'restante', value: Math.max(0, 100 - pontuacao) }
  ];

  // Calcular pontuação média por quarter (para os 4 gráficos)
  const pontuacoesPorQuarter = useMemo(() => {
    if (!dadosBrutos || dadosBrutos.length === 0 || !filtroUnidade || !permissions) return [];

    // Filtrar por permissões primeiro
    const dadosFiltrados = filterDataByPermission(dadosBrutos, permissions.user);

    // Buscar as 4 quarters da unidade selecionada
    const quarters = ['1', '2', '3', '4'];
    
    return quarters.map(quarter => {
      // Buscar dados da unidade selecionada neste quarter específico
      const dadosUnidadeNoQuarter = dadosFiltrados.find(
        item => item.QUARTER === quarter && item.nm_unidade === filtroUnidade
      );

      if (!dadosUnidadeNoQuarter) {
        return { quarter, pontuacao: 0 };
      }

      // Pegar a pontuação da unidade neste quarter
      const pontuacao = parseFloat(
        (dadosUnidadeNoQuarter['Pontuação com bonus'] || dadosUnidadeNoQuarter['Pontuação com Bonus'] || '0')
          .toString()
          .replace(',', '.')
      ) || 0;

      return {
        quarter,
        pontuacao: Math.round(pontuacao * 100) / 100
      };
    });
  }, [dadosBrutos, filtroUnidade, permissions]);

  // Calcular performance por indicador (7 indicadores)
  const indicadores = useMemo(() => {
    if (!itemSelecionado || !dadosBrutos || !filtroQuarter || !permissions) return [];

    // Usar dados completos para cálculo real de melhor pontuação
    const cluster = itemSelecionado.cluster;

    // Função auxiliar para converter valor para número
    const parseValor = (valor: any): number => {
      if (!valor) return 0;
      const valorStr = valor.toString().replace(',', '.');
      return parseFloat(valorStr) || 0;
    };

    // Lista dos 7 indicadores do PEX com suas colunas correspondentes
    const listaIndicadores = [
      { 
        codigo: 'VVR', 
        coluna: 'VVR',
        titulo: 'VVR', 
        notaGeral: 'VALOR DE VENDAS REALIZADAS',
        pesoNome: 'VVR'
      },
      { 
        codigo: 'MAC', 
        coluna: 'MAC',
        titulo: 'MAC', 
        notaGeral: 'META DE ATINGIMENTO DE CONTRATO',
        pesoNome: 'MAC'
      },
      { 
        codigo: 'Endividamento', 
        coluna: 'Endividamento',
        titulo: 'ENDIVIDAMENTO', 
        notaGeral: 'PERCENTUAL DE ENDIVIDAMENTO',
        pesoNome: 'ENDIVIDAMENTO'
      },
      { 
        codigo: 'NPS', 
        coluna: 'NPS',
        titulo: 'NPS SEMESTRAL', 
        notaGeral: 'NET PROMOTER SCORE',
        pesoNome: 'NPS'
      },
      { 
        codigo: 'MC_PERCENTUAL', 
        coluna: 'MC %\n(entrega)',
        titulo: 'MC % (ENTREGA)', 
        notaGeral: 'MARGEM DE CONTRIBUIÇÃO DA FRANQUIA',
        pesoNome: '% MC (ENTREGA)'
      },
      { 
        codigo: 'ENPS', 
        coluna: 'Satisfação do colaborador - e-NPS',
        titulo: 'SATISF. COLABORADOR - e-NPS', 
        notaGeral: 'NET PROMOTER SCORE',
        pesoNome: 'E-NPS'
      },
      { 
        codigo: 'CONFORMIDADES', 
        coluna: '*Conformidades',
        titulo: 'CONFORMIDADES', 
        notaGeral: 'NÍVEL DE CONFORMIDADE',
        pesoNome: '% CONFORMIDADES'
      }
    ];

    // Filtrar apenas unidades do mesmo quarter
    const unidadesDoQuarter = dadosBrutos.filter((item: any) => item.QUARTER === filtroQuarter);
    const unidadesDoCluster = unidadesDoQuarter.filter((item: any) => item.cluster === cluster);

    return listaIndicadores.map(ind => {
      // Pontuação da unidade selecionada
      const pontuacaoUnidade = parseValor(itemSelecionado[ind.coluna]);

      // Calcular melhor pontuação da rede neste indicador
      const pontuacoesRede = unidadesDoQuarter
        .map((item: any) => parseValor(item[ind.coluna]))
        .filter((val: any) => val > 0);
      const melhorRede = pontuacoesRede.length > 0 ? Math.max(...pontuacoesRede) : 0;

      // Encontrar unidade com melhor pontuação na rede
      const unidadeMelhorRede = unidadesDoQuarter.find(
        (item: any) => parseValor(item[ind.coluna]) === melhorRede
      )?.nm_unidade;
      
      // Calcular melhor pontuação do cluster neste indicador
      const pontuacoesCluster = unidadesDoCluster
        .map((item: any) => parseValor(item[ind.coluna]))
        .filter((val: any) => val > 0);
      const melhorCluster = pontuacoesCluster.length > 0 ? Math.max(...pontuacoesCluster) : 0;

      // Encontrar unidade com melhor pontuação no cluster
      const unidadeMelhorCluster = unidadesDoCluster.find(
        (item: any) => parseValor(item[ind.coluna]) === melhorCluster
      )?.nm_unidade;

      // Buscar peso do indicador para o quarter selecionado
      const pesoDictionary = pesos.get(ind.pesoNome) || 
                             pesos.get(ind.pesoNome?.toLowerCase()) || 
                             pesos.get(ind.pesoNome?.toUpperCase()) ||
                             pesos.get(ind.codigo) || 
                             pesos.get(ind.codigo.toLowerCase()) || 
                             pesos.get(ind.codigo.toUpperCase()) ||
                             pesos.get(ind.titulo) ||
                             pesos.get(ind.titulo.toLowerCase()) ||
                             pesos.get(ind.titulo.toUpperCase());
      const pesoValue = pesoDictionary ? pesoDictionary.get(filtroQuarter) : '';
      const notaComPeso = pesoValue ? `Peso: ${pesoValue}` : ind.notaGeral;

      return {
        ...ind,
        pontuacao: pontuacaoUnidade,
        melhorPontuacaoRede: melhorRede,
        melhorPontuacaoCluster: melhorCluster,
        unidadeMelhorRede,
        unidadeMelhorCluster,
        notaGeral: notaComPeso
      };
    });
  }, [itemSelecionado, dadosBrutos, filtroQuarter, pesos, permissions]);

  // Calcular Pontuação Bônus (sem comparativos)
  const pontuacaoBonus = useMemo(() => {
    if (!itemSelecionado) return 0;
    
    // Função auxiliar para converter valor para número
    const parseValor = (valor: any): number => {
      if (!valor) return 0;
      const valorStr = valor.toString().replace(',', '.');
      return parseFloat(valorStr) || 0;
    };

    // Coluna D: "Bonus"
    return parseValor(itemSelecionado['Bonus']);
  }, [itemSelecionado]);

  // Inicializar filtros quando os dados carregarem
  React.useEffect(() => {
    if (listaQuarters.length > 0 && !filtroQuarter) {
      setFiltroQuarter(listaQuarters[0]);
    }
  }, [listaQuarters, filtroQuarter]);

  React.useEffect(() => {
    if (listaUnidadesFiltradas.length > 0 && !filtroUnidade) {
      setFiltroUnidade(listaUnidadesFiltradas[0]);
    }
  }, [listaUnidadesFiltradas, filtroUnidade]);

  // Estado de Loading
  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#212529' }}>
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto" style={{ borderColor: '#FF6600' }}></div>
            <p className="mt-4 text-lg" style={{ color: '#adb5bd' }}>Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  // Estado de Erro
  if (error) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#212529' }}>
        <Header />
        <div className="flex items-center justify-center h-96">
          <Card className="max-w-md">
            <div className="text-center">
              <div className="text-5xl mb-4" style={{ color: '#FF6600' }}>⚠️</div>
              <h2 className="text-xl font-bold mb-2" style={{ color: '#F8F9FA' }}>
                Erro ao carregar dados
              </h2>
              <p style={{ color: '#adb5bd' }}>{error}</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#212529' }}>
      <Head>
        <title>Resultados - PEX</title>
        <meta name="description" content="Resultados de Performance - Programa de Excelência (PEX)" />
      </Head>
      {/* Sidebar com Filtros */}
      <Sidebar
        quarters={listaQuarters}
        unidades={listaUnidadesFiltradas}
        clusters={listaClusters}
        consultores={listaConsultores}
        quarterSelecionado={filtroQuarter}
        unidadeSelecionada={filtroUnidade}
        clusterSelecionado={filtroCluster}
        consultorSelecionado={filtroConsultor}
        onQuarterChange={(quarter) => {
          setFiltroQuarter(quarter);
        }}
        onUnidadeChange={setFiltroUnidade}
        onClusterChange={setFiltroCluster}
        onConsultorChange={setFiltroConsultor}
        onCollapseChange={setSidebarCollapsed}
        currentPage="resultados"
      />

      {/* Área de conteúdo que se ajusta à sidebar */}
      <div style={{
        marginLeft: sidebarCollapsed ? '0px' : '280px',
        transition: 'margin-left 0.3s ease',
        minHeight: '100vh'
      }}>
        {/* Header */}
        <Header />

        {/* Conteúdo Principal */}
        <main className="container mx-auto px-4 py-0">
          {/* Gráfico de Pontuação */}
          {itemSelecionado ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card do Gráfico */}
            <Card>
              <h3 
                className="card-title" 
                style={{
                  color: '#adb5bd',
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '16px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid #555',
                  fontFamily: 'Poppins, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                PONTUAÇÃO TOTAL 
                <span style={{ color: '#FF6600' }}>({filtroUnidade})</span>
                {rankingRedePorMedia.posicao === 1 && (
                  <span style={{ fontSize: '1.4rem', marginLeft: '4px' }}>👑</span>
                )}
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <defs>
                    <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ff7a33" stopOpacity={1} />
                      <stop offset="50%" stopColor="#ff6000" stopOpacity={1} />
                      <stop offset="100%" stopColor="#cc4d00" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <Pie
                    data={dadosGrafico}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                    strokeWidth={0}
                  >
                    {/* Gradiente radial laranja escuro para score, cinza escuro para restante */}
                    <Cell fill="url(#orangeGradient)" stroke="none" />
                    <Cell fill="#3a3f47" stroke="none" />
                    
                    {/* Label no centro mostrando a pontuação */}
                    <Label
                      value={pontuacao.toFixed(2)}
                      position="center"
                      style={{ 
                        fontSize: '2.8rem', 
                        fontWeight: '300',
                        fill: '#F8F9FA',
                        fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
                        letterSpacing: '-0.02em'
                      }}
                    />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="text-center mt-4">
                <p className="text-sm mb-3" style={{ color: '#adb5bd' }}>
                  Média de <strong style={{ color: '#F8F9FA' }}>{filtroUnidade}</strong> em{' '}
                  <strong style={{ color: '#F8F9FA' }}>todos os quarters</strong>
                </p>

                {/* Rankings baseados na média */}
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between items-center px-3 py-2 rounded" style={{ backgroundColor: '#2a2f36' }}>
                    <span className="text-xs" style={{ color: '#adb5bd' }}>Posição na Rede:</span>
                    <span className="text-sm font-bold" style={{ color: '#FF6600' }}>
                      {rankingRedePorMedia.posicao}º de {rankingRedePorMedia.total}
                    </span>
                  </div>
                  
                  {itemSelecionado.cluster && (
                    <div className="flex justify-between items-center px-3 py-2 rounded" style={{ backgroundColor: '#2a2f36' }}>
                      <span className="text-xs" style={{ color: '#adb5bd' }}>Posição no Cluster:</span>
                      <span className="text-sm font-bold" style={{ color: '#FF6600' }}>
                        {rankingClusterPorMedia.posicao}º de {rankingClusterPorMedia.total}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-center gap-4 mt-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ background: 'linear-gradient(180deg, #ff7a33, #cc4d00)' }}></div>
                    <span className="text-xs" style={{ color: '#adb5bd' }}>
                      Atingido: {pontuacao.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#3a3f47' }}></div>
                    <span className="text-xs" style={{ color: '#adb5bd' }}>
                      Restante: {(100 - pontuacao).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Card de Detalhes */}
            <Card>
              <h3 
                className="card-title" 
                style={{
                  color: '#adb5bd',
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '16px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid #555',
                  fontFamily: 'Poppins, sans-serif'
                }}
              >
                DETALHES DA UNIDADE <span style={{ color: '#FF6600' }}>({filtroQuarter === '1' ? '1º' : filtroQuarter === '2' ? '2º' : filtroQuarter === '3' ? '3º' : '4º'} Quarter)</span>
              </h3>
              <div className="space-y-3">
                {/* 1. Unidade */}
                <div className="grid grid-cols-2 gap-4 py-2" style={{ borderBottom: '1px solid #555' }}>
                  <span style={{ color: '#adb5bd' }}>Unidade:</span>
                  <span className="font-semibold" style={{ color: '#F8F9FA' }}>{filtroUnidade}</span>
                </div>

                {/* 2. Cluster */}
                {itemSelecionado.cluster && (
                  <div className="grid grid-cols-2 gap-4 py-2" style={{ borderBottom: '1px solid #555' }}>
                    <span style={{ color: '#adb5bd' }}>Cluster:</span>
                    <span className="font-semibold" style={{ color: '#F8F9FA' }}>
                      {itemSelecionado.cluster}
                    </span>
                  </div>
                )}

                {/* 3. Consultor Responsável */}
                {itemSelecionado.Consultor && (
                  <div className="grid grid-cols-2 gap-4 py-2" style={{ borderBottom: '1px solid #555' }}>
                    <span style={{ color: '#adb5bd' }}>Consultor Responsável:</span>
                    <span className="font-semibold" style={{ color: '#F8F9FA' }}>
                      {itemSelecionado.Consultor}
                    </span>
                  </div>
                )}

                {/* 4. Quarter */}
                <div className="grid grid-cols-2 gap-4 py-2" style={{ borderBottom: '1px solid #555' }}>
                  <span style={{ color: '#adb5bd' }}>Quarter:</span>
                  <span className="font-semibold" style={{ color: '#F8F9FA' }}>
                    {filtroQuarter === '1' ? '1º Quarter' : filtroQuarter === '2' ? '2º Quarter' : filtroQuarter === '3' ? '3º Quarter' : '4º Quarter'}
                  </span>
                </div>

                {/* 5. Pontuação no Quarter Selecionado */}
                <div className="grid grid-cols-2 gap-4 py-2" style={{ borderBottom: '1px solid #555' }}>
                  <span style={{ color: '#adb5bd' }}>Pontuação no Quarter Selecionado:</span>
                  <span className="font-semibold" style={{ color: '#FF6600', fontSize: '1.1rem' }}>
                    {itemSelecionado['Pontuação com bonus'] || itemSelecionado['Pontuação com Bonus'] || '0'}
                  </span>
                </div>
                
                {/* 6. Posição na Rede */}
                <div className="grid grid-cols-2 gap-4 py-2" style={{ borderBottom: '1px solid #555' }}>
                  <span style={{ color: '#adb5bd' }}>Posição na Rede:</span>
                  <span className="font-semibold" style={{ color: '#F8F9FA' }}>
                    {rankingRede.posicao}º de {rankingRede.total}
                  </span>
                </div>

                {/* 7. Posição no Cluster */}
                {itemSelecionado.cluster && (
                  <div className="grid grid-cols-2 gap-4 py-2" style={{ borderBottom: '1px solid #555' }}>
                    <span style={{ color: '#adb5bd' }}>Posição no Cluster:</span>
                    <span className="font-semibold" style={{ color: '#F8F9FA' }}>
                      {rankingCluster.posicao}º de {rankingCluster.total}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        ) : (
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-4" style={{ color: '#555' }}>📊</div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#F8F9FA' }}>
                Selecione um Quarter e Unidade
              </h3>
              <p style={{ color: '#adb5bd' }}>
                Use os filtros acima para visualizar a pontuação
              </p>
            </div>
          </Card>
        )}

        {/* Gráficos de Pontuação por Quarter */}
        {itemSelecionado && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6" style={{ 
              color: '#adb5bd', 
              fontFamily: 'Poppins, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              borderBottom: '2px solid #FF6600',
              paddingBottom: '8px'
            }}>
              Pontuação por Quarter
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pontuacoesPorQuarter.map((quarterData) => {
                const dadosGraficoQuarter = [
                  { name: 'score', value: quarterData.pontuacao },
                  { name: 'restante', value: Math.max(0, 100 - quarterData.pontuacao) }
                ];

                // Função para converter número em ordinal
                const getOrdinal = (num: string) => {
                  return num === '1' ? '1º' : num === '2' ? '2º' : num === '3' ? '3º' : '4º';
                };

                return (
                  <Card key={quarterData.quarter} titulo={`${getOrdinal(quarterData.quarter)} Quarter`}>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <defs>
                          <radialGradient id={`orangeGradient${quarterData.quarter}`}>
                            <stop offset="0%" stopColor="#ff7a33" stopOpacity={1} />
                            <stop offset="100%" stopColor="#cc4400" stopOpacity={1} />
                          </radialGradient>
                        </defs>
                        <Pie
                          data={dadosGraficoQuarter}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={75}
                          startAngle={90}
                          endAngle={-270}
                          dataKey="value"
                          stroke="none"
                          strokeWidth={0}
                        >
                          <Cell fill={`url(#orangeGradient${quarterData.quarter})`} stroke="none" />
                          <Cell fill="#3a3f47" stroke="none" />
                          
                          <Label
                            value={quarterData.pontuacao.toFixed(2)}
                            position="center"
                            style={{ 
                              fontSize: '2.2rem', 
                              fontWeight: '300',
                              fill: '#F8F9FA',
                              fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
                              letterSpacing: '-0.02em'
                            }}
                          />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="text-center mt-3">
                      <p className="text-sm" style={{ color: '#adb5bd', fontFamily: 'Poppins, sans-serif' }}>
                        Pontuação
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Seção: Performance por Indicador */}
        {itemSelecionado && (
          <div className="mt-8">
            <h2 
              className="text-2xl font-bold mb-6" 
              style={{ 
                color: '#adb5bd', 
                fontFamily: 'Poppins, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                borderBottom: '2px solid #FF6600',
                paddingBottom: '8px'
              }}
            >
              Performance por Indicador <span style={{ color: '#FF6600' }}>({filtroQuarter === '1' ? '1º' : filtroQuarter === '2' ? '2º' : filtroQuarter === '3' ? '3º' : '4º'} Quarter)</span>
            </h2>

            {/* Grid de 8 Cards de Indicadores (4 colunas em telas grandes) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {indicadores.map((indicador, index) => (
                <div key={index}>
                  <IndicadorCard
                    titulo={indicador.titulo}
                    notaGeral={indicador.notaGeral}
                    pontuacao={indicador.pontuacao}
                    melhorPontuacaoRede={indicador.melhorPontuacaoRede}
                    melhorPontuacaoCluster={indicador.melhorPontuacaoCluster}
                    unidadeMelhorRede={indicador.unidadeMelhorRede}
                    unidadeMelhorCluster={indicador.unidadeMelhorCluster}
                  />
                </div>
              ))}

              {/* Card de Pontuação Bônus (sem comparativos) */}
              <div>
                <div 
                  className="p-4 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
                  style={{ backgroundColor: '#343A40' }}
                >
                  {/* Título */}
                  <h3 
                    className="text-sm font-bold mb-2 uppercase tracking-wide"
                    style={{ color: '#F8F9FA' }}
                  >
                    PONTUAÇÃO BÔNUS
                  </h3>

                  {/* Nota Geral (invisível para manter alinhamento) */}
                  <p 
                    className="text-xs mb-3"
                    style={{ color: 'transparent' }}
                  >
                    .
                  </p>

                  {/* Valor da Pontuação Bônus */}
                  <div className="mb-3">
                    <div className="flex items-baseline gap-2">
                      <span 
                        className="text-3xl font-bold"
                        style={{ color: '#FF6600' }}
                      >
                        {pontuacaoBonus.toFixed(1)}
                      </span>
                      <span 
                        className="text-xs"
                        style={{ color: '#6c757d' }}
                      >
                        pontos
                      </span>
                    </div>
                  </div>

                  {/* Melhor Pontuação - Rede (invisível para manter altura) */}
                  <div className="mb-2 pb-2" style={{ borderBottom: '1px solid transparent' }}>
                    <div className="flex justify-between items-center" style={{ visibility: 'hidden' }}>
                      <span className="text-xs uppercase tracking-wide">Melhor Pontuação - Rede</span>
                      <span className="text-sm font-semibold">0.0</span>
                    </div>
                    <p className="text-xs mt-1" style={{ visibility: 'hidden' }}>Placeholder</p>
                  </div>

                  {/* Melhor Pontuação - Cluster (invisível para manter altura) */}
                  <div>
                    <div className="flex justify-between items-center" style={{ visibility: 'hidden' }}>
                      <span className="text-xs uppercase tracking-wide">Melhor Pontuação - Cluster</span>
                      <span className="text-sm font-semibold">0.0</span>
                    </div>
                    <p className="text-xs mt-1" style={{ visibility: 'hidden' }}>Placeholder</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Seção: Tabela Resumo */}
        {permissions?.isFranchiser && (
          <div className="mt-8">
            <h2 
              className="text-2xl font-bold mb-6" 
              style={{ 
                color: '#adb5bd', 
                fontFamily: 'Poppins, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                borderBottom: '2px solid #FF6600',
                paddingBottom: '8px'
              }}
            >
              Tabela Resumo {filtroQuarter && <span style={{ color: '#FF6600' }}>({filtroQuarter === '1' ? '1º' : filtroQuarter === '2' ? '2º' : filtroQuarter === '3' ? '3º' : '4º'} Quarter)</span>}
            </h2>

            {/* Tabela Resumo - Apenas para Franqueadora */}
            <Card>
              <TabelaResumo 
                dados={dadosBrutos || []} 
                quarterSelecionado={filtroQuarter}
                clusterSelecionado={filtroCluster}
                consultorSelecionado={filtroConsultor}
                nomeColunaConsultor={nomeColunaConsultor}
              />
            </Card>
          </div>
        )}

        {/* Gráfico de Evolução Mensal */}
        <div className="mt-8">
          <GraficoEvolucao 
            dadosHistorico={dadosHistorico}
            unidadeSelecionada={filtroUnidade}
            clusterSelecionado={filtroCluster}
            consultorSelecionado={filtroConsultor}
            nomeColunaConsultor={nomeColunaConsultor}
          />
        </div>
      </main>
      <Footer />
      </div>
    </div>
  );
}

export default withAuth(ResultadosContent);
