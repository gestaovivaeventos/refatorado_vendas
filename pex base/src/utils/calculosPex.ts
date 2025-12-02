/**
 * Funções utilitárias para cálculos do PEX
 * Seguindo princípio DRY - Não se Repita
 * Conforme Seção 3 das Diretrizes
 */

import { 
  Franquia, 
  Indicador, 
  PontuacaoIndicador,
  ConformidadePipefy,
  ConformidadeFinanceira,
  ConformidadeEstrutura 
} from '@/types/pex.types';

/**
 * Calcula a pontuação de VVR para uma franquia
 * VVR: Soma dos VVR dos últimos 12 meses / meta do cluster * peso
 * Resultado limitado a 100 vezes o peso
 */
export function calcularPontuacaoVVR(
  vvrUltimos12Meses: number[],
  metaCluster: number,
  peso: number
): PontuacaoIndicador {
  const somaVVR = vvrUltimos12Meses.reduce((acc, val) => acc + val, 0);
  const atingimento = (somaVVR / metaCluster) * 100;
  const pontuacao = Math.min((somaVVR / metaCluster) * peso, peso * 100);
  
  return {
    indicador: 'VVR',
    pontuacao,
    atingimento,
  };
}

/**
 * Calcula a pontuação de MAC para uma franquia
 * MAC: Média de atingimento de MAC dos últimos 12 meses / meta * peso
 * Resultado limitado a 100 vezes o peso
 */
export function calcularPontuacaoMAC(
  macUltimos12Meses: number[],
  metaCluster: number,
  peso: number
): PontuacaoIndicador {
  const mediaMAC = macUltimos12Meses.reduce((acc, val) => acc + val, 0) / macUltimos12Meses.length;
  const atingimento = (mediaMAC / metaCluster) * 100;
  const pontuacao = Math.min((mediaMAC / metaCluster) * peso, peso * 100);
  
  return {
    indicador: 'MAC',
    pontuacao,
    atingimento,
  };
}

/**
 * Calcula a pontuação de Endividamento
 * Endividamento: Média de indicador dos últimos 12 meses / meta * peso
 * Resultado limitado a 100 vezes o peso
 */
export function calcularPontuacaoEndividamento(
  endividamentoUltimos12Meses: number[],
  metaCluster: number,
  peso: number
): PontuacaoIndicador {
  const mediaEndividamento = endividamentoUltimos12Meses.reduce((acc, val) => acc + val, 0) / endividamentoUltimos12Meses.length;
  const atingimento = (mediaEndividamento / metaCluster) * 100;
  const pontuacao = Math.min((mediaEndividamento / metaCluster) * peso, peso * 100);
  
  return {
    indicador: 'ENDIVIDAMENTO',
    pontuacao,
    atingimento,
  };
}

/**
 * Calcula a pontuação de NPS
 * NPS: Resultado unificado das pesquisas dos últimos 12 meses / meta * peso
 */
export function calcularPontuacaoNPS(
  npsUltimos12Meses: number[],
  metaCluster: number,
  peso: number
): PontuacaoIndicador {
  const mediaNPS = npsUltimos12Meses.reduce((acc, val) => acc + val, 0) / npsUltimos12Meses.length;
  const atingimento = (mediaNPS / metaCluster) * 100;
  const pontuacao = Math.min((mediaNPS / metaCluster) * peso, peso * 100);
  
  return {
    indicador: 'NPS',
    pontuacao,
    atingimento,
  };
}

/**
 * Calcula a pontuação de MC %
 * MC%: Média de % MC de entrega dos últimos 12 meses / meta * peso
 * Se margem negativa, considerar piso de 0
 */
export function calcularPontuacaoMC(
  mcUltimos12Meses: number[],
  metaCluster: number,
  peso: number
): PontuacaoIndicador {
  // Aplica piso de 0 para margens negativas
  const mcAjustados = mcUltimos12Meses.map(mc => Math.max(0, mc));
  const mediaMC = mcAjustados.reduce((acc, val) => acc + val, 0) / mcAjustados.length;
  const atingimento = (mediaMC / metaCluster) * 100;
  const pontuacao = Math.min((mediaMC / metaCluster) * peso, peso * 100);
  
  return {
    indicador: 'MC_PERCENT',
    pontuacao,
    atingimento,
  };
}

