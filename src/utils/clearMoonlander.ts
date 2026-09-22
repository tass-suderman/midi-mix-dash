import type { Project } from '../types/controllers';
export const clearMoonlander = (project: Project): Project => {
	if (!project.firmware['keymap.c'] || project.controls.moonlander.length !== 72)
		throw new Error('Import Moonlander source before clearing layer 14.');
	return {
		...project,
		controls: {
			...project.controls,
			moonlander: project.controls.moonlander.map((control) => ({
				...control,
				code: 'KC_NO',
				number: 0,
				mapping: undefined,
				managed: true,
			})),
		},
		originals: { ...project.originals, moonlander: {} },
	};
};
