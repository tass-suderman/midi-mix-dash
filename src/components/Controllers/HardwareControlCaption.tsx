import type { Control } from '../../types/controllers';
import { actions, noteLabel } from '../../utils/midi';
import { controlLabel } from '../../utils/controlLabels';
const HardwareControlCaption = ({
	control: c,
	hasMidi,
}: {
	control: Control;
	hasMidi: boolean;
}) => (
	<>
		{c.kind === 'key' ? (
			<>
				<span className="key-name">
					{['KC_NO', 'XXXXXXX'].includes(c.code ?? '') ? '—' : controlLabel(c)}
				</span>
				<small>
					{c.mapping
						? actions.find((a) => a[0] === c.mapping!.action)?.[1]?.split(' / ')[0]
						: hasMidi
							? noteLabel(c.number)
							: ['KC_NO', 'KC_TRANSPARENT', 'KC_TRNS', '_______', 'XXXXXXX'].includes(c.code ?? '')
								? ''
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
	</>
);
export default HardwareControlCaption;
