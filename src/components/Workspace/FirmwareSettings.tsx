import { TextField, MenuItem } from '@mui/material';
import ExportInformation from './ExportInformation';
import type { Project, Device } from '../../types/controllers';
import { noteLabel } from '../../utils/midi';
interface Props {
	project: Project;
	device: Device;
	onChange: (octave: number, channel: number) => void;
}
const FirmwareSettings = ({ project, device, onChange }: Props) => (
	<div className="bottom-grid">
		<section className="settings-card">
			<div className="section-label">
				{device === 'moonlander' ? 'FIRMWARE SETTINGS' : 'HARDWARE PROFILE'}
			</div>
			{device === 'moonlander' ? (
				<>
					<div className="settings-row">
						<TextField
							select
							size="small"
							label="Startup octave offset"
							value={project.octave}
							onChange={(e) => onChange(Number(e.target.value), project.channel)}
						>
							{[0, 1, 2, 3, 4].map((n) => (
								<MenuItem key={n} value={n}>
									{n} · MI_C = {noteLabel(12 * n)}
								</MenuItem>
							))}
						</TextField>
						<TextField
							select
							size="small"
							label="MIDI channel"
							value={project.channel}
							onChange={(e) => onChange(project.octave, Number(e.target.value))}
						>
							{Array.from({ length: 16 }, (_, i) => (
								<MenuItem key={i} value={i + 1}>
									{i + 1}
								</MenuItem>
							))}
						</TextField>
					</div>
					<p>MIDI enabled · Advanced MIDI enabled · Other layers preserved</p>
				</>
			) : (
				<p>
					Factory MIDI addresses are preloaded. For a customized MIDImix, adjust a control’s MIDI
					address to match your hardware.
				</p>
			)}
		</section>
		<ExportInformation />
	</div>
);
export default FirmwareSettings;
