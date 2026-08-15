'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Breadcrumbs } from '@/components/breadcrumbs';
import {
  GraduationCap,
  Building2,
  Film,
  UtensilsCrossed,
  ShoppingBag,
  Smartphone,
  Tv,
  Refrigerator,
  Headphones,
  Cpu,
  Layers,
  School,
  BookOpen,
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  education: <GraduationCap className="w-8 h-8 text-accent-blue" />,
  universities: <GraduationCap className="w-8 h-8 text-accent-blue" />,
  colleges: <BookOpen className="w-8 h-8 text-accent-blue" />,
  schools: <School className="w-8 h-8 text-accent-blue" />,
  technology: <Cpu className="w-8 h-8 text-accent-green" />,
  hotels: <Building2 className="w-8 h-8 text-accent-blue" />,
  movies: <Film className="w-8 h-8 text-primary-light" />,
  restaurants: <UtensilsCrossed className="w-8 h-8 text-accent-red" />,
  shops: <ShoppingBag className="w-8 h-8 text-accent-green" />,
  smartphones: <Smartphone className="w-8 h-8 text-accent-yellow" />,
  tvs: <Tv className="w-8 h-8 text-accent-pink" />,
  refrigerators: <Refrigerator className="w-8 h-8 text-accent-blue" />,
  headphones: <Headphones className="w-8 h-8 text-accent-orange" />,
  'pc-parts': <Cpu className="w-8 h-8 text-accent-green" />,
};

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count?: { listings: number };
}

interface ParentCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  children: Subcategory[];
  _count?: { listings: number };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ParentCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<ParentCategory[]>('/categories').then((res) => {
      if (res.success && res.data) setCategories(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: 'Categories' }]} />
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Explore Categories</h1>
        <p className="text-text-secondary">
          Discover top-rated universities, tech products, dining spots, hotels, and entertainment.
        </p>
      </div>

      {loading ? (
        <div className="space-y-12">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="space-y-4">
              <div className="skeleton h-8 w-48 rounded-lg" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }, (_, j) => (
                  <div key={j} className="skeleton h-36 rounded-2xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-14">
          {categories.map((parent) => (
            <section key={parent.id} className="space-y-6">
              {/* Parent Category Header */}
              <div className="flex items-center gap-3 border-b border-surface-border pb-3">
                <div className="p-2 rounded-xl bg-surface border border-surface-border">
                  {CATEGORY_ICONS[parent.slug] || <Layers className="w-6 h-6 text-primary" />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary">{parent.name}</h2>
                  {parent.description && (
                    <p className="text-xs text-text-muted mt-0.5">{parent.description}</p>
                  )}
                </div>
              </div>

              {/* Subcategories Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {parent.children && parent.children.length > 0 ? (
                  parent.children.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/categories/${sub.slug}`}
                      className="card-hover group p-6 border-surface-border"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-surface border border-surface-border group-hover:border-primary/50 transition-colors">
                          {CATEGORY_ICONS[sub.slug] || <Layers className="w-6 h-6 text-primary" />}
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                          {sub._count?.listings || 0} listings
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors">
                        {sub.name}
                      </h3>
                      {sub.description && (
                        <p className="text-xs text-text-secondary mt-1.5 line-clamp-2 leading-relaxed">
                          {sub.description}
                        </p>
                      )}
                    </Link>
                  ))
                ) : (
                  <Link
                    href={`/categories/${parent.slug}`}
                    className="card-hover group p-6 border-surface-border"
                  >
                    <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors">
                      {parent.name} Overview
                    </h3>
                    <p className="text-xs text-text-secondary mt-1.5">{parent.description}</p>
                  </Link>
                )}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
