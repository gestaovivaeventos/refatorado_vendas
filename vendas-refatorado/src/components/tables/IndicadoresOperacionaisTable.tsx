/**
 * Componente IndicadoresOperacionaisTable - Tabela de atingimento de indicadores operacionais
 * Replica o estilo original do dashboard
 */

import React, { useState, useMemo } from 'react';

interface IndicadorItem {
  unidade: string;
  leadsPercent: number;
  reunioesPercent: number;
  contratosPercent: number;
  adesoesPercent: number;
}

interface IndicadoresOperacionaisTableProps {
  data: IndicadorItem[];
}

export const IndicadoresOperacionaisTable: React.FC<IndicadoresOperacionaisTableProps> = ({
  data,
}) => {
  const [busca, setBusca] = useState('');
  const [ordenacao, setOrdenacao] = useState<{ coluna: string; direcao: 'asc' | 'desc' }>({
    coluna: 'unidade',
    direcao: 'asc',
  });
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  // Formatar percentual
  const formatPercent = (value: number) => {
    return (value * 100).toFixed(1).replace('.', ',') + '%';
  };

  // Filtrar e ordenar dados
  const dadosFiltrados = useMemo(() => {
    let resultado = [...data];

    // Filtrar por busca
    if (busca) {
      const termoBusca = busca.toLowerCase();
      resultado = resultado.filter(item =>
        item.unidade.toLowerCase().includes(termoBusca)
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
    const headers = ['Unidade', 'Leads (%)', 'Reuniões (%)', 'Contratos (%)', 'Adesões (%)'];
    const linhas = dadosFiltrados.map(item => [
      item.unidade,
      formatPercent(item.leadsPercent),
      formatPercent(item.reunioesPercent),
      formatPercent(item.contratosPercent),
      formatPercent(item.adesoesPercent),
    ]);

    const csv = [headers.join(';'), ...linhas.map(l => l.join(';'))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `indicadores_operacionais_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.csv`;
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

  // Gerar números das páginas para exibição
  const getPaginasVisiveis = () => {
    const paginas: (number | string)[] = [];
    const maxPaginas = 5;
    
    if (totalPaginas <= maxPaginas) {
      for (let i = 1; i <= totalPaginas; i++) paginas.push(i);
    } else {
      if (paginaAtual <= 3) {
        for (let i = 1; i <= maxPaginas; i++) paginas.push(i);
      } else if (paginaAtual >= totalPaginas - 2) {
        for (let i = totalPaginas - maxPaginas + 1; i <= totalPaginas; i++) paginas.push(i);
      } else {
        for (let i = paginaAtual - 2; i <= paginaAtual + 2; i++) paginas.push(i);
      }
    }
    
    return paginas;
  };

  return (
    <div className="space-y-4">
      {/* Título */}
      <h2 className="section-title">
        ATINGIMENTO INDICADORES OPERACIONAIS
      </h2>

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
            placeholder="Pesquisar..."
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
                onClick={() => handleOrdenacao('unidade')}
                className="cursor-pointer px-3 py-2 text-left border-b border-[#495057] hover:bg-[rgba(255,255,255,0.05)]"
                style={{ fontWeight: 600 }}
              >
                Unidade {renderIconeOrdenacao('unidade')}
              </th>
              <th
                onClick={() => handleOrdenacao('leadsPercent')}
                className="cursor-pointer px-3 py-2 text-left border-b border-[#495057] hover:bg-[rgba(255,255,255,0.05)]"
                style={{ fontWeight: 600 }}
              >
                Leads (%) {renderIconeOrdenacao('leadsPercent')}
              </th>
              <th
                onClick={() => handleOrdenacao('reunioesPercent')}
                className="cursor-pointer px-3 py-2 text-left border-b border-[#495057] hover:bg-[rgba(255,255,255,0.05)]"
                style={{ fontWeight: 600 }}
              >
                Reuniões (%) {renderIconeOrdenacao('reunioesPercent')}
              </th>
              <th
                onClick={() => handleOrdenacao('contratosPercent')}
                className="cursor-pointer px-3 py-2 text-left border-b border-[#495057] hover:bg-[rgba(255,255,255,0.05)]"
                style={{ fontWeight: 600 }}
              >
                Contratos (%) {renderIconeOrdenacao('contratosPercent')}
              </th>
              <th
                onClick={() => handleOrdenacao('adesoesPercent')}
                className="cursor-pointer px-3 py-2 text-left border-b border-[#495057] hover:bg-[rgba(255,255,255,0.05)]"
                style={{ fontWeight: 600 }}
              >
                Adesões (%) {renderIconeOrdenacao('adesoesPercent')}
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
              dadosPaginados.map((item, index) => (
                <tr
                  key={`${item.unidade}-${index}`}
                  className="hover:bg-[rgba(255,255,255,0.03)] border-b border-[#343a40]"
                >
                  <td className="px-3 py-2">{item.unidade}</td>
                  <td className="px-3 py-2">{formatPercent(item.leadsPercent)}</td>
                  <td className="px-3 py-2">{formatPercent(item.reunioesPercent)}</td>
                  <td className="px-3 py-2">{formatPercent(item.contratosPercent)}</td>
                  <td className="px-3 py-2">{formatPercent(item.adesoesPercent)}</td>
                </tr>
              ))
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
          
          {getPaginasVisiveis().map((pagina, idx) => (
            <button
              key={idx}
              onClick={() => typeof pagina === 'number' && setPaginaAtual(pagina)}
              className="px-3 py-1 rounded transition-colors"
              style={{
                background: paginaAtual === pagina ? '#FF6600' : 'transparent',
                borderColor: paginaAtual === pagina ? '#FF6600' : '#495057',
                color: paginaAtual === pagina ? '#ffffff' : '#F8F9FA',
                border: '1px solid',
              }}
            >
              {pagina}
            </button>
          ))}
          
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
        </div>
      </div>
    </div>
  );
};

export default IndicadoresOperacionaisTable;
