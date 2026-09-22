import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

test('single-spa mounts with isolated styles and discards state on unmount', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.route('http://127.0.0.1:7457/**', async (route) => {
		const path = new URL(route.request().url()).pathname.replace(/^\/midi-mix-dash(?=\/)/, '');
		if (path === '/')
			return route.fulfill({
				contentType: 'text/html',
				body: '<h1 id="host-title">Platform shell</h1><div id="microfrontend"></div>',
			});
		try {
			await route.fulfill({
				body: readFileSync('dist' + path),
				contentType: path.endsWith('.js')
					? 'text/javascript'
					: path.endsWith('.css')
						? 'text/css'
						: 'application/octet-stream',
			});
		} catch {
			await route.fulfill({ status: 404, body: 'Missing asset' });
		}
	});
	await page.goto('/');
	const hostStyle = await page
		.locator('#host-title')
		.evaluate((el) => getComputedStyle(el).fontSize);
	await page.addScriptTag({
		type: 'module',
		content: `
  import {bootstrap,mount,unmount} from '/midi-mix-dash/spa.js';
  const props = {name:'midi-mix-dash',domElement:document.getElementById('microfrontend')};
  await bootstrap(props);
  window.mountMidi = () => mount(props);
  window.unmountMidi = () => unmount(props);
  await mount(props);
 `,
	});
	await expect(page.getByText('No Moonlander files loaded')).toBeVisible();
	expect(await page.locator('#host-title').evaluate((el) => getComputedStyle(el).fontSize)).toBe(
		hostStyle,
	);
	expect(await page.locator('.workspace').evaluate((el) => getComputedStyle(el).borderRadius)).toBe(
		'16px',
	);
	await page.getByRole('button', { name: 'Import files' }).click();
	await page
		.locator('input[accept=".c,.h,.mk,.json,.md,.txt"]')
		.setInputFiles(
			['keymap.c', 'rules.mk', 'config.h'].map((name) => 'tests/fixtures/qmk-firmware/' + name),
		);
	await expect(page.locator('.control')).toHaveCount(72);
	await page.locator('.control').first().click();
	await expect(page.getByRole('dialog')).toBeVisible();
	expect(await page.locator('.midi-mix-dash [role="dialog"]').count()).toBe(1);
	await page.getByRole('button', { name: 'Cancel', exact: true }).click();
	await page.getByRole('tab', { name: 'Information' }).click();
	const source = page.waitForEvent('download');
	await page.getByRole('link', { name: 'Download application source' }).click();
	expect((await source).suggestedFilename()).toBe('source.zip');
	await page.evaluate(async () => {
		await (window as any).unmountMidi();
	});
	await expect(page.locator('#microfrontend')).toBeEmpty();
	expect(await page.locator('#host-title').evaluate((el) => getComputedStyle(el).fontSize)).toBe(
		hostStyle,
	);
	await page.evaluate(async () => {
		await (window as any).mountMidi();
	});
	await expect(page.getByText('No Moonlander files loaded')).toBeVisible();
	expect(errors).toEqual([]);
});
