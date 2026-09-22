import { TextField } from '@mui/material';
import type { Mapping } from '../../../types/controllers';
interface Props {
	mapping: Mapping;
	onChange: (patch: Partial<Mapping>) => void;
}
const CustomTargetFields = ({ mapping, onChange }: Props) => (
	<>
		<TextField
			label="Mixxx group"
			value={mapping.group ?? ''}
			placeholder="[Channel1]"
			onChange={(event) => onChange({ group: event.target.value })}
		/>
		<TextField
			label="Mixxx control"
			value={mapping.key ?? ''}
			placeholder="volume"
			onChange={(event) => onChange({ key: event.target.value })}
		/>
	</>
);
export default CustomTargetFields;
