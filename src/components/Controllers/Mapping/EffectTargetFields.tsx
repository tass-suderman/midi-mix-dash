import NumberSelect from '../../Fields/NumberSelect';
import type { Mapping } from '../../../types/controllers';
interface Props {
	mapping: Mapping;
	onChange: (patch: Partial<Mapping>) => void;
}
const EffectTargetFields = ({ mapping, onChange }: Props) => (
	<>
		<NumberSelect
			label="Effect unit"
			value={mapping.unit ?? 1}
			values={[1, 2, 3, 4]}
			prefix="Unit"
			onChange={(unit) => onChange({ unit })}
		/>
		{['fx_slot_enabled', 'fx_meta', 'fx_parameter'].includes(mapping.action) && (
			<NumberSelect
				label="Effect slot"
				value={mapping.effect ?? 1}
				values={[1, 2, 3]}
				prefix="Slot"
				onChange={(effect) => onChange({ effect })}
			/>
		)}
		{mapping.action === 'fx_parameter' && (
			<NumberSelect
				label="Effect parameter"
				value={mapping.parameter ?? 1}
				values={Array.from({ length: 16 }, (_, i) => i + 1)}
				prefix="Parameter"
				onChange={(parameter) => onChange({ parameter })}
			/>
		)}
		<p className="muted">Available parameters depend on the effect loaded in this slot.</p>
	</>
);
export default EffectTargetFields;
