// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import {
	layer14,
	moonControls,
	midimixControls,
	noteFromCode,
	type Project,
} from '../src/utils/midi';
import {
	patchFirmware,
	importLegacy,
	importXml,
	exportController,
	importFirmware,
} from '../src/utils/projectFiles';
import JSZip from 'jszip';
const read = (n: string) => readFileSync(new URL('../' + n, import.meta.url), 'utf8');
function project(): Project {
	const firmware = Object.fromEntries(
		['keymap.c', 'rules.mk', 'config.h', 'keymap.json'].map((n) => [
			n,
			read('tests/fixtures/qmk-firmware/' + n),
		]),
	);
	return {
		version: 1,
		name: 'Test',
		firmware,
		octave: 1,
		channel: 1,
		controls: {
			moonlander: moonControls(firmware['keymap.c']),
			midimix: midimixControls(),
		},
		originals: { moonlander: {}, midimix: {} },
	};
}
describe('firmware source', () => {
	it('reads 72 keys including nested tap dance and preserves untouched source', () => {
		const p = project();
		const original = p.firmware['keymap.c'];
		expect(layer14(original).codes).toHaveLength(72);
		expect(layer14(original).codes).toContain('TD(DANCE_0)');
		p.controls.moonlander[0].code = 'MI_D';
		const result = patchFirmware(p);
		expect(layer14(result['keymap.c']).codes[0]).toBe('MI_D');
		expect(result['keymap.c'].split('[14]')[0]).toBe(original.split('[14]')[0]);
		expect(result['rules.mk'].match(/MIDI_ENABLE = yes/g)).toHaveLength(1);
		expect(result['config.h'].match(/#define MIDI_ADVANCED/g)).toHaveLength(1);
		expect(patchFirmware({ ...p, firmware: result })).toEqual(result);
	});
	it('converts aliases and startup octave without off-by-one errors', () => {
		expect(noteFromCode('MI_C', 1)).toBe(12);
		expect(noteFromCode('MI_Ab2', 1)).toBe(44);
		expect(noteFromCode('MI_Gs2', 1)).toBe(44);
		expect(noteFromCode('TD(DANCE_0)')).toBeUndefined();
	});
	it('rejects missing and malformed layouts', () => {
		expect(() => layer14('abc')).toThrow();
		expect(() => layer14('[14] = LAYOUT_moonlander(KC_A)')).toThrow('72');
	});
	it('imports the actual Oryx zip and patches only the requested layer', async () => {
		const z = readFileSync(
			'tests/fixtures/zsa_moonlander_reva_9Wynx_3vMKwz_sadbean-attempt-thirty-fork_source.zip',
		);
		Object.assign(z, { name: 'oryx.zip' });
		const p = await importFirmware(z as unknown as File, project());
		expect(p.controls.moonlander).toHaveLength(72);
		expect(p.controls.moonlander[0].code).toBe('KC_TRANSPARENT');
		expect(patchFirmware(p)['keymap.c']).toContain('midi_config.octave = 1;');
	});
});
describe('Mixxx interoperability', () => {
	it('loads all original Moonlander callbacks and MIDImix CC mappings', () => {
		const p = project();
		expect(
			importLegacy(
				read('tests/fixtures/mixxx-controllers/moonlander-midi.js'),
				p.controls.moonlander,
			),
		).toBe(24);
		expect(p.controls.moonlander.find((c) => c.number === 44)?.mapping?.action).toBe('play');
		expect(
			importXml(read('tests/fixtures/mixxx-controllers/akai-midimix.midi.xml'), p.controls.midimix),
		).toBe(14);
		expect(p.controls.midimix.find((c) => c.number === 61)?.mapping?.action).toBe('volume');
	});
	it('generates executable toggle, release, fixed-value and continuous handlers', () => {
		const p = project();
		const controls = p.controls.moonlander;
		controls[0].mapping = { action: 'play', deck: 2, value: 1, mode: 'toggle' };
		controls[1].mapping = {
			action: 'cue_default',
			deck: 1,
			value: 1,
			mode: 'momentary',
		};
		controls[2].mapping = {
			action: 'volume',
			deck: 1,
			value: 0.5,
			mode: 'set',
		};
		controls[3].mapping = {
			action: 'volume',
			deck: 1,
			value: 1,
			mode: 'continuous',
		};
		const { xml, script } = exportController(p, 'moonlander');
		expect(
			new DOMParser().parseFromString(xml, 'application/xml').querySelectorAll('control'),
		).toHaveLength(8);
		const calls: unknown[][] = [];
		const ctx = {
			engine: {
				getValue: () => 0,
				setValue: (...a: unknown[]) => calls.push(a),
				setParameter: (...a: unknown[]) => calls.push(a),
			},
		};
		vm.createContext(ctx);
		vm.runInContext(script, ctx);
		const api = (ctx as any).WorkbenchMoonlander;
		api.control0(0, 12, 127, 144);
		api.control0(0, 12, 0, 128);
		expect(calls).toEqual([['[Channel2]', 'play', 1]]);
		api.control1(0, 13, 127, 128);
		expect(calls.at(-1)).toEqual(['[Channel1]', 'cue_default', 0]);
		api.control2(0, 14, 100, 144);
		expect(calls.at(-1)).toEqual(['[Channel1]', 'volume', 0.5]);
		api.control3(0, 15, 127, 176);
		expect(calls.at(-1)).toEqual(['[Channel1]', 'volume', 1]);
	});
	it('preserves unmatched mappings, script bindings and outputs', () => {
		const p = project();
		p.originals.midimix['test.xml'] =
			'<MixxxControllerPreset><controller><scriptfiles><file filename="custom.js"/></scriptfiles><controls><control><status>0xB0</status><midino>0x10</midino><key>Custom.run</key><options><Script-Binding/></options></control><control><status>0xB5</status><midino>0x7F</midino><key>volume</key></control></controls><outputs><output><key>play</key></output></outputs></controller></MixxxControllerPreset>';
		const { xml } = exportController(p, 'midimix');
		expect(xml).toContain('Custom.run');
		expect(xml).toContain('0x7F');
		expect(xml).toContain('<output>');
		expect(xml).toContain('custom.js');
	});
	it('restores a project manifest from ZIP', async () => {
		const p = project();
		const zip = new JSZip();
		zip.file('midi-workbench.json', JSON.stringify(p));
		expect(
			await importFirmware((await zip.generateAsync({ type: 'uint8array' })) as unknown as File, p),
		).toEqual(p);
	});
});

describe('expanded controls and visual geometry', () => {
	it('mirrors the keyboard and keeps thumb positions separate from firmware order', async () => {
		const { moonKeyGeometry } = await import('../src/utils/moonLayout');
		const p = project();
		const before = p.controls.moonlander.map((c) => c.code);
		let start = 0;
		for (const count of [7, 7, 7, 6, 6, 3]) {
			for (let col = 0; col < count; col++) {
				const left = moonKeyGeometry(start + col);
				const right = moonKeyGeometry(start + 2 * count - 1 - col);
				expect(left.left + right.left + left.width).toBe(1040);
				expect(left.top).toBe(right.top);
				expect(left.rotate).toBe(-right.rotate);
			}
			start += count * 2;
		}
		expect(moonKeyGeometry(59).large).toBe(true);
		expect(moonKeyGeometry(60).large).toBe(true);
		expect(before[59]).toBe('TD(DANCE_0)');
		expect(before[60]).toBe('MI_A4');
		expect(layer14(patchFirmware(p)['keymap.c']).codes).toEqual(before);
	});
	it('exports and reimports hotcue, loop, effect, sampler, master and library targets', async () => {
		const { target, mappingFromTarget } = await import('../src/utils/midi');
		const cases = [
			['hotcue_activate', { hotcue: 8 }, '[Channel2]', 'hotcue_8_activate'],
			['beatloop', { beats: 4 }, '[Channel2]', 'beatloop_4_toggle'],
			['beatlooproll', { beats: 0.25 }, '[Channel2]', 'beatlooproll_0.25_activate'],
			[
				'fx_parameter',
				{ unit: 3, effect: 2, parameter: 4 },
				'[EffectRack1_EffectUnit3_Effect2]',
				'parameter4',
			],
			['fx_assign', { unit: 4 }, '[EffectRack1_EffectUnit4]', 'group_[Channel2]_enable'],
			['sampler_volume', { sampler: 12 }, '[Sampler12]', 'volume'],
			['master_gain', {}, '[Master]', 'gain'],
			['library_MoveDown', {}, '[Library]', 'MoveDown'],
			['autodj_fade_now', {}, '[AutoDJ]', 'fade_now'],
			['eq_kill_mid', {}, '[EqualizerRack1_[Channel2]_Effect1]', 'button2'],
		] as const;
		for (const [action, details, group, key] of cases) {
			const m = {
				action,
				deck: 2,
				value: 1,
				mode: 'trigger' as const,
				...details,
			};
			expect(target(m)).toEqual([group, key]);
			const restored = mappingFromTarget(group, key);
			expect(restored.action).toBe(action);
			expect(target(restored)).toEqual([group, key]);
		}
		expect(mappingFromTarget('[Sampler8]', 'unsupported').action).toBe('custom');
	});
	it('pulses repeatable triggers and releases hotcues on note-off', () => {
		const p = project();
		p.controls.moonlander[0].mapping = {
			action: 'beatloop',
			deck: 1,
			value: 1,
			mode: 'trigger',
			beats: 8,
		};
		p.controls.moonlander[1].mapping = {
			action: 'hotcue_activate',
			deck: 2,
			value: 1,
			mode: 'momentary',
			hotcue: 3,
		};
		const calls: unknown[][] = [];
		const ctx = {
			engine: { setValue: (...args: unknown[]) => calls.push(args) },
		};
		vm.createContext(ctx);
		vm.runInContext(exportController(p, 'moonlander').script, ctx);
		const api = (ctx as any).WorkbenchMoonlander;
		api.control0(0, 12, 127, 144);
		api.control0(0, 12, 0, 128);
		api.control0(0, 12, 127, 144);
		expect(calls.map((c) => c[2])).toEqual([1, 0, 1, 0]);
		api.control1(0, 13, 127, 144);
		api.control1(0, 13, 127, 128);
		expect(calls.slice(-2)).toEqual([
			['[Channel2]', 'hotcue_3_activate', 1],
			['[Channel2]', 'hotcue_3_activate', 0],
		]);
	});
});

describe('empty and controller-only projects', () => {
	it('validates an empty workspace and imports source without loading the other device', async () => {
		const { emptyProject } = await import('../src/utils/emptyProject');
		const { validateProject } = await import('../src/utils/projectFiles');
		const empty = emptyProject();
		expect(() => validateProject(empty)).not.toThrow();
		expect(empty.controls).toEqual({ moonlander: [], midimix: [] });
		const zip = new JSZip();
		for (const [name, content] of Object.entries(project().firmware)) zip.file(name, content);
		const file = Object.assign(await zip.generateAsync({ type: 'uint8array' }), {
			name: 'firmware.zip',
		});
		const imported = await importFirmware(file as unknown as File, empty);
		expect(imported.controls.moonlander).toHaveLength(72);
		expect(imported.controls.midimix).toEqual([]);
	});
	it('keeps legacy Moonlander mappings editable without inventing firmware positions', async () => {
		const { controllerAddresses } = await import('../src/utils/controllerAddresses');
		const { emptyProject } = await import('../src/utils/emptyProject');
		const { validateProject } = await import('../src/utils/projectFiles');
		const p = emptyProject();
		const script = read('tests/fixtures/mixxx-controllers/moonlander-midi.js');
		p.controls.moonlander = controllerAddresses({ 'moonlander.js': script });
		expect(importLegacy(script, p.controls.moonlander)).toBe(24);
		expect(p.controls.moonlander.every((control) => control.code === undefined)).toBe(true);
		expect(() => validateProject(p)).not.toThrow();
		const zip = new JSZip();
		for (const [name, content] of Object.entries(project().firmware)) zip.file(name, content);
		const file = Object.assign(await zip.generateAsync({ type: 'uint8array' }), {
			name: 'firmware.zip',
		});
		const imported = await importFirmware(file as unknown as File, p);
		expect(imported.controls.moonlander.filter((control) => control.mapping)).toHaveLength(24);
	});
});

describe('blank-layer MIDI fill', () => {
	it('fills 72 ascending notes, preserves other layers and devices, and round-trips', async () => {
		const { fillMoonlander, canFillMoonlander } = await import('../src/utils/fillMoonlander');
		const { emptyProject } = await import('../src/utils/emptyProject');
		const bytes = Object.assign(
			readFileSync(
				'tests/fixtures/zsa_moonlander_reva_9Wynx_3vMKwz_sadbean-attempt-thirty-fork_source.zip',
			),
			{ name: 'oryx.zip' },
		);
		const blank = await importFirmware(bytes as unknown as File, emptyProject());
		// The real Oryx layer retains a tap-dance key; explicitly blank it for this case.
		blank.controls.moonlander.forEach((c) => {
			c.code = 'KC_TRANSPARENT';
		});
		expect(canFillMoonlander(blank)).toBe(true);
		const filled = fillMoonlander({ ...blank, octave: 2, channel: 7 });
		expect(filled.controls.moonlander.map((c) => c.number)).toEqual(
			Array.from({ length: 72 }, (_, i) => 24 + i),
		);
		expect(filled.controls.moonlander.every((c) => c.channel === 7)).toBe(true);
		expect(filled.controls.moonlander[0].code).toBe('MI_C');
		expect(filled.controls.moonlander[71].code).toBe('MI_B5');
		expect(filled.controls.midimix).toEqual([]);
		expect(blank.controls.moonlander[0].code).toBe('KC_TRANSPARENT');
		expect(canFillMoonlander(filled)).toBe(false);
		const patched = patchFirmware(filled);
		expect(patched['keymap.c'].split('[14]')[0]).toBe(blank.firmware['keymap.c'].split('[14]')[0]);
		expect(moonControls(patched['keymap.c'], 2, 7).map((c) => c.number)).toEqual(
			filled.controls.moonlander.map((c) => c.number),
		);
		const zip = new JSZip();
		zip.file('midi-workbench.json', JSON.stringify(filled));
		expect(
			await importFirmware(
				(await zip.generateAsync({ type: 'uint8array' })) as unknown as File,
				blank,
			),
		).toEqual(filled);
	});
	it('refuses empty workspaces, partial layouts, special keys, and existing mappings', async () => {
		const { fillMoonlander, canFillMoonlander } = await import('../src/utils/fillMoonlander');
		const { emptyProject } = await import('../src/utils/emptyProject');
		expect(() => fillMoonlander(emptyProject())).toThrow();
		const p = project();
		expect(() => fillMoonlander(p)).toThrow();
		p.controls.moonlander.forEach((c) => {
			c.code = 'KC_NO';
		});
		expect(canFillMoonlander(p)).toBe(true);
		p.controls.moonlander[59].code = 'TD(DANCE_0)';
		expect(() => fillMoonlander(p)).toThrow();
		p.controls.moonlander[59].code = 'KC_TRNS';
		p.controls.moonlander[0].mapping = { action: 'play', deck: 1, mode: 'toggle', value: 1 };
		expect(() => fillMoonlander(p)).toThrow();
	});
	it('imports loose source files and rejects incomplete selections', async () => {
		const { importFirmwareFiles } = await import('../src/utils/projectFiles');
		const { emptyProject } = await import('../src/utils/emptyProject');
		const files = Object.entries(project().firmware).map(
			([name, content]) => ({ name, text: async () => content }) as File,
		);
		const imported = await importFirmwareFiles(files, emptyProject());
		expect(imported.firmware).toEqual(project().firmware);
		expect(imported.controls.moonlander).toHaveLength(72);
		await expect(importFirmwareFiles(files.slice(0, 1), emptyProject())).rejects.toThrow(
			'together',
		);
		await expect(importFirmwareFiles([...files, files[0]], emptyProject())).rejects.toThrow(
			'Duplicate',
		);
	});
});
