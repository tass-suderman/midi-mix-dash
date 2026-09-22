import { GraphicEqRounded } from '@mui/icons-material';
import type { Device } from '../../types/controllers';
const HardwareShell = ({ device }: { device: Device }) => (
	<>
		{device === 'moonlander' ? (
			<>
				<div className="keyboard-shell left-shell" />
				<div className="keyboard-shell right-shell" />
				<div className="center-mark">
					<GraphicEqRounded />
					<span>MOONLANDER</span>
					<small>MK I</small>
				</div>
			</>
		) : (
			<>
				<div className="akai-brand">
					AKAI <small>PROFESSIONAL</small>
				</div>
				<div className="akai-title">MIDImix</div>
				<div className="strip-numbers">
					{Array.from({ length: 8 }, (_, i) => (
						<span key={i}>{i + 1}</span>
					))}
				</div>
				<span className="send-all" title="Hardware utility: sends all current control values">
					SEND ALL
				</span>
			</>
		)}
	</>
);
export default HardwareShell;
