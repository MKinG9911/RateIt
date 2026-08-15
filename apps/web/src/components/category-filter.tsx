'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  RotateCcw,
  Star,
  Layers,
  ArrowUpDown,
  X,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

interface SubcategoryItem {
  id: string;
  name: string;
  slug: string;
  _count?: { listings: number };
}

interface CategoryFilterProps {
  category: {
    id: string;
    name: string;
    slug: string;
    parentId?: string | null;
    parent?: {
      id: string;
      name: string;
      slug: string;
      children?: SubcategoryItem[];
    } | null;
    children?: SubcategoryItem[];
  };
  selectedSubcategoryId: string | null;
  onSelectSubcategory: (subcategoryId: string | null) => void;
  minRating: number;
  onChangeMinRating: (rating: number) => void;
  sort: string;
  onChangeSort: (sort: string) => void;
  searchQuery: string;
  onChangeSearch: (query: string) => void;
  onResetFilters: () => void;
  totalResults: number;
}

export function CategoryFilter({
  category,
  selectedSubcategoryId,
  onSelectSubcategory,
  minRating,
  onChangeMinRating,
  sort,
  onChangeSort,
  searchQuery,
  onChangeSearch,
  onResetFilters,
  totalResults,
}: CategoryFilterProps) {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Determine subcategories list (either from category.children if parent, or category.parent.children if subcategory)
  const isParent = !category.parentId && category.children && category.children.length > 0;
  const subcategoriesList: SubcategoryItem[] = isParent
    ? category.children || []
    : category.parent?.children || [];

  const parentName = isParent ? category.name : category.parent?.name || category.name;
  const parentSlug = isParent ? category.slug : category.parent?.slug || category.slug;

  const hasActiveFilters =
    Boolean(selectedSubcategoryId) ||
    Boolean(searchQuery.trim()) ||
    minRating > 0 ||
    sort !== 'newest';

  const filterContent = (
    <div className="space-y-6">
      {/* Header & Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" />
          <span className="font-bold text-sm text-text-primary">Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      {/* Keyword Search */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
          Search in {category.name}
        </label>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, brand..."
            value={searchQuery}
            onChange={(e) => onChangeSearch(e.target.value)}
            className="input pl-10 pr-8 py-2 text-xs w-full"
          />
          {searchQuery && (
            <button
              onClick={() => onChangeSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Subcategory Hierarchy Filter */}
      {subcategoriesList.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
              Subcategories
            </label>
            <Link
              href={`/categories/${parentSlug}`}
              className="text-[11px] text-text-muted hover:text-primary transition-colors"
            >
              All {parentName}
            </Link>
          </div>

          <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
            {/* All Subcategories Button */}
            <button
              onClick={() => onSelectSubcategory(null)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${!selectedSubcategoryId
                ? 'bg-primary/15 text-primary font-semibold border border-primary/30'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-light'
                }`}
            >
              <span className="flex items-center gap-2 truncate">
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span>All {parentName}</span>
              </span>
            </button>

            {/* Individual Subcategories */}
            {subcategoriesList.map((sub) => {
              const isSelected =
                selectedSubcategoryId === sub.id || (!selectedSubcategoryId && category.id === sub.id);

              return (
                <button
                  key={sub.id}
                  onClick={() => onSelectSubcategory(sub.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${isSelected
                    ? 'bg-primary/15 text-primary font-semibold border border-primary/30'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-light'
                    }`}
                >
                  <span className="truncate pr-1">• {sub.name}</span>
                  {sub._count?.listings !== undefined && (
                    <span className="text-[10px] text-text-muted font-mono bg-surface px-1.5 py-0.5 rounded shrink-0">
                      {sub._count.listings}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Rating Filter */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
          Minimum Rating
        </label>
        <div className="space-y-1">
          {[
            { value: 0, label: 'All Ratings' },
            { value: 4, label: '4.0 & above' },
            { value: 3, label: '3.0 & above' },
            { value: 2, label: '2.0 & above' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => onChangeMinRating(option.value)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${minRating === option.value
                ? 'bg-primary/15 text-primary font-semibold border border-primary/30'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-light'
                }`}
            >
              <span className="flex items-center gap-1.5">
                {option.value > 0 ? (
                  <>
                    <Star className="w-3.5 h-3.5 fill-star text-star" />
                    <span>{option.label}</span>
                  </>
                ) : (
                  <span>{option.label}</span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Sort Filter */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
          Sort By
        </label>
        <div className="relative">
          <ArrowUpDown className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <select
            value={sort}
            onChange={(e) => onChangeSort(e.target.value)}
            className="input pl-10 py-2 text-xs w-full bg-surface cursor-pointer appearance-none"
          >
            <option value="newest">Newest First</option>
            <option value="rating">Highest Rated</option>
            <option value="reviews">Most Reviews</option>
            <option value="name">Name (A — Z)</option>
            <option value="oldest">Oldest First</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Results Count Banner */}
      <div className="pt-3 border-t border-surface-border text-center">
        <span className="text-xs text-text-muted">
          Showing <strong className="text-text-primary">{totalResults}</strong> matching{' '}
          {totalResults === 1 ? 'listing' : 'listings'}
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24 card p-5 border border-surface-border">
          {filterContent}
        </div>
      </aside>

      {/* Mobile Filters Accordion / Drawer Trigger */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="w-full flex items-center justify-between card py-3 px-4 text-sm font-semibold text-text-primary"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            <span>Filter & Sort Listings</span>
            {hasActiveFilters && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                Active
              </span>
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${mobileFilterOpen ? 'rotate-180' : ''
              }`}
          />
        </button>

        {mobileFilterOpen && (
          <div className="card mt-2 p-5 border border-surface-border animate-fade-in">
            {filterContent}
          </div>
        )}
      </div>
    </>
  );
}
