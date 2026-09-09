import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { TActivityRepo } from "@app/activity";
import { ROLE } from "@app/permissions";
import {
	ACTIVITY_ACTION,
	ACTIVITY_ENTITY_TYPE,
} from "#/application/shared/activity.ts";
import type { TDb } from "#/infrastructure/db/client.ts";
import { env } from "#/infrastructure/config/env.ts";

type TCreateAuthOptions = {
	db: TDb;
	activityRepo: TActivityRepo;
};

export const authCreate = ({ db, activityRepo }: TCreateAuthOptions) =>
	betterAuth({
		baseURL: env.BETTER_AUTH_URL,
		secret: env.BETTER_AUTH_SECRET,
		trustedOrigins: [env.WEB_ORIGIN],
		database: drizzleAdapter(db, { provider: "pg" }),
		emailAndPassword: { enabled: true },
		user: {
			additionalFields: {
				role: { type: "string", defaultValue: ROLE.VIEWER, input: false },
			},
		},
		databaseHooks: {
			session: {
				create: {
					after: async (session) => {
						await activityRepo.insert({
							actorId: session.userId,
							action: ACTIVITY_ACTION.SESSION_CREATE,
							entityType: ACTIVITY_ENTITY_TYPE.SESSION,
							entityId: session.id,
						});
					},
				},
			},
		},
	});

export type TAuth = ReturnType<typeof authCreate>;
