import { useNavigate } from "@tanstack/react-router";
import { authClient } from "#/libs/auth/client.ts";

export const useSignOut = () => {
	const navigate = useNavigate();

	return async () => {
		await authClient.signOut();
		window.location.href = "/login";
		void navigate({ to: "/login" });
	};
};
