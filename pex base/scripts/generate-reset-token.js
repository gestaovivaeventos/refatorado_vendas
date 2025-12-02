#!/usr/bin/env node

/**
 * Script para Gerar Token de Redefinição de Senha
 * 
 * Uso:
 *   node scripts/generate-reset-token.js <username> [expirationMinutes]
 * 
 * Exemplos:
 *   node scripts/generate-reset-token.js gabriel.braz
 *   node scripts/generate-reset-token.js gabriel.braz 120
 */

// Importar a função de geração de token
// Nota: Isso requer um pequeno ajuste no arquivo reset-password-token.ts
// para exportar a função sem ser apenas dentro da API

const readline = require('readline');

// Simular a mesma lógica de geração de token
function generateResetToken(username, expirationMinutes = 60) {
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  const expiresAt = Date.now() + expirationMinutes * 60 * 1000;
  
  console.log('\n✅ Token Gerado com Sucesso!\n');
  console.log(`Username: ${username}`);
  console.log(`Token: ${token}`);
  console.log(`Expira em: ${expirationMinutes} minutos`);
  console.log(`Válido até: ${new Date(expiresAt).toLocaleString('pt-BR')}`);
  console.log('\n💡 Copie o token e envie para o usuário via email, SMS ou outro meio seguro.\n');
  
  return token;
}

// Obter argumentos da linha de comando
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('❌ Erro: Username é obrigatório');
  console.log('\nUso: node scripts/generate-reset-token.js <username> [expirationMinutes]');
  console.log('Exemplos:');
  console.log('  node scripts/generate-reset-token.js gabriel.braz');
  console.log('  node scripts/generate-reset-token.js gabriel.braz 120');
  process.exit(1);
}

const username = args[0];
const expirationMinutes = parseInt(args[1]) || 60;

// Validar entrada
if (!username.trim()) {
  console.error('❌ Erro: Username não pode ser vazio');
  process.exit(1);
}

if (expirationMinutes < 1 || expirationMinutes > 1440) {
  console.error('❌ Erro: Tempo de expiração deve estar entre 1 e 1440 minutos');
  process.exit(1);
}

// Gerar token
generateResetToken(username, expirationMinutes);
