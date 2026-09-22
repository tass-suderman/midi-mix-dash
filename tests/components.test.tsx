// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { it, expect } from 'vitest';
import ControlEditorDialogActions from '../src/components/Controllers/ControlEditorDialog/ControlEditorDialogActions';
import ControlEditor from '../src/components/Controllers/ControlEditor';
import HardwareControlCaption from '../src/components/Controllers/HardwareControlCaption';
import { midimixControls } from '../src/utils/midi';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
it('dialog actions prevent invalid saves and keep cancel independent', async () => {
	const container = document.createElement('div');
	document.body.append(container);
	const root = createRoot(container);
	let saved = 0,
		cancelled = 0;
	try {
		await act(async () =>
			root.render(
				<ControlEditorDialogActions
					valid={false}
					onSave={() => saved++}
					onClose={() => cancelled++}
				/>,
			),
		);
		const [cancel, save] = Array.from(container.querySelectorAll('button'));
		await act(async () => {
			save.click();
			cancel.click();
		});
		expect(saved).toBe(0);
		expect(cancelled).toBe(1);
		await act(async () =>
			root.render(
				<ControlEditorDialogActions valid onSave={() => saved++} onClose={() => cancelled++} />,
			),
		);
		await act(async () => save.click());
		expect(saved).toBe(1);
	} finally {
		await act(async () => root.unmount());
		container.remove();
	}
});
it('cleared key captions are visually blank without a misleading special label', async () => {
	const container = document.createElement('div');
	const root = createRoot(container);
	try {
		await act(async () =>
			root.render(
				<HardwareControlCaption
					control={{ ...midimixControls()[0], kind: 'key', code: 'KC_NO' }}
					hasMidi={false}
				/>,
			),
		);
		expect(container.textContent).toBe('—');
	} finally {
		await act(async () => root.unmount());
	}
});
it('editing a control keeps the input immutable and cancel does not save', async () => {
	const container = document.createElement('div');
	document.body.append(container);
	const root = createRoot(container);
	const control = midimixControls()[0];
	const original = structuredClone(control);
	let saved = 0,
		closed = 0;
	try {
		await act(async () =>
			root.render(
				<ControlEditor
					control={control}
					device="midimix"
					octave={1}
					onSave={() => saved++}
					onClose={() => closed++}
				/>,
			),
		);
		const cancel = Array.from(document.querySelectorAll('button')).find(
			(button) => button.textContent === 'Cancel',
		)!;
		await act(async () => cancel.click());
		expect(closed).toBe(1);
		expect(saved).toBe(0);
		expect(control).toEqual(original);
	} finally {
		await act(async () => root.unmount());
		container.remove();
	}
});
