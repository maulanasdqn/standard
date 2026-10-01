import { type Auth, type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { TActivityRepo } from "@app/activity";
import type { TMailer } from "@app/mail";
import { ROLE } from "@app/permissions";
import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import type { TDb } from "#/platform/db/client.ts";
import { dbActiveProxy } from "#/platform/db/transaction.ts";
import { match, P } from "ts-pattern";
import { authEmailOptionsOf } from "#/auth/infrastructure/auth-email.ts";
import { authEventsOf } from "#/auth/infrastructure/auth-events.ts";
import { authHooksOf } from "#/auth/infrastructure/auth-hooks.ts";
import { authPluginsOf } from "#/auth/infrastructure/auth-plugins.ts";
import { userVerifiedMark } from "#/auth/infrastructure/user-verified-mark.ts";
import { sessionGuardOf } from "#/auth/infrastructure/session-guard.ts";
import { AUTH_MESSAGE } from "@app/messages";
import { env } from "#/platform/config/env.ts";
import { originsOf } from "#/platform/http/origins.ts";

type TCreateAuthOptions = {
	db: TDb;
	activityRepo: TActivityRepo;
	mailer: TMailer;
	permissionsFor: (role: string) => Promise<readonly string[]>;
};

type TCrossSubDomainCookies = { enabled: boolean; domain?: string };

const crossSubDomainCookiesOf = (
	domain: string | undefined,
): TCrossSubDomainCookies =>
	match(domain)
		.with(P.nullish, (): TCrossSubDomainCookies => ({ enabled: false }))
		.otherwise(
			(found): TCrossSubDomainCookies => ({ enabled: true, domain: found }),
		);

type TAuthOptions = Omit<BetterAuthOptions, "user"> & {
	user: {
		additionalFields: {
			role: { type: "string"; defaultValue: string; input: false };
		};
	};
};

export type TAuth = Auth<TAuthOptions>;

export const authCreate = (deps: TCreateAuthOptions): TAuth => {
	const events = authEventsOf({
		activityRepo: deps.activityRepo,
		mailer: deps.mailer,
		webOrigin: env.WEB_ORIGIN,
	});

	return betterAuth<TAuthOptions>({
		baseURL: env.BETTER_AUTH_URL,
		secret: env.BETTER_AUTH_SECRET,
		trustedOrigins: [...originsOf(env.WEB_ORIGIN, env.AUTH_TRUSTED_ORIGINS)],
		database: drizzleAdapter(dbActiveProxy(deps.db), { provider: "pg" }),
		plugins: authPluginsOf({
			jwtEnabled: env.AUTH_JWT_ENABLED,
			issuer: env.BETTER_AUTH_URL,
			audience: env.BETTER_AUTH_URL,
			permissionsFor: deps.permissionsFor,
		}),
		advanced: {
			database: { generateId: (): string => crypto.randomUUID() },
			crossSubDomainCookies: crossSubDomainCookiesOf(env.AUTH_COOKIE_DOMAIN),
		},
		...authEmailOptionsOf({
			mailer: deps.mailer,
			events,
			markVerified: (userId: string): Promise<void> =>
				userVerifiedMark(deps.db, userId),
		}),
		hooks: authHooksOf(events),
		user: {
			additionalFields: {
				role: { type: "string", defaultValue: ROLE.VIEWER, input: false },
			},
		},
		databaseHooks: {
			session: {
				create: {
					before: sessionGuardOf(deps.db, AUTH_MESSAGE.ACCOUNT_DEACTIVATED),
					after: async (session): Promise<void> => {
						await deps.activityRepo.insert({
							actorId: session.userId,
							action: ACTIVITY_ACTION.SESSION_CREATE,
							resourceType: ACTIVITY_RESOURCE_TYPE.SESSION,
							resourceId: session.id,
						});
					},
				},
			},
		},
	});
};
