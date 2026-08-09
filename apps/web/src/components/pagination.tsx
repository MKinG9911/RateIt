'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  queryParams?: Record<string, string>;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  queryParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const buildUrl = (page: number) => {
    const params = new URLSearchParams({ ...queryParams, page: String(page) });
    return `${basePath}?${params.toString()}`;
  };

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <Link
        href={currentPage > 1 ? buildUrl(currentPage - 1) : '#'}
        className={`p-2 rounded-lg transition-colors ${
          currentPage > 1
            ? 'hover:bg-surface-light text-text-secondary'
            : 'text-text-muted cursor-not-allowed pointer-events-none'
        }`}
      >
        <ChevronLeft className="w-5 h-5" />
      </Link>

      {pages.map((page, i) =>
        page === '...' ? (
          <span key={`dots-${i}`} className="px-3 py-2 text-text-muted">
            ...
          </span>
        ) : (
          <Link
            key={page}
            href={buildUrl(page)}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
              page === currentPage
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:bg-surface-light hover:text-text-primary'
            }`}
          >
            {page}
          </Link>
        ),
      )}

      <Link
        href={currentPage < totalPages ? buildUrl(currentPage + 1) : '#'}
        className={`p-2 rounded-lg transition-colors ${
          currentPage < totalPages
            ? 'hover:bg-surface-light text-text-secondary'
            : 'text-text-muted cursor-not-allowed pointer-events-none'
        }`}
      >
        <ChevronRight className="w-5 h-5" />
      </Link>
    </div>
  );
}
