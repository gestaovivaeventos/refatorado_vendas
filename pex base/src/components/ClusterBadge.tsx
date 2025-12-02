/**
 * Componente de Badge de Cluster
 * Exibe o cluster da franquia com estilização adequada
 */

import React from 'react';
import { ClusterType } from '@/types/pex.types';

interface ClusterBadgeProps {
  cluster: ClusterType;
}

const clusterConfig = {
  CALOURO_INICIANTE: {
    label: 'Calouro Iniciante',
    cor: 'bg-blue-100 text-blue-800',
  },
  CALOURO: {
    label: 'Calouro',
    cor: 'bg-green-100 text-green-800',
  },
  GRADUADO: {
    label: 'Graduado',
    cor: 'bg-yellow-100 text-yellow-800',
  },
  POS_GRADUADO: {
    label: 'Pós Graduado',
    cor: 'bg-purple-100 text-purple-800',
  },
};

export default function ClusterBadge({ cluster }: ClusterBadgeProps) {
  const config = clusterConfig[cluster];
  
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.cor}`}>
      {config.label}
    </span>
  );
}
