export type Device = 'moonlander' | 'midimix';
export type Mapping = {
	action: string;
	deck: number;
	value: number;
	mode: 'toggle' | 'momentary' | 'set' | 'continuous' | 'trigger';
	group?: string;
	key?: string;
	beats?: number;
	direction?: string;
	hotcue?: number;
	sampler?: number;
	unit?: number;
	effect?: number;
	parameter?: number;
};
export type Control = {
	id: string;
	label: string;
	kind: 'key' | 'knob' | 'fader' | 'button';
	code?: string;
	number: number;
	channel: number;
	message: 'note' | 'cc';
	mapping?: Mapping;
	managed?: boolean;
	x: number;
	y: number;
};
export type Project = {
	version: 1;
	firmware: Record<string, string>;
	controls: Record<Device, Control[]>;
	originals: Record<Device, Record<string, string>>;
	octave: number;
	channel: number;
	name: string;
};
