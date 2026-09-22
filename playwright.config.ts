import { defineConfig } from '@playwright/test';
export default defineConfig({
	testDir: './e2e',
	webServer: { command: 'pnpm dev', url: 'http://127.0.0.1:7457', reuseExistingServer: true },
	use: {
		baseURL: 'http://127.0.0.1:7457',
		headless: true,
		launchOptions: {
			executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
		},
	},
	reporter: 'list',
});
