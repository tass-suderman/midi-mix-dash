import { readFile, readdir } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import JSZip from 'jszip';
import type { Plugin } from 'vite';

// Package only application source and build instructions, never imports, local
// firmware samples, .git, environment files, dependencies, or generated output.
const sourceFiles = [
	'package.json',
	'pnpm-lock.yaml',
	'tsconfig.json',
	'vite.config.ts',
	'index.html',
	'eslint.config.js',
	'.prettierrc.json',
	'.gitignore',
	'LICENSE',
	'README.md',
	'PRIVACY.md',
	'vercel.json',
];
export const sourceArchive = (): Plugin => {
	let root = process.cwd();
	const archive = async () => {
		const zip = new JSZip();
		for (const name of sourceFiles) zip.file(name, await readFile(resolve(root, name)));
		const includeDirectory = async (directory: string) => {
			for (const entry of await readdir(directory, { withFileTypes: true })) {
				const path = resolve(directory, entry.name);
				if (entry.isDirectory()) await includeDirectory(path);
				else if (entry.isFile()) zip.file(relative(root, path), await readFile(path));
			}
		};
		await includeDirectory(resolve(root, 'src'));
		await includeDirectory(resolve(root, 'scripts'));
		return zip.generateAsync({ type: 'nodebuffer' });
	};
	return {
		name: 'application-source-download',
		configResolved(config) {
			root = config.root;
		},
		configureServer(server) {
			server.middlewares.use(async (req, res, next) => {
				const path = req.url?.split('?')[0];
				if (path !== '/source.zip' && path !== '/LICENSE.txt') return next();
				try {
					res.setHeader(
						'Content-Type',
						path === '/source.zip' ? 'application/zip' : 'text/plain; charset=utf-8',
					);
					res.end(
						path === '/source.zip' ? await archive() : await readFile(resolve(root, 'LICENSE')),
					);
				} catch (error) {
					next(error);
				}
			});
		},
		async generateBundle() {
			this.emitFile({ type: 'asset', fileName: 'source.zip', source: await archive() });
			this.emitFile({
				type: 'asset',
				fileName: 'LICENSE.txt',
				source: await readFile(resolve(root, 'LICENSE')),
			});
		},
	};
};
