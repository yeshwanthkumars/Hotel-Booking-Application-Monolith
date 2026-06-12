export default function Pagination({ page, totalPages, onPageChange, isLoading }) {
  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(0, page - 2);
      let end = Math.min(totalPages, start + maxVisible);

      if (end - start < maxVisible) {
        start = Math.max(0, end - maxVisible);
      }

      for (let i = start; i < end; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages();
  const hasNextPage = page < totalPages - 1;
  const hasPrevPage = page > 0;

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrevPage || isLoading}
        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Page Numbers */}
      {visiblePages.map((p, idx) => {
        const showDotBefore = idx === 0 && p > 0;
        const showDotAfter = idx === visiblePages.length - 1 && p < totalPages - 1;

        return (
          <div key={p}>
            {showDotBefore && <span className="px-2 text-gray-500">...</span>}
            <button
              onClick={() => onPageChange(p)}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                page === p
                  ? 'bg-indigo-600 text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50'
              }`}
            >
              {p + 1}
            </button>
            {showDotAfter && <span className="px-2 text-gray-500">...</span>}
          </div>
        );
      })}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNextPage || isLoading}
        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
