'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;

  const [listing, setListing] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api<any>(`/listings/${listingId}`).catch(() => null),
      api<any[]>('/categories'),
    ]).then(([listRes, catRes]) => {
      // Try to get by ID — the endpoint uses slug, so we need to use a different approach
      // Actually we need the listing by ID for edit. Let's fetch my listings and find it.
    });

    // Fetch listing by getting my listings
    api<any>('/listings/my', { params: { limit: '100' } }).then((res) => {
      if (res.success && res.data) {
        const found = res.data.items.find((l: any) => l.id === listingId);
        if (found) {
          setListing(found);
          setName(found.name);
          setDescription(found.description || '');
          setBrand(found.brand || '');
          setImageUrl(found.imageUrl || '');
          setWebsiteUrl(found.websiteUrl || '');
          setLocation(found.location || '');
        }
      }
      setLoading(false);
    });

    api<any[]>('/categories').then((res) => {
      if (res.success && res.data) setCategories(res.data);
    });
  }, [listingId]);

  const hasReviews = listing?._count?.reviews > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const body: any = {
      description: description || undefined,
      imageUrl: imageUrl || '',
      websiteUrl: websiteUrl || '',
      location: location || undefined,
    };

    // Only include identity fields if no reviews
    if (!hasReviews) {
      body.name = name;
      body.brand = brand || undefined;
    }

    const res = await api(`/listings/${listingId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });

    if (res.success) {
      toast.success('Listing updated!');
      router.push('/my-listings');
    } else {
      toast.error(res.error || 'Failed to update');
    }
    setSaving(false);
  };

  if (loading)
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="skeleton h-64" />
      </div>
    );

  if (!listing) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <p className="text-text-secondary">
          Listing not found or you don&apos;t have permission to edit it.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/my-listings"
        className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Listings
      </Link>

      <h1 className="text-3xl font-bold text-text-primary mb-2">Edit Listing</h1>
      {hasReviews && (
        <p className="text-sm text-accent-yellow mb-6">
          ⚠️ This listing has reviews. Name, category, and brand cannot be changed.
        </p>
      )}

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Category</label>
            <input
              type="text"
              value={listing.category?.name || ''}
              disabled
              className="input opacity-60 cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="name" className="label">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              disabled={hasReviews}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="label">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input min-h-[100px] resize-y"
              maxLength={5000}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="brand" className="label">
                Brand
              </label>
              <input
                id="brand"
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="input"
                disabled={hasReviews}
              />
            </div>
            <div>
              <label htmlFor="location" className="label">
                Location
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input"
              />
            </div>
          </div>

          <div>
            <label htmlFor="imageUrl" className="label">
              Image URL
            </label>
            <input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label htmlFor="websiteUrl" className="label">
              Website URL
            </label>
            <input
              id="websiteUrl"
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="input"
            />
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full py-3">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
