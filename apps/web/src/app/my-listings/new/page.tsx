'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import ImageUploader from '@/components/image-uploader';

function NewListingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCategoryId = searchParams.get('categoryId') || '';
  const { appUser, loading: authLoading } = useAuth();

  const [categories, setCategories] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState(preselectedCategoryId);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [location, setLocation] = useState('');
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api<any[]>('/categories').then((res) => {
      if (res.success && res.data) setCategories(res.data);
    });
  }, []);

  // Check for duplicates when name changes
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (categoryId && name.length >= 3) {
        const res = await api<any>('/listings/check-duplicate', {
          params: { categoryId, name },
        });
        if (res.success && res.data) setDuplicates(res.data.matches || []);
      } else {
        setDuplicates([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [categoryId, name]);

  if (!authLoading && appUser?.role !== 'ADMIN') {
    return (
      <div className="card text-center py-12 space-y-4">
        <div className="p-3 bg-accent-red/10 border border-accent-red/20 rounded-2xl w-fit mx-auto text-accent-red">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-text-primary">Admin Access Required</h2>
        <p className="text-sm text-text-secondary max-w-md mx-auto">
          Only platform administrators are permitted to create new product listings. Users can browse, rate, and review existing listings.
        </p>
        <Link href="/" className="btn-primary inline-block">
          Return to Home
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await api('/listings', {
      method: 'POST',
      body: JSON.stringify({
        categoryId,
        name: name.trim(),
        description: description || undefined,
        brand: brand || undefined,
        imageUrl: imageUrl || undefined,
        websiteUrl: websiteUrl || undefined,
        location: location || undefined,
      }),
    });

    if (res.success) {
      toast.success('Listing created!');
      router.push('/admin/listings');
    } else {
      toast.error(res.error || 'Failed to create listing');
    }
    setLoading(false);
  };

  return (
    <div>
      <Link
        href="/admin/listings"
        className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Listings Management
      </Link>

      <h1 className="text-3xl font-bold text-text-primary mb-8">Create New Listing</h1>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="category" className="label">
              Category *
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="input"
              required
            >
              <option value="">Select a category or subcategory</option>
              {categories.map((parent) =>
                parent.children && parent.children.length > 0 ? (
                  <optgroup key={parent.id} label={parent.name}>
                    {parent.children.map((sub: any) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </optgroup>
                ) : (
                  <option key={parent.id} value={parent.id}>
                    {parent.name}
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label htmlFor="name" className="label">
              Name *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="e.g., The Grand Hotel, iPhone 16 Pro"
              required
              maxLength={200}
            />
            {duplicates.length > 0 && (
              <div className="mt-2 p-3 bg-accent-yellow/10 border border-accent-yellow/20 rounded-xl">
                <p className="text-xs font-medium text-accent-yellow mb-1">
                  Similar listings found:
                </p>
                {duplicates.map((d: any) => (
                  <p key={d.id} className="text-xs text-text-secondary">
                    • {d.name}
                  </p>
                ))}
              </div>
            )}
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
              placeholder="Describe this listing..."
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
                placeholder="e.g., Apple, Samsung"
                maxLength={100}
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
                placeholder="e.g., New York, NY"
                maxLength={300}
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
              placeholder="https://..."
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Creating...' : 'Create Listing'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function NewListingPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Suspense fallback={<div className="skeleton h-96 w-full" />}>
        <NewListingForm />
      </Suspense>
    </div>
  );
}
