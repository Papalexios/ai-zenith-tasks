import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initSentry } from './utils/sentry'
import { initGoogleAnalytics } from './utils/analytics'
import { HelmetProvider } from 'react-helmet-async'
import { EnterpriseErrorBoundary } from '@/components/ui/error-boundary'

// Initialize error monitoring
initSentry()

// Initialize Google Analytics only when user consented to analytics cookies
if (process.env.NODE_ENV === 'production') {
  try {
    const consent = JSON.parse(localStorage.getItem('cookieConsent') || 'null')
    if (consent?.analytics) {
      initGoogleAnalytics('GA_MEASUREMENT_ID') // Replace with your actual GA4 Measurement ID
    }
  } catch {}
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <EnterpriseErrorBoundary>
      <App />
    </EnterpriseErrorBoundary>
  </HelmetProvider>
);
