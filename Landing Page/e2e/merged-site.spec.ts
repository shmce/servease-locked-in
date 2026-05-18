import { expect, test, type Page } from '@playwright/test';

function watchRuntimeErrors(page: Page) {
  const errors: string[] = [];

  page.on('pageerror', (error) => {
    errors.push(`pageerror: ${error.message}`);
  });

  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(`console.error: ${message.text()}`);
    }
  });

  return errors;
}

test.describe('merged landing and provider website', () => {
  test('keeps the public landing routes and customer login separate', async ({ page }) => {
    const errors = watchRuntimeErrors(page);

    await page.goto('/');
    await expect(page.getByRole('heading', { name: /book trusted services/i })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign In' })).toHaveAttribute('href', '/login');
    await expect(page.getByRole('link', { name: 'Join as a Worker' })).toHaveAttribute(
      'href',
      '/provider-registration',
    );

    await page.getByRole('link', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText('Access your account profile and provider status.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Provider Login' })).toHaveCount(0);

    expect(errors).toEqual([]);
  });

  test('customer login is wired to Supabase instead of failing setup checks', async ({ page }) => {
    await page.goto('/login');
    await expect(
      page.getByText('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are required.'),
    ).toHaveCount(0);

    await page.getByLabel('Email').fill('not-a-real-customer@example.invalid');
    await page.getByLabel('Password', { exact: true }).fill('DefinitelyNotThePassword123!');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.locator('.bg-red-50')).toBeVisible();
    await expect(
      page.getByText('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are required.'),
    ).toHaveCount(0);
  });

  test('renders provider login under /provider/login without the public shell', async ({ page }) => {
    const errors = watchRuntimeErrors(page);

    await page.goto('/provider/login');
    await expect(page.getByRole('heading', { name: 'Provider Login' })).toBeVisible();
    await expect(page.getByText('Welcome back! Please enter your details')).toBeVisible();
    await expect(page.locator('nav')).toHaveCount(0);

    await page.getByRole('button', { name: 'Apply now' }).click();
    await expect(page).toHaveURL(/\/provider-registration$/);
    await expect(page.getByRole('heading', { name: 'Join ServEase as a Service Worker' })).toBeVisible();
    await expect(page.getByRole('navigation')).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('provider login is wired to Supabase instead of failing setup checks', async ({ page }) => {
    await page.goto('/provider/login');
    await expect(
      page.getByText('Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY for provider login.'),
    ).toHaveCount(0);

    await page.getByLabel('Email or Phone Number').fill('not-a-real-provider@example.invalid');
    await page.getByLabel('Password').fill('DefinitelyNotThePassword123!');
    await page.getByRole('button', { name: 'Log In' }).click();

    await expect(page.getByText(/invalid|incorrect|credentials/i)).toBeVisible();
    await expect(
      page.getByText('Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY for provider login.'),
    ).toHaveCount(0);
  });

  test('redirects unauthenticated provider dashboard traffic to provider login', async ({ page }) => {
    const errors = watchRuntimeErrors(page);

    await page.goto('/provider');
    await expect(page).toHaveURL(/\/provider\/login$/);
    await expect(page.getByRole('heading', { name: 'Provider Login' })).toBeVisible();

    await page.goto('/provider/dashboard');
    await expect(page).toHaveURL(/\/provider\/login$/);
    await expect(page.getByRole('heading', { name: 'Provider Login' })).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('keeps provider listing detail routes in the public shell', async ({ page }) => {
    const errors = watchRuntimeErrors(page);

    await page.goto('/');
    const providerLink = page.getByRole('link', { name: /view provider and request booking/i }).first();

    test.skip((await providerLink.count()) === 0, 'No live provider listings returned by the gateway.');

    await providerLink.click();
    await expect(page).toHaveURL(/\/providers\/[^/]+$/);
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Request this booking' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Provider Login' })).toHaveCount(0);

    expect(errors).toEqual([]);
  });

  test('supports mobile public navigation after the merge', async ({ page }) => {
    const errors = watchRuntimeErrors(page);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Toggle menu' }).click();
    await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible();

    await page.getByRole('link', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText('Access your account profile and provider status.')).toBeVisible();

    expect(errors).toEqual([]);
  });
});
