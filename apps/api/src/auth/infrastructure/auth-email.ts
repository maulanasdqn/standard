import {
	emailVerificationMailBuild,
	MAIL_TEMPLATE,
	mailSendSafe,
	passwordResetMailBuild,
	type TMailer,
} from "@app/mail";
import { APP_MESSAGE } from "@app/messages";
import type { BetterAuthOptions } from "better-auth";
import type { TAuthEvents } from "#/auth/infrastructure/auth-events.ts";
import { logger } from "#/platform/observability/logger.ts";

const SECONDS_PER_HOUR = 3_600;
const VERIFICATION_EXPIRY_SECONDS = 24 * SECONDS_PER_HOUR;

type TAuthEmailDeps = {
	mailer: TMailer;
	events: TAuthEvents;
	markVerified: (userId: string) => Promise<void>;
};

type TAuthEmailOptions = Pick<
	BetterAuthOptions,
	"emailAndPassword" | "emailVerification"
>;

export const authEmailOptionsOf = (
	deps: TAuthEmailDeps,
): TAuthEmailOptions => ({
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		revokeSessionsOnPasswordReset: true,
		sendResetPassword: async ({ user, url }): Promise<void> => {
			await mailSendSafe(
				deps.mailer,
				logger,
				MAIL_TEMPLATE.PASSWORD_RESET,
				passwordResetMailBuild({
					to: user.email,
					name: user.name,
					url,
					brand: APP_MESSAGE.NAME,
				}),
			);
		},
		onPasswordReset: async ({ user }): Promise<void> => {
			await deps.markVerified(user.id);
			await deps.events.passwordRecovered(user);
		},
	},
	emailVerification: {
		sendOnSignUp: true,
		sendOnSignIn: false,
		autoSignInAfterVerification: true,
		expiresIn: VERIFICATION_EXPIRY_SECONDS,
		afterEmailVerification: async (user): Promise<void> => {
			await deps.events.emailVerified(user);
		},
		sendVerificationEmail: async ({ user, url }): Promise<void> => {
			await mailSendSafe(
				deps.mailer,
				logger,
				MAIL_TEMPLATE.EMAIL_VERIFICATION,
				emailVerificationMailBuild({
					to: user.email,
					name: user.name,
					url,
					brand: APP_MESSAGE.NAME,
				}),
			);
		},
	},
});
