import { spawn, type ChildProcess } from "node:child_process";
import { execSync } from "node:child_process";

const E2E_PORT = 3107;
const BASE_DATABASE_URL = process.env.DATABASE_URL ?? "postgres://app:app@localhost:5432/app";
const E2E_DATABASE_URL = BASE_DATABASE_URL.replace(/\/[^/]+$/, "/app_e2e");
const HEALTH_URL = `http://127.0.0.1:${E2E_PORT}/healthz`;

let apiProcess: ChildProcess | undefined;

const waitForHealth = async (timeoutMs = 15_000): Promise<void> => {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		try {
			const response = await fetch(HEALTH_URL);
			if (response.ok) {
				return;
			}
		} catch {}
		await new Promise((resolve) => setTimeout(resolve, 300));
	}
	throw new Error(`API did not become healthy at ${HEALTH_URL} within ${timeoutMs}ms`);
};

const env = {
	...process.env,
	NODE_ENV: "test",
	PORT: String(E2E_PORT),
	DATABASE_URL: E2E_DATABASE_URL,
	REDIS_URL: process.env.REDIS_URL ?? "redis://localhost:6379",
	BETTER_AUTH_URL: `http://127.0.0.1:${E2E_PORT}`,
	BETTER_AUTH_SECRET: "e2e-test-secret-please-do-not-use-in-prod",
	WEB_ORIGIN: "http://localhost:5173",
};

export const setup = async (): Promise<void> => {
	const dbName = new URL(E2E_DATABASE_URL).pathname.slice(1);
	const adminUrl = BASE_DATABASE_URL.replace(/\/[^/]+$/, "/postgres");

	execSync(
		`psql "${adminUrl}" -c "DROP DATABASE IF EXISTS ${dbName}" -c "CREATE DATABASE ${dbName}"`,
		{ stdio: "ignore" },
	);

	execSync("pnpm --filter @app/api exec drizzle-kit migrate", {
		cwd: new URL("../../api", import.meta.url).pathname,
		env,
		stdio: "inherit",
	});

	execSync("pnpm --filter @app/api run db:seed", {
		cwd: new URL("../../..", import.meta.url).pathname,
		env,
		stdio: "inherit",
	});

	apiProcess = spawn("pnpm", ["--filter", "@app/api", "exec", "tsx", "src/main.ts"], {
		cwd: new URL("../../..", import.meta.url).pathname,
		env,
		stdio: "inherit",
	});

	await waitForHealth();
};

export const teardown = (): void => {
	apiProcess?.kill();
};
