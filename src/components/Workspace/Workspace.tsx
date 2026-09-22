import useWorkspace from '../../hooks/useWorkspace';
import DeviceWorkspace from './DeviceWorkspace';
import WorkspaceFooter from './WorkspaceFooter';
import WorkspaceTabs from './WorkspaceTabs';
import WorkspaceHeader from './WorkspaceHeader';
import { Alert, Snackbar } from '@mui/material';
import CustomAppBar from '../AppBar';
import ControlEditor from '../Controllers/ControlEditor';
import FirmwareSettings from './FirmwareSettings';
import ImportDialog from './ImportDialog';
import InformationContent from '../Information/InformationContent';
import EmptyWorkspace from './EmptyWorkspace';
const Workspace = () => {
	const {
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
	} = useWorkspace();
	return (
		<div className="app">
			<CustomAppBar />
			<main>
				<WorkspaceHeader
					busy={busy}
					canDownload={canDownload}
					onImport={openImport}
					onDownload={download}
				/>
				{error && (
					<Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}
				<div className="workspace">
					<WorkspaceTabs
						value={informationOpen ? 'information' : device}
						onChange={(tab) => {
							setInformationOpen(tab === 'information');
							if (tab !== 'information') setDevice(tab);
						}}
					/>
					{informationOpen ? (
						<InformationContent />
					) : !loaded ? (
						<EmptyWorkspace device={device} onImport={openImport} />
					) : (
						<DeviceWorkspace
							project={project}
							device={device}
							onSelect={setSelected}
							layerActions={layerActions}
						/>
					)}
				</div>
				{!informationOpen &&
					loaded &&
					(device === 'midimix' || Boolean(project.firmware['keymap.c'])) && (
						<FirmwareSettings project={project} device={device} onChange={changeSettings} />
					)}
				<WorkspaceFooter name={project.name} />
			</main>
			{selected && (
				<ControlEditor
					control={selected}
					device={device}
					octave={project.octave}
					onClose={() => setSelected(undefined)}
					onSave={saveControl}
				/>
			)}
			<ImportDialog
				{...{
					importOpen,
					setImportOpen,
					importDevice,
					setImportDevice,
					busy,
					error,
					uploadFirmware,
					uploadLooseFirmware,
					uploadControllers,
				}}
			/>
			<Snackbar
				open={Boolean(toast)}
				autoHideDuration={5000}
				onClose={() => setToast('')}
				message={toast}
			/>
		</div>
	);
};
export default Workspace;
