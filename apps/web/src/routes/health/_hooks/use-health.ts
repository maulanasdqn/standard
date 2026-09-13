import { APP_VERSION } from "@app/version";
import { useQuery } from "@tanstack/react-query";
import { match } from "ts-pattern";
import { orpc } from "#/libs/orpc/client.ts";

export type THealthStatus = "checking" | "ok" | "degraded";

export type THealthState = {
	status: THealthStatus;
	webVersion: string;
	apiVersion: string | null;
};

export const useHealth = (): THealthState => {
	const query = useQuery(
		orpc.health.check.queryOptions({ queryKey: orpc.health.check.key() }),
	);

	const status = match(query)
		.with({ isPending: true }, (): THealthStatus => "checking")
		.with({ data: { status: "ok" } }, (): THealthStatus => "ok")
		.otherwise((): THealthStatus => "degraded");

	return {
		status,
		webVersion: APP_VERSION,
		apiVersion: query.data?.version ?? null,
	};
};
