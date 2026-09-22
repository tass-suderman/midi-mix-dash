import type { Mapping } from '../../../types/controllers';
import { target } from '../../../utils/midi';
const MappingPreview = ({ mapping }: { mapping: Mapping }) => (
	<div className="mapping-preview">
		<span>Destination</span>
		<code>{target(mapping).join(' → ')}</code>
	</div>
);
export default MappingPreview;
