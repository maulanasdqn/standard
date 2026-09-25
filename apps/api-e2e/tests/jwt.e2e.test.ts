import { PERMISSION, ROLE } from "@app/permissions";
import { beforeAll, describe, expect, it } from "vitest";
import { BASE_URL } from "../support/client.ts";
import { SEED_CREDENTIALS, signIn } from "../support/sign-in.ts";

const TOKEN_PATH = "/api/auth/token";
const JWKS_PATH = "/api/auth/jwks";
const HTTP_OK = 200;
const HTTP_UNAUTHORIZED = 401;
const TOKEN_SEPARATOR = ".";
const PAYLOAD_INDEX = 1;

type TJwtPayload = {
	sub: string;
	iss: string;
	exp: number;
	role: string;
	permissions: readonly string[];
};

const payloadOf = (token: string): TJwtPayload => {
	const encoded = token.split(TOKEN_SEPARATOR)[PAYLOAD_INDEX] ?? "";
	return JSON.parse(
		Buffer.from(encoded, "base64url").toString("utf8"),
	) as TJwtPayload;
};

let adminCookie = "";

beforeAll(async (): Promise<void> => {
	adminCookie = await signIn(SEED_CREDENTIALS.admin);
});

describe("JWT for other apps", () => {
	it("issues a token carrying the role and the resolved permissions", async (): Promise<void> => {
		const response = await fetch(`${BASE_URL}${TOKEN_PATH}`, {
			headers: { cookie: adminCookie },
		});
		const { token } = (await response.json()) as { token: string };
		const payload = payloadOf(token);

		expect(response.status).toBe(HTTP_OK);
		expect(payload.iss).toBe(BASE_URL);
		expect(payload.role).toBe(ROLE.ADMIN);
		expect(payload.permissions).toEqual(
			expect.arrayContaining([PERMISSION.USER_MANAGE]),
		);
		expect(payload.exp * 1000).toBeGreaterThan(Date.now());
	});

	it("refuses a token to a caller without a session", async (): Promise<void> => {
		const response = await fetch(`${BASE_URL}${TOKEN_PATH}`);

		expect(response.status).toBe(HTTP_UNAUTHORIZED);
	});

	it("publishes the verification keys", async (): Promise<void> => {
		const response = await fetch(`${BASE_URL}${JWKS_PATH}`);
		const { keys } = (await response.json()) as {
			keys: readonly { kid: string; kty: string }[];
		};

		expect(response.status).toBe(HTTP_OK);
		expect(keys.length).toBeGreaterThan(0);
		expect(keys[0]?.kty).toBeTruthy();
	});
});
