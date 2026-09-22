import type { Control, Device } from '../types/controllers';
import { noteFromCode } from './midi';
import { isAnalogAction } from './mappingOptions';
export const editorTitle = (control: Control, device: Device) =>
	device === 'moonlander'
		? control.code === undefined
			? 'MOONLANDER · MIDI MAPPINGS'
			: 'MOONLANDER · LAYER 14'
		: 'AKAI MIDIMIX';
export const canMapControl = (control: Control, device: Device, octave: number) =>
	device === 'midimix' ||
	control.code === undefined ||
	noteFromCode(control.code, octave) !== undefined;
export const isValidControl = (control: Control) => {
	const mapping = control.mapping;
	const analog = control.kind === 'knob' || control.kind === 'fader';
	return (
		Number.isInteger(control.number) &&
		control.number >= 0 &&
		control.number <= 127 &&
		Number.isInteger(control.channel) &&
		control.channel >= 1 &&
		control.channel <= 16 &&
		(!control.code ||
			/^(?:[A-Z][A-Za-z0-9_]*(?:\([A-Za-z0-9_, ()]+\))?|_______)$/.test(control.code)) &&
		(!mapping ||
			(Number.isFinite(mapping.value) &&
				(!analog || isAnalogAction(mapping.action)) &&
				(mapping.action !== 'custom' || Boolean(mapping.group?.trim() && mapping.key?.trim()))))
	);
};
export const savedControl = (control: Control, device: Device, octave: number): Control => ({
	...control,
	managed: true,
	mapping:
		canMapControl(control, device, octave) && control.mapping
			? {
					...control.mapping,
					mode:
						control.kind === 'knob' || control.kind === 'fader'
							? 'continuous'
							: control.mapping.mode,
				}
			: undefined,
});
