import { useNavigate } from "@tanstack/react-router";
import { authClient } from "#/libs/auth/client.ts";

export const useSignOut = (): (() => Promise<void>) => {
	const navigate = useNavigate();

	return async (): Promise<void> => {
		await authClient.signOut();
		window.location.href = "/login";
		void navigate({ to: "/login" });
	};
};
