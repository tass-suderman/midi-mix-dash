import { TextField, MenuItem } from '@mui/material';
import type { Control } from '../../../types/controllers';
interface Props {
	control: Control;
	onChange: (patch: Partial<Control>) => void;
}
const MidiAddressFields = ({ control: draft, onChange: update }: Props) => (
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
			Match the address configured on your hardware. This does not reprogram your hardware.
		</p>
	</details>
);
export default MidiAddressFields;
