import { actions, noteFromCode, target } from './midi';
import type { Control } from '../types/controllers';
import { specials } from '../constants/keyCommands';
export function controlLabel(c: Control) {
	return c.code
		? noteFromCode(c.code) !== undefined
			? c.code.slice(3).replace('s', '♯')
			: (specials[c.code] ?? c.code)
		: c.kind === 'button'
			? c.label.split(' · ').at(-1)
			: `CC ${c.number}`;
}
export function mappingLabel(c: Control) {
	if (!c.mapping) return 'Unassigned';
	return `${actions.find((a) => a[0] === c.mapping!.action)?.[1] ?? c.mapping.action} · ${target(c.mapping)[0]}`;
}
