import { DownloadRounded } from '@mui/icons-material';
const ExportInformation = () => (
	<section className="settings-card export-card">
		<DownloadRounded />
		<div>
			<div className="section-label">READY FOR YOUR NEXT SESSION</div>
			<p>
				One ZIP with firmware source, Mixxx XML + scripts, and your editable project. Compile the
				source before flashing.
			</p>
			<span className="muted">Everything stays in your browser. No account or upload server.</span>
		</div>
	</section>
);
export default ExportInformation;
