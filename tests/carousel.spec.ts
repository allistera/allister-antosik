import { test, expect } from '@playwright/test';

test.describe('Screenshot carousel', () => {
  const initialiseCarousel = async (page: import('@playwright/test').Page) => {
    const carousel = page.locator('#carousel-container');
    await carousel.scrollIntoViewIfNeeded();
    await expect(carousel).toHaveAttribute('data-carousel-ready', 'true');
    return carousel;
  };

  test('TC-F3-01: initialization enhances the server-rendered slides', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 300 });
    await page.goto('/');
    await expect(page.locator('#carousel-container')).toHaveAttribute('data-carousel-ready', 'false');
    await page.locator('.carousel-slide').first().evaluate((slide) => {
      (window as Window & { initialCarouselSlide?: Element }).initialCarouselSlide = slide;
    });

    const carousel = await initialiseCarousel(page);

    expect(await page.evaluate(() => (
      (window as Window & { initialCarouselSlide?: Element }).initialCarouselSlide
      === document.querySelector('.carousel-slide')
    ))).toBe(true);
    await expect(carousel.locator('.carousel-slide.active .carousel-title')).toHaveText('Cookie');
  });

  test('TC-F3-02: buttons, dots, and keyboard navigate between slides', async ({ page }) => {
    await page.goto('/');
    const carousel = await initialiseCarousel(page);

    await carousel.locator('#carousel-next').click();
    await expect(carousel.locator('.carousel-slide.active .carousel-title')).toHaveText('Mobile Home Dashboard');

    await carousel.locator('.carousel-dot').first().click();
    await expect(carousel.locator('.carousel-slide.active .carousel-title')).toHaveText('Cookie');

    await carousel.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(carousel.locator('.carousel-slide.active .carousel-title')).toHaveText('Mobile Home Dashboard');
  });

  test('TC-F3-03: carousel dot controls have usable touch targets', async ({ page }) => {
    await page.goto('/');
    const carousel = await initialiseCarousel(page);

    for (const dot of await carousel.locator('.carousel-dot').all()) {
      const box = await dot.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(24);
      expect(box?.height).toBeGreaterThanOrEqual(24);
    }
  });

  test('TC-F3-04: broken images fall back without disabling navigation', async ({ page }) => {
    await page.route('**/screenshots/not-found.webp', route => route.fulfill({ status: 404 }));
    await page.goto('/');
    await page.locator('.carousel-slide').first().locator('.carousel-image').evaluate((image) => {
      image.removeAttribute('srcset');
      image.setAttribute('src', '/screenshots/not-found.webp');
    });
    const carousel = await initialiseCarousel(page);

    await expect(carousel.locator('.carousel-slide.active .carousel-image')).toHaveAttribute('src', /^data:image\/svg\+xml/);
    await carousel.locator('#carousel-next').click();
    await expect(carousel.locator('.carousel-slide.active .carousel-title')).toHaveText('Mobile Home Dashboard');
  });

  test('TC-F3-05: screenshot modal contains focus and restores it on close', async ({ page }) => {
    await page.goto('/');
    const carousel = await initialiseCarousel(page);
    const opener = carousel.locator('.carousel-slide.active .carousel-image-btn');
    await opener.click();

    const lightbox = page.locator('#carousel-lightbox');
    await expect(lightbox).toBeVisible();
    for (let index = 0; index < 8; index += 1) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => Boolean(document.activeElement?.closest('#carousel-lightbox')))).toBe(true);
    }

    await page.keyboard.press('Escape');
    await expect(lightbox).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test('TC-F3-06: a failed carousel module offers a working reload', async ({ page }) => {
    let attempts = 0;
    const pageErrors: string[] = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.route('**/_astro/carousel.*.js*', route => {
      attempts += 1;
      return attempts === 1 ? route.abort() : route.continue();
    });
    await page.goto('/');
    await page.locator('#carousel-container').scrollIntoViewIfNeeded();

    const status = page.locator('#carousel-status');
    await expect(status).toBeVisible();
    await expect(status).toContainText('failed to load');
    expect(attempts).toBe(1);

    // Hovering or focusing the reload button re-enters the container, which retries the import and can
    // hide the status before a pointer click lands, so dispatch the click directly.
    await Promise.all([
      page.waitForEvent('load'),
      page.locator('#carousel-reload').dispatchEvent('click'),
    ]);
    await expect(page.locator('#carousel-container')).toHaveAttribute('data-carousel-ready', 'true');
    expect(attempts).toBe(2);
    expect(pageErrors).toEqual([]);
  });
});
