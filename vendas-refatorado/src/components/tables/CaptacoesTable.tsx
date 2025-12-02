/**
 * Tabela de Captações do Funil
 * Mostra origem dos leads agrupada por tipo de captação
 */

import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Download, Search } from 'lucide-react';

interface CaptacaoData {
  origem: string;
  tipo: string;
  percentual: number;
  total: number;
}

interface CaptacoesTableProps {
  dados: CaptacaoData[];
  titulo?: string;
}

export const CaptacoesTable: React.FC<CaptacoesTableProps> = ({
  dados,
  titulo = 'Captações por Origem',
}) => {
  const [busca, setBusca] = useState('');
  const [ordenacao, setOrdenacao] = useState<{ coluna: keyof CaptacaoData; direcao: 'asc' | 'desc' }>({
    coluna: 'total',
    direcao: 'desc',
  });
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  // Filtrar e ordenar dados
  const dadosFiltrados = useMemo(() => {
    let resultado = [...dados];

    // Filtrar por busca
    if (busca) {
      const termoBusca = busca.toLowerCase();
      resultado = resultado.filter(
        item =>
          item.origem.toLowerCase().includes(termoBusca) ||
          item.tipo.toLowerCase().includes(termoBusca)
      );
    }

    // Ordenar
    resultado.sort((a, b) => {
      const valorA = a[ordenacao.coluna];
      const valorB = b[ordenacao.coluna];

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
  }, [dados, busca, ordenacao]);

  // Paginação
  const totalPaginas = Math.ceil(dadosFiltrados.length / itensPorPagina);
  const dadosPaginados = dadosFiltrados.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  // Totais
  const totais = useMemo(() => {
    return dadosFiltrados.reduce(
      (acc, item) => ({
        total: acc.total + item.total,
        percentual: 100,
      }),
      { total: 0, percentual: 0 }
    );
  }, [dadosFiltrados]);

  // Handler de ordenação
  const handleOrdenacao = (coluna: keyof CaptacaoData) => {
    setOrdenacao(prev => ({
      coluna,
      direcao: prev.coluna === coluna && prev.direcao === 'desc' ? 'asc' : 'desc',
    }));
    setPaginaAtual(1);
  };

  // Exportar para CSV
  const exportarCSV = () => {
    const headers = ['Origem do Lead', 'Tipo de Captação', '%', 'Total'];
    const linhas = dadosFiltrados.map(item => [
      item.origem,
      item.tipo,
      `${item.percentual}%`,
      item.total.toString(),
    ]);

    const csv = [headers.join(';'), ...linhas.map(l => l.join(';'))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `captacoes_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Renderizar ícone de ordenação
  const renderIconeOrdenacao = (coluna: keyof CaptacaoData) => {
    if (ordenacao.coluna !== coluna) {
      return <ChevronDown className="w-4 h-4 text-text-muted opacity-30" />;
    }
    return ordenacao.direcao === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-accent-primary" />
    ) : (
      <ChevronDown className="w-4 h-4 text-accent-primary" />
    );
  };

  // Cor do tipo de captação
  const getCorTipo = (tipo: string) => {
    if (tipo.includes('Passiva - Exclusiva')) return 'text-green-400';
    if (tipo.includes('Passiva')) return 'text-blue-400';
    return 'text-orange-400';
  };

  return (
    <div className="space-y-4">
      {/* Título da tabela */}
      <h3 className="section-title" style={{ fontSize: '1rem' }}>
        DESEMPENHO POR CAPTAÇÃO (FUNIL)
      </h3>

      {/* Header com busca e exportação */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar origem..."
            value={busca}
            onChange={e => {
              setBusca(e.target.value);
              setPaginaAtual(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-dark-tertiary border border-dark-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
          />
        </div>
        <button
          onClick={exportarCSV}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Exportar
        </button>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-border">
              <th
                onClick={() => handleOrdenacao('origem')}
                className="text-left py-3 px-4 text-text-muted font-medium cursor-pointer hover:text-text-primary transition-colors"
              >
                <div className="flex items-center gap-1">
                  Origem do Lead
                  {renderIconeOrdenacao('origem')}
                </div>
              </th>
              <th
                onClick={() => handleOrdenacao('tipo')}
                className="text-left py-3 px-4 text-text-muted font-medium cursor-pointer hover:text-text-primary transition-colors"
              >
                <div className="flex items-center gap-1">
                  Tipo de Captação
                  {renderIconeOrdenacao('tipo')}
                </div>
              </th>
              <th
                onClick={() => handleOrdenacao('percentual')}
                className="text-right py-3 px-4 text-text-muted font-medium cursor-pointer hover:text-text-primary transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  %
                  {renderIconeOrdenacao('percentual')}
                </div>
              </th>
              <th
                onClick={() => handleOrdenacao('total')}
                className="text-right py-3 px-4 text-text-muted font-medium cursor-pointer hover:text-text-primary transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  Total
                  {renderIconeOrdenacao('total')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {dadosPaginados.length > 0 ? (
              dadosPaginados.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-dark-border/50 hover:bg-dark-tertiary/50 transition-colors"
                >
                  <td className="py-3 px-4 text-text-primary">{item.origem}</td>
                  <td className={`py-3 px-4 ${getCorTipo(item.tipo)}`}>{item.tipo}</td>
                  <td className="py-3 px-4 text-right text-text-secondary">{item.percentual.toFixed(1)}%</td>
                  <td className="py-3 px-4 text-right text-text-primary font-medium">{item.total.toLocaleString('pt-BR')}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-8 text-center text-text-muted">
                  Nenhum dado encontrado
                </td>
              </tr>
            )}
          </tbody>
          {dadosPaginados.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-dark-border bg-dark-tertiary/30">
                <td colSpan={2} className="py-3 px-4 text-text-primary font-bold">
                  TOTAL
                </td>
                <td className="py-3 px-4 text-right text-text-primary font-bold">100%</td>
                <td className="py-3 px-4 text-right text-accent-primary font-bold">
                  {totais.total.toLocaleString('pt-BR')}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-muted">
            Mostrando {(paginaAtual - 1) * itensPorPagina + 1} a{' '}
            {Math.min(paginaAtual * itensPorPagina, dadosFiltrados.length)} de {dadosFiltrados.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
              disabled={paginaAtual === 1}
              className="px-3 py-1 rounded bg-dark-tertiary text-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-border transition-colors"
            >
              Anterior
            </button>
            <span className="text-text-muted">
              {paginaAtual} / {totalPaginas}
            </span>
            <button
              onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
              disabled={paginaAtual === totalPaginas}
              className="px-3 py-1 rounded bg-dark-tertiary text-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-border transition-colors"
            >
              Próximo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
