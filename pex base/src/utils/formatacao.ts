/**
 * Funções utilitárias para formatação de dados
 * Seguindo princípio DRY - centralizar lógica de formatação
 * Conforme exemplo da Seção 3 das Diretrizes
 */

/**
 * Formata valor como moeda brasileira
 * Ex: 1234.56 → "R$ 1.234,56"
 */
export function formatarDinheiro(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

/**
 * Formata número como percentual
 * Ex: 0.8542 → "85,42%"
 */
export function formatarPercentual(valor: number, casasDecimais: number = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: casasDecimais,
    maximumFractionDigits: casasDecimais,
  }).format(valor / 100);
}

/**
 * Formata número com separadores de milhar
 * Ex: 1234567 → "1.234.567"
 */
export function formatarNumero(valor: number, casasDecimais: number = 0): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: casasDecimais,
    maximumFractionDigits: casasDecimais,
  }).format(valor);
}

/**
 * Formata data no padrão brasileiro
 * Ex: 2026-01-15 → "15/01/2026"
 */
export function formatarData(data: Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(data);
}

/**
 * Formata data com hora
 * Ex: → "15/01/2026 às 14:30"
 */
export function formatarDataHora(data: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(data);
}

/**
 * Trunca texto com reticências
 * Ex: "Texto muito longo", 10 → "Texto muit..."
 */
export function truncarTexto(texto: string, tamanhoMaximo: number): string {
  if (texto.length <= tamanhoMaximo) return texto;
  return texto.substring(0, tamanhoMaximo) + '...';
}

/**
 * Capitaliza primeira letra de cada palavra
 * Ex: "programa de excelência" → "Programa De Excelência"
 */
export function capitalizarPalavras(texto: string): string {
  return texto
    .toLowerCase()
    .split(' ')
    .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(' ');
}

/**
 * Remove acentos de uma string
 * Ex: "São Paulo" → "Sao Paulo"
 */
export function removerAcentos(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
