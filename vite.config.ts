import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { sourceArchive } from './scripts/sourceArchive';

export default defineConfig(({ mode }) => ({
  base: loadEnv(mode, '.', 'VITE_').VITE_ASSET_BASE_URL || (mode !== 'development' ? 'https://midi-mix-dash.tass.suderman.pro/' : '/'),
	server: { port: 7457, strictPort: true, origin: 'http://localhost:7457', host: true, cors: true },
	plugins: [react(), sourceArchive()],
	build: {
		rollupOptions: {
			preserveEntrySignatures: 'exports-only',
			input: { index: 'index.html', spa: 'src/spa.tsx' },
			output: {
				entryFileNames: (chunk) => (chunk.name === 'spa' ? 'spa.js' : chunk.name === 'index' ? 'index.js' : 'assets/[name]-[hash].js'),
			},
		},
	},
}));
