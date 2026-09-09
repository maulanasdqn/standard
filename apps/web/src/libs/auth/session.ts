import type { TMe } from "@app/schemas";
import { orpc } from "#/libs/orpc/client.ts";
import { setSession } from "#/libs/auth/session-store.ts";

export const fetchMe = async (): Promise<TMe | null> => {
	try {
		return await orpc.me.get.call();
	} catch {
		return null;
	}
};

export const refreshSession = async (): Promise<TMe | null> => {
	const me = await fetchMe();
	setSession(me);
	return me;
};
