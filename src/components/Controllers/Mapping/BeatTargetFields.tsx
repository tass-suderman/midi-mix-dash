import { TextField, MenuItem } from '@mui/material';
import NumberSelect from '../../Fields/NumberSelect';
import type { Mapping } from '../../../types/controllers';
interface Props {
	mapping: Mapping;
	onChange: (patch: Partial<Mapping>) => void;
}
const BeatTargetFields = ({ mapping, onChange }: Props) => (
	<div className="address-fields">
		<NumberSelect
			label="Beats"
			value={mapping.beats ?? 1}
			values={[0.125, 0.25, 0.5, 1, 2, 4, 8, 16, 32, 64]}
			onChange={(beats) => onChange({ beats })}
		/>
		{mapping.action === 'beatjump' && (
			<TextField
				select
				label="Direction"
				value={mapping.direction ?? 'forward'}
				onChange={(event) => onChange({ direction: event.target.value })}
			>
				<MenuItem value="forward">Forward</MenuItem>
				<MenuItem value="backward">Backward</MenuItem>
			</TextField>
		)}
	</div>
);
export default BeatTargetFields;
