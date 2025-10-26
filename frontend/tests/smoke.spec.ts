import { test, expect } from '@playwright/test';

test('abre a app e vê título', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Task/i);
});
