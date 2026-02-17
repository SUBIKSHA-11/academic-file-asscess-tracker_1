function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        Prev
      </button>

      {[...Array(totalPages)].map((_, index) => (
        <button
          key={index}
          onClick={() => onPageChange(index + 1)}
          className={`px-3 py-1 rounded ${
            currentPage === index + 1
              ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
              : "bg-gray-200"
          }`}
        >
          {index + 1}
        </button>
      ))}

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;
