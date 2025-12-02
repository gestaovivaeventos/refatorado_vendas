/**
 * Hook para buscar e gerenciar dados do funil de vendas
 */

import { useState, useEffect, useCallback } from 'react';
import { LeadFunil } from '@/types/funil.types';
import { SPREADSHEET_IDS, SHEET_NAMES, GOOGLE_API_KEY } from '@/config/app.config';

interface UseFunilDataReturn {
  data: LeadFunil[];
  leads: LeadFunil[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para buscar dados do funil
 */
export function useFunilData(): UseFunilDataReturn {
  const [leads, setLeads] = useState<LeadFunil[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_IDS.FUNIL}/values/${SHEET_NAMES.FUNIL}?key=${GOOGLE_API_KEY}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Falha ao buscar dados do funil');
      }

      const data = await response.json();
      const rows = data.values || [];
      
      if (rows.length < 2) {
        setLeads([]);
        return;
      }

      // Índices das colunas do funil
      const columnIndices = {
        titulo: 0,           // A
        fasePerdido: 1,      // B
        curso: 3,            // D
        origemLead: 6,       // G
        criadoEm: 12,        // M
        qualificacaoComissao: 57,  // BF
        diagnosticoRealizado: 59,  // BH
        propostaEnviada: 61,       // BJ
        fechamentoComissao: 64,    // BM
        concatMotivoPerda: 70,     // BS
        concatConcorrente: 71,     // BT
        consultor: 53,       // BB
        etiquetas: 54,       // BC
        segmentacaoLead: 69, // BR
        nmUnidade: 72,       // BU
        // Perdas por fase
        perda11: 13,  // N
        perda12: 17,  // R
        perda13: 21,  // V
        perda21: 25,  // Z
        perda22: 29,  // AD
        perda31: 33,  // AH
        perda32: 37,  // AL
        perda33: 41,  // AP
        perda41: 45,  // AT
        perda51: 49,  // AX
      };

      // Processar dados
      const processedData: LeadFunil[] = rows.slice(1)
        .map((row: string[], index: number) => {
          const titulo = row[columnIndices.titulo];
          
          // Ignorar linhas sem título
          if (!titulo || titulo.trim() === '') return null;

          return {
            id: index + 1,
            titulo,
            fase_perdido: row[columnIndices.fasePerdido] || '',
            curso: row[columnIndices.curso] || '',
            consultor: row[columnIndices.consultor] || '',
            etiquetas: row[columnIndices.etiquetas] || '',
            origem_lead: row[columnIndices.origemLead] || '',
            segmentacao_lead: row[columnIndices.segmentacaoLead] || '',
            criado_em: row[columnIndices.criadoEm] || '',
            qualificacao_comissao: row[columnIndices.qualificacaoComissao] || '',
            diagnostico_realizado: row[columnIndices.diagnosticoRealizado] || '',
            proposta_enviada: row[columnIndices.propostaEnviada] || '',
            fechamento_comissao: row[columnIndices.fechamentoComissao] || '',
            concat_motivo_perda: row[columnIndices.concatMotivoPerda] || '',
            concat_concorrente: row[columnIndices.concatConcorrente] || '',
            nm_unidade: row[columnIndices.nmUnidade] || '',
            perda_11: row[columnIndices.perda11] || '',
            perda_12: row[columnIndices.perda12] || '',
            perda_13: row[columnIndices.perda13] || '',
            perda_21: row[columnIndices.perda21] || '',
            perda_22: row[columnIndices.perda22] || '',
            perda_31: row[columnIndices.perda31] || '',
            perda_32: row[columnIndices.perda32] || '',
            perda_33: row[columnIndices.perda33] || '',
            perda_41: row[columnIndices.perda41] || '',
            perda_51: row[columnIndices.perda51] || '',
          } as LeadFunil;
        })
        .filter(Boolean) as LeadFunil[];

      setLeads(processedData);

    } catch (err: any) {
      console.error('Erro ao buscar dados do funil:', err);
      setError(err.message || 'Erro desconhecido ao buscar dados do funil');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data: leads,
    leads,
    loading,
    error,
    refetch: fetchData,
  };
}
