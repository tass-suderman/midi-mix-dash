import HardwareShell from './HardwareShell';
import HardwareLegend from './HardwareLegend';
import type { Control, Device } from '../../types/controllers';
import { noteFromCode } from '../../utils/midi';
import HardwareControl from './HardwareControl';
interface Props {
	controls: Control[];
	device: Device;
	octave: number;
	onSelect: (control: Control) => void;
}
const ControllerGraphic = ({ controls, device, octave, onSelect }: Props) => {
	const notes = controls.filter(
		(control) => control.code && noteFromCode(control.code) !== undefined,
	).length;
	return (
		<>
			<div className="hardware-scroll">
				<div className={`hardware ${device}`}>
					<HardwareShell device={device} />
					{controls.map((control, index) => (
						<HardwareControl
							key={control.id}
							control={control}
							index={index}
							device={device}
							octave={octave}
							onSelect={onSelect}
						/>
					))}
				</div>
			</div>
			<HardwareLegend device={device} notes={notes} />
		</>
	);
};
export default ControllerGraphic;
