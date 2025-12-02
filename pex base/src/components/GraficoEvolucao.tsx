/**
 * GraficoEvolucao - Gráfico de linhas para evolução mensal por indicador
 */

import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface GraficoEvolucaoProps {
  dadosHistorico: any[];
  unidadeSelecionada?: string;
  clusterSelecionado?: string;
  consultorSelecionado?: string;
  nomeColunaConsultor?: string;
}

const MESES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

const INDICADORES = [
  { codigo: 'VVR', nome: 'VVR' },
  { codigo: 'MAC', nome: 'MAC' },
  { codigo: 'Endividamento', nome: 'Endividamento' },
  { codigo: 'NPS', nome: 'NPS' },
  { codigo: 'MC % (entrega)', nome: 'MC %\n(entrega)' },
  { codigo: 'Satisfação do colaborador - e-NPS', nome: 'Satisfação do colaborador - e-NPS' },
  { codigo: '*Conformidades', nome: 'Conformidades' },
  { codigo: 'Pontuação com bonus', nome: 'Pontuação no Mês' }
];

export default function GraficoEvolucao({ 
  dadosHistorico, 
  unidadeSelecionada, 
  clusterSelecionado, 
  consultorSelecionado,
  nomeColunaConsultor = 'Consultor'
}: GraficoEvolucaoProps) {
  const [indicadorSelecionado, setIndicadorSelecionado] = useState('VVR');
  const [anoSelecionado, setAnoSelecionado] = useState('2025');

  // Extrair anos disponíveis
  const anosDisponiveis = useMemo(() => {
    if (!dadosHistorico || dadosHistorico.length === 0) return ['2025'];
    
    const anos = dadosHistorico
      .map(item => {
        if (item.data) {
          // Tentar extrair ano da data (formato DD/MM/YYYY)
          const partes = item.data.split('/');
          if (partes.length === 3) {
            return partes[2];
          }
        }
        return null;
      })
      .filter((ano, index, self) => ano && self.indexOf(ano) === index)
      .sort((a, b) => b.localeCompare(a)); // Ordem decrescente
    
    return anos.length > 0 ? anos : ['2025'];
  }, [dadosHistorico]);

  // Processar dados para o gráfico
  const dadosGrafico = useMemo(() => {
    if (!dadosHistorico || dadosHistorico.length === 0) {
      return MESES.map((mes, index) => ({
        mes,
        mesNumero: index + 1,
        valor: 0
      }));
    }

    // Debug: verificar estrutura dos dados (logs removidos em produção)
    if (dadosHistorico.length > 0) {
      // (logs removidos)
    }

    // Aplicar filtros (ano, unidade, cluster, consultor)
    const dadosFiltrados = dadosHistorico.filter(item => {
      // Filtro de ano
      if (item.data) {
        const partes = item.data.split('/');
        if (partes.length === 3) {
          if (partes[2] !== anoSelecionado) {
            return false;
          }
        } else {
          return false;
        }
      } else {
        return false;
      }

      // Filtro de unidade
      if (unidadeSelecionada && item.nm_unidade !== unidadeSelecionada) {
        return false;
      }

      // Filtro de cluster
      if (clusterSelecionado && item.cluster !== clusterSelecionado) {
        return false;
      }

      // Filtro de consultor
      if (consultorSelecionado && item[nomeColunaConsultor] !== consultorSelecionado) {
        return false;
      }

      return true;
    });

  // dadosFiltrados.length (debug log removido)

    // Criar estrutura com todos os meses
    const dadosPorMes = MESES.map((mes, index) => ({
      mes,
      mesNumero: index + 1,
      valor: null as number | null
    }));

    // Preencher com dados existentes
    dadosFiltrados.forEach(item => {
      if (item.data) {
        const partes = item.data.split('/');
        if (partes.length === 3) {
          const mesNumero = parseInt(partes[1], 10);
          const mesIndex = mesNumero - 1;
          
          if (mesIndex >= 0 && mesIndex < 12) {
            // Tentar buscar valor com nome exato ou variações
            let valor: number | undefined;
            
            // Lista de possíveis nomes para cada indicador
            const variacoesNomes: { [key: string]: string[] } = {
              'VVR': ['VVR'],
              'MAC': ['MAC'],
              'Endividamento': ['Endividamento'],
              'NPS': ['NPS'],
              'MC % (entrega)': ['MC %\n(entrega)', 'MC % (entrega)', 'MC %(entrega)', 'MC%'],
              'Satisfação do colaborador - e-NPS': ['Satisfação do colaborador - e-NPS', 'Satisfacao do colaborador - e-NPS'],
              '*Conformidades': ['*Conformidades', 'Conformidades', '%Conformidades']
            };
            
            // Tentar todas as variações possíveis
            const variacoes = variacoesNomes[indicadorSelecionado] || [indicadorSelecionado];
            
            for (const nomeVariacao of variacoes) {
              const valorBruto = item[nomeVariacao];
              if (valorBruto !== undefined && valorBruto !== null && valorBruto !== '') {
                // Converter string com vírgula para ponto (formato brasileiro para decimal)
                const valorString = String(valorBruto).replace(',', '.');
                const valorTentativa = parseFloat(valorString);
                if (!isNaN(valorTentativa)) {
                  valor = valorTentativa;
                  break;
                }
              }
            }
            
            if (valor !== undefined && !isNaN(valor)) {
              dadosPorMes[mesIndex].valor = valor;
            } else {
              // valor não encontrado (debug log removido)
            }
          }
        }
      }
    });

    return dadosPorMes;
  }, [dadosHistorico, indicadorSelecionado, anoSelecionado, unidadeSelecionada, clusterSelecionado, consultorSelecionado, nomeColunaConsultor]);

  // Calcular média do ano
  const mediaAno = useMemo(() => {
    const valoresValidos = dadosGrafico.filter(d => d.valor !== null).map(d => d.valor as number);
    if (valoresValidos.length === 0) return 0;
    const soma = valoresValidos.reduce((acc, val) => acc + val, 0);
    return soma / valoresValidos.length;
  }, [dadosGrafico]);

  // Calcular valor máximo GLOBAL (sem filtros de unidade/cluster/consultor) para manter escala consistente
  const valorMaximoY = useMemo(() => {
    if (!dadosHistorico || dadosHistorico.length === 0) return 100;

    const variacoesNomes: { [key: string]: string[] } = {
      'VVR': ['VVR'],
      'MAC': ['MAC'],
      'Endividamento': ['Endividamento'],
      'NPS': ['NPS'],
      'MC % (entrega)': ['MC %\n(entrega)', 'MC % (entrega)', 'MC %(entrega)', 'MC%'],
      'Satisfação do colaborador - e-NPS': ['Satisfação do colaborador - e-NPS', 'Satisfacao do colaborador - e-NPS'],
      '*Conformidades': ['*Conformidades', 'Conformidades', '%Conformidades'],
      'Pontuação com bonus': ['Pontuação com bonus']
    };

    let valoresMaximos: number[] = [];

    // Iterar por todos os dados do histórico para este ano/indicador (SEM filtros de unidade/cluster/consultor)
    dadosHistorico.forEach(item => {
      if (item.data) {
        const partes = item.data.split('/');
        if (partes.length === 3 && partes[2] === anoSelecionado) {
          const variacoes = variacoesNomes[indicadorSelecionado] || [indicadorSelecionado];
          for (const nomeVariacao of variacoes) {
            const valorRaw = item[nomeVariacao];
            if (valorRaw !== undefined && valorRaw !== null && valorRaw !== '') {
              const valorString = String(valorRaw).replace(',', '.');
              const valorNum = parseFloat(valorString);
              if (!isNaN(valorNum)) {
                valoresMaximos.push(valorNum);
              }
            }
          }
        }
      }
    });

    if (valoresMaximos.length === 0) return 100;
    const maximo = Math.max(...valoresMaximos);
    return maximo + 20;
  }, [dadosHistorico, indicadorSelecionado, anoSelecionado]);

  return (
    <>
      {/* Título fora do container */}
      <h2
        className="text-2xl font-bold mb-6 mt-8"
        style={{
          color: '#adb5bd',
          fontFamily: 'Poppins, sans-serif',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          borderBottom: '2px solid #FF6600',
          paddingBottom: '8px'
        }}
      >
        Evolução mensal por indicador {unidadeSelecionada && <span style={{ color: '#FF6600' }}>({unidadeSelecionada})</span>}
      </h2>

      {/* Container do gráfico */}
      <div style={{
        backgroundColor: '#343A40',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '30px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Filtros */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Filtro de Indicador */}
          <div style={{ position: 'relative' }}>
            <select
              value={indicadorSelecionado}
              onChange={(e) => setIndicadorSelecionado(e.target.value)}
              style={{
                padding: '10px 35px 10px 14px',
                background: 'linear-gradient(to bottom, #5a6573 0%, #4a5563 50%, #3a4553 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 600,
                fontFamily: 'Poppins, sans-serif',
                cursor: 'pointer',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                WebkitAppearance: 'none',
                appearance: 'none'
              } as React.CSSProperties}
            >
              {INDICADORES.map(ind => (
                <option key={ind.codigo} value={ind.codigo}>
                  {ind.nome}
                </option>
              ))}
            </select>
            <span style={{ 
              position: 'absolute', 
              right: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              pointerEvents: 'none', 
              fontSize: '0.7rem', 
              color: 'white' 
            }}>▼</span>
          </div>

          {/* Filtro de Ano */}
          <div style={{ position: 'relative' }}>
            <select
              value={anoSelecionado}
              onChange={(e) => setAnoSelecionado(e.target.value)}
              style={{
                padding: '10px 35px 10px 14px',
                background: 'linear-gradient(to bottom, #5a6573 0%, #4a5563 50%, #3a4553 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 600,
                fontFamily: 'Poppins, sans-serif',
                cursor: 'pointer',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                WebkitAppearance: 'none',
                appearance: 'none'
              } as React.CSSProperties}
            >
              {anosDisponiveis.map(ano => (
                <option key={ano} value={ano}>
                  {ano}
                </option>
              ))}
            </select>
            <span style={{ 
              position: 'absolute', 
              right: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              pointerEvents: 'none', 
              fontSize: '0.7rem', 
              color: 'white' 
            }}>▼</span>
          </div>
        </div>

        {/* Estatística da Média */}
        <div style={{
          backgroundColor: '#2a2f36',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ color: '#aaa', fontSize: '1rem', fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>
            Média do Ano:
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span className="text-3xl font-bold" style={{ color: '#FF6600' }}>
              {mediaAno.toFixed(1)}
            </span>
            <span style={{ color: '#6c757d', fontSize: '0.75rem' }}>
              pontos
            </span>
          </div>
        </div>

        {/* Gráfico */}
        <ResponsiveContainer width="100%" height={450}>
          <LineChart
            data={dadosGrafico}
            margin={{ top: 40, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#4a5563" />
            <XAxis 
              dataKey="mes" 
              stroke="#aaa"
              tick={{ fill: '#aaa', fontSize: 18 }}
              height={40}
            />
            <YAxis 
              stroke="#aaa"
              tick={{ fill: '#aaa', fontSize: 18 }}
              domain={[0, valorMaximoY]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1d23',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 16px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
              }}
              labelStyle={{ 
                color: '#F8F9FA', 
                fontWeight: 600,
                fontSize: '18px',
                marginBottom: '8px'
              }}
              itemStyle={{
                color: '#F8F9FA',
                fontSize: '16px',
                padding: '4px 0'
              }}
              formatter={(value: any, name: string) => {
                if (value === null || value === undefined) return ['N/A', name];
                return [`${Number(value).toFixed(2)}`, name];
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '18px' }}
              iconSize={18}
            />
            <Line
              type="monotone"
              dataKey="valor"
              stroke="#FF6600"
              strokeWidth={3}
              dot={{ fill: '#FF6600', r: 3 }}
              activeDot={{ r: 6 }}
              name={INDICADORES.find(i => i.codigo === indicadorSelecionado)?.nome || indicadorSelecionado}
              connectNulls={false}
              label={{
                position: 'top',
                fill: '#FF6600',
                fontSize: 20,
                fontWeight: 700,
                offset: 10,
                formatter: (value: any) => value !== null ? Number(value).toFixed(1) : ''
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
