import { layer14 } from '../src/utils/midi';
import { loadDevices } from './fixtures';
import { test, expect } from '@playwright/test';
import JSZip from 'jszip';
import { readFileSync } from 'node:fs';
test('edit, cancel, export and restore a temporary workspace', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (e) => errors.push(e.message));
	await page.goto('/');
	await loadDevices(page);
	await expect(page.locator('.moonlander .control')).toHaveCount(72);
	await page.screenshot({
		path: '/tmp/midi-workbench-moonlander.png',
		fullPage: true,
	});
	await page.locator('.control').first().click();
	await expect(page.getByRole('dialog')).toBeVisible();
	await page.getByLabel('Action', { exact: true }).click();
	await page.getByRole('option', { name: 'Play / pause', exact: true }).click();
	await page.getByRole('button', { name: 'Cancel', exact: true }).click();
	await expect(page.locator('.control').first()).toHaveClass(/midi/);
	await page.locator('.control').first().click();
	await page.getByLabel('Action', { exact: true }).click();
	await page.getByRole('option', { name: 'Volume', exact: true }).click();
	await page.getByLabel('Value to set').fill('0.35');
	await page.getByRole('button', { name: 'Save mapping' }).click();
	await expect(page.locator('.control').first()).toHaveClass(/both/);

	await page.getByRole('tab', { name: 'Akai MIDImix' }).click();
	await expect(page.locator('.midimix .control')).toHaveCount(52);
	await page.screenshot({
		path: '/tmp/midi-workbench-midimix.png',
		fullPage: true,
	});
	await page.locator('.knob').first().click();
	await expect(page.getByText('The physical value passes through')).toBeVisible();
	await page.getByRole('button', { name: 'Cancel', exact: true }).click();
	const downloadPromise = page.waitForEvent('download');
	await page.getByRole('button', { name: 'Download ZIP' }).click();
	const download = await downloadPromise;
	const path = await download.path();
	const zip = await JSZip.loadAsync(readFileSync(path!));
	expect(zip.file('firmware/midi_workbench/keymap.c')).toBeTruthy();
	expect(zip.file('mixxx/moonlander-workbench.midi.xml')).toBeTruthy();
	const project = JSON.parse(await zip.file('midi-workbench.json')!.async('string'));
	expect(project.controls.moonlander[0].mapping.value).toBe(0.35);
	await page.reload();
	await expect(page.locator('.moonlander .control.empty')).toHaveCount(72);
	await expect(page.getByRole('button', { name: 'Download ZIP' })).toBeDisabled();
	await page.getByRole('button', { name: 'Import files' }).click();
	await page.locator('input[type=file][accept=".zip"]').setInputFiles(path!);
	await expect(page.getByRole('dialog')).not.toBeVisible();
	await page.getByRole('tab', { name: 'Moonlander', exact: true }).click();
	await expect(page.locator('.control').first()).toHaveClass(/both/);
	await page.setViewportSize({ width: 390, height: 844 });
	await page.screenshot({
		path: '/tmp/midi-workbench-mobile.png',
		fullPage: true,
	});
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
		true,
	);
	expect(errors).toEqual([]);
});

test('imports the supplied source archive and controller files', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('.moonlander .control.empty')).toHaveCount(72);
	await page.getByRole('button', { name: 'Import files' }).click();
	await page
		.locator('input[type=file][accept=".xml,.js"]')
		.setInputFiles([
			'tests/fixtures/mixxx-controllers/Moonlander MIDI.midi.xml',
			'tests/fixtures/mixxx-controllers/moonlander-midi.js',
		]);
	await expect(page.getByRole('dialog')).not.toBeVisible();
	await expect(page.locator('.address-card')).toHaveCount(24);
	await page.getByRole('button', { name: 'Import files' }).click();
	await page
		.locator('input[type=file][accept=".zip"]')
		.setInputFiles(
			'tests/fixtures/zsa_moonlander_reva_9Wynx_3vMKwz_sadbean-attempt-thirty-fork_source.zip',
		);
	await expect(page.getByRole('dialog')).not.toBeVisible();
	await expect(page.locator('.control').first()).toContainText('Transparent');
	await page.getByRole('tab', { name: 'Akai MIDImix' }).click();
	await page.getByRole('button', { name: 'Import files' }).click();
	await page
		.locator('input[type=file][accept=".xml,.js"]')
		.setInputFiles('tests/fixtures/mixxx-controllers/akai-midimix.midi.xml');
	await expect(page.getByRole('dialog')).not.toBeVisible();
	await expect(page.locator('.control.mixxx')).toHaveCount(14);
});

