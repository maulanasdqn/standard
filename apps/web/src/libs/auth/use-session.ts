import type { TMe } from "@app/schemas";
import { useStore } from "@tanstack/react-store";
import { sessionStore } from "#/libs/auth/session-store.ts";

export const useSession = (): TMe | null =>
	useStore(sessionStore, (state) => state);
