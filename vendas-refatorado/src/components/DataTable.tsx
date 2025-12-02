import React, { useMemo, useState } from 'react';

interface Column {
  key: string;
  title: string;
  align?: 'left' | 'center' | 'right';
  format?: (value: any) => string;
  sortable?: boolean;
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, any>[];
  title?: string;
  pageSize?: number;
  exportable?: boolean;
  searchable?: boolean;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  title,
  pageSize = 10,
  exportable = true,
  searchable = true,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filtrar dados
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(row =>
      columns.some(col => {
        const value = row[col.key];
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm, columns]);

  // Ordenar dados
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      const aStr = String(aVal || '').toLowerCase();
      const bStr = String(bVal || '').toLowerCase();
      return sortDirection === 'asc' 
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Paginar dados
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Exportar para Excel/CSV
  const handleExport = () => {
    const headers = columns.map(c => c.title).join('\t');
    const rows = sortedData.map(row =>
      columns.map(col => {
        const value = row[col.key];
        return col.format ? col.format(value) : String(value || '');
      }).join('\t')
    ).join('\n');
    
    const content = `${headers}\n${rows}`;
    const blob = new Blob([content], { type: 'text/tab-separated-values;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title || 'dados'}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.tsv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSort = (columnKey: string) => {
    const column = columns.find(c => c.key === columnKey);
    if (!column?.sortable) return;
    
    if (sortColumn === columnKey) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const tableStyles = {
    container: {
      width: '100%',
      overflow: 'auto',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px',
      flexWrap: 'wrap' as const,
      gap: '12px',
    },
    exportButton: {
      padding: '8px 16px',
      backgroundColor: 'transparent',
      border: '1px solid #495057',
      borderRadius: '4px',
      color: '#F8F9FA',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    searchInput: {
      padding: '8px 12px',
      backgroundColor: '#343A40',
      border: '1px solid #495057',
      borderRadius: '4px',
      color: '#F8F9FA',
      fontSize: '14px',
      minWidth: '200px',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      fontSize: '14px',
    },
    th: {
      padding: '12px 16px',
      backgroundColor: '#343A40',
      color: '#F8F9FA',
      fontWeight: 600,
      textAlign: 'left' as const,
      borderBottom: '2px solid #495057',
      cursor: 'pointer',
      userSelect: 'none' as const,
      whiteSpace: 'nowrap' as const,
    },
    td: {
      padding: '12px 16px',
      borderBottom: '1px solid #495057',
      color: '#F8F9FA',
    },
    pagination: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '16px',
      fontSize: '14px',
      color: '#ADB5BD',
    },
    paginationButton: {
      padding: '6px 12px',
      backgroundColor: 'transparent',
      border: '1px solid #495057',
      borderRadius: '4px',
      color: '#F8F9FA',
      cursor: 'pointer',
      marginLeft: '8px',
    },
    paginationButtonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    sortIcon: {
      marginLeft: '6px',
      fontSize: '12px',
    },
  };

  return (
    <div style={tableStyles.container}>
      {/* Header com Exportar e Pesquisar */}
      <div style={tableStyles.header}>
        {exportable && (
          <button 
            style={tableStyles.exportButton}
            onClick={handleExport}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#FF6600';
              e.currentTarget.style.color = '#FF6600';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#495057';
              e.currentTarget.style.color = '#F8F9FA';
            }}
          >
            Exportar para Excel
          </button>
        )}
        
        {searchable && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#ADB5BD' }}>Pesquisar:</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={tableStyles.searchInput}
              placeholder=""
            />
          </div>
        )}
      </div>

      {/* Tabela */}
      <table style={tableStyles.table}>
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                style={{
                  ...tableStyles.th,
                  textAlign: col.align || 'left',
                  cursor: col.sortable !== false ? 'pointer' : 'default',
                }}
                onClick={() => handleSort(col.key)}
              >
                {col.title}
                {col.sortable !== false && (
                  <span style={tableStyles.sortIcon}>
                    {sortColumn === col.key 
                      ? (sortDirection === 'asc' ? '▲' : '▼')
                      : '◆'
                    }
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.length === 0 ? (
            <tr>
              <td 
                colSpan={columns.length} 
                style={{ ...tableStyles.td, textAlign: 'center', color: '#ADB5BD' }}
              >
                Nenhum registro disponível na tabela
              </td>
            </tr>
          ) : (
            paginatedData.map((row, rowIndex) => (
              <tr 
                key={rowIndex}
                style={{
                  backgroundColor: rowIndex % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                }}
              >
                {columns.map(col => (
                  <td
                    key={col.key}
                    style={{
                      ...tableStyles.td,
                      textAlign: col.align || 'left',
                    }}
                  >
                    {col.format ? col.format(row[col.key]) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Paginação */}
      <div style={tableStyles.pagination}>
        <span>
          Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, sortedData.length)} de {sortedData.length} entradas
        </span>
        <div>
          <button
            style={{
              ...tableStyles.paginationButton,
              ...(currentPage === 1 ? tableStyles.paginationButtonDisabled : {}),
            }}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <button
            style={{
              ...tableStyles.paginationButton,
              ...(currentPage === totalPages ? tableStyles.paginationButtonDisabled : {}),
            }}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Próximo
          </button>
        </div>
      </div>
    </div>
  );
};
