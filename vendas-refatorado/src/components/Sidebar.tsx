/**
 * Componente Sidebar do Dashboard de Vendas
 */

import React, { useState } from 'react';
import { ChevronRight, BarChart3, TrendingUp, Target } from 'lucide-react';
import { PAGES } from '@/config/app.config';

interface SidebarProps {
  paginaAtiva: string;
  onPaginaChange: (pagina: string) => void;
  isCollapsed: boolean;
  onCollapseChange: (collapsed: boolean) => void;
  children?: React.ReactNode;
}

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
          width: isCollapsed ? '0px' : '280px',
          borderRight: isCollapsed ? 'none' : '2px solid #343A40',
        }}
      >
        {/* Toggle Button */}
        <button
          onClick={() => onCollapseChange(!isCollapsed)}
          className="fixed z-50 w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-200"
          style={{
            left: isCollapsed ? '10px' : '270px',
            top: '80px',
            background: 'linear-gradient(to bottom, #FF7A33 0%, #FF6600 50%, #E55A00 100%)',
            boxShadow: '0 4px 12px rgba(255, 102, 0, 0.4)',
          }}
          title={isCollapsed ? 'Mostrar Filtros' : 'Esconder Filtros'}
        >
          <ChevronRight
            size={20}
            color="#000"
            style={{
              transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
              transition: 'transform 0.3s ease',
            }}
          />
        </button>

        {/* Conteúdo da Sidebar */}
        {!isCollapsed && (
          <div className="p-5 pt-16">
            {/* Link para Central de Dashboards */}
            <a
              href="https://central-dashs-viva-html.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full p-3 mb-4 text-center rounded-lg transition-all duration-200 text-sm font-medium"
              style={{
                background: 'linear-gradient(180deg, #3a3f44 0%, #2e3236 100%)',
                color: '#e9ecef',
                border: '1px solid rgba(0,0,0,0.45)',
              }}
            >
              Central de Dashboards
              <br />
              VIVA Eventos
            </a>

            <hr className="border-dark-tertiary my-4" />

            {/* Navegação de Páginas */}
            <nav className="flex flex-col gap-2 mb-6">
              {PAGES.map((page) => (
                <button
                  key={page.id}
                  onClick={() => onPaginaChange(page.id)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${paginaAtiva === page.id
                      ? 'text-white font-semibold'
                      : 'text-gray-400 hover:bg-white/5'
                    }
                  `}
                  style={
                    paginaAtiva === page.id
                      ? {
                          background: 'linear-gradient(180deg, #ff8a33 0%, #FF6600 50%, #e65500 100%)',
                          boxShadow: '0 4px 12px rgba(255, 102, 0, 0.3)',
                        }
                      : {
                          background: 'linear-gradient(180deg, #3a3f44 0%, #2e3236 100%)',
                          border: '1px solid rgba(0,0,0,0.45)',
                        }
                  }
                >
                  {getIcon(page.id)}
                  <span>{page.label}</span>
                </button>
              ))}
            </nav>

            <hr className="border-dark-tertiary my-4" />

            {/* Filtros (children) */}
            <div className="filters-content">
              {children}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
