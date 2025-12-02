/**
 * Tipos e Interfaces do PEX
 * Define os tipos de dados utilizados no sistema
 */

export type ClusterType = 
  | 'CALOURO_INICIANTE'
  | 'CALOURO'
  | 'GRADUADO'
  | 'POS_GRADUADO';

export interface Franquia {
  id: string;
  nome: string;
  cluster: ClusterType;
  vvrUltimos12Meses: number[];
  macUltimos12Meses: number[];
  endividamentoUltimos12Meses: number[];
  npsUltimos12Meses: number[];
  mcPercentualUltimos12Meses: number[];
  enpsUltimos12Meses: number[];
  conformidades: ConformidadeFranquia;
}

export interface ConformidadeFranquia {
  pipefy: ConformidadePipefy;
  financeira: ConformidadeFinanceira;
  estrutura: ConformidadeEstrutura;
  reclameAqui: number; // Nota de 0 a 10
}

export interface ConformidadePipefy {
  vendas: number;
  relacionamento: number;
  atendimento: number;
  producao: number;
}

export interface ConformidadeFinanceira {
  fechamentosNoPrazo: number;
  adimplencia: boolean;
}

export interface ConformidadeEstrutura {
  organizacional: number;
  societaria: boolean;
}

export interface Indicador {
  nome: string;
  codigo: 'VVR' | 'MAC' | 'ENDIVIDAMENTO' | 'NPS' | 'MC_PERCENT' | 'ENPS' | 'CONFORMIDADES';
  peso: number; // 0 a 5
  meta: number;
}

export interface Quarter {
  numero: number;
  nome: string;
  dataInicio: Date;
  dataFim: Date;
  indicadores: Indicador[];
  bonus?: Bonus[];
}

export interface Bonus {
  id: string;
  descricao: string;
  valor: number; // 0.5 ou 1
  franquiasAplicadas: string[];
}

export interface PontuacaoIndicador {
  indicador: string;
  pontuacao: number;
  atingimento: number; // Percentual de atingimento da meta
}

export interface ResultadoQuarter {
  quarterNumero: number;
  franquiaId: string;
  pontuacoes: PontuacaoIndicador[];
  totalIndicadores: number;
  bonusRecebidos: Bonus[];
  totalBonus: number;
  pontuacaoFinal: number;
}

export interface ResultadoPEX {
  franquiaId: string;
  resultadosQuarters: ResultadoQuarter[];
  mediaFinal: number;
  ranking: number;
}
