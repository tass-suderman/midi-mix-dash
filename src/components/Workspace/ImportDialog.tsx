import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import type { Device } from '../../types/controllers';
import FirmwareImportFields from './Import/FirmwareImportFields';
import ControllerImportFields from './Import/ControllerImportFields';
interface Props {
	importOpen: boolean;
	setImportOpen: (open: boolean) => void;
	importDevice: Device;
	setImportDevice: (device: Device) => void;
	busy: boolean;
	error: string;
	uploadLooseFirmware: (files: File[]) => Promise<void>;
	uploadFirmware: (file: File) => Promise<void>;
	uploadControllers: (files: File[]) => Promise<void>;
}
const ImportDialog = ({
	importOpen,
	setImportOpen,
	importDevice,
	setImportDevice,
	busy,
	error,
	uploadFirmware,
	uploadLooseFirmware,
	uploadControllers,
}: Props) => (
	<Dialog
		open={importOpen}
		onClose={() => {
			if (!busy) setImportOpen(false);
		}}
		fullWidth
		maxWidth="sm"
	>
		<DialogTitle>Bring your setup in</DialogTitle>
		<DialogContent>
			<div className="editor-fields">
				<p>
					Load an Oryx source ZIP, loose firmware files, a Workbench project ZIP, or a Mixxx
					controller preset. Files are read locally, never uploaded. Importing replaces the
					corresponding device configuration.
				</p>
				<FirmwareImportFields
					busy={busy}
					uploadFirmware={uploadFirmware}
					uploadLooseFirmware={uploadLooseFirmware}
				/>
				<ControllerImportFields
					busy={busy}
					device={importDevice}
					onDevice={setImportDevice}
					onFiles={uploadControllers}
				/>
				{error && <Alert severity="error">{error}</Alert>}
			</div>
		</DialogContent>
		<DialogActions>
			<Button disabled={busy} onClick={() => setImportOpen(false)}>
				Close
			</Button>
		</DialogActions>
	</Dialog>
);
export default ImportDialog;
