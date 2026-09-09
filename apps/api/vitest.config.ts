import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [tsconfigPaths({ projects: ["./tsconfig.json"] })],
	test: {
		environment: "node",
		globals: false,
		include: ["src/**/*.{test,spec}.ts"],
		passWithNoTests: true,
		fileParallelism: false,
		env: {
			DATABASE_URL: "postgres://app:app@localhost:5432/app_test",
			REDIS_URL: "redis://localhost:6379",
			RABBITMQ_URL: "amqp://app:app@localhost:5672",
			BETTER_AUTH_URL: "http://localhost:3001",
			BETTER_AUTH_SECRET: "test-secret-at-least-16-chars-long",
		},
	},
});
