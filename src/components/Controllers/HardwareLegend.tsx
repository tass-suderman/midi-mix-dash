import type { Device } from '../../types/controllers';
const HardwareLegend = ({ device, notes }: { device: Device; notes: number }) => (
	<div className="legend">
		<span>
			<i className="blue-dot" />
			MIDI note
		</span>
		<span>
			<i className="red-dot" />
			Mixxx · deck 1 / other
		</span>
		<span>
			<i className="purple-dot" />
			MIDI + Mixxx · deck 1 / other
		</span>
		<span>
			<i className="yellow-dot" />
			Mixxx · deck 2
		</span>
		<span>
			<i className="green-dot" />
			MIDI + Mixxx · deck 2
		</span>
		{device === 'moonlander' && (
			<span>
				<i className="white-dot" />
				Special command
			</span>
		)}
		<span>
			<i className="gray-dot" />
			Unmapped
		</span>
		<span className="legend-hint">
			{device === 'moonlander'
				? `${notes} notes · 72 possibilities`
				: '24 knobs · 9 faders · 19 buttons'}
		</span>
	</div>
);
export default HardwareLegend;
