/**
 * Hook para buscar e gerenciar dados de vendas/adesões
 */

import { useState, useEffect, useCallback } from 'react';
import { Adesao } from '@/types/vendas.types';
import { SPREADSHEET_IDS, SHEET_NAMES, GOOGLE_API_KEY } from '@/config/app.config';
import { parseDate } from '@/utils/periodo';

interface UseSalesDataReturn {
  data: Adesao[];
  dados: Adesao[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para buscar dados de vendas
 */
export function useSalesData(): UseSalesDataReturn {
  const [dados, setDados] = useState<Adesao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_IDS.SALES}/values/${SHEET_NAMES.ADESOES}?key=${GOOGLE_API_KEY}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Falha ao buscar dados de vendas');
      }

      const data = await response.json();
      const rows = data.values || [];
      
      if (rows.length < 2) {
        setDados([]);
        return;
      }

      // Mapear headers
      const headers = rows[0].map((h: string) => String(h).trim().toLowerCase());
      
      // Encontrar índices das colunas
      const indices = {
        unidade: headers.indexOf('nm_unidade'),
        data: headers.indexOf('dt_cadastro_integrante'),
        valor: headers.indexOf('vl_plano'),
        tipoVenda: headers.indexOf('venda_posvenda'),
        indicadoPor: headers.indexOf('indicado_por'),
        consultorComercial: headers.indexOf('consultor_comercial'),
        codigoIntegrante: headers.indexOf('codigo_integrante'),
        nomeIntegrante: headers.indexOf('nm_integrante'),
        idFundo: headers.indexOf('id_fundo'),
        nmFundo: headers.indexOf('nm_fundo'),
        cursoFundo: headers.indexOf('curso_fundo'),
        tpServico: headers.indexOf('tp_servico'),
        nmInstituicao: headers.indexOf('nm_instituicao'),
        tipoCliente: headers.indexOf('tipo_cliente'),
      };

      // Verificar colunas essenciais
      if (indices.unidade === -1 || indices.data === -1 || indices.valor === -1) {
        throw new Error('Colunas essenciais não encontradas na planilha');
      }

      // Processar dados
      const processedData: Adesao[] = rows.slice(1)
        .map((row: string[]) => {
          const dateValue = parseDate(row[indices.data]);
          if (!dateValue) return null;

          return {
            nm_unidade: row[indices.unidade] || 'N/A',
            dt_cadastro_integrante: dateValue,
            vl_plano: parseFloat(String(row[indices.valor] || '0').replace(',', '.')) || 0,
            venda_posvenda: indices.tipoVenda !== -1 ? row[indices.tipoVenda] || 'VENDA' : 'N/A',
            indicado_por: indices.indicadoPor !== -1 ? row[indices.indicadoPor] || 'N/A' : 'N/A',
            consultor_comercial: indices.consultorComercial !== -1 ? row[indices.consultorComercial] || 'N/A' : 'N/A',
            codigo_integrante: indices.codigoIntegrante !== -1 ? row[indices.codigoIntegrante] || 'N/A' : 'N/A',
            nm_integrante: indices.nomeIntegrante !== -1 ? row[indices.nomeIntegrante] || 'N/A' : 'N/A',
            id_fundo: indices.idFundo !== -1 ? row[indices.idFundo] || 'N/A' : 'N/A',
            nm_fundo: indices.nmFundo !== -1 ? row[indices.nmFundo] || 'N/A' : 'N/A',
            curso_fundo: indices.cursoFundo !== -1 ? row[indices.cursoFundo] || '' : '',
            tp_servico: indices.tpServico !== -1 ? row[indices.tpServico] || 'N/A' : 'N/A',
            nm_instituicao: indices.nmInstituicao !== -1 ? row[indices.nmInstituicao] || 'N/A' : 'N/A',
            tipo_cliente: indices.tipoCliente !== -1 ? row[indices.tipoCliente] || 'N/A' : 'N/A',
          } as Adesao;
        })
        .filter(Boolean) as Adesao[];

      setDados(processedData);

    } catch (err: any) {
      console.error('Erro ao buscar dados de vendas:', err);
      setError(err.message || 'Erro desconhecido ao buscar dados');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data: dados,
    dados,
    loading,
    error,
    refetch: fetchData,
  };
}
