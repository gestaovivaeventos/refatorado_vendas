/**
 * Tabela Resumo - Exibe todas as unidades com suas pontuações
 * Com funcionalidade de ordenação por coluna e exportação para Excel
 */

import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';

interface TabelaResumoProps {
  dados: any[];
  quarterSelecionado?: string;
  clusterSelecionado?: string;
  consultorSelecionado?: string;
  nomeColunaConsultor?: string;
}

type OrdenacaoTipo = 'asc' | 'desc' | null;

export default function TabelaResumo({ 
  dados, 
  quarterSelecionado, 
  clusterSelecionado, 
  consultorSelecionado,
  nomeColunaConsultor = 'Consultor'
}: TabelaResumoProps) {
  const [colunaOrdenada, setColunaOrdenada] = useState<string | null>(null);
  const [direcaoOrdenacao, setDirecaoOrdenacao] = useState<OrdenacaoTipo>(null);

  // Função para exportar para Excel
  const exportarParaExcel = () => {
    // Preparar dados para o Excel
    const dadosParaExportar = dadosOrdenados.map(item => {
      const linha: any = {};
      colunas.forEach(col => {
        linha[col.label] = item[col.key] !== undefined && item[col.key] !== null ? item[col.key] : '';
      });
      return linha;
    });
    
    // Criar uma nova planilha
    const worksheet = XLSX.utils.json_to_sheet(dadosParaExportar);
    
    // Criar um novo workbook e adicionar a planilha
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Resumo PEX');
    
    // Gerar o arquivo e fazer download
    const nomeArquivo = `PEX_Tabela_Resumo${quarterSelecionado ? '_QUARTER_' + quarterSelecionado : ''}.xlsx`;
    XLSX.writeFile(workbook, nomeArquivo);
  };

  // Filtrar dados pela QUARTER selecionada
  const dadosFiltrados = useMemo(() => {
    let resultado = dados;
    
    // Filtrar por QUARTER
    if (quarterSelecionado) {
      resultado = resultado.filter(item => item.QUARTER === quarterSelecionado);
    }
    
    // Filtrar por cluster
    if (clusterSelecionado) {
      resultado = resultado.filter(item => item.cluster === clusterSelecionado);
    }
    
    // Filtrar por consultor
    if (consultorSelecionado && nomeColunaConsultor) {
      resultado = resultado.filter(item => item[nomeColunaConsultor] === consultorSelecionado);
    }
    
    return resultado;
  }, [dados, quarterSelecionado, clusterSelecionado, consultorSelecionado, nomeColunaConsultor]);

  // Ordenar dados
  const dadosOrdenados = useMemo(() => {
    if (!colunaOrdenada || !direcaoOrdenacao) return dadosFiltrados;

    return [...dadosFiltrados].sort((a, b) => {
      let valorA = a[colunaOrdenada];
      let valorB = b[colunaOrdenada];

      // Tentar converter para número se possível
      const numA = parseFloat(valorA?.toString().replace(',', '.'));
      const numB = parseFloat(valorB?.toString().replace(',', '.'));

      if (!isNaN(numA) && !isNaN(numB)) {
        return direcaoOrdenacao === 'asc' ? numA - numB : numB - numA;
      }

      // Ordenação alfabética
      const strA = valorA?.toString().toLowerCase() || '';
      const strB = valorB?.toString().toLowerCase() || '';
      
      if (direcaoOrdenacao === 'asc') {
        return strA.localeCompare(strB);
      } else {
        return strB.localeCompare(strA);
      }
    });
  }, [dadosFiltrados, colunaOrdenada, direcaoOrdenacao]);

  // Função para ordenar
  const handleOrdenar = (coluna: string) => {
    if (colunaOrdenada === coluna) {
      // Alternar direção
      if (direcaoOrdenacao === 'asc') {
        setDirecaoOrdenacao('desc');
      } else if (direcaoOrdenacao === 'desc') {
        setDirecaoOrdenacao(null);
        setColunaOrdenada(null);
      }
    } else {
      setColunaOrdenada(coluna);
      setDirecaoOrdenacao('asc');
    }
  };

  // Ícone de ordenação
  const IconeOrdenacao = ({ coluna }: { coluna: string }) => {
    if (colunaOrdenada !== coluna) {
      return <span style={{ color: '#6c757d', marginLeft: '4px' }}>⇅</span>;
    }
    if (direcaoOrdenacao === 'asc') {
      return <span style={{ color: '#FF6600', marginLeft: '4px' }}>↑</span>;
    }
    if (direcaoOrdenacao === 'desc') {
      return <span style={{ color: '#FF6600', marginLeft: '4px' }}>↓</span>;
    }
    return null;
  };

  // Definir colunas
  const colunas = [
    { key: 'nm_unidade', label: 'Unidade' },
    { key: 'cluster', label: 'Cluster' },
    { key: 'Bonus', label: 'Bônus' },
    { key: 'Pontuação sem bonus', label: 'Pont. s/ Bônus' },
    { key: 'Pontuação com bonus', label: 'Pont. c/ Bônus' },
    { key: 'VVR', label: 'VVR' },
    { key: 'MAC', label: 'MAC' },
    { key: 'Endividamento', label: 'Endiv.' },
    { key: 'NPS', label: 'NPS' },
    { key: 'MC %\n(entrega)', label: 'MC %' },
    { key: 'Satisfação do colaborador - e-NPS', label: 'Satisf. Colab.' },
    { key: '*Conformidades', label: 'Conform.' },
    { key: 'Consultor', label: 'Consultor' }
  ];

  return (
    <div>
      {/* Botão de Exportar */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={exportarParaExcel}
          style={{
            background: 'linear-gradient(to bottom, #9CA3AF 0%, #6B7280 50%, #4B5563 100%)',
            color: '#FFFFFF',
            padding: '6px 20px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            fontFamily: 'Poppins, sans-serif',
            boxShadow: '0 4px 12px rgba(107, 114, 128, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(to bottom, #ACB3BF 0%, #7B8290 50%, #5B6573 100%)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(107, 114, 128, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(to bottom, #9CA3AF 0%, #6B7280 50%, #4B5563 100%)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(107, 114, 128, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>⬇️</span>
          Exportar para Excel
        </button>
      </div>

      {/* Container com scroll vertical */}
      <div style={{ 
        maxHeight: '600px', 
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>
        <table 
          className="w-full" 
          style={{ 
            borderCollapse: 'separate',
            borderSpacing: 0
          }}
        >
          <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
            <tr style={{ backgroundColor: '#2a2f36' }}>
              {colunas.map((coluna) => (
                <th
                  key={coluna.key}
                  onClick={() => handleOrdenar(coluna.key)}
                  style={{
                    color: '#adb5bd',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    padding: '12px 8px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    userSelect: 'none',
                    borderBottom: '2px solid #FF6600',
                    whiteSpace: 'normal',
                    lineHeight: '1.2',
                    transition: 'background-color 0.2s',
                    backgroundColor: '#2a2f36'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#343a40'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2a2f36'}
                >
                  {coluna.label}
                  <IconeOrdenacao coluna={coluna.key} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
          {dadosOrdenados.map((item, index) => (
            <tr
              key={index}
              style={{
                backgroundColor: index % 2 === 0 ? '#343A40' : '#2c3136',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3d4349'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#343A40' : '#2c3136'}
            >
              <td style={{ padding: '12px 8px', color: '#F8F9FA', fontSize: '0.875rem', borderBottom: '1px solid #444', textAlign: 'center' }}>
                {item.nm_unidade}
              </td>
              <td style={{ padding: '12px 8px', color: '#F8F9FA', fontSize: '0.875rem', borderBottom: '1px solid #444', textAlign: 'center' }}>
                {item.cluster}
              </td>
              <td style={{ padding: '12px 8px', color: '#F8F9FA', fontSize: '0.875rem', borderBottom: '1px solid #444', textAlign: 'center' }}>
                {item.Bonus}
              </td>
              <td style={{ padding: '12px 8px', color: '#F8F9FA', fontSize: '0.875rem', borderBottom: '1px solid #444', textAlign: 'center' }}>
                {item['Pontuação sem bonus']}
              </td>
              <td style={{ padding: '12px 8px', color: '#FF6600', fontSize: '0.875rem', fontWeight: 600, borderBottom: '1px solid #444', textAlign: 'center' }}>
                {item['Pontuação com bonus'] || item['Pontuação com Bonus']}
              </td>
              <td style={{ padding: '12px 8px', color: '#F8F9FA', fontSize: '0.875rem', borderBottom: '1px solid #444', textAlign: 'center' }}>
                {item.VVR}
              </td>
              <td style={{ padding: '12px 8px', color: '#F8F9FA', fontSize: '0.875rem', borderBottom: '1px solid #444', textAlign: 'center' }}>
                {item.MAC}
              </td>
              <td style={{ padding: '12px 8px', color: '#F8F9FA', fontSize: '0.875rem', borderBottom: '1px solid #444', textAlign: 'center' }}>
                {item.Endividamento}
              </td>
              <td style={{ padding: '12px 8px', color: '#F8F9FA', fontSize: '0.875rem', borderBottom: '1px solid #444', textAlign: 'center' }}>
                {item.NPS}
              </td>
              <td style={{ padding: '12px 8px', color: '#F8F9FA', fontSize: '0.875rem', borderBottom: '1px solid #444', textAlign: 'center' }}>
                {item['MC %\n(entrega)']}
              </td>
              <td style={{ padding: '12px 8px', color: '#F8F9FA', fontSize: '0.875rem', borderBottom: '1px solid #444', textAlign: 'center' }}>
                {item['Satisfação do colaborador - e-NPS']}
              </td>
              <td style={{ padding: '12px 8px', color: '#F8F9FA', fontSize: '0.875rem', borderBottom: '1px solid #444', textAlign: 'center' }}>
                {item['*Conformidades']}
              </td>
              <td style={{ padding: '12px 8px', color: '#F8F9FA', fontSize: '0.875rem', borderBottom: '1px solid #444', textAlign: 'center' }}>
                {item.Consultor}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      
      {dadosOrdenados.length === 0 && (
        <div className="text-center py-12">
          <p style={{ color: '#adb5bd' }}>Nenhum dado disponível</p>
        </div>
      )}
    </div>
  );
}
