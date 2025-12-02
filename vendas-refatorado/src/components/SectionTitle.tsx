/**
 * Componente SectionTitle - Título de seção padronizado
 */

import React from 'react';

interface SectionTitleProps {
  children: React.ReactNode;
  indicator?: string;
  className?: string;
}

export default function SectionTitle({ children, indicator, className = '' }: SectionTitleProps) {
  return (
    <h2 className={`section-title ${className}`}>
      {children}
      {indicator && (
        <span className="text-primary-500 ml-2">({indicator})</span>
      )}
    </h2>
  );
}
