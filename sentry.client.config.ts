import * as Sentry from '@sentry/astro';

const hasDsn = Boolean(import.meta.env.PUBLIC_SENTRY_DSN);

Sentry.init({
  dsn: import.meta.env.PUBLIC_SENTRY_DSN,
  environment: import.meta.env.MODE,
  // Capture 100% of transactions in non-prod; dial down in production if volume grows
  tracesSampleRate: hasDsn ? (import.meta.env.PROD ? 0.2 : 1.0) : 0,
  replaysSessionSampleRate: hasDsn ? 0.1 : 0,
  replaysOnErrorSampleRate: hasDsn ? 1.0 : 0,
  // Sentry 11 collects PII by default; keep the v10 (sendDefaultPii: false) behaviour
  dataCollection: {
    userInfo: false,
    cookies: false,
    httpHeaders: false,
    httpBodies: [],
    urlQueryParams: false,
  },
  integrations: hasDsn
    ? [
        Sentry.browserTracingIntegration(),
        // Replay is heavy (~60KB gzipped); only include when DSN is set
        Sentry.replayIntegration(),
        Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error'] }),
      ]
    : [
        // When DSN is absent we ship minimal SDK (no replay, no browser tracing)
        Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error'] }),
      ],
  enabled: hasDsn,
});
