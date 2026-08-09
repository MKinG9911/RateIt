'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Users, Package, Star, BarChart3, Layers, MessageSquare } from 'lucide-react';

export default function AdminDashboardPage() {
  const { appUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && appUser?.role !== 'ADMIN') {
      router.push('/');
      return;
    }
    api<any>('/admin/analytics').then((res) => {
      if (res.success && res.data) setAnalytics(res.data);
      setLoading(false);
    });
  }, [appUser, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="skeleton h-64" />
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Users',
      value: analytics?.totalUsers || 0,
      icon: Users,
      color: 'text-accent-blue',
    },
    {
      label: 'Active Users',
      value: analytics?.activeUsers || 0,
      icon: Users,
      color: 'text-accent-green',
    },
    {
      label: 'Suspended Users',
      value: analytics?.suspendedUsers || 0,
      icon: Users,
      color: 'text-accent-red',
    },
    {
      label: 'Active Listings',
      value: analytics?.totalListings || 0,
      icon: Package,
      color: 'text-primary-light',
    },
    {
      label: 'Visible Reviews',
      value: analytics?.totalReviews || 0,
      icon: Star,
      color: 'text-star',
    },
  ];

  const navItems = [
    {
      label: 'Users',
      href: '/admin/users',
      icon: Users,
      description: 'Manage users and suspensions',
    },
    { label: 'Listings', href: '/admin/listings', icon: Package, description: 'Moderate listings' },
    {
      label: 'Reviews',
      href: '/admin/reviews',
      icon: MessageSquare,
      description: 'Moderate reviews',
    },
    {
      label: 'Categories',
      href: '/admin/categories',
      icon: Layers,
      description: 'Manage categories & criteria',
    },
    {
      label: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      description: 'View platform analytics',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-text-primary mb-8">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
        {stats.map((stat) => (
          <div key={stat.label} className="card text-center">
            <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
            <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
            <p className="text-xs text-text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <h2 className="section-title mb-4">Management</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="card-hover group flex items-start gap-4"
          >
            <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <item.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors">
                {item.label}
              </h3>
              <p className="text-sm text-text-muted">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Top Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-text-primary mb-4">Most Reviewed Listings</h3>
          {analytics?.mostReviewedListings?.length === 0 ? (
            <p className="text-text-muted text-sm">No data yet</p>
          ) : (
            <div className="space-y-2">
              {analytics?.mostReviewedListings?.map((l: any, i: number) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between py-2 border-b border-surface-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-text-muted w-5">#{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{l.name}</p>
                      <p className="text-xs text-text-muted">{l.category}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-primary">{l.reviewCount} reviews</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="font-semibold text-text-primary mb-4">Most Active Reviewers</h3>
          {analytics?.mostActiveReviewers?.length === 0 ? (
            <p className="text-text-muted text-sm">No data yet</p>
          ) : (
            <div className="space-y-2">
              {analytics?.mostActiveReviewers?.map((r: any, i: number) => (
                <div
                  key={r.userId}
                  className="flex items-center justify-between py-2 border-b border-surface-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-text-muted w-5">#{i + 1}</span>
                    <p className="text-sm font-medium text-text-primary">{r.displayName}</p>
                  </div>
                  <span className="text-sm font-medium text-primary">{r.reviewCount} reviews</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
