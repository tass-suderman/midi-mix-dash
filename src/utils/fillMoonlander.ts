import type { Project } from '../types/controllers';
import { noteFromCode, pitches } from './midi';

const blankCodes = new Set(['KC_NO', 'KC_TRANSPARENT', 'KC_TRNS', '_______', 'XXXXXXX']);
export const canFillMoonlander = (project: Project) =>
	Boolean(project.firmware['keymap.c']) &&
	project.controls.moonlander.length === 72 &&
	project.controls.moonlander.every(
		(control) => blankCodes.has(control.code ?? '') && !control.mapping,
	);

export const fillMoonlander = (project: Project): Project => {
	if (!canFillMoonlander(project))
		throw new Error('Import firmware with an entirely blank layer 14 before filling MIDI notes.');
	return {
		...project,
		controls: {
			...project.controls,
			moonlander: project.controls.moonlander.map((control, index) => {
				// QMK order is left-to-right across both halves, then the next row.
				// Enlarged thumb keys retain their original row-5 macro positions.
				const code = `MI_${pitches[index % 12]}${Math.floor(index / 12) || ''}`;
				return {
					...control,
					code,
					number: noteFromCode(code, project.octave)!,
					channel: project.channel,
					message: 'note' as const,
				};
			}),
		},
	};
};
