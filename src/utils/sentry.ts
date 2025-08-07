import * as Sentry from "@sentry/react";

// Initialize Sentry for error monitoring
export const initSentry = () => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: "https://your-sentry-dsn@o123456.ingest.us.sentry.io/1234567", // Replace with your actual Sentry DSN
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  }
};

// Utility function to capture exceptions
export const captureException = (error: Error, context?: Record<string, any>) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setContext("additional_info", context);
      }
      Sentry.captureException(error);
    });
  } else {
    console.error('Error captured:', error, context);
  }
};

// Utility function to capture messages
export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureMessage(message, level);
  } else {
    console.log(`[${level.toUpperCase()}] ${message}`);
  }
};