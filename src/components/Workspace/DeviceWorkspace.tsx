import type { Control, Device, Project } from '../../types/controllers';
import DeviceHeading from './DeviceHeading';
import MoonlanderTools from './MoonlanderTools';
import ControllerGraphic from '../Controllers/ControllerGraphic';
import ControllerAddresses from '../Controllers/ControllerAddresses';
interface Props {
	project: Project;
	device: Device;
	onSelect: (control: Control) => void;
	layerActions: { fill: () => void; clear: () => void; undo: () => void; canUndo: boolean };
}
const DeviceWorkspace = ({ project, device, onSelect: setSelected, layerActions }: Props) => {
	const controls = project.controls[device];
	const mapped = controls.filter((control) => control.mapping).length;
	return (
		<>
			<DeviceHeading device={device} count={controls.length} mapped={mapped} />
			{device === 'moonlander' && project.firmware['keymap.c'] && (
				<MoonlanderTools
					project={project}
					onFill={layerActions.fill}
					onClear={layerActions.clear}
					onUndo={layerActions.undo}
					canUndo={layerActions.canUndo}
				/>
			)}
			{device === 'moonlander' && !project.firmware['keymap.c'] ? (
				<ControllerAddresses controls={controls} onSelect={setSelected} />
			) : (
				<ControllerGraphic
					controls={controls}
					device={device}
					octave={project.octave}
					onSelect={setSelected}
				/>
			)}
		</>
	);
};
export default DeviceWorkspace;
