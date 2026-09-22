import JSZip from 'jszip';
import {
	type Project,
	type Control,
	type Device,
	type Mapping,
	layer14,
	moonControls,
	mappingFromTarget,
	target,
	hex,
	noteFromCode,
} from './midi';
export function importLegacy(script: string, controls: Control[]) {
	let count = 0;
	const pitches: Record<string, number> = {
		C: 0,
		Cs: 1,
		Db: 1,
		D: 2,
		Ds: 3,
		Eb: 3,
		E: 4,
		F: 5,
		Fs: 6,
		Gb: 6,
		G: 7,
		Gs: 8,
		Ab: 8,
		A: 9,
		As: 10,
		Bb: 10,
		B: 11,
	};
	const re = /onKey\(note\("([A-G](?:s|b)?)",\s*(\d+)\),\s*(\w+)\(([^)]*)\)\)/g;
	for (const m of script.matchAll(re)) {
		const n = 12 * (Number(m[2]) + 1) + pitches[m[1]],
			args = m[4].split(',').map((s) => s.trim());
		const names: Record<string, string> = {
			pausePlay: 'play',
			cue: 'cue_default',
			sync: 'sync_enabled',
			toggleHeadphones: 'pfl',
			volume: 'volume',
			reverse: 'reverseroll',
			beatJump: 'beatjump',
		};
		if (!names[m[3]]) continue;
		const action = names[m[3]];
		const mapping: Mapping = {
			action,
			deck: Number(args[0]),
			value:
				({ 'FILTER.HIGH': 1, 'FILTER.MID': 0.5, 'FILTER.LOW': 0 } as Record<string, number>)[
					args[1]
				] ?? Number(args[1] ?? 1),
			mode: ['play', 'sync_enabled', 'pfl'].includes(action)
				? 'toggle'
				: ['cue_default', 'reverseroll'].includes(action)
					? 'momentary'
					: 'set',
			beats: Number(args[1]) || 1,
			direction: args[2] === 'BACKWARD' ? 'backward' : 'forward',
		};
		controls
			.filter(
				(c) =>
					c.number === n &&
					c.channel === 1 &&
					c.message === 'note' &&
					(!c.code || c.code.startsWith('MI_')),
			)
			.forEach((c) => {
				c.mapping = mapping;
				count++;
			});
	}
	return count;
}
export function importXml(xml: string, controls: Control[]) {
	const doc = new DOMParser().parseFromString(xml, 'application/xml');
	if (doc.querySelector('parsererror') || !doc.querySelector('MixxxControllerPreset'))
		throw new Error('Invalid Mixxx controller XML.');
	let count = 0;
	doc.querySelectorAll('controls > control').forEach((el) => {
		const get = (s: string) => el.querySelector(s)?.textContent?.trim() ?? '';
		const status = Number(get('status')),
			number = Number(get('midino'));
		if (el.querySelector('options > Script-Binding, options > script-binding')) return;
		const control = controls.find(
			(c) =>
				c.number === number &&
				c.channel === (status & 15) + 1 &&
				c.message === ((status & 240) === 176 ? 'cc' : 'note'),
		);
		if (control) {
			control.managed = true;
			control.mapping = mappingFromTarget(
				get('group'),
				get('key'),
				control.kind === 'knob' || control.kind === 'fader',
			);
			count++;
		}
	});
	return count;
}
export async function importFirmware(file: File, project: Project): Promise<Project> {
	const zip = await JSZip.loadAsync(file);
	const manifest = zip.file('midi-workbench.json');
	if (manifest) {
		const p = JSON.parse(await manifest.async('string'));
		validateProject(p);
		return p;
	}
	const candidates = Object.keys(zip.files).filter((n) => /(^|\/)keymap.c$/.test(n));
	if (candidates.length !== 1)
		throw new Error(
			'Upload a source ZIP containing exactly one keymap.c (compiled .bin files cannot be edited).',
		);
	const path = candidates[0],
		prefix = path.slice(0, -8);
	const firmware: Record<string, string> = {};
	for (const entry of Object.values(zip.files))
		if (!entry.dir && entry.name.startsWith(prefix) && !/\.(bin|hex|uf2|md5)$/.test(entry.name))
			firmware[entry.name.slice(prefix.length)] = await entry.async('string');
	if (!firmware['config.h'] || !firmware['rules.mk'])
		throw new Error('Source ZIP must include config.h and rules.mk next to keymap.c.');
	const octave = Number(/midi_config.octave\s*=\s*(\d+)/.exec(firmware['keymap.c'])?.[1] ?? 1);
	const channel =
		Number(/midi_config.channel\s*=\s*(\d+)/.exec(firmware['keymap.c'])?.[1] ?? 0) + 1;
	const controls = moonControls(firmware['keymap.c'], octave, channel);
	for (const c of controls)
		if (noteFromCode(c.code!, octave) !== undefined)
			c.mapping = project.controls.moonlander.find(
				(old) => old.number === c.number && old.channel === c.channel && old.message === 'note',
			)?.mapping;
	return {
		...project,
		firmware,
		octave,
		channel,
		controls: { ...project.controls, moonlander: controls },
		name: file.name.replace(/\.zip$/i, ''),
	};
}
export function validateProject(p: unknown): asserts p is Project {
	const x = p as Project;
	if (
		!x ||
		x.version !== 1 ||
		!x.firmware ||
		!Array.isArray(x.controls?.moonlander) ||
		!Array.isArray(x.controls?.midimix) ||
		!x.originals?.moonlander ||
		!x.originals?.midimix ||
		x.octave < 0 ||
		x.octave > 4 ||
		x.channel < 1 ||
		x.channel > 16 ||
		!Number.isInteger(x.octave) ||
		!Number.isInteger(x.channel)
	)
		throw new Error('This is not a valid MIDI Workbench project.');
	if (Object.keys(x.firmware).length) {
		if (
			typeof x.firmware['keymap.c'] !== 'string' ||
			typeof x.firmware['config.h'] !== 'string' ||
			typeof x.firmware['rules.mk'] !== 'string' ||
			x.controls.moonlander.length !== 72
		)
			throw new Error('Project contains incomplete firmware.');
		layer14(x.firmware['keymap.c']);
	}

	for (const c of [...x.controls.moonlander, ...x.controls.midimix])
		if (
			typeof c.id !== 'string' ||
			!Number.isInteger(c.number) ||
			!['key', 'button', 'knob', 'fader'].includes(c.kind) ||
			!['note', 'cc'].includes(c.message) ||
			(c.kind === 'key' && typeof c.code !== 'string') ||
			(c.mapping &&
				(!Number.isFinite(c.mapping.value) ||
					typeof c.mapping.action !== 'string' ||
					!['toggle', 'momentary', 'set', 'continuous', 'trigger'].includes(c.mapping.mode))) ||
			c.number < 0 ||
			c.number > 127 ||
			!Number.isInteger(c.channel) ||
			c.channel < 1 ||
			c.channel > 16 ||
			!Number.isFinite(c.x) ||
			!Number.isFinite(c.y)
		)
			throw new Error('Project contains an invalid control.');
}
export function patchFirmware(p: Project) {
	const files = { ...p.firmware };
	let source = files['keymap.c'];
	const span = layer14(source);
	source =
		source.slice(0, span.start) +
		'\n    ' +
		p.controls.moonlander.map((c) => c.code).join(', ') +
		'\n  ' +
		source.slice(span.end);
	for (const [field, value] of [
		['octave', p.octave],
		['channel', p.channel - 1],
		['transpose', 0],
	] as const) {
		const re = new RegExp(`midi_config\\.${field}\\s*=\\s*[^;]+;`, 'g');
		if (re.test(source)) source = source.replace(re, `midi_config.${field} = ${value};`);
		else if (/void\s+keyboard_post_init_user\s*\(\s*void\s*\)\s*\{/.test(source))
			source = source.replace(
				/(void\s+keyboard_post_init_user\s*\(\s*void\s*\)\s*\{)/,
				`$1\n  midi_config.${field} = ${value};`,
			);
		else source += `\nvoid keyboard_post_init_user(void) { midi_config.${field} = ${value}; }\n`;
	}
	files['keymap.c'] = source;
	files['rules.mk'] =
		files['rules.mk'].replace(/^[ \t]*MIDI_ENABLE[ \t]*[:?+]?=.*$/gm, '').trimEnd() +
		'\nMIDI_ENABLE = yes\n';
	files['config.h'] =
		files['config.h']
			.replace(/^[ \t]*#[ \t]*(?:define|undef)[ \t]+MIDI_(?:ADVANCED|BASIC).*$/gm, '')
			.trimEnd() + '\n#define MIDI_ADVANCED\n';
	return files;
}
const escape = (s: string) =>
	s.replace(
		/[<>&"']/g,
		(c) =>
			({
				'<': '&lt;',
				'>': '&gt;',
				'&': '&amp;',
				'"': '&quot;',
				"'": '&apos;',
			})[c]!,
	);
export function exportController(p: Project, device: Device) {
	const prefix = device === 'moonlander' ? 'WorkbenchMoonlander' : 'WorkbenchMidimix';
	const controls = p.controls[device];
	const script: string[] = [
		`// MIDI_WORKBENCH_CONTROLS:${JSON.stringify(controls.map(({ number, channel, message, mapping }) => ({ number, channel, message, mapping })))}`,
		`var ${prefix} = {};`,
		`${prefix}.init = function() {};`,
		`${prefix}.shutdown = function() {};`,
	];
	const blocks: string[] = [];
	const endpoints = new Map<string, string>();
	for (const [i, c] of controls.entries()) {
		if (!c.mapping) continue;
		const address = `${c.message}:${c.channel}:${c.number}`;
		const serialized = JSON.stringify(c.mapping);
		if (endpoints.has(address)) {
			if (endpoints.get(address) !== serialized)
				throw new Error(
					`${device}: MIDI ${address} has conflicting mappings. Assign distinct notes or matching actions before export.`,
				);
			continue;
		}
		endpoints.set(address, serialized);
		const m = c.mapping;
		const [group, key] = target(m);
		const g = JSON.stringify(group),
			k = JSON.stringify(key);
		const status = (c.message === 'cc' ? 176 : 144) + c.channel - 1;
		const body =
			m.mode === 'continuous'
				? `engine.setParameter(${g}, ${k}, value / 127);`
				: m.mode === 'trigger'
					? `if (pressed) { engine.setValue(${g}, ${k}, 1); engine.setValue(${g}, ${k}, 0); }`
					: m.mode === 'momentary'
						? `engine.setValue(${g}, ${k}, pressed ? 1 : 0);`
						: m.mode === 'toggle'
							? `if (pressed) engine.setValue(${g}, ${k}, engine.getValue(${g}, ${k}) ? 0 : 1);`
							: `if (pressed) engine.setValue(${g}, ${k}, ${m.action === 'beatjump' ? 1 : m.value});`;
		script.push(
			`${prefix}.control${i} = function(channel, control, value, status, group) { var pressed = (status & 0xF0) !== 0x80 && value > 0; ${body} };`,
		);
		for (const s of c.message === 'note' ? [status, status - 16] : [status])
			blocks.push(
				`<control><group>${escape(group)}</group><key>${prefix}.control${i}</key><description>${escape(c.label)}</description><status>${hex(s)}</status><midino>${hex(c.number)}</midino><options><Script-Binding/></options></control>`,
			);
	}
	// Keep unmatched XML controls, outputs, and external script references intact.
	const xmlName = Object.keys(p.originals[device]).find((n) => n.endsWith('.xml'));
	let doc: Document;
	if (xmlName)
		doc = new DOMParser().parseFromString(p.originals[device][xmlName], 'application/xml');
	else
		doc = new DOMParser().parseFromString(
			`<MixxxControllerPreset mixxxVersion="2.3.0+" schemaVersion="1"><info><name>${device} · Workbench</name></info><controller id="${device}"><scriptfiles/><controls/><outputs/></controller></MixxxControllerPreset>`,
			'application/xml',
		);
	const presetName = doc.querySelector('info > name');
	if (presetName) presetName.textContent = `${device} · Workbench`;
	const controller = doc.querySelector('controller');
	if (!controller) throw new Error('Preset has no controller element.');
	let list = controller.querySelector('controls');
	if (!list) {
		list = doc.createElement('controls');
		controller.appendChild(list);
	}
	list.querySelectorAll('control').forEach((el) => {
		const status = Number(el.querySelector('status')?.textContent),
			n = Number(el.querySelector('midino')?.textContent);
		if (
			controls.some(
				(c) =>
					(c.mapping || c.managed) &&
					c.number === n &&
					c.channel === (status & 15) + 1 &&
					((status & 240) === (c.message === 'cc' ? 176 : 144) ||
						(c.message === 'note' && (status & 240) === 128)),
			)
		)
			el.remove();
	});
	const parsed = new DOMParser().parseFromString(
		'<controls>' + blocks.join('\n') + '</controls>',
		'application/xml',
	);
	for (const el of Array.from(parsed.documentElement.children))
		list.appendChild(doc.importNode(el, true));
	let scripts = controller.querySelector('scriptfiles');
	if (!scripts) {
		scripts = doc.createElement('scriptfiles');
		controller.prepend(scripts);
	}
	const scriptNode = doc.createElement('file');
	scriptNode.setAttribute('filename', `${device}-workbench.js`);
	scriptNode.setAttribute('functionprefix', prefix);
	scripts.appendChild(scriptNode);
	return {
		xml: new XMLSerializer().serializeToString(doc),
		script: script.join('\n'),
	};
}
export async function exportZip(p: Project) {
	const zip = new JSZip();
	zip.file('midi-workbench.json', JSON.stringify(p, null, 2));
	if (p.firmware['keymap.c'])
		for (const [name, content] of Object.entries(patchFirmware(p)))
			zip.file(`firmware/midi_workbench/${name}`, content);
	for (const device of ['moonlander', 'midimix'] as const) {
		if (!p.controls[device].length && !Object.keys(p.originals[device]).length) continue;
		const { xml, script } = exportController(p, device);
		zip.file(`mixxx/${device}-workbench.midi.xml`, xml);
		zip.file(`mixxx/${device}-workbench.js`, script);
		for (const [name, content] of Object.entries(p.originals[device]))
			if (!name.endsWith('.xml')) zip.file(`mixxx/${name}`, content);
	}
	zip.file(
		'README.txt',
		`MIDI WORKBENCH\n\nFIRMWARE (included only when source was imported; not a flashable binary)\nCopy firmware/midi_workbench into your compatible ZSA QMK checkout under keyboards/zsa/moonlander/keymaps/.\nBuild with: qmk compile -kb zsa/moonlander/reva -km midi_workbench\nUse your hardware revision and the ZSA/QMK version compatible with your Oryx source. Flash the resulting binary with Keymapp or your usual flasher.\nLayer 14, MIDI_ENABLE, MIDI_ADVANCED, and startup octave/channel/transpose are managed. Other source is retained.\n\nMI_ON and MI_OFF control QMK's basic MIDI mode; advanced MI_* note keys send notes independently.\nRuntime octave/channel/transpose changes can move notes away from the exported mappings.\n\nMIXXX\nCopy all files in mixxx/ to your Mixxx user controllers directory. Restart Mixxx, select each Workbench preset under Preferences > Controllers and enable the device.\nLinux: ~/.mixxx/controllers\nmacOS: ~/Library/Application Support/Mixxx/controllers\nWindows: %LOCALAPPDATA%/Mixxx/controllers\nKnobs/faders send normalized 0..1 parameters. Fixed button values use native Mixxx control values.\n\nPROJECT\nImport this ZIP in MIDI Workbench to restore the editable project.\n`,
	);
	return zip.generateAsync({ type: 'blob' });
}
