import { ChevronLeft, ChevronRight } from "lucide-react";

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  let startPage = Math.max(1, currentPage - 1);
  let endPage = Math.min(totalPages, startPage + 2);

  startPage = Math.max(1, endPage - 2);

  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index
  );
  const baseButtonClass =
    "flex h-11 w-11 flex-none items-center justify-center rounded-2xl border border-[#D0D0D0] bg-white text-base font-semibold text-[#222222] transition-colors hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-40 sm:h-12 sm:w-12";
  const numberButtonClass =
    "border-[#D0D0D0] bg-white text-[#222222] hover:bg-[#F5F5F5]";

  return (
    <div className="mt-6 flex justify-center">
      <div className="flex max-w-full items-center justify-center gap-2 overflow-x-auto px-1 sm:gap-3">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={baseButtonClass}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`${baseButtonClass} ${
              currentPage === page
                ? "border-[3px] border-black bg-white text-black shadow-sm"
                : numberButtonClass
            }`}
          >
            {page}
          </button>
        ))}

        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={baseButtonClass}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
