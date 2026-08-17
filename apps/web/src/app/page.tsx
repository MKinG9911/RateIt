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
  GraduationCap,
  Cpu,
  Film,
  Building2,
  UtensilsCrossed,
  ShoppingBag,
  Smartphone,
  Tv,
  Refrigerator,
  Headphones,
  School,
  BookOpen,
  Car,
  HeartPulse,
  Gamepad2,
  Landmark,
  Plane,
  Home,
  Music,
  Layers,
  Sparkles,
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  education: <GraduationCap className="w-7 h-7" />,
  universities: <GraduationCap className="w-7 h-7" />,
  colleges: <BookOpen className="w-7 h-7" />,
  schools: <School className="w-7 h-7" />,
  technology: <Cpu className="w-7 h-7" />,
  smartphones: <Smartphone className="w-7 h-7" />,
  tvs: <Tv className="w-7 h-7" />,
  refrigerators: <Refrigerator className="w-7 h-7" />,
  headphones: <Headphones className="w-7 h-7" />,
  'pc-parts': <Cpu className="w-7 h-7" />,
  entertainment: <Film className="w-7 h-7" />,
  movies: <Film className="w-7 h-7" />,
  hospitality: <Building2 className="w-7 h-7" />,
  hotels: <Building2 className="w-7 h-7" />,
  dining: <UtensilsCrossed className="w-7 h-7" />,
  restaurants: <UtensilsCrossed className="w-7 h-7" />,
  retail: <ShoppingBag className="w-7 h-7" />,
  shops: <ShoppingBag className="w-7 h-7" />,
  automotive: <Car className="w-7 h-7" />,
  vehicles: <Car className="w-7 h-7" />,
  health: <HeartPulse className="w-7 h-7" />,
  healthcare: <HeartPulse className="w-7 h-7" />,
  gaming: <Gamepad2 className="w-7 h-7" />,
  finance: <Landmark className="w-7 h-7" />,
  travel: <Plane className="w-7 h-7" />,
  'real-estate': <Home className="w-7 h-7" />,
  music: <Music className="w-7 h-7" />,
};

const CATEGORY_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  education: {
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 group-hover:bg-blue-500/20',
    border: 'border-blue-500/20 group-hover:border-blue-500/40',
  },
  technology: {
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 group-hover:bg-emerald-500/20',
    border: 'border-emerald-500/20 group-hover:border-emerald-500/40',
  },
  entertainment: {
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 group-hover:bg-purple-500/20',
    border: 'border-purple-500/20 group-hover:border-purple-500/40',
  },
  hospitality: {
    color: 'text-sky-400',
    bg: 'bg-sky-500/10 group-hover:bg-sky-500/20',
    border: 'border-sky-500/20 group-hover:border-sky-500/40',
  },
  dining: {
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 group-hover:bg-rose-500/20',
    border: 'border-rose-500/20 group-hover:border-rose-500/40',
  },
  retail: {
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 group-hover:bg-amber-500/20',
    border: 'border-amber-500/20 group-hover:border-amber-500/40',
  },
  hotels: {
    color: 'text-sky-400',
    bg: 'bg-sky-500/10 group-hover:bg-sky-500/20',
    border: 'border-sky-500/20 group-hover:border-sky-500/40',
  },
  movies: {
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 group-hover:bg-purple-500/20',
    border: 'border-purple-500/20 group-hover:border-purple-500/40',
  },
  restaurants: {
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 group-hover:bg-rose-500/20',
    border: 'border-rose-500/20 group-hover:border-rose-500/40',
  },
  shops: {
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 group-hover:bg-amber-500/20',
    border: 'border-amber-500/20 group-hover:border-amber-500/40',
  },
};

