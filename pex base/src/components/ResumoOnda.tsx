/**
 * Componente de Resumo de Onda
 * Exibe informações resumidas de uma onda
 */

import React from 'react';
import { formatarData } from '@/utils/formatacao';

interface ResumoOndaProps {
  numero: number;
  nome: string;
  dataInicio: Date;
  dataFim: Date;
  totalIndicadores: number;
}

export default function ResumoOnda({ 
  numero, 
  nome, 
  dataInicio, 
  dataFim,
  totalIndicadores 
}: ResumoOndaProps) {
  return (
    <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-300">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-sm font-semibold text-primary-600">Onda {numero}</span>
          <h3 className="text-xl font-bold text-gray-800 mt-1">{nome}</h3>
        </div>
        <div className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-bold">
          {totalIndicadores} Indicadores
        </div>
      </div>
      
      <div className="mt-4 flex gap-4 text-sm text-gray-700">
        <div>
          <span className="font-semibold">Início:</span> {formatarData(dataInicio)}
        </div>
        <div>
          <span className="font-semibold">Fim:</span> {formatarData(dataFim)}
        </div>
      </div>
    </div>
  );
}
