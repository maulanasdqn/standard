import { loginInputSchema, type TLoginInput } from "@app/schemas";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import type { FormEvent } from "react";
import { useState } from "react";
import { match, P } from "ts-pattern";
import { authClient } from "#/libs/auth/client.ts";
import { refreshSession } from "#/libs/auth/session.ts";

const DEFAULT_VALUES: TLoginInput = { email: "", password: "" };

export const useLoginForm = () => {
	const navigate = useNavigate();
	const [serverError, setServerError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: DEFAULT_VALUES,
		validators: { onChange: loginInputSchema },
		onSubmit: async ({ value }) => {
			setServerError(null);
			const { error: signInError } = await authClient.signIn.email(value);

			await match(signInError)
				.with(P.nullish, async () => {
					await refreshSession();
					void navigate({ to: "/notes" });
				})
				.otherwise(async (found) => {
					setServerError(
						found.message ?? "That email or password is incorrect.",
					);
				});
		},
	});

	const onSubmit = (event: FormEvent): void => {
		event.preventDefault();
		void form.handleSubmit();
	};

	return { form, serverError, onSubmit };
};
