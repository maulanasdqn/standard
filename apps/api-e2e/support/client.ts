import type { TAppRouterClient } from "@app/contract";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";

const BASE_URL = "http://127.0.0.1:3107";

export const link = new RPCLink({ url: `${BASE_URL}/rpc` });

export const client: TAppRouterClient = createORPCClient(link);

export { BASE_URL };
