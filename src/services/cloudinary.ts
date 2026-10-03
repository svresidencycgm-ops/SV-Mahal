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

// Default configuration with real credentials
export const getCloudinaryConfig = (): CloudinaryConfig => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.cloudName && parsed.cloudName.trim()) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse Cloudinary config from localStorage', e);
  }

  // Check Vite environment variables or defaults
  const envCloudName = (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME || '';
  const envUploadPreset = (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET || '';
  const envApiKey = (import.meta as any).env?.VITE_CLOUDINARY_API_KEY || '';

  return {
    cloudName: envCloudName || 'bvnf8caw',
    uploadPreset: envUploadPreset || 'sv_residency_media',
    apiKey: envApiKey || '356683122558141',
    folder: 'sv_residency_multimedia'
  };
};

export const saveCloudinaryConfig = (config: CloudinaryConfig): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

export const isCloudinaryConfigured = (): boolean => {
  const config = getCloudinaryConfig();
  return Boolean(config.cloudName && config.cloudName !== 'sv-residency');
};

/**
 * Upload an image (File, Blob, or base64 Data URL) to Cloudinary
 * Returns permanent Cloudinary CDN secure URL (or falls back to original data URL if offline)
 */
export const uploadToCloudinary = async (
  fileOrBase64: File | Blob | string,
  folder: string = 'sv_residency_eb_bills',
  options?: { tags?: string[]; context?: Record<string, string> }
): Promise<{ url: string; publicId?: string; isCloudinary: boolean; error?: string }> => {
  const config = getCloudinaryConfig();

  // Convert File/Blob to base64 if needed
  let base64Payload = '';
  if (typeof fileOrBase64 === 'string') {
    base64Payload = fileOrBase64;
  } else if (fileOrBase64 instanceof Blob) {
    base64Payload = await blobToDataUrl(fileOrBase64);
  }

  // Method 1: Try secure backend API proxy with API Key and Secret
  try {
    const apiRes = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file: base64Payload,
        folder,
        upload_preset: config.uploadPreset
      })
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.success && data.isCloudinary && data.url) {
        return {
          url: data.url,
          publicId: data.data?.public_id,
          isCloudinary: true
        };
      }
    }
  } catch (backendErr) {
    console.info('Backend /api/upload proxy bypassed, attempting direct Cloudinary REST endpoint:', backendErr);
  }

  // Method 2: Direct client upload to Cloudinary CDN
  try {
    const formData = new FormData();
    formData.append('file', base64Payload);
    if (config.uploadPreset) {
      formData.append('upload_preset', config.uploadPreset);
    }
    formData.append('folder', folder);

    if (options?.tags && options.tags.length > 0) {
      formData.append('tags', options.tags.join(','));
    }

    const endpoint = `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`;
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const data = await response.json();
      return {
        url: data.secure_url || data.url,
        publicId: data.public_id,
        isCloudinary: true
      };
    } else {
      const errorJson = await response.json().catch(() => ({}));
      const errorMsg = errorJson?.error?.message || `HTTP ${response.status}: Cloudinary upload failed`;
      console.warn('Direct Cloudinary warning:', errorMsg);

      return {
        url: base64Payload,
        isCloudinary: false,
        error: errorMsg
      };
    }
  } catch (err: any) {
    console.warn('Cloudinary network exception, using local watermarked fallback:', err);
    return {
      url: base64Payload,
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
