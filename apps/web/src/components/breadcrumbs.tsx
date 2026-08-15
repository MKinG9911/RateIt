'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center space-x-1.5 sm:space-x-2 text-xs text-text-muted mb-6 flex-wrap gap-y-1.5 ${className}`}
    >
      <Link
        href="/"
        className="flex items-center gap-1 text-text-secondary hover:text-primary transition-colors shrink-0 py-0.5"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="hidden xs:inline">Home</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            <ChevronRight className="w-3.5 h-3.5 text-text-muted/50 shrink-0" />
            {isLast || !item.href ? (
              <span className="font-semibold text-text-primary truncate max-w-[150px] sm:max-w-[240px] md:max-w-[320px]">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-text-secondary hover:text-primary transition-colors truncate max-w-[130px] sm:max-w-[200px]"
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
