#!/usr/bin/env node

/**
 * Script para Entender o Esquema de Token Dinâmico
 * 
 * O token é gerado dinamicamente:
 * Token = ID do usuário + DIFERENÇA_DIAS_DESDE_CRIAÇÃO
 * 
 * Exemplo:
 * - ID do usuário: 12345
 * - Data de criação: 2025-11-01
 * - Data de hoje: 2025-11-18
 * - Diferença: 17 dias
 * - Token: 12345 + 17 = pode ser "1234517" ou similar
 */

const readline = require('readline');

console.log('\n');
console.log('═══════════════════════════════════════════════════════════════');
console.log('  🔑 Sistema de Token Dinâmico para Redefinição de Senha');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('ℹ️  O token é gerado DINAMICAMENTE na sua planilha');
console.log('');
console.log('Fórmula: Token = ID_Usuario + (HOJE() - Data_Criação) em dias');
console.log('');
console.log('Exemplos de tokens gerados dinamicamente:');
console.log('');
console.log('  ID do Usuário | Data Criação | Hoje          | Dias | Token');
console.log('  ─────────────────────────────────────────────────────────');
console.log('  12345         | 2025-11-01   | 2025-11-18    | 17   | 1234517');
console.log('  67890         | 2025-10-15   | 2025-11-18    | 34   | 6789034');
console.log('  54321         | 2025-11-18   | 2025-11-18    | 0    | 543210');
console.log('');

console.log('✅ Para redefinir senha:');
console.log('   1. Copie o token que aparece na coluna Q da planilha');
console.log('   2. Cole o token no formulário de redefinição de senha');
console.log('   3. O sistema validará automaticamente\n');

console.log('📊 Sua Planilha:');
console.log('   - Coluna E: Username');
console.log('   - Coluna P: Senha_Hash (será atualizada em TODAS as linhas)');
console.log('   - Coluna Q: Token_Reset_Admin (gerado dinamicamente)\n');

console.log('🔐 Segurança:');
console.log('   - Senha é criptografada com bcrypt (10 rounds)');
console.log('   - Token muda a cada dia (dinâmico)');
console.log('   - Token é único por usuário');
console.log('   - Todas as linhas do usuário são atualizadas\n');

console.log('═══════════════════════════════════════════════════════════════\n');
