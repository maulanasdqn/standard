import { permissionsStore } from "@app/components/guard/permissions-store";
import { PERMISSION } from "@app/permissions";
import type { TMe } from "@app/schemas";
import { afterEach, describe, expect, it } from "vitest";
import { SESSION_REACH } from "#/libs/auth/session-reach.ts";
import {
	sessionClear,
	sessionResolutionSet,
	sessionSet,
	sessionStore,
} from "#/libs/auth/session-store.ts";

const ME: TMe = {
	user: {
		id: "018f2c4e-1a2b-7c3d-9e4f-5a6b7c8d9e0f",
		email: "admin@test.app",
		name: "Admin",
		role: "admin",
	},
	permissions: [PERMISSION.NOTE_READ],
};

describe("session store", () => {
	afterEach(sessionClear);

	it("records a reached session and hands its permissions to the guard", (): void => {
		sessionSet(ME);

		expect(sessionStore.state).toEqual({
			reach: SESSION_REACH.REACHED,
			session: ME,
		});
		expect(permissionsStore.state.permissions).toEqual([PERMISSION.NOTE_READ]);
	});

	it("clears the session and the guard's permissions together", (): void => {
		sessionSet(ME);

		sessionClear();

		expect(sessionStore.state).toEqual({
			reach: SESSION_REACH.REACHED,
			session: null,
		});
		expect(permissionsStore.state.permissions).toEqual([]);
	});

	it("keeps an unreachable server distinct from being signed out", (): void => {
		sessionResolutionSet({ reach: SESSION_REACH.UNREACHABLE, session: null });

		expect(sessionStore.state.reach).toBe(SESSION_REACH.UNREACHABLE);
		expect(sessionStore.state.session).toBeNull();
	});
});
