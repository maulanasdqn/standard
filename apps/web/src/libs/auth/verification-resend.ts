import { match } from "ts-pattern";
import { AUTH_ERROR_CODE, type TAuthError } from "#/libs/auth/auth-error.ts";
import { AUTH_PATH, authCallbackUrl } from "#/libs/auth/auth-paths.ts";
import { authClient } from "#/libs/auth/client.ts";

export const verificationResend = async (email: string): Promise<void> => {
	await authClient.sendVerificationEmail({
		email,
		callbackURL: authCallbackUrl(AUTH_PATH.VERIFY_EMAIL),
	});
};

export const verificationResendIfNeeded = (
	error: TAuthError,
	email: string,
): Promise<void> =>
	match(error.code)
		.with(
			AUTH_ERROR_CODE.EMAIL_NOT_VERIFIED,
			(): Promise<void> => verificationResend(email),
		)
		.otherwise((): Promise<void> => Promise.resolve());
