'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { X, Edit3, Save, Loader2, Tag, Globe, MapPin, Layers, FileText } from 'lucide-react';
import ImageUploader from '@/components/image-uploader';

interface EditListingModalProps {
  listing: any;
  open: boolean;
  onClose: () => void;
  onUpdated: (updated: any) => void;
}

export function EditListingModal({
  listing,
  open,
  onClose,
  onUpdated,
}: EditListingModalProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brand, setBrand] = useState('');
  const [location, setLocation] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (listing) {
      setName(listing.name || '');
      setCategoryId(listing.categoryId || listing.category?.id || '');
      setBrand(listing.brand || '');
      setLocation(listing.location || '');
      setWebsiteUrl(listing.websiteUrl || '');
      setDescription(listing.description || '');
      setImageUrl(listing.imageUrl || '');
    }
  }, [listing]);

  useEffect(() => {
    if (open) {
      api<any[]>('/categories').then((res) => {
        if (res.success && res.data) setCategories(res.data);
      });
    }
  }, [open]);

  if (!open || !listing) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Listing name is required');
      return;
    }

    setSaving(true);

    const initialCatId = listing.categoryId || listing.category?.id || '';
    const body: any = {
      name: name.trim(),
      description: description.trim() || undefined,
      imageUrl: imageUrl || '',
      websiteUrl: websiteUrl.trim() || '',
      brand: brand.trim() || undefined,
      location: location.trim() || undefined,
    };

    if (categoryId && categoryId !== initialCatId) {
      body.categoryId = categoryId;
    }

    try {
      const res = await api(`/listings/${listing.id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });

      if (res.success && res.data) {
        toast.success('Listing updated successfully!');
        onUpdated(res.data);
        onClose();
      } else {
        toast.error(res.error || 'Failed to update listing');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-background-card border border-surface-border rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-surface-border bg-surface/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Edit3 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-text-primary truncate">Edit Listing</h2>
              <p className="text-xs text-text-muted">Update listing details, category, and cover image</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-light transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Name */}
          <div>
            <label className="label flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-primary" /> Listing Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="e.g. Sony WH-1000XM5 or Stanford University"
              required
            />
          </div>

          {/* Category selection */}
          <div>
            <label className="label flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-primary" /> Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="input"
            >
              <option value="">Select a Category</option>
              {categories.map((parent) =>
                parent.children && parent.children.length > 0 ? (
                  <optgroup key={parent.id} label={parent.name}>
                    <option value={parent.id}>{parent.name} (General)</option>
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

          {/* Brand & Location in 2 cols */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-text-muted" /> Brand / Manufacturer
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="input"
                placeholder="e.g. Sony, Apple, Marriott"
              />
            </div>
            <div>
              <label className="label flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-text-muted" /> Location / Address
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input"
                placeholder="e.g. Palo Alto, California"
              />
            </div>
          </div>

          {/* Website URL */}
          <div>
            <label className="label flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-text-muted" /> Official Website URL
            </label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="input"
              placeholder="https://example.com"
            />
          </div>

          {/* Image Uploader */}
          <div>
            <label className="label">Cover Image</label>
            <ImageUploader value={imageUrl} onChange={setImageUrl} />
          </div>

          {/* Description */}
          <div>
            <label className="label flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-text-muted" /> Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input min-h-[100px] resize-y text-sm"
              rows={3}
              placeholder="Detailed description of the product, service, or place..."
            />
          </div>
        </form>

        {/* Modal Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-surface-border bg-surface/50">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-sm py-2 px-4 justify-center"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="btn-primary text-sm py-2 px-5 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
