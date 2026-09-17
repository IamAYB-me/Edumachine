import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils';
import { getPageNumbers } from '@/hooks/usePagination';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  start: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({ page, totalPages, total, start, pageSize, onPageChange, className }: PaginationProps) {
  if (total <= pageSize) return null;

  const pages = getPageNumbers(page, totalPages);

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 dark:border-slate-700", className)}>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Showing {start + 1}–{Math.min(start + pageSize, total)} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`e${i}`} className="px-2 text-xs text-slate-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                "w-8 h-8 rounded-lg text-xs font-bold transition-colors",
                p === page
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}