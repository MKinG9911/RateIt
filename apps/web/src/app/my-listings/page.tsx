'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { EmptyState } from '@/components/empty-state';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { StarRating } from '@/components/star-rating';
import toast from 'react-hot-toast';
import { Plus, Edit3, Trash2, Eye } from 'lucide-react';

export default function MyListingsPage() {
  const { appUser } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchListings = async () => {
    const res = await api<any>('/listings/my');
    if (res.success && res.data) setData(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await api(`/listings/${deleteId}`, { method: 'DELETE' });
    if (res.success) {
      toast.success('Listing deleted');
      fetchListings();
    } else {
      toast.error(res.error || 'Failed to delete');
    }
    setDeleteId(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-text-primary">My Listings</h1>
        <Link href="/my-listings/new" className="btn-primary">
          <Plus className="w-4 h-4 mr-2" /> New Listing
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="skeleton h-20" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          title="No listings yet"
          description="Create your first listing and share it with the community!"
          action={
            <Link href="/my-listings/new" className="btn-primary">
              <Plus className="w-4 h-4 mr-2" /> Create Listing
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {data.items.map((listing: any) => (
            <div key={listing.id} className="card flex items-center gap-4">
              <div className="w-16 h-16 bg-surface rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                {listing.imageUrl ? (
                  <img
                    src={listing.imageUrl}
                    alt=""
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <span className="text-xs text-text-muted">
                    {listing.category?.name?.charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-text-primary truncate">{listing.name}</h3>
                <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
                  <span className="badge-purple">{listing.category?.name}</span>
                  <span>{listing._count?.reviews || 0} reviews</span>
                  <span className={listing.status === 'ACTIVE' ? 'badge-green' : 'badge-red'}>
                    {listing.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/listings/${listing.slug}`}
                  className="p-2 rounded-lg hover:bg-surface-light text-text-muted hover:text-text-primary transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </Link>
                <Link
                  href={`/my-listings/${listing.id}/edit`}
                  className="p-2 rounded-lg hover:bg-surface-light text-text-muted hover:text-text-primary transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => setDeleteId(listing.id)}
                  className="p-2 rounded-lg hover:bg-surface-light text-text-muted hover:text-accent-red transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Listing"
        message="This will permanently delete the listing. This only works if it has no reviews."
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
