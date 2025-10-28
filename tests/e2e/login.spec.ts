import { test, expect } from '@playwright/test';

test('pagina de login carrega', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Moita CRM' })).toBeVisible();
});
