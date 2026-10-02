import { defineConfig, devices } from "@playwright/test";

const PORT = 5273;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const WEB_SERVER_TIMEOUT_MS = 180_000;

export default defineConfig({
	testDir: "./tests",
	fullyParallel: false,
	workers: 1,
	retries: 0,
	reporter: "list",
	use: {
		baseURL: BASE_URL,
		trace: "on-first-retry",
	},
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
	globalSetup: "./support/global-setup.ts",
	globalTeardown: "./support/global-teardown.ts",
	webServer: {
		command: `pnpm --filter @app/web exec vite build && pnpm --filter @app/web exec vite preview --host 127.0.0.1 --port ${PORT} --strictPort`,
		url: BASE_URL,
		reuseExistingServer: !process.env.CI,
		timeout: WEB_SERVER_TIMEOUT_MS,
		env: {
			VITE_API_URL: process.env.VITE_API_URL ?? "http://127.0.0.1:3108",
		},
	},
});
