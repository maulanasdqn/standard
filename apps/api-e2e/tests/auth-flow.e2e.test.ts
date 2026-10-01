import { describe, expect, it } from "vitest";
import { BASE_URL } from "../support/client.ts";
import { mailCount, mailLinkWait } from "../support/mailpit.ts";

const WEB_ORIGIN = "http://localhost:5173";
const STRONG_PASSWORD = "Strong1pass";
const NEWER_PASSWORD = "Newer2pass";
const VERIFY_LINK = /https?:\/\/\S+verify-email\S+/;
const RESET_LINK = /https?:\/\/\S+reset-password\/\S+/;

const HTTP_STATUS = {
	OK: 200,
	FOUND: 302,
	BAD_REQUEST: 400,
	FORBIDDEN: 403,
} as const;

const authPost = (path: string, body: object): Promise<Response> =>
	fetch(`${BASE_URL}/api/auth${path}`, {
		method: "POST",
		headers: { "Content-Type": "application/json", origin: WEB_ORIGIN },
		body: JSON.stringify(body),
	});

const signUp = (email: string, password: string): Promise<Response> =>
	authPost("/sign-up/email", {
		name: "Flow Tester",
		email,
		password,
		callbackURL: `${WEB_ORIGIN}/verify-email`,
	});

const signIn = (email: string, password: string): Promise<Response> =>
	authPost("/sign-in/email", { email, password });

const uniqueEmail = (): string =>
	`flow-${crypto.randomUUID().slice(0, 8)}@test.app`;

const verify = async (email: string): Promise<Response> =>
	fetch(await mailLinkWait(email, VERIFY_LINK), { redirect: "manual" });

describe("self-service sign-up", () => {
	it("refuses a password that breaks the rules", async (): Promise<void> => {
		const response = await signUp(uniqueEmail(), "weakpass");
		const body = (await response.json()) as { code: string };

		expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
		expect(body.code).toBe("PASSWORD_TOO_WEAK");
	});

	it("blocks sign-in until the email is confirmed, then lets the user in", async (): Promise<void> => {
		const email = uniqueEmail();
		expect((await signUp(email, STRONG_PASSWORD)).status).toBe(HTTP_STATUS.OK);

		const blocked = await signIn(email, STRONG_PASSWORD);
		expect(blocked.status).toBe(HTTP_STATUS.FORBIDDEN);
		expect(((await blocked.json()) as { code: string }).code).toBe(
			"EMAIL_NOT_VERIFIED",
		);

		const verified = await verify(email);
		expect(verified.status).toBe(HTTP_STATUS.FOUND);
		expect(verified.headers.get("location")).toBe(`${WEB_ORIGIN}/verify-email`);
		expect(verified.headers.get("set-cookie")).toContain("session_token");

		expect((await signIn(email, STRONG_PASSWORD)).status).toBe(HTTP_STATUS.OK);
	});
});

describe("forgotten password", () => {
	it("resets the password through the emailed link, and the link works once", async (): Promise<void> => {
		const email = uniqueEmail();
		await signUp(email, STRONG_PASSWORD);
		await verify(email);
		const before = await mailCount(email);

		const requested = await authPost("/request-password-reset", {
			email,
			redirectTo: `${WEB_ORIGIN}/reset-password`,
		});
		expect(requested.status).toBe(HTTP_STATUS.OK);

		const link = await mailLinkWait(email, RESET_LINK, before);
		const landing = await fetch(link, { redirect: "manual" });
		const token = new URL(
			landing.headers.get("location") ?? "",
		).searchParams.get("token");
		expect(token).toBeTruthy();

		const reset = await authPost("/reset-password", {
			newPassword: NEWER_PASSWORD,
			token,
		});
		expect(reset.status).toBe(HTTP_STATUS.OK);
		expect((await signIn(email, STRONG_PASSWORD)).status).not.toBe(
			HTTP_STATUS.OK,
		);
		expect((await signIn(email, NEWER_PASSWORD)).status).toBe(HTTP_STATUS.OK);

		const reused = await authPost("/reset-password", {
			newPassword: "Another3pass",
			token,
		});
		expect(((await reused.json()) as { code: string }).code).toBe(
			"INVALID_TOKEN",
		);
	});

	it("answers the same way for an email that has no account", async (): Promise<void> => {
		const response = await authPost("/request-password-reset", {
			email: uniqueEmail(),
			redirectTo: `${WEB_ORIGIN}/reset-password`,
		});

		expect(response.status).toBe(HTTP_STATUS.OK);
	});
});
