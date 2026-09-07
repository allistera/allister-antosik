import { test, expect } from '@playwright/test';

test.describe('Performance loading boundaries', () => {
  test('TC-PERF-01: Below-the-fold services stay off the initial request path', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', request => requests.push(request.url()));

    await page.goto('/', { waitUntil: 'load' });
    await page.waitForTimeout(500);

    expect(requests.some(url => url.includes('/pagefind/pagefind-component-ui'))).toBe(false);
    expect(requests.some(url => url.includes('/vendor/htmx.min.js'))).toBe(false);
    expect(requests.some(url => url.includes('/api/projects/'))).toBe(false);
  });

  test('TC-PERF-02: Search assets load on search interaction', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' });

    const searchScript = page.waitForResponse('**/pagefind/pagefind-component-ui.js');
    await page.locator('.site-search-trigger').click();
    await searchScript;

    await expect.poll(() => page.evaluate(() => Boolean(customElements.get('pagefind-modal-trigger')))).toBe(true);
    await expect(page.locator('pagefind-modal dialog[open]')).toBeVisible();
  });

  test('TC-PERF-02A: Search has one keyboard-operable control before loading', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' });

    const trigger = page.locator('.site-search-trigger');
    await expect(trigger).not.toHaveAttribute('role');
    await expect(trigger).not.toHaveAttribute('tabindex');

    const button = trigger.locator('button');
    await expect(button).toBeVisible();
    await button.focus();
    await page.keyboard.press('Enter');

    await expect(page.locator('pagefind-modal dialog[open]')).toBeVisible();
  });

  test('TC-PERF-02B: Search retries after its script fails to load', async ({ page }) => {
    let attempts = 0;
    const pageErrors: string[] = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.route('**/pagefind/pagefind-component-ui.js*', route => {
      attempts += 1;
      return attempts === 1 ? route.abort() : route.continue();
    });
    await page.goto('/', { waitUntil: 'load' });

    const initialButton = page.locator('.site-search-trigger button');
    await initialButton.dispatchEvent('click');
    await expect(page.locator('#site-search-status')).toContainText('failed to load');

    await initialButton.dispatchEvent('click');
    await expect(page.locator('pagefind-modal dialog[open]')).toBeVisible();
    expect(attempts).toBe(2);
    expect(pageErrors).toEqual([]);
  });

  test('TC-PERF-03: Carousel uses responsive lazy-loaded images', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const image = page.locator('#carousel-container .carousel-slide.active .carousel-image');
    await expect(image).toHaveAttribute('loading', 'lazy');
    await expect(image).toHaveAttribute('fetchpriority', 'low');
    await expect(image).toHaveAttribute('src', '/screenshots/cookie-web-640.webp');
    await expect(image).toHaveAttribute('srcset', /cookie-web-1200\.webp 1200w/);
  });

  test('TC-PERF-04: Projects need no client-side request', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', request => requests.push(request.url()));
    await page.goto('/', { waitUntil: 'load' });
    await page.locator('#projects-list').scrollIntoViewIfNeeded();
    await expect(page.locator('#projects-list .project-card')).toHaveCount(6);
    expect(requests.some(url => url.includes('/api/projects/'))).toBe(false);
    expect(requests.some(url => url.includes('/vendor/htmx.min.js'))).toBe(false);
  });

  test('TC-PERF-05: Disabled telemetry is excluded from the browser build', async ({ page }) => {
    const scripts: string[] = [];
    page.on('request', request => {
      if (request.resourceType() === 'script') scripts.push(request.url());
    });

    await page.goto('/', { waitUntil: 'load' });

    await expect(page.locator('meta[name="sentry-route-name"]')).toHaveCount(0);
    expect(scripts.some(url => /\/_astro\/page\.[^/]+\.js$/.test(url))).toBe(false);
  });
});
