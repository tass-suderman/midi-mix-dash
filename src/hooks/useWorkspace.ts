import { useState } from 'react';
import type { Control } from '../types/controllers';
import useProject from './useProject';
import useMoonlanderActions from './useMoonlanderActions';
import { hasDevice } from '../utils/emptyProject';
import { noteFromCode } from '../utils/midi';
const useWorkspace = () => {
	const [informationOpen, setInformationOpen] = useState(false);
	const {
		project,
		setProject,
		device,
		setDevice,
		selected,
		setSelected,
		error,
		setError,
		toast,
		setToast,
		busy,
		importOpen,
		setImportOpen,
		importDevice,
		setImportDevice,
		uploadFirmware,
		uploadLooseFirmware,
		uploadControllers,
		download,
	} = useProject();
	const layerActions = useMoonlanderActions(project, setProject, setToast);
	const loaded = hasDevice(project, device);
	const canDownload = hasDevice(project, 'moonlander') || hasDevice(project, 'midimix');
	const openImport = () => {
		setImportDevice(device);
		setImportOpen(true);
	};
	const changeSettings = (octave: number, channel: number) => {
		if (
			!Number.isInteger(octave) ||
			octave < 0 ||
			octave > 4 ||
			!Number.isInteger(channel) ||
			channel < 1 ||
			channel > 16
		)
			return;
		setProject({
			...project,
			octave,
			channel,
			controls: {
				...project.controls,
				moonlander: project.controls.moonlander.map((c) => ({
					...c,
					channel,
					number: noteFromCode(c.code!, octave) ?? 0,
				})),
			},
		});
	};
	const saveControl = (control: Control) => {
		setProject({
			...project,
			controls: {
				...project.controls,
				[device]: project.controls[device].map((old) => (old.id === control.id ? control : old)),
			},
		});
		setSelected(undefined);
		setToast('Mapping kept in this tab. Download your ZIP to save it.');
	};

	return {
		informationOpen,
		setInformationOpen,
		project,
		device,
		setDevice,
		selected,
		setSelected,
		error,
		setError,
		toast,
		setToast,
		busy,
		importOpen,
		setImportOpen,
		importDevice,
		setImportDevice,
		uploadFirmware,
		uploadLooseFirmware,
		uploadControllers,
		download,
		layerActions,
		loaded,
		canDownload,
		openImport,
		changeSettings,
		saveControl,
	};
};
export default useWorkspace;
