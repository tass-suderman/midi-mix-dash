import { test, expect } from '@playwright/test';
import { loadDevices } from './fixtures';

test('shows empty hardware immediately and opens import when selected', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('.moonlander .control.empty')).toHaveCount(72);
	await expect(page.locator('.control.midi,.control.mixxx,.control.both')).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'Download ZIP' })).toBeDisabled();
	await page.locator('.control').first().click();
	await expect(page.getByRole('dialog')).toBeVisible();
	await page.getByRole('button', { name: 'Close', exact: true }).click();
	await page.getByRole('tab', { name: 'Akai MIDImix' }).click();
	await expect(page.locator('.midimix .control.empty')).toHaveCount(52);
	await expect(page.getByRole('button', { name: 'Download ZIP' })).toBeDisabled();
	await page.screenshot({ path: '/tmp/midi-empty-midimix.png', fullPage: true });
});

test('deck 2 mappings use green for MIDI keys and yellow for MIDImix controls', async ({
	page,
}) => {
	await page.goto('/');
	await loadDevices(page);
	await page.locator('.control').first().click();
	await page.getByLabel('Action', { exact: true }).click();
	await page.getByRole('option', { name: 'Play / pause', exact: true }).click();
	await page.getByLabel('Deck / channel').click();
	await page.getByRole('option', { name: 'Deck 2', exact: true }).click();
	await page.getByRole('button', { name: 'Save mapping' }).click();
	const key = page.locator('.control').first();
	await expect(key).toHaveClass(/both deck-two/);
	await expect
		.poll(() => key.evaluate((el) => getComputedStyle(el).boxShadow))
		.toContain('158, 206, 106');
	await page.screenshot({ path: '/tmp/midi-inward-moonlander.png', fullPage: true });
	await page.getByRole('tab', { name: 'Akai MIDImix' }).click();
	const knob = page.locator('.knob').first();
	await knob.click();
	await page.getByLabel('Action', { exact: true }).click();
	await page.getByRole('option', { name: 'Volume', exact: true }).click();
	await page.getByLabel('Deck / channel').click();
	await page.getByRole('option', { name: 'Deck 2', exact: true }).click();
	await page.getByRole('button', { name: 'Save mapping' }).click();
	await expect(knob).toHaveClass(/mixxx deck-two/);
	await expect
		.poll(() => knob.evaluate((el) => getComputedStyle(el).boxShadow))
		.toContain('224, 175, 104');
	await knob.click();
	await page.getByLabel('Deck / channel').click();
	await page.getByRole('option', { name: 'Deck 1', exact: true }).click();
	await page.getByRole('button', { name: 'Save mapping' }).click();
	await expect(knob).not.toHaveClass(/deck-two/);
});
