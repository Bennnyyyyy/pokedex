import { ChevronLeft, ChevronRight } from 'lucide-react';

function Pagination({ currentPage, totalPages, onPageChange }) {
  const maxPageButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
  
  if (endPage - startPage + 1 < maxPageButtons) {
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }
  
  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }
  
  return (
    <div className="flex justify-center space-x-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`space-button !py-1 !px-2 ${
          currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <ChevronLeft size={18} />
      </button>
      
      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className={`space-button ${currentPage === 1 ? 'bg-red-700' : ''}`}
          >
            1
          </button>
          {startPage > 2 && (
            <span className="flex items-center text-gray-400">...</span>
          )}
        </>
      )}
      
      {pageNumbers.map(number => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`space-button ${
            currentPage === number ? 'from-white-700 to-indigo-700' : ''
          }`}
        >
          {number}
        </button>
      ))}
      
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span className="flex items-center text-gray-400">...</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className={`space-button ${
              currentPage === totalPages ? 'bg-red-700' : ''
            }`}
          >
            {totalPages}
          </button>
        </>
      )}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`space-button !py-1 !px-2 ${
          currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

export default Pagination;