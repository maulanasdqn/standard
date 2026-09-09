import { match, P } from "ts-pattern";
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

		return match(result)
			.with(P.nullish, () => null)
			.with({ session: P.nullish }, () => null)
			.with({ user: P.nullish }, () => null)
			.otherwise(({ user }) => {
				const role = resolveRole((user as { role?: string }).role ?? "viewer");
				return {
					user: { id: user.id, email: user.email, name: user.name, role },
					permissions: resolvePermissions(role),
				};
			});
	},
});
