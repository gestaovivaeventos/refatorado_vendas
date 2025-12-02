import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_SERVICE_ACCOUNT_BASE64 = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Validar variáveis de ambiente
    if (!GOOGLE_SHEET_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_SERVICE_ACCOUNT_BASE64) {
      return res.status(500).json({
        error: 'Configuração incompleta',
        message: 'Variáveis de ambiente do Google não configuradas',
      });
    }

    // Decodificar as credenciais do Base64
    const credentialsJson = Buffer.from(GOOGLE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8');
    const credentials = JSON.parse(credentialsJson);

    // Autenticação
    const auth = new google.auth.JWT(
      credentials.client_email,
      undefined,
      credentials.private_key,
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    const sheets = google.sheets({ version: 'v4', auth });

    // GET - Buscar dados de bônus
    if (req.method === 'GET') {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: 'DEVERIA!A:V',
      });

      const rows = response.data.values || [];

      // Retornar dados brutos - o frontend vai processar
      return res.status(200).json(rows);
    }

    // POST - Atualizar bônus
    if (req.method === 'POST') {
      const { unidade, quarter, valor } = req.body;

      if (!unidade || !quarter || valor === undefined) {
        return res.status(400).json({
          error: 'Dados incompletos',
          message: 'unidade, quarter e valor são obrigatórios',
        });
      }

      // Buscar todos os dados
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: 'DEVERIA!A:V',
      });

      const rows = response.data.values || [];
      
      if (rows.length === 0) {
        return res.status(404).json({
          error: 'Planilha vazia',
          message: 'A planilha DEVERIA está vazia',
        });
      }

      // Encontrar a linha da unidade + quarter
      // Coluna A = nm_unidade, Coluna V = QUARTER
      let rowIndex = -1;
      for (let i = 1; i < rows.length; i++) {
        const nmUnidade = rows[i][0]; // Coluna A
        const quarterDaLinha = rows[i][21]; // Coluna V (índice 21)
        
        if (nmUnidade === unidade && quarterDaLinha === quarter) {
          rowIndex = i;
          break;
        }
      }

      if (rowIndex === -1) {
        return res.status(404).json({
          error: 'Registro não encontrado',
          message: `Não foi encontrado registro para unidade "${unidade}" no quarter "${quarter}"`,
        });
      }

      // Coluna D = Bonus (índice 3)
      const sheetRowNumber = rowIndex + 1;
      const updateRange = `DEVERIA!D${sheetRowNumber}`;

      // Formatar valor como número com vírgula (0,5, 1,0, 1,5, etc)
      const numero = parseFloat(String(valor).replace(',', '.'));
      const valorFormatado = String(numero.toFixed(1)).replace('.', ',');

      await sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: updateRange,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[valorFormatado]],
        },
      });

      return res.status(200).json({
        success: true,
        message: `Bônus atualizado com sucesso para ${unidade} no ${quarter}º Quarter`,
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
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}
