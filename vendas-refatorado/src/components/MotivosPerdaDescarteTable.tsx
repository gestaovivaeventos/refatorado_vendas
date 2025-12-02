'use client';

import React, { useState, useMemo } from 'react';

interface MotivoItem {
  motivo: string;
  total: number;
  percentual: number;
}

interface ConcorrenteItem {
  concorrente: string;
  total: number;
  percentual: number;
}

interface MotivosPerdaDescarteTableProps {
  motivosPerda: MotivoItem[];
  motivosDescarte: MotivoItem[];
  concorrentes: ConcorrenteItem[];
}

const TabelaMotivos: React.FC<{
  titulo: string;
  colunaNome: string;
  dados: MotivoItem[];
  onExport: () => void;
}> = ({ titulo, colunaNome, dados, onExport }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  
  const totalPages = Math.ceil(dados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const dadosPaginados = dados.slice(startIndex, endIndex);
  
  const mensagemVazia = colunaNome.includes('Perda') 
    ? 'Nenhum motivo de perda encontrado no período selecionado'
    : colunaNome.includes('Descarte')
    ? 'Nenhum descarte encontrado no período selecionado'
    : 'Nenhum registro disponível na tabela';

  return (
    <div className="bg-dark-tertiary rounded-lg overflow-hidden flex flex-col h-full">
      {/* Header da tabela */}
      <div className="px-4 py-3 border-b border-dark-border flex items-center justify-between">
        <h3 className="text-text-primary text-xs font-bold uppercase tracking-wide">
          {titulo}
        </h3>
        {dados.length > 0 && (
          <button
            onClick={onExport}
            className="text-xs text-primary-500 hover:text-primary-400 transition-colors"
            title="Exportar para Excel"
          >
            📥 Exportar
          </button>
        )}
      </div>
      
      {/* Tabela */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-dark-secondary sticky top-0">
            <tr>
              <th className="text-left text-text-muted text-xs font-medium px-4 py-2 uppercase tracking-wide">
                {colunaNome}
              </th>
              <th className="text-center text-text-muted text-xs font-medium px-2 py-2 uppercase tracking-wide w-16">
                %
              </th>
              <th className="text-center text-text-muted text-xs font-medium px-4 py-2 uppercase tracking-wide w-16">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {dados.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center text-text-muted py-8 px-4">
                  {mensagemVazia}
                </td>
              </tr>
            ) : (
              dadosPaginados.map((item, index) => (
                <tr 
                  key={item.motivo}
                  className={`
                    border-b border-dark-border/50 hover:bg-dark-secondary/50 transition-colors
                    ${index % 2 === 0 ? 'bg-dark-tertiary' : 'bg-dark-tertiary/70'}
                  `}
                >
                  <td className="text-left text-text-primary text-sm px-4 py-2">
                    {item.motivo}
                  </td>
                  <td className="text-center text-text-secondary text-sm px-2 py-2">
                    {item.percentual.toFixed(1)}%
                  </td>
                  <td className="text-center text-text-primary text-sm font-medium px-4 py-2">
                    {item.total}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Paginação */}
      {dados.length > itemsPerPage && (
        <div className="px-4 py-2 border-t border-dark-border flex items-center justify-between text-xs text-text-muted">
          <span>
            Mostrando {startIndex + 1} a {Math.min(endIndex, dados.length)} de {dados.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 rounded bg-dark-secondary hover:bg-dark-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ‹
            </button>
            <span className="px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 rounded bg-dark-secondary hover:bg-dark-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const MotivosPerdaDescarteTable: React.FC<MotivosPerdaDescarteTableProps> = ({
  motivosPerda,
  motivosDescarte,
  concorrentes,
}) => {
  // Exportar para CSV
  const exportarCSV = (dados: Array<MotivoItem | ConcorrenteItem>, nomeArquivo: string, colunaNome: string) => {
    if (dados.length === 0) return;
    
    const headers = [colunaNome, '%', 'Total'];
    const rows = dados.map(item => {
      const nome = 'motivo' in item ? item.motivo : item.concorrente;
      return [
        nome,
        item.percentual.toFixed(1),
        item.total.toString()
      ];
    });
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${nomeArquivo}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.csv`;
    link.click();
  };

  // Converter concorrentes para o formato da tabela
  const concorrentesParaTabela: MotivoItem[] = concorrentes.map(c => ({
    motivo: c.concorrente,
    total: c.total,
    percentual: c.percentual
  }));

  return (
    <div className="space-y-4">
      {/* Linha 1: Motivos de Perda e Descarte lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[350px]">
        <TabelaMotivos
          titulo="Motivos de Perda"
          colunaNome="Motivo de Perda"
          dados={motivosPerda}
          onExport={() => exportarCSV(motivosPerda, 'Relatorio_Motivos_Perda', 'Motivo de Perda')}
        />
        <TabelaMotivos
          titulo="Motivos do Descarte"
          colunaNome="Motivo do Descarte"
          dados={motivosDescarte}
          onExport={() => exportarCSV(motivosDescarte, 'Relatorio_Descartes', 'Motivo do Descarte')}
        />
      </div>

      {/* Linha 2: Tabela de Concorrentes */}
      <div className="h-[300px]">
        <TabelaMotivos
          titulo="Concorrentes (Leads Perdidos)"
          colunaNome="Concorrente"
          dados={concorrentesParaTabela}
          onExport={() => exportarCSV(concorrentes, 'Relatorio_Concorrentes', 'Concorrente')}
        />
      </div>
    </div>
  );
};

export default MotivosPerdaDescarteTable;
