import type { TMe } from "@app/schemas";
import { orpc } from "#/libs/orpc/client.ts";
import { sessionSet } from "#/libs/auth/session-store.ts";

export const sessionFetch = async (): Promise<TMe | null> => {
	try {
		return await orpc.me.get.call();
	} catch {
		return null;
	}
};

export const sessionRefresh = async (): Promise<TMe | null> => {
	const me = await sessionFetch();
	sessionSet(me);
	return me;
};
