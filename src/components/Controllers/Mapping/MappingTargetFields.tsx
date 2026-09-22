import type { Mapping } from '../../../types/controllers';
import { actionScope } from '../../../constants/mixxxActions';
import NumberSelect from '../../Fields/NumberSelect';
import EffectTargetFields from './EffectTargetFields';
import BeatTargetFields from './BeatTargetFields';
import CustomTargetFields from './CustomTargetFields';
interface Props {
	mapping: Mapping;
	onChange: (patch: Partial<Mapping>) => void;
}
const MappingTargetFields = ({ mapping, onChange }: Props) => {
	const scope = actionScope(mapping.action);
	return (
		<>
			{(scope === 'deck' || mapping.action === 'fx_assign') && (
				<NumberSelect
					label="Deck / channel"
					value={mapping.deck}
					values={[1, 2, 3, 4]}
					prefix="Deck"
					onChange={(deck) => onChange({ deck })}
				/>
			)}
			{mapping.action.startsWith('hotcue_') && (
				<NumberSelect
					label="Hotcue number"
					value={mapping.hotcue ?? 1}
					values={Array.from({ length: 16 }, (_, i) => i + 1)}
					prefix="Hotcue"
					onChange={(hotcue) => onChange({ hotcue })}
				/>
			)}
			{scope === 'sampler' && (
				<NumberSelect
					label="Sampler"
					value={mapping.sampler ?? 1}
					values={Array.from({ length: 64 }, (_, i) => i + 1)}
					prefix="Sampler"
					onChange={(sampler) => onChange({ sampler })}
				/>
			)}
			{scope === 'effect' && <EffectTargetFields mapping={mapping} onChange={onChange} />}
			{scope === 'custom' && <CustomTargetFields mapping={mapping} onChange={onChange} />}
			{['beatjump', 'beatloop', 'beatlooproll'].includes(mapping.action) && (
				<BeatTargetFields mapping={mapping} onChange={onChange} />
			)}
		</>
	);
};
export default MappingTargetFields;
