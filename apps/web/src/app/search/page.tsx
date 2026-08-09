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
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(q);

  useEffect(() => {
    if (q) {
      setLoading(true);
      api<any>('/listings', {
        params: {
          search: q,
          categorySlug: categorySlug || undefined,
          page: String(page),
          limit: '12',
        },
      }).then((res) => {
        if (res.success && res.data) setResults(res.data);
        setLoading(false);
      });
    }
  }, [q, page, categorySlug]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-primary mb-6">Search</h1>

      <form action="/search" method="GET" className="flex gap-3 max-w-xl mb-8">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            name="q"
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="input pl-12"
            placeholder="Search listings..."
          />
        </div>
        <button type="submit" className="btn-primary">
          Search
        </button>
      </form>

      {q && (
        <p className="text-text-secondary mb-6">
          {loading ? 'Searching...' : `${results?.total || 0} results for "${q}"`}
        </p>
      )}

      {loading ? (
        <ListSkeleton />
      ) : !results || results.items.length === 0 ? (
        q ? (
          <EmptyState
            title="No results found"
            description="Try different keywords or browse categories."
          />
        ) : (
          <EmptyState
            title="Search for anything"
            description="Find movies, hotels, restaurants, products, and more."
          />
        )
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.items.map((listing: any) => (
              <Link
                key={listing.id}
                href={`/listings/${listing.slug}`}
                className="card-hover group"
              >
                <div className="h-40 bg-surface rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                  {listing.imageUrl ? (
                    <img
                      src={listing.imageUrl}
                      alt={listing.name}
                      className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <span className="text-text-muted text-lg">{listing.category?.name}</span>
                  )}
                </div>
                <span className="badge-purple text-xs">{listing.category?.name}</span>
                <h3 className="font-semibold text-text-primary mt-2 truncate group-hover:text-primary transition-colors">
                  {listing.name}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <StarRating rating={listing.averageRating || 0} size="sm" />
                  <span className="text-xs text-text-muted">
                    {listing.reviewCount || 0} reviews
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <Pagination
            currentPage={results.page}
            totalPages={results.totalPages}
            basePath="/search"
            queryParams={{ q }}
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
