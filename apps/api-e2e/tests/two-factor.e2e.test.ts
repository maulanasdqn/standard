import type { TUser } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { beforeAll, describe, expect, it } from "vitest";
import { apiFetch, apiJson } from "../support/api-fetch.ts";
import { BASE_URL } from "../support/client.ts";
import { mailCount, mailLinkWait } from "../support/mailpit.ts";
import { SEED_CREDENTIALS, signIn } from "../support/sign-in.ts";
import { totpCode, totpSecretOf } from "../support/totp.ts";

const WEB_ORIGIN = "http://localhost:5173";
const PASSWORD = "Strong1pass";
const VERIFY_LINK = /https?:\/\/\S+verify-email\S+/;
const ACCOUNT_LINK = /https?:\/\/\S+\/account\b/;

type TEnabled = { totpURI: string; backupCodes: string[] };

let adminCookie = "";
let userId = "";
let secret = "";
let backupCodes: readonly string[] = [];
const email = `two-factor-${crypto.randomUUID().slice(0, 8)}@test.app`;

const authPost = (path: string, body: object, cookie = ""): Promise<Response> =>
	fetch(`${BASE_URL}/api/auth${path}`, {
		method: "POST",
		headers: { "Content-Type": "application/json", origin: WEB_ORIGIN, cookie },
		body: JSON.stringify(body),
	});

const SESSION_COOKIE = /session_token=[^;]+/;

const cookieHeaderOf = (response: Response): string =>
	A.join(
		A.filter(
			A.map(
				response.headers.getSetCookie(),
				(line) => line.split(";")[0] ?? "",
			),
			(pair) => !pair.endsWith("="),
		),
		"; ",
	);

const challenge = async (): Promise<{ cookie: string; body: unknown }> => {
	const response = await authPost("/sign-in/email", {
		email,
		password: PASSWORD,
	});
	return { cookie: cookieHeaderOf(response), body: await response.json() };
};

beforeAll(async (): Promise<void> => {
	adminCookie = await signIn(SEED_CREDENTIALS.admin);
	const signedUp = await authPost("/sign-up/email", {
		name: "Two Factor",
		email,
		password: PASSWORD,
		callbackURL: `${WEB_ORIGIN}/verify-email`,
	});
	userId = ((await signedUp.json()) as { user: { id: string } }).user.id;
	await fetch(await mailLinkWait(email, VERIFY_LINK), { redirect: "manual" });

	const cookie = await signIn({ email, password: PASSWORD });
	const enabled = (await (
		await authPost("/two-factor/enable", { password: PASSWORD }, cookie)
	).json()) as TEnabled;
	secret = totpSecretOf(enabled.totpURI);
	backupCodes = enabled.backupCodes;
	const verified = await authPost(
		"/two-factor/verify-totp",
		{ code: totpCode(secret) },
		cookie,
	);
	expect(verified.status).toBe(200);
});

describe("two-factor authentication", () => {
	it("asks for a code after the password and only then signs the user in", async (): Promise<void> => {
		const started = await challenge();
		expect(started.body).toEqual(
			expect.objectContaining({ twoFactorRedirect: true }),
		);
		expect(started.cookie).not.toMatch(SESSION_COOKIE);

		const verified = await authPost(
			"/two-factor/verify-totp",
			{ code: totpCode(secret) },
			started.cookie,
		);
		expect(verified.status).toBe(200);
		expect(cookieHeaderOf(verified)).toMatch(SESSION_COOKIE);
	});

	it("accepts a backup code once and refuses it the second time", async (): Promise<void> => {
		const [code] = backupCodes;
		const first = await challenge();
		const accepted = await authPost(
			"/two-factor/verify-backup-code",
			{ code },
			first.cookie,
		);
		expect(accepted.status).toBe(200);

		const second = await challenge();
		const reused = await authPost(
			"/two-factor/verify-backup-code",
			{ code },
			second.cookie,
		);
		expect(reused.status).not.toBe(200);
	});

	it("lets an admin turn it off for a locked out user and tells them", async (): Promise<void> => {
		const before = await mailCount(email);
		const reset = await apiJson<TUser>({
			path: `/users/${userId}/two-factor`,
			cookie: adminCookie,
			method: "DELETE",
		});
		expect(reset.twoFactorEnabled).toBe(false);

		const plain = await challenge();
		expect(plain.cookie).toMatch(SESSION_COOKIE);
		expect(await mailLinkWait(email, ACCOUNT_LINK, before)).toContain(
			"/account",
		);
	});

	it("refuses the reset to an admin for their own account", async (): Promise<void> => {
		const me = await apiJson<{ user: { id: string } }>({
			path: "/me",
			cookie: adminCookie,
		});
		const response = await apiFetch({
			path: `/users/${me.user.id}/two-factor`,
			cookie: adminCookie,
			method: "DELETE",
		});

		expect(response.status).toBe(403);
	});
});
