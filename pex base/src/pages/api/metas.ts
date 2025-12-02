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

    // GET - Buscar dados de metas
    if (req.method === 'GET') {
      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: GOOGLE_SHEET_ID,
          range: 'METAS POR CLUSTER!A:H',
        });

        const rows = response.data.values || [];

        return res.status(200).json(rows);
      } catch (sheetError: any) {
        // Tentar range alternativo sem espaços
        try {
          const response = await sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_SHEET_ID,
            range: 'METASPORCLUSTER!A:H',
          });
          
          const rows = response.data.values || [];
          return res.status(200).json(rows);
        } catch (altError: any) {
          throw sheetError; // Lança o erro original
        }
      }
    }

    // POST - Atualizar meta
    if (req.method === 'POST') {
      const { cluster, coluna, valor } = req.body;

      if (!cluster || !coluna || valor === undefined) {
        return res.status(400).json({
          error: 'Dados incompletos',
          message: 'cluster, coluna e valor são obrigatórios',
        });
      }

      // Buscar todos os dados
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: 'METAS POR CLUSTER!A:H',
      });

      const rows = response.data.values || [];
      
      if (rows.length === 0) {
        return res.status(404).json({
          error: 'Planilha vazia',
          message: 'A planilha METAS POR CLUSTER está vazia',
        });
      }

      // Encontrar a linha do cluster (coluna A)
      let rowIndex = -1;
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] === cluster) {
          rowIndex = i;
          break;
        }
      }

      if (rowIndex === -1) {
        return res.status(404).json({
          error: 'Cluster não encontrado',
          message: `O cluster "${cluster}" não foi encontrado na planilha`,
        });
      }

      // Mapeamento de colunas
      // VVR=B, % ATIGIMENTO MAC=C, % ENDIVIDAMENTO=D, NPS=E, % MC ENTREGA=F, E-NPS=G, CONFORMIDADE=H
      const colunaMap: Record<string, string> = {
        'VVR': 'B',
        '% ATIGIMENTO MAC': 'C',
        '% ENDIVIDAMENTO': 'D',
        'NPS': 'E',
        '% MC ENTREGA': 'F',
        'E-NPS': 'G',
        'CONFORMIDADE': 'H'
      };

      const columnLetter = colunaMap[coluna];
      
      if (!columnLetter) {
        return res.status(400).json({
          error: 'Coluna inválida',
          message: `A coluna "${coluna}" não é válida`,
        });
      }

      const sheetRowNumber = rowIndex + 1;
      const updateRange = `METAS POR CLUSTER!${columnLetter}${sheetRowNumber}`;

      // Formatar valor baseado no tipo de coluna
      let valorFormatado: string;
      let valueInputOption: 'RAW' | 'USER_ENTERED' = 'USER_ENTERED';
      
      if (coluna === 'VVR') {
        // Formatar como moeda: R$ 1.000.000,00
        const numero = parseFloat(String(valor).replace(',', '.'));
        
        // Separar parte inteira e decimal
        const valorFixo = numero.toFixed(2);
        const [parteInteira, parteDecimal] = valorFixo.split('.');
        
        // Adicionar pontos de milhar
        const parteInteiraFormatada = parteInteira.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        valorFormatado = `R$ ${parteInteiraFormatada},${parteDecimal}`;
        valueInputOption = 'RAW'; // Enviar como texto formatado
      } else if (coluna.includes('%') || coluna === 'CONFORMIDADE') {
        // Para percentuais (incluindo CONFORMIDADE): enviar como "80%" e deixar o Sheets interpretar
        const numero = parseFloat(String(valor).replace(',', '.'));
        const valorFixo = numero.toFixed(2);
        const valorComVirgula = valorFixo.replace('.', ',');
        valorFormatado = `${valorComVirgula}%`;
        valueInputOption = 'USER_ENTERED'; // USER_ENTERED interpreta o % corretamente
      } else {
        // NPS e E-NPS: apenas número inteiro
        const numero = parseFloat(String(valor).replace(',', '.'));
        valorFormatado = String(Math.round(numero));
        valueInputOption = 'USER_ENTERED';
      }

      await sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: updateRange,
        valueInputOption: valueInputOption,
        requestBody: {
          values: [[valorFormatado]],
        },
      });

      return res.status(200).json({
        success: true,
        message: `Meta atualizada com sucesso para ${cluster} na coluna ${coluna}`,
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
