'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import ImageUploader from '@/components/image-uploader';

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;
  const { appUser, loading: authLoading } = useAuth();

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
      api<any>(`/listings/by-id/${listingId}`),
      api<any[]>('/categories'),
    ])
      .then(([listRes, catRes]) => {
        if (listRes.success && listRes.data) {
          const found = listRes.data;
          setListing(found);
          setName(found.name || '');
          setDescription(found.description || '');
          setBrand(found.brand || '');
          setImageUrl(found.imageUrl || '');
          setWebsiteUrl(found.websiteUrl || '');
          setLocation(found.location || '');
        }
        if (catRes.success && catRes.data) {
          setCategories(catRes.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [listingId]);

  const hasReviews = listing?._count?.reviews > 0;

  if (!authLoading && appUser?.role !== 'ADMIN') {
    return (
      <div className="card text-center py-12 space-y-4 max-w-2xl mx-auto my-12">
        <div className="p-3 bg-accent-red/10 border border-accent-red/20 rounded-2xl w-fit mx-auto text-accent-red">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-text-primary">Admin Access Required</h2>
        <p className="text-sm text-text-secondary max-w-md mx-auto">
          Only platform administrators are permitted to edit listings.
        </p>
        <Link href="/" className="btn-primary inline-block">
          Return to Home
        </Link>
      </div>
    );
  }

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

          <ImageUploader value={imageUrl} onChange={setImageUrl} />

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
