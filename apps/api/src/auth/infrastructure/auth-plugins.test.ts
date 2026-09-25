import { PERMISSION, ROLE } from "@app/permissions";
import { A } from "@mobily/ts-belt";
import type { jwt } from "better-auth/plugins";
import { describe, expect, it, vi } from "vitest";
import { authPluginsOf } from "#/auth/infrastructure/auth-plugins.ts";

const USER = { id: "u1", email: "a@b.test", name: "A", role: ROLE.ADMIN };
const SESSION = { id: "s1" };

const permissionsFor = vi.fn(
	async (): Promise<readonly string[]> => [PERMISSION.USER_MANAGE],
);

const jwtPluginOf = (
	plugins: ReturnType<typeof authPluginsOf>,
): ReturnType<typeof jwt> | undefined =>
	A.find(plugins, (plugin) => plugin.id === "jwt") as
		| ReturnType<typeof jwt>
		| undefined;

describe("authPluginsOf", () => {
	it("adds nothing while JWT issuing is off", (): void => {
		expect(authPluginsOf({ jwtEnabled: false, permissionsFor })).toEqual([]);
	});

	it("adds the jwt and bearer plugins when JWT issuing is on", (): void => {
		const ids = A.map(
			authPluginsOf({ jwtEnabled: true, permissionsFor }),
			(plugin) => plugin.id,
		);

		expect(ids).toEqual(["jwt", "bearer"]);
	});

	it("puts the role and its resolved permissions in the token payload", async (): Promise<void> => {
		const plugin = jwtPluginOf(
			authPluginsOf({ jwtEnabled: true, permissionsFor }),
		);

		const payload = await plugin?.options.jwt?.definePayload?.({
			user: USER as never,
			session: SESSION as never,
		});

		expect(permissionsFor).toHaveBeenCalledWith(ROLE.ADMIN);
		expect(payload).toEqual({
			id: USER.id,
			email: USER.email,
			name: USER.name,
			role: ROLE.ADMIN,
			permissions: [PERMISSION.USER_MANAGE],
		});
	});

	it("falls back to the viewer role when the user carries none", async (): Promise<void> => {
		const plugin = jwtPluginOf(
			authPluginsOf({ jwtEnabled: true, permissionsFor }),
		);

		const payload = await plugin?.options.jwt?.definePayload?.({
			user: { ...USER, role: undefined } as never,
			session: SESSION as never,
		});

		expect(payload?.role).toBe(ROLE.VIEWER);
	});
});
