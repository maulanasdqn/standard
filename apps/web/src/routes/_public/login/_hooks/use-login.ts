import { AUTH_MESSAGE } from "@app/messages";
import { loginInputSchema, type TLoginInput } from "@app/schemas";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import type { FormEvent } from "react";
import { match, P } from "ts-pattern";
import { authClient } from "#/libs/auth/client.ts";
import { SESSION_REACH } from "#/libs/auth/session-reach.ts";
import { sessionRefresh } from "#/libs/auth/session.ts";
import { loginError } from "#/routes/_public/login/_stores/login-error-store.ts";

const DEFAULT_VALUES: TLoginInput = { email: "", password: "" };

export const useLoginForm = () => {
	const navigate = useNavigate();
	const serverError = useStore(loginError.store, (state) => state);

	const form = useForm({
		defaultValues: DEFAULT_VALUES,
		validators: {
			onBlur: loginInputSchema,
			onSubmit: loginInputSchema,
		},
		onSubmit: async ({ value }) => {
			loginError.clear();
			const { error: signInError } = await authClient.signIn.email(value);

			await match(signInError)
				.with(P.nullish, async () => {
					const resolution = await sessionRefresh();

					await match(resolution)
						.with({ reach: SESSION_REACH.UNREACHABLE }, async () => {
							loginError.set(AUTH_MESSAGE.SESSION_UNREACHABLE);
						})
						.with({ session: P.nullish }, async () => {
							loginError.set(AUTH_MESSAGE.SESSION_UNVERIFIED);
						})
						.otherwise(async () => {
							await navigate({ to: "/notes" });
						});
				})
				.otherwise(async (found) => {
					loginError.set(found.message ?? AUTH_MESSAGE.INVALID_CREDENTIALS);
				});
		},
	});

	const onSubmit = (event: FormEvent): void => {
		event.preventDefault();
		void form.handleSubmit();
	};

	return { form, serverError, onSubmit };
};
