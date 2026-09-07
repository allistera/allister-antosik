import * as Sentry from '@sentry/astro';

/** Record a page view (logs + metrics). Safe when Sentry is disabled. */
export function trackPageView(path = window.location.pathname): void {
  const attributes = { path };

  Sentry.logger.info('Page view', attributes);
  Sentry.metrics.count('page.view', 1, { attributes });
}

/** Record a named UI / product event. */
export function trackEvent(
  name: string,
  attributes: Record<string, string | number | boolean> = {},
): void {
  Sentry.logger.info(name, attributes);
  Sentry.metrics.count(name, 1, { attributes });
}
