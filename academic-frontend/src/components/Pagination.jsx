function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-3 py-1 rounded border border-[#DFD9D8] bg-[#F1F2ED] text-[#2E2D1D] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#DFD9D8]"
      >
        Prev
      </button>

      {[...Array(totalPages)].map((_, index) => (
        <button
          key={index}
          onClick={() => onPageChange(index + 1)}
          className={`px-3 py-1 rounded ${
            currentPage === index + 1
              ? "bg-[#201e1e] text-[#F1F2ED]"
              : "border border-[#DFD9D8] bg-[#F1F2ED] text-[#2E2D1D] hover:bg-[#DFD9D8]"
          }`}
        >
          {index + 1}
        </button>
      ))}

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-3 py-1 rounded border border-[#DFD9D8] bg-[#F1F2ED] text-[#2E2D1D] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#DFD9D8]"
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;
