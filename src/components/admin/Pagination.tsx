'use client';

import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
  totalItems?: number;
  itemsPerPage?: number;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showInfo = true,
  totalItems,
  itemsPerPage,
  className = '',
}) => {
  // Calcola le pagine da mostrare
  const getVisiblePages = () => {
    const delta = 2; // Numero di pagine da mostrare prima e dopo la pagina corrente
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  // Calcola le informazioni da mostrare
  const getItemsInfo = () => {
    if (!totalItems || !itemsPerPage) return null;
    
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    
    return { startItem, endItem };
  };

  const itemsInfo = getItemsInfo();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Informazioni sui risultati */}
      {showInfo && itemsInfo && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Mostrando <span className="font-medium">{itemsInfo.startItem}</span> -{' '}
          <span className="font-medium">{itemsInfo.endItem}</span> di{' '}
          <span className="font-medium">{totalItems}</span> risultati
        </div>
      )}

      {/* Controlli di paginazione */}
      <div className="flex items-center space-x-1">
        {/* Pulsante Precedente */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`
            flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
            ${
              currentPage === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-blue-900/20'
            }
          `}
        >
          <ChevronLeftIcon className="w-4 h-4 mr-1" />
          Precedente
        </motion.button>

        {/* Numeri di pagina */}
        <div className="flex items-center space-x-1">
          {visiblePages.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`dots-${index}`}
                  className="px-3 py-2 text-sm text-gray-400"
                >
                  ...
                </span>
              );
            }

            const pageNumber = page as number;
            const isCurrentPage = pageNumber === currentPage;

            return (
              <motion.button
                key={pageNumber}
                whileHover={{ scale: isCurrentPage ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onPageChange(pageNumber)}
                className={`
                  px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${
                    isCurrentPage
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-blue-900/20'
                  }
                `}
              >
                {pageNumber}
              </motion.button>
            );
          })}
        </div>

        {/* Pulsante Successivo */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`
            flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
            ${
              currentPage === totalPages
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-blue-900/20'
            }
          `}
        >
          Successivo
          <ChevronRightIcon className="w-4 h-4 ml-1" />
        </motion.button>
      </div>
    </div>
  );
};

// Componente per la selezione del numero di elementi per pagina
export interface PageSizeSelectorProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  options?: number[];
  className?: string;
}

export const PageSizeSelector: React.FC<PageSizeSelectorProps> = ({
  pageSize,
  onPageSizeChange,
  options = [10, 25, 50, 100],
  className = '',
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-sm text-gray-600 dark:text-gray-400">
        Mostra
      </span>
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        className="
          px-3 py-1 text-sm border border-gray-300 rounded-md
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          dark:bg-gray-700 dark:border-gray-600 dark:text-white
        "
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="text-sm text-gray-600 dark:text-gray-400">
        per pagina
      </span>
    </div>
  );
};

// Hook per gestire la paginazione
export const usePagination = (initialPage = 1, initialPageSize = 25) => {
  const [currentPage, setCurrentPage] = React.useState(initialPage);
  const [pageSize, setPageSize] = React.useState(initialPageSize);

  const handlePageChange = React.useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = React.useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset alla prima pagina quando cambia la dimensione
  }, []);

  const resetPagination = React.useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    resetPagination,
  };
};

// Componente combinato con paginazione e selezione dimensione pagina
export interface PaginationWithSizeSelectorProps extends PaginationProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

export const PaginationWithSizeSelector: React.FC<PaginationWithSizeSelectorProps> = ({
  pageSize,
  onPageSizeChange,
  pageSizeOptions,
  ...paginationProps
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <PageSizeSelector
        pageSize={pageSize}
        onPageSizeChange={onPageSizeChange}
        options={pageSizeOptions}
      />
      <Pagination {...paginationProps} />
    </div>
  );
};

// Componente per il salto rapido a una pagina
export interface QuickJumpProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const QuickJump: React.FC<QuickJumpProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  const [inputValue, setInputValue] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(inputValue);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      setInputValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex items-center space-x-2 ${className}`}>
      <span className="text-sm text-gray-600 dark:text-gray-400">
        Vai alla pagina:
      </span>
      <input
        type="number"
        min="1"
        max={totalPages}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={currentPage.toString()}
        className="
          w-16 px-2 py-1 text-sm border border-gray-300 rounded-md text-center
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          dark:bg-gray-700 dark:border-gray-600 dark:text-white
        "
      />
      <button
        type="submit"
        className="
          px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800
          dark:text-blue-400 dark:hover:text-blue-300
        "
      >
        Vai
      </button>
    </form>
  );
};

export default Pagination;