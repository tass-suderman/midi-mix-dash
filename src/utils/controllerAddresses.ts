import type { Control } from '../types/controllers';
import { noteFromCode, noteLabel } from './midi';

// Controller files know MIDI addresses, not physical Moonlander key positions.
// Keep them as address cards until source firmware supplies the actual layout.
export const controllerAddresses = (files: Record<string, string>): Control[] => {
	const controls = new Map<string, Control>();
	const add = (number: number, channel: number, message: 'note' | 'cc') => {
		if (
			!Number.isInteger(number) ||
			number < 0 ||
			number > 127 ||
			!Number.isInteger(channel) ||
			channel < 1 ||
			channel > 16
		)
			throw new Error('Controller file contains an invalid MIDI address.');
		const id = `midi-${message}-${channel}-${number}`;
		controls.set(id, {
			id,
			number,
			channel,
			message,
			label: `${message === 'note' ? noteLabel(number) + ' · note' : 'CC'} ${number} · channel ${channel}`,
			kind: message === 'note' ? 'button' : 'knob',
			x: 0,
			y: 0,
		});
	};
	for (const [name, content] of Object.entries(files)) {
		if (name.endsWith('.xml')) {
			const doc = new DOMParser().parseFromString(content, 'application/xml');
			if (doc.querySelector('parsererror') || !doc.querySelector('MixxxControllerPreset'))
				throw new Error('Invalid Mixxx controller XML.');
			for (const el of doc.querySelectorAll('controls > control')) {
				const status = Number(el.querySelector('status')?.textContent);
				if (![0x80, 0x90, 0xb0].includes(status & 0xf0)) continue;
				add(
					Number(el.querySelector('midino')?.textContent),
					(status & 15) + 1,
					(status & 0xf0) === 0xb0 ? 'cc' : 'note',
				);
			}
		} else if (name.endsWith('.js')) {
			const metadata = /^\/\/ MIDI_WORKBENCH_CONTROLS:(.+)$/m.exec(content);
			if (metadata) {
				const entries = JSON.parse(metadata[1]) as Control[];
				for (const entry of entries) {
					if (!['note', 'cc'].includes(entry.message))
						throw new Error('Invalid MIDI message type.');
					add(entry.number, entry.channel, entry.message);
				}
			} else {
				for (const match of content.matchAll(/onKey\(note\("([A-G](?:s|b)?)",\s*(\d+)\)/g)) {
					const number = noteFromCode(`MI_${match[1]}${Number(match[2]) || ''}`);
					if (number !== undefined) add(number, 1, 'note');
				}
			}
		}
	}
	return [...controls.values()];
};
