/**
 * Componente Header do Dashboard de Vendas
 */

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Header() {
  const [dataAtual, setDataAtual] = useState<string>('');
  const [anoAtual, setAnoAtual] = useState<number>(2025);

  useEffect(() => {
    setDataAtual(new Date().toLocaleString('pt-BR'));
    setAnoAtual(new Date().getFullYear());
  }, []);

  return (
    <header className="bg-dark-primary">
      <div className="container mx-auto px-4 py-4">
        <div 
          className="bg-dark-secondary p-5 rounded-lg flex justify-between items-center"
          style={{
            boxShadow: '0 4px 10px rgba(255,102,0,0.12)',
            borderBottom: '3px solid #FF6600',
          }}
        >
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="relative w-44 h-14">
              <Image 
                src="/images/logo_viva.png" 
                alt="Viva Eventos" 
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
            
            {/* Título */}
            <div className="border-l border-gray-600 pl-6 h-14 flex flex-col justify-center">
              <h1 
                className="text-2xl font-bold uppercase tracking-wider mb-1"
                style={{ 
                  fontFamily: "'Orbitron', 'Poppins', sans-serif",
                  background: 'linear-gradient(to bottom, #F8F9FA 0%, #ADB5BD 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                }}
              >
                Dashboard de Vendas
              </h1>
              <span className="text-xs text-text-secondary">
                VIVA Eventos Brasil - {anoAtual}
              </span>
            </div>
          </div>

          {/* Data de atualização */}
          <div className="text-right">
            <p className="text-xs text-text-muted">Última atualização</p>
            <p className="text-sm text-text-secondary font-medium">
              {dataAtual || 'Carregando...'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
