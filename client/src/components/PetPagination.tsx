import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';

interface Props {
  page: number;
  totalPages: number;
  isFetching: boolean;
  onPageChange: (page: number) => void;
}

export default function PetPagination({ page, totalPages, isFetching, onPageChange }: Props) {
  const pageNumbers = useMemo(() => {
    const nums: (number | '…')[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) nums.push(i);
      else if (nums[nums.length - 1] !== '…') nums.push('…');
    }
    return nums;
  }, [totalPages, page]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-12 flex-wrap">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1 || isFetching}
        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:border-amber-300 hover:text-amber-600 transition-colors shadow-sm"
      >
        <ChevronLeft className="w-4 h-4" /> Prev
      </button>

      {pageNumbers.map((n, i) =>
        n === '…' ? (
          <span key={`d-${i}`} className="px-1 text-gray-400">…</span>
        ) : (
          <button
            key={n}
            onClick={() => onPageChange(n as number)}
            disabled={isFetching}
            className={`w-10 h-10 rounded-xl text-sm font-semibold transition-colors shadow-sm ${
              n === page
                ? 'bg-amber-500 text-white border border-amber-500'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-600'
            }`}
          >
            {n}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages || isFetching}
        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:border-amber-300 hover:text-amber-600 transition-colors shadow-sm"
      >
        Next <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
