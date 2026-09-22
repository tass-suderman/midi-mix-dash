import { loadFirmware } from './fixtures';
import { test, expect } from '@playwright/test';

test('all 72 keys remain clickable above the mirrored shells', async ({ page }) => {
	await page.goto('/');
	await loadFirmware(page);
	await expect(page.locator('.moonlander .control')).toHaveCount(72);
	for (const control of await page.locator('.moonlander .control').all()) {
		await control.scrollIntoViewIfNeeded();
		expect(
			await control.evaluate((el) => {
				const rect = el.getBoundingClientRect();
				return el.contains(
					document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2),
				);
			}),
			await control.getAttribute('data-control-id'),
		).toBe(true);
	}
});
