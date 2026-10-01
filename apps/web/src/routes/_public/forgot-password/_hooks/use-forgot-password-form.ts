import { AUTH_MESSAGE } from "@app/messages";
import { forgotPasswordInputSchema } from "@app/schemas";
import { useForm } from "@tanstack/react-form";
import { type FormEvent, useState } from "react";
import { match, P } from "ts-pattern";
import type { z } from "zod";
import { AUTH_PATH, authCallbackUrl } from "#/libs/auth/auth-paths.ts";
import { authClient } from "#/libs/auth/client.ts";
import type { TFormHook, TSchemaForm } from "#/libs/forms/form-hook.ts";

type TForgotValues = z.input<typeof forgotPasswordInputSchema>;

const DEFAULT_VALUES: TForgotValues = { email: "" };

export type TForgotPasswordForm = TFormHook<
	TSchemaForm<TForgotValues, typeof forgotPasswordInputSchema>
> & {
	serverError: string | null;
	sent: boolean;
};

export const useForgotPasswordForm = (): TForgotPasswordForm => {
	const [serverError, setServerError] = useState<string | null>(null);
	const [sent, setSent] = useState(false);

	const form = useForm({
		defaultValues: DEFAULT_VALUES,
		validators: {
			onBlur: forgotPasswordInputSchema,
			onSubmit: forgotPasswordInputSchema,
		},
		onSubmit: async ({ value }) => {
			setServerError(null);
			const { error } = await authClient.requestPasswordReset({
				email: value.email,
				redirectTo: authCallbackUrl(AUTH_PATH.RESET_PASSWORD),
			});
			match(error)
				.with(P.nullish, (): void => setSent(true))
				.otherwise((): void => setServerError(AUTH_MESSAGE.FORGOT_FAILED));
		},
	});

	const onSubmit = (event: FormEvent): void => {
		event.preventDefault();
		void form.handleSubmit();
	};

	return { form, serverError, sent, onSubmit };
};
