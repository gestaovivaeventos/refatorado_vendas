/**
 * POST /api/auth/login - Valida credenciais contra a planilha de controle de acessos
 * Retorna um token JWT ou erro de autenticação
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { findUserByUsername } from '@/utils/authSheets';

interface LoginRequestBody {
  username: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    username: string;
    firstName: string;
    accessLevel: 0 | 1;
    unitNames?: string[];
  };
}

// Função para buscar usuários autorizados da planilha Google Sheets
async function getAuthorizedUsers(): Promise<Array<{ 
  username: string; 
  name: string; 
  accessLevel: 0 | 1;
  unitNames?: string[];
}>> {
  try {
    const sheetId = process.env.GOOGLE_ACCESS_CONTROL_SHEET_ID;
    if (!sheetId) {
      console.error('GOOGLE_ACCESS_CONTROL_SHEET_ID não configurado');
      return [];
    }

    // URL para ler a planilha em formato CSV (mais simples que API)
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;

    const response = await fetch(csvUrl);
    const csvText = await response.text();

    // Parsear CSV simples
    const lines = csvText.split('\n');
    
    // Colunas esperadas:
    // B (índice 1) = nm_unidade (unidade vinculada)
    // D (índice 3) = nome (full name)
    // E (índice 4) = username
    // F (índice 5) = enabled (TRUE/FALSE - verificar se usuário está ativo)
    // L (índice 11) = nvl_acesso_unidade (0 = franqueado, 1 = franqueadora)
    // C (índice 2) = nm_unidade_principal_desc (unidade principal, não usado mais)
    
    // Agrupar por username para coletar todas as unidades
    const userMap = new Map<string, {
      name: string;
      accessLevel: 0 | 1;
      unitNames: Set<string>;
      enabled: boolean;
    }>();

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cells = line.split(',');
      if (cells.length > 11) {
        const unitName = cells[1]?.trim().replace(/^"|"$/g, ''); // Coluna B
        const name = cells[3]?.trim().replace(/^"|"$/g, ''); // Coluna D
        const username = cells[4]?.trim().replace(/^"|"$/g, ''); // Coluna E
        const enabledStr = cells[5]?.trim().replace(/^"|"$/g, '').toUpperCase(); // Coluna F
        const accessLevelStr = cells[11]?.trim().replace(/^"|"$/g, ''); // Coluna L
        
        // Validar se usuário está ativo (enabled = TRUE)
        const enabled = enabledStr === 'TRUE';
        
        // Validar accessLevel (0 ou 1)
        const accessLevel = accessLevelStr === '1' ? 1 : (accessLevelStr === '0' ? 0 : null);
        
        if (username && name && accessLevel !== null && enabled) {
          if (!userMap.has(username)) {
            userMap.set(username, {
              name,
              accessLevel,
              unitNames: new Set(),
              enabled
            });
          }
          
          const user = userMap.get(username)!;
          // Se for franqueado (0), adicionar a unidade
          if (accessLevel === 0 && unitName) {
            user.unitNames.add(unitName);
          }
        }
      }
    }

    // Converter Map para Array
    const users: Array<{ 
      username: string; 
      name: string; 
      accessLevel: 0 | 1;
      unitNames?: string[];
    }> = [];

    userMap.forEach((user, username) => {
      const userData: {
        username: string;
        name: string;
        accessLevel: 0 | 1;
        unitNames?: string[];
      } = {
        username,
        name: user.name,
        accessLevel: user.accessLevel
      };

      // Se for franqueado (0) e tiver unidades, adicionar array de unidades
      if (user.accessLevel === 0 && user.unitNames.size > 0) {
        userData.unitNames = Array.from(user.unitNames).sort();
      }

      users.push(userData);
    });

    return users;
  } catch (error) {
    console.error('Erro ao buscar usuários da planilha:', error);
    return [];
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  const { username, password } = req.body as LoginRequestBody;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ success: false, message: 'Username é obrigatório' });
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ success: false, message: 'Senha é obrigatória' });
  }

  try {
    // Buscar usuários autorizados da planilha
    const authorizedUsers = await getAuthorizedUsers();

    // Encontrar o usuário com o username fornecido
    const user = authorizedUsers.find(u => u.username === username);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Usuário ou senha inválidos' });
    }

    // Buscar dados de autenticação (senha hash) do usuário
    const authUser = await findUserByUsername(username);
    
    if (!authUser) {
      return res.status(401).json({ success: false, message: 'Usuário ou senha inválidos' });
    }

    // Validar senha usando bcrypt
    const passwordMatch = await bcrypt.compare(password, authUser.senhaHash);
    
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Usuário ou senha inválidos' });
    }

    // Extrair primeiro nome e formatar: primeira letra maiúscula, resto minúsculo
    const nameParts = user.name.split(' ');
    const firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase();

    // Gerar token com as informações do usuário (username:accessLevel:unitNames)
    const tokenData = JSON.stringify({
      username: username,
      accessLevel: user.accessLevel,
      unitNames: user.unitNames || []
    });
    const token = Buffer.from(tokenData).toString('base64');

    // Salvar no cookie de sessão
    res.setHeader(
      'Set-Cookie',
      `auth_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${60 * 60 * 24}` // 24 horas
    );

    return res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      user: {
        username: username,
        firstName: firstName,
        accessLevel: user.accessLevel,
        unitNames: user.unitNames
      }
    });
  } catch (error) {
    console.error('Erro ao processar login:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao processar login. Tente novamente.'
    });
  }
}
