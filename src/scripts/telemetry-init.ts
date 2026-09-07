import { trackEvent, trackPageView } from '../lib/telemetry';

trackPageView();

// Carousel interactions (homepage)
document.addEventListener(
  'click',
  (event) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    if (target.closest('#carousel-prev')) {
      trackEvent('carousel.nav', { direction: 'prev' });
    } else if (target.closest('#carousel-next')) {
      trackEvent('carousel.nav', { direction: 'next' });
    } else if (target.closest('#carousel-dots button, #carousel-dots [data-index]')) {
      trackEvent('carousel.nav', { direction: 'dot' });
    }
  },
  { passive: true },
);
