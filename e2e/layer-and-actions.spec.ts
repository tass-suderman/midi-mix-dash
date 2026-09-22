import { test, expect } from '@playwright/test';
import { loadDevices, loadMidimix } from './fixtures';
import JSZip from 'jszip';
import { readFileSync } from 'node:fs';

test('clear, undo, refill and export preserve the other device', async ({ page }) => {
	await page.goto('/');
	await loadDevices(page);
	const fill = page.getByRole('button', { name: 'Fill empty layer with MIDI' });
	const clear = page.getByRole('button', { name: 'Clear current keys' });
	const undo = page.getByRole('button', { name: 'Undo layer change' });
	await expect(fill).toBeDisabled();
	await clear.click();
	await expect(page.locator('.moonlander .control.empty')).toHaveCount(72);
	await expect(page.locator('.moonlander .key-name').first()).toHaveText('—');
	await expect(fill).toBeEnabled();
	await undo.click();
	await expect(page.locator('.moonlander .control.special')).toHaveCount(4);
	await expect(fill).toBeDisabled();
	await clear.click();
	await fill.click();
	await expect(page.locator('.moonlander .control.midi')).toHaveCount(72);
	await page.getByRole('tab', { name: 'Akai MIDImix' }).click();
	await expect(page.locator('.control.mixxx')).toHaveCount(14);
	const downloaded = page.waitForEvent('download');
	await page.getByRole('button', { name: 'Download ZIP' }).click();
	const zip = await JSZip.loadAsync(readFileSync((await (await downloaded).path())!));
	const project = JSON.parse(await zip.file('midi-workbench.json')!.async('string'));
	expect(project.controls.moonlander.map((control: { number: number }) => control.number)).toEqual(
		Array.from({ length: 72 }, (_, i) => 12 + i),
	);
	expect(
		project.controls.moonlander.every((control: { mapping?: unknown }) => !control.mapping),
	).toBe(true);
});

test('knobs and sliders hide button-only actions but buttons retain them', async ({ page }) => {
	await page.goto('/');
	await loadMidimix(page);
	for (const selector of ['.knob', '.fader']) {
		await page.locator(selector).first().click();
		await page.getByLabel('Action', { exact: true }).click();
		await expect(page.getByRole('option', { name: 'Play / pause', exact: true })).toHaveCount(0);
		await expect(page.getByRole('option', { name: 'Hotcue · activate', exact: true })).toHaveCount(
			0,
		);
		await expect(
			page.getByRole('option', { name: 'Effect unit · enabled', exact: true }),
		).toHaveCount(0);
		await expect(page.getByText('Transport & deck', { exact: true })).toHaveCount(0);
		await page.getByRole('option', { name: 'Volume', exact: true }).click();
		await expect(
			page.getByText('The physical value passes through', { exact: false }),
		).toBeVisible();
		await expect(page.getByLabel('Value to set')).toHaveCount(0);
		await page.getByRole('button', { name: 'Save mapping' }).click();
	}
	await page.locator('.control.button').first().click();
	await page.getByLabel('Action', { exact: true }).click();
	await expect(page.getByRole('option', { name: 'Play / pause', exact: true })).toBeEnabled();
	await page.getByRole('option', { name: 'Volume', exact: true }).click();
	await expect(page.getByLabel('Value to set')).toBeVisible();
});

test('an incompatible imported knob mapping can be removed', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('tab', { name: 'Akai MIDImix' }).click();
	await page.getByRole('button', { name: 'Import files' }).click();
	await page.locator('input[accept=".xml,.js"]').setInputFiles({
		name: 'unsupported.midi.xml',
		mimeType: 'application/xml',
		buffer: Buffer.from(
			'<MixxxControllerPreset><controller><controls><control><group>[Channel1]</group><key>play</key><status>0xB0</status><midino>0x10</midino></control></controls></controller></MixxxControllerPreset>',
		),
	});
	await page.locator('.knob').first().click();
	await expect(
		page.getByText('This imported action is not usable', { exact: false }),
	).toBeVisible();
	await expect(page.getByRole('button', { name: 'Save mapping' })).toBeDisabled();
	await page.getByLabel('Action', { exact: true }).click();
	await page.getByRole('option', { name: 'No Mixxx mapping' }).click();
	await expect(page.getByRole('button', { name: 'Save mapping' })).toBeEnabled();
	await page.getByRole('button', { name: 'Save mapping' }).click();
	await expect(page.locator('.knob').first()).not.toHaveClass(/mixxx/);
});
