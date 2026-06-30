import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { fillAndSubmitForm, IMAGES } from './helpers';

/**
 * Raport dostępności cyfrowej WCAG 2.1 AA.
 * Używa axe-core (@axe-core/playwright) — ten sam silnik co oficjalne audyty dostępności.
 * Testy NIE wywołują LLM (poza ostatnim, który weryfikuje ekran czatu po zgłoszeniu).
 */

test.describe('Dostępność WCAG 2.1 AA', () => {
  test('formularz zgłoszenia (ekran startowy) nie ma naruszeń WCAG 2.1 AA', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    if (results.violations.length > 0) {
      const report = results.violations
        .map(
          (v) =>
            `[${v.impact?.toUpperCase()}] ${v.id}: ${v.description}\n` +
            v.nodes.map((n) => `  • ${n.html}`).join('\n'),
        )
        .join('\n\n');
      throw new Error(`WCAG 2.1 AA naruszenia na ekranie formularza:\n\n${report}`);
    }

    expect(results.violations).toHaveLength(0);
  });

  test('formularz z wypełnionymi polami nie ujawnia nowych naruszeń WCAG', async ({ page }) => {
    await page.goto('/');

    // Wybierz typ Reklamacja (najbardziej złożony stan — więcej widocznych pól)
    await page.getByRole('combobox', { name: /Typ zgłoszenia/ }).click();
    await page.getByRole('option', { name: 'Reklamacja' }).click();

    await page.getByRole('combobox', { name: /Kategoria sprzętu/ }).click();
    await page.getByRole('option', { name: 'Laptopy i komputery' }).click();

    await page.getByRole('textbox', { name: /Model/ }).fill('Dell XPS 15 9530');
    await page.getByRole('textbox', { name: /Data zakupu/ }).fill('10.11.2023');
    await page.getByRole('textbox', { name: /Opis usterki/ }).fill('Ekran pęknięty.');

    const [fc] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByRole('button', { name: /Wybierz zdjęcie/ }).click(),
    ]);
    await fc.setFiles(IMAGES.laptopPng);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    if (results.violations.length > 0) {
      const report = results.violations
        .map(
          (v) =>
            `[${v.impact?.toUpperCase()}] ${v.id}: ${v.description}\n` +
            v.nodes.map((n) => `  • ${n.html}`).join('\n'),
        )
        .join('\n\n');
      throw new Error(`WCAG 2.1 AA naruszenia na wypełnionym formularzu:\n\n${report}`);
    }

    expect(results.violations).toHaveLength(0);
  });

  test('ekran czatu po zgłoszeniu nie ma naruszeń WCAG 2.1 AA', async ({ page }) => {
    // Ten test wywołuje prawdziwy LLM — potrzebuje OPENROUTER_API_KEY w środowisku.
    await fillAndSubmitForm(page, {
      type: 'ZWROT',
      categoryLabel: 'Smartfony i telefony',
      model: 'Samsung Galaxy S24',
      imagePath: IMAGES.phoneJpg,
    });

    // Poczekaj na przejście do ekranu czatu z odpowiedzią AI
    await expect(page).toHaveURL(/\/chat\/.+/, { timeout: 45_000 });
    await expect(page.locator('.decision-badge')).toBeVisible({ timeout: 45_000 });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    if (results.violations.length > 0) {
      const report = results.violations
        .map(
          (v) =>
            `[${v.impact?.toUpperCase()}] ${v.id}: ${v.description}\n` +
            v.nodes.map((n) => `  • ${n.html}`).join('\n'),
        )
        .join('\n\n');
      throw new Error(`WCAG 2.1 AA naruszenia na ekranie czatu:\n\n${report}`);
    }

    expect(results.violations).toHaveLength(0);
  });
});
