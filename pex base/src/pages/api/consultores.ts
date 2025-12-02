/**
 * API Handler para gerenciar consultores por unidade
 * Lê e escreve na aba UNI CONS
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

interface ErrorResponse {
  error: string;
  message: string;
}

interface UpdateConsultorRequest {
  unidade: string;
  consultor: string;
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

    // GET - Buscar dados da aba UNI CONS
    if (req.method === 'GET') {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: 'UNI CONS!A:F',
      });

      return res.status(200).json(response.data.values || []);
    }

    // POST - Atualizar consultor de uma unidade
    if (req.method === 'POST') {
      const { unidade, consultor } = req.body as UpdateConsultorRequest;

      if (!unidade || !consultor) {
        return res.status(400).json({
          error: 'Dados inválidos',
          message: 'Unidade e consultor são obrigatórios',
        });
      }

      // Primeiro, buscar os dados atuais para encontrar a linha da unidade
      const responseGet = await sheets.spreadsheets.values.get({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: 'UNI CONS!A:B',
      });

      const rows = responseGet.data.values || [];
      
      // Encontrar a linha da unidade (ignorar header - linha 1)
      let rowIndex = -1;
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] === unidade) {
          rowIndex = i;
          break;
        }
      }

      if (rowIndex === -1) {
        return res.status(404).json({
          error: 'Unidade não encontrada',
          message: `A unidade "${unidade}" não foi encontrada na planilha`,
        });
      }

      // Atualizar a coluna B (Consultor) da linha encontrada
      // rowIndex já está baseado em 0, então +1 para linha do Sheets
      const sheetRowNumber = rowIndex + 1;
      const updateRange = `UNI CONS!B${sheetRowNumber}`;

      await sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: updateRange,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[consultor]],
        },
      });

      return res.status(200).json({
        success: true,
        message: `Consultor atualizado com sucesso para ${unidade}`,
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
