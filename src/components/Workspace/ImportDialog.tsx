import { useRef } from 'react';
import {
	Alert,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
	MenuItem,
} from '@mui/material';
import { UploadFileRounded } from '@mui/icons-material';
import type { Device } from '../../types/controllers';
interface Props {
	importOpen: boolean;
	setImportOpen: (open: boolean) => void;
	importDevice: Device;
	setImportDevice: (device: Device) => void;
	busy: boolean;
	error: string;
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
	uploadControllers,
}: Props) => {
	const firmwareInput = useRef<HTMLInputElement>(null);
	const controllerInput = useRef<HTMLInputElement>(null);
	return (
		<>
			<Dialog open={importOpen} onClose={() => setImportOpen(false)} fullWidth maxWidth="sm">
				<DialogTitle>Bring your setup in</DialogTitle>
				<DialogContent>
					<div className="editor-fields">
						<p>
							Load an Oryx source ZIP, a Workbench project ZIP, or a Mixxx controller preset. Files
							are read locally, never uploaded. Importing replaces the corresponding device
							configuration.
						</p>
						<Button
							variant="outlined"
							startIcon={<UploadFileRounded />}
							disabled={busy}
							onClick={() => firmwareInput.current?.click()}
						>
							Firmware / project ZIP
						</Button>
						<div className="section-label">MIXXX CONTROLLER FILES</div>
						<TextField
							select
							label="Import mappings for"
							value={importDevice}
							onChange={(e) => setImportDevice(e.target.value as Device)}
						>
							<MenuItem value="moonlander">Moonlander</MenuItem>
							<MenuItem value="midimix">Akai MIDImix</MenuItem>
						</TextField>
						<Button
							variant="outlined"
							disabled={busy}
							onClick={() => controllerInput.current?.click()}
						>
							Choose XML + JavaScript files
						</Button>
						<p className="muted">
							Select the preset and its referenced scripts together. Your original Moonlander script
							is supported. Other custom scripts are preserved, but their behavior cannot be edited
							visually; import a Workbench ZIP for full editing.
						</p>
						{error && <Alert severity="error">{error}</Alert>}
					</div>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setImportOpen(false)}>Close</Button>
				</DialogActions>
			</Dialog>
			<input
				ref={firmwareInput}
				type="file"
				accept=".zip"
				hidden
				onChange={(e) => {
					if (e.target.files?.[0]) void uploadFirmware(e.target.files[0]);
					e.target.value = '';
				}}
			/>
			<input
				ref={controllerInput}
				type="file"
				accept=".xml,.js"
				multiple
				hidden
				onChange={(e) => {
					if (e.target.files?.length) void uploadControllers(Array.from(e.target.files));
					e.target.value = '';
				}}
			/>
		</>
	);
};
export default ImportDialog;
