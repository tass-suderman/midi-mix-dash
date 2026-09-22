// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { clearMoonlander } from '../src/utils/clearMoonlander';
import { fillMoonlander, canFillMoonlander } from '../src/utils/fillMoonlander';
import { availableActionGroups, createMapping } from '../src/utils/mappingOptions';
import { isValidControl, savedControl } from '../src/utils/controlEditor';
import { emptyProject } from '../src/utils/emptyProject';
import { projectFromFirmware, patchFirmware, exportController } from '../src/utils/projectFiles';
import { midimixControls, layer14 } from '../src/utils/midi';

const loadedProject = () =>
	projectFromFirmware(
		Object.fromEntries(
			['keymap.c', 'rules.mk', 'config.h'].map((name) => [
				name,
				readFileSync(`tests/fixtures/qmk-firmware/${name}`, 'utf8'),
			]),
		),
		emptyProject(),
		'Test',
	);

describe('clearing Moonlander keys', () => {
	it('clears notes, specials and mappings without changing other layers or MIDImix', () => {
		const project = loadedProject();
		project.controls.midimix = midimixControls();
		project.controls.midimix[0].mapping = createMapping('volume', true);
		project.controls.moonlander[0].mapping = createMapping('play', false);
		project.originals.moonlander['old.xml'] =
			'<MixxxControllerPreset><controller><controls><control><status>0x90</status><midino>0x0C</midino><key>play</key></control></controls></controller></MixxxControllerPreset>';
		const cleared = clearMoonlander(project);
		expect(canFillMoonlander(cleared)).toBe(true);
		expect(
			cleared.controls.moonlander.every((control) => control.code === 'KC_NO' && !control.mapping),
		).toBe(true);
		expect(cleared.firmware).toEqual(project.firmware);
		expect(cleared.controls.midimix).toEqual(project.controls.midimix);
		expect(project.controls.moonlander[0].mapping?.action).toBe('play');
		const patched = patchFirmware(cleared)['keymap.c'];
		expect(layer14(patched).codes).toEqual(Array(72).fill('KC_NO'));
		expect(patched.split('[14]')[0]).toBe(project.firmware['keymap.c'].split('[14]')[0]);
		expect(exportController(cleared, 'moonlander').xml).not.toContain('<control>');
		const filled = fillMoonlander(cleared);
		expect(filled.controls.moonlander.map((control) => control.number)).toEqual(
			Array.from({ length: 72 }, (_, i) => 12 + i),
		);
		expect(exportController(filled, 'moonlander').xml).not.toContain('<control>');
	});
	it('requires actual source so controller-only imports cannot be erased by mistake', () => {
		expect(() => clearMoonlander(emptyProject())).toThrow('Import Moonlander source');
	});
});
describe('continuous mapping choices and validation', () => {
	it('hides button actions and empty groups from analog controls while retaining them for buttons', () => {
		const analog = availableActionGroups(true);
		const choices = analog.flatMap((group) => group.items.map(([id]) => id));
		expect(choices).toEqual(
			expect.arrayContaining(['volume', 'pregain', 'rate', 'fx_parameter', 'crossfader', 'custom']),
		);
		for (const id of ['play', 'hotcue_activate', 'beatloop', 'fx_enabled', 'library_MoveDown'])
			expect(choices).not.toContain(id);
		expect(analog.map((group) => group.label)).not.toContain('Transport & deck');
		expect(
			availableActionGroups(false).flatMap((group) => group.items.map(([id]) => id)),
		).toContain('play');
		expect(createMapping('play', true)).toBeUndefined();
		expect(createMapping('volume', true)?.mode).toBe('continuous');
	});
	it('blocks unsupported imported actions and normalizes analog behavior when saved', () => {
		const knob = midimixControls()[0];
		knob.mapping = createMapping('play', false);
		expect(isValidControl(knob)).toBe(false);
		knob.mapping = createMapping('volume', false);
		expect(isValidControl(knob)).toBe(true);
		expect(savedControl(knob, 'midimix', 1).mapping?.mode).toBe('continuous');
		knob.mapping = undefined;
		expect(isValidControl(knob)).toBe(true);
		knob.number = 128;
		expect(isValidControl(knob)).toBe(false);
	});
});

describe('controller presentation', () => {
	it('uses the actual destination for deck-2 colors, including EQ and effect assignments', async () => {
		const { isDeckTwoMapping } = await import('../src/utils/mappingColor');
		const mapping = { ...createMapping('volume', false)!, deck: 2 };
		expect(isDeckTwoMapping(mapping)).toBe(true);
		expect(isDeckTwoMapping({ ...mapping, action: 'eq_high' })).toBe(true);
		expect(isDeckTwoMapping({ ...mapping, action: 'fx_assign', unit: 1 })).toBe(true);
		expect(isDeckTwoMapping({ ...mapping, deck: 1 })).toBe(false);
		expect(isDeckTwoMapping({ ...mapping, action: 'master_gain' })).toBe(false);
		expect(isDeckTwoMapping({ ...mapping, action: 'sampler_volume', sampler: 2 })).toBe(false);
		expect(
			isDeckTwoMapping({ ...mapping, action: 'custom', group: '[Channel2]', key: 'volume' }),
		).toBe(true);
	});
	it('rotates both thumb clusters inward without changing layout indices', async () => {
		const { moonKeyGeometry } = await import('../src/utils/moonLayout');
		for (const index of [59, 66, 67, 68]) expect(moonKeyGeometry(index).rotate).toBe(18);
		for (const index of [60, 69, 70, 71]) expect(moonKeyGeometry(index).rotate).toBe(-18);
		expect(moonKeyGeometry(0).rotate).toBe(0);
	});
});
