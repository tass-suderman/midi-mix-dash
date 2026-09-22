import { MenuItem, TextField } from '@mui/material';
interface Props {
	label: string;
	value: number;
	values: readonly number[];
	prefix?: string;
	onChange: (value: number) => void;
}
const NumberSelect = ({ label, value, values, prefix, onChange }: Props) => (
	<TextField
		select
		label={label}
		value={value}
		onChange={(event) => onChange(Number(event.target.value))}
	>
		{values.map((number) => (
			<MenuItem key={number} value={number}>
				{prefix ? `${prefix} ${number}` : number}
			</MenuItem>
		))}
	</TextField>
);
export default NumberSelect;
