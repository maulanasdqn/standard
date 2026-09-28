import { PERMISSION } from "@app/permissions";
import type { TRoleCreateInput, TUser, TUserCreateInput } from "@app/schemas";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { apiFetch, apiJson } from "../support/api-fetch.ts";
import { SEED_CREDENTIALS, signIn } from "../support/sign-in.ts";

const HTTP_OK = 200;
const HTTP_FORBIDDEN = 403;
const ROLE_KEY = "e2e-user-reader";

const USER_READER_ROLE: TRoleCreateInput = {
	key: ROLE_KEY,
	label: "User Reader",
	permissions: [PERMISSION.USER_READ],
};

const USER_READER: TUserCreateInput = {
	name: "E2E User Reader",
	email: "e2e-user-reader@test.app",
	password: "readerPassword123",
	role: ROLE_KEY,
};

const ANOTHER_USER: TUserCreateInput = {
	name: "E2E Not Created",
	email: "e2e-not-created@test.app",
	password: "notCreated123",
	role: ROLE_KEY,
};

let adminCookie = "";
let readerCookie = "";
let reader: TUser;

beforeAll(async (): Promise<void> => {
	adminCookie = await signIn(SEED_CREDENTIALS.admin);
	await apiJson({
		path: "/roles",
		cookie: adminCookie,
		method: "POST",
		body: USER_READER_ROLE,
	});
	reader = await apiJson<TUser>({
		path: "/users",
		cookie: adminCookie,
		method: "POST",
		body: USER_READER,
	});
	readerCookie = await signIn({
		email: USER_READER.email,
		password: USER_READER.password,
	});
});

afterAll(async (): Promise<void> => {
	await apiFetch({
		path: `/users/${reader.id}`,
		cookie: adminCookie,
		method: "DELETE",
	});
	await apiFetch({
		path: `/roles/${ROLE_KEY}`,
		cookie: adminCookie,
		method: "DELETE",
	});
});

describe("a role granting only user:read", () => {
	it("lists and reads users", async (): Promise<void> => {
		const list = await apiFetch({
			path: "/users?page=1&pageSize=5",
			cookie: readerCookie,
		});
		expect(list.status).toBe(HTTP_OK);

		const one = await apiFetch({
			path: `/users/${reader.id}`,
			cookie: readerCookie,
		});
		expect(one.status).toBe(HTTP_OK);
	});

	it("cannot create, update or delete a user", async (): Promise<void> => {
		const create = await apiFetch({
			path: "/users",
			cookie: readerCookie,
			method: "POST",
			body: ANOTHER_USER,
		});
		expect(create.status).toBe(HTTP_FORBIDDEN);

		const update = await apiFetch({
			path: `/users/${reader.id}`,
			cookie: readerCookie,
			method: "PATCH",
			body: { name: "Renamed" },
		});
		expect(update.status).toBe(HTTP_FORBIDDEN);

		const remove = await apiFetch({
			path: `/users/${reader.id}`,
			cookie: readerCookie,
			method: "DELETE",
		});
		expect(remove.status).toBe(HTTP_FORBIDDEN);
	});

	it("cannot read roles, which role:read governs", async (): Promise<void> => {
		const roles = await apiFetch({ path: "/roles", cookie: readerCookie });
		expect(roles.status).toBe(HTTP_FORBIDDEN);
	});
});
