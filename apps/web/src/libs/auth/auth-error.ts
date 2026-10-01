import { AUTH_MESSAGE } from "@app/messages";
import { match, P } from "ts-pattern";

export const AUTH_ERROR_CODE = {
	INVALID_EMAIL_OR_PASSWORD: "INVALID_EMAIL_OR_PASSWORD",
	INVALID_PASSWORD: "INVALID_PASSWORD",
	EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
	USER_ALREADY_EXISTS: "USER_ALREADY_EXISTS",
	USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
		"USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL",
	INVALID_TOKEN: "INVALID_TOKEN",
	PASSWORD_TOO_WEAK: "PASSWORD_TOO_WEAK",
	ACCOUNT_DEACTIVATED: "ACCOUNT_DEACTIVATED",
} as const;

export type TAuthError = {
	code?: string | undefined;
	message?: string | undefined;
};

const weakPasswordMessage = (error: TAuthError, fallback: string): string =>
	match(error.message)
		.with(P.string, (message): string => message)
		.otherwise((): string => fallback);

export const signInErrorMessage = (error: TAuthError): string =>
	match(error.code)
		.with(
			AUTH_ERROR_CODE.INVALID_EMAIL_OR_PASSWORD,
			(): string => AUTH_MESSAGE.INVALID_CREDENTIALS,
		)
		.with(
			AUTH_ERROR_CODE.EMAIL_NOT_VERIFIED,
			(): string => AUTH_MESSAGE.EMAIL_NOT_VERIFIED,
		)
		.with(
			AUTH_ERROR_CODE.ACCOUNT_DEACTIVATED,
			(): string => AUTH_MESSAGE.ACCOUNT_DEACTIVATED,
		)
		.otherwise((): string => AUTH_MESSAGE.SIGN_IN_FAILED);

export const signUpErrorMessage = (error: TAuthError): string =>
	match(error.code)
		.with(
			AUTH_ERROR_CODE.USER_ALREADY_EXISTS,
			AUTH_ERROR_CODE.USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL,
			(): string => AUTH_MESSAGE.EMAIL_TAKEN,
		)
		.with(AUTH_ERROR_CODE.PASSWORD_TOO_WEAK, (): string =>
			weakPasswordMessage(error, AUTH_MESSAGE.REGISTER_FAILED),
		)
		.otherwise((): string => AUTH_MESSAGE.REGISTER_FAILED);

export const resetPasswordErrorMessage = (error: TAuthError): string =>
	match(error.code)
		.with(
			AUTH_ERROR_CODE.INVALID_TOKEN,
			(): string => AUTH_MESSAGE.RESET_LINK_INVALID,
		)
		.with(AUTH_ERROR_CODE.PASSWORD_TOO_WEAK, (): string =>
			weakPasswordMessage(error, AUTH_MESSAGE.RESET_FAILED),
		)
		.otherwise((): string => AUTH_MESSAGE.RESET_FAILED);

export const passwordChangeErrorMessage = (error: TAuthError): string =>
	match(error.code)
		.with(
			AUTH_ERROR_CODE.INVALID_PASSWORD,
			(): string => AUTH_MESSAGE.CURRENT_PASSWORD_INCORRECT,
		)
		.with(AUTH_ERROR_CODE.PASSWORD_TOO_WEAK, (): string =>
			weakPasswordMessage(error, AUTH_MESSAGE.PASSWORD_CHANGE_FAILED),
		)
		.otherwise((): string => AUTH_MESSAGE.PASSWORD_CHANGE_FAILED);
