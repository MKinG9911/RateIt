'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Upload,
  Link as LinkIcon,
  X,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { uploadListingImage, formatFileSize, MAX_FILE_SIZE } from '@/lib/supabase/storage';

interface ImageUploaderProps {
  value: string; // current image URL
  onChange: (url: string) => void;
}

type UploadMode = 'file' | 'url';

export default function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const [mode, setMode] = useState<UploadMode>('file');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      // Client-side validation
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed (JPG, PNG, GIF, WebP, etc.)');
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(
          `File size (${formatFileSize(file.size)}) exceeds the 15MB limit.`,
        );
        return;
      }

      setUploading(true);
      const result = await uploadListingImage(file);
      setUploading(false);

      if (result.success && result.url) {
        onChange(result.url);
      } else {
        setError(result.error || 'Upload failed. Please try again.');
      }
    },
    [onChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
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
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // Reset the input so re-selecting same file triggers change
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [handleFile],
  );

  const handleUrlSubmit = () => {
    setError(null);
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setError('Please enter a valid image URL.');
      return;
    }
    try {
      new URL(trimmed);
    } catch {
      setError('Invalid URL format.');
      return;
    }
    onChange(trimmed);
    setUrlInput('');
  };

  const handleRemoveImage = () => {
    onChange('');
    setError(null);
  };

  // If we have a value, show the preview
  if (value) {
    return (
      <div className="space-y-2">
        <label className="label">Listing Image</label>
        <div className="relative group rounded-2xl overflow-hidden border border-surface-border bg-surface">
          <img
            src={value}
            alt="Listing preview"
            className="w-full h-48 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '';
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleRemoveImage}
              className="flex items-center gap-2 px-4 py-2 bg-accent-red/80 hover:bg-accent-red text-white rounded-xl text-sm font-medium transition-colors"
            >
              <X className="w-4 h-4" />
              Remove
            </button>
          </div>
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2.5 py-1 bg-accent-green/90 text-white rounded-lg text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Uploaded
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="label">Listing Image</label>

      {/* Mode toggle tabs */}
      <div className="flex gap-1 p-1 bg-surface rounded-xl border border-surface-border">
        <button
          type="button"
          onClick={() => { setMode('file'); setError(null); }}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            mode === 'file'
              ? 'bg-primary/15 text-primary-light shadow-sm'
              : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload File
        </button>
        <button
          type="button"
          onClick={() => { setMode('url'); setError(null); }}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            mode === 'url'
              ? 'bg-primary/15 text-primary-light shadow-sm'
              : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          Image URL
        </button>
      </div>

      {/* Upload zone */}
      {mode === 'file' && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
            uploading
              ? 'border-primary/40 bg-primary/5 cursor-wait'
              : dragActive
                ? 'border-primary bg-primary/10 scale-[1.01]'
                : 'border-surface-border hover:border-primary/40 hover:bg-surface-light/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {uploading ? (
            <>
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm font-medium text-primary-light">Uploading...</p>
            </>
          ) : (
            <>
              <div className="p-3 rounded-xl bg-primary/10">
                <ImageIcon className="w-8 h-8 text-primary-light" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-text-primary">
                  {dragActive ? 'Drop your image here' : 'Drag & drop or click to upload'}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  JPG, PNG, GIF, WebP • Max 15MB
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* URL input */}
      {mode === 'url' && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUrlSubmit())}
            className="input flex-1"
            placeholder="https://example.com/image.jpg"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="btn-primary px-4 shrink-0"
          >
            Add
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-accent-red/10 border border-accent-red/20 rounded-xl">
          <AlertCircle className="w-4 h-4 text-accent-red shrink-0 mt-0.5" />
          <p className="text-xs text-accent-red">{error}</p>
        </div>
      )}
    </div>
  );
}
