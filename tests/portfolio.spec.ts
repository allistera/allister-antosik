import { test, expect } from '@playwright/test';

test.describe('Feature 1: Portfolio Showcase Homepage (R1) - Tier 1 & Tier 2', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto('/');
  });

  // TC-F1-01: Main Header Elements
  test('TC-F1-01: Main Header Elements', async ({ page }) => {
    const mainHeading = page.locator('h1');
    await expect(mainHeading).toBeVisible();
    await expect(mainHeading).toContainText('Lead SRE & AIOps Engineer');
  });

  // TC-F1-02: Developer & DevOps Background
  test('TC-F1-02: Developer & DevOps Background', async ({ page }) => {
    const backgroundSection = page.locator('text=Background');
    await expect(backgroundSection).toBeVisible();

    const bodyText = await page.textContent('body');
    expect(bodyText).toContain('senior developer');
    expect(bodyText).toContain('DevOps');
  });

  // TC-F1-03: Design Philosophy Render
  test('TC-F1-03: Design Philosophy Render', async ({ page }) => {
    const philosophySection = page.locator('text=Design Philosophy');
    await expect(philosophySection).toBeVisible();

    const bodyText = await page.textContent('body');
    expect(bodyText).toContain('KISS');
    expect(bodyText).toContain('simplicity');
  });

  // TC-F1-04: Header & Footer Navigation Links
  test('TC-F1-04: Header & Footer Navigation Links', async ({ page }) => {
    // Header Links
    const homeLink = page.locator('header nav a[href="/"]');
    const blogLink = page.locator('header nav a[href="/blog/"]');
    await expect(homeLink).toBeVisible();
    await expect(blogLink).toBeVisible();

    // Footer Links
    const githubLink = page.locator('footer a[href*="github.com"]');
    const linkedinLink = page.locator('footer a[href*="linkedin.com"]');
    await expect(githubLink).toBeVisible();
    await expect(linkedinLink).toBeVisible();
  });

  // TC-F1-05: Dark SRE Theme Styling
  test('TC-F1-05: Dark SRE Theme Styling', async ({ page }) => {
    const body = page.locator('body');
    const bodyClass = await body.getAttribute('class');
    expect(bodyClass).toContain('bg-zinc-950');
    expect(bodyClass).toContain('text-zinc-50');
  });

  // TC-F1-06: Ultra-Wide Screens Layout
  test('TC-F1-06: Ultra-Wide Screens Layout', async ({ page }) => {
    await page.setViewportSize({ width: 2560, height: 1440 });
    // Let layout settle
    await page.waitForTimeout(100);

    const mainContainer = page.locator('main');
    await expect(mainContainer).toBeVisible();

    const boundingBox = await mainContainer.boundingBox();
    expect(boundingBox).not.toBeNull();
    if (boundingBox) {
      // Container width should be constrained (e.g. max-w-7xl is 1280px, well below 2560px)
      expect(boundingBox.width).toBeLessThan(2000);
      // It should be centered, meaning x coordinate is roughly (2560 - width) / 2
      expect(boundingBox.x).toBeGreaterThan(100);
    }
  });

  // TC-F1-07: Micro-Screen Responsiveness
  test('TC-F1-07: Micro-Screen Responsiveness', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.waitForTimeout(100);

    // Verify no horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);

    // Main heading should wrap or be sized cleanly
    const mainHeading = page.locator('h1');
    await expect(mainHeading).toBeVisible();
  });

  // TC-F1-08: CSS Slow Load Recovery
  test('TC-F1-08: CSS Slow Load Recovery', async ({ page, context }) => {
    // Set up a new page to abort CSS requests
    const cssAbortedPage = await context.newPage();
    await cssAbortedPage.route('**/*.css', route => route.abort());
    const response = await cssAbortedPage.goto('/');
    expect(response?.status()).toBe(200);

    // The bare HTML layout remains structured and readable
    const bodyText = await cssAbortedPage.textContent('body');
    expect(bodyText).toContain('Lead SRE & AIOps Engineer');
    expect(bodyText).toContain('senior developer');
    expect(bodyText).toContain('Background');
    await cssAbortedPage.close();
  });

  // TC-F1-09: Accessibility Focus States
  test('TC-F1-09: Accessibility Focus States', async ({ page }, testInfo) => {
    // Skip WebKit/Safari because it doesn't support link focusing via tab on macOS by default
    if (testInfo.project.name.includes('webkit') || testInfo.project.name.includes('safari')) {
      test.skip();
      return;
    }

    // Focus the page body initially
    await page.locator('body').focus();
    
    // Press Tab multiple times and verify that focus outline rules apply to active elements
    // Tab 1: Logo Link
    await page.keyboard.press('Tab');
    let focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Tab 2: Home Nav Link
    await page.keyboard.press('Tab');
    focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Tab 3: Blog Nav Link
    await page.keyboard.press('Tab');
    focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  // TC-F1-11: Skip link and current-page navigation state
  test('TC-F1-11: Skip link and current-page navigation state', async ({ page }) => {
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toHaveText('Skip to content');
    await expect(skipLink).not.toBeInViewport();

    await skipLink.focus();
    await expect(skipLink).toBeInViewport();
    await skipLink.press('Enter');
    await expect(page).toHaveURL(/#main-content$/);
    await expect(page.locator('main#main-content')).toBeVisible();

    await expect(page.locator('header nav a[href="/"]')).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('header nav a[href="/blog/"]')).not.toHaveAttribute('aria-current', 'page');

    await page.goto('/blog/');
    await expect(page.locator('header nav a[href="/blog/"]')).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('header nav a[href="/"]')).not.toHaveAttribute('aria-current', 'page');
  });

  // TC-F1-10: SEO & Viewport Meta Tags
  test('TC-F1-10: SEO & Viewport Meta Tags', async ({ page }) => {
    // Viewport configuration
    const viewportMeta = page.locator('meta[name="viewport"]');
    await expect(viewportMeta).toHaveAttribute('content', 'width=device-width, initial-scale=1.0');

    // Document description
    const descMeta = page.locator('meta[name="description"]');
    await expect(descMeta).toHaveAttribute(
      'content',
      'Lead SRE & AIOps Engineer based in Edinburgh, Scotland — portfolio and blog on automation, reliability, and high-performance systems.',
    );

    // OpenGraph
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', 'Allister Antosik - Lead SRE & AIOps Engineer Portfolio');

    // HTML Lang
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('lang', 'en');
  });

});
