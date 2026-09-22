import { test, expect } from '@playwright/test';
import JSZip from 'jszip';
import { readFileSync } from 'node:fs';
import { loadMidimix } from './fixtures';

test('starts empty, removes legacy autosave, and never sends or persists project data', async ({
	page,
	context,
}) => {
	await page.addInitScript(() => {
		localStorage.setItem('midi-workbench-v1', '{"private":"old project"}');
	});
	const requests: string[] = [];
	page.on('request', (request) => {
		if (['fetch', 'xhr', 'ping'].includes(request.resourceType())) requests.push(request.url());
	});
	await page.goto('/');
	await expect(page.getByText('No Moonlander files loaded')).toBeVisible();
	await expect(page.getByRole('button', { name: 'Download ZIP' })).toBeDisabled();
	await page.getByRole('tab', { name: 'Akai MIDImix' }).click();
	await expect(page.getByText('No MIDImix files loaded')).toBeVisible();
	await loadMidimix(page);
	await expect(page.locator('.midimix .control')).toHaveCount(52);
	await page.locator('.knob').first().click();
	await page.getByRole('button', { name: 'Save mapping' }).click();
	const downloadPromise = page.waitForEvent('download');
	await page.getByRole('button', { name: 'Download ZIP' }).click();
	const file = await (await downloadPromise).path();
	const zip = await JSZip.loadAsync(readFileSync(file!));
	expect(zip.file('mixxx/midimix-workbench.midi.xml')).toBeTruthy();
	expect(Object.keys(zip.files).some((name) => name.startsWith('firmware/'))).toBe(false);
	expect(zip.file('mixxx/moonlander-workbench.midi.xml')).toBeNull();
	expect(
		await page.evaluate(() => ({
			local: localStorage.length,
			session: sessionStorage.length,
			cookies: document.cookie,
		})),
	).toEqual({ local: 0, session: 0, cookies: '' });
	expect(await context.cookies()).toEqual([]);
	await page.reload();
	await expect(page.getByText('No Moonlander files loaded')).toBeVisible();
	expect(requests).toEqual([]);
});

test('information includes the AGPL, accurate hosting disclosure, and matching source download', async ({
	page,
}) => {
	await page.goto('/');
	await page.getByRole('tab', { name: 'Information' }).click();
	await expect(page.getByRole('heading', { name: 'License · GNU AGPL v3' })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Privacy policy', exact: true })).toBeVisible();
	await expect(page.getByText(/even when Web Analytics is not enabled/)).toBeVisible();
	const downloadPromise = page.waitForEvent('download');
	await page.getByRole('link', { name: 'Download application source' }).click();
	const file = await (await downloadPromise).path();
	const zip = await JSZip.loadAsync(readFileSync(file!));
	expect(await zip.file('src/hooks/useProject.ts')!.async('string')).toBe(
		readFileSync('src/hooks/useProject.ts', 'utf8'),
	);
	expect(zip.file('LICENSE.md')).toBeTruthy();
	expect(zip.file('scripts/sourceArchive.ts')).toBeTruthy();
	expect(
		Object.keys(zip.files).some(
			(n) =>
				n.startsWith('tests/fixtures/qmk-firmware/') ||
				n.includes('.env') ||
				n.startsWith('public/examples'),
		),
	).toBe(false);
	await page.setViewportSize({ width: 390, height: 844 });
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
		true,
	);
});

test('production build works without application network connections', async ({ page }) => {
	const policy =
		"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'none'";
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.route('http://127.0.0.1:7457/**', async (route) => {
		const pathname = new URL(route.request().url()).pathname.replace(/^\/midi-mix-dash(?=\/)/, '');
		const file = pathname === '/' ? 'index.html' : pathname.slice(1);
		const contentType = file.endsWith('.js')
			? 'text/javascript'
			: file.endsWith('.css')
				? 'text/css'
				: file.endsWith('.html')
					? 'text/html'
					: 'application/octet-stream';
		try {
			await route.fulfill({
				body: readFileSync(`dist/${file}`),
				contentType,
				headers: { 'Content-Security-Policy': policy },
			});
		} catch {
			await route.fulfill({ status: 404, body: 'Not found' });
		}
	});
	await page.goto('/');
	await expect(page.getByText('No Moonlander files loaded')).toBeVisible();
	await loadMidimix(page);
	await expect(page.locator('.control')).toHaveCount(52);
	const downloadPromise = page.waitForEvent('download');
	await page.getByRole('button', { name: 'Download ZIP' }).click();
	expect((await downloadPromise).suggestedFilename()).toBe('midi-workbench.zip');
	expect(errors).toEqual([]);
});
