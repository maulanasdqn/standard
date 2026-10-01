import { AUTH_MESSAGE } from "@app/messages";
import { resetPasswordInputSchema } from "@app/schemas";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { match, P } from "ts-pattern";
import type { z } from "zod";
import {
	AUTH_ERROR_CODE,
	resetPasswordErrorMessage,
} from "#/libs/auth/auth-error.ts";
import { authClient } from "#/libs/auth/client.ts";
import type { TFormHook, TSchemaForm } from "#/libs/forms/form-hook.ts";

type TResetValues = z.input<typeof resetPasswordInputSchema>;

const DEFAULT_VALUES: TResetValues = { password: "", confirmPassword: "" };

export type TResetPasswordForm = TFormHook<
	TSchemaForm<TResetValues, typeof resetPasswordInputSchema>
> & {
	serverError: string | null;
	linkInvalid: boolean;
};

export const useResetPasswordForm = (
	token: string,
	invite: boolean,
): TResetPasswordForm => {
	const navigate = useNavigate();
	const [serverError, setServerError] = useState<string | null>(null);
	const [linkInvalid, setLinkInvalid] = useState(false);

	const form = useForm({
		defaultValues: DEFAULT_VALUES,
		validators: {
			onBlur: resetPasswordInputSchema,
			onSubmit: resetPasswordInputSchema,
		},
		onSubmit: async ({ value }) => {
			setServerError(null);
			const { error } = await authClient.resetPassword({
				newPassword: value.password,
				token,
			});
			await match(error)
				.with(P.nullish, async (): Promise<void> => {
					toast.success(
						invite ? AUTH_MESSAGE.INVITE_SET_DONE : AUTH_MESSAGE.RESET_DONE,
					);
					await navigate({ to: "/login" });
				})
				.with(
					{ code: AUTH_ERROR_CODE.INVALID_TOKEN },
					async (): Promise<void> => setLinkInvalid(true),
				)
				.otherwise(
					async (found): Promise<void> =>
						setServerError(resetPasswordErrorMessage(found)),
				);
		},
	});

	const onSubmit = (event: FormEvent): void => {
		event.preventDefault();
		void form.handleSubmit();
	};

	return { form, serverError, linkInvalid, onSubmit };
};
