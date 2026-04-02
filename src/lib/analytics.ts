/**
 * Google Analytics (GA4) initialization
 * Only loads if VITE_GA_MEASUREMENT_ID is configured
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export function initializeAnalytics() {
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  
  if (!gaId) {
    // GA not configured, skip initialization
    return;
  }

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: any[]) {
    window.dataLayer.push(args);
  };
  
  // Load Google Analytics script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);

  // Configure GA
  window.gtag('js', new Date());
  window.gtag('config', gaId, {
    page_path: window.location.pathname,
  });
}

/**
 * Track page views (call this on route changes)
 */
export function trackPageView(path: string) {
  if (window.gtag && import.meta.env.VITE_GA_MEASUREMENT_ID) {
    window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
      page_path: path,
    });
  }
}

/**
 * Track custom events
 */
export function trackEvent(eventName: string, eventParams?: Record<string, any>) {
  if (window.gtag && import.meta.env.VITE_GA_MEASUREMENT_ID) {
    window.gtag('event', eventName, eventParams);
  }
}




