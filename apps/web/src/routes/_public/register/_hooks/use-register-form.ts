import { signUpInputSchema } from "@app/schemas";
import { useForm } from "@tanstack/react-form";
import { type FormEvent, useState } from "react";
import { match, P } from "ts-pattern";
import type { z } from "zod";
import { signUpErrorMessage } from "#/libs/auth/auth-error.ts";
import { AUTH_PATH, authCallbackUrl } from "#/libs/auth/auth-paths.ts";
import { authClient } from "#/libs/auth/client.ts";
import type { TFormHook, TSchemaForm } from "#/libs/forms/form-hook.ts";

type TRegisterValues = z.input<typeof signUpInputSchema>;

const DEFAULT_VALUES: TRegisterValues = {
	name: "",
	email: "",
	password: "",
	confirmPassword: "",
};

export type TRegisterForm = TFormHook<
	TSchemaForm<TRegisterValues, typeof signUpInputSchema>
> & {
	serverError: string | null;
	sentTo: string | null;
};

export const useRegisterForm = (): TRegisterForm => {
	const [serverError, setServerError] = useState<string | null>(null);
	const [sentTo, setSentTo] = useState<string | null>(null);

	const form = useForm({
		defaultValues: DEFAULT_VALUES,
		validators: { onBlur: signUpInputSchema, onSubmit: signUpInputSchema },
		onSubmit: async ({ value }) => {
			setServerError(null);
			const { error } = await authClient.signUp.email({
				name: value.name.trim(),
				email: value.email,
				password: value.password,
				callbackURL: authCallbackUrl(AUTH_PATH.VERIFY_EMAIL),
			});
			match(error)
				.with(P.nullish, (): void => setSentTo(value.email))
				.otherwise((found): void => setServerError(signUpErrorMessage(found)));
		},
	});

	const onSubmit = (event: FormEvent): void => {
		event.preventDefault();
		void form.handleSubmit();
	};

	return { form, serverError, sentTo, onSubmit };
};
