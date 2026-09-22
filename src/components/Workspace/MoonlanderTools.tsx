import { Box, Button, Typography } from '@mui/material';
import { PianoRounded, ClearAllRounded, UndoRounded } from '@mui/icons-material';
import type { Project } from '../../types/controllers';
import { canFillMoonlander } from '../../utils/fillMoonlander';
import { noteLabel } from '../../utils/midi';
interface Props {
	project: Project;
	onFill: () => void;
	onClear: () => void;
	onUndo: () => void;
	canUndo: boolean;
}
const MoonlanderTools = ({ project, onFill, onClear, onUndo, canUndo }: Props) => (
	<Box sx={{ px: 4, pb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
		<Button startIcon={<PianoRounded />} onClick={onFill} disabled={!canFillMoonlander(project)}>
			Fill empty layer with MIDI
		</Button>
		<Button startIcon={<ClearAllRounded />} onClick={onClear}>
			Clear current keys
		</Button>
		<Button startIcon={<UndoRounded />} onClick={onUndo} disabled={!canUndo}>
			Undo layer change
		</Button>
		<Typography variant="body2" color="text.secondary">
			{canFillMoonlander(project)
				? `Assign 72 ascending notes, ${noteLabel(project.octave * 12)}–${noteLabel(project.octave * 12 + 71)}, left to right by row.`
				: 'Available when all 72 keys are transparent or disabled. Existing assignments are never overwritten.'}
		</Typography>
		<Typography variant="caption" color="text.secondary">
			Clear disables all layer-14 keys and removes Moonlander mappings. Other layers and MIDImix
			stay as they are.
		</Typography>
	</Box>
);
export default MoonlanderTools;
