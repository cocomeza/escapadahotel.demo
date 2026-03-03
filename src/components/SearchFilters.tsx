import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { LOCACIONES_OPCIONES, formatearPrecio, PRECIO_MAX_DEFAULT } from '../lib/constants';

interface SearchFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  location: string;
  minPrice: number;
  maxPrice: number;
  rating: number;
}

export default function SearchFilters({ filters, onFilterChange }: SearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const handleFilterChange = (key: keyof FilterState, value: string | number) => {
    const newFilters = { ...filters, [key]: value };
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    onFilterChange({
      location: '',
      minPrice: 0,
      maxPrice: PRECIO_MAX_DEFAULT,
      rating: 0,
    });
  };

  const hasActiveFilters = filters.location || filters.minPrice > 0 || filters.maxPrice < PRECIO_MAX_DEFAULT || filters.rating > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 mb-6 sm:mb-8 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800">Filtros de búsqueda</h3>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-cyan-600 transition-colors"
            >
              Limpiar
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-cyan-500 hover:text-cyan-600 transition-colors py-2 px-3 rounded-lg hover:bg-cyan-50 touch-manipulation"
            aria-expanded={showFilters}
            aria-controls="filtros-contenido"
          >
            <SlidersHorizontal className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{showFilters ? 'Ocultar' : 'Mostrar'} filtros</span>
          </button>
        </div>
      </div>

      <div id="filtros-contenido" role="region" aria-label="Opciones de filtro">
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-100 mt-4">
            <div>
              <label htmlFor="filter-ubicacion" className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación
              </label>
              <select
                id="filter-ubicacion"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-base"
              >
                {LOCACIONES_OPCIONES.map((opt) => (
                  <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filter-precio-min" className="block text-sm font-medium text-gray-700 mb-2">
                Precio mínimo (pesos)
              </label>
              <input
                id="filter-precio-min"
                type="number"
                min={0}
                value={filters.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', Number(e.target.value) || 0)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="filter-precio-max" className="block text-sm font-medium text-gray-700 mb-2">
                Precio máximo (pesos)
              </label>
              <input
                id="filter-precio-max"
                type="number"
                min={0}
                value={filters.maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value) || PRECIO_MAX_DEFAULT)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder={formatearPrecio(PRECIO_MAX_DEFAULT)}
              />
            </div>

            <div>
              <label htmlFor="filter-rating" className="block text-sm font-medium text-gray-700 mb-2">
                Calificación mínima
              </label>
              <select
                id="filter-rating"
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', Number(e.target.value))}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="0">Todas</option>
                <option value="3">3+ estrellas</option>
                <option value="4">4+ estrellas</option>
                <option value="4.5">4.5+ estrellas</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
