import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { TActivityRepo } from "@app/core";
import type { TDb } from "#/infrastructure/db/client.ts";
import { env } from "#/infrastructure/config/env.ts";

type TCreateAuthOptions = {
	db: TDb;
	activityRepo: TActivityRepo;
};

export const createAuth = ({ db, activityRepo }: TCreateAuthOptions) =>
	betterAuth({
		baseURL: env.BETTER_AUTH_URL,
		secret: env.BETTER_AUTH_SECRET,
		trustedOrigins: [env.WEB_ORIGIN],
		database: drizzleAdapter(db, { provider: "pg" }),
		emailAndPassword: { enabled: true },
		user: {
			additionalFields: {
				role: { type: "string", defaultValue: "viewer", input: false },
			},
		},
		databaseHooks: {
			session: {
				create: {
					after: async (session) => {
						await activityRepo.insert({
							actorId: session.userId,
							action: "session.create",
							entityType: "session",
							entityId: session.id,
						});
					},
				},
			},
		},
	});

export type TAuth = ReturnType<typeof createAuth>;
