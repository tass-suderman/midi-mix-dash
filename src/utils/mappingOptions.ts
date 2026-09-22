import { actionGroups, actions, continuousActions } from '../constants/mixxxActions';
import { defaultMapping } from '../constants/keyCommands';
import type { Mapping } from '../types/controllers';
export const isAnalogAction = (action: string) => continuousActions.has(action);
export const availableActionGroups = (analog: boolean) =>
	actionGroups
		.map((group) => ({
			label: group.label,
			items: group.items.filter(([id]) => !analog || isAnalogAction(id)),
		}))
		.filter((group) => group.items.length > 0);
export const createMapping = (action: string, analog: boolean): Mapping | undefined => {
	if (action === 'none') return undefined;
	const entry = actions.find(([id]) => id === action);
	if (!entry || (analog && !isAnalogAction(action))) return undefined;
	return { ...defaultMapping(), action, mode: analog ? 'continuous' : entry[2] };
};
