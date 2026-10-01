import { passwordSchema } from "@app/schemas";
import { A, D } from "@mobily/ts-belt";
import { APIError } from "better-auth/api";
import { match, P } from "ts-pattern";
import { z } from "zod";

export const PASSWORD_CHECKED_PATH = {
	SIGN_UP: "/sign-up/email",
	RESET: "/reset-password",
	CHANGE: "/change-password",
} as const;

export const PASSWORD_WEAK_CODE = "PASSWORD_TOO_WEAK";

const PASSWORD_FIELD: Record<string, string> = {
	[PASSWORD_CHECKED_PATH.SIGN_UP]: "password",
	[PASSWORD_CHECKED_PATH.RESET]: "newPassword",
	[PASSWORD_CHECKED_PATH.CHANGE]: "newPassword",
};

const bodySchema = z.record(z.string(), z.unknown());

const passwordOf = (path: string, body: unknown): unknown => {
	const field = D.get(PASSWORD_FIELD, path);
	const parsed = bodySchema.safeParse(body);
	return field === undefined || field === null || !parsed.success
		? undefined
		: D.get(parsed.data, field);
};

const weaknessOf = (password: unknown): string | undefined =>
	match(password)
		.with(
			P.string,
			(value): string | undefined =>
				A.head(passwordSchema.safeParse(value).error?.issues ?? [])?.message,
		)
		.otherwise((): undefined => undefined);

export const passwordStrengthAssert = (path: string, body: unknown): void =>
	match(weaknessOf(passwordOf(path, body)))
		.with(P.nullish, (): undefined => undefined)
		.otherwise((message): never => {
			throw new APIError("BAD_REQUEST", {
				code: PASSWORD_WEAK_CODE,
				message,
			});
		});
