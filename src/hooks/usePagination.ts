import { useEffect, useMemo, useState } from 'react';

export function usePagination<T>(items: T[], pageSize = 10) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const current = Math.min(page, totalPages);
  const start = (current - 1) * pageSize;
  const slice = useMemo(() => items.slice(start, start + pageSize), [items, start, pageSize]);

  return { page: current, setPage, totalPages, pageSize, slice, start, total: items.length, reset: () => setPage(1) };
}

export function getPageNumbers(page: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | '...')[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  if (start > 2) pages.push('...');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 1) pages.push('...');
  pages.push(totalPages);
  return pages;
}