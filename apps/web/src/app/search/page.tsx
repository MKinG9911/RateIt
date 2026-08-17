'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { StarRating } from '@/components/star-rating';
import { EmptyState } from '@/components/empty-state';
import { ListSkeleton } from '@/components/skeletons';
import { Pagination } from '@/components/pagination';
import { Search as SearchIcon } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const page = Number(searchParams.get('page') || 1);
  const categorySlug = searchParams.get('category') || '';

  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(q);

  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {
      page: String(page),
      limit: '12',
    };
    if (q.trim()) params.search = q.trim();
    if (categorySlug) params.categorySlug = categorySlug;

    api<any>('/listings', { params })
      .then((res) => {
        if (res.success && res.data) setResults(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [q, page, categorySlug]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-text-primary">
          {q ? `Search Results` : 'All Listings'}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {loading
            ? 'Loading listings...'
            : q
              ? `${results?.total || 0} results found for "${q}"`
              : `Browse and discover all ${results?.total || 0} community-rated listings`}
        </p>
      </div>

      <form action="/search" method="GET" className="flex flex-col sm:flex-row gap-3 max-w-xl mb-8">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            name="q"
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="input pl-12"
            placeholder="Search hotels, movies, restaurants, products..."
          />
        </div>
        <button type="submit" className="btn-primary px-8 shrink-0">
          Search
        </button>
      </form>

      {loading ? (
        <ListSkeleton count={6} />
      ) : !results || results.items.length === 0 ? (
        <EmptyState
          title={q ? 'No results found' : 'No listings available yet'}
          description={
            q
              ? 'Try different keywords or browse our categories.'
              : 'Be the first to create a listing and share it with the community!'
          }
          action={
            <Link href="/categories" className="btn-primary">
              Browse Categories
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.items.map((listing: any) => (
              <Link
                key={listing.id}
                href={`/listings/${listing.slug}`}
                className="card-hover group flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 bg-surface/40 rounded-xl mb-4 flex items-center justify-center overflow-hidden border border-surface-border p-2.5">
                    {listing.imageUrl ? (
                      <img
                        src={listing.imageUrl}
                        alt={listing.name}
                        className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-text-muted text-lg font-semibold">
                        {listing.category?.name}
                      </span>
                    )}
                  </div>
                  <span className="badge-purple text-xs">{listing.category?.name}</span>
                  <h3 className="font-bold text-base text-text-primary mt-2 truncate group-hover:text-primary transition-colors">
                    {listing.name}
                  </h3>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-surface-border/50">
                  <StarRating rating={listing.averageRating || 0} size="sm" />
                  <span className="text-xs font-bold text-text-primary">
                    {listing.averageRating ? listing.averageRating.toFixed(1) : 'N/A'}
                  </span>
                  <span className="text-xs text-text-muted ml-auto">
                    {listing.reviewCount || 0} {listing.reviewCount === 1 ? 'review' : 'reviews'}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <Pagination
            currentPage={results.page}
            totalPages={results.totalPages}
            basePath="/search"
            queryParams={{
              ...(q ? { q } : {}),
              ...(categorySlug ? { category: categorySlug } : {}),
            }}
          />
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Suspense fallback={<ListSkeleton />}>
        <SearchContent />
      </Suspense>
    </div>
  );
}
