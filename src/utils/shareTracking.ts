export interface ShareTrackingData {
  sharerUsername: string;
  source: 'whatsapp' | 'twitter' | 'facebook' | 'linkedin' | 'copy';
  timestamp: number;
  collectionId?: string;
  collectionName?: string;
  productId?: string;
  productName?: string;
}

export interface ShareLinkParams {
  ref: string;
  src: string;
}

const STORAGE_KEY = 'shopmatic-share-tracking';

export function generateShareUrl(baseUrl: string, source: ShareTrackingData['source'], username?: string): string {
  if (!username) {
    return baseUrl;
  }

  const url = new URL(baseUrl, window.location.origin);
  url.searchParams.set('ref', username);
  url.searchParams.set('src', source);
  
  return url.toString();
}

export function captureRefParams(): { ref?: string; src?: string } {
  const params = new URLSearchParams(window.location.search);
  return {
    ref: params.get('ref') || undefined,
    src: params.get('src') || undefined,
  };
}

export function recordShare(data: Omit<ShareTrackingData, 'timestamp'>): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const shares: ShareTrackingData[] = stored ? JSON.parse(stored) : [];
    
    shares.push({
      ...data,
      timestamp: Date.now(),
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shares));
  } catch (error) {
    console.error('Failed to record share:', error);
  }
}

export function getShareHistory(): ShareTrackingData[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function getShareStats(): {
  totalShares: number;
  sharesBySource: Record<string, number>;
  recentShares: ShareTrackingData[];
} {
  const shares = getShareHistory();
  
  const sharesBySource: Record<string, number> = {};
  shares.forEach(share => {
    sharesBySource[share.source] = (sharesBySource[share.source] || 0) + 1;
  });
  
  return {
    totalShares: shares.length,
    sharesBySource,
    recentShares: shares.slice(-10).reverse(),
  };
}

export function clearShareHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
