import { TextField, MenuItem, ListSubheader } from '@mui/material';
import { availableActionGroups, isAnalogAction } from '../../../utils/mappingOptions';
interface Props {
	action?: string;
	analog: boolean;
	onChange: (action: string) => void;
}
const ActionSelect = ({ action, analog, onChange }: Props) => (
	<TextField
		select
		label="Action"
		value={analog && action && !isAnalogAction(action) ? '' : (action ?? 'none')}
		onChange={(event) => onChange(event.target.value)}
	>
		<MenuItem value="none">No Mixxx mapping</MenuItem>
		{availableActionGroups(analog).flatMap((group) => [
			<ListSubheader key={group.label}>{group.label}</ListSubheader>,
			...group.items.map(([id, label]) => (
				<MenuItem key={id} value={id}>
					{label}
				</MenuItem>
			)),
		])}
	</TextField>
);
export default ActionSelect;
