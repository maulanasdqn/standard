import type { TMe } from "@app/schemas";
import { Store } from "@tanstack/store";
import { permissionsSync } from "#/libs/auth/permissions.ts";

export const sessionStore = new Store<TMe | null>(null);

export const sessionSet = (me: TMe | null): void => {
	sessionStore.setState(() => me);
	permissionsSync(me);
};

export const sessionClear = (): void => sessionSet(null);
