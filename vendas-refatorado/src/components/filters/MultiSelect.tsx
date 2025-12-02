/**
 * Componente MultiSelect - Seleção múltipla de opções
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

interface MultiSelectProps {
  label: string;
  icon?: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export default function MultiSelect({
  label,
  icon,
  options,
  selectedValues,
  onChange,
  placeholder = 'Selecione...',
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggle = (option: string) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter((v) => v !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  const handleSelectAll = () => {
    if (selectedValues.length === options.length) {
      onChange([]);
    } else {
      onChange([...options]);
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div className="filter-group" ref={containerRef}>
      <label className="filter-label">
        {icon && <span className="mr-1">{icon}</span>}
        {label}
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="filter-select flex items-center justify-between"
      >
        <span className="truncate">
          {selectedValues.length === 0
            ? placeholder
            : selectedValues.length === options.length
            ? 'Todos selecionados'
            : `${selectedValues.length} selecionados`}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-dark-tertiary rounded-lg border border-dark-border shadow-xl max-h-64 overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-dark-border">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar..."
              className="filter-input text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 p-2 border-b border-dark-border">
            <button
              type="button"
              onClick={handleSelectAll}
              className="btn-secondary text-xs flex-1"
            >
              {selectedValues.length === options.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="btn-secondary text-xs flex-1"
            >
              Limpar
            </button>
          </div>

          {/* Options List */}
          <div className="max-h-40 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-text-muted text-sm">
                Nenhum resultado encontrado
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option}
                  onClick={() => handleToggle(option)}
                  className={`
                    flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors
                    hover:bg-primary-500/10
                    ${selectedValues.includes(option) ? 'bg-primary-500/20' : ''}
                  `}
                >
                  <div
                    className={`
                      w-4 h-4 rounded border flex items-center justify-center
                      ${selectedValues.includes(option) 
                        ? 'bg-primary-500 border-primary-500' 
                        : 'border-gray-500'
                      }
                    `}
                  >
                    {selectedValues.includes(option) && <Check size={12} />}
                  </div>
                  <span className="text-sm text-text-primary truncate">{option}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
