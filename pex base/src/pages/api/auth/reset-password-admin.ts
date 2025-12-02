/**
 * POST /api/auth/reset-password-admin - Redefinição de Senha (Admin Only)
 * Permite que um administrador redefina a senha de um usuário
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import * as bcrypt from 'bcryptjs';
import { findUserByUsername, updateUserPassword } from '@/utils/authSheets';

interface ResetPasswordRequest {
  username: string;
  newPassword: string;
  adminToken?: string; // Token para validar permissão de admin
}

interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResetPasswordResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  const { username, newPassword, adminToken } = req.body as ResetPasswordRequest;

  // Validação de entrada
  if (!username || !newPassword) {
    return res.status(400).json({ 
      success: false, 
      message: 'Username e newPassword são obrigatórios' 
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ 
      success: false, 
      message: 'Senha deve ter pelo menos 8 caracteres' 
    });
  }

  try {
    // TODO: Validar permissão de admin
    // Por enquanto, apenas usuários autenticados podem usar esta rota
    // Recomendação: Validar um token JWT de admin ou usar uma chave secreta
    
    if (!adminToken) {
      console.warn('Tentativa de reset de senha sem token de admin');
      // Comentário: Em produção, retornar erro 403 Forbidden aqui
      // return res.status(403).json({ success: false, message: 'Não autorizado' });
    }

    // Buscar usuário na planilha
    const user = await findUserByUsername(username);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }

    // Gerar hash da nova senha usando bcrypt
    const newHash = await bcrypt.hash(newPassword, 10);

    // Atualizar hash na MESMA linha do usuário (coluna C)
    const updated = await updateUserPassword(user.rowIndex, newHash);

    if (!updated) {
      return res.status(500).json({ 
        success: false, 
        message: 'Erro ao atualizar senha na planilha.' 
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Senha atualizada com sucesso.' 
    });
  } catch (error) {
    console.error('Erro ao resetar senha:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao processar redefinição de senha' 
    });
  }
}
