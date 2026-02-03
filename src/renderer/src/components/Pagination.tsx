import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  
  // Lógica para gerar os números das páginas (Janela deslizante)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    // Sempre mostra a página 1
    pages.push(1);

    // Lógica para mostrar "..." ou números próximos
    // Vamos mostrar: 1 ... [Atual-1] [Atual] [Atual+1] ... [Ultima]
    
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    // Ajuste fino para quando estiver no começo ou fim
    if (currentPage <= 3) {
      end = Math.min(4, totalPages - 1);
    }
    if (currentPage >= totalPages - 2) {
      start = Math.max(2, totalPages - 3);
    }

    if (start > 2) {
      pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push('...');
    }

    // Sempre mostra a última página (se for maior que 1)
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
      <div className="text-sm text-gray-500 hidden sm:block">
        Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Botão para Primeira */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="px-2 py-1 rounded text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-500"
          title="Primeira Página"
        >
          «
        </button>

        {/* Botão Anterior */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-2 py-1 rounded text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-500 mr-2"
        >
          ‹
        </button>

        {/* Números das Páginas (Quadradinhos) */}
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-2 text-gray-400">...</span>
            ) : (
              <button
                // @ts-ignore
                onClick={() => onPageChange(page)}
                className={`w-8 h-8 flex items-center justify-center rounded text-sm font-bold transition-colors ${
                  currentPage === page
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        {/* Botão Próxima */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-2 py-1 rounded text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-500 ml-2"
        >
          ›
        </button>

        {/* Botão para Última */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-2 py-1 rounded text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-500"
          title="Última Página"
        >
          »
        </button>
      </div>
    </div>
  );
}