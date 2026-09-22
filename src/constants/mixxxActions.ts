// Control names and scopes from the Mixxx 2.5 Controls reference.
// Trigger controls receive a 1/0 pulse per press; held controls receive release events.
export const actionGroups = [
	{
		label: 'Transport & deck',
		items: [
			['play', 'Play / pause', 'toggle'],
			['cue_default', 'Cue', 'momentary'],
			['start_play', 'Play from start', 'trigger'],
			['start_stop', 'Stop at start', 'trigger'],
			['sync_enabled', 'Sync', 'toggle'],
			['beatsync', 'Sync once', 'trigger'],
			['pfl', 'Headphone cue', 'toggle'],
			['keylock', 'Key lock', 'toggle'],
			['quantize', 'Quantize', 'toggle'],
			['slip_enabled', 'Slip mode', 'toggle'],
			['repeat', 'Repeat track', 'toggle'],
			['reverse', 'Reverse playback', 'toggle'],
			['reverseroll', 'Reverse roll', 'momentary'],
			['fwd', 'Fast forward', 'momentary'],
			['back', 'Rewind', 'momentary'],
			['LoadSelectedTrack', 'Load selected track', 'trigger'],
			['eject', 'Eject track', 'trigger'],
		],
	},
	{
		label: 'Mixer & EQ',
		items: [
			['volume', 'Volume', 'set'],
			['pregain', 'Gain', 'set'],
			['eq_high', 'EQ · high', 'set'],
			['eq_mid', 'EQ · mid', 'set'],
			['eq_low', 'EQ · low', 'set'],
			['eq_kill_high', 'EQ kill · high', 'toggle'],
			['eq_kill_mid', 'EQ kill · mid', 'toggle'],
			['eq_kill_low', 'EQ kill · low', 'toggle'],
			['filter', 'Quick effect / filter', 'set'],
			['rate', 'Playback rate', 'set'],
			['playposition', 'Track position', 'set'],
		],
	},
	{
		label: 'Hotcues & loops',
		items: [
			['hotcue_activate', 'Hotcue · activate', 'momentary'],
			['hotcue_set', 'Hotcue · set', 'trigger'],
			['hotcue_clear', 'Hotcue · clear', 'trigger'],
			['hotcue_goto', 'Hotcue · jump', 'trigger'],
			['hotcue_gotoandplay', 'Hotcue · jump and play', 'trigger'],
			['beatjump', 'Beat jump', 'trigger'],
			['beatloop', 'Beat loop · toggle', 'trigger'],
			['beatlooproll', 'Loop roll · hold', 'momentary'],
			['loop_in', 'Loop in', 'trigger'],
			['loop_out', 'Loop out', 'trigger'],
			['reloop_toggle', 'Reloop / exit loop', 'trigger'],
			['loop_halve', 'Halve loop', 'trigger'],
			['loop_double', 'Double loop', 'trigger'],
		],
	},
	{
		label: 'Effects',
		items: [
			['fx_enabled', 'Effect unit · enabled', 'toggle'],
			['fx_mix', 'Effect unit · dry / wet', 'set'],
			['fx_super1', 'Effect unit · super knob', 'set'],
			['fx_assign', 'Effect unit · assign to deck', 'toggle'],
			['fx_slot_enabled', 'Effect slot · enabled', 'toggle'],
			['fx_meta', 'Effect slot · meta knob', 'set'],
			['fx_parameter', 'Effect slot · parameter', 'set'],
		],
	},
	{
		label: 'Samplers',
		items: [
			['sampler_play', 'Sampler · play / pause', 'toggle'],
			['sampler_cue_gotoandplay', 'Sampler · trigger from cue', 'trigger'],
			['sampler_stop', 'Sampler · stop', 'trigger'],
			['sampler_LoadSelectedTrack', 'Sampler · load selected track', 'trigger'],
			['sampler_volume', 'Sampler · volume', 'set'],
			['sampler_pregain', 'Sampler · gain', 'set'],
		],
	},
	{
		label: 'Master & headphones',
		items: [
			['crossfader', 'Crossfader', 'set'],
			['master_gain', 'Master volume', 'set'],
			['headGain', 'Headphone volume', 'set'],
			['headMix', 'Headphone cue / master mix', 'set'],
		],
	},
	{
		label: 'Library & Auto DJ',
		items: [
			['library_MoveUp', 'Library · previous item', 'trigger'],
			['library_MoveDown', 'Library · next item', 'trigger'],
			['library_MoveLeft', 'Library · collapse / left', 'trigger'],
			['library_MoveRight', 'Library · expand / right', 'trigger'],
			['library_GoToItem', 'Library · open item', 'trigger'],
			['autodj_enabled', 'Auto DJ · enabled', 'toggle'],
			['autodj_fade_now', 'Auto DJ · fade now', 'trigger'],
			['autodj_skip_next', 'Auto DJ · skip next', 'trigger'],
		],
	},
	{ label: 'Advanced', items: [['custom', 'Custom Mixxx control', 'set']] },
] as const;
export const actions = actionGroups.flatMap((group) => [...group.items]);
export const continuousActions = new Set([
	'volume',
	'pregain',
	'eq_high',
	'eq_mid',
	'eq_low',
	'filter',
	'rate',
	'playposition',
	'fx_mix',
	'fx_super1',
	'fx_meta',
	'fx_parameter',
	'sampler_volume',
	'sampler_pregain',
	'crossfader',
	'master_gain',
	'headGain',
	'headMix',
	'custom',
]);
export function actionScope(action: string) {
	if (action === 'custom') return 'custom';
	if (action.startsWith('sampler_')) return 'sampler';
	if (action.startsWith('fx_')) return 'effect';
	if (action.startsWith('library_')) return 'library';
	if (action.startsWith('autodj_')) return 'autodj';
	if (['crossfader', 'master_gain', 'headGain', 'headMix'].includes(action)) return 'master';
	return 'deck';
}
