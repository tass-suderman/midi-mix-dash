import { useState } from 'react';
import type { Project } from '../types/controllers';
import { clearMoonlander } from '../utils/clearMoonlander';
import { fillMoonlander } from '../utils/fillMoonlander';
const useMoonlanderActions = (
	project: Project,
	onChange: (project: Project) => void,
	onNotice: (message: string) => void,
) => {
	const [undo, setUndo] = useState<{ before: Project; after: Project }>();
	const apply = (transform: (project: Project) => Project, message: string) => {
		const next = transform(project);
		setUndo({ before: project, after: next });
		onChange(next);
		onNotice(message);
	};
	return {
		fill: () => apply(fillMoonlander, 'Filled 72 MIDI notes. Download a ZIP to keep your changes.'),
		clear: () =>
			apply(
				clearMoonlander,
				'Cleared layer 14 and Moonlander mappings. Other layers and MIDImix are unchanged.',
			),
		canUndo: undo?.after === project,
		undo: () => {
			if (undo?.after === project) {
				onChange(undo.before);
				setUndo(undefined);
				onNotice('Restored the previous Moonlander layer and mappings.');
			}
		},
	};
};
export default useMoonlanderActions;
