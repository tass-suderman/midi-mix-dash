import { it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

it('prepares an extracted export without overwriting existing keymaps', () => {
	const root = mkdtempSync(join(tmpdir(), 'midi-preparation-'));
	try {
		const script = join(root, 'prepare-firmware.sh');
		writeFileSync(script, readFileSync('src/constants/prepare-firmware.sh'));
		mkdirSync(join(root, 'firmware/midi_workbench'), { recursive: true });
		writeFileSync(join(root, 'firmware/midi_workbench/keymap.c'), 'sample source');
		const checkout = join(root, 'qmk checkout');
		mkdirSync(join(checkout, 'keyboards/zsa/moonlander/keymaps'), { recursive: true });
		const run = () =>
			spawnSync('bash', [script, checkout, 'zsa/moonlander/reva'], { encoding: 'utf8' });
		expect(run().status).toBe(0);
		expect(
			readFileSync(
				join(checkout, 'keyboards/zsa/moonlander/keymaps/midi_workbench/keymap.c'),
				'utf8',
			),
		).toBe('sample source');
		const again = run();
		expect(again.status).toBe(1);
		expect(again.stderr).toContain('already exists');
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});
