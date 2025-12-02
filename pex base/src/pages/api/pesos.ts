/**
 * API Handler para gerenciar pesos por quarter
 * Lê e escreve na aba CRITERIOS RANKING
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

interface ErrorResponse {
  error: string;
  message: string;
}

interface UpdatePesoRequest {
  indicador: string;
  quarter: '1' | '2' | '3' | '4';
  peso: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any[][] | { success: boolean; message: string } | ErrorResponse>
) {
  try {
    // Variáveis de ambiente
    const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
    const GOOGLE_SERVICE_ACCOUNT_BASE64 = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;

    if (!GOOGLE_SHEET_ID || !GOOGLE_SERVICE_ACCOUNT_BASE64) {
      return res.status(500).json({
        error: 'Configuração incompleta',
        message: 'Variáveis de ambiente não configuradas',
      });
    }

    // Decodificar Service Account
    const serviceAccountBuffer = Buffer.from(GOOGLE_SERVICE_ACCOUNT_BASE64, 'base64');
    const serviceAccount = JSON.parse(serviceAccountBuffer.toString('utf-8'));
    const { client_email, private_key } = serviceAccount;

    // Autenticar (com permissão de escrita)
    const auth = new google.auth.JWT(
      client_email,
      undefined,
      private_key,
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    const sheets = google.sheets({ version: 'v4', auth });

    // GET - Buscar dados da aba CRITERIOS RANKING (colunas B:F)
    if (req.method === 'GET') {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: 'CRITERIOS RANKING!B:F',
      });

      return res.status(200).json(response.data.values || []);
    }

    // POST - Atualizar peso de um indicador em um quarter específico
    if (req.method === 'POST') {
      const { indicador, quarter, peso } = req.body as UpdatePesoRequest;

      if (!indicador || !quarter || peso === undefined) {
        return res.status(400).json({
          error: 'Dados inválidos',
          message: 'Indicador, quarter e peso são obrigatórios',
        });
      }

      // Primeiro, buscar os dados atuais para encontrar a linha do indicador
      const responseGet = await sheets.spreadsheets.values.get({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: 'CRITERIOS RANKING!B:F',
      });

      const rows = responseGet.data.values || [];
      
      // Encontrar a linha do indicador (ignorar header - linha 1)
      let rowIndex = -1;
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] === indicador) {
          rowIndex = i;
          break;
        }
      }

      if (rowIndex === -1) {
        return res.status(404).json({
          error: 'Indicador não encontrado',
          message: `O indicador "${indicador}" não foi encontrado na planilha`,
        });
      }

      // Determinar a coluna baseado no quarter
      // QUARTER 1 = coluna C, QUARTER 2 = coluna D, QUARTER 3 = coluna E, QUARTER 4 = coluna F
      const colunaMap: Record<string, string> = {
        '1': 'C',
        '2': 'D',
        '3': 'E',
        '4': 'F'
      };

      const coluna = colunaMap[quarter];
      
      // Atualizar a célula específica
      const sheetRowNumber = rowIndex + 1;
      const updateRange = `CRITERIOS RANKING!${coluna}${sheetRowNumber}`;

      // Converter ponto para vírgula antes de salvar no Google Sheets
      const pesoFormatado = String(peso).replace('.', ',');

      await sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: updateRange,
        valueInputOption: 'USER_ENTERED', // Mudado de RAW para USER_ENTERED para aceitar números com vírgula
        requestBody: {
          values: [[pesoFormatado]],
        },
      });

      return res.status(200).json({
        success: true,
        message: `Peso atualizado com sucesso para ${indicador} no Quarter ${quarter}`,
      });
    }

    // Método não permitido
    return res.status(405).json({
      error: 'Método não permitido',
      message: 'Apenas GET e POST são permitidos',
    });

  } catch (error: any) {
    return res.status(500).json({
      error: 'Erro ao processar requisição',
      message: error.message || 'Ocorreu um erro ao processar a requisição',
    });
  }
}
