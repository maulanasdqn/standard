import type { TUser, TUserSessionList } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { beforeAll, describe, expect, it } from "vitest";
import { apiFetch, apiJson } from "../support/api-fetch.ts";
import { BASE_URL } from "../support/client.ts";
import { mailCount, mailLinkWait } from "../support/mailpit.ts";
import { SEED_CREDENTIALS, signIn } from "../support/sign-in.ts";

const WEB_ORIGIN = "http://localhost:5173";
const PASSWORD = "Invited1pass";
const INVITE_LINK = /https?:\/\/\S+reset-password\/\S+/;

const HTTP_STATUS = {
	OK: 200,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
} as const;

let adminCookie = "";
let invited: TUser;
const email = `admin-flow-${crypto.randomUUID().slice(0, 8)}@test.app`;

const authPost = (path: string, body: object): Promise<Response> =>
	fetch(`${BASE_URL}/api/auth${path}`, {
		method: "POST",
		headers: { "Content-Type": "application/json", origin: WEB_ORIGIN },
		body: JSON.stringify(body),
	});

const errorCode = async (response: Response): Promise<string> =>
	((await response.json()) as { code: string }).code;

const acceptInvite = async (to: string): Promise<void> => {
	const landing = await fetch(await mailLinkWait(to, INVITE_LINK), {
		redirect: "manual",
	});
	const target = new URL(landing.headers.get("location") ?? "");
	expect(target.searchParams.get("invite")).toBe("true");
	const reset = await authPost("/reset-password", {
		newPassword: PASSWORD,
		token: target.searchParams.get("token"),
	});
	expect(reset.status).toBe(HTTP_STATUS.OK);
};

beforeAll(async (): Promise<void> => {
	adminCookie = await signIn(SEED_CREDENTIALS.admin);
	invited = await apiJson<TUser>({
		path: "/users/invite",
		cookie: adminCookie,
		method: "POST",
		body: { name: "Invited", email, role: "viewer" },
	});
});

describe("admin user tools", () => {
	it("invites a user who sets their own password and signs in", async (): Promise<void> => {
		expect(invited.emailVerified).toBe(false);
		await acceptInvite(email);

		expect(
			(await authPost("/sign-in/email", { email, password: PASSWORD })).status,
		).toBe(HTTP_STATUS.OK);
	});

	it("lists the user's sessions and signs one out", async (): Promise<void> => {
		const userCookie = await signIn({ email, password: PASSWORD });
		const sessions = await apiJson<TUserSessionList>({
			path: `/users/${invited.id}/sessions`,
			cookie: adminCookie,
		});
		expect(sessions.length).toBeGreaterThan(0);

		const revoked = await Promise.all(
			A.map(sessions, (session) =>
				apiFetch({
					path: `/users/${invited.id}/sessions/${session.id}`,
					cookie: adminCookie,
					method: "DELETE",
				}),
			),
		);
		expect(A.every(revoked, (response) => response.ok)).toBe(true);
		const after = await apiFetch({ path: "/me", cookie: userCookie });
		expect(after.status).toBe(HTTP_STATUS.UNAUTHORIZED);
	});

	it("deactivates a user, ending their sessions and blocking sign-in, then reactivates them", async (): Promise<void> => {
		const userCookie = await signIn({ email, password: PASSWORD });
		const before = await mailCount(email);

		const deactivated = await apiJson<TUser>({
			path: `/users/${invited.id}/deactivate`,
			cookie: adminCookie,
			method: "POST",
			body: {},
		});
		expect(deactivated.deactivatedAt).not.toBeNull();
		expect((await apiFetch({ path: "/me", cookie: userCookie })).status).toBe(
			HTTP_STATUS.UNAUTHORIZED,
		);
		const blocked = await authPost("/sign-in/email", {
			email,
			password: PASSWORD,
		});
		expect(blocked.status).toBe(HTTP_STATUS.FORBIDDEN);
		expect(await errorCode(blocked)).toBe("ACCOUNT_DEACTIVATED");
		expect(await mailCount(email)).toBeGreaterThan(before);

		await apiFetch({
			path: `/users/${invited.id}/reactivate`,
			cookie: adminCookie,
			method: "POST",
			body: {},
		});
		expect(
			(await authPost("/sign-in/email", { email, password: PASSWORD })).status,
		).toBe(HTTP_STATUS.OK);
	});

	it("makes a changed email confirm itself before the user can sign in", async (): Promise<void> => {
		const moved = `moved-${email}`;
		const updated = await apiJson<TUser>({
			path: `/users/${invited.id}`,
			cookie: adminCookie,
			method: "PATCH",
			body: { id: invited.id, email: moved },
		});
		expect(updated.email).toBe(moved);
		expect(updated.emailVerified).toBe(false);

		const blocked = await authPost("/sign-in/email", {
			email: moved,
			password: PASSWORD,
		});
		expect(await errorCode(blocked)).toBe("EMAIL_NOT_VERIFIED");
		await mailLinkWait(moved, /verify-email/);
	});

	it("refuses to let an admin deactivate themselves", async (): Promise<void> => {
		const me = await apiJson<{ user: { id: string } }>({
			path: "/me",
			cookie: adminCookie,
		});
		const response = await apiFetch({
			path: `/users/${me.user.id}/deactivate`,
			cookie: adminCookie,
			method: "POST",
			body: {},
		});

		expect(response.status).toBe(HTTP_STATUS.FORBIDDEN);
	});

	it("refuses the admin tools to a member without user:update", async (): Promise<void> => {
		const memberCookie = await signIn(SEED_CREDENTIALS.member);
		const response = await apiFetch({
			path: `/users/${invited.id}/deactivate`,
			cookie: memberCookie,
			method: "POST",
			body: {},
		});

		expect(response.status).toBe(HTTP_STATUS.FORBIDDEN);
	});
});
