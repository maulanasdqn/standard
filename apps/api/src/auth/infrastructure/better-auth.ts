import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { TActivityRepo } from "@app/activity";
import { passwordResetMailBuild, type TMailer } from "@app/mail";
import { MAIL_MESSAGE } from "@app/messages";
import { ROLE } from "@app/permissions";
import { ACTIVITY_ACTION, ACTIVITY_RESOURCE_TYPE } from "@app/activity";
import type { TDb } from "#/platform/db/client.ts";
import { env } from "#/platform/config/env.ts";
import { logger } from "#/platform/observability/logger.ts";

type TCreateAuthOptions = {
	db: TDb;
	activityRepo: TActivityRepo;
	mailer: TMailer;
};

export const authCreate = ({ db, activityRepo, mailer }: TCreateAuthOptions) =>
	betterAuth({
		baseURL: env.BETTER_AUTH_URL,
		secret: env.BETTER_AUTH_SECRET,
		trustedOrigins: [env.WEB_ORIGIN],
		database: drizzleAdapter(db, { provider: "pg" }),
		advanced: { database: { generateId: (): string => crypto.randomUUID() } },
		emailAndPassword: {
			enabled: true,
			sendResetPassword: async ({ user, url }): Promise<void> => {
				await mailer
					.send(
						passwordResetMailBuild({ to: user.email, name: user.name, url }),
					)
					.catch((cause): void => {
						logger.error({ cause }, MAIL_MESSAGE.PASSWORD_RESET_FAILED);
					});
			},
		},
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
							resourceType: ACTIVITY_RESOURCE_TYPE.SESSION,
							resourceId: session.id,
						});
					},
				},
			},
		},
	});

export type TAuth = ReturnType<typeof authCreate>;
