import type { Device } from '../types/controllers';
import { midimixControls, moonControls } from './midi';
// Display placeholders only. No firmware or controller presets are fabricated
// or added to the project before the user imports their configuration.
export const emptyGraphic = (device: Device) =>
	device === 'midimix'
		? midimixControls()
		: moonControls(`[14] = LAYOUT_moonlander(${Array(72).fill('KC_NO').join(',')})`);
