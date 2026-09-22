import { useState } from 'react';
import { TextField, MenuItem, Alert } from '@mui/material';
import { specials } from '../../../constants/keyCommands';
import type { Control } from '../../../types/controllers';
interface Props {
	control: Control;
	onChange: (patch: Partial<Control>) => void;
}
const SpecialCommandFields = ({ control: draft, onChange: update }: Props) => {
	const [customCode, setCustomCode] = useState(false);
	return (
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
				Tap dance keeps the behavior defined in your source. MI_ON / MI_OFF affect basic MIDI mode;
				advanced note keys operate independently.
			</Alert>
		</>
	);
};
export default SpecialCommandFields;
