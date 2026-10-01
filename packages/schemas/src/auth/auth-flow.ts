import { VALIDATION_MESSAGE } from "@app/messages";
import { z } from "zod";
import { passwordSchema } from "./password.ts";

const NAME_MAX = 100;

const confirmedPassword = <
	TShape extends { password: string; confirmPassword: string },
>(
	value: TShape,
): boolean => value.password === value.confirmPassword;

const CONFIRM_MISMATCH = {
	path: ["confirmPassword"],
	message: VALIDATION_MESSAGE.PASSWORDS_MISMATCH,
};

export const signUpInputSchema = z
	.object({
		name: z
			.string()
			.trim()
			.min(1, VALIDATION_MESSAGE.NAME_REQUIRED)
			.max(NAME_MAX),
		email: z.email(VALIDATION_MESSAGE.EMAIL_INVALID),
		password: passwordSchema,
		confirmPassword: z.string(),
	})
	.refine(confirmedPassword, CONFIRM_MISMATCH);
export type TSignUpInput = z.infer<typeof signUpInputSchema>;

export const forgotPasswordInputSchema = z.object({
	email: z.email(VALIDATION_MESSAGE.EMAIL_INVALID),
});
export type TForgotPasswordInput = z.infer<typeof forgotPasswordInputSchema>;

export const resetPasswordInputSchema = z
	.object({
		password: passwordSchema,
		confirmPassword: z.string(),
	})
	.refine(confirmedPassword, CONFIRM_MISMATCH);
export type TResetPasswordInput = z.infer<typeof resetPasswordInputSchema>;

export const resetPasswordSearchSchema = z.object({
	token: z.string().optional(),
	invite: z.coerce.boolean().optional(),
	error: z.string().optional(),
});
export type TResetPasswordSearch = z.infer<typeof resetPasswordSearchSchema>;

export const verifyEmailSearchSchema = z.object({
	error: z.string().optional(),
});
export type TVerifyEmailSearch = z.infer<typeof verifyEmailSearchSchema>;

export const profileUpdateInputSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, VALIDATION_MESSAGE.NAME_REQUIRED)
		.max(NAME_MAX),
});
export type TProfileUpdateInput = z.infer<typeof profileUpdateInputSchema>;
