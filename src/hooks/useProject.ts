import { useEffect, useState } from 'react';
import type { Project, Device, Control } from '../types/controllers';
import {
	exportZip,
	importFirmware,
	importFirmwareFiles,
	importLegacy,
	importXml,
	validateProject,
} from '../utils/projectFiles';
import { emptyProject } from '../utils/emptyProject';
import { controllerAddresses } from '../utils/controllerAddresses';
import { midimixControls } from '../utils/midi';
const useProject = () => {
	const [project, setProject] = useState<Project>(emptyProject);
	const [device, setDevice] = useState<Device>('moonlander');
	const [selected, setSelected] = useState<Control>();
	const [error, setError] = useState('');
	const [toast, setToast] = useState('');
	const [busy, setBusy] = useState(false);
	const [importOpen, setImportOpen] = useState(false);
	const [importDevice, setImportDevice] = useState<Device>('moonlander');
	useEffect(() => {
		// Remove only this application's autosave from versions predating memory-only sessions.
		try {
			localStorage.removeItem('midi-workbench-v1');
		} catch {
			/* Storage may be disabled. */
		}
	}, []);
	const run = async (fn: () => Promise<void>) => {
		setBusy(true);
		setError('');
		try {
			await fn();
		} catch (e) {
			setError(e instanceof Error ? e.message : String(e));
		} finally {
			setBusy(false);
		}
	};
	const uploadFirmware = (file: File) =>
		run(async () => {
			const imported = await importFirmware(file, project);
			setProject(imported);
			setDevice(imported.controls.moonlander.length ? 'moonlander' : 'midimix');
			setImportOpen(false);
			setToast('Firmware / project imported');
		});
	const uploadLooseFirmware = (files: File[]) =>
		run(async () => {
			setProject(await importFirmwareFiles(files, project));
			setDevice('moonlander');
			setImportOpen(false);
			setToast('Firmware source files imported');
		});
	const uploadControllers = (files: File[]) =>
		run(async () => {
			const p = structuredClone(project);
			let count = 0;
			const originals: Record<string, string> = {};
			for (const file of files) {
				if (!/\.(xml|js)$/i.test(file.name))
					throw new Error('Choose Mixxx .midi.xml and .js files.');
				originals[file.name] = await file.text();
			}
			const xmlFiles = Object.keys(originals).filter((n) => n.endsWith('.xml'));
			if (xmlFiles.length > 1)
				throw new Error('Import one XML preset at a time, with its JavaScript files.');
			if (xmlFiles.length) {
				const doc = new DOMParser().parseFromString(originals[xmlFiles[0]], 'application/xml');
				for (const node of doc.querySelectorAll('scriptfiles file')) {
					const filename = node.getAttribute('filename')!;
					if (!originals[filename])
						throw new Error(`Also select the referenced script: ${filename}`);
				}
			}
			if (importDevice === 'midimix' && !p.controls.midimix.length)
				p.controls.midimix = midimixControls();
			if (importDevice === 'moonlander' && !p.firmware['keymap.c'])
				p.controls.moonlander = controllerAddresses(originals);
			p.controls[importDevice].forEach((c) => {
				delete c.mapping;
				delete c.managed;
			});
			let legacy = false;
			const handledScripts = new Set<string>();
			for (const [name, content] of Object.entries(originals))
				if (name.endsWith('.js')) {
					const meta = /^\/\/ MIDI_WORKBENCH_CONTROLS:(.+)$/m.exec(content);
					if (meta) {
						const entries = JSON.parse(meta[1]) as Control[];
						for (const entry of entries) {
							const c = p.controls[importDevice].find(
								(c) =>
									c.number === entry.number &&
									c.channel === entry.channel &&
									c.message === entry.message,
							);
							if (c) {
								c.mapping = entry.mapping;
								c.managed = true;
								if (c.mapping) count++;
							}
						}
						handledScripts.add(name);
						delete originals[name];
						continue;
					}
					const n =
						importDevice === 'moonlander' ? importLegacy(content, p.controls.moonlander) : 0;
					count += n;
					if (n) {
						legacy = true;
						delete originals[name];
					}
				}
			for (const name of xmlFiles) {
				count += importXml(originals[name], p.controls[importDevice]);
				if (legacy || handledScripts.size) {
					const doc = new DOMParser().parseFromString(originals[name], 'application/xml');
					doc.querySelectorAll('scriptfiles file').forEach((el) => {
						if (
							(legacy && el.getAttribute('functionprefix') === 'Moonlander') ||
							handledScripts.has(el.getAttribute('filename') ?? '')
						)
							el.remove();
					});
					originals[name] = new XMLSerializer().serializeToString(doc);
				}
			}
			if (!xmlFiles.length && Object.keys(originals).some((name) => name.endsWith('.js'))) {
				throw new Error('This custom script needs its XML preset. Import both files together.');
			}
			p.originals[importDevice] = originals;
			validateProject(p);
			if (p.name === 'Empty workspace') p.name = 'Imported controller session';
			setProject(p);
			setDevice(importDevice);
			setImportOpen(false);
			setToast(`Imported ${count} editable mappings. Other XML entries and scripts are retained.`);
		});
	const download = () =>
		run(async () => {
			const blob = await exportZip(project);
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = 'midi-workbench.zip';
			a.click();
			setTimeout(() => URL.revokeObjectURL(url), 1000);
			setToast('Downloaded the imported configuration and editable project');
		});

	return {
		project,
		setProject,
		device,
		setDevice,
		selected,
		setSelected,
		error,
		setError,
		toast,
		setToast,
		busy,
		importOpen,
		setImportOpen,
		importDevice,
		setImportDevice,
		uploadFirmware,
		uploadLooseFirmware,
		uploadControllers,
		download,
	};
};
export default useProject;
