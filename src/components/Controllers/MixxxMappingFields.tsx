import { Alert } from '@mui/material';
import type { Mapping } from '../../types/controllers';
import { createMapping, isAnalogAction } from '../../utils/mappingOptions';
import ActionSelect from './Mapping/ActionSelect';
import MappingTargetFields from './Mapping/MappingTargetFields';
import MappingBehaviorFields from './Mapping/MappingBehaviorFields';
import MappingPreview from './Mapping/MappingPreview';
interface Props {
	mapping?: Mapping;
	analog: boolean;
	onChange: (mapping?: Mapping) => void;
}
const MixxxMappingFields = ({ mapping, analog, onChange }: Props) => (
	<>
		<div className="section-label">MIXXX CONNECTION</div>
		<ActionSelect
			action={mapping?.action}
			analog={analog}
			onChange={(action) => onChange(createMapping(action, analog))}
		/>
		<a
			className="docs-link"
			href="https://manual.mixxx.org/2.5/en/chapters/appendix/mixxx_controls"
			target="_blank"
			rel="noreferrer"
		>
			Mixxx control reference ↗
		</a>
		{mapping && analog && !isAnalogAction(mapping.action) ? (
			<Alert severity="warning">
				This imported action is not usable with a knob or slider. Choose a continuous action or No
				Mixxx mapping.
			</Alert>
		) : (
			mapping && (
				<>
					<MappingTargetFields
						mapping={mapping}
						onChange={(patch) => onChange({ ...mapping, ...patch })}
					/>
					<MappingBehaviorFields
						mapping={mapping}
						analog={analog}
						onChange={(patch) => onChange({ ...mapping, ...patch })}
					/>
					<MappingPreview mapping={mapping} />
				</>
			)
		)}
	</>
);
export default MixxxMappingFields;
