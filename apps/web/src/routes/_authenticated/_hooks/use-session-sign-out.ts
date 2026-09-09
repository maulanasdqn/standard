import { useNavigate } from "@tanstack/react-router";
import { authClient } from "#/libs/auth/client.ts";
import { sessionClear } from "#/libs/auth/session-store.ts";

export const useSessionSignOut = (): (() => Promise<void>) => {
	const navigate = useNavigate();

	return async (): Promise<void> => {
		await authClient.signOut();
		sessionClear();
		void navigate({ to: "/login" });
	};
};
