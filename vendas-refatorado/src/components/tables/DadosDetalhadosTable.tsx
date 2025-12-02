/**
 * Componente DadosDetalhadosTable - Tabela de dados detalhados por unidade
 * Replica o estilo original do dashboard (sem medalhas e mini-gráficos)
 */

import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Download } from 'lucide-react';

interface DadosDetalhadosItem {
  posicao: number;
  nome: string;
  periodo?: string;
  valorRealizado: number;
  valorMeta: number;
  percentual: number;
}

type TipoVenda = 'total' | 'vendas' | 'posvendas';

interface DadosDetalhadosTableProps {
  data: DadosDetalhadosItem[];
  title: string;
  tipoSelecionado: TipoVenda;
  onTipoChange: (tipo: TipoVenda) => void;
  periodoLabel?: string;
}

export const DadosDetalhadosTable: React.FC<DadosDetalhadosTableProps> = ({
  data,
  title,
  tipoSelecionado,
  onTipoChange,
  periodoLabel = '',
}) => {
  const [busca, setBusca] = useState('');
  const [ordenacao, setOrdenacao] = useState<{ coluna: string; direcao: 'asc' | 'desc' }>({
    coluna: 'percentual',
    direcao: 'desc',
  });
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  // Label do tipo selecionado
  const getTipoLabel = () => {
    switch (tipoSelecionado) {
      case 'vendas': return '(Vendas)';
      case 'posvendas': return '(Pós Venda)';
      default: return '(Total)';
    }
  };

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return 'R$ ' + value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Formatar percentual
  const formatPercent = (value: number) => {
    return (value * 100).toFixed(1).replace('.', ',') + '%';
  };

  // Calcular totais gerais
  const totais = useMemo(() => {
    const totalRealizado = data.reduce((sum, item) => sum + item.valorRealizado, 0);
    const totalMeta = data.reduce((sum, item) => sum + item.valorMeta, 0);
    const atingimentoTotal = totalMeta > 0 ? totalRealizado / totalMeta : 0;
    return { totalRealizado, totalMeta, atingimentoTotal };
  }, [data]);

  // Filtrar e ordenar dados
  const dadosFiltrados = useMemo(() => {
    let resultado = [...data];

    // Filtrar por busca
    if (busca) {
      const termoBusca = busca.toLowerCase();
      resultado = resultado.filter(item =>
        item.nome.toLowerCase().includes(termoBusca)
      );
    }

    // Ordenar
    resultado.sort((a, b) => {
      const valorA = (a as any)[ordenacao.coluna];
      const valorB = (b as any)[ordenacao.coluna];

      if (typeof valorA === 'string' && typeof valorB === 'string') {
        return ordenacao.direcao === 'asc'
          ? valorA.localeCompare(valorB)
          : valorB.localeCompare(valorA);
      }

      if (typeof valorA === 'number' && typeof valorB === 'number') {
        return ordenacao.direcao === 'asc' ? valorA - valorB : valorB - valorA;
      }

      return 0;
    });

    return resultado;
  }, [data, busca, ordenacao]);

  // Paginação
  const totalPaginas = Math.ceil(dadosFiltrados.length / itensPorPagina) || 1;
  const startIndex = (paginaAtual - 1) * itensPorPagina;
  const endIndex = startIndex + itensPorPagina;
  const dadosPaginados = dadosFiltrados.slice(startIndex, endIndex);

  // Alterar ordenação
  const handleOrdenacao = (coluna: string) => {
    setOrdenacao(prev => ({
      coluna,
      direcao: prev.coluna === coluna && prev.direcao === 'asc' ? 'desc' : 'asc',
    }));
    setPaginaAtual(1);
  };

  // Exportar para CSV
  const exportarCSV = () => {
    const tipoLabel = getTipoLabel();
    const headers = ['Unidade', 'Período', `VVR Realizado ${tipoLabel}`, `Meta VVR ${tipoLabel}`, `Atingimento VVR ${tipoLabel}`];
    const linhas = dadosFiltrados.map(item => [
      item.nome,
      item.periodo || periodoLabel,
      formatCurrency(item.valorRealizado),
      formatCurrency(item.valorMeta),
      formatPercent(item.percentual),
    ]);
    
    // Adicionar linha de total
    linhas.push([
      'TOTAL GERAL',
      periodoLabel,
      formatCurrency(totais.totalRealizado),
      formatCurrency(totais.totalMeta),
      formatPercent(totais.atingimentoTotal),
    ]);

    const csv = [headers.join(';'), ...linhas.map(l => l.join(';'))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dados_detalhados_${tipoSelecionado}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Renderizar ícone de ordenação
  const renderIconeOrdenacao = (coluna: string) => {
    if (ordenacao.coluna !== coluna) {
      return <span className="ml-1 text-gray-500">↕</span>;
    }
    return ordenacao.direcao === 'asc' ? (
      <span className="ml-1">↑</span>
    ) : (
      <span className="ml-1">↓</span>
    );
  };

  // Estilos dos botões de tipo (igual ao original)
  const getBotaoStyle = (tipo: TipoVenda) => {
    const isActive = tipoSelecionado === tipo;
    if (isActive) {
      return {
        backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 22%), linear-gradient(180deg, #ff8a33 0%, #FF6600 50%, #e65500 100%)',
        backgroundSize: '100% 100%, 100% 100%',
        backgroundRepeat: 'no-repeat',
        color: '#ffffff',
        border: '1px solid rgba(0,0,0,0.6)',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        boxShadow: '0 8px 18px rgba(0,0,0,0.45), inset 0 2px 6px rgba(255,255,255,0.02)',
      };
    }
    return {
      background: 'linear-gradient(180deg, #3a3f44 0%, #2e3236 100%)',
      color: '#e9ecef',
      border: '1px solid rgba(0,0,0,0.45)',
      boxShadow: '0 4px 10px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.02)',
    };
  };

  const tipoLabel = getTipoLabel();

  return (
    <div className="space-y-4">
      {/* Título */}
      <h2 className="section-title">
        {title}
      </h2>

      {/* Botões de seleção de tipo */}
      <div className="flex flex-wrap gap-2.5 mb-5">
        {(['total', 'vendas', 'posvendas'] as TipoVenda[]).map((tipo) => (
          <button
            key={tipo}
            onClick={() => {
              onTipoChange(tipo);
              setPaginaAtual(1);
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 hover:brightness-105 hover:-translate-y-0.5"
            style={getBotaoStyle(tipo)}
          >
            {tipo === 'total' ? 'Total' : tipo === 'vendas' ? 'Vendas' : 'Pós Venda'}
          </button>
        ))}
      </div>

      {/* Barra de ferramentas */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={exportarCSV}
          className="px-4 py-1.5 text-sm font-medium rounded transition-colors"
          style={{
            backgroundColor: '#495057',
            color: '#F8F9FA',
            border: '1px solid #ADB5BD',
            borderRadius: '6px',
          }}
        >
          Exportar para Excel
        </button>

        <div className="flex items-center">
          <span className="text-[#adb5bd] text-sm mr-2">Pesquisar:</span>
          <input
            type="text"
            value={busca}
            onChange={e => {
              setBusca(e.target.value);
              setPaginaAtual(1);
            }}
            className="px-2 py-1 rounded text-sm"
            style={{
              backgroundColor: '#212529',
              color: '#F8F9FA',
              border: '1px solid #495057',
              borderRadius: '6px',
              minWidth: '180px',
            }}
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left" style={{ color: '#F8F9FA' }}>
          <thead>
            <tr>
              <th
                onClick={() => handleOrdenacao('nome')}
                className="cursor-pointer px-3 py-2 text-left border-b border-[#495057] hover:bg-[rgba(255,255,255,0.05)]"
                style={{ fontWeight: 600 }}
              >
                Unidade {renderIconeOrdenacao('nome')}
              </th>
              <th
                onClick={() => handleOrdenacao('periodo')}
                className="cursor-pointer px-3 py-2 text-left border-b border-[#495057] hover:bg-[rgba(255,255,255,0.05)]"
                style={{ fontWeight: 600 }}
              >
                Período {renderIconeOrdenacao('periodo')}
              </th>
              <th
                onClick={() => handleOrdenacao('valorRealizado')}
                className="cursor-pointer px-3 py-2 text-left border-b border-[#495057] hover:bg-[rgba(255,255,255,0.05)]"
                style={{ fontWeight: 600 }}
              >
                VVR Realizado {tipoLabel} {renderIconeOrdenacao('valorRealizado')}
              </th>
              <th
                onClick={() => handleOrdenacao('valorMeta')}
                className="cursor-pointer px-3 py-2 text-left border-b border-[#495057] hover:bg-[rgba(255,255,255,0.05)]"
                style={{ fontWeight: 600 }}
              >
                Meta VVR {tipoLabel} {renderIconeOrdenacao('valorMeta')}
              </th>
              <th
                onClick={() => handleOrdenacao('percentual')}
                className="cursor-pointer px-3 py-2 text-left border-b border-[#495057] hover:bg-[rgba(255,255,255,0.05)]"
                style={{ fontWeight: 600 }}
              >
                Atingimento VVR {tipoLabel} {renderIconeOrdenacao('percentual')}
              </th>
            </tr>
          </thead>
          <tbody>
            {dadosPaginados.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-10 text-[#adb5bd]"
                >
                  Nenhum registro encontrado
                </td>
              </tr>
            ) : (
              <>
                {dadosPaginados.map((item, index) => (
                  <tr
                    key={`${item.nome}-${index}`}
                    className="hover:bg-[rgba(255,255,255,0.03)] border-b border-[#343a40]"
                  >
                    <td className="px-3 py-2">{item.nome}</td>
                    <td className="px-3 py-2">{item.periodo || periodoLabel}</td>
                    <td className="px-3 py-2">{formatCurrency(item.valorRealizado)}</td>
                    <td className="px-3 py-2">{formatCurrency(item.valorMeta)}</td>
                    <td className="px-3 py-2">{formatPercent(item.percentual)}</td>
                  </tr>
                ))}
                
                {/* Linha de total */}
                <tr
                  className="border-t-2 border-[#ff6600]"
                  style={{ backgroundColor: '#2c3035' }}
                >
                  <td
                    className="px-3 py-2 font-bold"
                    style={{ color: '#ff6600' }}
                  >
                    TOTAL GERAL
                  </td>
                  <td
                    className="px-3 py-2 font-bold"
                    style={{ color: '#ff6600' }}
                  >
                    {periodoLabel}
                  </td>
                  <td
                    className="px-3 py-2 font-bold"
                    style={{ color: '#ff6600' }}
                  >
                    {formatCurrency(totais.totalRealizado)}
                  </td>
                  <td
                    className="px-3 py-2 font-bold"
                    style={{ color: '#ff6600' }}
                  >
                    {formatCurrency(totais.totalMeta)}
                  </td>
                  <td
                    className="px-3 py-2 font-bold"
                    style={{ color: '#ff6600' }}
                  >
                    {formatPercent(totais.atingimentoTotal)}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div
        className="flex items-center justify-between pt-2"
        style={{ color: '#adb5bd', fontSize: '0.85rem' }}
      >
        <span>
          Mostrando {dadosFiltrados.length > 0 ? startIndex + 1 : 0} a {Math.min(endIndex, dadosFiltrados.length)} de {dadosFiltrados.length} entradas
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPaginaAtual(1)}
            disabled={paginaAtual === 1}
            className="px-2 py-1 rounded transition-colors disabled:opacity-50"
            style={{
              color: '#F8F9FA',
              border: '1px solid #495057',
            }}
          >
            Primeiro
          </button>
          <button
            onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
            disabled={paginaAtual === 1}
            className="px-2 py-1 rounded transition-colors disabled:opacity-50"
            style={{
              color: '#F8F9FA',
              border: '1px solid #495057',
            }}
          >
            Anterior
          </button>
          <span
            className="px-3 py-1 rounded"
            style={{
              background: '#FF6600',
              borderColor: '#FF6600',
              color: '#ffffff',
            }}
          >
            {paginaAtual}
          </span>
          <button
            onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
            disabled={paginaAtual === totalPaginas}
            className="px-2 py-1 rounded transition-colors disabled:opacity-50"
            style={{
              color: '#F8F9FA',
              border: '1px solid #495057',
            }}
          >
            Próximo
          </button>
          <button
            onClick={() => setPaginaAtual(totalPaginas)}
            disabled={paginaAtual === totalPaginas}
            className="px-2 py-1 rounded transition-colors disabled:opacity-50"
            style={{
              color: '#F8F9FA',
              border: '1px solid #495057',
            }}
          >
            Último
          </button>
        </div>
      </div>
    </div>
  );
};

export default DadosDetalhadosTable;
