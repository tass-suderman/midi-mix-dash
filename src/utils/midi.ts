import { actions, actionScope } from '../constants/mixxxActions';
export { actions } from '../constants/mixxxActions';
import type { Mapping, Control } from '../types/controllers';
export type { Mapping, Control, Device, Project } from '../types/controllers';
export const pitches = ['C', 'Cs', 'D', 'Ds', 'E', 'F', 'Fs', 'G', 'Gs', 'A', 'As', 'B'];
const aliases: Record<string, number> = {
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
export function noteFromCode(code: string, octave = 1) {
	const m = /^MI_([A-G](?:s|b)?)([0-5]?)$/.exec(code);
	return m ? 12 * (octave + Number(m[2])) + aliases[m[1]] : undefined;
}
export function noteLabel(n: number) {
	return `${pitches[n % 12].replace('s', '♯')}${Math.floor(n / 12) - 1}`;
}
export const hex = (n: number) => '0x' + n.toString(16).toUpperCase().padStart(2, '0');
// Match balanced macro arguments; nested TD(), LT(), and MT() are single keys.
export function layer14(source: string) {
	const match = /\[14\]\s*=\s*LAYOUT_moonlander\s*\(/.exec(source);
	if (!match) throw new Error('This source has no layer 14 LAYOUT_moonlander.');
	const start = match.index + match[0].length;
	let depth = 1,
		end = start;
	for (; end < source.length; end++) {
		if (source[end] === '(') depth++;
		if (source[end] === ')' && --depth === 0) break;
	}
	if (depth !== 0) throw new Error('Layer 14 has unbalanced parentheses.');
	const body = source.slice(start, end).replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '');
	const codes: string[] = [];
	let token = '',
		nesting = 0;
	for (const ch of body) {
		if (ch === '(') nesting++;
		if (ch === ')') nesting--;
		if (ch === ',' && nesting === 0) {
			codes.push(token.trim());
			token = '';
		} else token += ch;
	}
	if (token.trim()) codes.push(token.trim());
	if (codes.length !== 72)
		throw new Error(`Expected 72 Moonlander keys on layer 14, found ${codes.length}.`);
	return { start, end, codes };
}
export function moonControls(source: string, octave = 1, channel = 1): Control[] {
	const { codes } = layer14(source);
	let index = 0;
	const result: Control[] = [];
	[7, 7, 7, 6, 6, 3].forEach((count, row) => {
		for (let side = 0; side < 2; side++)
			for (let col = 0; col < count; col++) {
				const id = index++;
				const offset = row === 5 ? (side === 0 ? 3 : 0) : 0;
				result.push({
					id: `moon-${id}`,
					label: `${side ? 'Right' : 'Left'} ${row === 5 ? 'thumb' : 'row ' + (row + 1)} · ${col + 1}`,
					kind: 'key',
					code: codes[id],
					number: noteFromCode(codes[id], octave) ?? 0,
					channel,
					message: 'note',
					x: side * 9 + col + offset,
					y: row + (row < 5 ? [0.25, 0.12, 0, 0.12, 0.28, 0.4, 0.6][col] : 0.3),
				});
			}
	});
	return result;
}
export function midimixControls(): Control[] {
	const result: Control[] = [];
	const add = (
		id: string,
		label: string,
		kind: Control['kind'],
		number: number,
		x: number,
		y: number,
	) =>
		result.push({
			id,
			label,
			kind,
			number,
			x,
			y,
			channel: 1,
			message: kind === 'button' ? 'note' : 'cc',
		});
	[16, 20, 24, 28, 46, 50, 54, 58].forEach((base, col) => {
		for (let r = 0; r < 3; r++)
			add(`knob-${col}-${r}`, `Strip ${col + 1} · knob ${r + 1}`, 'knob', base + r, col, r);
		add(`mute-${col}`, `Strip ${col + 1} · mute`, 'button', 1 + col * 3, col, 3);
		add(`rec-${col}`, `Strip ${col + 1} · record arm`, 'button', 3 + col * 3, col, 4);
		add(`fader-${col}`, `Strip ${col + 1} · fader`, 'fader', base + 3, col, 5);
	});
	add('master', 'Master fader', 'fader', 62, 8.5, 5);
	add('bank-left', 'Bank left', 'button', 25, 8.5, 1);
	add('bank-right', 'Bank right', 'button', 26, 8.5, 2);
	add('solo', 'Solo', 'button', 27, 8.5, 3);
	return result;
}
export function target(m: Mapping) {
	if (m.action === 'custom') return [m.group ?? '[Channel1]', m.key ?? 'play'];
	const scope = actionScope(m.action);
	if (scope === 'master') return ['[Master]', m.action === 'master_gain' ? 'gain' : m.action];
	if (scope === 'library') return ['[Library]', m.action.slice(8)];
	if (scope === 'autodj') return ['[AutoDJ]', m.action.slice(7)];
	if (scope === 'sampler')
		return [`[Sampler${m.sampler ?? 1}]`, m.action === 'sampler_stop' ? 'stop' : m.action.slice(8)];
	if (scope === 'effect') {
		const group = `[EffectRack1_EffectUnit${m.unit ?? 1}${['fx_slot_enabled', 'fx_meta', 'fx_parameter'].includes(m.action) ? `_Effect${m.effect ?? 1}` : ''}]`;
		const key =
			m.action === 'fx_assign'
				? `group_[Channel${m.deck}]_enable`
				: m.action === 'fx_slot_enabled'
					? 'enabled'
					: m.action === 'fx_parameter'
						? `parameter${m.parameter ?? 1}`
						: m.action.slice(3);
		return [group, key];
	}
	if (m.action.startsWith('hotcue_'))
		return [`[Channel${m.deck}]`, `hotcue_${m.hotcue ?? 1}_${m.action.slice(7)}`];
	if (m.action === 'beatloop') return [`[Channel${m.deck}]`, `beatloop_${m.beats ?? 1}_toggle`];
	if (m.action === 'beatlooproll')
		return [`[Channel${m.deck}]`, `beatlooproll_${m.beats ?? 1}_activate`];
	if (m.action.startsWith('eq_kill_'))
		return [
			`[EqualizerRack1_[Channel${m.deck}]_Effect1]`,
			`button${{ eq_kill_high: 3, eq_kill_mid: 2, eq_kill_low: 1 }[m.action]}`,
		];
	if (m.action.startsWith('eq_'))
		return [
			`[EqualizerRack1_[Channel${m.deck}]_Effect1]`,
			{ eq_high: 'parameter3', eq_mid: 'parameter2', eq_low: 'parameter1' }[m.action]!,
		];
	if (m.action === 'filter') return [`[QuickEffectRack1_[Channel${m.deck}]]`, 'super1'];
	return [
		`[Channel${m.deck}]`,
		m.action === 'beatjump' ? `beatjump_${m.beats ?? 1}_${m.direction ?? 'forward'}` : m.action,
	];
}
export function mappingFromTarget(group: string, key: string, continuous = false): Mapping {
	const base: Mapping = {
		action: 'custom',
		deck: Number(/Channel(\d+)/.exec(group + key)?.[1] ?? 1),
		value: 1,
		mode: continuous ? 'continuous' : 'set',
		group,
		key,
		hotcue: Number(/^hotcue_(\d+)_/.exec(key)?.[1] ?? 1),
		sampler: Number(/Sampler(\d+)/.exec(group)?.[1] ?? 1),
		unit: Number(/EffectUnit(\d+)/.exec(group)?.[1] ?? 1),
		effect: Number(/_Effect(\d+)\]/.exec(group)?.[1] ?? 1),
		parameter: Number(/^parameter(\d+)/.exec(key)?.[1] ?? 1),
		beats: Number(/^(?:beatloop|beatlooproll|beatjump)_([\d.]+)_/.exec(key)?.[1] ?? 1),
		direction: key.endsWith('_backward') ? 'backward' : 'forward',
	};
	for (const [action, , mode] of actions) {
		if (action === 'custom') continue;
		const candidate = {
			...base,
			action,
			mode: continuous ? ('continuous' as const) : mode,
		};
		const [g, k] = target(candidate);
		if (g === group && k === key) return candidate;
	}
	return base;
}
