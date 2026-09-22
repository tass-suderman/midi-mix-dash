import { Box, Button, Typography } from '@mui/material';
import { UploadFileRounded } from '@mui/icons-material';
import type { Device } from '../../types/controllers';
interface Props {
	device: Device;
	onImport: () => void;
}
const EmptyWorkspace = ({ device, onImport }: Props) => (
	<Box className="empty-workspace" sx={{ p: { xs: 4, md: 8 }, textAlign: 'center' }}>
		<UploadFileRounded sx={{ fontSize: 48, color: 'text.secondary' }} />
		<Typography variant="h5" component="h2" sx={{ justifyContent: 'center', my: 2 }}>
			No {device === 'moonlander' ? 'Moonlander' : 'MIDImix'} files loaded
		</Typography>
		<Typography sx={{ maxWidth: 560, mx: 'auto', mb: 3 }}>
			{device === 'moonlander'
				? 'Import an Oryx source ZIP to edit your keyboard, or Mixxx controller files to edit MIDI mappings.'
				: 'Import a Mixxx controller preset to start mapping your MIDImix.'}
		</Typography>
		<Button onClick={onImport} startIcon={<UploadFileRounded />}>
			Choose files
		</Button>
		<Typography variant="body2" sx={{ mt: 3, color: 'text.secondary' }}>
			Files stay in this tab. Nothing is uploaded or autosaved.
		</Typography>
	</Box>
);
export default EmptyWorkspace;
