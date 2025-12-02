/**
 * API Route - Histórico
 * Retorna dados históricos mensais dos indicadores
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

interface ErrorResponse {
  error: string;
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any[] | ErrorResponse>
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

    const sheets = google.sheets({ version: 'v4', auth });

    // Buscar dados da aba HISTORICO
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: 'HISTORICO!A:Z',
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return res.status(200).json([]);
    }

    // Primeira linha são os headers
    const headers = rows[0];
    
    // Transformar em array de objetos
    const dados = rows.slice(1).map(row => {
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });

    res.status(200).json(dados);
  } catch (error) {
    console.error('Erro ao buscar dados do histórico:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do histórico', message: String(error) });
  }
}
