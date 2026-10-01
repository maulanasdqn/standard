import { ROLE } from "@app/permissions";
import { type TUser, USER_STATUS } from "@app/schemas";
import { describe, expect, it } from "vitest";
import { userStatusOf } from "#/routes/_authenticated/users/_utils/user-status.ts";

const user: TUser = {
	id: "11111111-1111-4111-8111-111111111111",
	name: "Ada",
	email: "ada@test.app",
	emailVerified: true,
	image: null,
	role: ROLE.MEMBER,
	deactivatedAt: null,
	twoFactorEnabled: false,
	createdAt: "2026-01-01T00:00:00.000Z",
	updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("userStatusOf", () => {
	it("calls a confirmed, active user active", (): void => {
		expect(userStatusOf(user)).toBe(USER_STATUS.ACTIVE);
	});

	it("calls an unconfirmed user pending", (): void => {
		expect(userStatusOf({ ...user, emailVerified: false })).toBe(
			USER_STATUS.PENDING,
		);
	});

	it("puts deactivation ahead of everything else", (): void => {
		expect(
			userStatusOf({
				...user,
				emailVerified: false,
				deactivatedAt: "2026-02-01T00:00:00.000Z",
			}),
		).toBe(USER_STATUS.DEACTIVATED);
	});
});
