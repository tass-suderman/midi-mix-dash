import { TextField, MenuItem } from '@mui/material';
import { noteFromCode, noteLabel, hex } from '../../../utils/midi';
import type { Control } from '../../../types/controllers';
import NoteSelect from './NoteSelect';
import SpecialCommandFields from './SpecialCommandFields';
interface Props {
	control: Control;
	octave: number;
	onChange: (patch: Partial<Control>) => void;
}
const KeyBehaviorFields = ({ control: draft, octave, onChange: update }: Props) => {
	const midi = noteFromCode(draft.code ?? '', octave) !== undefined;
	return (
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
				<NoteSelect control={draft} octave={octave} onChange={update} />
			) : (
				<SpecialCommandFields control={draft} onChange={update} />
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
	);
};
export default KeyBehaviorFields;
