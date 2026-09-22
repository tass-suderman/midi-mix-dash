import type { Project } from '../types/controllers';

export const emptyProject = (): Project => ({
	version: 1,
	name: 'Empty workspace',
	firmware: {},
	controls: { moonlander: [], midimix: [] },
	originals: { moonlander: {}, midimix: {} },
	octave: 1,
	channel: 1,
});

export const hasDevice = (project: Project, device: 'moonlander' | 'midimix') =>
	project.controls[device].length > 0 || Object.keys(project.originals[device]).length > 0;
