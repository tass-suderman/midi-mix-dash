import { TextField, MenuItem } from '@mui/material';
import { noteFromCode, noteLabel, pitches } from '../../../utils/midi';
import type { Control } from '../../../types/controllers';
interface Props {
	control: Control;
	octave: number;
	onChange: (patch: Partial<Control>) => void;
}
const NoteSelect = ({ control: draft, octave, onChange: update }: Props) => (
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
				...Array.from({ length: 72 }, (_, n) => `MI_${pitches[n % 12]}${Math.floor(n / 12) || ''}`),
			]),
		).map((code) => (
			<MenuItem key={code} value={code}>
				{code} · {noteLabel(noteFromCode(code, octave)!)} · {noteFromCode(code, octave)}
			</MenuItem>
		))}
	</TextField>
);
export default NoteSelect;
