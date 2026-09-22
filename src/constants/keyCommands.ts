import type { Mapping } from '../types/controllers';
export const specials: Record<string, string> = {
	'TD(DANCE_0)': 'Tap dance · Nexus',
	MI_ON: 'MIDI on',
	MI_OFF: 'MIDI off',
	MI_CH1: 'MIDI channel 1',
	MI_ALLOFF: 'All notes off',
	MI_OCTU: 'Octave up',
	MI_OCTD: 'Octave down',
	KC_TRANSPARENT: 'Transparent',
	KC_NO: 'Disabled',
};
export const defaultMapping = (): Mapping => ({
	action: 'play',
	deck: 1,
	value: 1,
	mode: 'toggle',
	beats: 1,
	direction: 'forward',
});
