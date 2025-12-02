/**
 * Componente de Funil Horizontal com formato de setas
 * Indicadores Operacionais do Funil
 */

import React from 'react';

interface FunilIndicador {
  titulo: string;
  valor: number;
}

interface FunilHorizontalProps {
  indicadores: FunilIndicador[];
  leadsPerdidos: number;
  leadsDescartados: number;
}

export const FunilHorizontal: React.FC<FunilHorizontalProps> = ({
  indicadores,
  leadsPerdidos,
  leadsDescartados,
}) => {
  // Cores gradiente para cada posição do funil (do mais claro ao mais escuro)
  const coresFunil = [
    'linear-gradient(135deg, #FFE082 0%, #FFCC02 100%)',
    'linear-gradient(135deg, #FFCC02 0%, #FF9800 100%)',
    'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
    'linear-gradient(135deg, #F57C00 0%, #EF6C00 100%)',
    'linear-gradient(135deg, #EF6C00 0%, #E65100 100%)',
  ];

  // Clip paths para formato de seta
  const getClipPath = (index: number, total: number) => {
    if (total === 1) {
      return 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
    }
    if (index === 0) {
      // Primeiro: sem seta à esquerda
      return 'polygon(0% 0%, calc(100% - 20px) 0%, 100% 50%, calc(100% - 20px) 100%, 0% 100%)';
    }
    if (index === total - 1) {
      // Último: sem seta à direita
      return 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 20px 50%)';
    }
    // Meio: seta dos dois lados
    return 'polygon(0% 0%, calc(100% - 20px) 0%, 100% 50%, calc(100% - 20px) 100%, 0% 100%, 20px 50%)';
  };

  return (
    <div className="funil-section">
      <h2 className="text-text-primary text-sm font-bold uppercase tracking-wide mb-4">
        INDICADORES OPERACIONAIS (FUNIL)
      </h2>
      
      <div className="flex gap-5 items-stretch">
        {/* Container do funil horizontal - 75% da largura */}
        <div className="flex-[9] flex items-stretch">
          {indicadores.map((ind, index) => (
            <div
              key={index}
              className="funil-card flex-1 relative py-6 px-4 text-center transition-all duration-300 flex flex-col gap-2 min-w-[110px] justify-center font-bold hover:scale-[1.03] hover:-translate-y-1"
              style={{
                background: coresFunil[index] || coresFunil[coresFunil.length - 1],
                clipPath: getClipPath(index, indicadores.length),
                marginRight: index < indicadores.length - 1 ? '-5px' : '0',
                marginLeft: index === 0 ? '0' : undefined,
                paddingLeft: index === 0 ? '20px' : '25px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                zIndex: indicadores.length - index,
              }}
            >
              <span className="text-[#212529] text-xs font-bold uppercase tracking-wide leading-tight">
                {ind.titulo}
              </span>
              <span className="text-[#212529] text-2xl font-bold">
                {ind.valor.toLocaleString('pt-BR')}
              </span>
            </div>
          ))}
        </div>

        {/* Cards laterais - 25% da largura */}
        <div className="flex-[3] flex flex-col gap-4">
          {/* Leads Perdidos */}
          <div 
            className="flex-1 rounded-lg p-4 text-center border transition-all duration-300 flex flex-col gap-2 justify-center hover:-translate-y-1"
            style={{
              background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
              borderColor: '#c0392b',
              boxShadow: '0 4px 12px rgba(231, 76, 60, 0.2)',
            }}
          >
            <span className="text-white text-xs font-bold uppercase tracking-wide">
              LEADS PERDIDOS
            </span>
            <span className="text-white text-2xl font-bold">
              {leadsPerdidos.toLocaleString('pt-BR')}
            </span>
          </div>

          {/* Leads Descartados */}
          <div 
            className="flex-1 rounded-lg p-4 text-center border transition-all duration-300 flex flex-col gap-2 justify-center hover:-translate-y-1"
            style={{
              background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
              borderColor: '#c0392b',
              boxShadow: '0 4px 12px rgba(231, 76, 60, 0.2)',
            }}
          >
            <span className="text-white text-xs font-bold uppercase tracking-wide">
              LEADS DESCARTADOS
            </span>
            <span className="text-white text-2xl font-bold">
              {leadsDescartados.toLocaleString('pt-BR')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
