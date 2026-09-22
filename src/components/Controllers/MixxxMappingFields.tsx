import { Alert, TextField, MenuItem, ListSubheader } from '@mui/material';
import type { Mapping } from '../../types/controllers';
import { actions, target } from '../../utils/midi';
import { actionGroups, actionScope, continuousActions } from '../../constants/mixxxActions';
import { defaultMapping } from '../../constants/keyCommands';
interface Props {
	mapping?: Mapping;
	analog: boolean;
	onChange: (mapping?: Mapping) => void;
}
const MixxxMappingFields = ({ mapping, analog, onChange }: Props) => {
	const scope = actionScope(mapping?.action ?? 'play');
	const map = (patch: Partial<Mapping>) => onChange({ ...(mapping ?? defaultMapping()), ...patch });
	const update = (patch: { mapping?: Mapping }) => onChange(patch.mapping);
	return (
		<>
			<div className="section-label">MIXXX CONNECTION</div>
			<TextField
				select
				label="Action"
				value={mapping?.action ?? 'none'}
				onChange={(e) => {
					const action = e.target.value;
					update({
						mapping:
							action === 'none'
								? undefined
								: {
										...defaultMapping(),
										action,
										mode: analog ? 'continuous' : actions.find((a) => a[0] === action)![2],
									},
					});
				}}
			>
				<MenuItem value="none">No Mixxx mapping</MenuItem>
				{actionGroups.flatMap((group) => [
					<ListSubheader key={group.label}>{group.label}</ListSubheader>,
					...group.items.map(([id, label]) => (
						<MenuItem key={id} value={id} disabled={analog && !continuousActions.has(id)}>
							{label}
						</MenuItem>
					)),
				])}
			</TextField>
			<a
				className="docs-link"
				href="https://manual.mixxx.org/2.5/en/chapters/appendix/mixxx_controls"
				target="_blank"
				rel="noreferrer"
			>
				Mixxx control reference ↗
			</a>
			{mapping && (
				<>
					{(scope === 'deck' || mapping.action === 'fx_assign') && (
						<TextField
							select
							label="Deck / channel"
							value={mapping.deck}
							onChange={(e) => map({ deck: Number(e.target.value) })}
						>
							{[1, 2, 3, 4].map((n) => (
								<MenuItem key={n} value={n}>
									Deck {n}
								</MenuItem>
							))}
						</TextField>
					)}
					{mapping.action.startsWith('hotcue_') && (
						<TextField
							select
							label="Hotcue number"
							value={mapping.hotcue ?? 1}
							onChange={(e) => map({ hotcue: Number(e.target.value) })}
						>
							{Array.from({ length: 16 }, (_, i) => (
								<MenuItem key={i} value={i + 1}>
									Hotcue {i + 1}
								</MenuItem>
							))}
						</TextField>
					)}
					{scope === 'sampler' && (
						<TextField
							select
							label="Sampler"
							value={mapping.sampler ?? 1}
							onChange={(e) => map({ sampler: Number(e.target.value) })}
						>
							{Array.from({ length: 64 }, (_, i) => (
								<MenuItem key={i} value={i + 1}>
									Sampler {i + 1}
								</MenuItem>
							))}
						</TextField>
					)}
					{scope === 'effect' && (
						<>
							<TextField
								select
								label="Effect unit"
								value={mapping.unit ?? 1}
								onChange={(e) => map({ unit: Number(e.target.value) })}
							>
								{[1, 2, 3, 4].map((n) => (
									<MenuItem key={n} value={n}>
										Unit {n}
									</MenuItem>
								))}
							</TextField>
							{['fx_slot_enabled', 'fx_meta', 'fx_parameter'].includes(mapping.action) && (
								<TextField
									select
									label="Effect slot"
									value={mapping.effect ?? 1}
									onChange={(e) => map({ effect: Number(e.target.value) })}
								>
									{[1, 2, 3].map((n) => (
										<MenuItem key={n} value={n}>
											Slot {n}
										</MenuItem>
									))}
								</TextField>
							)}
							{mapping.action === 'fx_parameter' && (
								<TextField
									select
									label="Effect parameter"
									value={mapping.parameter ?? 1}
									onChange={(e) => map({ parameter: Number(e.target.value) })}
								>
									{Array.from({ length: 16 }, (_, i) => (
										<MenuItem key={i} value={i + 1}>
											Parameter {i + 1}
										</MenuItem>
									))}
								</TextField>
							)}
							<p className="muted">
								Available parameters depend on the effect loaded in this slot.
							</p>
						</>
					)}
					{mapping.action === 'custom' && (
						<>
							<TextField
								label="Mixxx group"
								value={mapping.group ?? ''}
								placeholder="[Channel1]"
								onChange={(e) => map({ group: e.target.value })}
							/>
							<TextField
								label="Mixxx control"
								value={mapping.key ?? ''}
								placeholder="play"
								onChange={(e) => map({ key: e.target.value })}
							/>
						</>
					)}
					{['beatjump', 'beatloop', 'beatlooproll'].includes(mapping.action) && (
						<div className="address-fields">
							<TextField
								select
								label="Beats"
								value={mapping.beats ?? 1}
								onChange={(e) => map({ beats: Number(e.target.value) })}
							>
								{[0.125, 0.25, 0.5, 1, 2, 4, 8, 16, 32, 64].map((n) => (
									<MenuItem key={n} value={n}>
										{n}
									</MenuItem>
								))}
							</TextField>
							{mapping.action === 'beatjump' && (
								<TextField
									select
									label="Direction"
									value={mapping.direction ?? 'forward'}
									onChange={(e) => map({ direction: e.target.value })}
								>
									<MenuItem value="forward">Forward</MenuItem>
									<MenuItem value="backward">Backward</MenuItem>
								</TextField>
							)}
						</div>
					)}
					{analog ? (
						<Alert severity="info">
							The physical value passes through to Mixxx as a normalized 0–1 parameter.
						</Alert>
					) : (
						<>
							<TextField
								select
								label="Button behavior"
								value={mapping.mode}
								onChange={(e) => map({ mode: e.target.value as Mapping['mode'] })}
							>
								<MenuItem value="trigger">Trigger once per press</MenuItem>
								<MenuItem value="toggle">Toggle on press</MenuItem>
								<MenuItem value="momentary">Hold (release resets to 0)</MenuItem>
								<MenuItem value="set">Set a value on press</MenuItem>
							</TextField>
							{mapping.mode === 'set' && mapping.action !== 'beatjump' && (
								<TextField
									label="Value to set"
									type="number"
									value={mapping.value}
									onChange={(e) =>
										map({
											value: e.target.value === '' ? NaN : Number(e.target.value),
										})
									}
									helperText={
										mapping.action === 'volume'
											? 'Volume: 0 = silent, 1 = unity gain.'
											: 'Native Mixxx control value; check the control’s range.'
									}
									inputProps={{ step: 0.05 }}
								/>
							)}
						</>
					)}
					<div className="mapping-preview">
						<span>Destination</span>
						<code>{target(mapping).join(' → ')}</code>
					</div>
				</>
			)}
		</>
	);
};
export default MixxxMappingFields;
