import { useNavigate } from "@tanstack/react-router";
import { authClient } from "#/libs/auth/client.ts";
import { clearSession } from "#/libs/auth/session-store.ts";

export const useSignOut = (): (() => Promise<void>) => {
	const navigate = useNavigate();

	return async (): Promise<void> => {
		await authClient.signOut();
		clearSession();
		void navigate({ to: "/login" });
	};
};
