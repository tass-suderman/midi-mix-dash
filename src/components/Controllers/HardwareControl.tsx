import { isDeckTwoMapping } from '../../utils/mappingColor';
import HardwareControlCaption from './HardwareControlCaption';
import { Tooltip } from '@mui/material';
import type { Control, Device } from '../../types/controllers';
import { noteFromCode } from '../../utils/midi';
import { controlLabel, mappingLabel } from '../../utils/controlLabels';
import { moonKeyGeometry } from '../../utils/moonLayout';
interface Props {
	control: Control;
	index: number;
	device: Device;
	octave: number;
	onSelect: (control: Control) => void;
}
const HardwareControl = ({ control: c, index, device, octave, onSelect }: Props) => {
	const geometry = device === 'moonlander' ? moonKeyGeometry(index) : undefined;
	const hasMidi = device === 'moonlander' && noteFromCode(c.code!, octave) !== undefined;
	const state = hasMidi
		? c.mapping
			? 'both'
			: 'midi'
		: c.mapping
			? 'mixxx'
			: device === 'moonlander' &&
				  !['KC_NO', 'KC_TRANSPARENT', 'KC_TRNS', '_______', 'XXXXXXX'].includes(c.code ?? '')
				? 'special'
				: 'empty';
	return (
		<Tooltip
			title={
				<>
					{c.label}
					<br />
					{c.code ?? `${c.message.toUpperCase()} ${c.number}`}
					<br />
					{mappingLabel(c)}
				</>
			}
			arrow
		>
			<button
				aria-label={`${c.label}: ${controlLabel(c)}; ${mappingLabel(c)}`}
				className={`control ${c.kind} ${state} ${isDeckTwoMapping(c.mapping) ? 'deck-two' : ''} ${geometry?.large ? 'large-thumb' : ''} ${geometry?.thumb ? 'thumb-key' : ''}`}
				data-control-id={c.id}
				style={
					geometry
						? {
								left: geometry.left,
								top: geometry.top,
								width: geometry.width,
								height: geometry.height,
								rotate: `${geometry.rotate}deg`,
							}
						: { left: 36 + c.x * 91, top: 87 + c.y * 76 }
				}
				onClick={() => onSelect(c)}
			>
				<span className="physical" />
				<HardwareControlCaption control={c} hasMidi={hasMidi} />
			</button>
		</Tooltip>
	);
};
export default HardwareControl;
