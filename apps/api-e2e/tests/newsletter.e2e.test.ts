import { ACTIVITY_ACTION, ACTIVITY_DETAIL } from "@app/activity";
import { ROUTE_PATH } from "@app/contract";
import {
	NEWSLETTER_SOURCE,
	NEWSLETTER_STATUS,
	type TNewsletterSubscriberList,
} from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { beforeAll, describe, expect, it } from "vitest";
import { apiFetch, apiJson } from "../support/api-fetch.ts";
import { SEED_CREDENTIALS, signIn } from "../support/sign-in.ts";

const NO_COOKIE = "";
const UNAUTHORIZED = 401;
const FORBIDDEN = 403;
const BAD_REQUEST = 400;
const OK = 200;

type TActivityPage = {
	items: { resourceId: string; metadata: Record<string, string> }[];
};

let adminCookie = "";
let viewerCookie = "";

const addressOf = (label: string): string =>
	`newsletter-${label}-${crypto.randomUUID()}@example.com`;

const subscribe = (email: string): Promise<Response> =>
	apiFetch({
		path: ROUTE_PATH.NEWSLETTER_SUBSCRIPTIONS,
		cookie: NO_COOKIE,
		method: "POST",
		body: { email, source: NEWSLETTER_SOURCE.BLOG },
	});

const subscribersMatching = (
	search: string,
): Promise<TNewsletterSubscriberList> =>
	apiJson<TNewsletterSubscriberList>({
		path: `${ROUTE_PATH.NEWSLETTER_SUBSCRIBERS}?page=1&pageSize=20&search=${encodeURIComponent(search)}`,
		cookie: adminCookie,
	});

beforeAll(async (): Promise<void> => {
	adminCookie = await signIn(SEED_CREDENTIALS.admin);
	viewerCookie = await signIn(SEED_CREDENTIALS.viewer);
});

describe("newsletter endpoints", () => {
	it("takes a sign-up from anyone and answers a repeat the same way", async (): Promise<void> => {
		const email = addressOf("repeat");
		const first = await subscribe(email.toUpperCase());
		const second = await subscribe(email);

		expect(first.status).toBe(OK);
		expect(await first.json()).toEqual({ email });
		expect(second.status).toBe(OK);
		expect(await second.json()).toEqual({ email });

		const list = await subscribersMatching(email);
		expect(list.total).toBe(1);
		expect(list.items[0]).toMatchObject({
			email,
			status: NEWSLETTER_STATUS.PENDING,
			source: NEWSLETTER_SOURCE.BLOG,
		});
	});

	it("rejects an address that is not an email", async (): Promise<void> => {
		const response = await subscribe("not-an-email");

		expect(response.status).toBe(BAD_REQUEST);
	});

	it("keeps the subscriber list to those who may read it", async (): Promise<void> => {
		const path = `${ROUTE_PATH.NEWSLETTER_SUBSCRIBERS}?page=1&pageSize=20`;

		expect((await apiFetch({ path, cookie: NO_COOKIE })).status).toBe(
			UNAUTHORIZED,
		);
		expect((await apiFetch({ path, cookie: viewerCookie })).status).toBe(
			FORBIDDEN,
		);
	});

	it("lets an admin remove a subscriber and records which address went", async (): Promise<void> => {
		const email = addressOf("removed");
		await subscribe(email);
		const [subscriber] = (await subscribersMatching(email)).items;
		const id = subscriber?.id ?? "";

		const removed = await apiFetch({
			path: `${ROUTE_PATH.NEWSLETTER_SUBSCRIBERS}/${id}`,
			cookie: adminCookie,
			method: "DELETE",
		});
		const activity = await apiJson<TActivityPage>({
			path: `/activity?page=1&pageSize=50&action=${ACTIVITY_ACTION.NEWSLETTER_SUBSCRIBER_DELETE}`,
			cookie: adminCookie,
		});

		expect(removed.status).toBe(OK);
		expect((await subscribersMatching(email)).total).toBe(0);
		expect(
			A.some(
				activity.items,
				(entry) =>
					entry.resourceId === id &&
					entry.metadata[ACTIVITY_DETAIL.EMAIL] === email,
			),
		).toBe(true);
	});
});
