/**
 * API Route para buscar dados de vendas do Google Sheets
 * Evita problemas de CORS fazendo a chamada server-side
 */

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const SPREADSHEET_ID = process.env.NEXT_PUBLIC_SPREADSHEET_SALES;
    const SHEET_NAME = process.env.NEXT_PUBLIC_SHEET_ADESOES || 'ADESOES';
    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

    if (!SPREADSHEET_ID || !API_KEY) {
      return res.status(500).json({
        error: 'Configuração incompleta',
        message: 'Variáveis de ambiente do Google Sheets não configuradas',
      });
    }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;
    
    console.log('[API/sales] Buscando dados...');
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API/sales] Erro:', response.status, errorText);
      return res.status(response.status).json({
        error: 'Falha ao buscar dados',
        message: errorText,
      });
    }

    const data = await response.json();
    const rows = data.values || [];
    
    console.log('[API/sales] Dados recebidos:', rows.length, 'linhas');
    
    return res.status(200).json({ values: rows });

  } catch (error: any) {
    console.error('[API/sales] Erro:', error);
    return res.status(500).json({
      error: 'Erro interno',
      message: error.message || 'Erro desconhecido',
    });
  }
}
