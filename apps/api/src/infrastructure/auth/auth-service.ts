import type { IAuthService } from "#/domain/ports/auth-service.ts";
import type { ISession } from "#/domain/session/session.ts";
import {
	resolvePermissions,
	resolveRole,
} from "#/infrastructure/auth/permissions.ts";
import type { TAuth } from "#/infrastructure/auth/better-auth.ts";

export const createAuthService = (auth: TAuth): IAuthService => ({
	getSession: async (headers: Headers): Promise<ISession | null> => {
		const result = await auth.api.getSession({ headers });
		if (!result?.session || !result.user) {
			return null;
		}

		const role = resolveRole(
			(result.user as { role?: string }).role ?? "viewer",
		);

		return {
			user: {
				id: result.user.id,
				email: result.user.email,
				name: result.user.name,
				role,
			},
			permissions: resolvePermissions(role),
		};
	},
});
