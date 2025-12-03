/**
 * Componente Sidebar do Dashboard de Vendas
 */

import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, BarChart3, TrendingUp, Target, Home } from 'lucide-react';
import { PAGES } from '@/config/app.config';

interface SidebarProps {
  paginaAtiva: string;
  onPaginaChange: (pagina: string) => void;
  isCollapsed: boolean;
  onCollapseChange: (collapsed: boolean) => void;
  children?: React.ReactNode;
}

const SIDEBAR_WIDTH_EXPANDED = 300;
const SIDEBAR_WIDTH_COLLAPSED = 60;

export default function Sidebar({
  paginaAtiva,
  onPaginaChange,
  isCollapsed,
  onCollapseChange,
  children,
}: SidebarProps) {
  const getIcon = (pageId: string) => {
    switch (pageId) {
      case 'metas':
        return <BarChart3 size={20} />;
      case 'indicadores':
        return <TrendingUp size={20} />;
      case 'funil':
        return <Target size={20} />;
      default:
        return <BarChart3 size={20} />;
    }
  };

  return (
    <>
      {/* Sidebar Container */}
      <aside
        className="fixed left-0 top-0 bottom-0 bg-dark-secondary overflow-y-auto overflow-x-hidden transition-all duration-300 z-50"
        style={{
          width: isCollapsed ? `${SIDEBAR_WIDTH_COLLAPSED}px` : `${SIDEBAR_WIDTH_EXPANDED}px`,
          borderRight: '2px solid #343A40',
        }}
      >
        {/* Conteúdo da Sidebar */}
        <div className={`pt-5 ${isCollapsed ? 'px-2' : 'p-5'}`}>
          {/* Toggle Button */}
          <button
            onClick={() => onCollapseChange(!isCollapsed)}
            className={`
              w-full flex items-center justify-center rounded-lg cursor-pointer transition-all duration-200 
              bg-orange-500/10 border border-orange-500 hover:bg-orange-500/20 mb-4
              ${isCollapsed ? 'h-10' : 'h-9 px-4'}
            `}
            title={isCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
          >
            {isCollapsed ? (
              <ChevronRight size={18} className="text-orange-500" />
            ) : (
              <div className="flex items-center justify-between w-full">
                <span className="text-orange-500 text-sm font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Recolher
                </span>
                <ChevronLeft size={18} className="text-orange-500" />
              </div>
            )}
          </button>

          {/* Link para Central de Dashboards */}
          <a
            href="https://central-dashs-viva-html.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className={`
              flex items-center rounded-lg transition-all duration-200 text-gray-400 border border-transparent hover:bg-white/5
              ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-4 py-2.5'}
            `}
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '0.95rem',
              fontWeight: 500,
            }}
            title="Central de Dashboards"
          >
            <Home size={20} strokeWidth={2} />
            {!isCollapsed && <span>Central de Dashboards</span>}
          </a>

          <hr className="border-dark-tertiary my-4" />

          {/* Navegação de Páginas */}
          <nav className="flex flex-col gap-1.5 mb-6">
            {PAGES.map((page) => (
              <button
                key={page.id}
                onClick={() => onPaginaChange(page.id)}
                className={`
                  group flex items-center rounded-lg transition-all duration-200
                  ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-4 py-2.5'}
                  ${paginaAtiva === page.id
                    ? 'bg-orange-500/10 border border-orange-500 text-orange-500'
                    : 'text-gray-400 border border-transparent hover:bg-white/5'
                  }
                `}
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '0.95rem',
                  fontWeight: paginaAtiva === page.id ? 600 : 500,
                }}
                title={isCollapsed ? page.label : undefined}
              >
                {React.cloneElement(getIcon(page.id), {
                  strokeWidth: paginaAtiva === page.id ? 2.5 : 2
                })}
                {!isCollapsed && <span>{page.label}</span>}
              </button>
            ))}
          </nav>

          {/* Filtros (children) - só mostra quando expandido */}
          {!isCollapsed && (
            <>
              <hr className="border-dark-tertiary my-4" />
              <div className="filters-content">
                {children}
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
