import { Alert, TextField, MenuItem } from '@mui/material';
import type { Mapping } from '../../../types/controllers';
interface Props {
	mapping: Mapping;
	analog: boolean;
	onChange: (patch: Partial<Mapping>) => void;
}
const MappingBehaviorFields = ({ mapping, analog, onChange: map }: Props) => (
	<>
		{analog ? (
			<Alert severity="info">
				The physical value passes through to Mixxx as a normalized 0–1 parameter.
			</Alert>
		) : (
			<>
				<TextField
					select
					label="Button behavior"
					value={mapping.mode}
					onChange={(e) => map({ mode: e.target.value as Mapping['mode'] })}
				>
					<MenuItem value="trigger">Trigger once per press</MenuItem>
					<MenuItem value="toggle">Toggle on press</MenuItem>
					<MenuItem value="momentary">Hold (release resets to 0)</MenuItem>
					<MenuItem value="set">Set a value on press</MenuItem>
				</TextField>
				{mapping.mode === 'set' && mapping.action !== 'beatjump' && (
					<TextField
						label="Value to set"
						type="number"
						value={mapping.value}
						onChange={(e) =>
							map({
								value: e.target.value === '' ? NaN : Number(e.target.value),
							})
						}
						helperText={
							mapping.action === 'volume'
								? 'Volume: 0 = silent, 1 = unity gain.'
								: 'Native Mixxx control value; check the control’s range.'
						}
						inputProps={{ step: 0.05 }}
					/>
				)}
			</>
		)}
	</>
);
export default MappingBehaviorFields;
