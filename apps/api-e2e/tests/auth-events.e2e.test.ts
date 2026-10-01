import { ACTIVITY_ACTION, type TActivityAction } from "@app/activity";
import type { TActivityList } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { beforeAll, describe, expect, it } from "vitest";
import { apiJson } from "../support/api-fetch.ts";
import { BASE_URL } from "../support/client.ts";
import { mailCount, mailLinkWait } from "../support/mailpit.ts";
import { SEED_CREDENTIALS, signIn } from "../support/sign-in.ts";

const WEB_ORIGIN = "http://localhost:5173";
const PASSWORD = "Strong1pass";
const NEW_PASSWORD = "Newer2pass";
const VERIFY_LINK = /https?:\/\/\S+verify-email\S+/;
const CHANGED_LINK = /https?:\/\/\S+forgot-password\S*/;

type TEntry = TActivityList["items"][number];

let adminCookie = "";
let userId = "";
const email = `events-${crypto.randomUUID().slice(0, 8)}@test.app`;

const authPost = (path: string, body: object, cookie = ""): Promise<Response> =>
	fetch(`${BASE_URL}/api/auth${path}`, {
		method: "POST",
		headers: { "Content-Type": "application/json", origin: WEB_ORIGIN, cookie },
		body: JSON.stringify(body),
	});

const entriesFor = async (
	action: TActivityAction,
): Promise<readonly TEntry[]> =>
	(
		await apiJson<TActivityList>({
			path: `/activity?page=1&pageSize=100&action=${action}`,
			cookie: adminCookie,
		})
	).items;

const loggedFor = async (
	action: TActivityAction,
	matches: (entry: TEntry) => boolean,
): Promise<boolean> => A.some(await entriesFor(action), matches);

beforeAll(async (): Promise<void> => {
	adminCookie = await signIn(SEED_CREDENTIALS.admin);
	const signedUp = await authPost("/sign-up/email", {
		name: "Event Tester",
		email,
		password: PASSWORD,
		callbackURL: `${WEB_ORIGIN}/verify-email`,
	});
	userId = ((await signedUp.json()) as { user: { id: string } }).user.id;
	await fetch(await mailLinkWait(email, VERIFY_LINK), { redirect: "manual" });
});

describe("auth events in the activity log", () => {
	it("records the sign-up and the email confirmation", async (): Promise<void> => {
		const ownEntry = (entry: TEntry): boolean => entry.resourceId === userId;

		expect(await loggedFor(ACTIVITY_ACTION.USER_SIGN_UP, ownEntry)).toBe(true);
		expect(await loggedFor(ACTIVITY_ACTION.USER_EMAIL_VERIFY, ownEntry)).toBe(
			true,
		);
	});

	it("records a failed sign-in against the email that was tried", async (): Promise<void> => {
		await authPost("/sign-in/email", { email, password: "Wrong1pass" });

		expect(
			await loggedFor(
				ACTIVITY_ACTION.SESSION_FAIL,
				(entry) => entry.resourceId === email && entry.actorId === null,
			),
		).toBe(true);
	});

	it("records a profile change, a password change and the sign-out, and mails the password change", async (): Promise<void> => {
		const cookie = await signIn({ email, password: PASSWORD });
		const before = await mailCount(email);

		await authPost("/update-user", { name: "Event Renamed" }, cookie);
		const changed = await authPost(
			"/change-password",
			{ currentPassword: PASSWORD, newPassword: NEW_PASSWORD },
			cookie,
		);
		expect(changed.status).toBe(200);
		await authPost("/sign-out", {}, cookie);

		const byUser = (entry: TEntry): boolean => entry.actorId === userId;
		expect(await loggedFor(ACTIVITY_ACTION.USER_PROFILE_UPDATE, byUser)).toBe(
			true,
		);
		expect(await loggedFor(ACTIVITY_ACTION.USER_PASSWORD_CHANGE, byUser)).toBe(
			true,
		);
		expect(await loggedFor(ACTIVITY_ACTION.SESSION_DELETE, byUser)).toBe(true);
		expect(await mailLinkWait(email, CHANGED_LINK, before)).toContain(
			"/forgot-password",
		);
	});
});
