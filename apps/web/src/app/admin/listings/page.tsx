'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminListingsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const fetchListings = async () => {
    const res = await api<any>('/admin/listings', {
      params: {
        page: String(page),
        limit: '20',
        search: search || undefined,
        status: status || undefined,
      },
    });
    if (res.success && res.data) setData(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchListings();
  }, [page, search, status]);

  const handleModerate = async (listingId: string, newStatus: string) => {
    const reason = prompt('Enter moderation reason:');
    if (!reason) return;
    const res = await api(`/admin/listings/${listingId}/moderate`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus, moderationReason: reason }),
    });
    if (res.success) {
      toast.success('Listing moderated');
      fetchListings();
    } else toast.error(res.error || 'Failed');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Listing Management</h1>
          <p className="text-sm text-text-secondary mt-1">
            Create, manage, and moderate all platform products & listings.
          </p>
        </div>
        <a href="/my-listings/new" className="btn-primary flex items-center gap-2">
          <span>+ Create New Listing</span>
        </a>
      </div>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="input max-w-sm"
          placeholder="Search listings..."
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="input w-40"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="HIDDEN">Hidden</option>
          <option value="REMOVED">Removed</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="skeleton h-14" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">
                  Name
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">
                  Category
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">
                  Created By
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">
                  Reviews
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.items?.map((listing: any) => (
                <tr
                  key={listing.id}
                  className="border-b border-surface-border hover:bg-surface-light/50"
                >
                  <td className="py-3 px-4 text-sm text-text-primary font-medium max-w-[200px] truncate">
                    {listing.name}
                  </td>
                  <td className="py-3 px-4 text-sm text-text-secondary">
                    {listing.category?.name}
                  </td>
                  <td className="py-3 px-4 text-sm text-text-secondary">
                    {listing.createdBy?.email}
                  </td>
                  <td className="py-3 px-4 text-sm text-text-muted">
                    {listing._count?.reviews || 0}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={
                        listing.status === 'ACTIVE'
                          ? 'badge-green text-xs'
                          : listing.status === 'HIDDEN'
                            ? 'badge-yellow text-xs'
                            : 'badge-red text-xs'
                      }
                    >
                      {listing.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      {listing.status !== 'ACTIVE' && (
                        <button
                          onClick={() => handleModerate(listing.id, 'ACTIVE')}
                          className="text-xs text-accent-green hover:underline"
                        >
                          Activate
                        </button>
                      )}
                      {listing.status !== 'HIDDEN' && (
                        <button
                          onClick={() => handleModerate(listing.id, 'HIDDEN')}
                          className="text-xs text-accent-yellow hover:underline"
                        >
                          Hide
                        </button>
                      )}
                      {listing.status !== 'REMOVED' && (
                        <button
                          onClick={() => handleModerate(listing.id, 'REMOVED')}
                          className="text-xs text-accent-red hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
