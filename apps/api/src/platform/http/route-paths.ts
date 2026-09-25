const OPENAPI_PREFIX = "/api";

export const ROUTE_PREFIX = {
	RPC: "/rpc",
	OPENAPI: OPENAPI_PREFIX,
	AUTH: `${OPENAPI_PREFIX}/auth`,
} as const;
