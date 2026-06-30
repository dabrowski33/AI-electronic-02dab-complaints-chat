import { test, expect } from '@playwright/test';

/**
 * Health / isAlive checks — fast structural smoke tests that do NOT invoke the LLM.
 * These run against the real stack (Angular on :4200, Spring Boot on :8080).
 */

test.describe('Health / isAlive', () => {
  test('frontend loads — NBP title and header visible', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Asystent reklamacji/);

    await expect(page.locator('[role="banner"]')).toContainText('Asystent reklamacji i zwrotów');

    await expect(page.locator('img[alt*="Narodowy Bank Polski"]')).toBeVisible();

    await expect(page.locator('h2').first()).toBeVisible();
    await expect(page.locator('h2').first()).toContainText('Zgłoś reklamację');
  });

  test('backend actuator health returns UP', async ({ request }) => {
    const res = await request.get('http://localhost:8080/actuator/health');

    expect(res.status()).toBe(200);
    expect((await res.json()).status).toBe('UP');
  });
});
