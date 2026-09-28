import { spawn, type ChildProcess } from "node:child_process";
import { PERMISSION, ROLE } from "@app/permissions";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { BASE_URL } from "../support/client.ts";
import { apiEnv } from "../support/services.ts";
import { SEED_CREDENTIALS, signIn } from "../support/sign-in.ts";

const JWT_PORT = 3110;
const JWT_BASE_URL = `http://127.0.0.1:${JWT_PORT}`;
const TOKEN_PATH = "/api/auth/token";
const JWKS_PATH = "/api/auth/jwks";
const SESSION_PATH = "/api/auth/get-session";
const LIVENESS_PATH = "/healthz";
const JWT_HEADER = "set-auth-jwt";
const SESSION_TOKEN_HEADER = "set-auth-token";
const TOKEN_LIFETIME_SECONDS = 15 * 60;
const TOKEN_SEPARATOR = ".";
const TAMPERED_SIGNATURE = "AAAA";
const POLL_MS = 300;
const DEADLINE_MS = 20_000;
const HTTP_OK = 200;
const HTTP_UNAUTHORIZED = 401;
const HTTP_NOT_FOUND = 404;

type TTokenBody = { token: string };

let apiProcess: ChildProcess | undefined;
let adminCookie = "";

const waitForLiveness = async (): Promise<void> => {
	const deadline = Date.now() + DEADLINE_MS;

	while (Date.now() < deadline) {
		const alive = await fetch(`${JWT_BASE_URL}${LIVENESS_PATH}`)
			.then((response) => response.ok)
			.catch(() => false);

		if (alive) {
			return;
		}

		await new Promise((resolve) => setTimeout(resolve, POLL_MS));
	}

	throw new Error(`api with JWT issuing never became live at ${JWT_BASE_URL}`);
};

const tokenFetch = async (): Promise<string> => {
	const response = await fetch(`${JWT_BASE_URL}${TOKEN_PATH}`, {
		headers: { cookie: adminCookie },
	});
	const body = (await response.json()) as TTokenBody;
	return body.token;
};

const keySet = createRemoteJWKSet(new URL(`${JWT_BASE_URL}${JWKS_PATH}`));

const verify = (token: string): ReturnType<typeof jwtVerify> =>
	jwtVerify(token, keySet, { issuer: JWT_BASE_URL, audience: JWT_BASE_URL });

beforeAll(async (): Promise<void> => {
	apiProcess = spawn(
		"pnpm",
		["--filter", "@app/api", "exec", "node", "src/main.ts"],
		{
			cwd: new URL("../../..", import.meta.url).pathname,
			env: apiEnv({
				PORT: String(JWT_PORT),
				BETTER_AUTH_URL: JWT_BASE_URL,
				AUTH_JWT_ENABLED: "true",
			}),
			stdio: "ignore",
			detached: true,
		},
	);

	await waitForLiveness();
	adminCookie = await signIn(SEED_CREDENTIALS.admin);
});

afterAll((): void => {
	const pid = apiProcess?.pid;

	if (pid !== undefined) {
		try {
			process.kill(-pid);
		} catch {}
	}
});

describe("JWT for other apps", () => {
	it("issues no token while JWT issuing is left at its default", async (): Promise<void> => {
		const response = await fetch(`${BASE_URL}${TOKEN_PATH}`, {
			headers: { cookie: adminCookie },
		});

		expect(response.status).toBe(HTTP_NOT_FOUND);
	});

	it("issues a token that verifies against the published keys", async (): Promise<void> => {
		const { payload } = await verify(await tokenFetch());

		expect(payload.role).toBe(ROLE.ADMIN);
		expect(payload.permissions).toEqual(
			expect.arrayContaining([PERMISSION.USER_MANAGE]),
		);
		expect((payload.exp ?? 0) - (payload.iat ?? 0)).toBe(
			TOKEN_LIFETIME_SECONDS,
		);
	});

	it("rejects a token whose signature was tampered with", async (): Promise<void> => {
		const [header, payload] = (await tokenFetch()).split(TOKEN_SEPARATOR);
		const forged = [header, payload, TAMPERED_SIGNATURE].join(TOKEN_SEPARATOR);

		await expect(verify(forged)).rejects.toThrow();
	});

	it("refuses a token to a caller without a session", async (): Promise<void> => {
		const response = await fetch(`${JWT_BASE_URL}${TOKEN_PATH}`);

		expect(response.status).toBe(HTTP_UNAUTHORIZED);
	});

	it("exposes neither a JWT nor the session token on a session read", async (): Promise<void> => {
		const response = await fetch(`${JWT_BASE_URL}${SESSION_PATH}`, {
			headers: { cookie: adminCookie },
		});

		expect(response.status).toBe(HTTP_OK);
		expect(response.headers.get(JWT_HEADER)).toBeNull();
		expect(response.headers.get(SESSION_TOKEN_HEADER)).toBeNull();
	});
});
