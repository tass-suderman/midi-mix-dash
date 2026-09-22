import { Chip } from '@mui/material';
import type { Device } from '../../types/controllers';
interface Props {
	device: Device;
	count: number;
	mapped: number;
}
const DeviceHeading = ({ device, count, mapped }: Props) => (
	<div className="workspace-heading">
		<div>
			<div className="eyebrow">
				{device === 'moonlander' ? 'ZSA · SPLIT KEYBOARD' : 'AKAI · MIXING CONTROLLER'}
			</div>
			<h2>
				{device === 'moonlander' ? 'Moonlander' : 'MIDImix'}
				<Chip size="small" label={device === 'moonlander' ? 'Layer 14' : 'Channel strips'} />
			</h2>
			<p>Click a {device === 'moonlander' ? 'key' : 'control'} to shape what it does.</p>
		</div>
		<div className="stats">
			<div>
				<strong>{count}</strong>
				<span>CONTROLS</span>
			</div>
			<div>
				<strong className="pink">{mapped}</strong>
				<span>MIXXX MAPPED</span>
			</div>
		</div>
	</div>
);
export default DeviceHeading;
