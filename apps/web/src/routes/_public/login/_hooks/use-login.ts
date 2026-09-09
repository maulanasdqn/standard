import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "#/libs/auth/client.ts";

export const useLogin = () => {
	const navigate = useNavigate();
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const login = async (email: string, password: string) => {
		setError(null);
		setIsSubmitting(true);
		const { error: signInError } = await authClient.signIn.email({
			email,
			password,
		});
		setIsSubmitting(false);

		if (signInError) {
			setError(signInError.message ?? "That email or password is incorrect.");
			return;
		}

		window.location.href = "/notes";
		void navigate({ to: "/notes" });
	};

	return { login, error, isSubmitting };
};
