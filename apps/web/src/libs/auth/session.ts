import type { TMe } from "@app/schemas";
import { orpc } from "#/libs/orpc/client.ts";

export const fetchMe = async (): Promise<TMe | null> => {
	try {
		return await orpc.me.get.call();
	} catch {
		return null;
	}
};
