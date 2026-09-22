import { expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import JSZip from 'jszip';

export const loadFirmware = async (page: Page) => {
	const zip = new JSZip();
	for (const name of ['keymap.c', 'config.h', 'rules.mk', 'keymap.json'])
		zip.file(name, readFileSync(`qmk-firmware/${name}`));
	await page.getByRole('button', { name: 'Import files', exact: true }).click();
	await page.locator('input[type=file][accept=".zip"]').setInputFiles({
		name: 'test-firmware.zip',
		mimeType: 'application/zip',
		buffer: await zip.generateAsync({ type: 'nodebuffer' }),
	});
	await expect(page.getByRole('dialog')).not.toBeVisible();
};
export const loadMidimix = async (page: Page) => {
	await page.getByRole('tab', { name: 'Akai MIDImix' }).click();
	await page.getByRole('button', { name: 'Import files', exact: true }).click();
	await page
		.locator('input[type=file][accept=".xml,.js"]')
		.setInputFiles('mixxx-controllers/akai-midimix.midi.xml');
	await expect(page.getByRole('dialog')).not.toBeVisible();
};
export const loadDevices = async (page: Page) => {
	await loadFirmware(page);
	await loadMidimix(page);
	await page.getByRole('tab', { name: 'Moonlander', exact: true }).click();
};
