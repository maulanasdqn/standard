import { PROCEDURE_PATHS } from "@app/contract";
import { A } from "@mobily/ts-belt";
import { match } from "ts-pattern";
import { ROUTE_PREFIX } from "#/platform/http/route-paths.ts";

export const RPC_MOUNT_ROUTE = `${ROUTE_PREFIX.RPC}/*`;

const RPC_PROCEDURE_ROUTES: readonly string[] = A.map(
	PROCEDURE_PATHS,
	(path): string => `${ROUTE_PREFIX.RPC}${path}`,
);

export const rpcRouteLabel = (route: string, path: string): string =>
	match(route === RPC_MOUNT_ROUTE && A.includes(RPC_PROCEDURE_ROUTES, path))
		.with(true, (): string => path)
		.otherwise((): string => route);
