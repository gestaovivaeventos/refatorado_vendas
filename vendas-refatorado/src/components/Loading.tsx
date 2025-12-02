/**
 * Componente Loading - Indicador de carregamento
 */

import React from 'react';

interface LoadingProps {
  mensagem?: string;
}

export default function Loading({ mensagem = 'Carregando dados...' }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center p-10">
      <div className="spinner mb-4" />
      <p className="text-text-secondary">{mensagem}</p>
    </div>
  );
}