function getCategoryIcon(slug: string) {
  if (CATEGORY_ICONS[slug]) return CATEGORY_ICONS[slug];
  if (slug.includes('edu') || slug.includes('school') || slug.includes('acad'))
    return <GraduationCap className="w-7 h-7" />;
  if (slug.includes('tech') || slug.includes('elect') || slug.includes('gadg'))
    return <Cpu className="w-7 h-7" />;
  if (slug.includes('film') || slug.includes('movie') || slug.includes('show') || slug.includes('media'))
    return <Film className="w-7 h-7" />;
  if (slug.includes('hotel') || slug.includes('stay') || slug.includes('resort'))
    return <Building2 className="w-7 h-7" />;
  if (slug.includes('food') || slug.includes('eat') || slug.includes('rest') || slug.includes('cafe'))
    return <UtensilsCrossed className="w-7 h-7" />;
  if (slug.includes('shop') || slug.includes('store') || slug.includes('buy') || slug.includes('market'))
    return <ShoppingBag className="w-7 h-7" />;
  return <Layers className="w-7 h-7" />;
}

function getCategoryStyle(slug: string) {
  if (CATEGORY_STYLES[slug]) return CATEGORY_STYLES[slug];
  return {
    color: 'text-primary',
    bg: 'bg-primary/10 group-hover:bg-primary/20',
    border: 'border-primary/20 group-hover:border-primary/40',
  };
}

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

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-lg">
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
              <button type="submit" className="btn-primary px-8 shrink-0">
                Search
              </button>
            </form>

            <div className="flex flex-wrap gap-2 mt-6">
              {categories.slice(0, 8).map((cat) => {
                const style = getCategoryStyle(cat.slug);
                return (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.slug}`}
                    className={`badge ${style.color} bg-surface border ${style.border} hover:scale-105 transition-all flex items-center gap-1.5 py-1 px-3`}
                  >
                    <span className="scale-75 -ml-1">{getCategoryIcon(cat.slug)}</span>
                    <span>{cat.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">Browse Categories</h2>
            <p className="text-xs text-text-muted mt-1">
              Explore trusted reviews across top categories and subcategories
            </p>
          </div>
          <Link
            href="/categories"
            className="text-sm text-primary hover:text-primary-light transition-colors flex items-center gap-1 font-medium"
          >
            View All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {loading
            ? Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="skeleton h-44 rounded-2xl" />
            ))
            : categories.map((cat) => {
              const style = getCategoryStyle(cat.slug);
              const subcount = cat.children?.length || 0;

              return (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className={`card-hover group flex flex-col items-center justify-between p-5 text-center border ${style.border} transition-all duration-300`}
                >
                  {/* Icon Container with glowing background */}
                  <div
                    className={`p-3.5 rounded-2xl ${style.bg} ${style.color} border ${style.border} mb-3 group-hover:scale-110 transition-transform duration-300 shadow-sm`}
                  >
                    {getCategoryIcon(cat.slug)}
                  </div>

                  {/* Category Title */}
                  <div className="w-full">
                    <span className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors block truncate">
                      {cat.name}
                    </span>

                    {/* Subcategories count or preview */}
                    {subcount > 0 && (
                      <span className="text-[11px] text-text-muted block mt-0.5 truncate">
                        {subcount} {subcount === 1 ? 'subcategory' : 'subcategories'}
                      </span>
                    )}
                  </div>

                  {/* Listings Badge */}
                  <span className="text-[10px] font-semibold text-text-secondary bg-surface px-2 py-0.5 rounded-full border border-surface-border mt-3 group-hover:border-primary/40 transition-colors">
                    {cat._count?.listings || 0} {cat._count?.listings === 1 ? 'listing' : 'listings'}
                  </span>
                </Link>
              );
            })}
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
            No listings available yet. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentListings.map((listing: any) => (
              <Link
                key={listing.id}
                href={`/listings/${listing.slug}`}
                className="card-hover group"
              >
                <div className="h-44 bg-surface/40 rounded-xl mb-4 flex items-center justify-center overflow-hidden border border-surface-border/50 p-2.5">
                  {listing.imageUrl ? (
                    <img
                      src={listing.imageUrl}
                      alt={listing.name}
                      className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className={getCategoryStyle(listing.category?.slug).color}>
                      {getCategoryIcon(listing.category?.slug)}
                    </div>
                  )}
                </div>
                <span
                  className={`badge text-xs mb-2 ${getCategoryStyle(listing.category?.slug).color} bg-surface`}
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
