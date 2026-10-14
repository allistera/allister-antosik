import * as Sentry from '@sentry/astro';

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV ?? 'development',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  // Sentry 11 collects PII by default; keep the v10 (sendDefaultPii: false) behaviour
  dataCollection: {
    userInfo: false,
    cookies: false,
    httpHeaders: false,
    httpBodies: [],
    urlQueryParams: false,
  },
  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ['log', 'info', 'warn', 'error'] }),
    Sentry.nodeRuntimeMetricsIntegration(),
  ],
  enabled: Boolean(process.env.SENTRY_DSN || process.env.PUBLIC_SENTRY_DSN),
});
