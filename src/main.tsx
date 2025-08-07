import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initSentry } from './utils/sentry'
import { initGoogleAnalytics } from './utils/analytics'

// Initialize error monitoring
initSentry()

// Initialize Google Analytics for production
if (process.env.NODE_ENV === 'production') {
  initGoogleAnalytics('GA_MEASUREMENT_ID'); // Replace with your actual GA4 Measurement ID
}

createRoot(document.getElementById("root")!).render(<App />);
