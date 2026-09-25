import { ROLE } from "@app/permissions";
import type { BetterAuthPlugin } from "better-auth";
import { bearer, jwt } from "better-auth/plugins";
import { match, P } from "ts-pattern";

type TAuthPluginsOptions = {
	jwtEnabled: boolean;
	permissionsFor: (role: string) => Promise<readonly string[]>;
};

type TJwtPayload = {
	id: string;
	email: string;
	name: string;
	role: string;
	permissions: readonly string[];
};

type TJwtUser = {
	id: string;
	email: string;
	name: string;
	role?: unknown;
};

const roleOf = (user: TJwtUser): string =>
	match(user.role)
		.with(P.string, (role): string => role)
		.otherwise((): string => ROLE.VIEWER);

const payloadOf =
	(permissionsFor: TAuthPluginsOptions["permissionsFor"]) =>
	async ({ user }: { user: TJwtUser }): Promise<TJwtPayload> => {
		const role = roleOf(user);
		return {
			id: user.id,
			email: user.email,
			name: user.name,
			role,
			permissions: await permissionsFor(role),
		};
	};

export const authPluginsOf = (
	options: TAuthPluginsOptions,
): BetterAuthPlugin[] =>
	match(options.jwtEnabled)
		.with(false, (): BetterAuthPlugin[] => [])
		.otherwise((): BetterAuthPlugin[] => [
			jwt({ jwt: { definePayload: payloadOf(options.permissionsFor) } }),
			bearer(),
		]);
