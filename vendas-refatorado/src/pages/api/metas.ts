/**
 * API Route para buscar dados de metas do Google Sheets
 */

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const SPREADSHEET_ID = process.env.NEXT_PUBLIC_SPREADSHEET_METAS;
    const SHEET_NAME = process.env.NEXT_PUBLIC_SHEET_METAS || 'metas';
    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

    if (!SPREADSHEET_ID || !API_KEY) {
      return res.status(500).json({
        error: 'Configuração incompleta',
        message: 'Variáveis de ambiente do Google Sheets não configuradas',
      });
    }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: 'Falha ao buscar dados',
        message: errorText,
      });
    }

    const data = await response.json();
    return res.status(200).json({ values: data.values || [] });

  } catch (error: any) {
    return res.status(500).json({
      error: 'Erro interno',
      message: error.message || 'Erro desconhecido',
    });
  }
}
