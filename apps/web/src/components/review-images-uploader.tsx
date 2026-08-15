'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Upload,
  X,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
  Plus,
} from 'lucide-react';
import { uploadListingImage, formatFileSize, MAX_FILE_SIZE } from '@/lib/supabase/storage';

interface ReviewImagesUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ReviewImagesUploader({
  images,
  onChange,
  maxImages = 5,
}: ReviewImagesUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (fileList: FileList | File[]) => {
      setError(null);
      const files = Array.from(fileList);

      if (images.length + files.length > maxImages) {
        setError(`You can upload a maximum of ${maxImages} images.`);
        return;
      }

      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          setError(`"${file.name}" is not an image file.`);
          return;
        }
        if (file.size > MAX_FILE_SIZE) {
          setError(
            `"${file.name}" (${formatFileSize(file.size)}) exceeds the 15MB limit.`,
          );
          return;
        }
      }

      setUploading(true);
      const newUrls: string[] = [];

      for (const file of files) {
        const result = await uploadListingImage(file);
        if (result.success && result.url) {
          newUrls.push(result.url);
        } else {
          setError(result.error || `Failed to upload "${file.name}".`);
          break;
        }
      }

      setUploading(false);
      if (newUrls.length > 0) {
        onChange([...images, ...newUrls]);
      }
    },
    [images, maxImages, onChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [handleFiles],
  );

  const handleRemoveImage = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
    setError(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="label mb-0">
          Product Photos (Optional)
        </label>
        <span className="text-xs text-text-muted">
          {images.length} / {maxImages} images • Max 15MB each
        </span>
      </div>

      {/* Thumbnails Gallery */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {images.map((url, idx) => (
            <div
              key={idx}
              className="relative group rounded-xl overflow-hidden aspect-square border border-surface-border bg-surface"
            >
              <img
                src={url}
                alt={`Product photo ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-1.5 right-1.5 p-1 bg-black/70 hover:bg-accent-red text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove photo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {/* Add more button if not reached max */}
          {images.length < maxImages && (
            <button
              type="button"
              onClick={() => !uploading && fileInputRef.current?.click()}
              disabled={uploading}
              className="flex flex-col items-center justify-center gap-1 aspect-square rounded-xl border-2 border-dashed border-surface-border hover:border-primary/40 hover:bg-surface-light text-text-muted hover:text-primary transition-all disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
              <span className="text-xs">Add Photo</span>
            </button>
          )}
        </div>
      )}

      {/* Main Upload Dropzone if no images yet */}
      {images.length === 0 && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
            uploading
              ? 'border-primary/40 bg-primary/5 cursor-wait'
              : dragActive
                ? 'border-primary bg-primary/10 scale-[1.01]'
                : 'border-surface-border hover:border-primary/40 hover:bg-surface-light/40'
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs font-medium text-primary-light">Uploading product photos...</p>
            </>
          ) : (
            <>
              <div className="p-2.5 rounded-xl bg-primary/10">
                <ImageIcon className="w-6 h-6 text-primary-light" />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-text-primary">
                  {dragActive ? 'Drop product photos here' : 'Add photos of your product experience'}
                </p>
                <p className="text-[11px] text-text-muted mt-0.5">
                  PNG, JPG, WebP up to 15MB • Max {maxImages} photos
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 p-2.5 bg-accent-red/10 border border-accent-red/20 rounded-xl">
          <AlertCircle className="w-4 h-4 text-accent-red shrink-0 mt-0.5" />
          <p className="text-xs text-accent-red">{error}</p>
        </div>
      )}
    </div>
  );
}
