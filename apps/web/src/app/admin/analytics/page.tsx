'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<any>('/admin/analytics').then((res) => {
      if (res.success && res.data) setAnalytics(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="skeleton h-96" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-text-primary mb-8">Platform Analytics</h1>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
        {[
          { label: 'Total Users', value: analytics?.totalUsers },
          { label: 'Active Users', value: analytics?.activeUsers },
          { label: 'Suspended Users', value: analytics?.suspendedUsers },
          { label: 'Active Listings', value: analytics?.totalListings },
          { label: 'Visible Reviews', value: analytics?.totalReviews },
        ].map((stat) => (
          <div key={stat.label} className="card text-center">
            <p className="text-3xl font-bold text-text-primary">{stat.value ?? 0}</p>
            <p className="text-xs text-text-muted mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Time Series */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <div className="card">
          <h3 className="font-semibold text-text-primary mb-4">Listings Over Time</h3>
          {analytics?.listingsOverTime?.length === 0 ? (
            <p className="text-text-muted text-sm">No data yet</p>
          ) : (
            <div className="space-y-2">
              {analytics?.listingsOverTime?.map((item: any) => (
                <div key={item.month} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">{item.month}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-surface rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${Math.min(100, (item.count / Math.max(...analytics.listingsOverTime.map((i: any) => i.count), 1)) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-text-primary w-8 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="font-semibold text-text-primary mb-4">Reviews Over Time</h3>
          {analytics?.reviewsOverTime?.length === 0 ? (
            <p className="text-text-muted text-sm">No data yet</p>
          ) : (
            <div className="space-y-2">
              {analytics?.reviewsOverTime?.map((item: any) => (
                <div key={item.month} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">{item.month}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-surface rounded-full overflow-hidden">
                      <div
                        className="h-full bg-star rounded-full"
                        style={{
                          width: `${Math.min(100, (item.count / Math.max(...analytics.reviewsOverTime.map((i: any) => i.count), 1)) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-text-primary w-8 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="font-semibold text-text-primary mb-4">Highest Rated (min 3 reviews)</h3>
          {analytics?.highestRatedListings?.length === 0 ? (
            <p className="text-text-muted text-sm">Not enough data</p>
          ) : (
            <div className="space-y-2">
              {analytics?.highestRatedListings?.map((l: any, i: number) => (
                <div key={l.id} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">#{i + 1}</span>
                    <div>
                      <p className="text-sm text-text-primary">{l.name}</p>
                      <p className="text-xs text-text-muted">{l.category}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-star">{l.averageRating.toFixed(1)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="font-semibold text-text-primary mb-4">Most Reviewed</h3>
          {analytics?.mostReviewedListings?.length === 0 ? (
            <p className="text-text-muted text-sm">No data yet</p>
          ) : (
            <div className="space-y-2">
              {analytics?.mostReviewedListings?.map((l: any, i: number) => (
                <div key={l.id} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">#{i + 1}</span>
                    <p className="text-sm text-text-primary">{l.name}</p>
                  </div>
                  <span className="text-sm font-medium text-primary">{l.reviewCount}</span>
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
                <div key={r.userId} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">#{i + 1}</span>
                    <p className="text-sm text-text-primary">{r.displayName}</p>
                  </div>
                  <span className="text-sm font-medium text-primary">{r.reviewCount}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
