/**
 * Componente Sidebar do Dashboard de Vendas
 */

import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, BarChart3, TrendingUp, Target, Home, LogOut } from 'lucide-react';
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
        className="fixed left-0 top-0 bottom-0 bg-dark-secondary overflow-y-auto transition-all duration-300 z-50"
        style={{
          width: isCollapsed ? `${SIDEBAR_WIDTH_COLLAPSED}px` : `${SIDEBAR_WIDTH_EXPANDED}px`,
          borderRight: '2px solid #343A40',
          overflow: 'visible',
        }}
      >
        {/* Toggle Button - Na beirada direita da sidebar */}
        <button
          onClick={() => onCollapseChange(!isCollapsed)}
          className="absolute w-8 h-8 flex items-center justify-center rounded-md bg-dark-secondary border border-orange-500 hover:bg-orange-500/20 cursor-pointer transition-all duration-200 shadow-lg"
          style={{
            top: '24px',
            right: '-16px',
            zIndex: 60,
          }}
          title={isCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
        >
          {isCollapsed ? (
            <ChevronRight size={18} className="text-orange-500" />
          ) : (
            <ChevronLeft size={18} className="text-orange-500" />
          )}
        </button>

        {/* Conteúdo da Sidebar - com scroll */}
        <div 
          className={`${isCollapsed ? 'px-2 pt-16' : 'p-5 pt-16'} flex flex-col`}
          style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}
        >
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

          {/* Espaçador flexível para empurrar o botão de logout para baixo */}
          <div className="flex-grow" />

          {/* Botão de Logout */}
          <div className={`${isCollapsed ? 'pb-4' : 'pb-6'}`}>
            <hr className="border-dark-tertiary mb-4" />
            <button
              onClick={() => {
                // TODO: Implementar função de logout
                console.log('Logout clicado');
              }}
              className={`
                flex items-center rounded-lg transition-all duration-200 text-gray-400 border border-transparent hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50
                ${isCollapsed ? 'justify-center p-2.5 w-full' : 'gap-3 px-4 py-2.5 w-full'}
              `}
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '0.95rem',
                fontWeight: 500,
              }}
              title={isCollapsed ? 'Sair' : undefined}
            >
              <LogOut size={20} strokeWidth={2} />
              {!isCollapsed && <span>Sair</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
