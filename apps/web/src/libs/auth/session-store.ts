import type { TMe } from "@app/schemas";
import { Store } from "@tanstack/store";
import { syncPermissions } from "#/libs/auth/permissions.ts";

export const sessionStore = new Store<TMe | null>(null);

export const setSession = (me: TMe | null): void => {
	sessionStore.setState(() => me);
	syncPermissions(me);
};

export const clearSession = (): void => setSession(null);
