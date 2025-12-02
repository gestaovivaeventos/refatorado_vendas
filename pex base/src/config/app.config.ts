/**
 * Configurações gerais da aplicação
 * Conforme diretrizes de segurança - centralizar configurações
 */

export const appConfig = {
  name: 'PEX Dashboard 2026',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  
  // URLs da API
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  
  // Google Analytics
  gaId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  
  // Clusters do PEX
  clusters: {
    CALOURO_INICIANTE: 'Calouro Iniciante',
    CALOURO: 'Calouro',
    GRADUADO: 'Graduado',
    POS_GRADUADO: 'Pós Graduado',
  },
  
  // Número de ondas por ciclo
  ondasPorCiclo: 4,
  
  // Limite de bônus por onda
  limiteBonusPorOnda: 3,
  
  // Peso máximo para soma dos indicadores
  pesoMaximoTotal: 10,
  
  // Peso máximo individual por indicador
  pesoMaximoIndicador: 5,
};

export default appConfig;
