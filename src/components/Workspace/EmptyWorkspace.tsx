import { Box, Button, Typography } from '@mui/material';
import { UploadFileRounded } from '@mui/icons-material';
import type { Device } from '../../types/controllers';
import ControllerGraphic from '../Controllers/ControllerGraphic';
import { emptyGraphic } from '../../utils/emptyGraphic';
interface Props {
	device: Device;
	onImport: () => void;
}
const EmptyWorkspace = ({ device, onImport }: Props) => (
	<>
		<Box className="empty-workspace" sx={{ px: 4, pt: 3, pb: 2 }}>
			<Typography variant="h5" component="h2">
				No {device === 'moonlander' ? 'Moonlander' : 'MIDImix'} files loaded
			</Typography>
			<Typography variant="body2" sx={{ my: 1, color: 'text.secondary' }}>
				This is an empty layout. Select a control or import files to load your{' '}
				{device === 'moonlander' ? 'firmware or controller mappings' : 'controller mappings'}. Files
				stay in this tab.
			</Typography>
			<Button onClick={onImport} startIcon={<UploadFileRounded />}>
				Choose files
			</Button>
		</Box>
		<ControllerGraphic
			controls={emptyGraphic(device)}
			device={device}
			octave={1}
			onSelect={onImport}
		/>
	</>
);
export default EmptyWorkspace;
