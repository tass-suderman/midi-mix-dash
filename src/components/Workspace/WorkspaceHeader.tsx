import { Button, CircularProgress } from '@mui/material';
import { UploadFileRounded, DownloadRounded } from '@mui/icons-material';
interface Props {
	busy: boolean;
	canDownload: boolean;
	onImport: () => void;
	onDownload: () => void;
}
const WorkspaceHeader = ({ busy, canDownload, onImport, onDownload }: Props) => (
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
				onClick={onImport}
				disabled={busy}
			>
				Import files
			</Button>
			<Button
				startIcon={busy ? <CircularProgress size={18} /> : <DownloadRounded />}
				variant="contained"
				onClick={onDownload}
				disabled={busy || !canDownload}
			>
				Download ZIP
			</Button>
		</div>
	</div>
);
export default WorkspaceHeader;
