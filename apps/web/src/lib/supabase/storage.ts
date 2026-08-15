import { createClient } from './client';

const BUCKET_NAME = 'listing-images';
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload a file to Supabase Storage in a specific folder and return its public URL.
 * Validates file size (max 15MB) and type (images only).
 */
export async function uploadFileToStorage(file: File, folder = 'uploads'): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed.');
  }

  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(`File size (${sizeMB}MB) exceeds the 15MB limit.`);
  }

  const supabase = createClient();
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const filePath = `${folder}/${uniqueName}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    console.error('Supabase storage upload error:', error);
    throw new Error(error.message);
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

/**
 * Upload a file to Supabase Storage and return its public URL (listing-specific helper).
 * Validates file size (max 15MB) and type (images only).
 */
export async function uploadListingImage(file: File): Promise<UploadResult> {
  try {
    const url = await uploadFileToStorage(file, 'listings');
    return { success: true, url };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Delete a file from Supabase Storage by its public URL.
 * Silently ignores external/non-supabase URLs.
 */
export async function deleteFileFromStorage(publicUrl?: string | null): Promise<boolean> {
  if (!publicUrl) return false;
  try {
    const supabase = createClient();
    // Expected public URL pattern: .../storage/v1/object/public/<BUCKET_NAME>/<filePath>
    const bucketMarker = `/object/public/${BUCKET_NAME}/`;
    const markerIndex = publicUrl.indexOf(bucketMarker);
    if (markerIndex === -1) {
      // Not stored in our Supabase bucket (e.g. external link)
      return false;
    }

    const filePath = decodeURIComponent(publicUrl.substring(markerIndex + bucketMarker.length));
    if (!filePath) return false;

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);
    if (error) {
      console.warn(`Failed to delete storage file "${filePath}":`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Error during storage file deletion:', err);
    return false;
  }
}

/**
 * Format bytes into a human-readable string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export { MAX_FILE_SIZE, BUCKET_NAME };
