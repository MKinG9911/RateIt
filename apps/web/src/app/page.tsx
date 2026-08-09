'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { StarRating } from '@/components/star-rating';
import { ListSkeleton } from '@/components/skeletons';
import {
  Search,
  ArrowRight,
  Building2,
  Film,
  UtensilsCrossed,
  ShoppingBag,
  Smartphone,
  Tv,
  Refrigerator,
  Headphones,
  Cpu,
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  hotels: <Building2 className="w-8 h-8" />,
  movies: <Film className="w-8 h-8" />,
  restaurants: <UtensilsCrossed className="w-8 h-8" />,
  shops: <ShoppingBag className="w-8 h-8" />,
  smartphones: <Smartphone className="w-8 h-8" />,
  tvs: <Tv className="w-8 h-8" />,
  refrigerators: <Refrigerator className="w-8 h-8" />,
  headphones: <Headphones className="w-8 h-8" />,
  'pc-parts': <Cpu className="w-8 h-8" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  hotels: 'text-accent-blue',
  movies: 'text-primary-light',
  restaurants: 'text-accent-red',
  shops: 'text-accent-green',
  smartphones: 'text-accent-yellow',
  tvs: 'text-accent-pink',
  refrigerators: 'text-accent-blue',
  headphones: 'text-accent-orange',
  'pc-parts': 'text-accent-green',
};

export default function HomePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [recentListings, setRecentListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const [catRes, listRes] = await Promise.all([
        api<any[]>('/categories'),
        api<any>('/listings', { params: { limit: 8 } }),
      ]);
      if (catRes.success && catRes.data) setCategories(catRes.data);
      if (listRes.success && listRes.data) setRecentListings(listRes.data.items || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
              <span className="text-xs font-medium text-primary-light">
                Trusted Review Platform
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-4">
              Rate, Review &<br />
              <span className="text-gradient">Discover Everything</span>
            </h1>
            <p className="text-text-secondary text-lg mb-8">
              Hotels · Movies · Restaurants · Shops · Products — rated by real people
            </p>

            <form onSubmit={handleSearch} className="flex gap-3 max-w-lg">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search hotels, movies, products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-12 py-3.5"
                />
              </div>
              <button type="submit" className="btn-primary px-8">
                Search
              </button>
            </form>

            <div className="flex flex-wrap gap-2 mt-6">
              {categories.slice(0, 5).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className={`badge ${CATEGORY_COLORS[cat.slug] || 'text-primary-light'} bg-surface border border-surface-border hover:border-primary/30 transition-colors`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="section-title">Browse Categories</h2>
          <Link
            href="/categories"
            className="text-sm text-primary hover:text-primary-light transition-colors flex items-center gap-1"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {loading
            ? Array.from({ length: 9 }, (_, i) => (
                <div key={i} className="skeleton h-28 rounded-2xl" />
              ))
            : categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="card-hover flex flex-col items-center justify-center py-6 text-center group"
                >
                  <div
                    className={`${CATEGORY_COLORS[cat.slug] || 'text-text-muted'} mb-3 group-hover:scale-110 transition-transform`}
                  >
                    {CATEGORY_ICONS[cat.slug] || <ShoppingBag className="w-8 h-8" />}
                  </div>
                  <span className="text-sm font-medium text-text-primary">{cat.name}</span>
                  <span className="text-xs text-text-muted mt-1">
                    {cat._count?.listings || 0} listings
                  </span>
                </Link>
              ))}
        </div>
      </section>

      {/* Recent Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="section-title">Recent Listings</h2>
          <Link
            href="/search"
            className="text-sm text-primary hover:text-primary-light transition-colors flex items-center gap-1"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <ListSkeleton count={4} />
        ) : recentListings.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            No listings yet. Be the first to create one!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentListings.map((listing: any) => (
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
                    <div
                      className={`${CATEGORY_COLORS[listing.category?.slug] || 'text-text-muted'}`}
                    >
                      {CATEGORY_ICONS[listing.category?.slug] || (
                        <ShoppingBag className="w-12 h-12" />
                      )}
                    </div>
                  )}
                </div>
                <span
                  className={`badge text-xs mb-2 ${CATEGORY_COLORS[listing.category?.slug] || ''} bg-surface`}
                >
                  {listing.category?.name}
                </span>
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
        )}
      </section>
    </div>
  );
}
