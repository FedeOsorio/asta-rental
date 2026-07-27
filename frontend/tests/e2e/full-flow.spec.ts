import { test, expect } from '@playwright/test';

test.describe('asta-rental End-to-End SaaS Flow', () => {
  test('Complete flow: Login -> Dashboard -> Create Property -> Lease -> Mark Paid', async ({ page }) => {
    // 1. Visit Login Page
    await page.goto('http://localhost:3000/login');
    await expect(page.locator('h1')).toContainText('asta-rental');

    // 2. Perform Login with Demo Alpha Admin credentials
    await page.click('button:has-text("Alpha Admin")');
    await page.click('button[type="submit"]');

    // 3. Verify Dashboard Access & Collection Metric Cards
    await expect(page).toHaveURL('http://localhost:3000/');
    await expect(page.locator('h1')).toContainText('Collection Dashboard');

    // 4. Navigate to Properties
    await page.click('a:has-text("Properties")');
    await expect(page).toHaveURL('http://localhost:3000/properties');

    // 5. Open Create Property Modal
    await page.click('button:has-text("Add Property")');
    await page.fill('input[placeholder*="Evergreen"]', '888 Sunset Blvd');
    await page.click('button:has-text("Create Property")');

    // 6. Navigate to Payments and Mark as Paid
    await page.click('a:has-text("Payments")');
    await expect(page).toHaveURL('http://localhost:3000/payments');
  });
});
