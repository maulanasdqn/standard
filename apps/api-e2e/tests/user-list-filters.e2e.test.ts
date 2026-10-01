import { USER_STATUS, type TUserList } from "@app/schemas";
import { A } from "@mobily/ts-belt";
import { beforeAll, describe, expect, it } from "vitest";
import { apiJson } from "../support/api-fetch.ts";
import { SEED_CREDENTIALS, signIn } from "../support/sign-in.ts";

const ONE_HOUR_MS = 3_600_000;

let adminCookie = "";
const email = `filter-user-${crypto.randomUUID().slice(0, 8)}@test.app`;

const emails = async (
	query: Record<string, string>,
): Promise<readonly string[]> => {
	const params = new URLSearchParams({ page: "1", pageSize: "100", ...query });
	const list = await apiJson<TUserList>({
		path: `/users?${params}`,
		cookie: adminCookie,
	});
	return A.map(list.items, (item) => item.email);
};

const hourFromNow = (hours: number): string =>
	new Date(Date.now() + hours * ONE_HOUR_MS).toISOString();

beforeAll(async (): Promise<void> => {
	adminCookie = await signIn(SEED_CREDENTIALS.admin);
	await apiJson({
		path: "/users/invite",
		cookie: adminCookie,
		method: "POST",
		body: { name: "Filter User", email, role: "viewer" },
	});
});

describe("user list filters", () => {
	it("finds an invited user under pending, not under active", async (): Promise<void> => {
		expect(await emails({ status: USER_STATUS.PENDING })).toContain(email);
		expect(await emails({ status: USER_STATUS.ACTIVE })).not.toContain(email);
		expect(await emails({ status: USER_STATUS.ACTIVE })).toContain(
			SEED_CREDENTIALS.admin.email,
		);
	});

	it("narrows by role and by created date", async (): Promise<void> => {
		expect(await emails({ role: "viewer", search: email })).toEqual([email]);
		expect(await emails({ role: "admin", search: email })).toEqual([]);
		expect(
			await emails({
				search: email,
				dateFrom: hourFromNow(-1),
				dateTo: hourFromNow(1),
			}),
		).toEqual([email]);
		expect(await emails({ search: email, dateTo: hourFromNow(-1) })).toEqual(
			[],
		);
	});

	it("separates users by two-factor", async (): Promise<void> => {
		expect(await emails({ search: email, twoFactor: "off" })).toEqual([email]);
		expect(await emails({ search: email, twoFactor: "on" })).toEqual([]);
	});
});
