import { useState } from 'react';
import { Alert, Button, Chip, CircularProgress, Snackbar, Tab, Tabs } from '@mui/material';
import {
	DownloadRounded,
	UploadFileRounded,
	Keyboard,
	TuneRounded,
	InfoOutlined,
} from '@mui/icons-material';
import { noteFromCode } from '../../utils/midi';
import useProject from '../../hooks/useProject';
import CustomAppBar from '../AppBar';
import ControlEditor from '../Controllers/ControlEditor';
import ControllerGraphic from '../Controllers/ControllerGraphic';
import FirmwareSettings from './FirmwareSettings';
import ImportDialog from './ImportDialog';
import InformationContent from '../Information/InformationContent';
import EmptyWorkspace from './EmptyWorkspace';
import ControllerAddresses from '../Controllers/ControllerAddresses';
import { hasDevice } from '../../utils/emptyProject';
const Workspace = () => {
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
		uploadControllers,
		download,
	} = useProject();
	const controls = project.controls[device],
		mapped = controls.filter((c) => c.mapping).length;
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
	return (
		<div className="app">
			<CustomAppBar />
			<main>
				<div className="intro">
					<div>
						<div className="eyebrow">YOUR HARDWARE. YOUR FLOW.</div>
						<h1>
							Make every control <em>yours.</em>
						</h1>
						<p>Build the connection between your instruments and your mix.</p>
					</div>
					<div className="toolbar">
						<Button
							startIcon={<UploadFileRounded />}
							variant="outlined"
							onClick={() => {
								setImportDevice(device);
								setImportOpen(true);
							}}
							disabled={busy}
						>
							Import files
						</Button>
						<Button
							startIcon={busy ? <CircularProgress size={18} /> : <DownloadRounded />}
							variant="contained"
							onClick={download}
							disabled={busy || !canDownload}
						>
							Download ZIP
						</Button>
					</div>
				</div>
				{error && (
					<Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}
				<div className="workspace">
					<div className="tabbar">
						<Tabs
							value={informationOpen ? 'information' : device}
							variant="scrollable"
							scrollButtons="auto"
							onChange={(_, v) => {
								setInformationOpen(v === 'information');
								if (v !== 'information') setDevice(v);
							}}
						>
							<Tab
								icon={<Keyboard />}
								iconPosition="start"
								value="moonlander"
								label="Moonlander"
							/>
							<Tab
								icon={<TuneRounded />}
								iconPosition="start"
								value="midimix"
								label="Akai MIDImix"
							/>
							<Tab
								icon={<InfoOutlined />}
								iconPosition="start"
								value="information"
								label="Information"
							/>
						</Tabs>
						<span className="saved">
							<i /> Temporary session · download to keep
						</span>
					</div>
					{informationOpen ? (
						<InformationContent />
					) : !loaded ? (
						<EmptyWorkspace device={device} onImport={openImport} />
					) : (
						<>
							<div className="workspace-heading">
								<div>
									<div className="eyebrow">
										{device === 'moonlander' ? 'ZSA · SPLIT KEYBOARD' : 'AKAI · MIXING CONTROLLER'}
									</div>
									<h2>
										{device === 'moonlander' ? 'Moonlander' : 'MIDImix'}
										<Chip
											size="small"
											label={device === 'moonlander' ? 'Layer 14' : 'Channel strips'}
										/>
									</h2>
									<p>
										Click a {device === 'moonlander' ? 'key' : 'control'} to shape what it does.
									</p>
								</div>
								<div className="stats">
									<div>
										<strong>{controls.length}</strong>
										<span>CONTROLS</span>
									</div>
									<div>
										<strong className="pink">{mapped}</strong>
										<span>MIXXX MAPPED</span>
									</div>
								</div>
							</div>
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
					)}
				</div>
				{!informationOpen &&
					loaded &&
					(device === 'midimix' || Boolean(project.firmware['keymap.c'])) && (
						<FirmwareSettings project={project} device={device} onChange={changeSettings} />
					)}
				<footer>
					<span>
						MIDI WORKBENCH <span className="footer-dot">/</span> {project.name}
					</span>
					<span>Designed around your setup.</span>
				</footer>
			</main>
			{selected && (
				<ControlEditor
					control={selected}
					device={device}
					octave={project.octave}
					onClose={() => setSelected(undefined)}
					onSave={(c) => {
						setProject({
							...project,
							controls: {
								...project.controls,
								[device]: controls.map((old) => (old.id === c.id ? c : old)),
							},
						});
						setSelected(undefined);
						setToast('Mapping kept in this tab. Download your ZIP to save it.');
					}}
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
