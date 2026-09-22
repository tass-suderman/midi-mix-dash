import { isDeckTwoMapping } from '../../utils/mappingColor';
import { Alert, Box, Button, Typography } from '@mui/material';
import type { Control } from '../../types/controllers';
import { mappingLabel } from '../../utils/controlLabels';
interface Props {
	controls: Control[];
	onSelect: (control: Control) => void;
}
const ControllerAddresses = ({ controls, onSelect }: Props) => (
	<Box sx={{ p: 3 }}>
		<Alert severity="info">
			Controller mappings are loaded. Import source firmware to place these MIDI addresses on the
			Moonlander keyboard and edit its keys.
		</Alert>
		{controls.length === 0 && (
			<Typography sx={{ mt: 2 }}>
				This preset has no directly editable MIDI addresses. Its XML and scripts are retained for
				export.
			</Typography>
		)}
		<Box
			sx={{
				display: 'grid',
				gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))',
				gap: 2,
				mt: 3,
			}}
		>
			{controls.map((control) => (
				<Button
					className="address-card"
					key={control.id}
					onClick={() => onSelect(control)}
					sx={{
						display: 'block',
						textAlign: 'left',
						py: 2,
						boxShadow: control.mapping
							? isDeckTwoMapping(control.mapping)
								? '0 0 14px #e0af6845'
								: '0 0 14px #f27e8938'
							: 'none',
					}}
				>
					<Typography>{control.label}</Typography>
					<Typography variant="body2">{mappingLabel(control)}</Typography>
				</Button>
			))}
		</Box>
	</Box>
);
export default ControllerAddresses;
