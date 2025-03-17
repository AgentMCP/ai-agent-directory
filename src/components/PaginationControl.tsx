import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationControl = ({ currentPage, totalPages, onPageChange }: PaginationControlProps) => {
  // Determine which page numbers to show
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // Always show first page
    pageNumbers.push(1);
    
    // Calculate range around current page
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Add ellipsis after page 1 if needed
    if (startPage > 2) {
      pageNumbers.push('ellipsis-start');
    }
    
    // Add pages around current page
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pageNumbers.push('ellipsis-end');
    }
    
    // Always show last page if there is more than one page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  return (
    <div className="flex justify-center">
      <div className="flex items-center gap-1">
        {currentPage > 1 && (
          <button
            onClick={() => onPageChange(currentPage - 1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 hover:border-primary hover:text-primary transition-colors"
            aria-label="Go to previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        
        {getPageNumbers().map((page, index) => {
          if (page === 'ellipsis-start' || page === 'ellipsis-end') {
            return (
              <span key={`ellipsis-${index}`} className="flex h-9 w-9 items-center justify-center text-gray-500">
                ...
              </span>
            );
          }
          
          const isActive = currentPage === page;
          
          return (
            <button
              key={index}
              onClick={() => onPageChange(page as number)}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors ${
                isActive 
                  ? 'bg-primary text-white' 
                  : 'hover:bg-gray-100'
              }`}
              aria-label={`Go to page ${page}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {page}
            </button>
          );
        })}
        
        {currentPage < totalPages && (
          <button
            onClick={() => onPageChange(currentPage + 1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 hover:border-primary hover:text-primary transition-colors"
            aria-label="Go to next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default PaginationControl;
