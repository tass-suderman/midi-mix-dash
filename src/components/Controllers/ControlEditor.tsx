import { useState } from 'react';
import {
	Alert,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	MenuItem,
	TextField,
} from '@mui/material';
import type { Control, Device } from '../../types/controllers';
import ControlEditorDialogTitle from './ControlEditorDialog/ControlEditorDialogTitle';
import { noteFromCode, noteLabel, pitches, hex } from '../../utils/midi';
import { specials } from '../../constants/keyCommands';
import MixxxMappingFields from './MixxxMappingFields';

interface Props {
	control: Control;
	device: Device;
	octave: number;
	onClose: () => void;
	onSave: (control: Control) => void;
}

const getTitleForDialogHeader = (control: Control, device: Device) => {
	if (device === 'moonlander') {
		if (control.code === undefined) {
			return 'MOONLANDER · MIDI MAPPINGS';
		}
		return 'MOONLANDER · LAYER 14';
	}
	return 'AKAI MIDIMIX';
}

const ControlEditor = ({ control, device, octave, onClose, onSave }: Props) => {
	const [draft, setDraft] = useState<Control>(structuredClone(control));
	const [customCode, setCustomCode] = useState(false);
	const midi = draft.code !== undefined && noteFromCode(draft.code, octave) !== undefined;
	const analog = draft.kind === 'knob' || draft.kind === 'fader';
	const mapping = draft.mapping;
	const update = (patch: Partial<Control>) => setDraft({ ...draft, ...patch });
	const canMap = device === 'midimix' || midi || draft.code === undefined;
	const valid =
		Number.isInteger(draft.number) &&
		draft.number >= 0 &&
		draft.number <= 127 &&
		Number.isInteger(draft.channel) &&
		draft.channel >= 1 &&
		draft.channel <= 16 &&
		(!draft.code || /^[A-Z][A-Za-z0-9_]*(?:\([A-Za-z0-9_, ()]+\))?$/.test(draft.code)) &&
		(!mapping ||
			(Number.isFinite(mapping.value) &&
				(mapping.action !== 'custom' || Boolean(mapping.group?.trim() && mapping.key?.trim()))));
	return (
		<Dialog open onClose={onClose} fullWidth maxWidth="sm">
			<ControlEditorDialogTitle 
				title={getTitleForDialogHeader(draft, device)} 
				controlLabel={control.label} 
				onClose={onClose} 
			/>
			<DialogContent dividers>
				<div className="editor-fields">
					{device === 'moonlander' && draft.code !== undefined && (
						<>
							<TextField
								select
								label="Key behavior"
								value={midi ? 'note' : 'special'}
								onChange={(e) => {
									const code = e.target.value === 'note' ? 'MI_C' : 'TD(DANCE_0)';
									update({
										code,
										number: noteFromCode(code, octave) ?? 0,
										mapping: undefined,
									});
								}}
							>
								<MenuItem value="note">MIDI note</MenuItem>
								<MenuItem value="special">Special / QMK command</MenuItem>
							</TextField>
							{midi ? (
								<TextField
									select
									label="QMK note"
									value={draft.code}
									onChange={(e) =>
										update({
											code: e.target.value,
											number: noteFromCode(e.target.value, octave)!,
										})
									}
								>
									{Array.from(
										new Set([
											draft.code!,
											...Array.from(
												{ length: 72 },
												(_, n) => `MI_${pitches[n % 12]}${Math.floor(n / 12) || ''}`,
											),
										]),
									).map((code) => (
										<MenuItem key={code} value={code}>
											{code} · {noteLabel(noteFromCode(code, octave)!)} ·{' '}
											{noteFromCode(code, octave)}
										</MenuItem>
									))}
								</TextField>
							) : (
								<>
									<TextField
										select
										label="Special command"
										value={customCode || !specials[draft.code ?? ''] ? 'custom' : draft.code}
										onChange={(e) => {
											setCustomCode(e.target.value === 'custom');
											if (e.target.value !== 'custom') update({ code: e.target.value });
										}}
									>
										{Object.entries(specials).map(([code, label]) => (
											<MenuItem key={code} value={code}>
												{label} · {code}
											</MenuItem>
										))}
										<MenuItem value="custom">Custom QMK keycode</MenuItem>
									</TextField>
									{(customCode || !specials[draft.code ?? '']) && (
										<TextField
											label="QMK keycode"
											value={draft.code}
											onChange={(e) => update({ code: e.target.value })}
											helperText="Existing macros and commands are preserved in your firmware."
										/>
									)}
									<Alert severity="info">
										Tap dance keeps the behavior defined in your source. MI_ON / MI_OFF affect basic
										MIDI mode; advanced note keys operate independently.
									</Alert>
								</>
							)}
							{midi && (
								<div className="message-preview">
									<span>{noteLabel(draft.number)}</span>
									<code>
										Note {draft.number} / {hex(draft.number)} · Channel {draft.channel}
									</code>
								</div>
							)}
						</>
					)}
					{draft.code === undefined && (
						<details>
							<summary>
								MIDI address · {draft.message === 'cc' ? 'CC' : 'Note'} {draft.number}, channel{' '}
								{draft.channel}
							</summary>
							<div className="address-fields">
								<TextField
									select
									label="Message"
									value={draft.message}
									onChange={(e) => update({ message: e.target.value as 'cc' | 'note' })}
								>
									<MenuItem value="cc">Control change</MenuItem>
									<MenuItem value="note">Note</MenuItem>
								</TextField>
								<TextField
									label="Number"
									type="number"
									value={draft.number}
									onChange={(e) => update({ number: Number(e.target.value) })}
								/>
								<TextField
									label="Channel"
									type="number"
									value={draft.channel}
									onChange={(e) => update({ channel: Number(e.target.value) })}
								/>
							</div>
							<p className="muted">
								Match the address configured on your hardware. This does not reprogram your
								hardware.
							</p>
						</details>
					)}
					{canMap && (
						<MixxxMappingFields
							mapping={mapping}
							analog={analog}
							onChange={(mapping) => update({ mapping })}
						/>
					)}
					{!valid && (
						<Alert severity="error">Enter a valid MIDI address, keycode, and mapping value.</Alert>
					)}
				</div>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} color="inherit">
					Cancel
				</Button>
				<Button
					variant="contained"
					disabled={!valid}
					onClick={() =>
						onSave({
							...draft,
							managed: true,
							mapping: canMap ? draft.mapping : undefined,
						})
					}
				>
					Save mapping
				</Button>
			</DialogActions>
		</Dialog>
	);
};
export default ControlEditor;
