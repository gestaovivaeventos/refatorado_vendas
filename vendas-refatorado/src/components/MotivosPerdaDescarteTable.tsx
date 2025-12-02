'use client';

import React, { useState } from 'react';
import { Download } from 'lucide-react';

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

// Componente de tabela individual no estilo original
const TabelaMotivos: React.FC<{
  titulo: string;
  colunaNome: string;
  dados: MotivoItem[];
  onExport: () => void;
}> = ({ titulo, colunaNome, dados, onExport }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  
  const totalPages = Math.ceil(dados.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const dadosPaginados = dados.slice(startIndex, endIndex);
  
  const mensagemVazia = colunaNome.includes('Perda') 
    ? 'Nenhum motivo de perda encontrado no período selecionado'
    : colunaNome.includes('Descarte')
    ? 'Nenhum descarte encontrado no período selecionado'
    : 'Nenhum registro disponível na tabela';

  // Calcular classe de calor baseada no percentual
  const getHeatClass = (percentual: number) => {
    if (percentual >= 30) return 'heat-high';
    if (percentual >= 15) return 'heat-medium';
    return 'heat-low';
  };

  return (
    <div 
      className="table-card flex flex-col"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
        border: '1px solid rgba(255,255,255,0.03)',
        borderRadius: '8px',
        padding: '14px',
        boxShadow: '0 6px 18px rgba(0,0,0,0.45)',
        minHeight: '340px',
      }}
    >
      {/* Título da tabela */}
      <h3 
        className="section-title"
        style={{ fontSize: '1rem', marginBottom: '8px' }}
      >
        {titulo}
      </h3>

      {/* Botão de exportar */}
      {dados.length > 0 && (
        <div className="mb-2">
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded transition-colors"
            style={{
              background: 'linear-gradient(180deg, #3a3f44 0%, #2e3236 100%)',
              color: '#e9ecef',
              border: '1px solid rgba(0,0,0,0.45)',
            }}
          >
            <Download className="w-3 h-3" />
            Exportar para Excel
          </button>
        </div>
      )}
      
      {/* Tabela */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse" style={{ fontSize: '0.95rem' }}>
          <thead>
            <tr>
              <th 
                className="text-left sticky top-0 z-10"
                style={{
                  background: 'linear-gradient(135deg, #495057 0%, #6c757d 100%)',
                  color: '#ffc107',
                  padding: '12px 10px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  fontSize: '0.85rem',
                  letterSpacing: '0.5px',
                  border: '1px solid #6c757d',
                  width: '60%',
                }}
              >
                {colunaNome}
              </th>
              <th 
                className="text-center sticky top-0 z-10"
                style={{
                  background: 'linear-gradient(135deg, #495057 0%, #6c757d 100%)',
                  color: '#ffc107',
                  padding: '12px 10px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  fontSize: '0.85rem',
                  letterSpacing: '0.5px',
                  border: '1px solid #6c757d',
                  width: '20%',
                }}
              >
                %
              </th>
              <th 
                className="text-center sticky top-0 z-10"
                style={{
                  background: 'linear-gradient(135deg, #495057 0%, #6c757d 100%)',
                  color: '#ffc107',
                  padding: '12px 10px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  fontSize: '0.85rem',
                  letterSpacing: '0.5px',
                  border: '1px solid #6c757d',
                  width: '20%',
                }}
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {dados.length === 0 ? (
              <tr>
                <td 
                  colSpan={3} 
                  className="text-center"
                  style={{
                    padding: '40px 10px',
                    color: '#f8f9fa',
                    border: '1px solid #495057',
                  }}
                >
                  {mensagemVazia}
                </td>
              </tr>
            ) : (
              dadosPaginados.map((item, index) => (
                <tr 
                  key={item.motivo}
                  className="hover:bg-[rgba(255,193,7,0.1)] transition-colors"
                >
                  <td 
                    className="text-left"
                    style={{
                      padding: '10px',
                      border: '1px solid #495057',
                      color: '#f8f9fa',
                      fontWeight: 500,
                      fontSize: '0.9rem',
                      maxWidth: '200px',
                      wordWrap: 'break-word',
                    }}
                  >
                    {item.motivo}
                  </td>
                  <td 
                    className="text-center"
                    style={{
                      padding: '10px',
                      border: '1px solid #495057',
                      color: '#f8f9fa',
                      fontWeight: 500,
                    }}
                  >
                    {item.percentual.toFixed(1)}%
                  </td>
                  <td 
                    className="text-center"
                    style={{
                      padding: '10px',
                      border: '1px solid #495057',
                      color: '#f8f9fa',
                      fontWeight: 600,
                    }}
                  >
                    {item.total}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Paginação */}
      {dados.length > 0 && (
        <div 
          className="flex items-center justify-between mt-2 pt-2"
          style={{
            borderTop: '1px solid #495057',
            color: '#adb5bd',
            fontSize: '0.8rem',
          }}
        >
          <span>
            Mostrando {Math.min(startIndex + 1, dados.length)} a {Math.min(endIndex, dados.length)} de {dados.length} entradas
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded transition-colors disabled:opacity-50"
              style={{
                background: currentPage === 1 ? '#343a40' : '#495057',
                color: '#f8f9fa',
                border: '1px solid #6c757d',
              }}
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded transition-colors disabled:opacity-50"
              style={{
                background: currentPage === totalPages ? '#343a40' : '#495057',
                color: '#f8f9fa',
                border: '1px solid #6c757d',
              }}
            >
              Próximo
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
    <div className="space-y-5">
      {/* Linha 1: Motivos de Perda e Descarte lado a lado */}
      <div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-5"
        style={{ alignItems: 'stretch' }}
      >
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
      <TabelaMotivos
        titulo="Concorrentes (Leads Perdidos)"
        colunaNome="Concorrente"
        dados={concorrentesParaTabela}
        onExport={() => exportarCSV(concorrentes, 'Relatorio_Concorrentes', 'Concorrente')}
      />
    </div>
  );
};

export default MotivosPerdaDescarteTable;
