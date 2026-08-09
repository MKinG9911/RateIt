'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { StarRating } from '@/components/star-rating';
import { EmptyState } from '@/components/empty-state';
import { ListSkeleton } from '@/components/skeletons';
import { Pagination } from '@/components/pagination';
import { useAuth } from '@/lib/auth-context';
import { Plus } from 'lucide-react';

function CategoryDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const page = Number(searchParams.get('page') || 1);
  const { supabaseUser } = useAuth();

  const [category, setCategory] = useState<any>(null);
  const [listings, setListings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [catRes, listRes] = await Promise.all([
        api<any>(`/categories/${slug}`),
        api<any>('/listings', { params: { categorySlug: slug, page: String(page), limit: '12' } }),
      ]);
      if (catRes.success && catRes.data) setCategory(catRes.data);
      if (listRes.success && listRes.data) setListings(listRes.data);
      setLoading(false);
    };
    fetchData();
  }, [slug, page]);

  if (loading) {
    return (
      <div>
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

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">{category.name}</h1>
          <p className="text-text-secondary">{category.description}</p>
          <p className="text-sm text-text-muted mt-2">
            {category._count?.listings || 0} listings · {category.ratingCriteria?.length || 0}{' '}
            rating criteria
          </p>
        </div>
        {supabaseUser && (
          <Link
            href={`/my-listings/new?categoryId=${category.id}`}
            className="btn-primary shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Listing
          </Link>
        )}
      </div>

      {!listings || listings.items.length === 0 ? (
        <EmptyState
          title="No listings yet"
          description={`Be the first to add a ${category.name.toLowerCase()} listing!`}
          action={
            supabaseUser ? (
              <Link href={`/my-listings/new?categoryId=${category.id}`} className="btn-primary">
                <Plus className="w-4 h-4 mr-2" /> Create Listing
              </Link>
            ) : (
              <Link href="/auth/register" className="btn-primary">
                Join to add listings
              </Link>
            )
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.items.map((listing: any) => (
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
                    <span className="text-2xl text-text-muted">{category.name}</span>
                  )}
                </div>
                <h3 className="font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
                  {listing.name}
                </h3>
                {listing.brand && <p className="text-xs text-text-muted mt-1">{listing.brand}</p>}
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
            currentPage={listings.page}
            totalPages={listings.totalPages}
            basePath={`/categories/${slug}`}
          />
        </>
      )}
    </div>
  );
}

export default function CategoryDetailPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Suspense fallback={<ListSkeleton />}>
        <CategoryDetailContent />
      </Suspense>
    </div>
  );
}
