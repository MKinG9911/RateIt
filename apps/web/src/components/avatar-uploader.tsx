'use client';

import { useState, useRef } from 'react';
import { uploadFileToStorage, deleteFileFromStorage, MAX_FILE_SIZE, formatFileSize } from '@/lib/supabase/storage';
import { UserAvatar } from '@/components/user-avatar';
import { ImageCropperModal } from '@/components/image-cropper-modal';
import { Camera, Upload, Link as LinkIcon, Trash2, Loader2, Check, Crop, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

interface AvatarUploaderProps {
  value: string;
  onChange: (url: string) => void;
  user?: { displayName?: string | null; username?: string | null; email?: string | null } | null;
}

export function AvatarUploader({ value, onChange, user }: AvatarUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropSourceUrl, setCropSourceUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 1: User selects file -> read into DataURL and open cropper modal
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !files[0]) return;

    const file = files[0];

    // Validate type
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files (JPEG, PNG, WebP) are allowed');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate size (15MB)
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File size (${formatFileSize(file.size)}) exceeds the 15MB limit`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCropSourceUrl(reader.result);
        setCropModalOpen(true);
      }
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Step 2: User confirms crop -> delete previous avatar & upload new cropped file
  const handleCropComplete = async (croppedFile: File) => {
    setUploading(true);

    try {
      // 1. Delete previous avatar from storage if it exists
      if (value) {
        await deleteFileFromStorage(value);
      }

      // 2. Upload the new cropped image to Supabase Storage
      const publicUrl = await uploadFileToStorage(croppedFile, 'avatars');
      onChange(publicUrl);
      toast.success('Profile picture updated!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  // Open cropper for currently active image
  const handleReCrop = () => {
    if (!value) return;
    setCropSourceUrl(value);
    setCropModalOpen(true);
  };

  const handleApplyUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    try {
      new URL(trimmed);

      // Delete old supabase file if replacing with URL
      if (value) {
        await deleteFileFromStorage(value);
      }

      onChange(trimmed);
      setUrlInput('');
      toast.success('Image URL applied!');
    } catch {
      toast.error('Please enter a valid image URL');
    }
  };

  const handleRemove = async () => {
    if (value) {
      await deleteFileFromStorage(value);
    }
    onChange('');
    toast.success('Profile picture removed');
  };

  return (
    <div className="space-y-4">
      {/* Cropper Modal */}
      {cropModalOpen && cropSourceUrl && (
        <ImageCropperModal
          imageSrc={cropSourceUrl}
          isOpen={cropModalOpen}
          onClose={() => setCropModalOpen(false)}
          onCropComplete={handleCropComplete}
          cropShape="round"
          title="Crop & Align Profile Photo"
        />
      )}

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar Display & Hover Camera Overlay */}
        <div className="relative group shrink-0">
          <UserAvatar
            src={value || undefined}
            user={user}
            size="2xl"
            className="ring-4 ring-surface-border shadow-xl"
          />

          {/* Quick upload trigger overlay */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
            title="Change photo"
          >
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
              </>
            )}
          </button>
        </div>

        {/* Upload Controls & Mode Switcher */}
        <div className="flex-1 space-y-3 text-center sm:text-left w-full">
          <div>
            <h3 className="font-bold text-base text-text-primary">Profile Photo</h3>
            <p className="text-xs text-text-muted mt-0.5">
              Upload from your device with interactive cropping (max 15MB) or enter an image URL.
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                mode === 'upload'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface text-text-secondary hover:text-text-primary border border-surface-border'
              }`}
            >
              <Upload className="w-3.5 h-3.5" /> Choose Photo
            </button>

            {value && (
              <button
                type="button"
                onClick={handleReCrop}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-surface text-text-secondary hover:text-primary border border-surface-border hover:border-primary/40 transition-colors"
                title="Re-crop current photo"
              >
                <Crop className="w-3.5 h-3.5" /> Re-crop Photo
              </button>
            )}

            <button
              type="button"
              onClick={() => setMode('url')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                mode === 'url'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface text-text-secondary hover:text-text-primary border border-surface-border'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" /> Image URL
            </button>

            {value && (
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-accent-red hover:bg-accent-red/10 border border-accent-red/20 transition-colors"
                title="Remove photo and delete from storage"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            )}
          </div>

          {/* File Input (Hidden) */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Mode: Direct File Picker Area */}
          {mode === 'upload' ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`p-3.5 border-2 border-dashed rounded-xl cursor-pointer transition-all flex items-center justify-center gap-3 ${
                uploading
                  ? 'border-primary bg-primary/5 cursor-wait'
                  : 'border-surface-border hover:border-primary/50 hover:bg-surface/50'
              }`}
            >
              {uploading ? (
                <div className="flex items-center gap-2 text-xs text-primary font-medium">
                  <Loader2 className="w-4 h-4 animate-spin" /> Uploading cropped photo to cloud...
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <Camera className="w-4 h-4 text-primary" />
                  <span>Click to select photo &amp; open cropper tool (max 15MB)</span>
                </div>
              )}
            </div>
          ) : (
            /* Mode: Direct URL Input */
            <form onSubmit={handleApplyUrl} className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com/my-photo.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="input py-2 text-xs flex-1"
              />
              <button type="submit" className="btn-secondary py-2 px-3 text-xs flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Apply
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
