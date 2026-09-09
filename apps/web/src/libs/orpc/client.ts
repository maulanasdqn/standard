import type { TAppRouterClient } from "@app/api";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

const link = new RPCLink({
	url: `${API_BASE}/rpc`,
	fetch: (input, init) => fetch(input, { ...init, credentials: "include" }),
});

export const client: TAppRouterClient = createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);