test('edits hotcues and effect slots with the portfolio theme and symmetric thumb keys', async ({
	page,
}) => {
	await page.goto('/');
	await loadDevices(page);
	await expect(page.locator('.control')).toHaveCount(72);
	await expect(page.locator('.control.special')).toHaveCount(4);
	const large = page.locator('.large-thumb');
	await expect(large).toHaveCount(2);
	expect(await large.first().getAttribute('data-control-id')).toBe('moon-59');
	expect(await large.last().getAttribute('data-control-id')).toBe('moon-60');
	expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(
		'rgb(8, 15, 29)',
	);
	await page.locator('[data-control-id="moon-0"]').click();
	await page.getByLabel('Action', { exact: true }).click();
	await page.getByRole('option', { name: 'Hotcue · activate', exact: true }).click();
	await page.getByLabel('Hotcue number').click();
	await page.getByRole('option', { name: 'Hotcue 8', exact: true }).click();
	await page.getByLabel('Deck / channel').click();
	await page.getByRole('option', { name: 'Deck 2', exact: true }).click();
	await expect(page.locator('.mapping-preview')).toContainText('[Channel2] → hotcue_8_activate');
	await page.getByRole('button', { name: 'Save mapping' }).click();
	await page.getByRole('tab', { name: 'Akai MIDImix' }).click();
	await page.locator('.knob').first().click();
	await page.getByLabel('Action', { exact: true }).click();
	await page.getByRole('option', { name: 'Effect slot · parameter', exact: true }).click();
	await page.getByLabel('Effect unit').click();
	await page.getByRole('option', { name: 'Unit 3', exact: true }).click();
	await page.getByLabel('Effect slot', { exact: true }).click();
	await page.getByRole('option', { name: 'Slot 2', exact: true }).click();
	await page.getByLabel('Effect parameter').click();
	await page.getByRole('option', { name: 'Parameter 4', exact: true }).click();
	await expect(page.locator('.mapping-preview')).toContainText(
		'[EffectRack1_EffectUnit3_Effect2] → parameter4',
	);
	await page.getByRole('button', { name: 'Save mapping' }).click();
	await page.getByRole('tab', { name: 'Akai MIDImix' }).click();
	await page.locator('.knob').first().click();
	await expect(page.locator('.mapping-preview')).toContainText('parameter4');
});

test('fills a blank Oryx layer and exports the MIDI notes and preparation script', async ({
	page,
}) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Import files' }).click();
	const source = await JSZip.loadAsync(
		readFileSync(
			'tests/fixtures/zsa_moonlander_reva_9Wynx_3vMKwz_sadbean-attempt-thirty-fork_source.zip',
		),
	);
	const keymap = Object.keys(source.files).find(
		(name) => name.endsWith('/keymap.c') || name === 'keymap.c',
	)!;
	const content = await source.file(keymap)!.async('string');
	const layer = layer14(content);
	source.file(
		keymap,
		content.slice(0, layer.start) +
			Array(72).fill('KC_TRANSPARENT').join(', ') +
			content.slice(layer.end),
	);
	await page.locator('input[accept=".zip"]').setInputFiles({
		name: 'blank.zip',
		mimeType: 'application/zip',
		buffer: await source.generateAsync({ type: 'nodebuffer' }),
	});
	const fill = page.getByRole('button', { name: 'Fill empty layer with MIDI' });
	await expect(fill).toBeEnabled();
	await fill.click();
	await expect(page.locator('.control.midi')).toHaveCount(72);
	await expect(fill).toBeDisabled();
	const downloaded = page.waitForEvent('download');
	await page.getByRole('button', { name: 'Download ZIP' }).click();
	const zip = await JSZip.loadAsync(readFileSync((await (await downloaded).path())!));
	expect(await zip.file('prepare-firmware.sh')!.async('string')).toContain('qmk compile');
	const project = JSON.parse(await zip.file('midi-workbench.json')!.async('string'));
	expect(project.controls.moonlander.map((c: { number: number }) => c.number)).toEqual(
		Array.from({ length: 72 }, (_, i) => 12 + i),
	);
	await page.reload();
	await page.getByRole('button', { name: 'Import files' }).click();
	await page
		.locator('input[accept=".c,.h,.mk,.json,.md,.txt"]')
		.setInputFiles(
			['keymap.c', 'rules.mk', 'config.h'].map((name) => 'tests/fixtures/qmk-firmware/' + name),
		);
	await expect(page.getByRole('dialog')).not.toBeVisible();
	await expect(page.locator('.control')).toHaveCount(72);
	await expect(fill).toBeDisabled();
});
