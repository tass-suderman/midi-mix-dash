import { TextField, MenuItem } from '@mui/material';
import type { Device } from '../../../types/controllers';
import FileImportButton from './FileImportButton';
interface Props {
	busy: boolean;
	device: Device;
	onDevice: (device: Device) => void;
	onFiles: (files: File[]) => Promise<void>;
}
const ControllerImportFields = ({ busy, device, onDevice, onFiles }: Props) => (
	<>
		<div className="section-label">MIXXX CONTROLLER FILES</div>
		<TextField
			select
			label="Import mappings for"
			value={device}
			disabled={busy}
			onChange={(event) => onDevice(event.target.value as Device)}
		>
			<MenuItem value="moonlander">Moonlander</MenuItem>
			<MenuItem value="midimix">Akai MIDImix</MenuItem>
		</TextField>
		<FileImportButton
			label="Choose XML + JavaScript files"
			accept=".xml,.js"
			multiple
			disabled={busy}
			onFiles={onFiles}
		/>
		<p className="muted">
			Select the preset and its referenced scripts together. Your original Moonlander script is
			supported. Other custom scripts are preserved, but their behavior cannot be edited visually;
			import a Workbench ZIP for full editing.
		</p>
	</>
);
export default ControllerImportFields;
