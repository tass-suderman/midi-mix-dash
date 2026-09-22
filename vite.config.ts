import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { sourceArchive } from './scripts/sourceArchive';

export default defineConfig({
	server: { port: 7457, strictPort: true, origin: 'http://localhost:7457', host: true, cors: true },
	plugins: [react(), sourceArchive()],
	build: {
		rollupOptions: {
			preserveEntrySignatures: 'exports-only',
			input: { index: 'index.html', spa: 'src/spa.tsx' },
			output: {
				entryFileNames: (chunk) => (chunk.name === 'spa' ? 'spa.js' : 'assets/[name]-[hash].js'),
			},
		},
	},
});
