/**
 * Cloudinary Multimedia Storage Service
 * Handles uploading EB Meter bills, guest ID cards, damage photos, and multimedia files
 * to Cloudinary CDN with automatic fallback to local watermarked storage.
 */

export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
  apiKey?: string;
  folder?: string;
}

const STORAGE_KEY = 'sv_cloudinary_config';

// Default configuration with fallback support
export const getCloudinaryConfig = (): CloudinaryConfig => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.cloudName && parsed.uploadPreset) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse Cloudinary config from localStorage', e);
  }

  // Check Vite environment variables if available
  const envCloudName = (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME || '';
  const envUploadPreset = (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET || '';

  return {
    cloudName: envCloudName || 'sv-residency',
    uploadPreset: envUploadPreset || 'sv_residency_media',
    folder: 'sv_residency_multimedia'
  };
};

export const saveCloudinaryConfig = (config: CloudinaryConfig): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

export const isCloudinaryConfigured = (): boolean => {
  const config = getCloudinaryConfig();
  // Valid if non-empty and not generic placeholder
  return Boolean(config.cloudName && config.uploadPreset && config.cloudName !== 'sv-residency');
};

/**
 * Upload an image (File, Blob, or base64 Data URL) to Cloudinary
 * Returns permanent Cloudinary CDN secure URL (or falls back to original data URL if offline/unconfigured)
 */
export const uploadToCloudinary = async (
  fileOrBase64: File | Blob | string,
  folder: string = 'sv_residency_eb_bills',
  options?: { tags?: string[]; context?: Record<string, string> }
): Promise<{ url: string; publicId?: string; isCloudinary: boolean; error?: string }> => {
  const config = getCloudinaryConfig();

  // If no valid Cloud Name or Upload Preset is configured yet, gracefully return the base64/URL
  if (!config.cloudName || !config.uploadPreset || config.cloudName === 'sv-residency') {
    let resultUrl = typeof fileOrBase64 === 'string' ? fileOrBase64 : '';
    if (!resultUrl && fileOrBase64 instanceof Blob) {
      resultUrl = await blobToDataUrl(fileOrBase64);
    }
    return {
      url: resultUrl,
      isCloudinary: false,
      error: 'Cloudinary credentials pending configuration in Settings -> Cloudinary Storage.'
    };
  }

  try {
    const formData = new FormData();

    if (typeof fileOrBase64 === 'string') {
      formData.append('file', fileOrBase64);
    } else {
      formData.append('file', fileOrBase64);
    }

    formData.append('upload_preset', config.uploadPreset);
    formData.append('folder', folder);

    if (options?.tags && options.tags.length > 0) {
      formData.append('tags', options.tags.join(','));
    }

    const endpoint = `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`;
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      const errorMsg = errorJson?.error?.message || `HTTP ${response.status}: Cloudinary upload failed`;
      console.warn('Cloudinary upload warning:', errorMsg);

      // Graceful fallback to data URL
      let fallbackUrl = typeof fileOrBase64 === 'string' ? fileOrBase64 : '';
      if (!fallbackUrl && fileOrBase64 instanceof Blob) {
        fallbackUrl = await blobToDataUrl(fileOrBase64);
      }
      return {
        url: fallbackUrl,
        isCloudinary: false,
        error: errorMsg
      };
    }

    const data = await response.json();
    return {
      url: data.secure_url || data.url,
      publicId: data.public_id,
      isCloudinary: true
    };
  } catch (err: any) {
    console.error('Cloudinary Network/CORS error:', err);
    let fallbackUrl = typeof fileOrBase64 === 'string' ? fileOrBase64 : '';
    if (!fallbackUrl && fileOrBase64 instanceof Blob) {
      fallbackUrl = await blobToDataUrl(fileOrBase64);
    }
    return {
      url: fallbackUrl,
      isCloudinary: false,
      error: err.message || 'Network error during Cloudinary upload'
    };
  }
};

const blobToDataUrl = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
