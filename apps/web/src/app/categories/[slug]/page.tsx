'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { StarRating } from '@/components/star-rating';
import { EmptyState } from '@/components/empty-state';
import { ListSkeleton } from '@/components/skeletons';
import { Pagination } from '@/components/pagination';
import { Breadcrumbs, BreadcrumbItem } from '@/components/breadcrumbs';
import { CategoryFilter } from '@/components/category-filter';
import { useAuth } from '@/lib/auth-context';
import { Plus, X, RotateCcw } from 'lucide-react';

function CategoryDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;

  const pageParam = Number(searchParams.get('page') || 1);
  const searchParam = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || 'newest';
  const minRatingParam = Number(searchParams.get('minRating') || 0);
  const subcategoryParam = searchParams.get('subcategoryId') || null;

  const { appUser } = useAuth();
  const isAdmin = appUser?.role === 'ADMIN';

  const [category, setCategory] = useState<any>(null);
  const [listings, setListings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [listingsLoading, setListingsLoading] = useState(false);

  // Local filter states
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(
    subcategoryParam,
  );
  const [minRating, setMinRating] = useState<number>(minRatingParam);
  const [sort, setSort] = useState<string>(sortParam);
  const [page, setPage] = useState<number>(pageParam);

  // Fetch Category Details
  useEffect(() => {
    api<any>(`/categories/${slug}`).then((res) => {
      if (res.success && res.data) {
        setCategory(res.data);
      }
      setLoading(false);
    });
  }, [slug]);

  // Fetch Listings with Filter Parameters
  const fetchListings = useCallback(async () => {
    setListingsLoading(true);
    const queryParams: Record<string, string> = {
      page: String(page),
      limit: '12',
      sort,
    };

    if (selectedSubcategoryId) {
      queryParams.subcategoryId = selectedSubcategoryId;
    } else {
      queryParams.categorySlug = slug;
    }

    if (searchQuery.trim()) {
      queryParams.search = searchQuery.trim();
    }

    if (minRating > 0) {
      queryParams.minRating = String(minRating);
    }

    const res = await api<any>('/listings', { params: queryParams });
    if (res.success && res.data) {
      setListings(res.data);
    }
    setListingsLoading(false);
  }, [slug, selectedSubcategoryId, searchQuery, minRating, sort, page]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Handle Filter Changes
  const handleSelectSubcategory = (subId: string | null) => {
    setSelectedSubcategoryId(subId);
    setPage(1);
  };

  const handleChangeMinRating = (rating: number) => {
    setMinRating(rating);
    setPage(1);
  };

  const handleChangeSort = (newSort: string) => {
    setSort(newSort);
    setPage(1);
  };

  const handleChangeSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSubcategoryId(null);
    setMinRating(0);
    setSort('newest');
    setPage(1);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="skeleton h-8 w-48 mb-2" />
        <div className="skeleton h-4 w-96 mb-8" />
        <ListSkeleton />
      </div>
    );
  }

  if (!category) {
    return (
      <EmptyState
        icon="alert"
        title="Category not found"
        description="The category you're looking for doesn't exist."
      />
    );
  }

  // Construct Breadcrumbs Trail:
  // e.g. Home > Categories > Education > Colleges
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Categories', href: '/categories' },
  ];

  if (category.parent) {
    breadcrumbItems.push({
      label: category.parent.name,
      href: `/categories/${category.parent.slug}`,
    });
  }

  breadcrumbItems.push({
    label: category.name,
  });

  const totalListingCount =
    listings?.total !== undefined ? listings.total : (category._count?.listings || 0);

  const hasActiveFilters =
    Boolean(selectedSubcategoryId) ||
    Boolean(searchQuery.trim()) ||
    minRating > 0 ||
    sort !== 'newest';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb Navigation Tracking */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Category Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8 pb-6 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary">
              {category.name}
            </h1>
          </div>
          {category.description && (
            <p className="text-text-secondary mt-1.5 max-w-2xl text-sm sm:text-base">
              {category.description}
            </p>
          )}
          <p className="text-xs text-text-muted mt-2">
            {totalListingCount} {totalListingCount === 1 ? 'listing' : 'listings'} available ·{' '}
            {category.ratingCriteria?.length || 0} rating criteria
          </p>
        </div>

        {isAdmin && (
          <Link
            href={`/my-listings/new?categoryId=${category.id}`}
            className="btn-primary shrink-0 self-start"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Listing
          </Link>
        )}
      </div>

      {/* Main Content Layout with Left Sidebar Filtering */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Filter Sidebar */}
        <CategoryFilter
          category={category}
          selectedSubcategoryId={selectedSubcategoryId}
          onSelectSubcategory={handleSelectSubcategory}
          minRating={minRating}
          onChangeMinRating={handleChangeMinRating}
          sort={sort}
          onChangeSort={handleChangeSort}
          searchQuery={searchQuery}
          onChangeSearch={handleChangeSearch}
          onResetFilters={handleResetFilters}
          totalResults={listings?.total ?? 0}
        />

        {/* Right Listings Grid */}
        <div className="flex-1 min-w-0 w-full">
          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <span className="text-xs text-text-muted">Active Filters:</span>

              {searchQuery.trim() && (
                <span className="badge-purple flex items-center gap-1.5 text-xs py-1">
                  <span>Search: &quot;{searchQuery.trim()}&quot;</span>
                  <button
                    onClick={() => handleChangeSearch('')}
                    className="hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedSubcategoryId && (
                <span className="badge-blue flex items-center gap-1.5 text-xs py-1">
                  <span>Subcategory filter</span>
                  <button
                    onClick={() => handleSelectSubcategory(null)}
                    className="hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {minRating > 0 && (
                <span className="badge-yellow flex items-center gap-1.5 text-xs py-1">
                  <span>★ {minRating}.0+</span>
                  <button
                    onClick={() => handleChangeMinRating(0)}
                    className="hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {sort !== 'newest' && (
                <span className="badge-green flex items-center gap-1.5 text-xs py-1">
                  <span>Sorted by {sort}</span>
                  <button
                    onClick={() => handleChangeSort('newest')}
                    className="hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                onClick={handleResetFilters}
                className="text-xs text-text-muted hover:text-primary transition-colors flex items-center gap-1 ml-1"
              >
                <RotateCcw className="w-3 h-3" /> Clear All
              </button>
            </div>
          )}

          {/* Listings Loading State */}
          {listingsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="skeleton h-64 rounded-2xl" />
              ))}
            </div>
          ) : !listings || listings.items.length === 0 ? (
            <div className="card py-16 text-center space-y-4">
              <EmptyState
                title={hasActiveFilters ? 'No matching listings found' : 'No listings yet'}
                description={
                  hasActiveFilters
                    ? 'Try adjusting your search keyword, rating filter, or subcategory selection.'
                    : `There are currently no listings in ${category.name}.`
                }
                action={
                  hasActiveFilters ? (
                    <button onClick={handleResetFilters} className="btn-secondary">
                      <RotateCcw className="w-4 h-4 mr-2" /> Reset Filters
                    </button>
                  ) : isAdmin ? (
                    <Link
                      href={`/my-listings/new?categoryId=${category.id}`}
                      className="btn-primary"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Create Listing
                    </Link>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <>
              {/* Product Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.items.map((listing: any) => (
                  <Link
                    key={listing.id}
                    href={`/listings/${listing.slug}`}
                    className="card-hover group flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-48 bg-surface/40 rounded-xl mb-4 flex items-center justify-center overflow-hidden border border-surface-border p-2.5">
                        {listing.imageUrl ? (
                          <img
                            src={listing.imageUrl}
                            alt={listing.name}
                            className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <span className="text-2xl font-bold text-text-muted/40">
                            {listing.category?.name || category.name}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="badge-purple text-[10px] py-0.5">
                          {listing.category?.name || category.name}
                        </span>
                        {listing.brand && (
                          <span className="text-[11px] text-text-muted truncate">
                            {listing.brand}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-base text-text-primary group-hover:text-primary transition-colors line-clamp-1">
                        {listing.name}
                      </h3>

                      {listing.description && (
                        <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                          {listing.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-surface-border/60">
                      <div className="flex items-center gap-1.5">
                        <StarRating rating={listing.averageRating || 0} size="sm" />
                        <span className="text-xs font-semibold text-text-primary">
                          {listing.averageRating ? listing.averageRating.toFixed(1) : 'New'}
                        </span>
                      </div>
                      <span className="text-xs text-text-muted">
                        {listing.reviewCount || 0}{' '}
                        {listing.reviewCount === 1 ? 'review' : 'reviews'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {listings.totalPages > 1 && (
                <div className="mt-10">
                  <Pagination
                    currentPage={listings.page}
                    totalPages={listings.totalPages}
                    basePath={`/categories/${slug}`}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CategoryDetailPage() {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <CategoryDetailContent />
    </Suspense>
  );
}
