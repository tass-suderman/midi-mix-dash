import { Tooltip } from '@mui/material';
import { GraphicEqRounded } from '@mui/icons-material';
import type { Control, Device } from '../../types/controllers';
import { actions, noteFromCode, noteLabel } from '../../utils/midi';
import { controlLabel, mappingLabel } from '../../utils/controlLabels';
import { moonKeyGeometry } from '../../utils/moonLayout';
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
			{' '}
			<div className="hardware-scroll">
				<div className={`hardware ${device}`}>
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
					{controls.map((c, index) => {
						const geometry = device === 'moonlander' ? moonKeyGeometry(index) : undefined;
						const hasMidi = device === 'moonlander' && noteFromCode(c.code!, octave) !== undefined;
						const state = hasMidi
							? c.mapping
								? 'both'
								: 'midi'
							: c.mapping
								? 'mixxx'
								: device === 'moonlander' &&
									  !['KC_NO', 'KC_TRANSPARENT', 'KC_TRNS'].includes(c.code ?? '')
									? 'special'
									: 'empty';
						return (
							<Tooltip
								key={c.id}
								title={
									<>
										{c.label}
										<br />
										{c.code ?? `${c.message.toUpperCase()} ${c.number}`}
										<br />
										{mappingLabel(c)}
									</>
								}
								arrow
							>
								<button
									aria-label={`${c.label}: ${controlLabel(c)}; ${mappingLabel(c)}`}
									className={`control ${c.kind} ${state} ${geometry?.large ? 'large-thumb' : ''} ${geometry?.thumb ? 'thumb-key' : ''}`}
									data-control-id={c.id}
									style={
										geometry
											? {
													left: geometry.left,
													top: geometry.top,
													width: geometry.width,
													height: geometry.height,
													rotate: `${geometry.rotate}deg`,
												}
											: { left: 36 + c.x * 91, top: 87 + c.y * 76 }
									}
									onClick={() => onSelect(c)}
								>
									<span className="physical" />
									{c.kind === 'key' ? (
										<>
											<span className="key-name">{controlLabel(c)}</span>
											<small>
												{c.mapping
													? actions.find((a) => a[0] === c.mapping!.action)?.[1]?.split(' / ')[0]
													: hasMidi
														? noteLabel(c.number)
														: 'SPECIAL'}
											</small>
										</>
									) : (
										<span className="control-caption">
											{c.kind === 'button'
												? controlLabel(c)
												: c.mapping
													? actions.find((a) => a[0] === c.mapping!.action)?.[1]
													: `CC ${c.number}`}
										</span>
									)}
								</button>
							</Tooltip>
						);
					})}
				</div>
			</div>
			<div className="legend">
				<span>
					<i className="blue-dot" />
					MIDI note
				</span>
				<span>
					<i className="red-dot" />
					Mixxx mapping
				</span>
				<span>
					<i className="purple-dot" />
					Both connected
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
		</>
	);
};
export default ControllerGraphic;
