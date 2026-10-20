import { defineConfig } from "vitest/config";

const TEST_FILES = "test/**/*.test.ts";
const TEST_ENVIRONMENT = "node";

export default defineConfig({
	test: {
		include: [TEST_FILES],
		environment: TEST_ENVIRONMENT,
	},
});
