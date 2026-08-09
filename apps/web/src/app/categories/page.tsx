'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
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
  hotels: <Building2 className="w-10 h-10" />,
  movies: <Film className="w-10 h-10" />,
  restaurants: <UtensilsCrossed className="w-10 h-10" />,
  shops: <ShoppingBag className="w-10 h-10" />,
  smartphones: <Smartphone className="w-10 h-10" />,
  tvs: <Tv className="w-10 h-10" />,
  refrigerators: <Refrigerator className="w-10 h-10" />,
  headphones: <Headphones className="w-10 h-10" />,
  'pc-parts': <Cpu className="w-10 h-10" />,
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

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<any[]>('/categories').then((res) => {
      if (res.success && res.data) setCategories(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-text-primary mb-2">Categories</h1>
      <p className="text-text-secondary mb-8">Browse listings by category</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 9 }, (_, i) => (
              <div key={i} className="skeleton h-40 rounded-2xl" />
            ))
          : categories.map((cat) => (
              <Link key={cat.id} href={`/categories/${cat.slug}`} className="card-hover group p-8">
                <div
                  className={`${CATEGORY_COLORS[cat.slug] || 'text-text-muted'} mb-4 group-hover:scale-110 transition-transform`}
                >
                  {CATEGORY_ICONS[cat.slug] || <ShoppingBag className="w-10 h-10" />}
                </div>
                <h2 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors">
                  {cat.name}
                </h2>
                <p className="text-sm text-text-secondary mt-2 line-clamp-2">{cat.description}</p>
                <p className="text-xs text-text-muted mt-3">{cat._count?.listings || 0} listings</p>
              </Link>
            ))}
      </div>
    </div>
  );
}
