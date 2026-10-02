import { LOGGER_LEVEL } from "@app/logger";
import { afterEach, describe, expect, it, vi } from "vitest";

const ENV_PATH = "#/platform/config/env.ts";
const SETTINGS_READ = "settings read";

const envThatThrows = (): { env: Record<string, never> } => ({
	env: new Proxy(
		{},
		{
			get: (): never => {
				throw new Error(SETTINGS_READ);
			},
		},
	),
});

const envOf = (): { env: Record<string, string | undefined> } => ({
	env: {
		NODE_ENV: "production",
		LOG_LEVEL: LOGGER_LEVEL.WARN,
		LOG_TRANSPORT_TARGET: undefined,
	},
});

describe("logger", () => {
	afterEach((): void => {
		vi.doUnmock(ENV_PATH);
		vi.resetModules();
	});

	it("reads no settings when it is imported", async (): Promise<void> => {
		vi.doMock(ENV_PATH, envThatThrows);

		const module = await import("#/platform/observability/logger.ts");

		expect((): unknown => module.logger.level).toThrow(SETTINGS_READ);
	});

	it("builds the logger from the settings on first use", async (): Promise<void> => {
		vi.doMock(ENV_PATH, envOf);

		const module = await import("#/platform/observability/logger.ts");

		expect(module.logger.level).toBe(LOGGER_LEVEL.WARN);
		expect(module.logger.child({ job: "x" }).level).toBe(LOGGER_LEVEL.WARN);
	});

	it("passes a level change through to the logger", async (): Promise<void> => {
		vi.doMock(ENV_PATH, envOf);

		const module = await import("#/platform/observability/logger.ts");
		module.logger.level = LOGGER_LEVEL.ERROR;

		expect(module.logger.level).toBe(LOGGER_LEVEL.ERROR);
		expect(module.logger.isLevelEnabled(LOGGER_LEVEL.WARN)).toBe(false);
	});
});
