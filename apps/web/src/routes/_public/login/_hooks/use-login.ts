import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { match, P } from "ts-pattern";
import { authClient } from "#/libs/auth/client.ts";
import { refreshSession } from "#/libs/auth/session.ts";

export type TUseLogin = {
	login: (email: string, password: string) => Promise<void>;
	error: string | null;
	isSubmitting: boolean;
};

export const useLogin = (): TUseLogin => {
	const navigate = useNavigate();
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const login = async (email: string, password: string): Promise<void> => {
		setError(null);
		setIsSubmitting(true);
		const { error: signInError } = await authClient.signIn.email({
			email,
			password,
		});
		setIsSubmitting(false);

		await match(signInError)
			.with(P.nullish, async () => {
				await refreshSession();
				void navigate({ to: "/notes" });
			})
			.otherwise(async (found) => {
				setError(found.message ?? "That email or password is incorrect.");
			});
	};

	return { login, error, isSubmitting };
};