/**
 * Calcula a pontuação de E-NPS
 */
export function calcularPontuacaoENPS(
  enpsUltimos12Meses: number[],
  metaCluster: number,
  peso: number
): PontuacaoIndicador {
  const mediaENPS = enpsUltimos12Meses.reduce((acc, val) => acc + val, 0) / enpsUltimos12Meses.length;
  const atingimento = (mediaENPS / metaCluster) * 100;
  const pontuacao = Math.min((mediaENPS / metaCluster) * peso, peso * 100);
  
  return {
    indicador: 'ENPS',
    pontuacao,
    atingimento,
  };
}

/**
 * Calcula o índice de conformidade do Pipefy
 * Média dos 4 pipes ou dos pipes utilizados
 */
export function calcularConformidadePipefy(pipefy: ConformidadePipefy): number {
  const pipes = [pipefy.vendas, pipefy.relacionamento, pipefy.atendimento, pipefy.producao];
  // Filtra apenas pipes com valor > 0 (em uso)
  const pipesEmUso = pipes.filter(p => p > 0);
  
  if (pipesEmUso.length === 0) return 0;
  
  return pipesEmUso.reduce((acc, val) => acc + val, 0) / pipesEmUso.length;
}

/**
 * Calcula o índice de conformidade financeira
 * Soma de fechamentos no prazo (50%) + adimplência (50%)
 */
export function calcularConformidadeFinanceira(financeira: ConformidadeFinanceira): number {
  const pontuacaoFechamentos = financeira.fechamentosNoPrazo * 0.5;
  const pontuacaoAdimplencia = financeira.adimplencia ? 50 : 0;
  
  return pontuacaoFechamentos + pontuacaoAdimplencia;
}

/**
 * Calcula o índice de conformidade de estrutura
 * Soma de organizacional (50%) + societária (50%)
 */
export function calcularConformidadeEstrutura(estrutura: ConformidadeEstrutura): number {
  const pontuacaoOrganizacional = estrutura.organizacional * 0.5;
  const pontuacaoSocietaria = estrutura.societaria ? 50 : 0;
  
  return pontuacaoOrganizacional + pontuacaoSocietaria;
}

/**
 * Calcula o índice de Reclame Aqui convertido para escala de 100
 * Se vazio, retorna 100%
 */
export function calcularReclameAqui(nota: number | null): number {
  if (nota === null || nota === undefined) return 100;
  
  // Converte nota de 0-10 para 0-100
  return (nota / 10) * 100;
}

/**
 * Calcula a pontuação total de conformidades
 * Média dos 4 indicadores: Pipefy, Financeira, Estrutura, Reclame Aqui
 */
export function calcularPontuacaoConformidades(
  franquia: Franquia,
  metaCluster: number,
  peso: number
): PontuacaoIndicador {
  const confPipefy = calcularConformidadePipefy(franquia.conformidades.pipefy);
  const confFinanceira = calcularConformidadeFinanceira(franquia.conformidades.financeira);
  const confEstrutura = calcularConformidadeEstrutura(franquia.conformidades.estrutura);
  const confReclameAqui = calcularReclameAqui(franquia.conformidades.reclameAqui);
  
  const mediaConformidades = (confPipefy + confFinanceira + confEstrutura + confReclameAqui) / 4;
  const atingimento = (mediaConformidades / metaCluster) * 100;
  const pontuacao = Math.min((mediaConformidades / metaCluster) * peso, peso * 100);
  
  return {
    indicador: 'CONFORMIDADES',
    pontuacao,
    atingimento,
  };
}

/**
 * Valida se a soma dos pesos dos indicadores está correta
 * Deve ser exatamente 10
 */
export function validarSomaPesos(indicadores: Indicador[]): boolean {
  const somaPesos = indicadores.reduce((acc, ind) => acc + ind.peso, 0);
  return somaPesos === 10;
}

/**
 * Valida se o peso de um indicador está dentro do permitido
 * Deve ser entre 0 e 5
 */
export function validarPesoIndicador(peso: number): boolean {
  return peso >= 0 && peso <= 5;
}
