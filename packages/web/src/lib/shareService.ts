/**
 * Share Service
 * Handles sharing to external platforms (Instagram, WhatsApp, Twitter, Facebook)
 */

import type { SharePlatform, ShareOptions, ShareResult } from '@trainsmart/shared/types/social.types';

// ============================================================
// WEB SHARE API (Native)
// ============================================================

/**
 * Check if Web Share API is available
 */
export function isWebShareSupported(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator;
}

/**
 * Check if Web Share API supports sharing files
 */
export function isFileShareSupported(): boolean {
  return typeof navigator !== 'undefined' && 'canShare' in navigator;
}

/**
 * Share using native Web Share API
 */
export async function shareNative(options: ShareOptions): Promise<ShareResult> {
  if (!isWebShareSupported()) {
    return {
      success: false,
      platform: 'native',
      error: 'Web Share API not supported',
    };
  }

  try {
    const shareData: ShareData = {
      title: options.title,
      text: options.text,
    };

    if (options.url) {
      shareData.url = options.url;
    }

    // Try to share with file if available
    if (options.imageBlob && isFileShareSupported()) {
      const file = new File([options.imageBlob], 'trainflow-share.png', {
        type: 'image/png',
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        shareData.files = [file];
      }
    }

    await navigator.share(shareData);

    return { success: true, platform: 'native' };
  } catch (error: any) {
    // User cancelled share is not an error
    if (error.name === 'AbortError') {
      return { success: false, platform: 'native', error: 'Share cancelled' };
    }
    return { success: false, platform: 'native', error: error.message };
  }
}

// ============================================================
// PLATFORM-SPECIFIC SHARING
// ============================================================

/**
 * Share to WhatsApp
 */
export function shareToWhatsApp(text: string, url?: string): ShareResult {
  const message = url ? `${text}\n${url}` : text;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

  window.open(whatsappUrl, '_blank');

  return { success: true, platform: 'whatsapp' };
}

/**
 * Share to Twitter/X
 */
export function shareToTwitter(text: string, url?: string): ShareResult {
  let twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;

  if (url) {
    twitterUrl += `&url=${encodeURIComponent(url)}`;
  }

  window.open(twitterUrl, '_blank', 'width=550,height=420');

  return { success: true, platform: 'twitter' };
}

/**
 * Share to Facebook
 */
export function shareToFacebook(url: string, quote?: string): ShareResult {
  let fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  if (quote) {
    fbUrl += `&quote=${encodeURIComponent(quote)}`;
  }

  window.open(fbUrl, '_blank', 'width=550,height=420');

  return { success: true, platform: 'facebook' };
}

/**
 * Share to Instagram Stories (only works on mobile with app installed)
 * Note: Instagram Stories sharing requires the Facebook SDK or URL scheme
 */
export async function shareToInstagram(imageBlob: Blob): Promise<ShareResult> {
  // Instagram doesn't have a direct web share API
  // We can try the native share on mobile which might offer Instagram

  if (isWebShareSupported() && isFileShareSupported()) {
    const file = new File([imageBlob], 'trainflow-share.png', { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'TrainFlow',
        });
        return { success: true, platform: 'instagram' };
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('[ShareService] Instagram share error:', error);
        }
      }
    }
  }

  // Fallback: download the image
  return {
    success: false,
    platform: 'instagram',
    error: 'Instagram sharing requires the app. Image downloaded instead.',
  };
}

// ============================================================
// DOWNLOAD & COPY FALLBACKS
// ============================================================

/**
 * Download image to device
 */
export function downloadImage(blob: Blob, filename: string = 'trainflow-share.png'): ShareResult {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, platform: 'download' };
  } catch (error: any) {
    return { success: false, platform: 'download', error: error.message };
  }
}

/**
 * Copy text/URL to clipboard
 */
export async function copyToClipboard(text: string): Promise<ShareResult> {
  try {
    await navigator.clipboard.writeText(text);
    return { success: true, platform: 'copy' };
  } catch (error: any) {
    return { success: false, platform: 'copy', error: error.message };
  }
}

