import { useState } from 'react';
import { Alert, Dialog, DialogContent } from '@mui/material';
import type { Control, Device } from '../../types/controllers';
import {
	editorTitle,
	canMapControl,
	isValidControl,
	savedControl,
} from '../../utils/controlEditor';
import ControlEditorDialogTitle from './ControlEditorDialog/ControlEditorDialogTitle';
import ControlEditorDialogActions from './ControlEditorDialog/ControlEditorDialogActions';
import KeyBehaviorFields from './ControlEditorDialog/KeyBehaviorFields';
import MidiAddressFields from './ControlEditorDialog/MidiAddressFields';
import MixxxMappingFields from './MixxxMappingFields';
interface Props {
	control: Control;
	device: Device;
	octave: number;
	onClose: () => void;
	onSave: (control: Control) => void;
}
const ControlEditor = ({ control, device, octave, onClose, onSave }: Props) => {
	const [draft, setDraft] = useState<Control>(() => structuredClone(control));
	const update = (patch: Partial<Control>) => setDraft({ ...draft, ...patch });
	const analog = draft.kind === 'knob' || draft.kind === 'fader';
	const canMap = canMapControl(draft, device, octave);
	const valid = isValidControl(draft);
	return (
		<Dialog open onClose={onClose} fullWidth maxWidth="sm">
			<ControlEditorDialogTitle
				title={editorTitle(draft, device)}
				controlLabel={control.label}
				onClose={onClose}
			/>
			<DialogContent dividers>
				<div className="editor-fields">
					{device === 'moonlander' && draft.code !== undefined && (
						<KeyBehaviorFields control={draft} octave={octave} onChange={update} />
					)}
					{draft.code === undefined && <MidiAddressFields control={draft} onChange={update} />}
					{canMap && (
						<MixxxMappingFields
							mapping={draft.mapping}
							analog={analog}
							onChange={(mapping) => update({ mapping })}
						/>
					)}
					{!valid && (
						<Alert severity="error">
							Enter a valid MIDI address, keycode, and compatible mapping value.
						</Alert>
					)}
				</div>
			</DialogContent>
			<ControlEditorDialogActions
				valid={valid}
				onClose={onClose}
				onSave={() => onSave(savedControl(draft, device, octave))}
			/>
		</Dialog>
	);
};
export default ControlEditor;
