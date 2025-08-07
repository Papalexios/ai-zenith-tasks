// Google Analytics utility functions
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// Initialize Google Analytics
export const initGoogleAnalytics = (measurementId: string) => {
  if (typeof window === 'undefined') return;

  // Load Google Analytics script
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer?.push(arguments);
  };
  
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    page_title: document.title,
    page_location: window.location.href,
    send_page_view: true
  });
};

// Track custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Track page views
export const trackPageView = (path: string, title?: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('config', 'GA_MEASUREMENT_ID', {
    page_path: path,
    page_title: title,
  });
};

// Track user signup
export const trackSignup = (method: string = 'email') => {
  trackEvent('sign_up', 'engagement', method);
};

// Track subscription purchase
export const trackPurchase = (value: number, currency: string = 'USD') => {
  trackEvent('purchase', 'ecommerce', 'subscription', value);
  
  if (window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: Date.now().toString(),
      value: value,
      currency: currency,
      items: [{
        item_id: 'pro_subscription',
        item_name: 'AI Task Manager Pro Subscription',
        category: 'subscription',
        quantity: 1,
        price: value
      }]
    });
  }
};

// Track task creation
export const trackTaskCreated = (taskType: string = 'manual') => {
  trackEvent('task_created', 'productivity', taskType);
};

// Track AI feature usage
export const trackAIFeatureUsed = (feature: string) => {
  trackEvent('ai_feature_used', 'ai_features', feature);
};

// Track session duration
export const trackSessionDuration = (duration: number) => {
  trackEvent('session_duration', 'engagement', 'minutes', Math.round(duration / 60000));
};