/**
 * Copy image to clipboard (if supported)
 */
export async function copyImageToClipboard(blob: Blob): Promise<ShareResult> {
  try {
    if (!navigator.clipboard || !('write' in navigator.clipboard)) {
      return { success: false, platform: 'copy', error: 'Clipboard API not supported' };
    }

    const item = new ClipboardItem({ 'image/png': blob });
    await navigator.clipboard.write([item]);

    return { success: true, platform: 'copy' };
  } catch (error: any) {
    return { success: false, platform: 'copy', error: error.message };
  }
}

// ============================================================
// UNIFIED SHARE FUNCTION
// ============================================================

/**
 * Share to a specific platform
 */
export async function share(options: ShareOptions): Promise<ShareResult> {
  const { platform, title, text, url, imageBlob } = options;

  switch (platform) {
    case 'native':
      return shareNative(options);

    case 'whatsapp':
      return shareToWhatsApp(text, url);

    case 'twitter':
      return shareToTwitter(text, url);

    case 'facebook':
      if (!url) {
        return { success: false, platform: 'facebook', error: 'URL required for Facebook share' };
      }
      return shareToFacebook(url, text);

    case 'instagram':
      if (!imageBlob) {
        return { success: false, platform: 'instagram', error: 'Image required for Instagram share' };
      }
      return shareToInstagram(imageBlob);

    case 'download':
      if (!imageBlob) {
        return { success: false, platform: 'download', error: 'Image required for download' };
      }
      return downloadImage(imageBlob);

    case 'copy':
      return copyToClipboard(url || text);

    default:
      return { success: false, platform, error: 'Unknown platform' };
  }
}

// ============================================================
// SHARE PLATFORMS CONFIG
// ============================================================

export interface SharePlatformConfig {
  id: SharePlatform;
  name: string;
  icon: string;
  color: string;
  requiresImage: boolean;
  requiresUrl: boolean;
  available: () => boolean;
}

export const SHARE_PLATFORMS: SharePlatformConfig[] = [
  {
    id: 'native',
    name: 'Condividi',
    icon: 'Share2',
    color: '#3b82f6',
    requiresImage: false,
    requiresUrl: false,
    available: isWebShareSupported,
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: 'MessageCircle',
    color: '#25D366',
    requiresImage: false,
    requiresUrl: false,
    available: () => true,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: 'Instagram',
    color: '#E4405F',
    requiresImage: true,
    requiresUrl: false,
    available: () => isWebShareSupported() && isFileShareSupported(),
  },
  {
    id: 'twitter',
    name: 'X / Twitter',
    icon: 'Twitter',
    color: '#1DA1F2',
    requiresImage: false,
    requiresUrl: false,
    available: () => true,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'Facebook',
    color: '#1877F2',
    requiresImage: false,
    requiresUrl: true,
    available: () => true,
  },
  {
    id: 'download',
    name: 'Scarica',
    icon: 'Download',
    color: '#6b7280',
    requiresImage: true,
    requiresUrl: false,
    available: () => true,
  },
  {
    id: 'copy',
    name: 'Copia Link',
    icon: 'Copy',
    color: '#6b7280',
    requiresImage: false,
    requiresUrl: true,
    available: () => true,
  },
];

/**
 * Get available platforms based on current capabilities
 */
export function getAvailablePlatforms(hasImage: boolean, hasUrl: boolean): SharePlatformConfig[] {
  return SHARE_PLATFORMS.filter((p) => {
    if (!p.available()) return false;
    if (p.requiresImage && !hasImage) return false;
    if (p.requiresUrl && !hasUrl) return false;
    return true;
  });
}

// ============================================================
// EXPORTS
// ============================================================

export default {
  isWebShareSupported,
  isFileShareSupported,
  shareNative,
  shareToWhatsApp,
  shareToTwitter,
  shareToFacebook,
  shareToInstagram,
  downloadImage,
  copyToClipboard,
  copyImageToClipboard,
  share,
  getAvailablePlatforms,
  SHARE_PLATFORMS,
};
