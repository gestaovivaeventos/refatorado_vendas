/**
 * API Handler para buscar dados do Google Sheets
 * Busca dados da aba DEVERIA
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

interface ErrorResponse {
  error: string;
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any[][] | ErrorResponse>
) {
  try {
    // 1. Ler variáveis de ambiente do servidor
    const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
    const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const GOOGLE_SERVICE_ACCOUNT_BASE64 = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;

    // Validar que as variáveis existem
    if (!GOOGLE_SHEET_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_SERVICE_ACCOUNT_BASE64) {
      return res.status(500).json({
        error: 'Configuração incompleta',
        message: 'Variáveis de ambiente do Google Sheets não configuradas corretamente',
      });
    }

    // 2. Decodificar a string Base64 de volta para objeto JSON
    const serviceAccountBuffer = Buffer.from(GOOGLE_SERVICE_ACCOUNT_BASE64, 'base64');
    const serviceAccount = JSON.parse(serviceAccountBuffer.toString('utf-8'));

    // Extrair client_email e private_key
    const { client_email, private_key } = serviceAccount;

    if (!client_email || !private_key) {
      return res.status(500).json({
        error: 'Configuração inválida',
        message: 'Service Account não contém client_email ou private_key',
      });
    }

    // 3. Autenticar usando JWT
    const auth = new google.auth.JWT(
      client_email,
      undefined,
      private_key,
      ['https://www.googleapis.com/auth/spreadsheets.readonly']
    );

    // 4. Inicializar o cliente do Google Sheets
    const sheets = google.sheets({ version: 'v4', auth });

    // 5. Buscar dados da aba 'DEVERIA' (colunas A até V)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: 'DEVERIA!A:V',
    });

    // 6. Retornar os dados em formato JSON
    return res.status(200).json(response.data.values || []);

  } catch (error: any) {
    // Retornar erro genérico ao cliente (sem expor detalhes internos)
    return res.status(500).json({
      error: 'Erro ao buscar dados',
      message: error.message || 'Ocorreu um erro ao tentar buscar os dados do Google Sheets',
    });
  }
}
